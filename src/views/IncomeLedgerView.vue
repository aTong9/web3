<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink, onBeforeRouteLeave, useRoute } from 'vue-router'
import type { IncomeLedgerEntry, IncomeLedgerPhase } from '@/types/income-ledger'
import ResearchPageHeader from '@/components/research/ResearchPageHeader.vue'
import { useI18n } from '@/composables/use-i18n'
import { useLocalRecord } from '@/composables/use-local-record'
import { incomeOpportunities } from '@/data/income-opportunities'
import {
  emptyIncomeLedger,
  incomeLedgerPhases,
  isIncomeLedgerDate,
  parseIncomeLedger,
  summarizeIncomeLedger,
} from '@/utils/income-ledger'

const { locale } = useI18n()
const t = (zh: string, en: string) => (locale.value === 'en' ? en : zh)
const route = useRoute()
const { record, error, save, reload } = useLocalRecord(
  'market-desk-income-ledger-v1',
  emptyIncomeLedger,
  parseIncomeLedger,
)
const projects = new Map(incomeOpportunities.map((project) => [project.id, project]))
const today = () => {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
const emptyEntry = (projectId: string | null = null, currency = 'CNY'): IncomeLedgerEntry => ({
  id: '',
  projectId,
  projectName: projects.get(projectId ?? '')?.name ?? '',
  date: today(),
  hours: 0,
  receivedIncome: 0,
  pendingIncome: 0,
  cost: 0,
  currency,
  phase: 'trial',
  notes: '',
  conclusion: '',
})
const projectKey = (entry: IncomeLedgerEntry) =>
  entry.projectId === null ? `custom:${entry.projectName}` : `catalog:${entry.projectId}`
const projectName = (entry: IncomeLedgerEntry) =>
  projects.get(entry.projectId ?? '')?.name ?? entry.projectName
const phaseName = (phase: IncomeLedgerPhase) =>
  ({
    exploring: t('探索', 'Exploring'),
    trial: t('试做', 'Trial'),
    running: t('持续开展', 'Running'),
    paused: t('暂停', 'Paused'),
    closed: t('已结束', 'Closed'),
  })[phase]
const draft = ref(emptyEntry())
const originalDraft = ref(JSON.stringify(draft.value))
const dirty = computed(() => JSON.stringify(draft.value) !== originalDraft.value)
const projectFilter = ref('')
const startDate = ref('')
const endDate = ref('')
const message = ref('')
const formError = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const editor = ref<HTMLElement | null>(null)
const importing = ref(false)
const selectedProject = computed(() => projects.get(draft.value.projectId ?? ''))
const unknownProject = computed(() =>
  Boolean(route.query.project && !projects.has(String(route.query.project))),
)
const filterInvalid = computed(
  () =>
    (Boolean(startDate.value) && !isIncomeLedgerDate(startDate.value)) ||
    (Boolean(endDate.value) && !isIncomeLedgerDate(endDate.value)) ||
    (Boolean(startDate.value && endDate.value) && startDate.value > endDate.value),
)
const filterProjects = computed(() =>
  [
    ...new Map(
      record.value.entries.map((entry) => [projectKey(entry), projectName(entry)] as const),
    ).entries(),
  ].sort((a, b) => a[1].localeCompare(b[1])),
)
const filteredEntries = computed(() =>
  filterInvalid.value
    ? []
    : record.value.entries
        .filter(
          (entry) =>
            (!projectFilter.value || projectKey(entry) === projectFilter.value) &&
            (!startDate.value || entry.date >= startDate.value) &&
            (!endDate.value || entry.date <= endDate.value),
        )
        .sort((a, b) => b.date.localeCompare(a.date)),
)
const summaries = computed(() => summarizeIncomeLedger(filteredEntries.value))
const totalHours = computed(() =>
  filteredEntries.value.reduce((sum, entry) => sum + entry.hours, 0),
)
const number = (value: number) =>
  new Intl.NumberFormat(locale.value === 'en' ? 'en-US' : 'zh-CN', {
    maximumFractionDigits: 8,
  }).format(value)
const storageMessage = computed(
  () =>
    ({
      load: t(
        '无法读取原有账本，原始数据未被覆盖。请恢复存储访问或修复原备份。',
        'Saved records could not be read and have not been overwritten. Restore storage access or repair the original backup.',
      ),
      save: t(
        '浏览器存储不可用或空间不足。草稿仍保留，请恢复存储后重试。',
        'Browser storage is unavailable or full. Your draft remains here; restore access and retry.',
      ),
      conflict: t(
        '其他标签页更改了账本。请重新载入已保存记录后再保存，当前草稿会保留。',
        'Another tab changed the ledger. Reload saved records before saving; your draft will be kept.',
      ),
    })[error.value ?? 'save'],
)
const allowDiscard = () =>
  !dirty.value || window.confirm(t('放弃尚未保存的草稿？', 'Discard the unsaved draft?'))
const resetDraft = (projectId: string | null = draft.value.projectId) => {
  draft.value = emptyEntry(projectId, draft.value.currency)
  originalDraft.value = JSON.stringify(draft.value)
  formError.value = ''
}
watch(
  () => route.query.project,
  (value) => {
    if (typeof value !== 'string' || !projects.has(value)) return
    projectFilter.value = `catalog:${value}`
    if (allowDiscard()) resetDraft(value)
  },
  { immediate: true },
)
const changeProject = () => {
  draft.value.projectName = selectedProject.value?.name ?? ''
}
const newEntry = () => {
  if (allowDiscard()) resetDraft()
}
const clearFilters = () => {
  projectFilter.value = ''
  startDate.value = ''
  endDate.value = ''
}
const editEntry = async (entry: IncomeLedgerEntry) => {
  if (!allowDiscard()) return
  draft.value = { ...entry }
  originalDraft.value = JSON.stringify(draft.value)
  formError.value = ''
  await nextTick()
  editor.value?.scrollIntoView({ block: 'start' })
  editor.value?.focus({ preventScroll: true })
}
const saveEntry = () => {
  formError.value = ''
  message.value = ''
  try {
    const entry = {
      ...draft.value,
      id: draft.value.id || crypto.randomUUID(),
      projectName: draft.value.projectName.trim(),
      currency: draft.value.currency.trim().toUpperCase(),
    }
    const current = record.value.entries.find((item) => item.id === draft.value.id)
    if (draft.value.id && !current) {
      formError.value = t(
        '这条记录已被删除。请复制草稿后新建记录。',
        'This entry was deleted. Copy your draft and create a new entry.',
      )
      return
    }
    if (
      current &&
      JSON.stringify(current) !== originalDraft.value &&
      !window.confirm(
        t(
          '这条记录自开始编辑后已被其他标签页更改。用当前草稿覆盖最新记录？取消后可复制草稿，再重新打开最新记录编辑。',
          'This entry changed in another tab after you started editing. Overwrite the latest entry with your draft? Cancel to copy your draft and reopen the latest entry.',
        ),
      )
    )
      return
    const next = parseIncomeLedger(
      JSON.stringify({
        version: 1,
        entries: draft.value.id
          ? record.value.entries.map((item) => (item.id === entry.id ? entry : item))
          : [...record.value.entries, entry],
      }),
    )
    if (save(next)) {
      resetDraft()
      message.value = t('已保存到当前浏览器。', 'Saved in this browser.')
    }
  } catch {
    formError.value = t(
      '请检查真实日期、项目名称、币种、非负金额及 0–24 小时的工时。金额最多 8 位小数、每项不超过 10 亿。',
      'Check the date, project, currency, non-negative amounts and 0–24 hours. Amounts allow up to 8 decimals and 1 billion per field.',
    )
  }
}
const removeEntry = (entry: IncomeLedgerEntry) => {
  if (
    !window.confirm(
      t(
        `永久删除「${projectName(entry)}」${entry.date} 的记录？`,
        `Permanently delete the ${entry.date} entry for ${projectName(entry)}?`,
      ),
    )
  )
    return
  if (draft.value.id === entry.id && !allowDiscard()) return
  if (save({ version: 1, entries: record.value.entries.filter((item) => item.id !== entry.id) })) {
    if (draft.value.id === entry.id) resetDraft()
    message.value = t('记录已删除。', 'Entry deleted.')
  }
}
const exportBackup = () => {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(record.value, null, 2)], { type: 'application/json' }),
  )
  const link = document.createElement('a')
  link.href = url
  link.download = `income-ledger-${today()}.json`
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
    const next = parseIncomeLedger(await file.text())
    if (
      !window.confirm(
        t(
          `用备份中的 ${next.entries.length} 条记录替换当前 ${record.value.entries.length} 条记录？未保存草稿也将被清除，请先导出需保留的记录。`,
          `Replace ${record.value.entries.length} saved entries with ${next.entries.length} entries from this backup? Unsaved drafts will also be cleared. Export anything you want to keep first.`,
        ),
      )
    )
      return
    if (save(next)) {
      resetDraft(null)
      projectFilter.value = ''
      startDate.value = ''
      endDate.value = ''
      message.value = t('备份已导入并保存。', 'Backup imported and saved.')
    }
  } catch {
    formError.value = t(
      '备份格式无效或无法读取，原有记录和草稿均已保留。',
      'This backup is invalid or unreadable. Saved entries and your draft were kept.',
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
onBeforeRouteLeave(allowDiscard)
onMounted(() => window.addEventListener('beforeunload', warnUnsaved))
onUnmounted(() => window.removeEventListener('beforeunload', warnUnsaved))
</script>

<template>
  <main class="ledger-view ph-no-capture">
    <ResearchPageHeader
      density="workbench"
      eyebrow="PERSONAL INCOME JOURNAL"
      :title="t('增收项目实践账本', 'Income practice ledger')"
      :description="
        t(
          '记录真实投入与到账结果，给每个项目留下可复查的实践记录。',
          'Track time, costs and money received, then review what each project taught you.',
        )
      "
    />
    <div class="toolbar">
      <RouterLink to="/income-opportunities"
        >{{ t('浏览赚钱项目', 'Browse income projects') }} ↗</RouterLink
      >
      <div class="actions">
        <button type="button" :disabled="error === 'load'" @click="exportBackup">
          {{ t('导出备份', 'Export backup') }}
        </button>
        <button type="button" :disabled="importing || error === 'load'" @click="fileInput?.click()">
          {{ t('导入替换', 'Import & replace') }}
        </button>
        <input
          ref="fileInput"
          type="file"
          accept=".json,application/json"
          hidden
          @change="importBackup"
        />
      </div>
    </div>
    <p class="storage-note">
      {{
        t(
          '仅保存在当前浏览器；更换设备或清理数据前请导出。金额按原币种分别核算，无自动汇率换算。',
          'Saved only in this browser; export before switching devices or clearing data. Currencies are calculated separately without conversion.',
        )
      }}
    </p>
    <div v-if="error" class="notice error" role="alert">
      <span>{{ storageMessage }}</span
      ><button type="button" @click="reload">
        {{ t('重新载入已保存记录', 'Reload saved records') }}
      </button>
    </div>
    <p v-if="unknownProject" class="notice">
      {{
        t(
          '链接中的项目不在当前目录。你可以创建自定义项目，已有记录不受影响。',
          'This project is no longer in the catalog. You can create a custom project; existing records are kept.',
        )
      }}
    </p>
    <p v-if="message" class="notice" role="status">{{ message }}</p>
    <p v-if="formError" class="notice error" role="alert">{{ formError }}</p>

    <section class="filters" :aria-label="t('筛选账本', 'Filter ledger')">
      <label
        ><span>{{ t('项目', 'Project') }}</span
        ><select v-model="projectFilter">
          <option value="">{{ t('全部项目', 'All projects') }}</option>
          <option
            v-if="projectFilter && !filterProjects.some(([key]) => key === projectFilter)"
            :value="projectFilter"
          >
            {{ selectedProject?.name ?? t('链接中的项目', 'Linked project') }}
          </option>
          <option v-for="[key, name] in filterProjects" :key="key" :value="key">{{ name }}</option>
        </select></label
      >
      <label
        ><span>{{ t('开始日期', 'From date') }}</span
        ><input v-model="startDate" type="date"
      /></label>
      <label
        ><span>{{ t('结束日期', 'To date') }}</span
        ><input v-model="endDate" type="date"
      /></label>
      <button type="button" @click="clearFilters">
        {{ t('清除筛选', 'Clear filters') }}
      </button>
    </section>
    <p v-if="filterInvalid" class="notice error" role="alert">
      {{
        t(
          '请使用有效日期，结束日期不能早于开始日期。',
          'Use valid dates with the end date on or after the start date.',
        )
      }}
    </p>
    <div class="section-heading">
      <h2>{{ t('筛选结果', 'Filtered results') }}</h2>
      <span
        >{{ filteredEntries.length }} {{ t('条记录', 'entries') }} · {{ number(totalHours) }}
        {{ t('小时', 'hours') }}</span
      >
    </div>
    <section
      v-if="summaries.length"
      class="summaries"
      :aria-label="t('按币种汇总', 'Totals by currency')"
    >
      <article v-for="summary in summaries" :key="summary.currency" class="currency-summary">
        <header>
          <strong>{{ summary.currency }}</strong
          ><span>{{ summary.count }} {{ t('条记录', 'entries') }}</span>
        </header>
        <dl>
          <div class="net">
            <dt>{{ t('到账净收益', 'Received net income') }}</dt>
            <dd :class="{ negative: summary.netIncome < 0 }">{{ number(summary.netIncome) }}</dd>
          </div>
          <div>
            <dt>{{ t('已到账', 'Received') }}</dt>
            <dd>{{ number(summary.receivedIncome) }}</dd>
          </div>
          <div>
            <dt>{{ t('已付成本', 'Costs paid') }}</dt>
            <dd>{{ number(summary.cost) }}</dd>
          </div>
          <div>
            <dt>{{ t('待到账（不计净收益）', 'Pending (excluded from net)') }}</dt>
            <dd>{{ number(summary.pendingIncome) }}</dd>
          </div>
          <div>
            <dt>{{ t('工时', 'Hours') }}</dt>
            <dd>{{ number(summary.hours) }}</dd>
          </div>
          <div>
            <dt>{{ t('有效时薪', 'Effective hourly income') }}</dt>
            <dd>
              {{
                summary.hourlyIncome === null
                  ? t('无工时，不计算', 'No hours recorded')
                  : `${number(summary.hourlyIncome)} ${summary.currency}/h`
              }}
            </dd>
          </div>
        </dl>
      </article>
    </section>
    <p class="calculation-note">
      {{
        t(
          '净收益 = 已到账收入 − 已付成本；有效时薪 = 净收益 ÷ 同币种记录工时。待到账是未结算金额，收到款项后请编辑原记录，转入已到账并减少待到账。',
          'Net income = received income − costs paid; hourly income = net income ÷ hours recorded in that currency. When pending money arrives, edit the original entry, move it to received, and reduce pending.',
        )
      }}
    </p>

    <div class="ledger-content">
      <section
        ref="editor"
        class="editor"
        tabindex="-1"
        :aria-label="t('记录编辑区', 'Entry editor')"
      >
        <div class="section-heading">
          <h2>{{ draft.id ? t('编辑记录', 'Edit entry') : t('新增记录', 'New entry') }}</h2>
          <span v-if="dirty">{{ t('草稿未保存', 'Unsaved draft') }}</span>
        </div>
        <form @submit.prevent="saveEntry">
          <label
            ><span>{{ t('关联项目', 'Linked project') }}</span
            ><select v-model="draft.projectId" @change="changeProject">
              <option :value="null">{{ t('自定义项目', 'Custom project') }}</option>
              <option
                v-if="draft.projectId && !projects.has(draft.projectId)"
                :value="draft.projectId"
              >
                {{ draft.projectName }} ({{ t('已从目录移除', 'No longer listed') }})
              </option>
              <option v-for="project in incomeOpportunities" :key="project.id" :value="project.id">
                {{ project.name }}
              </option>
            </select></label
          >
          <p v-if="selectedProject" class="project-context">
            {{ selectedProject.workMode }} · {{ selectedProject.model }}<br /><RouterLink
              :to="{
                path: '/income-opportunities',
                query: { project: selectedProject.id },
                hash: `#${selectedProject.id}`,
              }"
              >{{ t('查看此项目资料', 'View project details') }} ↗</RouterLink
            >
          </p>
          <label v-if="!selectedProject"
            ><span>{{ t('项目名称', 'Project name') }}</span
            ><input v-model="draft.projectName" required maxlength="160"
          /></label>
          <div class="form-grid">
            <label
              ><span>{{ t('记录日期', 'Entry date') }}</span
              ><input v-model="draft.date" type="date" required
            /></label>
            <label
              ><span>{{ t('阶段', 'Phase') }}</span
              ><select v-model="draft.phase">
                <option v-for="phase in incomeLedgerPhases" :key="phase" :value="phase">
                  {{ phaseName(phase) }}
                </option>
              </select></label
            >
            <label
              ><span>{{ t('工作时长（小时）', 'Work hours') }}</span
              ><input
                v-model.number="draft.hours"
                type="number"
                min="0"
                max="24"
                step="0.00000001"
                required
            /></label>
            <label
              ><span>{{ t('币种 / 资产代码', 'Currency / asset code') }}</span
              ><input
                v-model="draft.currency"
                required
                minlength="2"
                maxlength="10"
                pattern="[A-Za-z][A-Za-z0-9]{1,9}"
                placeholder="CNY / USD / BTC"
            /></label>
            <label
              ><span>{{ t('已到账收入', 'Income received') }}</span
              ><input
                v-model.number="draft.receivedIncome"
                type="number"
                min="0"
                max="1000000000"
                step="0.00000001"
                required
            /></label>
            <label
              ><span>{{ t('已付成本', 'Costs paid') }}</span
              ><input
                v-model.number="draft.cost"
                type="number"
                min="0"
                max="1000000000"
                step="0.00000001"
                required
            /></label>
            <label class="wide"
              ><span>{{ t('待到账收入（不计净收益）', 'Income pending (excluded from net)') }}</span
              ><input
                v-model.number="draft.pendingIncome"
                type="number"
                min="0"
                max="1000000000"
                step="0.00000001"
                required
            /></label>
          </div>
          <p class="field-hint">
            {{
              t(
                '可记录仅工时或仅成本。收入填写实际入账金额；已扣除的费用不要在成本中重复计入。跨币种收付分条记录，工时只记一次。',
                'Time-only and cost-only entries are allowed. Enter the amount actually received and do not count deducted fees twice. Record different currencies separately and count the work hours only once.',
              )
            }}
          </p>
          <label
            ><span>{{ t('工作内容与备注', 'Work and notes') }}</span
            ><textarea v-model="draft.notes" rows="3" maxlength="5000" />
          </label>
          <label
            ><span>{{ t('阶段复盘结论', 'Review conclusion') }}</span
            ><textarea
              v-model="draft.conclusion"
              rows="3"
              maxlength="5000"
              :placeholder="
                t(
                  '投入是否值得？下一步继续、调整还是停止？',
                  'Was the effort worthwhile? Continue, change course or stop?',
                )
              "
            />
          </label>
          <div class="actions">
            <button class="primary" type="submit" :disabled="error === 'load'">
              {{ t('保存记录', 'Save entry') }}</button
            ><button type="button" @click="newEntry">
              {{ draft.id ? t('取消编辑', 'Cancel edit') : t('清空草稿', 'Clear draft') }}
            </button>
          </div>
        </form>
      </section>
      <section class="entries" :aria-label="t('实践记录', 'Practice entries')">
        <div v-if="!filteredEntries.length" class="empty-state">
          <h2>
            {{
              record.entries.length
                ? t('没有匹配的记录', 'No matching entries')
                : t('从一次真实投入开始', 'Start with one real activity')
            }}
          </h2>
          <p>
            {{
              record.entries.length
                ? t(
                    '调整项目或日期筛选查看记录。',
                    'Adjust project or date filters to find your entries.',
                  )
                : t(
                    '选择已有项目或填写自己的项目，先记下今天花了多少时间和成本。',
                    'Choose a listed project or your own, then record the time and costs you spent today.',
                  )
            }}
          </p>
        </div>
        <article v-for="entry in filteredEntries" :key="entry.id" class="entry">
          <header>
            <div>
              <time>{{ entry.date }}</time>
              <h3>{{ projectName(entry) }}</h3>
              <span
                >{{ phaseName(entry.phase) }} · {{ number(entry.hours) }}
                {{ t('小时', 'hours') }}</span
              >
            </div>
            <span class="currency">{{ entry.currency }}</span>
          </header>
          <dl>
            <div>
              <dt>{{ t('已到账', 'Received') }}</dt>
              <dd>{{ number(entry.receivedIncome) }}</dd>
            </div>
            <div>
              <dt>{{ t('已付成本', 'Costs paid') }}</dt>
              <dd>{{ number(entry.cost) }}</dd>
            </div>
            <div>
              <dt>{{ t('待到账', 'Pending') }}</dt>
              <dd>{{ number(entry.pendingIncome) }}</dd>
            </div>
          </dl>
          <p v-if="entry.notes" class="entry-notes">{{ entry.notes }}</p>
          <div v-if="entry.conclusion" class="review">
            <strong>{{ t('复盘', 'Review') }}</strong>
            <p>{{ entry.conclusion }}</p>
          </div>
          <footer>
            <RouterLink
              v-if="entry.projectId && projects.has(entry.projectId)"
              :to="{
                path: '/income-opportunities',
                query: { project: entry.projectId },
                hash: `#${entry.projectId}`,
              }"
              >{{ t('项目资料', 'Project details') }} ↗</RouterLink
            >
            <div class="actions">
              <button
                type="button"
                :aria-label="`${t('编辑', 'Edit')} ${projectName(entry)} ${entry.date}`"
                @click="editEntry(entry)"
              >
                {{ t('编辑', 'Edit') }}</button
              ><button
                type="button"
                class="danger"
                :aria-label="`${t('删除', 'Delete')} ${projectName(entry)} ${entry.date}`"
                @click="removeEntry(entry)"
              >
                {{ t('删除', 'Delete') }}
              </button>
            </div>
          </footer>
        </article>
      </section>
    </div>
  </main>
