<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import type { DataHealthStatus } from '@/types/data-health'
import snapshots from 'virtual:data-health'
import ResearchPageHeader from '@/components/research/ResearchPageHeader.vue'
import { useI18n } from '@/composables/use-i18n'
import { dataHealthStatus } from '@/utils/data-health'
import { getDataScheduleState } from '@/utils/data-schedule'

const { locale } = useI18n()
const en = computed(() => locale.value === 'en')
const now = ref(new Date())
const filter = ref<DataHealthStatus | ''>('')
const query = ref('')
const labels = computed(() =>
  en.value
    ? {
        current: 'Within schedule',
        overdue: 'Past expected update',
        attention: 'Source needs attention',
        unavailable: 'Missing / unavailable',
      }
    : {
        current: '未超过预期更新',
        overdue: '超过预期更新',
        attention: '来源需关注',
        unavailable: '缺失或不可用',
      },
)
const rows = computed(() =>
  snapshots.map((snapshot) => ({
    ...snapshot,
    status: dataHealthStatus(snapshot, now.value),
    scheduleState: getDataScheduleState(snapshot.updatedAt ?? '', snapshot.schedule, now.value),
  })),
)
const counts = computed(() =>
  Object.fromEntries(
    Object.keys(labels.value).map((status) => [
      status,
      rows.value.filter((row) => row.status === status).length,
    ]),
  ),
)
const visible = computed(() =>
  rows.value.filter(
    (row) =>
      (!filter.value || row.status === filter.value) &&
      `${row.title} ${row.titleEn} ${row.id}`
        .toLowerCase()
        .includes(query.value.trim().toLowerCase()),
  ),
)
const formatDate = (date: string | Date | null) =>
  date
    ? new Intl.DateTimeFormat(en.value ? 'en-GB' : 'zh-CN', {
        timeZone: 'Asia/Shanghai',
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(date))
    : '—'
const workflowUrl = (workflow: string) =>
  `https://github.com/aTong9/web3/actions/workflows/update-${workflow}.yml`
const issueText = (issue: string) => {
  if (issue === 'missing-time')
    return en.value ? 'No valid data timestamp' : '没有有效的数据更新时间'
  if (issue === 'empty') return en.value ? 'Primary collection is empty' : '主要记录集合为空'
  return `${en.value ? 'Missing collection' : '缺少集合'}: ${issue.split(':').slice(1).join(':')}`
}
const exportReport = () => {
  const url = URL.createObjectURL(
    new Blob(
      [
        JSON.stringify(
          { checkedAt: now.value.toISOString(), scope: 'bundled-snapshots', snapshots: rows.value },
          null,
          2,
        ),
      ],
      { type: 'application/json' },
    ),
  )
  const link = document.createElement('a')
  link.href = url
  link.download = 'data-health-report.json'
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  timer = setInterval(() => {
    now.value = new Date()
  }, 60_000)
})
onUnmounted(() => clearInterval(timer))
</script>

