import './assets/main.css'
import './assets/space-theme.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { registerSW } from 'virtual:pwa-register'

import App from './App.vue'
import router from './router'
import { isMissingModuleError, recoverStaleVersionOnce } from '@/utils/version-recovery'

if (import.meta.env.VITE_APP_TARGET !== 'electron') {
  if (['localhost', '127.0.0.1'].includes(location.hostname)) {
    // Preview shares the production base path; remove only this app's old offline worker.
    void navigator.serviceWorker
      ?.getRegistration(import.meta.env.BASE_URL)
      .then((registration) => {
        const scope = new URL(import.meta.env.BASE_URL, location.origin).href
        if (registration?.scope === scope) {
          void registration
            .unregister()
            .then((removed) => {
              if (removed && navigator.serviceWorker.controller?.scriptURL.startsWith(scope)) {
                location.reload()
              }
            })
            .catch((error) => console.warn('Local service worker cleanup failed:', error))
        }
      })
      .catch((error) => console.warn('Local service worker cleanup failed:', error))
  } else {
    window.addEventListener('vite:preloadError', (event) => {
      if (!isMissingModuleError(event.payload)) return
      if (recoverStaleVersionOnce()) event.preventDefault()
    })
    router.onError((error) => {
      if (isMissingModuleError(error)) recoverStaleVersionOnce()
    })
    registerSW({
      immediate: true,
      onRegisteredSW(_url, registration) {
        if (!registration) return
        // Keep long-lived tabs in step with newer deployments.
        const checkForUpdate = () => void registration.update().catch(() => undefined)
        window.setInterval(checkForUpdate, 60 * 60_000)
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') checkForUpdate()
        })
      },
    })
  }
}

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
