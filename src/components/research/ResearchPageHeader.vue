<script setup lang="ts">
withDefaults(
  defineProps<{
    eyebrow?: string
    title: string
    description?: string
    updatedAt?: string
    density?: 'compact' | 'comfortable' | 'workbench'
    variant?: 'inverse' | 'plain'
    statusWidth?: 'compact' | 'wide'
  }>(),
  {
    eyebrow: '',
    description: '',
    updatedAt: '',
    density: 'compact',
    variant: 'inverse',
    statusWidth: 'compact',
  },
)
</script>

<template>
  <header class="research-header" :class="[density, variant, `${statusWidth}-status`]">
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
  position: relative;
  isolation: isolate;
  overflow: hidden;
  margin-bottom: var(--space-section);
  padding: 26px 30px;
  border: 1px solid var(--border);
  border-radius: var(--panel-radius);
  background:
    radial-gradient(ellipse at 95% 0, #377e6a55, transparent 65%),
    linear-gradient(135deg, var(--inverse), color-mix(in srgb, var(--inverse) 82%, #416487));
  color: var(--inverse-text);
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 28px;
  align-items: center;
}
.research-header::before {
  content: '';
  position: absolute;
  z-index: -1;
  width: 280px;
  height: 280px;
  right: -90px;
  top: -150px;
  border: 1px solid rgb(150 220 198 / 16%);
  border-radius: 50%;
  box-shadow:
    0 0 0 38px rgb(150 220 198 / 4%),
    0 0 0 76px rgb(150 220 198 / 3%);
  pointer-events: none;
}
.research-header > div,
.research-header aside {
  min-width: 0;
}
@media (prefers-reduced-motion: no-preference) {
  .research-header > div {
    animation: header-enter 320ms ease-out;
  }
  @keyframes header-enter {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}
.research-header.comfortable {
  padding-block: 38px;
}
.research-header.wide-status {
  grid-template-columns: minmax(0, 1fr);
  gap: 22px;
  align-items: stretch;
}
.research-header.wide-status > div {
  max-width: 900px;
}
.research-header.wide-status aside {
  min-width: 0;
  padding: 22px 0 0;
  border-top: 1px solid rgb(255 255 255 / 16%);
  border-left: 0;
}
.research-header.plain {
  background: var(--surface);
  color: var(--ink);
}
.research-header.plain p {
  color: var(--accent);
}
.research-header.plain span {
  color: var(--muted);
}
.research-header.plain aside {
  border-color: var(--border);
}
.research-header.plain small,
.research-header.plain time {
  color: var(--muted);
}
p {
  margin: 0;
  color: #92b7e9;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.16em;
}
h1 {
  margin: 8px 0;
  font:
    700 clamp(28px, 4vw, 44px)/1.1 Georgia,
    serif;
}
span {
  max-width: 780px;
  color: color-mix(in srgb, var(--inverse-text) 72%, transparent);
  font-size: 14px;
  line-height: 1.8;
  display: block;
}
aside {
  min-width: 130px;
  padding-left: 24px;
  border-left: 1px solid rgb(255 255 255 / 16%);
}
small,
b,
time {
  display: block;
}
small,
time {
  color: color-mix(in srgb, var(--inverse-text) 58%, transparent);
  font-size: 10px;
}
b {
  margin: 7px 0;
  color: #76d4a4;
  font-size: 12px;
}
@media (max-width: 1050px) {
  .research-header.wide-status aside {
    padding: 18px 0 0;
  }
}
@media (max-width: 720px) {
  .research-header {
    padding: 22px;
    grid-template-columns: 1fr;
    gap: 16px;
  }
  aside {
    padding: 14px 0 0;
    border-top: 1px solid rgb(255 255 255 / 16%);
    border-left: 0;
  }
}

.research-header.workbench { padding: 0 0 20px; border: 0; border-bottom: 1px solid var(--border); border-radius: 0; background: none; color: var(--ink); margin-bottom: 20px; gap: 16px; }
.research-header.workbench::before { display: none; }
.research-header.workbench h1 { font-size: clamp(26px, 3vw, 36px); color: var(--ink); }
.research-header.workbench p, .research-header.workbench span { color: var(--muted); }
.research-header.workbench aside { border-color: var(--border); }
@media(max-width:720px) { .research-header.workbench { grid-template-columns: 1fr; } .research-header.workbench aside { padding: 0; border: 0; } .research-header.workbench > div > span { font-size: 12px; } }

</style>