<template>
  <main class="health-page">
    <ResearchPageHeader
      eyebrow="DATA HEALTH"
      :title="en ? 'Data health center' : '数据健康中心'"
      :description="
        en
          ? 'Check the timestamps, coverage and source states of this application’s bundled snapshots.'
          : '集中检查当前应用随包快照的更新时间、记录覆盖和来源状态。'
      "
    />
    <p class="scope-note">
      {{
        en
          ? 'This checks local snapshot metadata, not live Actions runs or every quote. Expected times use repository schedules with a 10-minute grace period; holidays and task delays may affect availability. Reloading this page does not run a data update.'
          : '检查对象是当前版本的快照元数据，不代表实时 Actions 状态，也未校验每个行情值。预期时间按仓库排程加 10 分钟宽限计算，假期与任务延迟可能影响可用性；重新打开页面不会执行数据更新。'
      }}
    </p>
    <section class="health-summary" :aria-label="en ? 'Status summary' : '状态汇总'">
      <button
        v-for="(label, status) in labels"
        :key="status"
        :class="{ selected: filter === status }"
        :aria-pressed="filter === status"
        @click="filter = filter === status ? '' : status"
      >
        <strong>{{ counts[status] }}</strong
        ><span>{{ label }}</span>
      </button>
    </section>
    <div class="health-toolbar">
      <label
        >{{ en ? 'Search datasets' : '搜索数据集'
        }}<input v-model="query" type="search" :aria-label="en ? 'Search datasets' : '搜索数据集'"
      /></label>
      <label
        >{{ en ? 'Status' : '状态'
        }}<select v-model="filter" :aria-label="en ? 'Status' : '状态'">
          <option value="">{{ en ? 'All states' : '全部状态' }}</option>
          <option v-for="(label, status) in labels" :key="status" :value="status">
            {{ label }}
          </option>
        </select></label
      >
      <button @click="exportReport">{{ en ? 'Export check report' : '导出检查报告' }}</button>
    </div>
    <p class="meta">
      {{ en ? 'Beijing time · checked' : '北京时间 · 检查时间' }} {{ formatDate(now) }} ·
      {{ visible.length }} / {{ snapshots.length }}
    </p>
    <p v-if="!visible.length" role="status">
      {{ en ? 'No matching datasets.' : '没有匹配的数据集。' }}
    </p>
    <section class="health-grid">
      <article v-for="row in visible" :key="row.id" class="health-card" :data-status="row.status">
        <header>
          <h2>{{ en ? row.titleEn : row.title }}</h2>
          <span class="status-badge">{{ labels[row.status] }}</span>
        </header>
        <dl>
          <div>
            <dt>{{ en ? 'Snapshot data time' : '快照数据时间' }}</dt>
            <dd>{{ formatDate(row.updatedAt) }}</dd>
          </div>
          <div>
            <dt>{{ en ? 'Primary records' : '主要记录数' }}</dt>
            <dd>{{ row.count ?? '—' }}</dd>
          </div>
          <div>
            <dt>{{ en ? 'Expected after snapshot' : '快照后预期更新' }}</dt>
            <dd>{{ formatDate(row.scheduleState.expected) }}</dd>
          </div>
          <div>
            <dt>{{ en ? 'Next scheduled slot' : '下一排程时点' }}</dt>
            <dd>{{ formatDate(row.scheduleState.next) }}</dd>
          </div>
          <div v-if="row.attemptedAt">
            <dt>{{ en ? 'Last recorded attempt' : '快照记载尝试时间' }}</dt>
            <dd>{{ formatDate(row.attemptedAt) }}</dd>
          </div>
        </dl>
        <p v-if="row.scheduleState.pending" class="attention">
          {{
            en
              ? 'The expected update is missing from this bundle; check Actions and deployment before diagnosing a failed job.'
              : '当前版本未包含预期更新；需结合 Actions 与部署结果判断原因。'
          }}
        </p>
        <ul v-if="row.issues.length">
          <li v-for="issue in row.issues" :key="issue">{{ issueText(issue) }}</li>
        </ul>
        <p
          v-if="row.updatedAt && Date.parse(row.updatedAt) > now.getTime() + 600_000"
          class="attention"
        >
          {{
            en
              ? 'Timestamp is in the future. Check clock and data generation.'
              : '时间戳位于未来，请核对时钟和数据生成时间。'
          }}
        </p>
        <details v-if="row.sourceIssues.length">
          <summary>
            {{ en ? 'Reported source / item states' : '快照报告的来源 / 条目状态' }} ·
            {{ row.sourceIssues.length }}
          </summary>
          <ul>
            <li v-for="issue in row.sourceIssues" :key="issue">{{ issue }}</li>
          </ul>
        </details>
        <p v-if="row.source" class="source">{{ row.source }}</p>
        <footer>
          <RouterLink :to="row.route">{{ en ? 'Open module' : '查看模块' }} ↗</RouterLink
          ><a :href="workflowUrl(row.workflow)" target="_blank" rel="noopener noreferrer"
            >Actions ↗</a
          ><a v-if="row.sourceUrl" :href="row.sourceUrl" target="_blank" rel="noopener noreferrer"
            >{{ en ? 'Source' : '来源' }} ↗</a
          >
        </footer>
      </article>
    </section>
    <p class="scope-note">
      {{
        en
          ? 'Coverage: 19 scheduled market snapshots. The live quote service, authenticated Worker, manually curated resource catalog, official calendar and personal browser records are outside this check. Fund technicals are also updated by the A-share workflow.'
          : '覆盖范围：19 份定时市场快照。实时行情服务、登录后的 Worker、人工维护的资源目录、官方日历和个人浏览器记录不在本检查内；基金技术信号同时由 A 股工作流更新。'
      }}
    </p>
  </main>
</template>

<style scoped>
.health-page {
  max-width: var(--content-workbench);
  margin: 0 auto;
  padding: var(--space-section) var(--page-gutter) 70px;
  color: var(--ink);
}
.scope-note,
.meta,
.source {
  color: var(--muted);
  font-size: 12px;
  line-height: 1.8;
}
.health-summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin: 20px 0;
}
.health-summary button {
  text-align: left;
  padding: 20px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  color: var(--ink);
}
.health-summary .selected {
  outline: 2px solid var(--accent);
}
.health-summary strong,
.health-summary span {
  display: block;
}
.health-summary strong {
  font-size: 28px;
  margin-bottom: 8px;
}
.health-summary span {
  font-size: 12px;
}
.health-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: end;
}
.health-toolbar label {
  display: grid;
  gap: 6px;
  font-size: 12px;
  flex: 1;
  min-width: 180px;
}
input,
select,
.health-toolbar button {
  min-height: 42px;
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  color: var(--ink);
}
input,
select {
  width: 100%;
  min-width: 0;
}
button:focus-visible,
a:focus-visible,
summary:focus-visible,
input:focus-visible,
select:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}
.health-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
.health-card {
  min-width: 0;
  padding: 20px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow-wrap: anywhere;
}
.health-card header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}
h2 {
  font-size: 17px;
  margin: 0;
}
.status-badge {
  background: var(--surface-soft);
  padding: 4px 8px;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 11px;
}
.health-card[data-status='current'] .status-badge {
  color: var(--accent);
}
dl {
  margin: 16px 0;
  font-size: 12px;
}
dl div {
  display: flex;
  gap: 12px;
  justify-content: space-between;
  margin-bottom: 8px;
}
dt {
  font-weight: 400;
  color: var(--muted);
}
dd {
  margin: 0;
  text-align: right;
}
.attention,
details,
li {
  font-size: 12px;
  line-height: 1.7;
}
details {
  padding: 10px;
  background: var(--surface-soft);
  border-radius: 6px;
}
summary {
  cursor: pointer;
}
ul {
  padding-left: 20px;
  margin-bottom: 4px;
}
footer {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  border-top: 1px solid var(--border);
  padding-top: 12px;
  margin-top: 14px;
  font-size: 12px;
}
a {
  color: var(--accent);
}
@media (max-width: 720px) {
  .health-summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .health-summary button {
    padding: 14px;
  }
  .health-grid {
    grid-template-columns: minmax(0, 1fr);
  }
  .health-card {
    padding: 16px;
  }
}
</style>
