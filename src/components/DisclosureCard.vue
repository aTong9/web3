<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    eyebrow?: string
    description?: string
    defaultOpen?: boolean
  }>(),
  { eyebrow: '', description: '', defaultOpen: false },
)
</script>

<template>
  <details class="disclosure-card" :open="defaultOpen">
    <summary>
      <span class="copy">
        <small v-if="eyebrow">{{ eyebrow }}</small>
        <strong>{{ title }}</strong>
        <em v-if="description">{{ description }}</em>
      </span>
      <span class="metric"><slot name="metric" /></span>
      <i aria-hidden="true">⌄</i>
    </summary>
    <div class="content"><slot /></div>
  </details>
</template>

<style scoped>
.disclosure-card {
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
  overflow: hidden;
}
summary {
  min-height: 72px;
  padding: 14px 16px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto 20px;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  list-style: none;
}
summary::-webkit-details-marker {
  display: none;
}
summary:hover {
  background: var(--surface-elevated);
}
summary:active {
  background: var(--surface-soft);
}
summary:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: -2px;
}
.copy small,
.copy strong,
.copy em {
  display: block;
}
.copy small {
  margin-bottom: 5px;
  color: var(--accent);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.copy strong {
  font-size: 14px;
}
.copy em {
  margin-top: 4px;
  overflow: hidden;
  color: var(--muted);
  font-size: 10px;
  font-style: normal;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.metric {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
summary i {
  color: var(--muted);
  font-style: normal;
  transition: transform 0.18s cubic-bezier(0.23, 1, 0.32, 1);
}
details[open] summary i {
  transform: rotate(180deg);
}
.content {
  padding: 0 18px 18px;
  border-top: 1px solid var(--border);
}
@media (max-width: 620px) {
  summary {
    grid-template-columns: minmax(0, 1fr) auto 16px;
  }
  .copy em {
    white-space: normal;
  }
}
</style>
