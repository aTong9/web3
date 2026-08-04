import { ref } from 'vue'
import { adminApi } from '@/utils/admin-api'

const consentNeeded = ref(false),
  ready = ref(false)
let client: typeof import('posthog-js').default | null = null

const start = async (force = false) => {
  let config
  try {
    config = await adminApi.publicAnalytics()
  } catch {
    return
  }
  if (!config.enabled || !config.projectKey) return
  if (
    config.consentRequired &&
    localStorage.getItem('market-analytics-consent') !== 'granted' &&
    !force
  ) {
    consentNeeded.value = true
    return
  }
  const { default: posthog } = await import('posthog-js')
  posthog.init(config.projectKey, {
    api_host: config.host,
    autocapture: config.autocapture,
    disable_session_recording: !config.sessionReplay,
    capture_pageview: false,
    person_profiles: 'identified_only',
  })
  client = posthog
  ready.value = true
  consentNeeded.value = false
}

export const useAnalytics = () => ({
  consentNeeded,
  ready,
  start,
  grant: async () => {
    localStorage.setItem('market-analytics-consent', 'granted')
    await start(true)
  },
  decline: () => {
    localStorage.setItem('market-analytics-consent', 'declined')
    consentNeeded.value = false
  },
  capture: (event: string, properties?: Record<string, unknown>) =>
    client?.capture(event, properties),
})
