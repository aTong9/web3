<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink, onBeforeRouteLeave } from 'vue-router'
import type { PersonalFinanceRecord } from '@/types/personal-finance'
import ResearchPageHeader from '@/components/research/ResearchPageHeader.vue'
import { useI18n } from '@/composables/use-i18n'
import { useLocalRecord } from '@/composables/use-local-record'
import {
  calculatePersonalFinance,
  emptyPersonalFinance,
  financeInputNumber,
  parsePersonalFinance,
} from '@/utils/personal-finance'

const { locale } = useI18n()
const en = computed(() => locale.value === 'en')
const t = (zh: string, english: string) => (en.value ? english : zh)
const { record, error, save, reload } = useLocalRecord(
  'market-desk-personal-finance-v1',
  emptyPersonalFinance,
  parsePersonalFinance,
)
const toDraft = (data: PersonalFinanceRecord) => ({
  currency: data.currency,
  assets: data.assets.map((asset) => ({ ...asset, amount: String(asset.amount) })),
  liabilities: data.liabilities.map((debt) => ({ ...debt, amount: String(debt.amount) })),
  monthlyIncome: data.monthlyIncome === null ? '' : String(data.monthlyIncome),
  monthlyExpenses: data.monthlyExpenses === null ? '' : String(data.monthlyExpenses),
  annualTargetExpenses: data.annualTargetExpenses === null ? '' : String(data.annualTargetExpenses),
  annualRetirementIncome:
    data.annualRetirementIncome === null ? '' : String(data.annualRetirementIncome),
  withdrawalRate: String(data.withdrawalRate),
  nominalReturn: String(data.nominalReturn),
  inflationRate: String(data.inflationRate),
  scenarioSpread: String(data.scenarioSpread),
  horizonYears: String(data.horizonYears),
})
const draft = ref(toDraft(record.value))
let baseline = JSON.stringify(draft.value)
const dirty = computed(() => JSON.stringify(draft.value) !== baseline)
const notification = ref<'saved' | 'imported' | 'invalid' | 'import-error' | 'export-error' | null>(
  null,
)
const fileInput = ref<HTMLInputElement | null>(null)
const nullableAmount = (value: string | number) =>
  String(value).trim() === '' ? null : financeInputNumber(value)
const draftRecord = () =>
  parsePersonalFinance(
    JSON.stringify({
      version: 1,
      ...draft.value,
      assets: draft.value.assets.map((asset) => ({
        ...asset,
        name: asset.name.trim(),
        amount: financeInputNumber(asset.amount),
      })),
      liabilities: draft.value.liabilities.map((debt) => ({
        ...debt,
        name: debt.name.trim(),
        amount: financeInputNumber(debt.amount),
      })),
      monthlyIncome: nullableAmount(draft.value.monthlyIncome),
      monthlyExpenses: nullableAmount(draft.value.monthlyExpenses),
      annualTargetExpenses: nullableAmount(draft.value.annualTargetExpenses),
      annualRetirementIncome: nullableAmount(draft.value.annualRetirementIncome),
      withdrawalRate: financeInputNumber(draft.value.withdrawalRate),
      nominalReturn: financeInputNumber(draft.value.nominalReturn),
      inflationRate: financeInputNumber(draft.value.inflationRate),
      scenarioSpread: financeInputNumber(draft.value.scenarioSpread),
      horizonYears: financeInputNumber(draft.value.horizonYears),
    }),
  )
const summary = computed(() => {
  try {
    return calculatePersonalFinance(draftRecord())
  } catch {
    return null
  }
})
const money = (amount: number | null | undefined) =>
  amount == null
    ? '—'
    : new Intl.NumberFormat(en.value ? 'en-US' : 'zh-CN', {
        style: 'currency',
        currency: draft.value.currency,
        maximumFractionDigits: 0,
      }).format(amount)
const percent = (value: number | null | undefined) => (value == null ? '—' : `${value.toFixed(1)}%`)
const scenarioLabel = (id: string) =>
  id === 'cautious'
    ? t('谨慎情景', 'Cautious')
    : id === 'higher'
      ? t('较高回报', 'Higher return')
      : t('基准情景', 'Base case')
