const recoveryKey = 'web3:asset-version-recovery'

// A stale page can reference assets removed by a newer deployment. Reload at most once per tab.
export const recoverStaleVersionOnce = (): boolean => {
  if (import.meta.env.DEV || import.meta.env.VITE_APP_TARGET === 'electron') return false
  try {
    if (sessionStorage.getItem(recoveryKey)) return false
    sessionStorage.setItem(recoveryKey, '1')
  } catch {
    return false
  }
  window.location.reload()
  return true
}

export const isMissingModuleError = (error: unknown): boolean =>
  error instanceof Error &&
  /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i.test(
    error.message,
  )
