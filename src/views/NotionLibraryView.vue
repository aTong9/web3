<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import type { NotionLibrary } from '@/types'
import ResearchPageHeader from '@/components/research/ResearchPageHeader.vue'
import NotionWorkProducts from '@/components/research/NotionWorkProducts.vue'
import NotionWealthPlan from '@/components/research/NotionWealthPlan.vue'
import wealthPlan from '@/data/million-action-plan.json'
import { useLocalRecord } from '@/composables/use-local-record'
import { useAuth } from '@/composables/use-auth'
import { adminApi } from '@/utils/admin-api'
import {
  emptyNotionLibrary,
  integrateNotionWealthSection,
  filterNotionEntries,
  mergeNotionLibrary,
  notionCategories,
  parseNotionLibrary,
} from '@/utils/notion-library'

const {
  record: localRecord,
  error: localError,
  save: saveLocal,
  reload,
} = useLocalRecord('market-desk-notion-library-v1', emptyNotionLibrary, parseNotionLibrary)
const { user: accountUser, restore } = useAuth()
const localFileMode = import.meta.env.DEV
const user = computed(() => (localFileMode ? null : accountUser.value))
const fileRecord = shallowRef<NotionLibrary>(emptyNotionLibrary())
const fileMessage = ref('正在读取本地 JSON…')
onMounted(async () => {
  if (!localFileMode) return
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}__local/notion-library.json`, {
      cache: 'no-store',
    })
    if (!response.ok) throw new Error('Local JSON unavailable')
    fileRecord.value = parseNotionLibrary(await response.text())
    fileMessage.value = '已读取本地 JSON；刷新页面会重新读取文件。'
  } catch {
    fileMessage.value = '本地 JSON 读取失败，请检查 .local-data/notion/notion-library.json。'
  }
})
const cloudRecord = shallowRef<NotionLibrary>(emptyNotionLibrary())
const cloudRevision = ref(0)
const cloudLoading = ref(false)
const cloudReady = ref(false)
const cloudDirty = ref(false)
const cloudMessage = ref('')
const pending = ref<NotionLibrary | null>(null)
const message = ref('')
const noteMessage = ref('')
let cloudGeneration = 0
let cloudToken: string | null = null
const invalidateCloud = () => {
  cloudGeneration++
  cloudToken = null
  cloudRecord.value = emptyNotionLibrary()
  cloudRevision.value = 0
  cloudDirty.value = false
  cloudReady.value = false
  cloudLoading.value = false
  pending.value = null
  message.value = ''
  noteMessage.value = ''
  cloudMessage.value = '登录状态已变化，请刷新页面重新载入账号资料。'
}
const onSessionChange = (event: StorageEvent) => {
  if (
    (event.key === 'market-admin-session' || event.key === null) &&
    localStorage.getItem('market-admin-session') !== cloudToken
  )
    invalidateCloud()
}
onMounted(() => {
  window.addEventListener('storage', onSessionChange)
  if (cloudToken && localStorage.getItem('market-admin-session') !== cloudToken) invalidateCloud()
})
onUnmounted(() => window.removeEventListener('storage', onSessionChange))
const record = computed(() =>
  localFileMode ? fileRecord.value : user.value ? cloudRecord.value : localRecord.value,
)
const error = computed(() => (localFileMode || user.value ? null : localError.value))
const save = (next: NotionLibrary) => {
  if (localFileMode) {
    try {
      fileRecord.value = parseNotionLibrary(JSON.stringify(next))
      fileMessage.value = '本页有修改，请导出 JSON 保存；刷新后重新读取原文件。'
      return true
    } catch {
      return false
    }
  }
  if (!user.value) return saveLocal(next)
  if (!cloudReady.value) return false
  if (!cloudToken || localStorage.getItem('market-admin-session') !== cloudToken) {
    invalidateCloud()
    return false
  }
  try {
    cloudRecord.value = parseNotionLibrary(JSON.stringify(next))
    cloudDirty.value = true
    cloudMessage.value = '当前修改仅在本页，尚未保存到账号。'
    return true
  } catch {
    cloudMessage.value = '修改格式无效，账号资料未更改。'
    return false
  }
}
watch(
  () => user.value,
  async (account) => {
    const generation = ++cloudGeneration
    const id = account?.id
    const token = localStorage.getItem('market-admin-session')
    cloudToken = token
    pending.value = null
    message.value = ''
    noteMessage.value = ''
    cloudRecord.value = emptyNotionLibrary()
    cloudRevision.value = 0
    cloudDirty.value = false
    cloudReady.value = false
    cloudLoading.value = false
    cloudMessage.value = ''
    if (!id || !token) return
    cloudLoading.value = true
    try {
      const result = await adminApi.notionLibrary(token)
      if (
        cloudGeneration !== generation ||
        user.value?.id !== id ||
        localStorage.getItem('market-admin-session') !== token
      )
        return
      cloudRecord.value = result.library
        ? parseNotionLibrary(JSON.stringify(result.library))
        : emptyNotionLibrary()
      cloudRevision.value = result.revision
      cloudReady.value = true
      cloudMessage.value = result.library
        ? '已载入账号资料。'
        : '账号尚无资料。可手动上传本机旧资料或导入备份。'
    } catch {
      if (
        cloudGeneration === generation &&
        user.value?.id === id &&
        localStorage.getItem('market-admin-session') === token
      )
        cloudMessage.value = '账号资料读取失败，请刷新页面重试。'
    } finally {
      if (
        cloudGeneration === generation &&
        user.value?.id === id &&
        localStorage.getItem('market-admin-session') === token
      )
        cloudLoading.value = false
    }
  },
  { immediate: true },
)
if (!localFileMode) void restore()
const saveToAccount = async () => {
  const id = user.value?.id
  if (!id || !cloudReady.value || cloudLoading.value) return
  const token = cloudToken
  if (!token || localStorage.getItem('market-admin-session') !== token) {
    invalidateCloud()
    return
  }
  const generation = cloudGeneration
  cloudLoading.value = true
  const snapshot = cloudRecord.value
  try {
    const result = await adminApi.saveNotionLibrary(snapshot, cloudRevision.value, token)
    if (
      cloudGeneration !== generation ||
      user.value?.id !== id ||
      localStorage.getItem('market-admin-session') !== token
    )
      return
    cloudRevision.value = result.revision
    cloudDirty.value = cloudRecord.value !== snapshot
    cloudMessage.value = cloudDirty.value
      ? '旧修改已保存；本页仍有新修改待保存。'
      : '已保存到账号，登录同一账号的浏览器可读取。'
  } catch (caught) {
    if (
      cloudGeneration === generation &&
      user.value?.id === id &&
      localStorage.getItem('market-admin-session') === token
    )
      cloudMessage.value = caught instanceof Error ? caught.message : '保存失败，当前修改仍在本页。'
  } finally {
    if (
      cloudGeneration === generation &&
      user.value?.id === id &&
      localStorage.getItem('market-admin-session') === token
    )
      cloudLoading.value = false
  }
}
const uploadLocalToAccount = () => {
  if (
    !user.value ||
    !cloudReady.value ||
    cloudRevision.value !== 0 ||
    !localRecord.value.entries.length
  )
    return
  if (save(localRecord.value))
    cloudMessage.value = '已将本机旧资料放入当前页；请点击“保存到账号”完成上传。'
}
const query = ref('')
const category = ref('')
const route = useRoute()
const chapter = ref(typeof route.query.chapter === 'string' ? route.query.chapter : '')
const readingToolbar = ref<HTMLElement | null>(null)
const readerStart = ref<HTMLElement | null>(null)
const selectChapter = async (id: string) => {
  chapter.value = id
  await nextTick()
  const target = readingToolbar.value ?? readerStart.value
  target?.scrollIntoView({
    block: 'start',
    behavior: 'instant',
  })
}
watch(
  () => route.query.chapter,
  (value) => {
    chapter.value = typeof value === 'string' ? value : ''
  },
)
const sections = computed(() => integrateNotionWealthSection(record.value.report?.sections))
const wealthSearchText = wealthPlan
  .flatMap((section) => [
    section.title,
    ...section.items.flatMap((item) => [item.title, item.threshold, item.verdict, item.action]),
  ])
  .join(' ')
const wealthCount = wealthPlan.reduce((sum, section) => sum + section.items.length, 0)

const mode = ref<'work' | 'reading'>('work')
const workProducts = computed(
  () => record.value.report?.sections.flatMap((section) => section.workProducts ?? []) ?? [],
)
const workCounts = computed(() => ({
  prepared: workProducts.value.filter((item) => item.status === 'prepared').length,
  input: workProducts.value.filter((item) => item.status === 'needs-input').length,
  verification: workProducts.value.filter((item) => item.status === 'needs-verification').length,
}))
const saveWorkNote = (sectionId: string, id: string, notes: string) => {
  const next: NotionLibrary = JSON.parse(JSON.stringify(record.value))
  const item = next.report?.sections
    .find((section) => section.id === sectionId)
    ?.workProducts?.find((item) => item.id === id)
  if (!item) return
  item.notes = notes
  noteMessage.value = save(next)
    ? localFileMode
      ? '补充保留在本页，请导出 JSON 保存。'
      : user.value
        ? '补充待保存到账号。'
        : '补充已保存在当前浏览器。'
    : '保存失败，输入仍保留。请先导出备份并处理下方存储错误。'
}

const reportSections = computed(() => {
  const needle = query.value.trim().toLocaleLowerCase()
  return sections.value.filter(
    (section) =>
      (!chapter.value || section.id === chapter.value) &&
      (!needle ||
        [
          section.title,
          ...(section.id === 'wealth' ? [wealthSearchText] : []),
          section.summary,
          ...section.paragraphs,
          ...section.takeaways,
          ...section.actions,
          ...section.cautions,
          ...(section.workProducts ?? []).flatMap((item) => [
            item.title,
            item.result,
            item.nextStep,
            item.notes,
            ...item.rows.flat(),
          ]),
        ]
          .join(' ')
          .toLocaleLowerCase()
          .includes(needle)),
  )
})
const sourceEntry = (id: string) => record.value.entries.find((entry) => entry.id === id)
const visible = computed(() =>
  filterNotionEntries(record.value.entries, category.value, query.value),
)
const counts = computed(() =>
  notionCategories.map((name) => ({
    name,
    count: record.value.entries.filter((entry) => entry.category === name).length,
  })),
)
const previewImport = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const generation = cloudGeneration
  const accountId = user.value?.id
  const token = cloudToken
  pending.value = null
  try {
    if (file.size > 2_000_000) throw new Error('Import too large')
    const parsed = parseNotionLibrary(await file.text())
    if (cloudGeneration !== generation || user.value?.id !== accountId || cloudToken !== token)
      return
    pending.value = parsed
    message.value =
      '文件已校验。新总结会替换现有正文、执行材料和本人补充，导入前请导出备份；其他来源条目保留。'
  } catch {
    if (cloudGeneration === generation && user.value?.id === accountId && cloudToken === token)
      message.value = '文件格式无效或超过2MB，原有资料未更改。'
  } finally {
    input.value = ''
  }
}
const applyImport = () => {
  if (!pending.value || (user.value && !cloudReady.value)) return
  try {
    if (save(mergeNotionLibrary(record.value, pending.value))) {
      message.value = `已载入${record.value.entries.length}条来源资料${record.value.report ? '及分类总结正文' : ''}${user.value ? '；请点击“保存到账号”完成同步' : '，并保存在当前浏览器'}。`
      pending.value = null
    } else message.value = '保存失败，待导入内容仍保留。请处理存储错误后重试。'
  } catch {
    message.value = '合并后数据不符合限制，原有资料未更改。'
  }
}
const exportLibrary = () => {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(record.value, null, 2)], { type: 'application/json' }),
  )
  const link = document.createElement('a')
  link.href = url
  link.download = 'notion-library-backup.json'
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
</script>

<template>
  <main class="notion-library ph-no-capture ph-mask">
    <ResearchPageHeader
      title="Notion 分类总结"
      eyebrow="NOTES INTO ACTION"
      description="把零散笔记变成可用的需求书、核对表和内容方案。按主题推进，保留原文与依据。"
      density="workbench"
      variant="plain"
    >
      <template #status
        ><small>{{ localFileMode ? '本地 JSON 资料' : user ? '账号资料' : '当前浏览器资料' }}</small
        ><b>{{ record.entries.length }} 条</b></template
      >
    </ResearchPageHeader>
    <section class="sync-bar" aria-label="账号同步">
      <p v-if="localFileMode" role="status">{{ fileMessage }}</p>
      <p v-else-if="user" role="status">
        {{
          cloudLoading
            ? '账号资料处理中…'
            : cloudMessage || (cloudDirty ? '有修改尚未保存到账号。' : '账号资料已载入。')
        }}
      </p>
      <p v-else>当前资料仅在此浏览器。请通过账号菜单登录同一账号，在其他浏览器读取账号资料。</p>
      <button
        v-if="user"
        type="button"
        :disabled="!cloudReady || cloudLoading || !cloudDirty"
        @click="saveToAccount"
      >
        保存到账号
      </button>
    </section>
    <section v-if="record.report" class="report-intro" aria-label="Notion内容总览">
      <small>NOTION WORKSPACE · {{ record.importedAt.slice(0, 10) }}</small>
      <h2>{{ workProducts.length ? '从笔记到行动，每一步都有落点。' : record.report.title }}</h2>
      <p class="intro-lead">{{ record.report.overview[0] }}</p>
      <div v-if="workProducts.length" class="execution-overview">
        <div>
          <strong>{{ workProducts.length }}</strong
          ><span>项建议 · 执行材料已备好</span>
        </div>
        <div>
          <strong>{{ workCounts.prepared }}</strong
          ><span>份材料可直接使用</span>
        </div>
        <div>
          <strong>{{ workCounts.input }}</strong
          ><span>项待补本人信息</span>
        </div>
        <div>
          <strong>{{ workCounts.verification }}</strong
          ><span>项待外部核验</span>
        </div>
      </div>
      <p v-if="workProducts.length" class="completion-note">
        材料准备完成 ≠ 实际事项办结。这里提供可用成果，办理、发布和真实试验结果分别留痕。
      </p>
      <details class="overview-context">
        <summary>整理说明与证据边界</summary>
        <p v-for="paragraph in record.report.overview.slice(1)" :key="paragraph">{{ paragraph }}</p>
      </details>
      <div class="report-stats">
        <span>{{ record.report.pagesRead }} 个页面已读取</span
        ><span>{{ record.report.databasesRead }} 个数据库结构已读取</span
        ><span>{{ record.report.sections.length }} 个主题章节</span>
      </div>
    </section>
    <section
      v-if="record.report && workProducts.length"
      ref="readingToolbar"
      class="workspace-toolbar"
      aria-label="阅读模式"
    >
      <div class="mode-switch">
        <button type="button" :aria-pressed="mode === 'work'" @click="mode = 'work'">
          执行成果 <span>{{ workProducts.length }}</span></button
        ><button type="button" :aria-pressed="mode === 'reading'" @click="mode = 'reading'">
          分类正文
        </button>
      </div>
      <p>按主题选择 · 补充信息会随备份导出{{ user ? '；修改后请保存到账号' : '' }}</p>
    </section>
    <p v-if="noteMessage" class="note-message" role="status">{{ noteMessage }}</p>
    <div ref="readerStart" class="reader-layout">
      <nav class="chapter-nav" aria-label="内容总结目录">
        <h2>内容目录</h2>
        <button type="button" :aria-pressed="!chapter" @click="selectChapter('')">全部主题</button>
        <button
          v-for="(section, index) in sections"
          :key="section.id"
          type="button"
          :aria-pressed="chapter === section.id"
          @click="selectChapter(section.id)"
        >
          <span class="nav-index">{{ String(index + 1).padStart(2, '0') }}</span
          ><span>{{ section.title }}</span
          ><small v-if="section.workProducts?.length"
            >{{ section.workProducts.length }} 份材料{{
              section.id === 'wealth' ? ` · ${wealthCount} 项用途` : ''
            }}</small
          >
        </button>
        <label
          >全文搜索<input
            v-model="query"
            type="search"
            aria-label="搜索分类总结正文"
            placeholder="搜索观点、预算、工具…"
        /></label>
      </nav>
      <div class="report-body">
        <p v-if="!reportSections.length" role="status">没有匹配的正文，请更换章节或搜索词。</p>
        <article
          v-for="section in reportSections"
          :key="section.id"
          :data-report-section="section.id"
          class="report-chapter"
          :class="{
            'has-work':
              section.id === 'wealth' || (mode === 'work' && section.workProducts?.length),
          }"
        >
          <div class="chapter-heading">
            <span class="chapter-eyebrow">{{
              mode === 'work' && section.workProducts?.length ? 'ACTION MATERIALS' : 'CHAPTER NOTES'
            }}</span>
            <h2>{{ section.title }}</h2>
          </div>
          <p class="chapter-summary">{{ section.summary }}</p>
          <details
            v-if="section.id === 'wealth' && section.workProducts?.length"
            class="wealth-personal-materials"
            :open="!!query"
          >
            <summary>我的需求与办理准备 · {{ section.workProducts.length }} 份材料</summary>
            <NotionWorkProducts
              :products="section.workProducts"
              :actions="section.actions"
              @save-note="(id, notes) => saveWorkNote(section.id, id, notes)"
            />
          </details>
          <NotionWealthPlan v-if="section.id === 'wealth'" :query="query" />
          <template
            v-if="section.id !== 'wealth' && mode === 'work' && section.workProducts?.length"
          >
            <NotionWorkProducts
              :products="section.workProducts"
              :actions="section.actions"
              @save-note="(id, notes) => saveWorkNote(section.id, id, notes)"
            />
          </template>
          <template v-else-if="section.id !== 'wealth' || mode === 'reading'">
            <p v-if="section.id === 'wealth'" class="chapter-eyebrow">
              NOTION 原始摘要 · 与上方用途目录合并阅读
            </p>
            <p v-for="paragraph in section.paragraphs" :key="paragraph">{{ paragraph }}</p>
            <h3 v-if="section.takeaways.length">内容要点</h3>
            <ul>
              <li v-for="point in section.takeaways" :key="point">{{ point }}</li>
            </ul>
            <h3 v-if="section.actions.length">整理后的下一步 · 建议</h3>
            <ol>
              <li v-for="action in section.actions" :key="action">{{ action }}</li>
            </ol>
          </template>
          <div v-if="section.cautions.length" class="chapter-cautions">
            <h3>待核实与分歧</h3>
            <p v-for="caution in section.cautions" :key="caution">{{ caution }}</p>
          </div>
          <details v-if="section.sourceIds.length" class="chapter-sources">
            <summary>来源追溯（{{ section.sourceIds.length }} 页）</summary>
            <a
              v-for="id in section.sourceIds"
              :key="id"
              :href="sourceEntry(id)?.sourceUrl"
              target="_blank"
              rel="noopener noreferrer"
              >{{ sourceEntry(id)?.title }}</a
            >
          </details>
        </article>
      </div>
    </div>
    <section v-if="record.report" class="report-limits">
      <h2>本次读取范围</h2>
      <p v-for="limit in record.report.limits" :key="limit">{{ limit }}</p>
    </section>
    <details class="library-management" :open="!record.report">
      <summary>{{ record.report ? '来源资料索引与备份管理' : '载入分类总结' }}</summary>
      <section class="storage-panel">
        <div>
          <h2>你的整理快照</h2>
          <p v-if="localFileMode">
            数据来自 .local-data/notion/notion-library.json。导入或补充仅改变当前页，请导出 JSON
            并替换本地文件以保留修改。
          </p>
          <p v-else-if="user">
            账号资料仅登录本人可读取；修改后请手动保存到账号。这里不会自动同步 Notion。
          </p>
          <p v-else>
            资料只保存在当前浏览器；不会随网站发布，也不会自动同步
            Notion。换设备或清理浏览器前，请导出备份。该存储未加密，同一浏览器的使用者可访问。
          </p>
        </div>
        <div class="actions">
          <label
            >导入整理文件<input
              type="file"
              accept=".json,application/json"
              aria-label="导入Notion整理文件"
              @change="previewImport" /></label
          ><button
            type="button"
            :disabled="!record.entries.length && !record.report"
            @click="exportLibrary"
          >
            导出备份
          </button>
          <button
            v-if="user && cloudReady && cloudRevision === 0 && localRecord.entries.length"
            type="button"
            @click="uploadLocalToAccount"
          >
            将本机旧资料载入当前账号
          </button>
        </div>
      </section>
      <section v-if="pending" class="import-preview" aria-label="导入预览">
        <p>新总结将替换现有正文、执行材料和本人补充。请先导出备份。</p>
        <h2>
          准备导入 {{ pending.entries.length }} 条来源记录<span v-if="pending.report"
            >和 {{ pending.report.sections.length }} 章内容总结</span
          >
        </h2>
        <p>{{ pending.coverage }}</p>
        <button type="button" :disabled="!!error || (!!user && !cloudReady)" @click="applyImport">
          确认合并导入</button
        ><button type="button" @click="pending = null">取消</button>
      </section>
      <p v-if="message" role="status">{{ message }}</p>
      <section v-if="error" role="alert" class="storage-error">
        <p>
          {{
            error === 'conflict'
              ? '其他标签页已修改资料，请重新载入后重试。'
              : error === 'load'
                ? '原有资料无法读取，已阻止覆盖。请先恢复存储访问或修复原数据。'
                : '浏览器存储不可用或已满，待导入内容未丢弃。'
          }}
        </p>
        <button type="button" @click="reload">重新载入已存资料</button>
      </section>
      <p v-if="record.coverage" class="coverage">
        {{ record.coverage }}<br />整理日期：{{ record.importedAt.slice(0, 10) }} ·
        原文更新时间逐条保留，整理日期不代表内容仍然有效。
      </p>
      <div class="library-layout">
        <aside>
          <h2>主题目录</h2>
          <button type="button" :aria-pressed="!category" @click="category = ''">
            全部资料 <span>{{ record.entries.length }}</span></button
          ><button
            v-for="group in counts"
            :key="group.name"
            type="button"
            :aria-pressed="category === group.name"
            @click="category = group.name"
          >
            {{ group.name }} <span>{{ group.count }}</span></button
          ><RouterLink to="/personal-finance">个人资产盘点 →</RouterLink>
        </aside>
        <section class="results" aria-label="整理后的资料">
          <div class="search">
            <input
              v-model="query"
              type="search"
              aria-label="搜索Notion资料"
              placeholder="搜索标题、摘要或下一步…"
            /><span role="status">{{ visible.length }} 条</span>
          </div>
          <section v-if="!record.entries.length" class="empty">
            <h2>导入已整理的 Notion 快照</h2>
            <p>
              选择整理文件即可载入分类、摘要、原文链接与站内入口。此页面不会向 Notion 索取访问令牌。
            </p>
          </section>
          <p v-else-if="!visible.length" role="status">没有匹配的资料，请更换主题或搜索词。</p>
          <article v-for="entry in visible" :key="entry.id" :data-notion-entry="entry.id">
            <header>
              <small>{{ entry.category }}</small
              ><span>{{ entry.status }}</span>
            </header>
            <h2>{{ entry.title }}</h2>
            <p>{{ entry.summary }}</p>
            <details>
              <summary>下一步与来源</summary>
              <p><b>整理建议：</b>{{ entry.nextAction }}</p>
              <small
                >原文更新时间：{{
                  entry.sourceUpdatedAt ? entry.sourceUpdatedAt.slice(0, 10) : '未提供'
                }}</small
              >
              <div class="links">
                <a :href="entry.sourceUrl" target="_blank" rel="noopener noreferrer"
                  >Notion 原文 ↗</a
                ><a
                  v-if="entry.externalUrl"
                  :href="entry.externalUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  >收藏链接（未重新核验） ↗</a
                ><RouterLink v-if="entry.destination" :to="entry.destination"
                  >关联站内工具 →</RouterLink
                >
              </div>
            </details>
          </article>
        </section>
      </div>
    </details>
  </main>
</template>

<style scoped>
.sync-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 16px;
  margin-bottom: 20px;
  border: 1px solid var(--border);
  border-radius: var(--panel-radius);
  background: var(--surface);
}
.sync-bar p {
  margin: 0;
  color: var(--muted);
}
.sync-bar button {
  flex-shrink: 0;
}
.report-intro,
.report-limits {
  padding: 24px;
  border: 1px solid var(--border);
  border-radius: var(--panel-radius);
  background: var(--surface);
  margin-bottom: 24px;
}
.report-intro > small {
  color: var(--muted);
}
.report-intro h2 {
  margin-top: 12px;
  font-size: 22px;
}
.report-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 24px;
  margin-top: 18px;
  font-size: 13px;
  color: var(--accent);
}
.reader-layout {
  display: grid;
  grid-template-columns: 230px minmax(0, 1fr);
  gap: 24px;
  align-items: start;
}
.chapter-nav {
  position: sticky;
  top: 88px;
  max-height: calc(100dvh - 110px);
  overflow-y: auto;
  padding: 20px;
  border: 1px solid var(--border);
  border-radius: var(--panel-radius);
  background: var(--surface);
}
.chapter-nav button {
  display: block;
  width: 100%;
  text-align: left;
  margin-bottom: 8px;
  line-height: 1.7;
}
.chapter-nav button[aria-pressed='true'] {
  border-color: var(--accent);
  color: var(--accent);
}
.chapter-nav label {
  display: block;
  font-size: 13px;
  margin-top: 16px;
}
.chapter-nav input {
  display: block;
  width: 100%;
  min-width: 0;
  margin-top: 8px;
  padding: 10px;
  border: 1px solid var(--border);
  background: var(--surface-soft);
  color: var(--ink);
  border-radius: 6px;
}
.report-body {
  min-width: 0;
}
.report-chapter h2 {
  font-size: 21px;
  line-height: 1.6;
}
.report-chapter h3 {
  font-size: 14px;
  margin: 24px 0 10px;
}
.chapter-summary {
  color: var(--accent);
  font-weight: 600;
}
.report-chapter ul,
.report-chapter ol {
  padding-left: 22px;
  font-size: 14px;
  line-height: 1.95;
}
.report-chapter li {
  margin-bottom: 12px;
  overflow-wrap: anywhere;
}
.chapter-cautions {
  background: var(--surface-soft);
  border-left: 3px solid var(--border);
  padding: 4px 16px 12px;
  margin: 20px 0;
}
.chapter-cautions p,
.report-limits p {
  color: var(--muted);
  font-size: 13px;
}
.chapter-sources a {
  display: inline-block;
  font-size: 12px;
  margin: 12px 16px 0 0;
}
.library-management > summary {
  padding: 18px;
  border: 1px solid var(--border);
  margin-bottom: 18px;
  font-weight: 600;
}
.notion-library {
  color: var(--ink);
}
h2 {
  font-size: 17px;
  margin: 0 0 10px;
}
p {
  font-size: 14px;
  line-height: 1.9;
  margin: 8px 0;
}
.storage-panel,
.import-preview,
.storage-error {
  padding: 22px;
  border: 1px solid var(--border);
  background: var(--surface);
  margin-bottom: 20px;
  border-radius: var(--panel-radius);
}
.storage-panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 24px;
}
.storage-panel p,
.coverage {
  color: var(--muted);
  font-size: 13px;
}
.actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: start;
}
.actions label {
  font-size: 13px;
}
input[type='file'] {
  display: block;
  max-width: 240px;
  margin-top: 8px;
}
button {
  padding: 9px 12px;
  border: 1px solid var(--border);
  background: var(--surface-soft);
  color: var(--ink);
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
}
button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.import-preview button {
  margin: 12px 12px 0 0;
}
.coverage {
  margin: 0 0 24px;
}
.library-layout {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 26px;
  align-items: start;
}
aside {
  padding: 20px;
  border: 1px solid var(--border);
  border-radius: var(--panel-radius);
  background: var(--surface);
}
aside button {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 8px;
  text-align: left;
}
aside button[aria-pressed='true'] {
  border-color: var(--accent);
  background: var(--accent-soft);
  color: var(--accent);
}
aside a {
  display: block;
  margin-top: 18px;
  font-size: 13px;
}
a {
  color: var(--accent);
}
.results {
  min-width: 0;
}
.search {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 18px;
}
.search input {
  flex: 1;
  min-width: 0;
  border: 1px solid var(--border);
  padding: 12px;
  background: var(--surface);
  color: var(--ink);
  border-radius: 6px;
}
.search span {
  white-space: nowrap;
  color: var(--muted);
  font-size: 13px;
}
article,
.empty {
  padding: 22px;
  border: 1px solid var(--border);
  background: var(--surface);
  border-radius: var(--panel-radius);
  margin-bottom: 14px;
}
article header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
  color: var(--muted);
  font-size: 12px;
}
article p {
  overflow-wrap: anywhere;
}
details {
  border-top: 1px solid var(--border);
  padding-top: 14px;
  margin-top: 16px;
}
summary {
  cursor: pointer;
  font-size: 13px;
}
details small {
  color: var(--muted);
}
.links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 20px;
  font-size: 13px;
  margin-top: 12px;
}
button:focus-visible,
a:focus-visible,
input:focus-visible,
summary:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}
@media (max-width: 900px) {
  .storage-panel,
  .library-layout {
    grid-template-columns: 1fr;
  }
  aside {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  aside h2,
  aside a {
    width: 100%;
  }
  aside button {
    width: auto;
    gap: 14px;
    margin: 0;
  }
  .actions {
    flex-direction: row;
    align-items: center;
    flex-wrap: wrap;
  }
}
</style>

<style scoped>
.notion-library {
  --accent: #18634b;
  --accent-soft: color-mix(in srgb, var(--accent) 8%, var(--surface));
}
:global(:root[data-theme='dark'] .notion-library) {
  --accent: #64c9b7;
}
.report-intro {
  padding: 32px;
  border-radius: 12px;
  border-top: 3px solid var(--accent);
}
.report-intro h2 {
  font-size: 28px;
  line-height: 1.5;
  margin: 14px 0;
  text-wrap: balance;
}
.intro-lead {
  max-width: 800px;
  color: var(--muted);
}
.execution-overview {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 24px;
  margin: 28px 0 18px;
}
.execution-overview > div {
  border-left: 1px solid var(--border);
  padding-left: 18px;
}
.execution-overview strong {
  display: block;
  font-size: 32px;
  font-weight: 600;
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
}
.execution-overview span {
  display: block;
  margin-top: 8px;
  color: var(--muted);
  font-size: 11px;
}
.completion-note {
  color: var(--muted);
  font-size: 12px;
}
.report-stats {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
  font-size: 11px;
  color: var(--muted);
}
.overview-context {
  margin: 14px 0 0;
  padding: 0;
  border: 0;
}
.overview-context summary {
  font-size: 12px;
  color: var(--muted);
}
.workspace-toolbar,
.reader-layout {
  scroll-margin-top: 88px;
}
.workspace-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin: 24px 0;
}
.workspace-toolbar p {
  font-size: 11px;
  color: var(--muted);
}
.mode-switch {
  display: flex;
  padding: 4px;
  gap: 4px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
}
.mode-switch button {
  background: transparent;
  border: 1px solid transparent;
  padding: 10px 18px;
}
.mode-switch button[aria-pressed='true'] {
  background: var(--accent-soft);
  color: var(--accent);
  border-color: var(--border);
}
.mode-switch span {
  font-variant-numeric: tabular-nums;
  margin-left: 8px;
}
.reader-layout {
  grid-template-columns: 200px minmax(0, 1fr);
}
.chapter-nav {
  border: 0;
  border-left: 1px solid var(--border);
  border-radius: 0;
  background: transparent;
  padding: 0 0 0 16px;
}
.chapter-nav h2 {
  font-size: 11px;
  color: var(--muted);
  padding: 0 12px;
  margin-bottom: 16px;
}
.chapter-nav button {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 8px;
  padding: 12px;
  margin: 0 0 4px;
  background: transparent;
  border: 1px solid transparent;
  font-size: 12px;
  line-height: 1.7;
}
.chapter-nav button[aria-pressed='true'] {
  background: var(--accent-soft);
  border-color: var(--border);
}
.chapter-nav button > span:nth-child(2) {
  flex: 1;
}
.nav-index {
  color: var(--muted);
  font-variant-numeric: tabular-nums;
  font-size: 10px;
}
.chapter-nav button small {
  width: 100%;
  padding-left: 22px;
  color: var(--muted);
  font-size: 10px;
}
.chapter-eyebrow {
  color: var(--accent);
  font-size: 10px;
}
.report-chapter .chapter-heading h2 {
  margin: 6px 0 12px;
  font-size: 22px;
}
.report-chapter.has-work {
  padding: 0;
  border: 0;
  background: transparent;
  margin-bottom: 40px;
}
.has-work .chapter-summary {
  margin: 0 0 24px;
  color: var(--muted);
  font-weight: 400;
  font-size: 13px;
}
.has-work .chapter-cautions {
  border-radius: 8px;
}
.wealth-personal-materials {
  margin: 24px 0;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 18px;
  background: var(--surface);
}
.wealth-personal-materials > summary {
  color: var(--accent);
  margin-bottom: 16px;
}
.note-message {
  padding: 12px 18px;
  border: 1px solid var(--accent);
  border-radius: 8px;
  margin-bottom: 20px;
}
@media (max-width: 900px) {
  .reader-layout {
    grid-template-columns: 1fr;
  }
  .chapter-nav {
    position: static;
    max-height: none;
    border-left: 0;
    padding: 0;
    display: flex;
    gap: 8px;
    overflow-x: auto;
    flex-wrap: nowrap;
    padding-bottom: 12px;
  }
  .chapter-nav h2 {
    display: none;
  }
  .chapter-nav button {
    min-width: 155px;
    flex: 0 0 155px;
    margin: 0;
    background: var(--surface);
    border-color: var(--border);
  }
  .chapter-nav label {
    flex: 0 0 190px;
    margin: 0;
    padding: 8px;
  }
}
@media (max-width: 540px) {
  .report-intro,
  .report-limits,
  .report-chapter {
    padding: 20px 16px;
  }
  .report-intro h2 {
    font-size: 24px;
  }
  .execution-overview {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 24px 12px;
  }
  .execution-overview strong {
    font-size: 28px;
  }
  .workspace-toolbar {
    margin: 18px 0;
  }
  .workspace-toolbar p {
    margin: 0;
  }
  .report-chapter .chapter-heading h2 {
    font-size: 21px;
  }
}
</style>
