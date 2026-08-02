import { readonly, ref } from 'vue'

export type AppTheme = 'light' | 'dark'

const storageKey = 'market-desk-theme'
const theme = ref<AppTheme>('light')
let initialized = false

const applyTheme = (value: AppTheme) => {
  theme.value = value
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.theme = value
    document.documentElement.style.colorScheme = value
  }
}

const initialize = () => {
  if (initialized || typeof window === 'undefined') return
  initialized = true
  const stored = window.localStorage.getItem(storageKey)
  const initial =
    stored === 'light' || stored === 'dark'
      ? stored
      : window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
  applyTheme(initial)
}

const setTheme = (value: AppTheme) => {
  initialize()
  applyTheme(value)
  window.localStorage.setItem(storageKey, value)
}

const toggleTheme = () => setTheme(theme.value === 'light' ? 'dark' : 'light')

export const useTheme = () => {
  initialize()
  return {
    theme: readonly(theme),
    setTheme,
    toggleTheme,
  }
}
