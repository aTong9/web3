<script setup lang="ts">
import { useI18n } from '@/composables/use-i18n'
import readmeMd from '../../README.md?raw'

const { t } = useI18n()
const readmeContent = readmeMd
</script>

<template>
  <article class="about-page">
    <p class="eyebrow">{{ t('about.eyebrow') }}</p>
    <h1>{{ t('about.heading') }}</h1>

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

    <section class="readme-block">
      <span>04</span>
      <div>
        <h2>{{ t('about.readmeTitle') }}</h2>
        <p>{{ t('about.readmeDesc') }}</p>
        <pre>{{ readmeContent }}</pre>
      </div>
    </section>
  </article>
</template>

<style scoped>
.about-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 72px clamp(20px, 5vw, 64px) 90px;
}

.eyebrow {
  margin: 0 0 18px;
  color: var(--accent);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

h1 {
  max-width: 760px;
  margin: 0;
  font-family: Georgia, "Songti SC", serif;
  font-size: clamp(42px, 7vw, 72px);
  font-weight: 400;
  letter-spacing: -0.04em;
  line-height: 1.1;
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
  font-family: Georgia, "Songti SC", serif;
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

@media (max-width: 640px) {
  .lede {
    margin-left: 0;
  }
}
</style>
