<script setup lang="ts">
import { ref } from 'vue'
import type { NotionWorkProduct } from '@/types/notion-library'

const props = defineProps<{
  products: NotionWorkProduct[]
  actions: string[]
}>()
const emit = defineEmits<{ saveNote: [id: string, note: string] }>()
const drafts = ref<Record<string, string>>({})
const labels = {
  prepared: '材料已整理',
  'needs-input': '待本人补充',
  'needs-verification': '待外部核验',
}
const draftNote = (item: NotionWorkProduct) => drafts.value[item.id] ?? item.notes
const saveNote = (item: NotionWorkProduct) => {
  emit('saveNote', item.id, draftNote(item))
}
</script>

<template>
  <section class="work-products" aria-label="建议执行成果">
    <article v-for="(item, index) in props.products" :key="item.id" class="work-card">
      <header class="work-card-header">
        <span class="work-number">{{ String(index + 1).padStart(2, '0') }}</span>
        <div>
          <small>建议 {{ item.actionIndex + 1 }} · 整理成果</small>
          <h3>{{ item.title }}</h3>
        </div>
        <span class="work-status" :data-status="item.status">{{ labels[item.status] }}</span>
      </header>
      <p class="work-result">{{ item.result }}</p>
      <details class="original-action">
        <summary>对应原建议</summary>
        <p>{{ props.actions[item.actionIndex] }}</p>
      </details>
      <p class="mobile-table-hint">横向滑动查看完整表格</p>
      <div class="table-scroll" role="region" :aria-label="item.title + '明细'" tabindex="0">
        <table :aria-label="item.title">
          <thead>
            <tr>
              <th v-for="(column, i) in item.columns" :key="i" scope="col">{{ column }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in item.rows" :key="i">
              <td v-for="(cell, j) in row" :key="j">{{ cell }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="work-next">
        <b>继续推进</b>
        <p>{{ item.nextStep }}</p>
      </div>
      <details class="work-notes">
        <summary>补充我的信息{{ item.notes ? ' · 已有记录' : '' }}</summary>
        <label :for="item.id + '-notes'">本人条件、实测结果或复查日期</label>
        <textarea
          :id="item.id + '-notes'"
          :value="draftNote(item)"
          maxlength="10000"
          rows="3"
          placeholder="记录真实预算、执行结果或需要补充的内容…"
          @input="drafts[item.id] = ($event.target as HTMLTextAreaElement).value"
        />
        <button type="button" @click="saveNote(item)">保存补充</button>
        <small>保存在当前浏览器，导出备份时一并保留。</small>
      </details>
    </article>
  </section>
</template>

<style scoped>
.work-card {
  margin: 0 0 24px;
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  background: var(--surface);
}
.work-card-header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 24px 24px 0;
}
.work-number {
  font-size: 22px;
  color: var(--muted);
  font-variant-numeric: tabular-nums;
  line-height: 1.4;
}
.work-card-header > div {
  flex: 1;
  min-width: 0;
}
.work-card-header small {
  color: var(--muted);
  font-size: 11px;
}
h3 {
  font-size: 18px;
  line-height: 1.6;
  margin: 4px 0 0;
  text-wrap: balance;
}
.work-status {
  flex-shrink: 0;
  color: var(--muted);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 4px 10px;
  font-size: 11px;
}
.work-status[data-status='prepared'] {
  color: var(--accent);
  background: var(--accent-soft);
  border-color: var(--accent);
}
p {
  font-size: 14px;
  line-height: 1.85;
  text-wrap: pretty;
}
.work-result {
  margin: 14px 24px;
  color: var(--muted);
}
.original-action {
  margin: 0 24px 18px;
  font-size: 12px;
  color: var(--muted);
}
summary {
  cursor: pointer;
}
.mobile-table-hint {
  display: none;
}
.table-scroll {
  overflow-x: auto;
  margin: 0 24px;
  border: 1px solid var(--border);
  border-radius: 8px;
}
table {
  width: 100%;
  min-width: 540px;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 13px;
  line-height: 1.85;
  font-variant-numeric: tabular-nums;
}
th {
  text-align: left;
  background: var(--surface-soft);
  font-size: 11px;
  color: var(--muted);
  font-weight: 600;
}
th,
td {
  padding: 12px 16px;
  vertical-align: top;
  overflow-wrap: anywhere;
}
th:first-child {
  width: 23%;
}
td:first-child {
  font-weight: 600;
}
tr + tr td {
  border-top: 1px solid var(--border);
}
.work-next {
  margin: 20px 24px;
  padding: 14px 16px;
  border-left: 2px solid var(--accent);
  background: var(--accent-soft);
}
.work-next b {
  font-size: 11px;
  color: var(--accent);
}
.work-next p {
  margin: 4px 0 0;
  font-size: 13px;
}
.work-notes {
  border-top: 1px solid var(--border);
  padding: 16px 24px;
  font-size: 12px;
}
.work-notes label {
  display: block;
  margin: 16px 0 8px;
  color: var(--muted);
}
textarea {
  width: 100%;
  resize: vertical;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface-soft);
  color: var(--ink);
  padding: 12px;
  font: inherit;
  line-height: 1.8;
}
button {
  margin-top: 10px;
  padding: 9px 14px;
  border: 1px solid var(--accent);
  border-radius: 6px;
  color: var(--accent);
  background: var(--accent-soft);
  cursor: pointer;
}
.work-notes > small {
  display: block;
  margin-top: 10px;
  color: var(--muted);
}
:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}
@media (max-width: 540px) {
  .mobile-table-hint {
    display: block;
    font-size: 11px;
    margin: 0 16px 8px;
    color: var(--muted);
  }
  .work-card-header {
    padding: 18px 16px 0;
    gap: 10px;
    flex-wrap: wrap;
  }
  .work-card-header > div {
    flex-basis: calc(100% - 45px);
  }
  .work-status {
    margin-left: 35px;
  }
  .work-result {
    margin: 14px 16px;
  }
  .table-scroll {
    margin: 0 16px;
  }
  .work-next {
    margin: 18px 16px;
  }
  .original-action {
    margin-left: 16px;
    margin-right: 16px;
  }
  .work-notes {
    padding: 16px;
  }
  h3 {
    font-size: 17px;
  }
}
</style>
