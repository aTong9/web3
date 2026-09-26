<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { RouterLink, onBeforeRouteLeave } from 'vue-router'
import ResearchPageHeader from '@/components/research/ResearchPageHeader.vue'
import { useI18n } from '@/composables/use-i18n'
import { useLocalRecord } from '@/composables/use-local-record'
import { learningPaths } from '@/data/learning-paths'
import { emptyLearningProgress, parseLearningProgress } from '@/utils/learning-progress'

const { locale } = useI18n()
const en = computed(() => locale.value === 'en')
const { record, error, save, reload } = useLocalRecord(
  'market-desk-learning-progress-v1',
  emptyLearningProgress,
  parseLearningProgress,
)
const selected = ref(learningPaths[0]!.id)
const path = computed(() => learningPaths.find((item) => item.id === selected.value)!)
const drafts = reactive<Record<string, string>>({})
const message = ref('')
const upload = ref<HTMLInputElement | null>(null)
const entry = (stepId: string) => record.value.entries.find((item) => item.stepId === stepId)
const completed = (stepId: string) => entry(stepId)?.completed ?? false
const syncDrafts = () => {
  for (const key of Object.keys(drafts)) delete drafts[key]
  for (const step of learningPaths.flatMap((path) => path.steps))
    drafts[step.id] = entry(step.id)?.note ?? ''
}
syncDrafts()
const dirty = computed(() =>
  Object.entries(drafts).some(([id, note]) => note !== (entry(id)?.note ?? '')),
)
const done = (id: string) =>
  learningPaths.find((path) => path.id === id)!.steps.filter((step) => completed(step.id)).length
const progress = computed(() => Math.round((done(path.value.id) / path.value.steps.length) * 100))
const confirmDiscard = () =>
  !dirty.value ||
  window.confirm(en.value ? 'Discard unsaved learning notes?' : '放弃尚未保存的学习笔记？')
const saveStep = (stepId: string, isCompleted = completed(stepId)) => {
  const next = {
    stepId,
    completed: isCompleted,
    note: drafts[stepId] ?? '',
    updatedAt: new Date().toISOString(),
  }
  if (
    save({
      version: 1,
      entries: [...record.value.entries.filter((item) => item.stepId !== stepId), next],
    })
  ) {
    message.value = en.value ? 'Progress and notes saved.' : '进度与笔记已保存。'
  } else
    message.value = en.value
      ? 'Save failed. Your note remains in the editor.'
      : '保存失败，笔记草稿已保留。'
}
const toggleStep = (stepId: string, event: Event) => {
  const input = event.target as HTMLInputElement
  saveStep(stepId, input.checked)
  input.checked = completed(stepId)
}
const reloadSaved = () => {
  if (!confirmDiscard()) return
  reload()
  if (!error.value) syncDrafts()
}
const exportBackup = () => {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(record.value, null, 2)], { type: 'application/json' }),
  )
  const link = document.createElement('a')
  link.href = url
  link.download = 'learning-progress-backup.json'
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
const importBackup = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    if (file.size > 2_000_000) throw new Error('Backup too large')
    const next = parseLearningProgress(await file.text())
    if (
      !window.confirm(
        en.value
          ? 'Replace all saved progress and unsaved notes with this backup?'
          : '使用此备份替换全部已存进度及未保存笔记？',
      )
    )
      return
    if (save(next)) {
      syncDrafts()
      message.value = en.value ? 'Backup restored.' : '备份已恢复。'
    }
  } catch {
    message.value = en.value
      ? 'Invalid backup. Existing data was kept.'
      : '备份无效，原有记录保持不变。'
  } finally {
    input.value = ''
  }
}
const storageMessage = computed(() => {
  if (error.value === 'load')
    return en.value
      ? 'Stored progress is unreadable. It has not been overwritten; repair or restore access to the original data first.'
      : '已存进度无法读取，原数据未被覆盖；请先修复原数据或恢复浏览器存储访问。'
  if (error.value === 'conflict')
    return en.value
      ? 'Another tab changed your progress. Reload saved records before saving.'
      : '其他标签页已更改进度，请重新载入已保存记录后再操作。'
  return en.value
    ? 'Browser storage is unavailable or full. Your unsaved notes remain here.'
    : '浏览器存储不可用或空间不足，未保存笔记已保留。'
})
const beforeUnload = (event: BeforeUnloadEvent) => {
  if (dirty.value) {
    event.preventDefault()
    event.returnValue = ''
  }
}
onMounted(() => window.addEventListener('beforeunload', beforeUnload))
onUnmounted(() => window.removeEventListener('beforeunload', beforeUnload))
onBeforeRouteLeave(confirmDiscard)
</script>

