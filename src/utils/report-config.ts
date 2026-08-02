import { readonly, ref } from 'vue'
import type { DailyReportConfig } from '@/types'

const storageKey = 'market-desk-report-config'

const createDefaultConfig = (titlePrefix: string): DailyReportConfig => ({
  authorName: '',
  email: '',
  xHandle: '',
  titlePrefix,
  selectedMarketIds: ['sp500', 'nasdaq', 'shanghai', 'hsi'],
  chainCount: 3,
  includeDisclaimer: true,
})

let defaultConfig: DailyReportConfig = createDefaultConfig('全球市场每日报告')
const config = ref<DailyReportConfig>({ ...defaultConfig })
let initialized = false

const initialize = (titleProvider?: () => string) => {
  const localizedDefaultTitle = titleProvider ? titleProvider() : '全球市场每日报告'
  defaultConfig = createDefaultConfig(localizedDefaultTitle)

  if (initialized || typeof window === 'undefined') return
  initialized = true

  try {
    const saved = JSON.parse(window.localStorage.getItem(storageKey) ?? '{}')
    config.value = {
      ...defaultConfig,
      ...saved,
      titlePrefix: typeof saved.titlePrefix === 'string' && saved.titlePrefix.trim()
        ? saved.titlePrefix
        : defaultConfig.titlePrefix,
      selectedMarketIds: Array.isArray(saved.selectedMarketIds)
        ? saved.selectedMarketIds
        : defaultConfig.selectedMarketIds,
    }
  } catch {
    config.value = { ...defaultConfig }
  }
}

const save = (value: DailyReportConfig) => {
  config.value = {
    ...value,
    authorName: value.authorName.trim(),
    email: value.email.trim(),
    xHandle: value.xHandle.trim().replace(/^@/, ''),
    titlePrefix: value.titlePrefix.trim() || defaultConfig.titlePrefix,
  }
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(storageKey, JSON.stringify(config.value))
  }
}

const reset = () => {
  save({ ...defaultConfig })
}

export const useReportConfig = (titleProvider?: () => string) => {
  initialize(titleProvider)
  return { config: readonly(config), save, reset, defaultConfig }
}