const duration = (months: number | null) =>
  months === null
    ? t(
        `${draft.value.horizonYears} 年内未达到`,
        `Not reached in ${draft.value.horizonYears} years`,
      )
    : months === 0
      ? t('当前达到资金阈值', 'Threshold reached today')
      : t(
          `${Math.floor(months / 12)} 年 ${months % 12} 个月`,
          `${Math.floor(months / 12)} yr ${months % 12} mo`,
        )
const storageMessage = computed(() =>
  error.value === 'load'
    ? t(
        '无法读取已有个人资料，原始数据未被覆盖。请恢复浏览器存储访问或修复备份。',
        'Saved data could not be read and has not been overwritten. Restore storage access or repair the backup.',
      )
    : error.value === 'conflict'
      ? t(
          '其他标签页已更新资料，保存已停止，当前输入仍保留。请先导出当前输入，再重新载入。',
          'Another tab updated these records. Saving stopped and your draft remains. Export your draft before reloading.',
        )
      : t(
          '浏览器存储不可用或空间不足，保存失败，当前输入仍保留。',
          'Browser storage is unavailable or full. Saving failed; your draft remains.',
        ),
)
const notice = computed(
  () =>
    ({
      saved: t('个人资料已保存到当前浏览器。', 'Saved to this browser.'),
      imported: t('完整备份已导入并保存。', 'The complete backup was imported and saved.'),
      invalid: t(
        '请填写每个资产／负债的名称和有效非负金额，并检查假设范围。空白收支表示尚未填写，不会按 0 计算。',
        'Enter a name and a valid nonnegative amount for each asset or debt, and check assumption ranges. Blank income fields remain unset, not zero.',
      ),
      'import-error': t(
        '备份格式无效或读取失败，已有资料与当前输入未被修改。',
        'Invalid or unreadable backup. Saved records and your draft were not changed.',
      ),
      'export-error': t(
        '导出失败，请检查当前输入并重试。',
        'Export failed. Check the current inputs and try again.',
      ),
    })[notification.value ?? 'saved'],
)
const allowDiscard = () =>
  !dirty.value ||
  window.confirm(
    t('放弃尚未保存的个人资料修改？', 'Discard unsaved changes to your personal data?'),
  )
