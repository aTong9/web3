import { readonly, ref } from 'vue'
import type { DailyReportConfig } from '@/types'

const storageKey = 'market-desk-report-config'
const defaultConfig: DailyReportConfig = {
  authorName: '',
  email: '',
  xHandle: '',
  titlePrefix: '全球市场每日报告',
  selectedMarketIds: ['sp500', 'nasdaq', 'shanghai', 'hsi'],
  chainCount: 3,
  includeDisclaimer: true,
}

const config = ref<DailyReportConfig>({ ...defaultConfig })
let initialized = false

const initialize = () => {
  if (initialized || typeof window === 'undefined') return
  initialized = true
  try {
    const saved = JSON.parse(window.localStorage.getItem(storageKey) ?? '{}')
    config.value = {
      ...defaultConfig,
      ...saved,
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
  window.localStorage.setItem(storageKey, JSON.stringify(config.value))
}

const reset = () => save({ ...defaultConfig })

export const useReportConfig = () => {
  initialize()
  return { config: readonly(config), save, reset, defaultConfig }
}
