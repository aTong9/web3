<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { AnalyticsConfig, AppUser, UserRole } from '@/types'
import PermissionGate from '@/components/PermissionGate.vue'
import { adminApi } from '@/utils/admin-api'
import { useI18n } from '@/composables/use-i18n'

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
const load = async () => {
  try {
    const [u, a] = await Promise.all([adminApi.users(), adminApi.analytics()])
    users.value = u.users
    analytics.value = a
  } catch (e) {
    message.value = e instanceof Error ? e.message : t('admin.loadFailed')
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
}
</style>
