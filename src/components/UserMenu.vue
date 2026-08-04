<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuth } from '@/composables/use-auth'
import { useI18n } from '@/composables/use-i18n'
const { user, can, loading, login, logout } = useAuth()
const { t } = useI18n()
const open = ref(false),
  error = ref(''),
  form = ref({ code: '', name: '', email: '' })
const submit = async () => {
  error.value = ''
  try {
    await login(form.value)
    open.value = false
  } catch (e) {
    error.value = e instanceof Error ? e.message : t('userMenu.failed')
  }
}
const signOut = async () => {
  await logout()
  open.value = false
}
</script>
<template>
  <div class="user-menu">
    <button class="user-button" aria-haspopup="dialog" @click="open = !open">
      {{ user ? user.name.slice(0, 1).toUpperCase() : t('userMenu.login') }}
    </button>
    <div v-if="open" class="popover">
      <template v-if="user">
        <strong>{{ user.name }}</strong
        ><small>{{ user.email }} · {{ user.role }}</small>
        <RouterLink v-if="can('admin.view')" to="/admin" @click="open = false">{{
          t('userMenu.admin')
        }}</RouterLink>
        <button @click="signOut">{{ t('userMenu.logout') }}</button>
      </template>
      <form v-else @submit.prevent="submit">
        <strong>{{ t('userMenu.title') }}</strong
        ><small>{{ t('userMenu.hint') }}</small>
        <input
          v-model.trim="form.code"
          required
          minlength="20"
          :placeholder="t('userMenu.code')"
          autocomplete="one-time-code"
        />
        <input
          v-model.trim="form.name"
          :placeholder="t('userMenu.firstName')"
          autocomplete="name"
        />
        <input
          v-model.trim="form.email"
          type="email"
          :placeholder="t('userMenu.firstEmail')"
          autocomplete="email"
        />
        <p v-if="error">{{ error }}</p>
        <button :disabled="loading">
          {{ loading ? t('userMenu.validating') : t('userMenu.login') }}
        </button>
      </form>
    </div>
  </div>
</template>
<style scoped>
.user-menu {
  position: relative;
}
.user-button {
  width: 32px;
  height: 32px;
  border: 1px solid var(--border);
  border-radius: 50%;
  background: var(--surface-soft);
  color: var(--ink);
  cursor: pointer;
  font-size: 10px;
}
.popover {
  position: absolute;
  right: 0;
  top: 42px;
  width: 280px;
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--paper);
  box-shadow: 0 16px 45px #0002;
  display: grid;
  gap: 10px;
  z-index: 80;
}
.popover strong,
.popover small {
  display: block;
}
.popover small {
  color: var(--muted);
  font-size: 10px;
}
.popover a,
.popover button {
  border: 0;
  border-radius: 7px;
  padding: 9px;
  background: var(--surface-soft);
  color: var(--ink);
  text-align: left;
  text-decoration: none;
  cursor: pointer;
}
.popover input {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--border);
  border-radius: 7px;
  padding: 9px;
  background: var(--paper);
  color: var(--ink);
}
.popover form {
  display: grid;
  gap: 9px;
}
.popover p {
  margin: 0;
  color: var(--danger, #c44);
  font-size: 10px;
}
</style>
