<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type {
  AnalyticsConfig,
  AppUser,
  TechnicalIndicatorConfig,
  TechnicalIndicatorConfigVersion,
  UserRole,
} from '@/types'
import PermissionGate from '@/components/PermissionGate.vue'
import { adminApi } from '@/utils/admin-api'
import { useI18n } from '@/composables/use-i18n'
import {
  defaultTechnicalIndicatorConfig,
  technicalConfigApi,
} from '@/utils/technical-config'

const { t } = useI18n()

const users = ref<AppUser[]>([]),
  message = ref(''),
  accessCode = ref('')
const newUser = ref<{ name: string; email: string; role: UserRole }>({
  name: '',
  email: '',
  role: 'viewer',
})
const analytics = ref<AnalyticsConfig>({
  provider: 'posthog',
  enabled: false,
  host: 'https://us.i.posthog.com',
  projectKey: '',
  autocapture: false,
  sessionReplay: false,
  consentRequired: true,
  updatedAt: null,
})
const technicalConfig = ref<TechnicalIndicatorConfig>(
  structuredClone(defaultTechnicalIndicatorConfig),
)
const technicalVersions = ref<TechnicalIndicatorConfigVersion[]>([])
const sourcePriorityText = ref(defaultTechnicalIndicatorConfig.sourcePriority.join('\n'))
const technicalSaving = ref(false)
const load = async () => {
  try {
    const [u, a, technical] = await Promise.all([
      adminApi.users(),
      adminApi.analytics(),
      technicalConfigApi.adminConfig(),
    ])
    users.value = u.users
    analytics.value = a
    technicalConfig.value = technical.config
    technicalVersions.value = technical.versions
    sourcePriorityText.value = technical.config.sourcePriority.join('\n')
  } catch (e) {
    message.value = e instanceof Error ? e.message : t('admin.loadFailed')
  }
}
const applyTechnicalTemplate = (template: 'trend' | 'swing' | 'options') => {
  const templates = {
    trend: { trend: 0.5, momentum: 0.15, volatility: 0.1, volume: 0.1, crossAsset: 0.15 },
    swing: { trend: 0.3, momentum: 0.3, volatility: 0.2, volume: 0.05, crossAsset: 0.15 },
    options: { trend: 0.25, momentum: 0.15, volatility: 0.3, volume: 0.05, crossAsset: 0.25 },
  } as const
  technicalConfig.value.weights = { ...templates[template] }
  technicalConfig.value.enabled = {
    ...technicalConfig.value.enabled,
    maShort: true,
    maLong: template !== 'swing',
    macd: true,
    rsi: true,
    bollinger: true,
    atr: true,
    volume: true,
    crossAsset: true,
  }
}
const saveTechnicalConfig = async () => {
  technicalSaving.value = true
  message.value = ''
  try {
    technicalConfig.value.sourcePriority = sourcePriorityText.value
      .split('\n')
      .map((source) => source.trim())
      .filter(Boolean)
    const result = await technicalConfigApi.save(technicalConfig.value)
    technicalConfig.value = result.config
    technicalVersions.value = result.versions
    message.value = t('admin.technicalSaved')
  } catch (e) {
    message.value = e instanceof Error ? e.message : t('admin.saveFailed')
  } finally {
    technicalSaving.value = false
  }
}
const add = async () => {
  try {
    const r = await adminApi.createUser(newUser.value)
    accessCode.value = r.accessCode
    newUser.value = { name: '', email: '', role: 'viewer' }
    await load()
  } catch (e) {
    message.value = e instanceof Error ? e.message : t('admin.createFailed')
  }
}
const update = async (user: AppUser) => {
  await adminApi.updateUser(user.id, { role: user.role, status: user.status })
  message.value = t('admin.userUpdated')
}
const save = async () => {
  try {
    analytics.value = await adminApi.saveAnalytics(analytics.value)
    message.value = t('admin.analyticsSaved')
  } catch (e) {
    message.value = e instanceof Error ? e.message : t('admin.saveFailed')
  }
}
onMounted(load)
</script>
<template>
  <main class="admin-page">
    <header>
      <span>{{ t('admin.badge') }}</span>
      <h1>{{ t('admin.title') }}</h1>
      <p>{{ t('admin.intro') }}</p>
    </header>
    <p v-if="message" class="notice">{{ message }}</p>
    <PermissionGate permission="users.manage">
      <section class="card">
        <h2>{{ t('admin.users') }}</h2>
        <form class="create" @submit.prevent="add">
          <input v-model.trim="newUser.name" required :placeholder="t('admin.name')" /><input
            v-model.trim="newUser.email"
            required
            type="email"
            :placeholder="t('admin.email')"
          /><select v-model="newUser.role">
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
            <option value="admin">Admin</option></select
          ><button>{{ t('admin.create') }}</button>
        </form>
        <div v-if="accessCode" class="code">
          <b>{{ t('admin.oneTimeCode') }}</b
          ><code>{{ accessCode }}</code>
        </div>
        <div class="table">
          <div v-for="item in users" :key="item.id" class="row">
            <span
              ><b>{{ item.name }}</b
              ><small>{{ item.email }}</small></span
            ><select v-model="item.role" @change="update(item)">
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
              <option value="admin">Admin</option></select
            ><select v-model="item.status" @change="update(item)">
              <option value="active">{{ t('admin.active') }}</option>
              <option value="disabled">{{ t('admin.disabled') }}</option>
            </select>
          </div>
        </div>
      </section>
    </PermissionGate>
    <PermissionGate permission="analytics.view">
      <section class="card">
        <h2>{{ t('admin.analytics') }}</h2>
        <p>{{ t('admin.analyticsIntro') }}</p>
        <form class="analytics" @submit.prevent="save">
          <label>Host<input v-model.trim="analytics.host" required type="url" /></label
          ><label>Project Key<input v-model.trim="analytics.projectKey" autocomplete="off" /></label
          ><label
            ><input v-model="analytics.enabled" type="checkbox" />{{ t('admin.enabled') }}</label
          ><label
            ><input v-model="analytics.autocapture" type="checkbox" />{{
              t('admin.autocapture')
            }}</label
          ><label
            ><input v-model="analytics.sessionReplay" type="checkbox" />{{
              t('admin.replay')
            }}</label
          ><label
            ><input v-model="analytics.consentRequired" type="checkbox" />{{
              t('admin.consent')
            }}</label
          ><PermissionGate permission="analytics.manage"
            ><button>{{ t('admin.save') }}</button></PermissionGate
          >
        </form>
      </section>
    </PermissionGate>
    <PermissionGate permission="technicalConfig.manage">
      <section class="card technical-config-card">
        <header class="card-heading">
          <div>
            <h2>{{ t('admin.technicalConfig') }}</h2>
            <p>{{ t('admin.technicalConfigIntro') }}</p>
          </div>
          <span>v{{ technicalConfig.version }} · {{ technicalConfig.formulaVersion }}</span>
        </header>
        <div class="template-actions">
          <button type="button" @click="applyTechnicalTemplate('trend')">
            {{ t('admin.templateTrend') }}
          </button>
          <button type="button" @click="applyTechnicalTemplate('swing')">
            {{ t('admin.templateSwing') }}
          </button>
          <button type="button" @click="applyTechnicalTemplate('options')">
            {{ t('admin.templateOptions') }}
          </button>
        </div>
        <form class="technical-form" @submit.prevent="saveTechnicalConfig">
          <fieldset>
            <legend>{{ t('admin.enabledIndicators') }}</legend>
            <label v-for="key in Object.keys(technicalConfig.enabled)" :key="key">
              <input
                v-model="technicalConfig.enabled[key as keyof typeof technicalConfig.enabled]"
                type="checkbox"
              />
              {{ t(`admin.technicalIndicator.${key}`) }}
            </label>
          </fieldset>
          <fieldset class="parameter-grid">
            <legend>{{ t('admin.indicatorParameters') }}</legend>
            <label v-for="key in Object.keys(technicalConfig.parameters)" :key="key">
              <span>{{ t(`admin.technicalParameter.${key}`) }}</span>
              <input
                v-model.number="technicalConfig.parameters[key as keyof typeof technicalConfig.parameters]"
                required
                type="number"
                :step="key === 'bollingerMultiplier' ? 0.1 : 1"
              />
            </label>
          </fieldset>
          <fieldset class="parameter-grid">
            <legend>{{ t('admin.scoreWeights') }}</legend>
            <label v-for="key in Object.keys(technicalConfig.weights)" :key="key">
              <span>{{ t(`admin.technicalWeight.${key}`) }}</span>
              <input
                v-model.number="technicalConfig.weights[key as keyof typeof technicalConfig.weights]"
                required
                max="1"
                min="0"
                step="0.01"
                type="number"
              />
            </label>
            <small>{{ t('admin.weightHint') }}</small>
          </fieldset>
          <fieldset class="parameter-grid">
            <legend>{{ t('admin.displayDefaults') }}</legend>
            <label>
              <span>{{ t('admin.carouselInterval') }}</span>
              <input
                v-model.number="technicalConfig.display.carouselIntervalMs"
                max="30000"
                min="3000"
                required
                step="500"
                type="number"
              />
            </label>
            <label>
              <span>{{ t('admin.defaultRange') }}</span>
              <select v-model="technicalConfig.display.defaultRange">
                <option v-for="item in ['day', 'week', 'month', 'quarter', 'halfYear', 'year', 'threeYear', 'fiveYear']" :key="item" :value="item">
                  {{ t(`assetTechnical.rangeOption.${item}`) }}
                </option>
              </select>
            </label>
            <label class="checkbox-row">
              <input v-model="technicalConfig.display.carouselAutoPlay" type="checkbox" />
              {{ t('admin.carouselAutoPlay') }}
            </label>
            <label>
              <span>{{ t('admin.formulaVersion') }}</span>
              <input v-model.trim="technicalConfig.formulaVersion" required />
            </label>
          </fieldset>
          <label class="source-priority">
            <span>{{ t('admin.sourcePriority') }}</span>
            <textarea v-model="sourcePriorityText" rows="6"></textarea>
            <small>{{ t('admin.sourcePriorityHint') }}</small>
          </label>
          <button :disabled="technicalSaving" type="submit">
            {{ technicalSaving ? t('admin.saving') : t('admin.saveTechnical') }}
          </button>
        </form>
        <details class="version-ledger">
          <summary>{{ t('admin.versionLedger', { count: technicalVersions.length }) }}</summary>
          <div v-for="version in technicalVersions" :key="version.version">
            <b>v{{ version.version }}</b>
            <span>{{ version.formulaVersion }}</span>
            <time>{{ version.updatedAt }}</time>
          </div>
        </details>
      </section>
    </PermissionGate>
  </main>
