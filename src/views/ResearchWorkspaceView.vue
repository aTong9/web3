<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { RouterLink, onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import type { ResearchAsset, ResearchNote, ResearchWatchEntry } from '@/types'
import ResearchPageHeader from '@/components/research/ResearchPageHeader.vue'
import MarketQuoteStatus from '@/components/MarketQuoteStatus.vue'
import { useI18n } from '@/composables/use-i18n'
import { useMarketQuotes } from '@/composables/use-market-quotes'
import { useResearchWorkspace } from '@/composables/use-research-workspace'
import { researchAssets } from '@/utils/research-assets'
import {
  isResearchNoteDue,
  mergeResearchWorkspaces,
  parseResearchWorkspace,
} from '@/utils/research-workspace'
import { createResourceMatcher } from '@/utils/resource-search'

const { locale } = useI18n()
const route = useRoute()
const router = useRouter()
const { workspace, storageError, commit, reload } = useResearchWorkspace()
const en = computed(() => locale.value === 'en')
const text = computed(() =>
  en.value
    ? {
        title: 'My research workspace',
        intro: 'Follow assets, capture a thesis, and return to the evidence.',
        watches: 'Watchlist',
        notes: 'Research notes',
        due: 'Due for review',
        groups: 'Groups',
        local:
          'Saved in this browser. Export a backup before switching devices or clearing browser data.',
        search: 'Search assets, groups or notes',
        all: 'All groups',
        allNotes: 'All notes',
        active: 'Tracking',
        reviewed: 'Reviewed',
        invalidated: 'Invalidated',
        addWatch: 'Follow an asset',
        editWatch: 'Edit watch',
        asset: 'Asset',
        group: 'Group',
        reason: 'Reason to follow',
        save: 'Save',
        cancel: 'Cancel',
        edit: 'Edit',
        remove: 'Remove',
        newNote: 'New note',
        editNote: 'Edit note',
        noteTitle: 'Title',
        thesis: 'Thesis and evidence',
        sources: 'Sources (one HTTP(S) URL per line)',
        invalidation: 'What would invalidate this thesis?',
        reviewDate: 'Review date',
        status: 'Status',
        conclusion: 'Review conclusion',
        paper: 'Paper record ID (optional)',
        paperHint: 'A reference only; this does not change a trade.',
        export: 'Export backup',
        import: 'Merge backup',
        saved: 'Saved to this browser.',
        imported: 'Backup merged and saved.',
        failed: 'Could not save. Your draft remains here.',
        invalid: 'Invalid data. Check dates, field lengths and source URLs.',
        loadError:
          'Stored data could not be read. It has not been overwritten. Restore access or repair the original backup before saving.',
        saveError: 'Browser storage is unavailable or full. Your draft has been kept.',
        conflict:
          'Another tab changed these records. Reload saved records before saving your draft.',
        reload: 'Reload saved records',
        emptyWatch: 'Start with one asset worth following.',
        emptyWatchHint: 'Choose an asset, give it a group, and write down why it matters.',
        emptyNotes: 'No notes in this view.',
        emptyNotesHint: 'Record a thesis and the evidence that could change it.',
        noMatch: 'No matching records. Try another filter.',
        snapshot: 'Snapshot',
        source: 'Source',
        charts: 'Charts & alerts',
        news: 'Search news',
        quant: 'Quant signals',
        paperLink: 'Open paper journal',
        write: 'Write a note',
        none: 'Not set',
        unknown: 'Asset no longer in the current catalog',
        removeWatch: 'Remove this watch? Its research notes will be kept.',
        removeNote: 'Delete this note permanently? Export a backup first if you need it.',
        discard: 'Discard the unsaved draft?',
        quoteLimit:
          'Latest quotes cover up to 25 listed instruments. Other values remain dated snapshots.',
        dueOnly: 'Due for review',
        groupPlaceholder: 'e.g. Long-term research',
        reasonPlaceholder: 'Why follow this asset? What will you check next?',
        date: 'Updated',
        catalog: 'Current catalog',
        backupError: 'Could not read this backup. Existing records were kept.',
        unknownRoute:
          'This asset is not in the current catalog. You can still manage existing notes for it.',
      }
    : {
        title: '我的研究台',
        intro: '把关注的资产、研究依据与复查计划放在一起，持续检验自己的判断。',
        watches: '自选资产',
        notes: '研究笔记',
        due: '待复查',
        groups: '关注分组',
        local: '记录保存在当前浏览器。更换设备或清理浏览器前，请先导出备份。',
        search: '搜索资产、分组或笔记',
        all: '全部分组',
        allNotes: '全部笔记',
        active: '跟踪中',
        reviewed: '已复盘',
        invalidated: '已失效',
        addWatch: '添加关注',
        editWatch: '编辑关注',
        asset: '资产',
        group: '分组',
        reason: '关注理由',
        save: '保存',
        cancel: '取消编辑',
        edit: '编辑',
        remove: '移除',
        newNote: '新建笔记',
        editNote: '编辑笔记',
        noteTitle: '笔记标题',
        thesis: '研究观点与依据',
        sources: '来源链接（每行一个 HTTP(S) 网址）',
        invalidation: '什么情况会让这个观点失效？',
        reviewDate: '复查日期',
        status: '状态',
        conclusion: '复盘结论',
        paper: '模拟记录 ID（可选）',
        paperHint: '仅保存关联引用，不会修改交易记录。',
        export: '导出备份',
        import: '合并导入',
        saved: '已保存到当前浏览器。',
        imported: '备份已合并并保存。',
        failed: '未能保存，草稿仍保留在编辑区。',
        invalid: '数据格式不正确，请检查日期、字段长度与来源网址。',
        loadError: '无法读取已有记录，原始数据未被覆盖。请恢复存储访问或修复原始备份后再保存。',
        saveError: '浏览器存储不可用或空间不足，草稿已保留。',
        conflict: '其他标签页已更新记录。请重新载入已保存记录，再保存当前草稿。',
        reload: '重新载入已保存记录',
        emptyWatch: '从一个值得持续关注的资产开始',
        emptyWatchHint: '选择资产，给它一个分组，写下你想跟踪的原因。',
        emptyNotes: '当前没有笔记',
        emptyNotesHint: '记录你的观点，以及可能改变判断的证据。',
        noMatch: '没有匹配的记录，请调整筛选。',
        snapshot: '快照',
        source: '来源',
        charts: '走势与预警',
        news: '检索相关资讯',
        quant: '量化信号',
        paperLink: '查看模拟账本',
        write: '写研究笔记',
        none: '未设置',
        unknown: '当前目录已无此资产',
        removeWatch: '移除此关注？相关研究笔记仍会保留。',
        removeNote: '永久删除这条笔记？如需保留，请先导出备份。',
        discard: '放弃尚未保存的草稿？',
        quoteLimit: '最新报价最多覆盖当前列表的 25 个标的；其他数值保留带日期的快照。',
        dueOnly: '待复查',
        groupPlaceholder: '例如：长期研究',
        reasonPlaceholder: '为什么关注它？下一步要核实什么？',
        date: '更新于',
        catalog: '当前可选资产',
        backupError: '无法读取该备份，已有记录未被更改。',
        unknownRoute: '该资产不在当前目录中，仍可管理此前记录的相关笔记。',
      },
)
const assetMap = new Map(researchAssets.map((asset) => [asset.id, asset]))
const tab = ref<'watchlist' | 'notes'>(route.query.tab === 'notes' ? 'notes' : 'watchlist')
const query = ref('')
const groupFilter = ref('')
const noteFilter = ref('all')
const selectedNoteAsset = ref('')
const message = ref('')
const formError = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const watchEditor = ref<HTMLElement | null>(null)
const noteEditor = ref<HTMLElement | null>(null)
const dateToday = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}
const today = ref(dateToday())
let dateTimer: number | undefined
onMounted(() => {
  dateTimer = window.setInterval(() => {
    today.value = dateToday()
  }, 60_000)
})
onUnmounted(() => window.clearInterval(dateTimer))
const dueNotes = computed(() =>
  workspace.value.notes.filter((note) => isResearchNoteDue(note, today.value)),
)
const groups = computed(() =>
  [...new Set(workspace.value.watchlist.map((entry) => entry.group))].sort(),
)
const filteredWatches = computed(() => {
  const matches = createResourceMatcher(query.value)
  return workspace.value.watchlist
    .filter((entry) => {
      const asset = assetMap.get(entry.assetId)
      return (
        (!groupFilter.value || groupFilter.value === entry.group) &&
        matches(asset?.name, asset?.symbol, entry.assetId, entry.group, entry.reason)
      )
    })
    .sort((a, b) => a.group.localeCompare(b.group) || b.updatedAt.localeCompare(a.updatedAt))
})
const filteredNotes = computed(() => {
  const matches = createResourceMatcher(query.value)
  return workspace.value.notes
    .filter(
      (note) =>
        (!selectedNoteAsset.value || selectedNoteAsset.value === note.assetId) &&
        (noteFilter.value === 'all' ||
          (noteFilter.value === 'due'
            ? isResearchNoteDue(note, today.value)
            : note.status === noteFilter.value)) &&
        matches(
          note.title,
          note.thesis,
          note.conclusion,
          assetMap.get(note.assetId)?.name,
          note.assetId,
        ),
    )
    .sort(
      (a, b) =>
        Number(isResearchNoteDue(b, today.value)) - Number(isResearchNoteDue(a, today.value)) ||
        b.updatedAt.localeCompare(a.updatedAt),
    )
})
const quoteSymbols = computed(() =>
  filteredWatches.value
    .map((entry) => assetMap.get(entry.assetId)?.quoteSymbol)
    .filter((symbol): symbol is string => Boolean(symbol))
    .slice(0, 25),
)
const { quoteFor, loading: quoteLoading, error: quoteError } = useMarketQuotes(quoteSymbols)
const quote = (asset?: ResearchAsset) => (asset?.quoteSymbol ? quoteFor(asset.quoteSymbol) : null)
const valueLabel = (asset?: ResearchAsset) => {
  const current = quote(asset)
  const value = current?.price ?? asset?.value
  if (value == null) return '—'
  const unit =
    asset?.unit === '点'
      ? en.value
        ? 'pts'
        : '点'
      : current?.price != null
        ? current.currency || asset?.unit
        : asset?.unit
  return `${value.toLocaleString(en.value ? 'en-US' : 'zh-CN', { maximumFractionDigits: 4 })} ${unit ?? ''}`
}
const assetName = (id: string) => assetMap.get(id)?.name ?? id
const watchDraft = reactive({
  id: '',
  assetId: researchAssets[0]?.id ?? '',
  group: '',
  reason: '',
  createdAt: '',
})
const freshNote = (assetId = researchAssets[0]?.id ?? '') => ({
  id: '',
  assetId,
  title: '',
  thesis: '',
  invalidation: '',
  reviewDate: '',
  status: 'active' as ResearchNote['status'],
  conclusion: '',
  paperTradeId: '',
  createdAt: '',
  sourcesText: '',
})
const noteDraft = reactive(freshNote())
watch(
  [watchDraft, noteDraft],
  () => {
    message.value = ''
    formError.value = ''
  },
  { deep: true, flush: 'sync' },
)
let watchBaseline = JSON.stringify(watchDraft)
let noteBaseline = JSON.stringify(noteDraft)
let originalWatch: string | null = null
let originalNote: string | null = null
const watchDirty = () => JSON.stringify(watchDraft) !== watchBaseline
const noteDirty = () => JSON.stringify(noteDraft) !== noteBaseline
const allowReset = (dirty: boolean) => !dirty || window.confirm(text.value.discard)
onBeforeRouteLeave(() => allowReset(watchDirty() || noteDirty()))
const warnUnsaved = (event: BeforeUnloadEvent) => {
  if (!watchDirty() && !noteDirty()) return
  event.preventDefault()
  event.returnValue = ''
}
onMounted(() => window.addEventListener('beforeunload', warnUnsaved))
onUnmounted(() => window.removeEventListener('beforeunload', warnUnsaved))
const resetWatch = () => {
  originalWatch = null
  Object.assign(watchDraft, {
    id: '',
    assetId:
      researchAssets.find(
        (asset) => !workspace.value.watchlist.some((entry) => entry.assetId === asset.id),
      )?.id ??
      researchAssets[0]?.id ??
      '',
    group: '',
    reason: '',
    createdAt: '',
  })
  watchBaseline = JSON.stringify(watchDraft)
}
const resetNote = (assetId?: string) => {
  originalNote = null
  Object.assign(noteDraft, freshNote(assetId))
  noteBaseline = JSON.stringify(noteDraft)
}
const focusEditor = async () => {
  await nextTick()
  const editor = tab.value === 'notes' ? noteEditor.value : watchEditor.value
  editor?.scrollIntoView({ block: 'nearest' })
  editor
    ?.querySelector<HTMLElement>('input, select:not(:disabled), textarea')
    ?.focus({ preventScroll: true })
}
const newEntry = () => {
  if (tab.value === 'notes') {
    if (!allowReset(noteDirty())) return
    resetNote()
  } else {
    if (!allowReset(watchDirty())) return
    resetWatch()
  }
  void focusEditor()
}
const editWatch = (entry: ResearchWatchEntry) => {
  if (!allowReset(watchDirty())) return
  Object.assign(watchDraft, entry)
  originalWatch = JSON.stringify(entry)
  watchBaseline = JSON.stringify(watchDraft)
  void focusEditor()
}
const beginNote = (assetId: string) => {
  if (!allowReset(noteDirty())) return
  resetNote(assetId)
  tab.value = 'notes'
  selectedNoteAsset.value = assetId
  void focusEditor()
}
const editNote = (note: ResearchNote) => {
  if (!allowReset(noteDirty())) return false
  Object.assign(noteDraft, note, {
    paperTradeId: note.paperTradeId ?? '',
    sourcesText: note.sources.join('\n'),
  })
  originalNote = JSON.stringify(note)
  noteBaseline = JSON.stringify(noteDraft)
  void focusEditor()
  return true
}
const saveWatch = () => {
  formError.value = ''
  message.value = ''
  const existing = workspace.value.watchlist.find((entry) => entry.assetId === watchDraft.assetId)
  if (
    watchDraft.id &&
    JSON.stringify(existing ?? null) !== originalWatch &&
    !window.confirm(
      en.value
        ? 'This saved record changed while you were editing. Replace it with your draft?'
        : '编辑期间已保存的记录发生了变化。确定用当前草稿替换它？',
    )
  )
    return
  if (existing && !watchDraft.id) {
    if (
      !window.confirm(
        en.value
          ? 'This asset is already followed. Replace its group and reason with this draft?'
          : '该资产已在自选中，使用当前草稿替换它的分组与关注理由？',
      )
    )
      return
  }
  const now = new Date().toISOString()
  const entry: ResearchWatchEntry = {
    id: existing?.id ?? crypto.randomUUID(),
    assetId: watchDraft.assetId,
    group: watchDraft.group.trim() || (en.value ? 'Ungrouped' : '未分组'),
    reason: watchDraft.reason.trim(),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }
  try {
    if (
      commit(
        parseResearchWorkspace(
          JSON.stringify({
            ...workspace.value,
            watchlist: [
              ...workspace.value.watchlist.filter((item) => item.assetId !== entry.assetId),
              entry,
            ],
          }),
        ),
      )
    ) {
      resetWatch()
      message.value = text.value.saved
    } else formError.value = text.value.failed
  } catch {
    formError.value = text.value.invalid
  }
}
const saveNote = () => {
  formError.value = ''
  message.value = ''
  const existing = workspace.value.notes.find((note) => note.id === noteDraft.id)
  if (
    noteDraft.id &&
    JSON.stringify(existing ?? null) !== originalNote &&
    !window.confirm(
      en.value
        ? 'This saved record changed while you were editing. Replace it with your draft?'
        : '编辑期间已保存的记录发生了变化。确定用当前草稿替换它？',
    )
  )
    return
  const now = new Date().toISOString()
  const note: ResearchNote = {
    id: noteDraft.id || crypto.randomUUID(),
    assetId: noteDraft.assetId,
    title: noteDraft.title.trim(),
    thesis: noteDraft.thesis.trim(),
    invalidation: noteDraft.invalidation.trim(),
    reviewDate: noteDraft.reviewDate,
    status: noteDraft.status,
    conclusion: noteDraft.conclusion.trim(),
    sources: noteDraft.sourcesText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean),
    paperTradeId: noteDraft.paperTradeId.trim() || null,
    createdAt: noteDraft.createdAt || now,
    updatedAt: now,
  }
  try {
    if (
      commit(
        parseResearchWorkspace(
          JSON.stringify({
            ...workspace.value,
            notes: [note, ...workspace.value.notes.filter((entry) => entry.id !== note.id)],
          }),
        ),
      )
    ) {
      resetNote(note.assetId)
      message.value = text.value.saved
    } else formError.value = text.value.failed
  } catch {
    formError.value = text.value.invalid
  }
}
const removeWatch = (entry: ResearchWatchEntry) => {
  if (!window.confirm(text.value.removeWatch)) return
  if (
    commit({
      ...workspace.value,
      watchlist: workspace.value.watchlist.filter((item) => item.id !== entry.id),
    })
  ) {
    if (watchDraft.id === entry.id) resetWatch()
    message.value = text.value.saved
  }
}
const removeNote = (note: ResearchNote) => {
  if (!window.confirm(text.value.removeNote)) return
  if (
    commit({
      ...workspace.value,
      notes: workspace.value.notes.filter((item) => item.id !== note.id),
    })
  ) {
    if (noteDraft.id === note.id) resetNote()
    message.value = text.value.saved
  }
}
const exportBackup = () => {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(workspace.value, null, 2)], { type: 'application/json' }),
  )
  const link = document.createElement('a')
  link.href = url
  link.download = `research-workspace-${today.value}.json`
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
const importBackup = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  formError.value = ''
  message.value = ''
  try {
    if (file.size > 30 * 1024 * 1024) throw new Error('Backup too large')
    const imported = parseResearchWorkspace(await file.text())
    if (commit(mergeResearchWorkspaces(workspace.value, imported)))
      message.value = text.value.imported
    else formError.value = text.value.failed
  } catch (error) {
    console.warn('Research backup import failed:', error)
    formError.value = text.value.backupError
  } finally {
    input.value = ''
  }
}
const routeAsset = computed(() => (typeof route.query.asset === 'string' ? route.query.asset : ''))
watch(
  () => [route.query.asset, route.query.tab, route.query.paper, route.query.note],
  () => {
    if (typeof route.query.note === 'string') {
      const note = workspace.value.notes.find((note) => note.id === route.query.note)
      if (!note) {
        tab.value = 'notes'
        formError.value = en.value
          ? 'This research note is no longer available.'
          : '这条研究笔记已不存在。'
      } else if (editNote(note)) {
        tab.value = 'notes'
        selectedNoteAsset.value = note.assetId
        noteFilter.value = 'all'
        query.value = ''
      }
      return
    }
    const id = routeAsset.value
    tab.value = route.query.tab === 'notes' ? 'notes' : 'watchlist'
    if (!id) return
    if (!watchDirty() && assetMap.has(id)) {
      watchDraft.assetId = id
      watchBaseline = JSON.stringify(watchDraft)
    }
    if (!noteDirty()) {
      resetNote(id)
      if (typeof route.query.paper === 'string')
        noteDraft.paperTradeId = route.query.paper.slice(0, 160)
      noteBaseline = JSON.stringify(noteDraft)
      selectedNoteAsset.value = route.query.tab === 'notes' ? id : ''
    }
  },
  { immediate: true },
)
const switchTab = (value: 'watchlist' | 'notes') => {
  tab.value = value
  void router.replace({ query: { ...route.query, tab: value, note: undefined } })
}
const showDueNotes = () => {
  tab.value = 'notes'
  noteFilter.value = 'due'
  selectedNoteAsset.value = ''
  query.value = ''
  void router.replace({ query: { tab: 'notes' } })
}
const storageMessage = computed(() =>
  storageError.value === 'load'
    ? text.value.loadError
    : storageError.value === 'conflict'
      ? text.value.conflict
      : text.value.saveError,
)
</script>