onBeforeRouteLeave(allowDiscard)
const warnUnsaved = (event: BeforeUnloadEvent) => {
  if (!dirty.value) return
  event.preventDefault()
  event.returnValue = ''
}
onMounted(() => window.addEventListener('beforeunload', warnUnsaved))
onUnmounted(() => window.removeEventListener('beforeunload', warnUnsaved))
const loadSaved = () => {
  if (!allowDiscard()) return
  reload()
  if (error.value) return
  draft.value = toDraft(record.value)
  baseline = JSON.stringify(draft.value)
  notification.value = null
}
const saveDraft = () => {
  notification.value = null
  try {
    if (save(draftRecord())) {
      draft.value = toDraft(record.value)
      baseline = JSON.stringify(draft.value)
      notification.value = 'saved'
    }
  } catch {
    notification.value = 'invalid'
  }
}
const removeEntry = (kind: 'assets' | 'liabilities', id: string) => {
  if (
    !window.confirm(
      t('从当前清单移除此项目？保存后生效。', 'Remove this entry from the draft? Save to apply.'),
    )
  )
    return
  notification.value = null
  if (kind === 'assets') draft.value.assets = draft.value.assets.filter((entry) => entry.id !== id)
  else draft.value.liabilities = draft.value.liabilities.filter((entry) => entry.id !== id)
}
const addAsset = () => {
  notification.value = null
  draft.value.assets.push({ id: crypto.randomUUID(), name: '', amount: '', kind: 'investable' })
}
const addDebt = () => {
  notification.value = null
  draft.value.liabilities.push({ id: crypto.randomUUID(), name: '', amount: '' })
}
const exportBackup = () => {
  try {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(draftRecord(), null, 2)], { type: 'application/json' }),
    )
    const link = document.createElement('a')
    link.href = url
    link.download = `personal-finance-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  } catch {
    notification.value = 'export-error'
  }
}
const importBackup = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  notification.value = null
  try {
    if (file.size > 2_000_000) throw new Error('File too large')
    const incoming = parsePersonalFinance(await file.text())
    if (
      !window.confirm(
        t(
          `用备份中的 ${incoming.assets.length} 项资产和 ${incoming.liabilities.length} 项负债完整替换已保存资料及当前输入？请先保留需要的备份。`,
          `Replace saved data and the current draft with all ${incoming.assets.length} assets and ${incoming.liabilities.length} debts from this backup? Keep a backup first.`,
        ),
      )
    )
      return
    if (save(incoming)) {
      draft.value = toDraft(record.value)
      baseline = JSON.stringify(draft.value)
      notification.value = 'imported'
    }
  } catch {
    notification.value = 'import-error'
  } finally {
    input.value = ''
  }
}
const chart = computed(() => {
  if (!summary.value?.scenarios.length) return null
  const amounts = summary.value.scenarios.flatMap((scenario) => scenario.balances)
  const min = Math.min(0, ...amounts)
  const max = Math.max(1, summary.value.targetCapital ?? 0, ...amounts)
  const y = (amount: number) => 180 - ((amount - min) / (max - min)) * 160
  return {
    min,
    max,
    targetY: y(summary.value.targetCapital ?? 0),
    lines: summary.value.scenarios.map((scenario) => ({
      id: scenario.id,
      points: scenario.balances
        .map(
          (amount, index) => `${20 + (index / (scenario.balances.length - 1)) * 640},${y(amount)}`,
        )
        .join(' '),
    })),
  }
})
</script>

<template>
  <main class="personal-finance ph-no-capture">
    <ResearchPageHeader
      eyebrow="PERSONAL FINANCE"
      density="workbench"
      :title="t('个人资产与 FIRE 规划', 'Personal finance & FIRE')"
      :description="
        t(
          '理清资产与现金流，再用可调整的假设测算财务目标。',
          'Understand your assets and cash flow, then explore financial goals under adjustable assumptions.',
        )
      "
    />
    <div class="actions">
      <RouterLink to="/portfolio-review"
        >{{ t('记录组合复盘', 'Review portfolio history') }} ↗</RouterLink
      >
      <p>
        {{
          t(
            '数据只保存在当前浏览器。金额使用同一币种；更换币种不会自动换算。',
            'Data stays in this browser. Use one currency throughout; changing currency does not convert amounts.',
          )
        }}
      </p>
      <button type="button" :disabled="error === 'load'" @click="exportBackup">
        {{ t('导出当前输入', 'Export current inputs') }}
      </button>
      <button type="button" @click="fileInput?.click()">
        {{ t('导入完整备份', 'Import complete backup') }}
      </button>
      <input
        ref="fileInput"
        type="file"
        accept="application/json,.json"
        class="backup-input"
        tabindex="-1"
        :aria-label="t('导入完整备份', 'Import complete backup')"
        @change="importBackup"
      />
    </div>
    <div v-if="error" class="notice error" role="alert">
      {{ storageMessage }}
      <button type="button" @click="loadSaved">
        {{ t('重新载入已保存资料', 'Reload saved data') }}
      </button>
    </div>
    <p
      v-if="notification"
      class="notice"
      :class="{ error: !['saved', 'imported'].includes(notification) }"
      :role="['saved', 'imported'].includes(notification) ? 'status' : 'alert'"
    >
      {{ notice }}
    </p>
    <div class="finance-grid">
      <form
        class="editor"
        @submit.prevent="saveDraft"
        @input="notification = null"
        @change="notification = null"
      >
        <section class="panel">
          <div class="section-heading">
            <h2>{{ t('资产与负债', 'Assets & debts') }}</h2>
            <label class="currency"
              >{{ t('币种', 'Currency')
              }}<select v-model="draft.currency">
                <option>CNY</option>
                <option>USD</option>
                <option>HKD</option>
                <option>EUR</option>
              </select></label
            >
          </div>
          <p class="hint">
            {{
              t(
                '按当前估值填写。自住房与非投资资产计入净资产，但不计入可提取组合。',
                'Use current values. Your home and noninvestment assets count toward net worth, not the withdrawal portfolio.',
              )
            }}
          </p>
          <h3>{{ t('资产清单', 'Asset list') }}</h3>
          <p v-if="!draft.assets.length" class="empty">
            {{
              t(
                '尚未录入资产，从一个实际持有的项目开始。',
                'No assets entered. Start with an asset you actually own.',
              )
            }}
          </p>
          <fieldset v-for="(asset, index) in draft.assets" :key="asset.id" class="entry-row">
            <legend>{{ t(`资产 ${index + 1}`, `Asset ${index + 1}`) }}</legend>
            <label
              >{{ t('名称', 'Name')
              }}<input
                v-model="asset.name"
                required
                maxlength="160"
                :aria-label="t(`资产 ${index + 1} 名称`, `Asset ${index + 1} name`)"
            /></label>
            <label
              >{{ t('金额', 'Amount')
              }}<input
                v-model="asset.amount"
                type="number"
                required
                min="0"
                max="1000000000000"
                step="any"
                inputmode="decimal"
                :aria-label="t(`资产 ${index + 1} 金额`, `Asset ${index + 1} amount`)"
            /></label>
            <label
              >{{ t('用途', 'Use')
              }}<select
                v-model="asset.kind"
                :aria-label="t(`资产 ${index + 1} 用途`, `Asset ${index + 1} use`)"
              >
                <option value="investable">
                  {{ t('可投资／可提取', 'Investable / withdrawable') }}
                </option>
                <option value="home">{{ t('自住房', 'Primary home') }}</option>
                <option value="other">
                  {{ t('其他非投资资产', 'Other noninvestment asset') }}
                </option>
              </select></label
            >
            <button
              type="button"
              class="remove"
              :aria-label="t(`移除资产 ${index + 1}`, `Remove asset ${index + 1}`)"
              @click="removeEntry('assets', asset.id)"
            >
              {{ t('移除', 'Remove') }}
            </button>
          </fieldset>
          <button type="button" @click="addAsset">{{ t('添加资产', 'Add asset') }}</button>
          <h3>{{ t('负债清单', 'Debt list') }}</h3>
          <p v-if="!draft.liabilities.length" class="empty">
            {{
              t(
                '尚未录入负债；如有贷款，请填写未偿还余额。',
                'No debts entered. Include outstanding loan balances if applicable.',
              )
            }}
          </p>
          <fieldset
            v-for="(debt, index) in draft.liabilities"
            :key="debt.id"
            class="entry-row debt-row"
          >
            <legend>{{ t(`负债 ${index + 1}`, `Debt ${index + 1}`) }}</legend>
            <label
              >{{ t('名称', 'Name')
              }}<input
                v-model="debt.name"
                required
                maxlength="160"
                :aria-label="t(`负债 ${index + 1} 名称`, `Debt ${index + 1} name`)"
            /></label>
            <label
              >{{ t('未偿金额', 'Outstanding amount')
              }}<input
                v-model="debt.amount"
                type="number"
                required
                min="0"
                max="1000000000000"
                step="any"
                inputmode="decimal"
                :aria-label="t(`负债 ${index + 1} 金额`, `Debt ${index + 1} amount`)"
            /></label>
            <button
              type="button"
              class="remove"
              :aria-label="t(`移除负债 ${index + 1}`, `Remove debt ${index + 1}`)"
              @click="removeEntry('liabilities', debt.id)"
            >
              {{ t('移除', 'Remove') }}
            </button>
          </fieldset>
          <button type="button" @click="addDebt">{{ t('添加负债', 'Add debt') }}</button>
        </section>
        <section class="panel">
          <h2>{{ t('现金流与退休目标', 'Cash flow & retirement target') }}</h2>
          <p class="hint">
            {{
              t(
                '均按今天的购买力填写。无收入或无其他退休收入请明确填 0；空白表示未填写。',
                "Use today's purchasing power throughout. Enter 0 explicitly when there is no income; blank means unset.",
              )
            }}
          </p>
          <div class="input-grid">
            <label
              >{{ t('月税后收入', 'Monthly after-tax income')
              }}<input
                v-model="draft.monthlyIncome"
                type="number"
                min="0"
                max="1000000000000"
                step="any"
                inputmode="decimal"
            /></label>
            <label
              >{{ t('月支出', 'Monthly expenses')
              }}<input
                v-model="draft.monthlyExpenses"
                type="number"
                min="0"
                max="1000000000000"
                step="any"
                inputmode="decimal"
            /></label>
            <label
              >{{ t('退休目标年支出', 'Target annual retirement spending')
              }}<input
                v-model="draft.annualTargetExpenses"
                type="number"
                min="0"
                max="1000000000000"
                step="any"
                inputmode="decimal"
            /></label>
            <label
              >{{ t('年度其他退休收入', 'Other annual retirement income')
              }}<input
                v-model="draft.annualRetirementIncome"
                type="number"
                min="0"
                max="1000000000000"
                step="any"
                inputmode="decimal"
            /></label>
          </div>
          <p class="hint">
            {{
              t(
                '其他退休收入填退休时可用的养老金等税后金额，并假设随通胀调整；不要重复填写组合提取收入。固定名义收入应先折算，开始领取前的过渡期未建模。',
                'Other retirement income means after-tax pension or similar income available at retirement, assumed to keep pace with inflation. Exclude portfolio withdrawals. Convert fixed nominal income first; gaps before benefits start are not modeled.',
              )
            }}
          </p>
        </section>
        <section class="panel">
          <h2>{{ t('可调整假设', 'Adjustable assumptions') }}</h2>
          <p class="hint">
            {{
              t(
                '默认值只是演算起点，不是收益预测或安全提取率建议。',
                'Defaults are calculation starting points, not return forecasts or recommended withdrawal rates.',
              )
            }}
          </p>
          <div class="input-grid">
            <label
              >{{ t('年度提取率（%）', 'Annual withdrawal rate (%)')
              }}<input
                v-model="draft.withdrawalRate"
                type="number"
                required
                min="0.1"
                max="20"
                step="any"
            /></label>
            <label
              >{{ t('名义年回报（%）', 'Nominal annual return (%)')
              }}<input
                v-model="draft.nominalReturn"
                type="number"
                required
                min="-50"
                max="50"
                step="any"
            /></label>
            <label
              >{{ t('年度通胀（%）', 'Annual inflation (%)')
              }}<input
                v-model="draft.inflationRate"
                type="number"
                required
                min="-20"
                max="50"
                step="any"
            /></label>
            <label
              >{{ t('回报情景上下浮动（百分点）', 'Return scenario spread (percentage points)')
              }}<input
                v-model="draft.scenarioSpread"
                type="number"
                required
                min="0"
                max="30"
                step="any"
            /></label>
            <label
              >{{ t('规划年限', 'Planning horizon (years)')
              }}<input
                v-model="draft.horizonYears"
                type="number"
                required
                min="1"
                max="100"
                step="1"
            /></label>
          </div>
        </section>
        <div class="save-actions">
          <button type="submit" class="primary">
            {{ t('保存个人资料', 'Save personal data') }}</button
          ><button type="button" @click="loadSaved">{{ t('重新载入', 'Reload') }}</button
          ><span v-if="dirty" class="hint">{{ t('有未保存的修改', 'Unsaved changes') }}</span>
        </div>
      </form>
      <aside class="results" :aria-label="t('规划结果', 'Planning results')">
        <section class="panel">
          <h2>{{ t('你的财务概况', 'Your financial snapshot') }}</h2>
          <p class="hint">
            {{
              t(
                '随当前输入更新；保存按钮负责写入浏览器。',
                'Updates with your current inputs; use Save to persist them.',
              )
            }}
          </p>
          <p v-if="!summary" class="notice" role="status">
            {{
              t(
                '当前有未完整填写或超出范围的项目，完成后再显示计算结果。',
                'Some entries are incomplete or out of range. Complete them to see calculations.',
              )
            }}
          </p>
          <dl v-else class="metrics">
            <div>
              <dt>{{ t('总资产', 'Total assets') }}</dt>
              <dd>{{ money(summary.totalAssets) }}</dd>
            </div>
            <div>
              <dt>{{ t('总负债', 'Total debts') }}</dt>
              <dd>{{ money(summary.totalLiabilities) }}</dd>
            </div>
            <div class="highlight">
              <dt>{{ t('净资产', 'Net worth') }}</dt>
              <dd>{{ money(summary.netWorth) }}</dd>
            </div>
            <div>
              <dt>{{ t('可投资资产', 'Investable assets') }}</dt>
              <dd>{{ money(summary.investableAssets) }}</dd>
            </div>
            <div>
              <dt>{{ t('扣债后 FIRE 资金', 'FIRE capital after debts') }}</dt>
              <dd>{{ money(summary.fireCapital) }}</dd>
            </div>
            <div>
              <dt>{{ t('月净现金流', 'Monthly net cash flow') }}</dt>
              <dd>{{ money(summary.monthlyCashFlow) }}</dd>
            </div>
            <div>
              <dt>{{ t('储蓄率', 'Savings rate') }}</dt>
              <dd>{{ percent(summary.savingsRate) }}</dd>
            </div>
            <div class="highlight">
              <dt>{{ t('目标资金', 'Target capital') }}</dt>
              <dd>{{ money(summary.targetCapital) }}</dd>
            </div>
            <div>
              <dt>{{ t('资金缺口', 'Funding gap') }}</dt>
              <dd>{{ money(summary.fundingGap) }}</dd>
            </div>
          </dl>
          <p class="hint">
            {{
              t(
                'FIRE 资金 = 可投资资产 − 全部负债。负债按一次性扣除作预留，自住房不出售；月支出维持你的输入口径。',
                'FIRE capital = investable assets − all debts. Debts are reserved in full; the home is not sold. Monthly expenses remain as entered.',
              )
            }}
          </p>
          <p v-if="String(draft.monthlyIncome) === '0'" class="hint">
            {{
              t(
                '收入为 0 时储蓄率无定义，净现金流仍正常计算。',
                'Savings rate is undefined at zero income; net cash flow is still calculated.',
              )
            }}
          </p>
        </section>
        <section class="panel">
          <h2>{{ t('三种回报情景', 'Three return scenarios') }}</h2>
          <p class="hint">
            {{
              t(
                '金额均为今天购买力；显示首次达到资金阈值的时间，不代表可以安全退休。',
                "Amounts use today's purchasing power. Time shows the first crossing of the capital threshold, not a safe retirement date.",
              )
            }}
          </p>
          <p v-if="!summary?.scenarios.length" class="empty">
            {{
              t(
                '填写四项收支与退休目标金额后开始测算；没有的收入请填 0。',
                'Enter all four cash-flow and retirement amounts to project. Use 0 for income you do not receive.',
              )
            }}
          </p>
          <template v-else>
            <p
              v-if="summary.monthlyCashFlow !== null && summary.monthlyCashFlow < 0"
              class="notice"
            >
              {{
                t(
                  '当前现金流为负，将逐月扣减资金；达到过阈值不代表之后能维持。',
                  'Cash flow is negative and reduces capital each month. Crossing the threshold does not guarantee staying above it.',
                )
              }}
            </p>
            <p v-if="summary.fireCapital < 0" class="notice">
              {{
                t(
                  '扣债后资金为负。模型先用结余弥补缺口，负余额不计投资回报，也未计债务利息。',
                  'Capital after debts is negative. Savings first close this gap. Negative balances earn no investment return; debt interest is not modeled.',
                )
              }}
            </p>
            <div
              v-for="scenario in summary.scenarios"
              :key="scenario.id"
              class="scenario"
              :class="scenario.id"
            >
              <div>
                <h3>{{ scenarioLabel(scenario.id) }}</h3>
                <span
                  >{{ t('名义', 'Nominal') }} {{ percent(scenario.nominalReturn) }} ·
                  {{ t('实际', 'Real') }} {{ percent(scenario.realReturn) }}</span
                >
              </div>
              <strong>{{ duration(scenario.monthsToTarget) }}</strong>
              <p>
                {{ t('期末净资金', 'End-of-horizon net capital') }}
                <b>{{ money(scenario.endBalance) }}</b>
              </p>
            </div>
            <figure v-if="chart" class="projection">
              <figcaption>
                {{ t('资金变化（今天购买力）', "Capital path (today's purchasing power)") }}
              </figcaption>
              <div class="chart-labels">
                <span>{{ money(chart.max) }}</span
                ><span>{{ t('虚线：目标资金', 'Dashed line: target capital') }}</span>
              </div>
              <svg
                viewBox="0 0 680 200"
                role="img"
                :aria-label="
                  t(
                    '谨慎、基准和较高回报情景的资金变化；精确年度数值见下方表格。',
                    'Capital paths for cautious, base and higher-return scenarios; exact annual values are in the table below.',
                  )
                "
              >
                <line
                  x1="20"
                  x2="660"
                  :y1="chart.targetY"
                  :y2="chart.targetY"
                  class="target-line"
                />
                <polyline
                  v-for="line in chart.lines"
                  :key="line.id"
                  :points="line.points"
                  :class="line.id"
                />
              </svg>
              <div class="chart-labels">
                <span>{{ t('现在', 'Today') }} · {{ money(chart.min) }}</span
                ><span>{{ draft.horizonYears }} {{ t('年', 'years') }}</span>
              </div>
            </figure>
            <details>
              <summary>{{ t('查看每年资金明细', 'View yearly balances') }}</summary>
              <div
                class="table-scroll"
                tabindex="0"
                :aria-label="
                  t('年度资金明细，可横向滚动', 'Yearly balances, horizontally scrollable')
                "
              >
                <table>
                  <thead>
                    <tr>
                      <th>{{ t('年', 'Year') }}</th>
                      <th v-for="scenario in summary.scenarios" :key="scenario.id">
                        {{ scenarioLabel(scenario.id) }}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(_, year) in summary.scenarios[0]?.balances" :key="year">
                      <th>{{ year }}</th>
                      <td v-for="scenario in summary.scenarios" :key="scenario.id">
                        {{ money(scenario.balances[year]) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </details>
          </template>
        </section>
        <details class="panel assumptions">
          <summary>{{ t('计算口径与限制', 'Calculation assumptions & limits') }}</summary>
          <p>
            {{
              t(
                '目标资金 = max(0，目标年支出 − 年度其他退休收入) ÷ 提取率。实际回报 = (1 + 名义回报) ÷ (1 + 通胀) − 1。月末按固定购买力投入或扣除月净现金流。',
                'Target capital = max(0, target annual spending − other annual retirement income) ÷ withdrawal rate. Real return = (1 + nominal return) ÷ (1 + inflation) − 1. Monthly net cash flow is added or withdrawn at month end in constant purchasing power.',
              )
            }}
          </p>
          <p>
            {{
              t(
                '收入、支出与其他退休收入假设随通胀保持购买力；回报应自行考虑费用与税。未建模市场波动、回报顺序、领取年龄、贷款摊销或退休后的逐年提款，不计算成功概率。这是情景规划，不是收益承诺或投资建议。',
                'Income, expenses and other retirement income are assumed to retain purchasing power. Adjust returns for your costs and taxes. Volatility, sequence of returns, benefit start ages, loan amortization and retirement drawdowns are not modeled; no success probability is estimated. These are scenarios, not promised returns or investment advice.',
              )
            }}
          </p>
          <p>
            <a
              href="https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator"
              target="_blank"
              rel="noopener noreferrer"
              >{{
                t('Investor.gov：复利与定期投入', 'Investor.gov: compounding and contributions')
              }}</a
            >
            ·
            <a
              href="https://www.bls.gov/cpi/factsheets/purchasing-power-constant-dollars.htm"
              target="_blank"
              rel="noopener noreferrer"
              >{{ t('BLS：购买力与不变价格', 'BLS: purchasing power and constant dollars') }}</a
            >
          </p>
        </details>
      </aside>
    </div>
  </main>
</template>

<style scoped>
.personal-finance {
  max-width: var(--content-workbench);
  margin: 0 auto;
  padding: var(--space-section) var(--page-gutter) 64px;
  color: var(--ink);
}
.actions,
.section-heading,
.save-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.actions {
  margin-bottom: 20px;
}
.actions p {
  flex: 1 1 320px;
  margin: 0;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.6;
}
.finance-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
  gap: 24px;
  align-items: start;
}
.editor,
.results {
  min-width: 0;
  display: grid;
  gap: 18px;
}
.panel {
  min-width: 0;
  padding: 22px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--panel-radius);
}
h2 {
  margin: 0 0 12px;
  font-size: 18px;
  text-wrap: balance;
}
h3 {
  margin: 22px 0 12px;
  font-size: 14px;
}
.section-heading {
  justify-content: space-between;
}
.section-heading h2 {
  margin: 0;
}
.currency {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}
.currency select {
  width: auto;
  min-width: 76px;
}
.backup-input {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}
.hint,
.empty {
  color: var(--muted);
  font-size: 12px;
  line-height: 1.7;
  margin: 10px 0;
  text-wrap: pretty;
}
.input-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin: 18px 0;
}
label {
  display: grid;
  gap: 6px;
  min-width: 0;
  font-size: 12px;
}
input,
select,
button {
  font: inherit;
}
input,
select {
  width: 100%;
  min-width: 0;
  padding: 9px 10px;
  background: var(--surface);
  color: var(--ink);
  border: 1px solid var(--border);
  border-radius: 5px;
  font-size: 14px;
}
button {
  min-height: 36px;
  padding: 7px 11px;
  border: 1px solid var(--border);
  border-radius: 5px;
  background: var(--surface);
  color: var(--ink);
  font-size: 12px;
}
button:hover:not(:disabled) {
  color: var(--accent);
  border-color: var(--accent);
}
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.primary {
  background: var(--accent);
  color: var(--surface);
  border-color: var(--accent);
}
.primary:hover:not(:disabled) {
  background: var(--ink);
  color: var(--surface);
}
button:focus-visible,
input:focus-visible,
select:focus-visible,
a:focus-visible,
summary:focus-visible,
.table-scroll:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}
.entry-row {
  min-width: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 0.9fr);
  gap: 10px;
  margin: 0 0 14px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 5px;
}
legend {
  float: none;
  width: auto;
  margin: 0;
  padding: 0 4px;
  font-size: 11px;
  color: var(--muted);
}
.remove {
  align-self: end;
  justify-self: end;
}
.debt-row .remove {
  grid-column: 2;
}
.notice {
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--accent-soft);
  font-size: 13px;
  line-height: 1.7;
  margin-bottom: 16px;
}
.notice.error {
  border-color: #b76852;
}
.notice button {
  margin-left: 8px;
}
.metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 18px;
  margin: 18px 0;
}
.metrics > div {
  padding: 14px 0;
  border-bottom: 1px solid var(--border);
  min-width: 0;
}
dt {
  font-size: 12px;
  color: var(--muted);
  font-weight: 400;
}
dd {
  font-size: clamp(18px, 2vw, 24px);
  font-weight: 600;
  margin: 5px 0 0;
  overflow-wrap: anywhere;
  font-variant-numeric: tabular-nums;
}
.highlight dd {
  color: var(--accent);
}
.scenario {
  padding: 16px 0;
  border-bottom: 1px solid var(--border);
  font-variant-numeric: tabular-nums;
}
.scenario > div {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: space-between;
  flex-wrap: wrap;
}
.scenario h3 {
  margin: 0;
}
.scenario span,
.scenario p {
  color: var(--muted);
  font-size: 11px;
  margin: 7px 0;
}
.scenario strong {
  display: block;
  font-size: 18px;
  margin: 6px 0;
}
.scenario p b {
  color: var(--ink);
  font-weight: 500;
}
.projection {
  margin: 24px 0;
}
figcaption {
  font-size: 12px;
  margin-bottom: 10px;
}
.chart-labels {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: var(--muted);
  font-size: 10px;
}
svg {
  width: 100%;
  height: auto;
  overflow: visible;
}
polyline {
  fill: none;
  stroke-width: 2;
  vector-effect: non-scaling-stroke;
}
polyline.base {
  stroke: var(--accent);
  stroke-width: 3;
}
polyline.cautious {
  stroke: var(--muted);
  stroke-dasharray: 4 4;
}
polyline.higher {
  stroke: var(--ink);
  stroke-dasharray: 10 4;
}
.target-line {
  stroke: var(--muted);
  stroke-dasharray: 3 4;
  opacity: 0.5;
}
summary {
  cursor: pointer;
  font-size: 13px;
  line-height: 1.6;
}
.table-scroll {
  overflow-x: auto;
  margin-top: 14px;
}
table {
  width: 100%;
  font-size: 11px;
  border-collapse: collapse;
  font-variant-numeric: tabular-nums;
}
td,
th {
  text-align: right;
  padding: 8px;
  white-space: nowrap;
  border-bottom: 1px solid var(--border);
}
.assumptions p {
  color: var(--muted);
  font-size: 12px;
  line-height: 1.8;
  margin: 12px 0 0;
}
a {
  color: var(--accent);
  text-underline-offset: 3px;
}
@media (max-width: 1000px) {
  .finance-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
@media (max-width: 520px) {
  .panel {
    padding: 16px;
  }
  .input-grid {
    grid-template-columns: minmax(0, 1fr);
  }
  .entry-row {
    padding: 10px;
  }
  dd {
    font-size: 19px;
  }
}
</style>
