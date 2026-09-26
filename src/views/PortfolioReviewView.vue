<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink, onBeforeRouteLeave } from 'vue-router'
import type {
  PortfolioAssetCategory,
  PortfolioCashFlow,
  PortfolioCurrency,
  PortfolioReview,
  PortfolioSnapshot,
} from '@/types/portfolio-review'
import ResearchPageHeader from '@/components/research/ResearchPageHeader.vue'
import { useI18n } from '@/composables/use-i18n'
import { useLocalRecord } from '@/composables/use-local-record'
import { parsePersonalFinance } from '@/utils/personal-finance'
import {
  calculatePortfolioReview,
  emptyPortfolioReview,
  parsePortfolioReview,
  portfolioCategories as categories,
} from '@/utils/portfolio-review'

const { locale } = useI18n()
const t = (zh: string, en: string) => (locale.value === 'en' ? en : zh)
const { record, error, save, reload } = useLocalRecord(
  'market-desk-portfolio-review-v1',
  emptyPortfolioReview,
  parsePortfolioReview,
)
const today = () => {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
const categoryName = (category: PortfolioAssetCategory) =>
  ({
    cash: t('现金', 'Cash'),
    stocks: t('股票', 'Stocks'),
    funds: t('基金', 'Funds'),
    bonds: t('债券', 'Bonds'),
    crypto: t('加密资产', 'Crypto'),
    other: t('其他', 'Other'),
  })[category]
const newHolding = () => ({
  id: crypto.randomUUID(),
  name: '',
  category: 'other' as PortfolioAssetCategory,
  amount: 0,
})
const newSnapshot = (): PortfolioSnapshot => ({
  id: '',
  date: today(),
  holdings: [newHolding()],
  notes: '',
})
const newFlow = (): PortfolioCashFlow => ({
  id: '',
  date: today(),
  kind: 'deposit',
  amount: 0,
  notes: '',
})
const snapshot = ref(newSnapshot())
const flow = ref(newFlow())
const snapshotStart = ref(JSON.stringify(snapshot.value))
const flowStart = ref(JSON.stringify(flow.value))
const currency = ref<PortfolioCurrency>(record.value.currency)
const hasRecords = computed(() =>
  Boolean(record.value.snapshots.length || record.value.flows.length),
)
const currencyConflict = computed(
  () => hasRecords.value && currency.value !== record.value.currency,
)
const snapshotDirty = computed(() => JSON.stringify(snapshot.value) !== snapshotStart.value)
const flowDirty = computed(() => JSON.stringify(flow.value) !== flowStart.value)
const dirty = computed(
  () => snapshotDirty.value || flowDirty.value || currency.value !== record.value.currency,
)
const editorTab = ref<'snapshot' | 'flow'>('snapshot')
const editor = ref<HTMLElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const importing = ref(false)
const message = ref('')
const formError = ref('')
const summary = computed(() => calculatePortfolioReview(record.value))
const snapshots = computed(() =>
  [...record.value.snapshots].sort((a, b) => b.date.localeCompare(a.date)),
)
const flows = computed(() => [...record.value.flows].sort((a, b) => b.date.localeCompare(a.date)))
const number = (value: number | null, digits = 2) =>
  value === null
    ? '—'
    : new Intl.NumberFormat(locale.value === 'en' ? 'en-US' : 'zh-CN', {
        maximumFractionDigits: digits,
      }).format(value)
const percent = (value: number | null) => (value === null ? '—' : `${number(value)}%`)
const allocationChange = (current: number | null, previous: number | null) =>
  current === null || previous === null
    ? '—'
    : `${current - previous > 0 ? '+' : ''}${number(current - previous)} ${t('个百分点', 'pp')}`
const total = (item: PortfolioSnapshot) =>
  item.holdings.reduce((sum, holding) => sum + holding.amount, 0)
const issueName = (issue: string | null) =>
  issue === 'nonpositive-capital'
    ? t('加权资本不大于零', 'Non-positive weighted capital')
    : issue === 'return-below-minus100'
      ? t(
          '收益率低于 −100%，请检查快照与流水',
          'Return below −100%; check valuations and cash flows',
        )
      : ''
const storageMessage = computed(
  () =>
    ({
      load: t(
        '无法读取已有数据，原始内容未被覆盖。请恢复存储访问或修复备份后重新载入。',
        'Saved data could not be read and was not overwritten. Restore storage access or repair the backup and reload.',
      ),
      save: t(
        '存储不可用或空间不足，草稿仍保留。恢复后可重试。',
        'Storage is unavailable or full. Your draft remains here; restore access and retry.',
      ),
      conflict: t(
        '其他标签页更新了组合。请重新载入已保存数据，当前草稿会保留。',
        'Another tab updated this portfolio. Reload saved data; your draft will be kept.',
      ),
    })[error.value ?? 'save'],
)
const chart = computed(() => {
  const points = summary.value.series
  const valid = points.filter((point) => point.index !== null)
  if (!valid.length) return null
  const start = Date.parse(points[0]!.date)
  const span = Date.parse(points[points.length - 1]!.date) - start || 1
  const values = valid.map((point) => point.index!)
  const min = Math.min(...values),
    max = Math.max(...values)
  const pad = Math.max((max - min) * 0.1, 1)
  const low = min - pad,
    high = max + pad
  const mapped = points.map((point) => ({
    ...point,
    x: 62 + ((Date.parse(point.date) - start) / span) * 658,
    y: point.index === null ? null : 190 - ((point.index - low) / (high - low)) * 154,
  }))
  let connected = false
  const path = mapped
    .map((point) => {
      if (point.y === null) {
        connected = false
        return ''
      }
      const command = connected ? 'L' : 'M'
      connected = true
      return `${command}${point.x},${point.y}`
    })
    .join(' ')
  return { points: mapped, path, ticks: [high, (low + high) / 2, low] }
})
const discard = (changed: boolean) =>
  !changed || window.confirm(t('放弃这份尚未保存的草稿？', 'Discard this unsaved draft?'))
const resetSnapshot = (value = newSnapshot()) => {
  snapshot.value = { ...value, holdings: value.holdings.map((item) => ({ ...item })) }
  snapshotStart.value = JSON.stringify(snapshot.value)
}
const resetFlow = (value = newFlow()) => {
  flow.value = { ...value }
  flowStart.value = JSON.stringify(flow.value)
}
const resetAll = () => {
  resetSnapshot()
  resetFlow()
  currency.value = record.value.currency
}
const discardForCurrency = () => {
  if (discard(dirty.value)) resetAll()
}
const focusEditor = async () => {
  await nextTick()
  editor.value?.scrollIntoView({ block: 'start' })
  editor.value?.focus({ preventScroll: true })
}
const editSnapshot = (value: PortfolioSnapshot) => {
  if (!discard(snapshotDirty.value)) return
  resetSnapshot(value)
  editorTab.value = 'snapshot'
  formError.value = ''
  void focusEditor()
}
const editFlow = (value: PortfolioCashFlow) => {
  if (!discard(flowDirty.value)) return
  resetFlow(value)
  editorTab.value = 'flow'
  formError.value = ''
  void focusEditor()
}
const currentEditAllowed = (
  id: string,
  current: PortfolioSnapshot | PortfolioCashFlow | undefined,
  original: string,
) => {
  if (!id) return true
  if (!current) {
    formError.value = t(
      '该记录已被删除。请复制草稿后新建，不会自动恢复旧记录。',
      'This record was deleted. Copy your draft and create a new record.',
    )
    return false
  }
  return (
    JSON.stringify(current) === original ||
    window.confirm(
      t(
        '该记录已在其他标签页更改。用当前草稿覆盖最新记录？取消后可复制草稿，重新编辑最新版本。',
        'This record changed in another tab. Overwrite the latest version with this draft? Cancel to copy the draft and reopen the latest version.',
      ),
    )
  )
}
const commit = (next: PortfolioReview) => {
  formError.value = ''
  message.value = ''
  if (currencyConflict.value) {
    formError.value = t(
      '当前草稿与已保存组合币种不同。请核对并清空草稿后使用最新币种。',
      'Your draft and saved portfolio use different currencies. Review your draft, then clear it and use the saved currency.',
    )
    return false
  }
  try {
    const parsed = parsePortfolioReview(JSON.stringify(next))
    if (!save(parsed)) return false
    message.value = t('已保存到当前浏览器。', 'Saved in this browser.')
    return true
  } catch {
    formError.value = t(
      '格式不正确：请检查真实日期、同日快照唯一、名称与金额。金额最多两位小数，持仓可为零，外部流水必须大于零。',
      'Check valid dates, unique snapshot dates, names and amounts. Amounts allow two decimals; holdings may be zero and external cash flows must be positive.',
    )
    return false
  }
}
const saveSnapshot = () => {
  if (
    !currentEditAllowed(
      snapshot.value.id,
      record.value.snapshots.find((item) => item.id === snapshot.value.id),
      snapshotStart.value,
    )
  )
    return
  const next = {
    ...snapshot.value,
    id: snapshot.value.id || crypto.randomUUID(),
    holdings: snapshot.value.holdings.map((holding) => ({ ...holding, name: holding.name.trim() })),
  }
  if (
    commit({
      ...record.value,
      currency: currency.value,
      snapshots: snapshot.value.id
        ? record.value.snapshots.map((item) => (item.id === next.id ? next : item))
        : [...record.value.snapshots, next],
    })
  )
    resetSnapshot()
}
const saveFlow = () => {
  if (
    !currentEditAllowed(
      flow.value.id,
      record.value.flows.find((item) => item.id === flow.value.id),
      flowStart.value,
    )
  )
    return
  const next = { ...flow.value, id: flow.value.id || crypto.randomUUID() }
  if (
    commit({
      ...record.value,
      currency: currency.value,
      flows: flow.value.id
        ? record.value.flows.map((item) => (item.id === next.id ? next : item))
        : [...record.value.flows, next],
    })
  )
    resetFlow()
}
const removeSnapshot = (item: PortfolioSnapshot) => {
  if (
    !window.confirm(
      t(
        `删除 ${item.date} 的估值快照？这会改变收益区间，外部流水仍保留。`,
        `Delete the ${item.date} valuation snapshot? Return periods will change; external cash flows will be kept.`,
      ),
    )
  )
    return
  if (snapshot.value.id === item.id && !discard(snapshotDirty.value)) return
  if (
    commit({
      ...record.value,
      snapshots: record.value.snapshots.filter((value) => value.id !== item.id),
    }) &&
    snapshot.value.id === item.id
  )
    resetSnapshot()
}
const removeFlow = (item: PortfolioCashFlow) => {
  if (
    !window.confirm(
      t(
        `删除 ${item.date} 的外部流水 ${number(item.amount)} ${record.value.currency}？`,
        `Delete the ${item.date} external cash flow of ${number(item.amount)} ${record.value.currency}?`,
      ),
    )
  )
    return
  if (flow.value.id === item.id && !discard(flowDirty.value)) return
  if (
    commit({
      ...record.value,
      flows: record.value.flows.filter((value) => value.id !== item.id),
    }) &&
    flow.value.id === item.id
  )
    resetFlow()
}
const removeHolding = (id: string) => {
  if (window.confirm(t('从当前草稿移除此持仓？', 'Remove this holding from the current draft?')))
    snapshot.value.holdings = snapshot.value.holdings.filter((holding) => holding.id !== id)
}
const readPersonalAssets = () => {
  formError.value = ''
  if (snapshot.value.id) {
    formError.value = t(
      '请先新建快照，再从个人资产读取。',
      'Create a new snapshot before reading personal assets.',
    )
    return
  }
  try {
    const raw = window.localStorage.getItem('market-desk-personal-finance-v1')
    if (raw === null) {
      formError.value = t(
        '尚无已保存的个人资产。请先到个人资产与 FIRE 录入。',
        'No saved personal assets. Add them in Personal finance & FIRE first.',
      )
      return
    }
    const finance = parsePersonalFinance(raw)
    if (
      (hasRecords.value && record.value.currency !== finance.currency) ||
      (flowDirty.value && currency.value !== finance.currency)
    ) {
      formError.value = t(
        '个人资产与当前组合或流水草稿币种不同，已拒绝混币。',
        'Personal assets use a different currency from this portfolio or cash-flow draft. Mixed currencies were rejected.',
      )
      return
    }
    const assets = finance.assets.filter((asset) => asset.kind === 'investable')
    if (!assets.length) {
      formError.value = t(
        '个人资产中没有标记为可投资的资产。',
        'No personal assets are marked investable.',
      )
      return
    }
    if (
      !window.confirm(
        t(
          `读取 ${assets.length} 项可投资资产（${finance.currency}）并替换当前新快照的持仓草稿？日期沿用草稿，全部归为“其他”，请核对估值、分类及小数后手动保存。`,
          `Read ${assets.length} investable assets (${finance.currency}) and replace this new snapshot's holdings draft? Keep the draft date and classify them as Other. Verify values, categories and decimals, then save manually.`,
        ),
      )
    )
      return
    currency.value = finance.currency
    snapshot.value.holdings = assets.map((asset) => ({
      id: crypto.randomUUID(),
      name: asset.name,
      category: 'other',
      amount: asset.amount,
    }))
    message.value = t(
      '已填入草稿，尚未保存；个人资产与 FIRE 记录未修改。',
      'Draft filled but not saved. Personal finance & FIRE records were not changed.',
    )
  } catch {
    formError.value = t(
      '无法读取或校验个人资产，原记录与草稿均未更改。',
      'Personal assets could not be read or validated. Saved records and drafts were kept.',
    )
  }
}
const exportBackup = () => {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(record.value, null, 2)], { type: 'application/json' }),
  )
  const link = document.createElement('a')
  link.href = url
  link.download = `portfolio-review-${today()}.json`
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
const importBackup = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  importing.value = true
  formError.value = ''
  message.value = ''
  try {
    if (file.size > 10_000_000) throw new Error('File too large')
    const incoming = parsePortfolioReview(await file.text())
    if (
      !window.confirm(
        t(
          `用备份中的 ${incoming.snapshots.length} 个快照、${incoming.flows.length} 条流水（${incoming.currency}）替换整个组合，并清空草稿？请先导出需保留的数据。`,
          `Replace this entire portfolio with ${incoming.snapshots.length} snapshots and ${incoming.flows.length} cash flows (${incoming.currency}) and clear drafts? Export anything you want to keep first.`,
        ),
      )
    )
      return
    if (save(incoming)) {
      resetAll()
      message.value = t('备份已替换并保存。', 'Backup replaced and saved.')
    }
  } catch {
    formError.value = t(
      '备份无效或无法读取，已有记录和草稿未被覆盖。',
      'The backup is invalid or unreadable. Saved records and drafts were not overwritten.',
    )
  } finally {
    importing.value = false
    input.value = ''
  }
}
const warnUnsaved = (event: BeforeUnloadEvent) => {
  if (dirty.value) {
    event.preventDefault()
    event.returnValue = ''
  }
}
onBeforeRouteLeave(() => discard(dirty.value))
onMounted(() => window.addEventListener('beforeunload', warnUnsaved))
onUnmounted(() => window.removeEventListener('beforeunload', warnUnsaved))
</script>

