<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import type { ReminderItem, ReminderSource, ReminderStatus } from '@/types/reminders'
import ResearchPageHeader from '@/components/research/ResearchPageHeader.vue'
import { useI18n } from '@/composables/use-i18n'
import { useReminderCenter } from '@/composables/use-reminder-center'
import { macroCalendarCheckedAt, macroCalendarCoverageEnd } from '@/data/macro-calendar'
import {
  filterReminders,
  parseReminderStore,
  reminderStorageKey,
  reminderToday,
  shiftReminderDate,
} from '@/utils/reminders'

const { locale } = useI18n()
const t = (zh: string, en: string) => (locale.value === 'en' ? en : zh)
const center = useReminderCenter()
const {
  items,
  pendingCount,
  watchedIds,
  now,
  record,
  error,
  workspaceError,
  actionError,
  inactiveStateCount,
} = center
const status = ref<ReminderStatus | 'all'>('pending')
const source = ref<ReminderSource | 'all'>('all')
const days = ref<7 | 30 | 90>(30)
const query = ref('')
const onlyWatched = ref(false)
const includeUnwatchedEarnings = ref(false)
const message = ref('')
const importError = ref('')
const importing = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const snoozing = ref<ReminderItem | null>(null)
const snoozeDate = ref('')
const today = computed(() => reminderToday(now.value))
const tomorrow = computed(() => shiftReminderDate(today.value, 1))
const endDate = computed(() => shiftReminderDate(today.value, days.value - 1))
const filter = computed(() => ({
  status: status.value,
  source: source.value,
  days: days.value,
  query: query.value,
  onlyWatched: onlyWatched.value,
  includeUnwatchedEarnings: includeUnwatchedEarnings.value,
  watchedIds: watchedIds.value,
}))
const visible = computed(() => filterReminders(items.value, filter.value, now.value))
const summary = computed(() => {
  const all = filterReminders(items.value, { ...filter.value, status: 'all' }, now.value)
  return {
    pending: all.filter((item) => item.status === 'pending').length,
    done: all.filter((item) => item.status === 'done').length,
    snoozed: all.filter((item) => item.status === 'snoozed').length,
  }
})
const statusLabels = computed(() => ({
  pending: t('待处理', 'Pending'),
  done: t('已处理', 'Handled'),
  snoozed: t('稍后提醒', 'Snoozed'),
}))
const sourceLabels = computed(() => ({
  note: t('研究复查', 'Research review'),
  macro: t('宏观日程', 'Macro schedule'),
  earnings: t('预计财报', 'Expected earnings'),
}))
const groups = computed(() => {
  const result = new Map<string, ReminderItem[]>()
  for (const item of visible.value)
    result.set(item.effectiveDate, [...(result.get(item.effectiveDate) ?? []), item])
  return [...result].map(([date, reminders]) => ({ date, reminders }))
})
const undated = computed(() =>
  center.earnings.undated.filter(
    (company) =>
      includeUnwatchedEarnings.value ||
      watchedIds.value.includes(`us-${company.symbol.toLowerCase()}`),
  ),
)
const stale = computed(
  () => now.value.getTime() - Date.parse(`${macroCalendarCheckedAt}T00:00:00Z`) > 14 * 86_400_000,
)
const storageMessage = computed(
  () =>
    ({
      load: t(
        '提醒存储无法读取，处理状态与计数暂不可用。请先导出原始备份，再重试或导入有效备份恢复。',
        'Reminder storage is unreadable; statuses and counts are unavailable. Export the raw backup before retrying or restoring a valid backup.',
      ),
      save: t(
        '保存失败，本次操作未保存。请导出备份并检查浏览器存储空间。',
        'Save failed; this action was not saved. Export a backup and check browser storage.',
      ),
      conflict: t(
        '其他页面已更改提醒，本次操作未保存。重新读取后再处理。',
        'Another page changed reminder state. This action was not saved. Reload local data before trying again.',
      ),
    })[error.value ?? 'save'],
)
const sourceTime = (item: ReminderItem) =>
  item.instant
    ? new Intl.DateTimeFormat(locale.value === 'en' ? 'en-GB' : 'zh-CN', {
        timeZone: 'Asia/Shanghai',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(new Date(item.instant)) + ' UTC+8'
    : item.source === 'note'
      ? t('复查日期 · 北京时间', 'Review date · Beijing time')
      : t('源日历日期 · 时间未知', 'Source calendar date · time unknown')
const act = (item: ReminderItem, next: ReminderStatus, date: string | null = null) => {
  message.value = ''
  if (!center.act(item, next, date)) return
  message.value =
    next === 'done'
      ? t(
          '已保存为已处理；来源笔记与日历未改变。',
          'Marked handled; the source note and calendar are unchanged.',
        )
      : next === 'snoozed'
        ? t(
            `已保存，${date}（北京时间）重新列入待处理。`,
            `Saved. Returns to Pending on ${date}, Beijing time.`,
          )
        : t('已恢复为待处理。', 'Restored to Pending.')
  snoozing.value = null
}
const beginSnooze = (item: ReminderItem) => {
  snoozing.value = item
  snoozeDate.value = tomorrow.value
  actionError.value = null
}
const download = (raw: string, name: string) => {
  const url = URL.createObjectURL(new Blob([raw], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url
  link.download = name
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
const exportBackup = () => {
  message.value = ''
  importError.value = ''
  try {
    const raw =
      window.localStorage.getItem(reminderStorageKey) ?? JSON.stringify({ version: 1, states: [] })
    download(raw, `reminders-${today.value}.json`)
    message.value = t(
      '已导出浏览器中的提醒状态。备份不包含研究笔记、关注列表或日历原文；存储损坏时导出的是原始内容。',
      'Exported the stored reminder state. Notes, watchlists and calendar sources are separate. If storage is corrupt, this exports its raw contents.',
    )
  } catch {
    importError.value = t(
      '无法读取浏览器存储，备份未生成。',
      'Storage could not be read; no backup was generated.',
    )
  }
}
const importBackup = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  importing.value = true
  message.value = ''
  importError.value = ''
  try {
    if (file.size > 5_000_000) throw new Error('size')
    const incoming = parseReminderStore(await file.text())
    const expectedRaw = window.localStorage.getItem(reminderStorageKey)
    if (
      !window.confirm(
        t(
          `用备份中的 ${incoming.states.length} 条提醒状态替换浏览器当前全部提醒状态？此操作也会覆盖损坏内容，请先导出需要保留的备份。研究笔记和日历不会改变。`,
          `Replace all stored reminder states with ${incoming.states.length} states from this backup? This also replaces corrupt contents. Export anything you need first. Notes and calendars are unchanged.`,
        ),
      )
    )
      return
    if (center.replaceBackup(incoming, expectedRaw)) {
      snoozing.value = null
      message.value = t(
        '提醒状态已替换。只有来源版本仍匹配的状态会生效。',
        'Reminder state replaced. Only states matching the current source revision take effect.',
      )
    }
  } catch {
    importError.value = t(
      '导入失败：文件无效、超过 5 MB，或存储无法读取。现有状态未被替换。',
      'Import failed: invalid file, over 5 MB, or unreadable storage. Existing state was not replaced.',
    )
  } finally {
    input.value = ''
    importing.value = false
  }
}
watch(
  [record, watchedIds],
  () => {
    message.value = ''
  },
  { flush: 'sync' },
)
</script>

<template>
  <main class="reminder-center ph-no-capture">
    <ResearchPageHeader
      eyebrow="REMINDER CENTER"
      :title="t('统一提醒', 'Reminder center')"
      :description="
        t(
          '把研究复查、宏观日程和自选财报放在一起，安排下一次关注。',
          'Keep research reviews, macro schedules and watched-company earnings together.',
        )
      "
    >
      <template #status
        ><div class="header-count">
          <strong>{{ pendingCount ?? '—' }}</strong
          ><span>{{ t('未来 30 天及逾期待办', 'Pending · next 30 days and overdue') }}</span>
        </div></template
      >
    </ResearchPageHeader>
    <p class="scope-note">
      {{
        t(
          '仅在站内打开时更新，每分钟刷新；没有后台、系统通知或推送。处理提醒只改变提醒状态，不改变研究笔记或来源日历。',
          'Updates while this page is open, once per minute. No background or system notifications. Actions affect reminder state only.',
        )
      }}
    </p>
    <nav class="source-links" :aria-label="t('来源页面', 'Source pages')">
      <RouterLink to="/research-workspace?tab=notes">{{
        t('研究笔记与自选', 'Notes and watchlist')
      }}</RouterLink
      ><RouterLink to="/event-calendar">{{ t('完整事件日历', 'Full event calendar') }}</RouterLink>
    </nav>
    <div v-if="error" class="notice warning" role="alert">
      {{ storageMessage }}
      <button @click="center.reload()">{{ t('重新读取', 'Reload local data') }}</button>
    </div>
    <p v-if="workspaceError" class="notice warning" role="alert">
      {{
        t(
          '研究工作台无法读取，笔记与自选筛选暂不可用；仍显示宏观日程。未使用旧资料推断提醒。',
          'The research workspace is unreadable. Notes and watchlist filtering are unavailable; macro schedules remain visible.',
        )
      }}
      <button @click="center.reload()">{{ t('重试', 'Retry') }}</button>
    </p>
    <p v-if="message" class="notice" role="status">{{ message }}</p>
    <p v-if="importError" class="notice warning" role="alert">{{ importError }}</p>
    <p v-if="actionError" class="notice warning" role="alert">
      {{
        actionError === 'source-changed'
          ? t(
              '来源已更改或已移除，本次操作未保存。请核对当前提醒再操作。',
              'The source changed or was removed. This action was not saved; check the current reminder.',
            )
          : t('请选择有效的未来日期（北京时间）。', 'Choose a valid future date in Beijing time.')
      }}
    </p>

    <section class="filters" :aria-label="t('提醒筛选', 'Reminder filters')">
      <label
        >{{ t('搜索', 'Search')
        }}<input
          v-model="query"
          type="search"
          :placeholder="t('标题、资产或来源', 'Title, asset or source')"
      /></label>
      <label
        >{{ t('来源', 'Source')
        }}<select v-model="source">
          <option value="all">{{ t('全部来源', 'All sources') }}</option>
          <option v-for="(label, key) in sourceLabels" :key="key" :value="key">{{ label }}</option>
        </select></label
      >
      <label
        >{{ t('时间范围', 'Horizon')
        }}<select v-model.number="days">
          <option :value="7">{{ t('未来 7 天 + 逾期', 'Next 7 days + overdue') }}</option>
          <option :value="30">{{ t('未来 30 天 + 逾期', 'Next 30 days + overdue') }}</option>
          <option :value="90">{{ t('未来 90 天 + 逾期', 'Next 90 days + overdue') }}</option>
        </select></label
      >
      <label class="check"
        ><input v-model="onlyWatched" type="checkbox" />{{
          t('仅自选关联', 'Only watchlist-linked')
        }}</label
      >
      <label class="check"
        ><input v-model="includeUnwatchedEarnings" type="checkbox" />{{
          t('也显示非自选财报', 'Include unwatched earnings')
        }}</label
      >
    </section>
    <div class="notice subtle">
      <p>
        {{
          t(
            '默认显示全部宏观日程、全部活跃复查笔记和自选财报。关联表示研究范围，并非价格影响预测。',
            'Defaults to all macro schedules, active note reviews and watched earnings. Association describes research coverage, not predicted price impact.',
          )
        }}
      </p>
      <p v-if="!watchedIds.length">
        {{
          t(
            '尚无自选资产；默认不显示公司财报。可添加自选或开启非自选财报。',
            'No watched assets yet. Add a watchlist entry or include unwatched earnings to see company earnings.',
          )
        }}
      </p>
      <p v-if="undated.length">
        {{
          t(
            '没有有效预计财报日期，未生成提醒：',
            'No valid expected earnings date; no reminder created: ',
          )
        }}{{ undated.map((company) => company.symbol).join(', ') }}
      </p>
      <p>
        {{ t('宏观官方日程核对：', 'Official macro schedules checked: ')
        }}{{ macroCalendarCheckedAt }} · {{ t('覆盖至', 'coverage through') }}
        {{ macroCalendarCoverageEnd }}。{{ t('财报快照：', 'Earnings snapshot: ')
        }}{{ center.earningsCheckedAt.slice(0, 10) }}
      </p>
      <p v-if="stale || endDate > macroCalendarCoverageEnd" class="warning-text">
        {{
          stale
            ? t(
                '宏观日程距上次核对已超过 14 天，请打开来源确认变更。',
                'Macro verification is over 14 days old; check the source for changes.',
              )
            : ''
        }}
        {{
          endDate > macroCalendarCoverageEnd
            ? t(
                '所选范围超出已核验宏观覆盖，后续空白不代表没有事件。',
                'This range extends beyond verified macro coverage; blank dates do not imply no events.',
              )
            : ''
        }}
      </p>
    </div>

    <template v-if="error !== 'load'">
      <div class="status-tabs" :aria-label="t('处理状态', 'Handling state')">
        <button
          :class="{ selected: status === 'all' }"
          :aria-pressed="status === 'all'"
          @click="status = 'all'"
        >
          {{ t('全部', 'All') }}</button
        ><button
          v-for="(label, key) in statusLabels"
          :key="key"
          :class="{ selected: status === key }"
          :aria-pressed="status === key"
          @click="status = key"
        >
          {{ label }} <b>{{ summary[key] }}</b>
        </button>
      </div>
      <p class="results-meta">
        {{ today }} — {{ endDate }} ·
        {{
          t(
            '含逾期未处理事项；精确时间按北京时间，未知时间保留源日历日期。',
            'Includes overdue items. Exact times use Beijing time; unknown times retain the source calendar date.',
          )
        }}
      </p>
      <p v-if="!visible.length" class="empty" role="status">
        {{
          t(
            '当前筛选下没有提醒。可调整来源、范围或处理状态。',
            'No reminders match these filters. Adjust the source, horizon or handling state.',
          )
        }}
      </p>
      <section v-for="group in groups" :key="group.date" class="reminder-group">
        <h2>
          <time :datetime="group.date">{{ group.date }}</time
          ><small v-if="group.date === today">{{ t('今天', 'Today') }}</small>
        </h2>
        <article
          v-for="item in group.reminders"
          :key="item.id"
          class="reminder-card"
          :data-reminder-id="item.id"
        >
          <div class="reminder-body">
            <div class="tags">
              <span>{{ sourceLabels[item.source] }}</span
              ><span :class="{ due: item.due }">{{
                item.due ? t('到期待处理', 'Due') : statusLabels[item.status]
              }}</span
              ><span v-if="item.estimated">{{
                t('预计 · 非公司确认', 'Estimate · not company-confirmed')
              }}</span>
            </div>
            <h3>{{ locale === 'en' ? item.titleEn : item.title }}</h3>
            <p class="source-date">
              {{ t('来源日期', 'Source date') }} {{ item.date }} · {{ sourceTime(item) }}
            </p>
            <p v-if="item.snoozedUntil">
              {{ t('再次提醒日期：', 'Reminder date: ') }}{{ item.snoozedUntil }} UTC+8
            </p>
            <p v-if="item.scheduledTimePassed" class="warning-text">
              {{
                t(
                  '计划时间已过；是否发布尚未核验。',
                  'The scheduled time has passed; release status is unverified.',
                )
              }}
            </p>
            <p class="source-meta">
              {{
                item.source === 'note'
                  ? t('笔记更新', 'Note updated')
                  : item.sourceName + ' · ' + t('核对', 'checked')
              }}
              {{ item.checkedAt.slice(0, 10)
              }}<span v-if="item.source !== 'macro'"> · {{ item.assetIds.join(', ') }}</span>
            </p>
            <div class="source-links">
              <RouterLink
                v-if="item.source === 'note'"
                :to="{
                  path: '/research-workspace',
                  query: { tab: 'notes', asset: item.assetIds[0], note: item.id.slice(5) },
                }"
                >{{ t('查看研究笔记', 'View research note') }}</RouterLink
              ><a
                v-else-if="item.sourceUrl"
                :href="item.sourceUrl"
                target="_blank"
                rel="noopener noreferrer"
                >{{ t('核对来源', 'Check source') }} ↗</a
              >
            </div>
          </div>
          <div class="actions">
            <button v-if="item.status !== 'done'" class="primary" @click="act(item, 'done')">
              {{ t('标为已处理', 'Mark handled') }}</button
            ><button v-if="item.status !== 'done'" @click="beginSnooze(item)">
              {{ t('稍后提醒', 'Snooze') }}</button
            ><button
              v-if="item.status !== 'pending' || item.snoozedUntil"
              @click="act(item, 'pending')"
            >
              {{ t('恢复未处理', 'Restore pending') }}
            </button>
          </div>
          <form
            v-if="snoozing?.id === item.id"
            class="snooze-form"
            @submit.prevent="act(snoozing, 'snoozed', snoozeDate)"
          >
            <label :for="`snooze-${item.id}`"
              >{{ t('再次提醒日期（北京时间）', 'Remind again on (Beijing time)')
              }}<input
                :id="`snooze-${item.id}`"
                v-model="snoozeDate"
                type="date"
                :min="tomorrow"
                required /></label
            ><button class="primary" type="submit">{{ t('保存日期', 'Save date') }}</button
            ><button type="button" @click="snoozing = null">{{ t('取消', 'Cancel') }}</button>
          </form>
        </article>
      </section>
    </template>

    <section class="backup-panel">
      <h2>{{ t('提醒状态备份', 'Reminder state backup') }}</h2>
      <p>
        {{
          t(
            '状态仅保存在当前浏览器。导入将替换全部提醒状态；来源版本不匹配、已报告、停用或移除的来源不会套用旧状态。笔记与自选请在研究工作台单独备份。',
            'State stays in this browser. Import replaces all reminder states. Old states do not apply to changed, reported, inactive or removed sources. Back up notes and watchlists separately in the research workspace.',
          )
        }}
      </p>
      <p v-if="inactiveStateCount">
        {{ t('保留但未套用的旧来源状态：', 'Retained states not applied to current sources: ')
        }}{{ inactiveStateCount }}
      </p>
      <div class="backup-actions">
        <button @click="exportBackup">{{ t('导出状态备份', 'Export state backup') }}</button
        ><button :disabled="importing" @click="fileInput?.click()">
          {{
            importing ? t('正在读取…', 'Reading…') : t('导入并替换', 'Import and replace')
          }}</button
        ><button @click="center.reload()">{{ t('重新读取本地数据', 'Reload local data') }}</button
        ><input
          ref="fileInput"
          type="file"
          accept=".json,application/json"
          hidden
          @change="importBackup"
        />
      </div>
    </section>
    <p class="scope-note">
      {{
        t(
          '仅日期事件不推测发布时间。计划经过后仍保留为待处理，直到个人处理或来源移除、明确报告。已处理只表示个人处理记录，不证明事件已经发布。',
          'Date-only events have no inferred release time. Past plans remain pending until handled or the source is removed or explicitly reported. Handled is a personal action, not proof of a release.',
        )
      }}
    </p>
  </main>
</template>

<style scoped>
.reminder-center {
  max-width: 1160px;
  margin: 0 auto;
  padding: 32px;
  color: var(--ink);
}
.header-count {
  display: grid;
  gap: 5px;
}
.header-count strong {
  font-size: 36px;
  line-height: 1;
}
.header-count span {
  font-size: 12px;
}
.scope-note,
.results-meta,
.source-meta {
  color: var(--ink-muted);
  font-size: 13px;
  line-height: 1.7;
}
.source-links {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin: 12px 0;
}
.source-links a {
  color: var(--accent);
  font-size: 13px;
  text-underline-offset: 3px;
}
.notice {
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px 16px;
  margin: 14px 0;
  background: var(--surface);
  font-size: 13px;
  line-height: 1.7;
}
.notice p {
  margin: 0;
}
.notice p + p {
  margin-top: 5px;
}
.warning {
  border-color: color-mix(in srgb, #bf861a 55%, var(--border));
}
.warning-text {
  color: var(--ink);
  border-left: 3px solid #bf861a;
  padding-left: 9px;
}
.filters {
  display: grid;
  grid-template-columns: minmax(180px, 1.5fr) 1fr 1fr;
  gap: 14px;
  margin-top: 24px;
}
label {
  display: grid;
  gap: 7px;
  font-size: 13px;
  color: var(--ink-muted);
}
input,
select,
button {
  font: inherit;
  color: var(--ink);
}
input:not([type='checkbox']),
select {
  width: 100%;
  min-width: 0;
  min-height: 42px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 9px 11px;
}
input[type='checkbox'] {
  width: 17px;
  height: 17px;
  accent-color: var(--accent);
}
.check {
  display: flex;
  align-items: center;
  gap: 8px;
}
button {
  border: 1px solid var(--border);
  background: var(--surface);
  border-radius: 8px;
  padding: 9px 13px;
  cursor: pointer;
  min-height: 40px;
  font-size: 13px;
}
button:hover {
  border-color: var(--accent);
}
button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.primary,
.status-tabs .selected {
  background: var(--ink);
  color: var(--surface);
  border-color: var(--ink);
}
button:focus-visible,
input:focus-visible,
select:focus-visible,
a:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}
.status-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 24px;
}
.status-tabs b {
  margin-left: 7px;
}
.reminder-group {
  margin: 25px 0;
}
.reminder-group h2 {
  font-size: 16px;
  margin: 0 0 12px;
  display: flex;
  gap: 12px;
  align-items: center;
}
.reminder-group h2 small {
  font-size: 12px;
  color: var(--ink-muted);
}
.reminder-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 16px;
  padding: 20px;
  margin-bottom: 10px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
}
.reminder-body {
  min-width: 0;
  overflow-wrap: anywhere;
}
.reminder-card h3 {
  font-size: 17px;
  line-height: 1.5;
  margin: 11px 0;
}
.reminder-card p {
  margin: 7px 0;
  font-size: 13px;
  line-height: 1.6;
}
.source-date {
  color: var(--ink-muted);
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.tags span {
  font-size: 11px;
  border: 1px solid var(--border);
  border-radius: 5px;
  padding: 3px 7px;
  color: var(--ink-muted);
}
.tags .due {
  border-color: #bf861a;
  color: var(--ink);
}
.actions {
  display: flex;
  flex-wrap: wrap;
  align-items: start;
  align-content: start;
  gap: 8px;
  max-width: 250px;
}
.snooze-form {
  grid-column: 1 / -1;
  display: flex;
  align-items: end;
  flex-wrap: wrap;
  gap: 10px;
  padding-top: 14px;
  border-top: 1px solid var(--border);
}
.snooze-form label {
  width: min(100%, 290px);
}
.backup-panel {
  margin-top: 30px;
  border-top: 1px solid var(--border);
  padding-top: 24px;
}
.backup-panel h2 {
  font-size: 18px;
}
.backup-panel p {
  color: var(--ink-muted);
  font-size: 13px;
  line-height: 1.7;
}
.backup-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 18px;
}
.empty {
  text-align: center;
  padding: 38px 20px;
  color: var(--ink-muted);
  background: var(--surface);
  border-radius: 12px;
}
@media (max-width: 700px) {
  .reminder-center {
    padding: 20px 14px;
  }
  .filters {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .reminder-card {
    grid-template-columns: 1fr;
    padding: 16px;
  }
  .actions {
    max-width: none;
  }
  .snooze-form label {
    width: 100%;
  }
  .backup-actions button {
    flex: 1 1 140px;
  }
}
</style>
