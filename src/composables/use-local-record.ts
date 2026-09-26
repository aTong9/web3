import { ref, shallowRef } from 'vue'

export const useLocalRecord = <T>(
  storageKey: string,
  createEmpty: () => T,
  parse: (raw: string) => T,
) => {
  const record = shallowRef<T>(createEmpty())
  const error = ref<'load' | 'save' | 'conflict' | null>(null)
  let savedRaw: string | null = null
  let unreadable = true

  const reload = () => {
    try {
      const raw = window.localStorage.getItem(storageKey)
      const loaded = raw === null ? createEmpty() : parse(raw)
      record.value = loaded
      savedRaw = raw
      unreadable = false
      error.value = null
    } catch {
      unreadable = true
      error.value = 'load'
    }
  }

  const save = (next: T): boolean => {
    if (unreadable) {
      error.value = 'load'
      return false
    }
    try {
      const validated = parse(JSON.stringify(next))
      // ponytail: synchronous localStorage comparison detects stale tabs; atomic concurrent writes need an async transactional store.
      if (window.localStorage.getItem(storageKey) !== savedRaw) {
        error.value = 'conflict'
        return false
      }
      const raw = JSON.stringify(validated)
      window.localStorage.setItem(storageKey, raw)
      savedRaw = raw
      record.value = validated
      error.value = null
      return true
    } catch {
      error.value = 'save'
      return false
    }
  }

  reload()
  return { record, error, save, reload }
}
