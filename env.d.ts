/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TARGET?: 'web' | 'electron'
}

declare module 'virtual:data-health' {
  const snapshots: import('./src/types/data-health').DataHealthSnapshot[]
  export default snapshots
}
