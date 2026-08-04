import { computed, readonly, ref } from 'vue'
import type { AppPermission, AppUser } from '@/types'
import { adminApi } from '@/utils/admin-api'

const user = ref<AppUser | null>(null)
const initialized = ref(false)
const loading = ref(false)

const restore = async () => {
  if (initialized.value) return
  initialized.value = true
  if (!localStorage.getItem('market-admin-session')) return
  try {
    user.value = (await adminApi.me()).user
  } catch {
    localStorage.removeItem('market-admin-session')
  }
}

export const useAuth = () => ({
  user: readonly(user),
  loading: readonly(loading),
  isAuthenticated: computed(() => Boolean(user.value)),
  can: (permission: AppPermission) => Boolean(user.value?.permissions.includes(permission)),
  restore,
  login: async (input: { code: string; name: string; email: string }) => {
    loading.value = true
    try {
      const result = await adminApi.exchange(input)
      localStorage.setItem('market-admin-session', result.token)
      user.value = result.user
    } finally {
      loading.value = false
    }
  },
  logout: async () => {
    try {
      await adminApi.logout()
    } finally {
      localStorage.removeItem('market-admin-session')
      user.value = null
    }
  },
})