</template>
<style scoped>
.admin-page {
  max-width: 1100px;
  margin: auto;
  padding: clamp(24px, 4vw, 48px);
}
header span {
  color: var(--accent);
  font-size: 10px;
  letter-spacing: 0.16em;
}
h1 {
  margin: 8px 0;
}
header p,
.card > p {
  color: var(--muted);
}
.card {
  margin-top: 20px;
  padding: 22px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--paper);
}
.create {
  display: grid;
  grid-template-columns: 1fr 1fr 130px auto;
  gap: 8px;
}
.card input,
.card select,
.card button {
  border: 1px solid var(--border);
  border-radius: 7px;
  padding: 9px;
  background: var(--surface-soft);
  color: var(--ink);
}
.card button {
  background: var(--accent);
  color: white;
  cursor: pointer;
}
.table {
  margin-top: 16px;
}
.row {
  display: grid;
  grid-template-columns: 1fr 130px 100px;
  gap: 10px;
  padding: 10px 0;
  border-top: 1px solid var(--border);
}
.row small {
  display: block;
  color: var(--muted);
}
.code {
  margin-top: 12px;
  padding: 12px;
  background: var(--surface-soft);
  display: grid;
  gap: 6px;
}
.code code {
  overflow-wrap: anywhere;
}
.analytics {
  display: grid;
  gap: 12px;
  max-width: 620px;
}
.analytics label {
  display: grid;
  gap: 5px;
}
.analytics label:has(input[type='checkbox']) {
  display: flex;
}
.card-heading {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: start;
}
.card-heading h2,
.card-heading p {
  margin: 0;
}
.card-heading p {
  margin-top: 6px;
  color: var(--muted);
  font-size: 12px;
}
.card-heading > span {
  padding: 6px 9px;
  border-radius: 16px;
  background: var(--surface-soft);
  color: var(--muted);
  font-size: 10px;
  white-space: nowrap;
}
.template-actions {
  margin: 18px 0;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.template-actions button {
  min-height: 36px;
  background: var(--surface-soft);
  color: var(--ink);
}
.technical-form {
  display: grid;
  gap: 16px;
}
.technical-form fieldset {
  margin: 0;
  padding: 14px;
  border: 1px solid var(--border);
  border-radius: 9px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.technical-form legend {
  padding: 0 6px;
  font-size: 12px;
  font-weight: 700;
}
.technical-form fieldset > label {
  display: flex;
  gap: 6px;
  align-items: center;
  font-size: 11px;
}
.technical-form .parameter-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}
.parameter-grid label {
  min-width: 0;
  display: grid !important;
  gap: 5px !important;
  align-items: initial !important;
}
.parameter-grid label span,
.source-priority > span {
  color: var(--muted);
  font-size: 10px;
}
.parameter-grid small {
  grid-column: 1 / -1;
  color: var(--muted);
  font-size: 9px;
}
.parameter-grid .checkbox-row {
  display: flex !important;
  align-items: center !important;
}
.source-priority {
  display: grid;
  gap: 6px;
}
.source-priority textarea {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 7px;
  padding: 10px;
  background: var(--surface-soft);
  color: var(--ink);
  resize: vertical;
}
.source-priority small {
  color: var(--muted);
  font-size: 9px;
}
.technical-form > button {
  justify-self: start;
  min-width: 160px;
}
.technical-form > button:disabled {
  opacity: 0.55;
  cursor: wait;
}
.version-ledger {
  margin-top: 18px;
  border-top: 1px solid var(--border);
}
.version-ledger summary {
  padding: 14px 0;
  font-size: 11px;
  font-weight: 700;
}
.version-ledger > div {
  padding: 8px 0;
  border-top: 1px solid var(--border);
  display: grid;
  grid-template-columns: 50px 1fr auto;
  gap: 10px;
  font-size: 10px;
}
.version-ledger time {
  color: var(--muted);
}
.notice {
  padding: 10px;
  border-left: 3px solid var(--accent);
  background: var(--surface-soft);
}
@media (max-width: 760px) {
  .create,
  .row {
    grid-template-columns: 1fr;
  }
  .admin-page {
    padding: 20px;
  }
  .technical-form .parameter-grid {
    grid-template-columns: 1fr 1fr;
  }
  .card-heading {
    display: grid;
  }
  .version-ledger > div {
    grid-template-columns: 42px 1fr;
  }
  .version-ledger time {
    grid-column: 2;
  }
}
@media (max-width: 480px) {
  .technical-form .parameter-grid {
    grid-template-columns: 1fr;
  }
}
</style>