<template>
  <main class="learning-page ph-no-capture">
    <ResearchPageHeader
      eyebrow="LEARN & PRACTICE"
      :title="en ? 'Topic learning paths' : '专题学习路线'"
      :description="
        en
          ? 'Turn selected resources into a small, reviewable piece of work.'
          : '将已有资源串成清晰步骤，每条路线完成一份可以复查的小成果。'
      "
    />
    <div class="learning-toolbar">
      <RouterLink to="/resources">{{ en ? 'Browse all resources' : '浏览全部资源' }} ↗</RouterLink>
      <button :disabled="error === 'load'" @click="exportBackup">
        {{ en ? 'Export saved progress' : '导出已存进度' }}
      </button>
      <button @click="upload?.click()">{{ en ? 'Restore backup' : '恢复备份' }}</button>
      <input
        ref="upload"
        hidden
        type="file"
        accept="application/json,.json"
        tabindex="-1"
        :aria-label="en ? 'Learning backup' : '学习进度备份'"
        @change="importBackup"
      />
    </div>
    <p class="muted">
      {{
        en
          ? 'Saved in this browser only. Notes are saved with the button or completion checkbox. Export before changing devices. The learning sequence is editorial guidance, not a certification or income promise.'
          : '进度只保存在当前浏览器；笔记通过保存按钮或完成勾选保存。更换设备前请导出备份。路线为编辑整理，不代表认证课程或收益承诺。'
      }}
    </p>
    <div v-if="error" class="notice" role="alert">
      {{ storageMessage }}
      <button @click="reloadSaved">{{ en ? 'Reload saved progress' : '重新载入已存进度' }}</button>
    </div>
    <p v-if="message" role="status">{{ message }}</p>
    <p v-if="dirty" class="muted">
      {{ en ? 'You have unsaved learning notes.' : '存在未保存的学习笔记。' }}
    </p>
    <nav class="path-options" :aria-label="en ? 'Choose a learning path' : '选择学习路线'">
      <button
        v-for="item in learningPaths"
        :key="item.id"
        :aria-pressed="selected === item.id"
        :class="{ selected: selected === item.id }"
        @click="selected = item.id"
      >
        <strong>{{ en ? item.titleEn : item.title }}</strong
        ><span>{{ done(item.id) }} / {{ item.steps.length }} {{ en ? 'complete' : '已完成' }}</span>
      </button>
    </nav>
    <section class="path-detail" :aria-label="en ? path.titleEn : path.title">
      <header class="path-header">
        <div>
          <h2>{{ en ? path.titleEn : path.title }}</h2>
          <p>{{ en ? path.goalEn : path.goal }}</p>
        </div>
        <strong>{{ progress }}%</strong>
      </header>
      <progress
        :value="done(path.id)"
        :max="path.steps.length"
        :aria-label="en ? 'Path completion' : '路线完成进度'"
      ></progress>
      <ol class="steps">
        <li
          v-for="(step, index) in path.steps"
          :key="step.id"
          :class="{ completed: completed(step.id) }"
        >
          <div class="step-heading">
            <span class="step-number">{{ index + 1 }}</span>
            <h3>{{ en ? step.titleEn : step.title }}</h3>
            <label class="done-label"
              ><input
                type="checkbox"
                :checked="completed(step.id)"
                :aria-label="`${en ? 'Complete' : '完成'}：${en ? step.titleEn : step.title}`"
                @change="toggleStep(step.id, $event)"
              />{{ en ? 'Done' : '完成' }}</label
            >
          </div>
          <p>{{ en ? step.taskEn : step.task }}</p>
          <div class="resources">
            <a
              v-for="resource in step.resources"
              :key="resource.url"
              :href="resource.url"
              target="_blank"
              rel="noopener noreferrer"
              >{{ resource.title }} ↗</a
            >
          </div>
          <label class="note-label"
            >{{ en ? 'Notes and evidence' : '笔记与成果记录'
            }}<textarea
              v-model="drafts[step.id]"
              rows="3"
              maxlength="4000"
              :aria-label="`${en ? 'Notes' : '笔记'}：${en ? step.titleEn : step.title}`"
              :placeholder="
                en
                  ? 'What did you learn? Where is your completed work?'
                  : '学到了什么？完成的作品或记录放在哪里？'
              "
            ></textarea>
          </label>
          <button
            :disabled="drafts[step.id] === (entry(step.id)?.note ?? '')"
            @click="saveStep(step.id)"
          >
            {{ en ? 'Save notes' : '保存笔记' }}
          </button>
        </li>
      </ol>
      <RouterLink class="destination" :to="path.destination"
        >{{ en ? 'Open the practice module' : '进入实践模块' }} →</RouterLink
      >
    </section>
    <p class="muted">
      {{
        en
          ? 'Resource entries checked on 2026-09-26. Availability, versions and access terms can change; refer to each original source. US financial education is not a statement of local tax or account rules.'
          : '资料入口核对日期：2026-09-26。可用性、版本与访问条件可能变化，请以原站为准。美国投资者教育资料不代表所在地的税务与账户规则。'
      }}
    </p>
  </main>