<template>
  <main class="research-workspace ph-no-capture">
    <ResearchPageHeader eyebrow="PERSONAL RESEARCH" :title="text.title" :description="text.intro">
      <template #status
        ><div class="workspace-stats">
          <div>
            <strong>{{ workspace.watchlist.length }}</strong
            ><span>{{ text.watches }}</span>
          </div>
          <div>
            <strong>{{ workspace.notes.length }}</strong
            ><span>{{ text.notes }}</span>
          </div>
          <button type="button" @click="showDueNotes">
            <strong>{{ dueNotes.length }}</strong
            ><span>{{ text.due }}</span>
          </button>
        </div></template
      >
    </ResearchPageHeader>
    <div class="backup-bar">
      <p>{{ text.local }}</p>
      <div>
        <button type="button" :disabled="storageError === 'load'" @click="exportBackup">
          {{ text.export }}
        </button>
        <button type="button" @click="fileInput?.click()">{{ text.import }}</button>
        <input
          ref="fileInput"
          type="file"
          accept="application/json,.json"
          class="sr-only"
          :aria-label="text.import"
          @change="importBackup"
        />
      </div>
    </div>
    <div v-if="storageError" class="notice error" role="alert">
      {{ storageMessage }} <button type="button" @click="reload">{{ text.reload }}</button>
    </div>
    <p v-if="formError" class="notice error" role="alert">{{ formError }}</p>
    <p v-else-if="message" class="notice" role="status">{{ message }}</p>
    <p v-if="routeAsset && !assetMap.has(routeAsset)" class="notice">{{ text.unknownRoute }}</p>
    <nav class="workspace-tabs" :aria-label="text.title">
      <button type="button" :aria-pressed="tab === 'watchlist'" @click="switchTab('watchlist')">
        {{ text.watches }} <b>{{ workspace.watchlist.length }}</b>
      </button>
      <button type="button" :aria-pressed="tab === 'notes'" @click="switchTab('notes')">
        {{ text.notes }} <b>{{ workspace.notes.length }}</b>
      </button>
    </nav>
    <div class="workspace-toolbar">
      <RouterLink class="reminders-link" to="/reminders"
        >{{ en ? 'Reminder center' : '统一提醒' }} ↗</RouterLink
      >
      <button type="button" @click="newEntry">
        ＋ {{ tab === 'notes' ? text.newNote : text.addWatch }}
      </button>
      <label class="search"
        ><span class="sr-only">{{ text.search }}</span
        ><input v-model="query" type="search" :placeholder="text.search"
      /></label>
      <select v-if="tab === 'watchlist'" v-model="groupFilter" :aria-label="text.groups">
        <option value="">{{ text.all }}</option>
        <option v-for="group in groups" :key="group">{{ group }}</option>
      </select>
      <template v-else>
        <select v-model="noteFilter" :aria-label="text.status">
          <option value="all">{{ text.allNotes }}</option>
          <option value="due">{{ text.dueOnly }}</option>
          <option value="active">{{ text.active }}</option>
          <option value="reviewed">{{ text.reviewed }}</option>
          <option value="invalidated">{{ text.invalidated }}</option>
        </select>
        <select v-model="selectedNoteAsset" :aria-label="text.asset">
          <option value="">{{ en ? 'All assets' : '全部资产' }}</option>
          <option
            v-for="id in [...new Set(workspace.notes.map((note) => note.assetId))]"
            :key="id"
            :value="id"
          >
            {{ assetName(id) }}
          </option>
        </select>
      </template>
    </div>
    <div v-if="tab === 'watchlist'" class="workspace-grid">
      <section :aria-label="text.watches">
        <div v-if="!filteredWatches.length" class="empty-panel">
          <span aria-hidden="true">◎</span>
          <h2>{{ workspace.watchlist.length ? text.noMatch : text.emptyWatch }}</h2>
          <p>{{ text.emptyWatchHint }}</p>
        </div>
        <article v-for="entry in filteredWatches" :key="entry.id" class="asset-card">
          <div class="card-heading">
            <div>
              <span class="eyebrow">{{ entry.group }}</span>
              <h2>{{ assetName(entry.assetId) }}</h2>
              <small>{{ assetMap.get(entry.assetId)?.symbol ?? text.unknown }}</small>
            </div>
            <div class="asset-value">
              <strong>{{ valueLabel(assetMap.get(entry.assetId)) }}</strong>
              <MarketQuoteStatus
                v-if="assetMap.get(entry.assetId)?.quoteSymbol"
                :quote="quote(assetMap.get(entry.assetId))"
                :loading="quoteLoading"
                :error="quoteError"
                show-time
              />
              <small v-if="quote(assetMap.get(entry.assetId))?.price == null"
                >{{ text.snapshot }} · {{ assetMap.get(entry.assetId)?.date ?? '—' }}</small
              >
            </div>
          </div>
          <p class="reason">{{ entry.reason || text.none }}</p>
          <div class="asset-context">
            <a
              v-if="quote(assetMap.get(entry.assetId))?.price != null"
              :href="quote(assetMap.get(entry.assetId))?.sourceUrl"
              target="_blank"
              rel="noopener noreferrer"
              >{{ quote(assetMap.get(entry.assetId))?.source }}</a
            >
            <a
              v-if="assetMap.get(entry.assetId)?.sourceUrl"
              :href="assetMap.get(entry.assetId)?.sourceUrl"
              target="_blank"
              rel="noopener noreferrer"
              >{{ text.snapshot }} {{ text.source }} · {{ assetMap.get(entry.assetId)?.source }}</a
            ><span v-if="assetMap.get(entry.assetId)?.stale">{{
              en ? 'Source flagged as stale' : '来源标记为过期'
            }}</span>
          </div>
          <div class="card-links">
            <RouterLink
              v-if="assetMap.get(entry.assetId)?.technicalId"
              :to="{
                path: '/asset-technical',
                query: { asset: assetMap.get(entry.assetId)?.technicalId },
              }"
              >{{ text.charts }} ↗</RouterLink
            >
            <RouterLink
              v-if="assetMap.has(entry.assetId)"
              :to="{
                path: '/intelligence/news',
                query: { q: assetMap.get(entry.assetId)?.newsQuery },
              }"
              >{{ text.news }} ↗</RouterLink
            >
            <RouterLink to="/quant-signals">{{ text.quant }} ↗</RouterLink>
          </div>
          <footer>
            <button type="button" @click="beginNote(entry.assetId)">{{ text.write }}</button
            ><button type="button" @click="editWatch(entry)">{{ text.edit }}</button
            ><button
              type="button"
              class="quiet"
              :aria-label="`${text.remove} ${assetName(entry.assetId)}`"
              @click="removeWatch(entry)"
            >
              {{ text.remove }}
            </button>
          </footer>
        </article>
        <p v-if="filteredWatches.length" class="muted">{{ text.quoteLimit }}</p>
      </section>
      <form ref="watchEditor" class="editor" @submit.prevent="saveWatch">
        <h2>{{ watchDraft.id ? text.editWatch : text.addWatch }}</h2>
        <p class="muted">{{ text.catalog }} · {{ researchAssets.length }}</p>
        <label
          >{{ text.asset
          }}<select
            v-model="watchDraft.assetId"
            :aria-label="text.asset"
            required
            :disabled="!!watchDraft.id"
          >
            <option v-if="!assetMap.has(watchDraft.assetId)" :value="watchDraft.assetId">
              {{ watchDraft.assetId }}
            </option>
            <option v-for="asset in researchAssets" :key="asset.id" :value="asset.id">
              {{ asset.name }} · {{ asset.symbol }}
            </option>
          </select></label
        >
        <label
          >{{ text.group
          }}<input
            v-model="watchDraft.group"
            list="research-groups"
            maxlength="60"
            :placeholder="text.groupPlaceholder"
        /></label>
        <datalist id="research-groups">
          <option v-for="group in groups" :key="group" :value="group" />
        </datalist>
        <label
          >{{ text.reason
          }}<textarea
            v-model="watchDraft.reason"
            rows="5"
            maxlength="2000"
            :placeholder="text.reasonPlaceholder"
          />
        </label>
        <div class="form-actions">
          <button class="primary" type="submit">{{ text.save }}</button
          ><button type="button" @click="allowReset(watchDirty()) && resetWatch()">
            {{ text.cancel }}
          </button>
        </div>
      </form>
    </div>
    <div v-else class="workspace-grid">
      <section :aria-label="text.notes">
        <div v-if="!filteredNotes.length" class="empty-panel">
          <span aria-hidden="true">✎</span>
          <h2>{{ text.emptyNotes }}</h2>
          <p>{{ text.emptyNotesHint }}</p>
        </div>
        <article v-for="note in filteredNotes" :key="note.id" class="note-card">
          <div class="card-heading">
            <span class="eyebrow">{{ assetName(note.assetId) }}</span
            ><span class="status" :class="{ due: isResearchNoteDue(note, today) }">{{
              isResearchNoteDue(note, today) ? text.due : text[note.status]
            }}</span>
          </div>
          <h2>{{ note.title }}</h2>
          <p class="note-body">{{ note.thesis }}</p>
          <dl>
            <div v-if="note.invalidation">
              <dt>{{ text.invalidation }}</dt>
              <dd>{{ note.invalidation }}</dd>
            </div>
            <div>
              <dt>{{ text.reviewDate }}</dt>
              <dd>{{ note.reviewDate || text.none }}</dd>
            </div>
            <div v-if="note.conclusion">
              <dt>{{ text.conclusion }}</dt>
              <dd>{{ note.conclusion }}</dd>
            </div>
          </dl>
          <ul v-if="note.sources.length" class="source-list">
            <li v-for="(source, index) in note.sources" :key="index">
              <a :href="source" target="_blank" rel="noopener noreferrer">{{ source }}</a>
            </li>
          </ul>
          <p v-if="note.paperTradeId" class="paper-reference">
            {{ text.paper }}: {{ note.paperTradeId }}
            <RouterLink to="/quant-signals#paper-journal">{{ text.paperLink }} ↗</RouterLink>
          </p>
          <footer>
            <small
              >{{ text.date }}
              {{ new Date(note.updatedAt).toLocaleString(en ? 'en-US' : 'zh-CN') }}</small
            ><button type="button" @click="editNote(note)">{{ text.edit }}</button
            ><button
              type="button"
              class="quiet"
              :aria-label="`${text.remove} ${note.title}`"
              @click="removeNote(note)"
            >
              {{ text.remove }}
            </button>
          </footer>
        </article>
      </section>
      <form ref="noteEditor" class="editor" @submit.prevent="saveNote">
        <h2>{{ noteDraft.id ? text.editNote : text.newNote }}</h2>
        <label
          >{{ text.asset
          }}<select v-model="noteDraft.assetId" :aria-label="text.asset" required>
            <option v-if="!assetMap.has(noteDraft.assetId)" :value="noteDraft.assetId">
              {{ noteDraft.assetId }}
            </option>
            <option v-for="asset in researchAssets" :key="asset.id" :value="asset.id">
              {{ asset.name }} · {{ asset.symbol }}
            </option>
          </select></label
        >
        <label
          >{{ text.noteTitle }}<input v-model="noteDraft.title" required maxlength="160"
        /></label>
        <label
          >{{ text.thesis
          }}<textarea v-model="noteDraft.thesis" required rows="5" maxlength="10000" />
        </label>
        <label
          >{{ text.sources
          }}<textarea
            v-model="noteDraft.sourcesText"
            rows="3"
            maxlength="40000"
            spellcheck="false"
          />
        </label>
        <label
          >{{ text.invalidation
          }}<textarea v-model="noteDraft.invalidation" rows="3" maxlength="10000" />
        </label>
        <div class="form-pair">
          <label>{{ text.reviewDate }}<input v-model="noteDraft.reviewDate" type="date" /></label
          ><label
            >{{ text.status
            }}<select v-model="noteDraft.status" :aria-label="text.status">
              <option value="active">{{ text.active }}</option>
              <option value="reviewed">{{ text.reviewed }}</option>
              <option value="invalidated">{{ text.invalidated }}</option>
            </select></label
          >
        </div>
        <label
          >{{ text.conclusion
          }}<textarea v-model="noteDraft.conclusion" rows="3" maxlength="10000" />
        </label>
        <label
          >{{ text.paper }}<input v-model="noteDraft.paperTradeId" maxlength="160" /><small>{{
            text.paperHint
          }}</small></label
        >
        <div class="form-actions">
          <button class="primary" type="submit">{{ text.save }}</button
          ><button type="button" @click="allowReset(noteDirty()) && resetNote()">
            {{ text.cancel }}
          </button>
        </div>
      </form>
    </div>
  </main>