<template>
  <main class="portfolio-view ph-no-capture">
    <ResearchPageHeader
      density="workbench"
      eyebrow="PORTFOLIO REVIEW"
      :title="t('组合复盘', 'Portfolio review')"
      :description="
        t(
          '把估值快照和外部资金流分开记录，回看收益、资产配置与观察点回撤。',
          'Separate valuation snapshots from external cash flows to review performance, allocation and observed drawdown.',
        )
      "
    />
    <div class="toolbar">
      <RouterLink to="/personal-finance"
        >{{ t('个人资产与 FIRE', 'Personal finance & FIRE') }} ↗</RouterLink
      >
      <div class="actions">
        <button type="button" :disabled="error === 'load'" @click="exportBackup">
          {{ t('导出备份', 'Export backup') }}</button
        ><button
          type="button"
          :disabled="error === 'load' || importing"
          @click="fileInput?.click()"
        >
          {{ t('导入替换', 'Import & replace') }}</button
        ><input
          ref="fileInput"
          type="file"
          accept=".json,application/json"
          hidden
          @change="importBackup"
        />
      </div>
    </div>
    <p class="hint">
      {{
        t(
          '仅保存在当前浏览器。金额是同一币种下的估值，含组合现金；不自动获取行情、换汇或同步账户。',
          'Saved only in this browser. Enter valuations in one currency, including portfolio cash. No automatic prices, currency conversion or account sync.',
        )
      }}
    </p>
    <div v-if="error" class="notice error" role="alert">
      <p>{{ storageMessage }}</p>
      <button type="button" @click="reload">
        {{ t('重新载入已保存数据', 'Reload saved data') }}
      </button>
    </div>
    <div v-if="currencyConflict" class="notice error" role="alert">
      <p>
        {{
          t(
            '其他标签页更改了组合币种，当前草稿仍使用原币种。请先复制需要保留的内容。',
            'Another tab changed the portfolio currency. These drafts still use the previous currency; copy anything you need first.',
          )
        }}
      </p>
      <button type="button" @click="discardForCurrency">
        {{ t('清空草稿并使用最新币种', 'Clear drafts and use saved currency') }}
      </button>
    </div>
    <p v-if="formError" class="notice error" role="alert">{{ formError }}</p>
    <p v-if="message" class="notice" role="status">{{ message }}</p>
    <div class="currency-control">
      <label
        ><span>{{ t('组合币种', 'Portfolio currency') }}</span
        ><select v-model="currency" :disabled="hasRecords">
          <option v-for="code in ['CNY', 'USD', 'HKD', 'EUR']" :key="code" :value="code">
            {{ code }}
          </option>
        </select></label
      ><span class="hint">{{
        t(
          '保存首条记录后锁定币种；切换完整账本请使用备份替换。',
          'Currency locks after the first saved record. Import a replacement backup to switch the entire ledger.',
        )
      }}</span>
    </div>
    <section class="stats" :aria-label="t('组合摘要', 'Portfolio summary')">
      <article>
        <span>{{ t('最新组合估值', 'Latest value') }} · {{ record.currency }}</span
        ><strong>{{ number(summary.latestValue) }}</strong
        ><small>{{ summary.latestDate ?? t('尚无快照', 'No snapshot') }}</small>
      </article>
      <article>
        <span>{{ t('区间净收益', 'Period profit') }}</span
        ><strong>{{ number(summary.profit) }}</strong
        ><small>{{ t('期末 − 期初 − 净存入', 'End − start − net contributions') }}</small>
      </article>
      <article>
        <span>{{ t('连乘估算收益率', 'Linked estimated return') }}</span
        ><strong>{{ percent(summary.returnPct) }}</strong
        ><small>Modified Dietz</small>
      </article>
      <article>
        <span>{{ t('观察点最大回撤', 'Maximum observed drawdown') }}</span
        ><strong>{{ percent(summary.maxDrawdownPct) }}</strong
        ><small>{{ t('仅覆盖已有估值快照', 'At recorded snapshots only') }}</small>
      </article>
    </section>
    <p class="hint">
      {{ t('统计区间', 'Review window') }}: {{ summary.startDate ?? '—' }} →
      {{ summary.latestDate ?? '—' }} · {{ t('净外部存入', 'Net external contributions') }}
      {{ number(summary.netContributions) }} {{ record.currency }}.
      {{
        t(
          '至少两个不同日期快照才能计算区间表现。',
          'Two snapshots on different dates are required for period performance.',
        )
      }}
    </p>
    <p v-if="summary.excludedFlowCount" class="notice">
      {{
        t(
          `有 ${summary.excludedFlowCount} 条流水未纳入当前统计区间：发生在首个快照当日或其前、最新快照之后，或尚无完整快照区间。`,
          `${summary.excludedFlowCount} cash flows are excluded: they are on/before the first snapshot date, after the latest date, or there is no complete snapshot interval yet.`,
        )
      }}
    </p>
    <details class="method">
      <summary>{{ t('计算口径与记录示例', 'Method and recording examples') }}</summary>
      <a
        href="https://www.gipsstandards.org/standards/gips-standards-for-firms/gips-standards-handbook-for-firms/"
        target="_blank"
        rel="noopener noreferrer"
        >{{ t('Modified Dietz 公式依据：GIPS 手册', 'Modified Dietz method: GIPS Handbook') }} ↗</a
      >
      <p>
        {{
          t(
            '外部存入 / 取出是组合与外界之间的资金转移，统一在当日收益之后入账。快照必须填写当天所有外部流水入账后的期末总价值，包含现金，不能使用入金之前的余额。首日流水已含在起点估值中，末日流水计入净资金流但权重为零。',
            'External deposits / withdrawals cross the portfolio boundary after the daily return. A snapshot must contain the closing total value after every cash flow for that date, including cash, not the balance before a deposit. Start-date flows are included in the opening value; end-date flows count with zero weight.',
          )
        }}
      </p>
      <p>
        {{
          t(
            '区间收益率 = (期末估值 − 期初估值 − 净资金流) ÷ (期初估值 + 各笔资金流 × 剩余天数 / 区间天数)。各相邻快照区间连乘形成指数。',
            'Period return = (end value − start value − net flows) ÷ (start value + each signed flow × remaining days / period days). Adjacent-period returns are linked into an index.',
          )
        }}
      </p>
      <p>
        {{
          t(
            '留存现金分红、投资费用和组合内部换仓均不是外部资金流。加权资本不大于零或收益率低于 −100% 的区间不补零；收益率和相关回撤显示缺失。',
            'Retained dividends, investment fees and internal asset trades are not external flows. Periods with non-positive weighted capital or returns below −100% remain missing; returns and dependent drawdowns are not replaced with zero.',
          )
        }}
      </p>
      <p>
        {{
          t(
            '这是按日资金权重的 Modified Dietz 估算，并非精确时间加权收益；大额流水与高波动会增加估算误差。观察点回撤不能反映快照之间的最大下跌，也不构成投资建议。',
            'This is a daily-weighted Modified Dietz estimate, not exact time-weighted return. Large flows and high volatility can increase estimation error. Observed drawdown misses declines between snapshots and is not investment advice.',
          )
        }}
      </p>
    </details>
    <div class="analysis-grid">
      <section class="panel">
        <h2>{{ t('最新资产配置', 'Latest allocation') }}</h2>
        <p class="hint">
          {{
            t(
              '变化与前一个快照比较，单位为百分点。总估值为零时权重不计算。',
              'Changes compare with the previous snapshot in percentage points. Weights are unavailable at zero total value.',
            )
          }}
        </p>
        <p v-if="!summary.allocation.length" class="empty">
          {{ t('尚无可展示的持仓配置。', 'No allocation to display yet.') }}
        </p>
        <div
          v-else
          class="table-scroll"
          tabindex="0"
          :aria-label="t('资产配置数据', 'Allocation data')"
        >
          <table>
            <thead>
              <tr>
                <th>{{ t('类别', 'Category') }}</th>
                <th>{{ t('估值', 'Value') }}</th>
                <th>{{ t('权重', 'Weight') }}</th>
                <th>{{ t('较前次变化', 'Change') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in summary.allocation" :key="item.category">
                <th>{{ categoryName(item.category) }}</th>
                <td>{{ number(item.amount) }}</td>
                <td>{{ percent(item.weightPct) }}</td>
                <td>{{ allocationChange(item.weightPct, item.previousWeightPct) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <section class="panel">
        <h2>{{ t('估算表现指数', 'Estimated performance index') }}</h2>
        <p class="hint">
          {{
            t(
              '首个观察点基准 100；缺失值不连接。原始估值和回撤见下方数据表。',
              'First observation starts at 100. Missing values break the line; valuations and drawdowns are in the table below.',
            )
          }}
        </p>
        <svg
          v-if="chart"
          class="chart"
          viewBox="0 0 760 230"
          role="img"
          :aria-label="t('基于已保存快照的连乘收益指数', 'Linked return index at saved snapshots')"
        >
          <g v-for="(tick, index) in chart.ticks" :key="index">
            <line x1="62" x2="720" :y1="36 + index * 77" :y2="36 + index * 77" />
            <text x="54" :y="40 + index * 77" text-anchor="end">{{ number(tick) }}</text>
          </g>
          <path :d="chart.path" />
          <template v-for="point in chart.points" :key="point.date">
            <circle v-if="point.y !== null" :cx="point.x" :cy="point.y" r="4">
              <title>{{ point.date }} · {{ number(point.index) }}</title>
            </circle>
          </template>
          <text x="62" y="216">{{ summary.startDate }}</text>
          <text x="720" y="216" text-anchor="end">{{ summary.latestDate }}</text>
        </svg>
        <p v-else class="empty">
          {{ t('保存快照后在此查看曲线。', 'Save a snapshot to see the chart.') }}
        </p>
      </section>
    </div>
    <div class="workspace">
      <section
        ref="editor"
        class="panel editor"
        tabindex="-1"
        :aria-label="t('组合记录编辑区', 'Portfolio record editor')"
      >
        <div class="actions editor-tabs">
          <button
            type="button"
            :aria-pressed="editorTab === 'snapshot'"
            @click="editorTab = 'snapshot'"
          >
            {{ t('估值快照', 'Valuation snapshot') }}{{ snapshotDirty ? ' *' : '' }}</button
          ><button type="button" :aria-pressed="editorTab === 'flow'" @click="editorTab = 'flow'">
            {{ t('外部资金流', 'External cash flow') }}{{ flowDirty ? ' *' : '' }}
          </button>
        </div>
        <form v-if="editorTab === 'snapshot'" @submit.prevent="saveSnapshot">
          <h2>
            {{ snapshot.id ? t('编辑快照', 'Edit snapshot') : t('新建快照', 'New snapshot') }}
          </h2>
          <label
            ><span>{{ t('快照日期', 'Snapshot date') }}</span
            ><input v-model="snapshot.date" type="date" required
          /></label>
          <button type="button" :disabled="Boolean(snapshot.id)" @click="readPersonalAssets">
            {{ t('从个人资产读取可投资资产', 'Read investable personal assets') }}
          </button>
          <p class="hint">
            {{
              t(
                '填写当天全部外部流水入账后的期末持仓总价值，包含现金。空持仓可保存为零估值；不支持负持仓。',
                'Enter the complete closing value after every cash flow for that date, including cash. Empty holdings represent zero value; negative positions are unsupported.',
              )
            }}
          </p>
          <fieldset v-for="(holding, index) in snapshot.holdings" :key="holding.id" class="holding">
            <legend>{{ t('持仓', 'Holding') }} {{ index + 1 }}</legend>
            <label
              ><span>{{ t('名称', 'Name') }} {{ index + 1 }}</span
              ><input v-model="holding.name" maxlength="160" required
            /></label>
            <div class="form-grid">
              <label
                ><span>{{ t('分类', 'Category') }} {{ index + 1 }}</span
                ><select v-model="holding.category">
                  <option v-for="category in categories" :key="category" :value="category">
                    {{ categoryName(category) }}
                  </option>
                </select></label
              ><label
                ><span>{{ t('估值金额', 'Valuation') }} {{ index + 1 }} · {{ currency }}</span
                ><input
                  v-model.number="holding.amount"
                  type="number"
                  min="0"
                  max="1000000000000"
                  step="0.01"
                  required
              /></label>
            </div>
            <button type="button" class="danger" @click="removeHolding(holding.id)">
              {{ t('移除此持仓', 'Remove holding') }} {{ index + 1 }}
            </button>
          </fieldset>
          <button
            type="button"
            :disabled="snapshot.holdings.length >= 200"
            @click="snapshot.holdings.push(newHolding())"
          >
            + {{ t('添加持仓', 'Add holding') }}</button
          ><label
            ><span>{{ t('快照备注', 'Snapshot notes') }}</span
            ><textarea v-model="snapshot.notes" rows="3" maxlength="5000" />
          </label>
          <div class="actions">
            <button class="primary" type="submit" :disabled="error === 'load' || currencyConflict">
              {{ t('保存快照', 'Save snapshot') }}</button
            ><button type="button" @click="discard(snapshotDirty) && resetSnapshot()">
              {{ t('清空快照草稿', 'Clear snapshot draft') }}
            </button>
          </div>
        </form>
        <form v-else @submit.prevent="saveFlow">
          <h2>
            {{
              flow.id
                ? t('编辑流水', 'Edit cash flow')
                : t('新建外部流水', 'New external cash flow')
            }}
          </h2>
          <label
            ><span>{{ t('流水日期', 'Cash-flow date') }}</span
            ><input v-model="flow.date" type="date" required
          /></label>
          <div class="form-grid">
            <label
              ><span>{{ t('方向', 'Direction') }}</span
              ><select v-model="flow.kind">
                <option value="deposit">{{ t('外部存入', 'Deposit') }}</option>
                <option value="withdrawal">{{ t('外部取出', 'Withdrawal') }}</option>
              </select></label
            ><label
              ><span>{{ t('流水金额', 'Cash-flow amount') }} · {{ currency }}</span
              ><input
                v-model.number="flow.amount"
                type="number"
                min="0.01"
                max="1000000000000"
                step="0.01"
                required
            /></label>
          </div>
          <p class="hint">
            {{
              t(
                '金额始终填正数，用方向区分存入或取出；不要把组合内部换仓或留存现金分红记为存入。',
                'Always enter a positive amount and choose the direction. Internal trades and dividends kept in portfolio cash are not deposits.',
              )
            }}
          </p>
          <label
            ><span>{{ t('流水备注', 'Cash-flow notes') }}</span
            ><textarea v-model="flow.notes" rows="3" maxlength="5000" />
          </label>
          <div class="actions">
            <button class="primary" type="submit" :disabled="error === 'load' || currencyConflict">
              {{ t('保存流水', 'Save cash flow') }}</button
            ><button type="button" @click="discard(flowDirty) && resetFlow()">
              {{ t('清空流水草稿', 'Clear cash-flow draft') }}
            </button>
          </div>
        </form>
      </section>
      <div class="history">
        <section class="panel">
          <h2>{{ t('估值快照记录', 'Valuation records') }} · {{ snapshots.length }}</h2>
          <p v-if="!snapshots.length" class="empty">
            {{
              t(
                '先保存起点估值，再在另一个日期记录完整组合。',
                'Save an opening valuation, then record the full portfolio on another date.',
              )
            }}
          </p>
          <article v-for="item in snapshots" :key="item.id" class="record">
            <header>
              <strong>{{ item.date }}</strong
              ><span>{{ number(total(item)) }} {{ record.currency }}</span>
            </header>
            <p class="hint">{{ item.holdings.length }} {{ t('项持仓', 'holdings') }}</p>
            <p v-if="item.notes" class="notes">{{ item.notes }}</p>
            <details v-if="item.holdings.length">
              <summary>{{ t('查看持仓', 'View holdings') }}</summary>
              <ul>
                <li v-for="holding in item.holdings" :key="holding.id">
                  {{ holding.name }} · {{ categoryName(holding.category) }} ·
                  {{ number(holding.amount) }} {{ record.currency }}
                </li>
              </ul>
            </details>
            <div class="actions">
              <button
                type="button"
                :aria-label="`${t('编辑快照', 'Edit snapshot')} ${item.date}`"
                @click="editSnapshot(item)"
              >
                {{ t('编辑', 'Edit') }}</button
              ><button
                type="button"
                class="danger"
                :aria-label="`${t('删除快照', 'Delete snapshot')} ${item.date}`"
                @click="removeSnapshot(item)"
              >
                {{ t('删除', 'Delete') }}
              </button>
            </div>
          </article>
        </section>
        <section class="panel">
          <h2>{{ t('外部资金流记录', 'External cash-flow records') }} · {{ flows.length }}</h2>
          <p v-if="!flows.length" class="empty">
            {{
              t(
                '无外部存入或取出时无需添加流水。',
                'No cash-flow entry is needed unless money crosses the portfolio boundary.',
              )
            }}
          </p>
          <article v-for="item in flows" :key="item.id" class="record">
            <header>
              <strong>{{ item.date }}</strong
              ><span
                >{{ item.kind === 'deposit' ? '+' : '−' }}{{ number(item.amount) }}
                {{ record.currency }}</span
              >
            </header>
            <p class="hint">
              {{ item.kind === 'deposit' ? t('外部存入', 'Deposit') : t('外部取出', 'Withdrawal') }}
            </p>
            <p v-if="item.notes" class="notes">{{ item.notes }}</p>
            <div class="actions">
              <button
                type="button"
                :aria-label="`${t('编辑流水', 'Edit cash flow')} ${item.date} ${item.id}`"
                @click="editFlow(item)"
              >
                {{ t('编辑', 'Edit') }}</button
              ><button
                type="button"
                class="danger"
                :aria-label="`${t('删除流水', 'Delete cash flow')} ${item.date} ${item.id}`"
                @click="removeFlow(item)"
              >
                {{ t('删除', 'Delete') }}
              </button>
            </div>
          </article>
        </section>
      </div>
    </div>
    <section class="panel data-panel">
      <h2>{{ t('区间收益明细', 'Period performance') }}</h2>
      <p v-if="!summary.periods.length" class="empty">
        {{ t('至少两个快照后生成区间。', 'Add at least two snapshots to form a period.') }}
      </p>
      <div
        v-else
        class="table-scroll"
        tabindex="0"
        :aria-label="t('区间收益数据', 'Period performance data')"
      >
        <table>
          <thead>
            <tr>
              <th>{{ t('区间', 'Period') }}</th>
              <th>{{ t('起点估值', 'Start value') }}</th>
              <th>{{ t('终点估值', 'End value') }}</th>
              <th>{{ t('净存入', 'Net flows') }}</th>
              <th>{{ t('净收益', 'Profit') }}</th>
              <th>{{ t('加权资本', 'Weighted capital') }}</th>
              <th>{{ t('估算收益率', 'Estimated return') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="period in summary.periods" :key="period.endDate">
              <th>{{ period.startDate }} → {{ period.endDate }}</th>
              <td>{{ number(period.startValue) }}</td>
              <td>{{ number(period.endValue) }}</td>
              <td>{{ number(period.netFlow) }}</td>
              <td>{{ number(period.profit) }}</td>
              <td>{{ number(period.weightedCapital) }}</td>
              <td>
                {{ percent(period.returnPct)
                }}<small v-if="period.issue" class="issue">{{ issueName(period.issue) }}</small>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
    <section class="panel data-panel">
      <h2>{{ t('历史观察点数据', 'Historical observations') }}</h2>
      <div
        class="table-scroll"
        tabindex="0"
        :aria-label="t('历史观察点', 'Historical observation data')"
      >
        <table>
          <thead>
            <tr>
              <th>{{ t('日期', 'Date') }}</th>
              <th>{{ t('估值', 'Value') }} · {{ record.currency }}</th>
              <th>{{ t('估算指数', 'Estimated index') }}</th>
              <th>{{ t('观察点回撤', 'Observed drawdown') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="point in summary.series" :key="point.date">
              <th>{{ point.date }}</th>
              <td>{{ number(point.value) }}</td>
              <td>{{ number(point.index) }}</td>
              <td>{{ percent(point.drawdownPct) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </main>
</template>

<style scoped>
.portfolio-view {
  max-width: 1500px;
  padding: 28px;
  margin: auto;
  color: var(--ink);
}
.toolbar,
.actions,
.record header,
.currency-control {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.actions,
.currency-control {
  justify-content: flex-start;
}
button,
input,
select,
textarea {
  font: inherit;
  color: var(--ink);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 7px;
  min-height: 42px;
}
button {
  padding: 9px 12px;
  cursor: pointer;
}
button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
button.primary,
.editor-tabs button[aria-pressed='true'] {
  background: var(--accent);
  color: var(--on-accent, #fff);
  border-color: var(--accent);
}
button.danger {
  color: var(--danger);
}
input,
select,
textarea {
  min-width: 0;
  width: 100%;
  padding: 10px;
}
textarea {
  resize: vertical;
}
:is(button, input, select, textarea, a, summary, .table-scroll):focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 3px;
}
a {
  color: var(--accent);
  text-underline-offset: 3px;
}
label {
  display: grid;
  gap: 7px;
  font-size: 13px;
  min-width: 0;
}
label > span {
  font-weight: 600;
}
.hint,
.empty {
  font-size: 12px;
  line-height: 1.75;
  color: var(--muted);
}
.currency-control {
  margin: 20px 0;
  align-items: end;
}
.currency-control label {
  min-width: 140px;
}
.notice {
  border: 1px solid var(--border);
  background: var(--surface);
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.7;
  overflow-wrap: anywhere;
}
.notice.error {
  border-color: var(--danger);
}
.stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}
.stats article,
.panel {
  min-width: 0;
  padding: 20px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
}
.stats span,
.stats small {
  display: block;
  font-size: 11px;
  line-height: 1.7;
  color: var(--muted);
}
.stats strong {
  display: block;
  margin: 9px 0;
  font-size: 24px;
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
}
h2 {
  font-size: 17px;
  margin: 0 0 14px;
}
.method {
  border-block: 1px solid var(--border);
  padding: 16px 0;
  margin: 20px 0;
  font-size: 13px;
  line-height: 1.8;
}
summary {
  cursor: pointer;
}
.method p:last-child {
  margin-bottom: 0;
}
.analysis-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  margin-bottom: 24px;
}
.chart {
  display: block;
  width: 100%;
  height: auto;
}
.chart line {
  stroke: var(--border);
}
.chart text {
  fill: var(--muted);
  font: 11px sans-serif;
}
.chart path {
  fill: none;
  stroke: var(--accent);
  stroke-width: 2.5;
}
.chart circle {
  fill: var(--accent);
}
.workspace {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
  gap: 24px;
  align-items: start;
}
.editor {
  scroll-margin-top: 80px;
}
.editor-tabs {
  margin-bottom: 22px;
}
form,
.history {
  display: grid;
  gap: 16px;
}
form h2 {
  margin-bottom: 0;
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.holding {
  min-width: 0;
  display: grid;
  gap: 12px;
  border: 1px solid var(--border);
  padding: 12px;
  border-radius: 8px;
}
.holding legend {
  float: none;
  width: auto;
  font-size: 12px;
  margin: 0;
  padding: 0 5px;
  color: var(--muted);
}
.holding button {
  justify-self: start;
}
.record {
  border-top: 1px solid var(--border);
  padding: 16px 0;
  font-size: 13px;
}
.record:last-child {
  padding-bottom: 0;
}
.record .actions {
  margin-top: 12px;
}
.record header span {
  font-variant-numeric: tabular-nums;
}
.record ul {
  padding-left: 20px;
  line-height: 1.8;
  overflow-wrap: anywhere;
}
.notes {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  line-height: 1.75;
}
.data-panel {
  margin-top: 24px;
}
.table-scroll {
  overflow-x: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}
th,
td {
  padding: 11px 10px;
  border-bottom: 1px solid var(--border);
  text-align: right;
  white-space: nowrap;
}
th:first-child {
  text-align: left;
}
thead th {
  color: var(--muted);
  font-weight: 600;
}
.issue {
  display: block;
  white-space: normal;
  min-width: 160px;
  max-width: 240px;
  color: var(--danger);
  font-size: 11px;
}
@media (max-width: 1100px) {
  .stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .analysis-grid,
  .workspace {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 600px) {
  .portfolio-view {
    padding: 18px 12px;
  }
  .panel,
  .stats article {
    padding: 16px;
  }
  .stats {
    gap: 10px;
  }
  .stats strong {
    font-size: 21px;
  }
  .form-grid {
    grid-template-columns: 1fr;
  }
  .currency-control .hint {
    width: 100%;
  }
}
</style>
