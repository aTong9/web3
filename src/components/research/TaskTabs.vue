<script setup lang="ts">
defineProps<{ modelValue: string; items: Array<{ id: string; label: string }>; label: string }>()
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <nav class="task-tabs" :aria-label="label">
    <button
      v-for="item in items"
      :key="item.id"
      :class="{ active: modelValue === item.id }"
      :aria-current="modelValue === item.id ? 'page' : undefined"
      @click="$emit('update:modelValue', item.id)"
    >
      {{ item.label }}
    </button>
  </nav>
</template>

<style scoped>
.task-tabs { padding: 5px; border: 1px solid var(--border); border-radius: 10px; background: var(--surface); display: flex; gap: 3px; overflow-x: auto; }
button { flex: 0 0 auto; min-height: var(--control-height); padding: 8px 14px; border: 0; border-radius: 7px; background: transparent; color: var(--muted); cursor: pointer; font-size: 11px; }
button.active { background: var(--accent-soft); color: var(--accent); font-weight: 700; }
</style>
