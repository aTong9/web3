<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import type { CalendarEvent, CalendarEventType, CalendarTimeZone } from '@/types/event-calendar'
import ResearchPageHeader from '@/components/research/ResearchPageHeader.vue'
import { useI18n } from '@/composables/use-i18n'
import { useResearchWorkspace } from '@/composables/use-research-workspace'
import {
  macroCalendarCheckedAt,
  macroCalendarCoverageEnd,
  macroCalendarEvents,
} from '@/data/macro-calendar'
import megaCaps from '@/data/us-megacaps.json'
import {
  buildEarningsCalendar,
  calendarDateInZone,
  calendarEventDate,
  calendarEventInstant,
  calendarEventIsPast,
  calendarEventsToIcs,
  deduplicateCalendarEvents,
  filterCalendarEvents,
  isCalendarDate,
} from '@/utils/event-calendar'

const { locale } = useI18n()
const en = computed(() => locale.value === 'en')
const { workspace, storageError, reload } = useResearchWorkspace()
const now = ref(new Date())
const timeZone = ref<CalendarTimeZone>('Asia/Shanghai')
const shiftedDate = (days: number) =>
  calendarDateInZone(new Date(now.value.getTime() + days * 86_400_000), timeZone.value)
const start = ref(shiftedDate(0))
const end = ref(shiftedDate(62))
const type = ref<CalendarEventType | 'all'>('all')
const query = ref('')
const onlyWatched = ref(false)
const exportMessage = ref('')
const earnings = buildEarningsCalendar(megaCaps.stocks, megaCaps.updatedAt)
const events = deduplicateCalendarEvents([...macroCalendarEvents, ...earnings.events])
const watchedIds = computed(() => workspace.value.watchlist.map((entry) => entry.assetId))
const invalidRange = computed(
  () => !isCalendarDate(start.value) || !isCalendarDate(end.value) || start.value > end.value,
)
const filtered = computed(() =>
  invalidRange.value
    ? []
    : filterCalendarEvents(events, {
        start: start.value,
        end: end.value,
        type: type.value,
        query: query.value,
        onlyWatched: onlyWatched.value,
        watchedIds: watchedIds.value,
        timeZone: timeZone.value,
      }),
)
const groups = computed(() => {
  const result = new Map<string, CalendarEvent[]>()
  for (const event of filtered.value) {
    const date = calendarEventDate(event, timeZone.value)
    result.set(date, [...(result.get(date) ?? []), event])
  }
  return [...result].map(([date, items]) => ({ date, items }))
})
const undated = computed(() =>
  earnings.undated.filter(
    (company) =>
      (type.value === 'all' || type.value === 'earnings') &&
      (!onlyWatched.value || watchedIds.value.includes(`us-${company.symbol.toLowerCase()}`)) &&
      `${company.symbol} ${company.name}`
        .toLocaleLowerCase()
        .includes(query.value.trim().toLocaleLowerCase()),
  ),
)
const coverageWarning = computed(
  () => end.value > macroCalendarCoverageEnd || start.value < macroCalendarCheckedAt,
)
const staleSchedule = computed(
  () => now.value.getTime() - Date.parse(`${macroCalendarCheckedAt}T00:00:00Z`) > 14 * 86_400_000,
)
const typeLabels = computed(() =>
  en.value
    ? {
        all: 'All events',
        fomc: 'FOMC',
        inflation: 'CPI',
        employment: 'Employment',
        gdp: 'GDP',
        pce: 'PCE',
        earnings: 'Earnings',
      }
    : {
        all: '全部事件',
        fomc: 'FOMC 会议',
        inflation: 'CPI 通胀',
        employment: '就业报告',
        gdp: 'GDP',
        pce: 'PCE',
        earnings: '公司财报',
      },
)
const statusLabel = (event: CalendarEvent) => {
  if (event.status === 'reported') return en.value ? 'Reported · aggregator' : '已报告 · 聚合记录'
  if (calendarEventIsPast(event, now.value))
    return en.value ? 'Scheduled time passed · release unverified' : '计划时间已过 · 发布待核验'
  return event.certainty === 'estimated'
    ? en.value
      ? 'Estimated date'
      : '预计日期'
    : en.value
      ? 'Official schedule'
      : '官方计划'
}
const timeLabel = (event: CalendarEvent) => {
  const instant = calendarEventInstant(event)
  return instant
    ? new Intl.DateTimeFormat(en.value ? 'en-US' : 'zh-CN', {
        timeZone: timeZone.value,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZoneName: 'short',
      }).format(instant)
    : en.value
      ? 'Date only · time unknown'
      : '仅日期 · 具体时间未知'
}
const setRange = (days: number) => {
  start.value = shiftedDate(days < 0 ? days : 0)
  end.value = shiftedDate(days < 0 ? 0 : days)
}
const exportCalendar = () => {
  if (!filtered.value.length || invalidRange.value) return
  const blob = new Blob([calendarEventsToIcs(filtered.value, en.value)], {
    type: 'text/calendar;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `research-events-${start.value}-${end.value}.ics`
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  exportMessage.value = en.value
    ? 'Calendar file created. Import it into your calendar app; this is a snapshot, not a subscription.'
    : '日历文件已生成，可导入日历应用；这是当前快照，不会自动订阅更新。'
}
let timer: number | undefined
const refreshWatchlist = (event: StorageEvent) => {
  if (event.key === 'market-desk-research-workspace-v1' || event.key === null) reload()
}
onMounted(() => {
  timer = window.setInterval(() => {
    now.value = new Date()
  }, 60_000)
  window.addEventListener('storage', refreshWatchlist)
})
onUnmounted(() => {
  window.clearInterval(timer)
  window.removeEventListener('storage', refreshWatchlist)
})
</script>

<template>
  <main class="event-calendar">
    <ResearchPageHeader
      eyebrow="ECONOMIC CALENDAR"
      :title="en ? 'Macro & earnings calendar' : '宏观与财报日历'"
      :description="
        en
          ? 'Prepare for official economic releases and company earnings, with clear dates and sources.'
          : '提前安排宏观发布与财报研究，核对每一条事件的时间、来源与确认状态。'
      "
    >
      <template #status
        ><div class="event-summary">
          <strong>{{ filtered.length }}</strong
          ><span>{{ en ? 'dated events in view' : '条日期明确的事件' }}</span>
        </div></template
      >
    </ResearchPageHeader>

    <section class="calendar-evidence" :aria-label="en ? 'Data coverage' : '数据范围'">
      <p>
        {{ en ? 'Official macro schedules checked' : '宏观官方日程核对于' }}
        <b>{{ macroCalendarCheckedAt }}</b> · {{ en ? 'Coverage through' : '覆盖至' }}
        <b>{{ macroCalendarCoverageEnd }}</b>
      </p>
      <p>
        {{ en ? 'Earnings snapshot' : '财报快照更新于' }}
        <time>{{ megaCaps.updatedAt.slice(0, 10) }}</time> ·
        {{
          en
            ? 'Upcoming earnings dates are aggregator estimates, not company confirmations.'
            : '未来财报日期为聚合来源预计，并非公司官方确认。'
        }}
      </p>
      <p>
        {{
          en
            ? 'Date-only events keep their source date in every time zone. A passed date does not confirm publication or an actual value.'
            : '仅日期事件始终保留来源日期，不随时区转换。计划时间经过，不等于数据已发布或实际值已确认。'
        }}
      </p>
    </section>

    <form class="calendar-filters" @submit.prevent>
      <label>{{ en ? 'From' : '开始日期' }}<input v-model="start" type="date" required /></label>
      <label>{{ en ? 'Through' : '结束日期' }}<input v-model="end" type="date" required /></label>
      <label
        >{{ en ? 'Event type' : '事件类型'
        }}<select v-model="type">
          <option v-for="(label, key) in typeLabels" :key="key" :value="key">{{ label }}</option>
        </select></label
      >
      <label
        >{{ en ? 'Display time zone' : '显示时区'
        }}<select v-model="timeZone">
          <option value="Asia/Shanghai">
            {{ en ? 'Beijing · Asia/Shanghai' : '北京时间 · Asia/Shanghai' }}
          </option>
          <option value="America/New_York">
            {{ en ? 'New York · US Eastern' : '纽约 · 美国东部时间' }}
          </option>
          <option value="UTC">UTC</option>
        </select></label
      >
      <label class="event-search"
        >{{ en ? 'Search' : '搜索事件'
        }}<input
          v-model="query"
          type="search"
          :placeholder="en ? 'CPI, AAPL, company or source' : 'CPI、AAPL、公司名称或来源'"
      /></label>
      <label class="watch-toggle"
        ><input v-model="onlyWatched" type="checkbox" />{{
          en ? 'Related to my watchlist' : '仅显示自选关联'
        }}</label
      >
    </form>
    <div class="calendar-actions">
      <RouterLink to="/reminders">{{ en ? 'Reminder center' : '统一提醒' }} ↗</RouterLink>
      <div>
        <button type="button" @click="setRange(7)">{{ en ? 'Next 7 days' : '未来 7 天' }}</button
        ><button type="button" @click="setRange(62)">
          {{ en ? 'Next 2 months' : '未来两个月' }}</button
        ><button type="button" @click="setRange(-90)">
          {{ en ? 'Past 90 days' : '过去 90 天' }}
        </button>
      </div>
      <button
        type="button"
        :disabled="!filtered.length"
        class="export-calendar"
        @click="exportCalendar"
      >
        {{ en ? 'Export filtered events · ICS' : '导出筛选结果 · ICS' }}
      </button>
    </div>
    <p v-if="invalidRange" class="calendar-notice error" role="alert">
      {{
        en
          ? 'Choose valid dates with the start on or before the end.'
          : '请选择有效日期，开始日期不能晚于结束日期。'
      }}
    </p>
    <p v-if="coverageWarning || staleSchedule" class="calendar-notice" role="status">
      {{
        en
          ? 'This is a checked schedule snapshot. Macro coverage is limited to September 26–November 30, 2026; confirm changes at the official source.'
          : '当前为核对后的日程快照。宏观覆盖范围为 2026-09-26 至 2026-11-30，范围外或核对较久的日程请到官方来源复核。'
      }}
    </p>
    <p v-if="storageError" class="calendar-notice error" role="alert">
      {{ en ? 'Could not read your watchlist.' : '无法读取本地自选记录。' }}
      <button type="button" @click="reload">{{ en ? 'Retry' : '重试读取' }}</button>
    </p>
    <p v-if="onlyWatched" class="calendar-notice">
      {{
        en
          ? 'Company events match the ticker. Macro events relate broadly to watched US stocks, major US indices, rates, USD, gold, BTC and ETH; this is research context, not a predicted impact.'
          : '财报按股票代码匹配；宏观事件关联自选中的美股、主要美股指数、美债、美元、黄金、BTC 与 ETH，关联仅表示研究范围，不预测涨跌。'
      }}
      <RouterLink to="/research-workspace">{{ en ? 'Manage watchlist' : '管理自选' }}</RouterLink>
    </p>
    <p v-if="exportMessage" class="calendar-notice" role="status">{{ exportMessage }}</p>

    <div v-if="!groups.length" class="empty-calendar">
      <h2>{{ en ? 'No events match these filters' : '当前筛选没有事件' }}</h2>
      <p>
        {{
          en
            ? 'Try a wider date range or turn off the watchlist filter.'
            : '可扩大日期范围，或关闭仅自选关联。'
        }}
      </p>
    </div>
    <section v-for="group in groups" :key="group.date" class="event-day" :aria-label="group.date">
      <h2>
        <time :datetime="group.date">{{ group.date }}</time
        ><span>{{ group.items.length }} {{ en ? 'events' : '条事件' }}</span>
      </h2>
      <article
        v-for="event in group.items"
        :key="event.id"
        class="calendar-event"
        :data-event-id="event.id"
      >
        <div class="event-time">
          <strong>{{ timeLabel(event) }}</strong
          ><small>{{
            event.time
              ? en
                ? `Source: ${event.date} ${event.time} US Eastern`
                : `来源时间：${event.date} ${event.time} 纽约`
              : en
                ? 'Source calendar date'
                : '来源日历日期'
          }}</small>
        </div>
        <div class="event-copy">
          <div class="event-badges">
            <span>{{ typeLabels[event.type] }}</span
            ><span :class="{ estimated: event.certainty === 'estimated' }">{{
              statusLabel(event)
            }}</span>
          </div>
          <h3>{{ en ? event.titleEn : event.title }}</h3>
          <p>{{ en ? event.detailsEn : event.details }}</p>
          <div class="event-source">
            <a :href="event.sourceUrl" target="_blank" rel="noopener noreferrer"
              >{{ event.source }} ↗</a
            ><span>{{ en ? 'Checked / snapshot' : '核对 / 快照日期' }} {{ event.checkedAt }}</span
            ><RouterLink
              v-if="event.type === 'earnings'"
              :to="{
                path: '/research-workspace',
                query: { asset: event.assetIds[0], tab: 'notes' },
              }"
              >{{ en ? 'Record research' : '记录研究' }}</RouterLink
            >
          </div>
        </div>
      </article>
    </section>
    <section v-if="undated.length" class="undated-events">
      <h2>
        {{ en ? 'Next earnings date unknown' : '下次财报日期待定' }}
        <span>{{ undated.length }}</span>
      </h2>
      <p>
        {{
          en
            ? 'These companies have no valid upcoming date in the snapshot. They are outside the date filter and ICS export.'
            : '以下公司快照中没有有效的下次财报日期，未纳入日期筛选与 ICS 导出。'
        }}
      </p>
      <ul>
        <li v-for="company in undated" :key="company.symbol">
          <b>{{ company.symbol }}</b> {{ company.name }}
          <a :href="company.url" target="_blank" rel="noopener noreferrer">Nasdaq ↗</a>
        </li>
      </ul>
    </section>
  </main>
</template>

<style scoped>
.event-calendar {
  max-width: var(--content-workbench);
  margin: 0 auto;
  padding: var(--space-section) var(--page-gutter) 64px;
  color: var(--ink);
}
.event-summary {
  display: grid;
  gap: 4px;
}
.event-summary strong {
  font-size: 32px;
  font-variant-numeric: tabular-nums;
}
.event-summary span {
  font-size: 12px;
}
.calendar-evidence {
  margin-bottom: 24px;
  padding: 16px 20px;
  background: var(--surface-soft);
  border: 1px solid var(--border);
  border-radius: 10px;
}
.calendar-evidence p {
  margin: 0 0 6px;
  font-size: 12px;
  color: var(--muted);
  line-height: 1.7;
}
.calendar-evidence p:last-child {
  margin: 0;
}
.calendar-evidence b {
  color: var(--ink);
}
.calendar-filters {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}
.calendar-filters label {
  display: grid;
  gap: 6px;
  min-width: 0;
  font-size: 12px;
  font-weight: 600;
}
.calendar-filters input,
.calendar-filters select {
  width: 100%;
  min-width: 0;
  min-height: 42px;
  padding: 8px 10px;
  color: var(--ink);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 7px;
  font: inherit;
}
.calendar-filters .event-search {
  grid-column: span 2;
}
.calendar-filters .watch-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  grid-column: span 2;
}
.watch-toggle input {
  width: 18px;
  min-height: 18px;
  accent-color: var(--accent);
}
.calendar-actions {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin: 16px 0 24px;
}
.calendar-actions > div {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.calendar-actions button,
.calendar-notice button {
  min-height: 40px;
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--surface);
  color: var(--ink);
  font: inherit;
  font-size: 12px;
}
.calendar-actions .export-calendar {
  background: var(--accent);
  color: var(--on-accent);
  border-color: var(--accent);
}
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
button:not(:disabled) {
  cursor: pointer;
}
.calendar-notice {
  margin: 12px 0;
  padding: 12px 16px;
  background: var(--surface-soft);
  border-left: 3px solid var(--warning);
  font-size: 12px;
  line-height: 1.8;
}
.calendar-notice.error {
  border-color: var(--negative);
}
.event-day {
  margin-top: 28px;
}
.event-day > h2 {
  display: flex;
  align-items: baseline;
  gap: 14px;
  margin: 0 0 10px;
  font-size: 20px;
  font-variant-numeric: tabular-nums;
}
.event-day > h2 span {
  color: var(--muted);
  font-size: 12px;
  font-weight: 400;
}
.calendar-event {
  display: grid;
  grid-template-columns: minmax(180px, 0.28fr) minmax(0, 1fr);
  gap: 24px;
  padding: 20px;
  border: 1px solid var(--border);
  background: var(--surface);
  border-radius: 10px;
  margin-bottom: 8px;
}
.event-time {
  display: grid;
  align-content: start;
  gap: 8px;
  font-variant-numeric: tabular-nums;
}
.event-time strong {
  font-size: 15px;
}
.event-time small {
  color: var(--muted);
  font-size: 11px;
  line-height: 1.6;
}
.event-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  color: var(--muted);
  font-size: 11px;
}
.event-badges span {
  padding: 3px 7px;
  background: var(--surface-soft);
  border-radius: 4px;
}
.event-badges .estimated {
  color: var(--warning);
}
.event-copy h3 {
  margin: 10px 0 7px;
  font-size: 17px;
  line-height: 1.5;
}
.event-copy p {
  margin: 0 0 10px;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.8;
}
.event-source {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 11px;
  color: var(--muted);
}
a {
  color: var(--accent);
  text-underline-offset: 3px;
}
.empty-calendar {
  padding: 48px 24px;
  text-align: center;
  border: 1px dashed var(--border);
  border-radius: 10px;
}
.empty-calendar h2,
.undated-events h2 {
  font-size: 18px;
}
.empty-calendar p,
.undated-events p {
  color: var(--muted);
  font-size: 12px;
  line-height: 1.8;
}
.undated-events {
  margin-top: 32px;
  padding: 20px;
  background: var(--surface-soft);
  border-radius: 10px;
}
.undated-events ul {
  padding-left: 20px;
  margin-bottom: 0;
}
.undated-events li {
  padding: 6px 0;
  font-size: 12px;
  overflow-wrap: anywhere;
}
@media (max-width: 760px) {
  .calendar-filters {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .calendar-event {
    grid-template-columns: minmax(0, 1fr);
    gap: 14px;
    padding: 16px;
  }
  .event-time {
    border-bottom: 1px solid var(--border);
    padding-bottom: 12px;
  }
  .event-day > h2 {
    font-size: 18px;
  }
}
@media (max-width: 420px) {
  .calendar-filters {
    grid-template-columns: minmax(0, 1fr);
  }
  .calendar-filters .event-search,
  .calendar-filters .watch-toggle {
    grid-column: auto;
  }
  .calendar-actions .export-calendar {
    width: 100%;
  }
}
</style>