</template>

<style scoped>
.research-workspace {
  max-width: var(--content-workbench);
  margin: 0 auto;
  padding: var(--space-section) var(--page-gutter) 64px;
}
.workspace-stats {
  display: flex;
  gap: 24px;
}
.workspace-stats > * {
  display: grid;
  gap: 4px;
  text-align: left;
}
.workspace-stats strong {
  font-size: 28px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.workspace-stats span {
  font-size: 12px;
}
.workspace-stats button {
  color: var(--ink);
  background: transparent;
  border: 0;
  padding: 0;
}
.backup-bar,
.backup-bar > div,
.workspace-tabs,
.workspace-toolbar,
.form-actions,
footer,
.card-links,
.asset-context {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.backup-bar {
  justify-content: space-between;
  margin-bottom: 20px;
}
.backup-bar p {
  margin: 0;
  max-width: 65ch;
  color: var(--muted);
  font-size: 12px;
}
button,
input,
select,
textarea {
  font: inherit;
}
button {
  min-height: 36px;
  padding: 7px 12px;
  color: var(--ink);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
}
button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
button:hover:not(:disabled),
.workspace-tabs button[aria-pressed='true'] {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-soft);
}
button:focus-visible,
a:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}
.workspace-tabs {
  border-bottom: 1px solid var(--border);
  padding-bottom: 12px;
}
.workspace-tabs b {
  margin-left: 8px;
  font-variant-numeric: tabular-nums;
}
.workspace-toolbar {
  margin: 20px 0;
}
.search {
  flex: 1;
  min-width: 180px;
}
input,
select,
textarea {
  width: 100%;
  min-width: 0;
  color: var(--ink);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 10px 12px;
}
textarea {
  resize: vertical;
  line-height: 1.6;
}
.workspace-toolbar > select {
  width: auto;
  max-width: 220px;
}
.workspace-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(300px, 360px);
  align-items: start;
  gap: 24px;
}
.workspace-grid > * {
  min-width: 0;
}
.asset-card,
.note-card,
.editor,
.empty-panel {
  padding: 22px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--panel-radius);
}
.asset-card,
.note-card {
  margin-bottom: 16px;
}
h2 {
  margin: 8px 0;
  font-size: 18px;
  line-height: 1.4;
  overflow-wrap: anywhere;
}
.card-heading {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 16px;
}
.card-heading > div {
  min-width: 0;
}
.card-heading small,
.muted,
.asset-context,
footer small {
  color: var(--muted);
  font-size: 12px;
}
.eyebrow {
  font-size: 11px;
  color: var(--accent);
  font-weight: 600;
}
.asset-value {
  display: grid;
  gap: 5px;
  text-align: right;
  justify-items: end;
  flex-shrink: 0;
}
.asset-value strong {
  font-size: 18px;
  font-variant-numeric: tabular-nums;
}
.reason,
.note-body,
dd {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  line-height: 1.7;
  font-size: 14px;
}
.card-links {
  margin: 18px 0;
  font-size: 12px;
}
a {
  color: var(--accent);
  text-underline-offset: 3px;
}
footer {
  border-top: 1px solid var(--border);
  padding-top: 14px;
  margin-top: 16px;
}
footer small {
  flex: 1;
}
.quiet {
  margin-left: auto;
  color: var(--muted);
}
.editor {
  display: grid;
  gap: 16px;
  scroll-margin-top: 88px;
}
.editor h2 {
  margin: 0;
}
.editor label {
  display: grid;
  gap: 7px;
  font-size: 13px;
}
.editor label small {
  color: var(--muted);
  line-height: 1.5;
}
.editor .muted {
  margin: 0;
}
.primary {
  background: var(--accent);
  color: var(--surface);
  border-color: var(--accent);
}
.form-pair {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.empty-panel {
  text-align: center;
  padding: 64px 24px;
}
.empty-panel > span {
  font-size: 32px;
  color: var(--accent);
}
.empty-panel p {
  color: var(--muted);
  line-height: 1.7;
  font-size: 13px;
}
.status {
  padding: 3px 8px;
  color: var(--muted);
  background: var(--surface-soft);
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 11px;
}
.status.due {
  color: var(--warning);
  border-color: currentColor;
}
dl {
  margin: 16px 0;
}
dl > div {
  margin-top: 12px;
}
dt {
  color: var(--muted);
  font-size: 12px;
}
dd {
  margin: 4px 0 0;
}
.source-list {
  margin: 12px 0;
  padding-left: 18px;
  font-size: 12px;
  line-height: 1.7;
  overflow-wrap: anywhere;
}
.paper-reference {
  overflow-wrap: anywhere;
  font-size: 12px;
}
.notice {
  padding: 12px 16px;
  background: var(--accent-soft);
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 13px;
  line-height: 1.6;
}
.notice.error {
  border-color: var(--negative);
}
@media (max-width: 1050px) {
  .workspace-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
@media (max-width: 600px) {
  .workspace-toolbar {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .workspace-toolbar > button,
  .search {
    grid-column: 1 / -1;
    min-width: 0;
  }
  .workspace-stats {
    gap: 20px;
  }
  .card-heading {
    flex-wrap: wrap;
  }
  .asset-value {
    text-align: left;
    justify-items: start;
  }
  .asset-card,
  .note-card,
  .editor {
    padding: 16px;
  }
  .workspace-toolbar > select {
    max-width: none;
    width: 100%;
  }
  .form-pair {
    grid-template-columns: 1fr;
  }
}
@media (prefers-reduced-motion: reduce) {
  * {
    scroll-behavior: auto;
  }
}
</style>
