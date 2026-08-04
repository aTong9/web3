<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import DataUpdateStatus from '@/components/DataUpdateStatus.vue'
import crossAssetData from '@/data/cross-asset.json'
import marketHomeData from '@/data/market-home.json'
import type { CrossAssetDataset, DailyReportConfig, MarketHomeDataset } from '@/types'
import { buildDailyMarketReport } from '@/utils/daily-report'
import { useReportConfig } from '@/utils/report-config'
import { useI18n } from '@/composables/use-i18n'

const home = marketHomeData as MarketHomeDataset
const crossAsset = crossAssetData as CrossAssetDataset
const { t, locale } = useI18n()
const { config, save, reset, defaultConfig } = useReportConfig(() => t('report.defaultTitle'))
const draft = reactive<DailyReportConfig>({
  ...config.value,
  selectedMarketIds: [...config.value.selectedMarketIds],
})
const feedback = ref('')
const report = computed(() => buildDailyMarketReport(home, crossAsset, draft, t))

const saveConfig = () => {
  save({ ...draft, selectedMarketIds: [...draft.selectedMarketIds] })
  feedback.value = t('report.feedback.saved')
}
const resetConfig = () => {
  reset()
  Object.assign(draft, { ...defaultConfig, selectedMarketIds: [...defaultConfig.selectedMarketIds] })
  feedback.value = t('report.feedback.reset')
}
const copyText = async (value: string, message: string) => {
  try {
    await navigator.clipboard.writeText(value)
    feedback.value = message
  } catch {
    feedback.value = t('report.feedback.copyFail')
  }
}
const downloadMarkdown = () => {
  const blob = new Blob([report.value.markdown], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${report.value.asOfDate}-market-report.md`
  anchor.click()
  URL.revokeObjectURL(url)
  feedback.value = t('report.feedback.download')
}
const emailUrl = computed(
  () =>
    `mailto:${encodeURIComponent(draft.email)}?subject=${encodeURIComponent(report.value.emailSubject)}&body=${encodeURIComponent(report.value.markdown)}`,
)
const xUrl = computed(
  () => `https://x.com/intent/post?text=${encodeURIComponent(report.value.socialText)}`,
)
</script>

<template>
  <main class="report-page">
    <header class="page-heading">
      <div>
        <p>{{ t('report.badge') }}</p>
        <h1>{{ t('report.title') }}</h1>
        <span>{{ t('report.intro') }}</span>
      </div>
      <DataUpdateStatus
        :updated-at="home.updatedAt"
        schedule="crossAsset"
        :label="t('report.ready')"
      />
    </header>

    <section class="security-note">
      <b>{{ t('report.securityTitle') }}</b>
      <span>{{ t('report.securityText') }}</span>
    </section>

    <div class="report-layout">
      <section class="config-panel">
        <header><span>01</span><h2>{{ t('report.configTitle') }}</h2></header>
        <form @submit.prevent="saveConfig">
          <label>
            {{ t('report.author') }}
            <input v-model="draft.authorName" autocomplete="name" placeholder="FIRE Research" />
          </label>
          <label>
            {{ t('report.email') }}
            <input
              v-model="draft.email"
              type="email"
              autocomplete="email"
              placeholder="name@example.com"
            />
          </label>
          <label>
            {{ t('report.xHandle') }}
            <input v-model="draft.xHandle" :placeholder="t('report.xHandlePlaceholder')" />
          </label>
          <label>
            {{ t('report.reportTitle') }}
            <input v-model="draft.titlePrefix" :placeholder="t('report.defaultTitle')" />
          </label>
          <label>
            {{ t('report.chainCount') }}
            <select v-model.number="draft.chainCount">
              <option :value="1">{{ t('report.chainOpt1') }}</option>
              <option :value="3">{{ t('report.chainOpt3') }}</option>
              <option :value="5">{{ t('report.chainOpt5') }}</option>
            </select>
          </label>

          <fieldset>
            <legend>{{ t('report.includeMarkets') }}</legend>
            <label v-for="market in home.marketBrief.markets" :key="market.id" class="check-option">
              <input v-model="draft.selectedMarketIds" type="checkbox" :value="market.id" />
              <span>{{ market.name }}</span>
            </label>
          </fieldset>

          <label class="check-option disclaimer-option">
            <input v-model="draft.includeDisclaimer" type="checkbox" />
            <span>{{ t('report.riskDisclaimer') }}</span>
          </label>

          <div class="form-actions">
            <button type="submit" class="primary">{{ t('report.save') }}</button>
            <button type="button" @click="resetConfig">{{ t('report.reset') }}</button>
          </div>
        </form>

        <details class="automation-note">
          <summary>{{ t('report.automation') }} <i aria-hidden="true">⌄</i></summary>
          <div>
            <p>{{ t('report.automationIntro') }}</p>
            <ul>
              <li>{{ t('report.automationEmail') }}</li>
              <li>{{ t('report.automationX') }}</li>
            </ul>
            <p>{{ t('report.automationDone') }}</p>
          </div>
        </details>
      </section>

      <section class="preview-panel">
        <header>
          <div><span>02</span><h2>{{ t('report.previewTitle') }}</h2></div>
          <small>{{
            t('report.charCount', {
              count: report.markdown.length.toLocaleString(
                locale === 'en' ? 'en-US' : 'zh-CN',
              ),
            })
          }}</small>
        </header>
        <pre>{{ report.markdown }}</pre>
        <div class="publish-actions">
          <button class="primary" @click="copyText(report.markdown, t('report.feedback.copyFull'))">
            {{ t('report.copyFull') }}
          </button>
          <button @click="downloadMarkdown">{{ t('report.downloaded') }}</button>
          <a :href="emailUrl">{{ t('report.openMail') }}</a>
        </div>

        <div class="social-preview">
          <header>
            <strong>{{ t('report.xHandle') }}</strong><small>{{ Array.from(report.socialText).length }}/280</small>
          </header>
          <p>{{ report.socialText }}</p>
          <div>
            <button @click="copyText(report.socialText, t('report.feedback.copyShort'))">
              {{ t('report.copyShort') }}
            </button>
            <a :href="xUrl" target="_blank" rel="noopener noreferrer">{{ t('report.openX') }}</a>
          </div>
        </div>
      </section>
    </div>

    <p v-if="feedback" class="feedback" role="status">{{ feedback }}</p>
  </main>
</template>

<style scoped>
.report-page {
  max-width: 1380px;
  margin: 0 auto;
  padding: 40px clamp(20px, 3.5vw, 52px) 80px;
}
.page-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 28px;
}
.page-heading p,
.config-panel header > span,
.preview-panel header span {
  margin: 0 0 10px;
  color: var(--accent);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.13em;
}
h1 {
  margin: 0 0 10px;
  font: 500 clamp(36px, 4.5vw, 54px) Georgia, 'Songti SC', serif;
  letter-spacing: -0.04em;
}
.page-heading > div > span {
  color: var(--muted);
  font-size: 12px;
}
.freshness {
  padding: 12px 15px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--surface);
  display: flex;
  align-items: center;
  gap: 10px;
}
.freshness i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 0 4px var(--accent-soft);
}
.freshness strong,
.freshness small {
  display: block;
}
.freshness strong {
  font-size: 12px;
}
.freshness small {
  margin-top: 3px;
  color: var(--muted);
  font-size: 10px;
}
.security-note {
  margin: 28px 0 18px;
  padding: 12px 14px;
  border-left: 3px solid var(--warning);
  background: var(--warning-soft);
  display: flex;
  gap: 12px;
  font-size: 11px;
}
.security-note span {
  color: var(--muted);
}
.report-layout {
  display: grid;
  grid-template-columns: minmax(340px, 0.78fr) minmax(0, 1.22fr);
  gap: 16px;
  align-items: start;
}
.config-panel,
.preview-panel {
  padding: 20px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
}
.config-panel > header,
.preview-panel > header,
.preview-panel > header > div {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.preview-panel > header {
  justify-content: space-between;
}
h2 {
  margin: 0;
  font: 500 24px Georgia, 'Songti SC', serif;
}
.preview-panel > header > small {
  color: var(--muted);
  font-size: 9px;
}
form {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}
form > label {
  color: var(--muted);
  display: grid;
  gap: 6px;
  font-size: 10px;
}
input,
select {
  width: 100%;
  min-height: 40px;
  padding: 0 11px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--surface-soft);
  color: var(--ink);
}
fieldset {
  grid-column: 1 / -1;
  margin: 0;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  display: flex;
  gap: 8px 14px;
  flex-wrap: wrap;
}
legend {
  padding: 0 5px;
  color: var(--muted);
  font-size: 10px;
}
.check-option {
  min-height: 32px;
  color: var(--ink);
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 10px;
}
.check-option input {
  width: 16px;
  min-height: 16px;
  accent-color: var(--accent);
}
.disclaimer-option,
.form-actions {
  grid-column: 1 / -1;
}
.form-actions,
.publish-actions,
.social-preview > div {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
button,
.publish-actions a,
.social-preview a {
  min-height: 40px;
  padding: 0 13px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--surface-soft);
  color: var(--ink);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 10px;
  text-decoration: none;
}
.primary {
  border-color: var(--accent);
  background: var(--accent);
  color: var(--inverse-text);
}
.automation-note {
  margin-top: 18px;
  border-top: 1px solid var(--border);
}
.automation-note summary {
  min-height: 44px;
  color: var(--accent);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 10px;
  font-weight: 700;
}
.automation-note summary i {
  font-style: normal;
}
.automation-note div {
  color: var(--muted);
  font-size: 10px;
  line-height: 1.65;
}
.automation-note ul {
  padding-left: 18px;
}
pre {
  max-height: 620px;
  margin: 18px 0 12px;
  padding: 18px;
  border-radius: 8px;
  background: var(--code-bg);
  color: var(--inverse-text);
  overflow: auto;
  font: 11px/1.75 ui-monospace, SFMono-Regular, Menlo, monospace;
  white-space: pre-wrap;
  word-break: break-word;
}
.social-preview {
  margin-top: 18px;
  padding: 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface-soft);
}
.social-preview header {
  display: flex;
  justify-content: space-between;
}
.social-preview header small {
  color: var(--muted);
}
.social-preview p {
  font-size: 11px;
  line-height: 1.65;
  white-space: pre-line;
}
.feedback {
  margin: 14px 0 0;
  color: var(--accent);
  font-size: 11px;
}
@media (max-width: 980px) {
  .report-layout {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 680px) {
  .report-page {
    padding: 24px 14px 60px;
  }
  .page-heading {
    align-items: start;
    flex-direction: column;
  }
  .security-note {
    flex-direction: column;
  }
  form {
    grid-template-columns: 1fr;
  }
  form > label,
  fieldset,
  .disclaimer-option,
  .form-actions {
    grid-column: 1;
  }
  .config-panel,
  .preview-panel {
    padding: 16px;
  }
}
</style>
