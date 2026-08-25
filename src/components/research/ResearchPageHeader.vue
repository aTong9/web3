<script setup lang="ts">
withDefaults(
  defineProps<{
    eyebrow?: string
    title: string
    description?: string
    updatedAt?: string
    density?: 'compact' | 'comfortable'
    variant?: 'inverse' | 'plain'
  }>(),
  { eyebrow: '', description: '', updatedAt: '', density: 'compact', variant: 'inverse' },
)
</script>

<template>
  <header class="research-header" :class="[density, variant]">
    <div>
      <p v-if="eyebrow">{{ eyebrow }}</p>
      <h1>{{ title }}</h1>
      <span v-if="description">{{ description }}</span>
      <slot name="meta"></slot>
    </div>
    <aside v-if="$slots.status || updatedAt">
      <slot name="status">
        <small v-if="updatedAt">数据截至</small><b v-if="updatedAt">● 已更新</b
        ><time v-if="updatedAt">{{ updatedAt }}</time>
      </slot>
    </aside>
  </header>
</template>

<style scoped>
.research-header {
  margin-bottom: var(--space-section);
  padding: 26px 30px;
  border: 1px solid var(--border);
  border-radius: var(--panel-radius);
  background: linear-gradient(135deg, var(--inverse), color-mix(in srgb, var(--inverse) 82%, #416487));
  color: var(--inverse-text);
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 28px;
  align-items: center;
}
.research-header.comfortable { padding-block: 38px; }
.research-header.plain {
  background: var(--surface);
  color: var(--ink);
}
.research-header.plain p { color: var(--accent); }
.research-header.plain span { color: var(--muted); }
.research-header.plain aside { border-color: var(--border); }
.research-header.plain small,
.research-header.plain time { color: var(--muted); }
p { margin: 0; color: #92b7e9; font-size: 10px; font-weight: 800; letter-spacing: 0.16em; }
h1 { margin: 8px 0; font: 700 clamp(28px, 4vw, 44px)/1.1 Georgia, serif; }
span { max-width: 780px; color: color-mix(in srgb, var(--inverse-text) 72%, transparent); font-size: 14px; line-height: 1.8; display: block; }
aside { min-width: 130px; padding-left: 24px; border-left: 1px solid rgb(255 255 255 / 16%); }
small,b,time { display: block; }
small,time { color: color-mix(in srgb, var(--inverse-text) 58%, transparent); font-size: 10px; }
b { margin: 7px 0; color: #76d4a4; font-size: 12px; }
@media (max-width: 720px) {
  .research-header { padding: 22px; grid-template-columns: 1fr; gap: 16px; }
  aside { padding: 14px 0 0; border-top: 1px solid rgb(255 255 255 / 16%); border-left: 0; }
}
</style>