</template>

<style scoped>
.ledger-view {
  max-width: 1500px;
  margin: 0 auto;
  padding: 28px;
  color: var(--ink);
}
.toolbar,
.actions,
.section-heading,
.currency-summary header,
.entry header,
.entry footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.actions {
  justify-content: flex-start;
  gap: 8px;
}
button,
input,
select,
textarea {
  font: inherit;
  color: var(--ink);
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--surface);
}
button {
  padding: 9px 12px;
  min-height: 42px;
  cursor: pointer;
}
button:hover {
  border-color: var(--accent);
}
button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}
button.primary {
  color: var(--on-accent, #fff);
  background: var(--accent);
  border-color: var(--accent);
}
button.danger {
  color: var(--danger, #bd403b);
}
.negative {
  color: var(--negative, #bd403b);
}
input,
select,
textarea {
  min-width: 0;
  width: 100%;
  padding: 10px;
  min-height: 44px;
}
textarea {
  resize: vertical;
}
:is(button, input, select, textarea, a):focus-visible {
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
  min-width: 0;
  font-size: 13px;
}
label > span {
  font-weight: 600;
}
.storage-note,
.calculation-note,
.field-hint,
.project-context {
  color: var(--muted);
  font-size: 12px;
  line-height: 1.7;
}
.storage-note {
  margin: 12px 0 20px;
}
.notice {
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px 16px;
  background: var(--surface);
  font-size: 13px;
  line-height: 1.6;
  overflow-wrap: anywhere;
}
.notice.error {
  border-color: var(--negative, #bd403b);
}
.notice button {
  margin: 8px;
}
.filters {
  display: grid;
  grid-template-columns: minmax(180px, 1.5fr) 1fr 1fr auto;
  align-items: end;
  gap: 12px;
  padding-block: 18px;
  border-block: 1px solid var(--border);
}
.section-heading {
  margin: 20px 0 14px;
}
h2 {
  margin: 0;
  font-size: 17px;
}
.section-heading > span,
.currency-summary header span {
  color: var(--muted);
  font-size: 12px;
}
.summaries {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 270px), 1fr));
  gap: 14px;
}
.currency-summary {
  padding: 18px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
}
.currency-summary header strong {
  font-size: 14px;
  letter-spacing: 0.06em;
}
dl {
  margin: 14px 0 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 13px;
}
dt {
  color: var(--muted);
  font-size: 11px;
  font-weight: 500;
}
dd {
  margin: 5px 0 0;
  overflow-wrap: anywhere;
  font-size: 15px;
  font-variant-numeric: tabular-nums;
}
.net {
  grid-column: 1 / -1;
}
.net dd {
  font-size: 25px;
  font-weight: 700;
}
.calculation-note {
  margin: 12px 0 24px;
}
.ledger-content {
  display: grid;
  grid-template-columns: minmax(300px, 0.95fr) minmax(0, 1.3fr);
  gap: 24px;
  align-items: start;
}
.editor,
.entry,
.empty-state {
  min-width: 0;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 22px;
}
.editor {
  scroll-margin-top: 80px;
}
.editor .section-heading {
  margin-top: 0;
}
form {
  display: grid;
  gap: 15px;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 15px;
}
.form-grid .wide {
  grid-column: 1 / -1;
}
.field-hint,
.project-context {
  margin: 0;
}
.entries {
  display: grid;
  gap: 14px;
}
.entry header {
  align-items: start;
}
.entry h3 {
  margin: 5px 0 7px;
  font-size: 17px;
  overflow-wrap: anywhere;
}
.entry time,
.entry header span {
  color: var(--muted);
  font-size: 12px;
}
.entry .currency {
  background: var(--surface-soft);
  border: 1px solid var(--border);
  border-radius: 5px;
  padding: 4px 8px;
  color: var(--ink);
}
.entry dl {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border-block: 1px solid var(--border);
  padding: 14px 0;
}
.entry-notes,
.review p {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font-size: 13px;
  line-height: 1.75;
  margin: 13px 0;
}
.review {
  padding-left: 12px;
  border-left: 2px solid var(--accent);
}
.review strong {
  font-size: 11px;
  color: var(--muted);
}
.review p {
  margin-top: 4px;
}
.entry footer {
  margin-top: 16px;
  font-size: 12px;
}
.entry footer .actions {
  margin-left: auto;
}
.empty-state {
  text-align: center;
  padding: 36px 24px;
}
.empty-state p {
  margin: 12px 0 0;
  font-size: 13px;
  color: var(--muted);
  line-height: 1.8;
}
@media (max-width: 1050px) {
  .ledger-content {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 600px) {
  .ledger-view {
    padding: 18px 12px;
  }
  .filters {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .filters label:first-child {
    grid-column: 1 / -1;
  }
  .editor,
  .entry {
    padding: 17px;
  }
  .form-grid {
    gap: 12px;
  }
  .entry dl {
    gap: 8px;
  }
  .entry dd {
    font-size: 13px;
  }
}
</style>
