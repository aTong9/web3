<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from '@/composables/use-i18n'
import ResearchPageHeader from '@/components/research/ResearchPageHeader.vue'

const { t } = useI18n()
const readmeContent = ref('')
const readmeOpen = ref(false)
const readmeLoading = ref(false)
const readmeError = ref(false)

const toggleReadme = async () => {
  if (readmeOpen.value) {
    readmeOpen.value = false
    return
  }
  if (readmeContent.value) {
    readmeOpen.value = true
    return
  }
  readmeLoading.value = true
  readmeError.value = false
  try {
    const module = await import('../../README.md?raw')
    readmeContent.value = module.default
    readmeOpen.value = true
  } catch (error) {
    readmeError.value = true
    console.warn('Project README failed to load:', error)
  } finally {
    readmeLoading.value = false
  }
}
</script>

<template>
  <article class="about-page">
    <ResearchPageHeader
      :eyebrow="t('about.eyebrow')"
      :title="t('about.heading')"
      variant="plain"
      density="comfortable"
    />

    <div class="lede">
      <p>{{ t('about.intro1') }}</p>
      <p>{{ t('about.intro2') }}</p>
    </div>

    <section>
      <span>01</span>
      <div>
        <h2>{{ t('about.section1Title') }}</h2>
        <p>{{ t('about.section1Desc') }}</p>
      </div>
    </section>

    <section>
      <span>02</span>
      <div>
        <h2>{{ t('about.section2Title') }}</h2>
        <p>{{ t('about.section2Desc') }}</p>
      </div>
    </section>

    <section>
      <span>03</span>
      <div>
        <h2>{{ t('about.section3Title') }}</h2>
        <p>{{ t('about.section3Desc') }}</p>
      </div>
    </section>

    <footer>{{ t('about.footer') }}</footer>

    <section class="architecture-block">
      <span>04</span>
      <div>
        <h2>{{ t('about.architectureTitle') }}</h2>
        <p>{{ t('about.architectureDesc') }}</p>
        <div class="architecture-flow" :aria-label="t('about.architectureTitle')">
          <article>
            <small>UI / RESEARCH</small>
            <strong>{{ t('about.uiLayerTitle') }}</strong>
            <p>{{ t('about.uiLayerDesc') }}</p>
          </article>
          <i aria-hidden="true">→</i>
          <article>
            <small>CONTROL / EVIDENCE</small>
            <strong>{{ t('about.controlLayerTitle') }}</strong>
            <p>{{ t('about.controlLayerDesc') }}</p>
          </article>
          <i aria-hidden="true">→</i>
          <article class="engine-layer">
            <small>PRIMARY ENGINE TARGET</small>
            <strong>{{ t('about.engineLayerTitle') }}</strong>
            <p>{{ t('about.engineLayerDesc') }}</p>
          </article>
        </div>
        <aside>
          <b>{{ t('about.architectureStatusTitle') }}</b>
          <p>{{ t('about.architectureStatusDesc') }}</p>
        </aside>
      </div>
    </section>

    <section class="readme-block">
      <span>05</span>
      <div>
        <h2>{{ t('about.readmeTitle') }}</h2>
        <p>{{ t('about.readmeDesc') }}</p>
        <button
          type="button"
          class="readme-toggle"
          :aria-expanded="readmeOpen"
          aria-controls="project-readme"
          :disabled="readmeLoading"
          @click="toggleReadme"
        >
          {{
            readmeLoading
              ? t('about.readmeLoading')
              : readmeOpen
                ? t('about.readmeClose')
                : readmeError
                  ? t('about.readmeRetry')
                  : t('about.readmeOpen')
          }}
        </button>
        <p v-if="readmeError" class="readme-error" role="alert">
          {{ t('about.readmeError') }}
        </p>
        <pre v-if="readmeOpen" id="project-readme">{{ readmeContent }}</pre>
      </div>
    </section>
  </article>
</template>

<style scoped>
.about-page {
  max-width: var(--content-standard);
  margin: 0 auto;
  padding: var(--space-section) var(--page-gutter) 90px;
}

.lede {
  margin: 56px 0 64px 28%;
  color: var(--muted);
  font-size: 15px;
  line-height: 1.85;
}

section {
  padding: 26px 0;
  border-top: 1px solid var(--border);
  display: grid;
  grid-template-columns: 72px 1fr;
}

section > span {
  color: var(--muted);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
}

h2 {
  margin: 0 0 8px;
  font-family: Georgia, 'Songti SC', serif;
  font-size: 21px;
  font-weight: 500;
}

section p {
  margin: 0;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.75;
}

footer {
  margin-top: 58px;
  padding-top: 18px;
  border-top: 1px solid var(--ink);
  color: var(--danger);
  font-size: 12px;
}

.architecture-flow {
  margin-top: 22px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr) auto minmax(0, 1fr);
  gap: 12px;
  align-items: stretch;
}

.architecture-flow article {
  padding: 18px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--surface);
}

.architecture-flow article.engine-layer {
  border-color: color-mix(in oklab, var(--accent) 50%, var(--border));
  background: var(--accent-soft);
}

.architecture-flow small,
.architecture-flow strong {
  display: block;
}

.architecture-flow small {
  color: var(--accent);
  font:
    700 9px ui-monospace,
    SFMono-Regular,
    Menlo,
    monospace;
}

.architecture-flow strong {
  margin: 9px 0;
  font-size: 14px;
}

.architecture-flow i {
  align-self: center;
  color: var(--muted);
  font-style: normal;
}

.architecture-block aside {
  margin-top: 14px;
  padding: 15px 18px;
  border-left: 3px solid var(--danger);
  background: var(--surface-soft);
}

.architecture-block aside b {
  display: block;
  margin-bottom: 5px;
  font-size: 11px;
}

.readme-block pre {
  margin: 16px 0 0;
  padding: 16px;
  max-height: 420px;
  overflow: auto;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: color-mix(in oklab, #000 78%, var(--card));
  color: var(--text);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.readme-toggle {
  margin-top: 16px;
  padding: 9px 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  color: var(--ink);
  font: inherit;
  cursor: pointer;
}

.readme-toggle:hover,
.readme-toggle:focus-visible {
  border-color: var(--accent);
}

.readme-toggle:disabled {
  cursor: wait;
  opacity: 0.65;
}

.readme-block .readme-error {
  margin-top: 10px;
  color: var(--danger);
}

@media (max-width: 640px) {
  .lede {
    margin-left: 0;
  }

  .architecture-flow {
    grid-template-columns: 1fr;
  }

  .architecture-flow i {
    justify-self: center;
    transform: rotate(90deg);
  }
}
</style>