</template>

<style scoped>
.learning-page {
  max-width: var(--content-workbench);
  margin: 0 auto;
  padding: var(--space-section) var(--page-gutter) 70px;
  color: var(--ink);
}
.learning-toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}
button,
.destination {
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  color: var(--ink);
  padding: 10px 14px;
  min-height: 40px;
  font-size: 12px;
}
button:disabled {
  opacity: 0.5;
  cursor: default;
}
a {
  color: var(--accent);
}
.muted {
  color: var(--muted);
  font-size: 12px;
  line-height: 1.8;
  margin: 16px 0;
}
.notice {
  border: 1px solid var(--border);
  background: var(--surface-soft);
  border-radius: 8px;
  padding: 16px;
  line-height: 1.8;
}
.path-options {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin: 24px 0;
}
.path-options button {
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-align: left;
  padding: 18px;
}
.path-options .selected {
  outline: 2px solid var(--accent);
  outline-offset: -2px;
}
.path-options strong {
  font-size: 14px;
}
.path-options span {
  font-size: 12px;
  color: var(--muted);
}
.path-detail {
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
  background: var(--surface);
}
.path-header {
  display: flex;
  gap: 20px;
  justify-content: space-between;
}
.path-header strong {
  font-size: 24px;
  color: var(--accent);
}
h2 {
  font-size: 21px;
  margin: 0 0 10px;
}
.path-header p {
  color: var(--muted);
  font-size: 13px;
  line-height: 1.8;
}
progress {
  width: 100%;
  height: 8px;
  accent-color: var(--accent);
  margin-bottom: 24px;
}
.steps {
  padding: 0;
  list-style: none;
}
.steps li {
  padding: 22px 0;
  border-top: 1px solid var(--border);
}
.step-heading {
  display: flex;
  gap: 12px;
  align-items: center;
}
.step-number {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  background: var(--surface-soft);
  border-radius: 50%;
  font-weight: 700;
}
.completed .step-number {
  color: var(--accent);
}
h3 {
  font-size: 17px;
  margin: 0;
  flex: 1;
}
.done-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  flex-shrink: 0;
}
.done-label input {
  width: 18px;
  height: 18px;
  accent-color: var(--accent);
}
.steps p {
  font-size: 13px;
  line-height: 1.9;
  margin: 16px 0;
}
.resources {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;
  font-size: 12px;
  overflow-wrap: anywhere;
}
.note-label {
  display: grid;
  gap: 8px;
  font-size: 12px;
}
textarea {
  width: 100%;
  min-width: 0;
  resize: vertical;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface-soft);
  color: var(--ink);
  padding: 10px;
  line-height: 1.7;
  margin-bottom: 10px;
}
.destination {
  display: inline-block;
  text-decoration: none;
  color: var(--accent);
}
button:focus-visible,
a:focus-visible,
input:focus-visible,
textarea:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}
@media (max-width: 900px) {
  .path-options {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 600px) {
  .path-options button {
    padding: 14px;
  }
  .path-detail {
    padding: 16px;
  }
  h3 {
    font-size: 15px;
  }
  .step-heading {
    gap: 8px;
  }
}
</style>
