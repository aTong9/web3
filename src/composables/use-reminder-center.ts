import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { ReminderItem, ReminderStatus, ReminderStore } from '@/types/reminders'
import { useLocalRecord } from '@/composables/use-local-record'
import { useResearchWorkspace } from '@/composables/use-research-workspace'
import { macroCalendarEvents } from '@/data/macro-calendar'
import megaCaps from '@/data/us-megacaps.json'
import { buildEarningsCalendar } from '@/utils/event-calendar'
import { emptyResearchWorkspace } from '@/utils/research-workspace'
import {
  buildReminders,
  countPendingReminders,
  emptyReminderStore,
  parseReminderStore,
  reminderStorageKey,
  setReminderState,
} from '@/utils/reminders'

const earnings = buildEarningsCalendar(megaCaps.stocks, megaCaps.updatedAt)
const events = [...macroCalendarEvents, ...earnings.events]

export const useReminderCenter = () => {
  const {
    record,
    error,
    save,
    reload: reloadStates,
  } = useLocalRecord(reminderStorageKey, emptyReminderStore, parseReminderStore)
  const {
    workspace,
    storageError: workspaceError,
    reload: reloadWorkspace,
  } = useResearchWorkspace()
  const now = ref(new Date())
  const actionError = ref<'source-changed' | 'invalid-date' | null>(null)
  const readableWorkspace = computed(() =>
    workspaceError.value ? emptyResearchWorkspace() : workspace.value,
  )
  const watchedIds = computed(() => readableWorkspace.value.watchlist.map((item) => item.assetId))
  const items = computed(() =>
    buildReminders({
      workspace: readableWorkspace.value,
      events,
      state: record.value,
      now: now.value,
    }),
  )
  const pendingCount = computed(() =>
    error.value === 'load' ? null : countPendingReminders(items.value, watchedIds.value, now.value),
  )
  const inactiveStateCount = computed(
    () =>
      record.value.states.filter(
        (state) =>
          !items.value.some((item) => item.id === state.id && item.revision === state.revision),
      ).length,
  )
  const reload = () => {
    reloadStates()
    reloadWorkspace()
    now.value = new Date()
    actionError.value = null
  }
  const act = (item: ReminderItem, status: ReminderStatus, date: string | null = null): boolean => {
    actionError.value = null
    reloadWorkspace()
    now.value = new Date()
    if (
      !items.value.some((current) => current.id === item.id && current.revision === item.revision)
    ) {
      actionError.value = 'source-changed'
      return false
    }
    let next: ReminderStore
    try {
      next = setReminderState(record.value, item, status, date, now.value)
    } catch {
      actionError.value = 'invalid-date'
      return false
    }
    return save(next)
  }
  const replaceBackup = (next: ReminderStore, expectedRaw: string | null): boolean => {
    try {
      const validated = parseReminderStore(JSON.stringify(next))
      if (window.localStorage.getItem(reminderStorageKey) !== expectedRaw) {
        error.value = 'conflict'
        return false
      }
      // Explicitly confirmed replacement also supports recovering unreadable reminder state.
      window.localStorage.setItem(reminderStorageKey, JSON.stringify(validated))
      reloadStates()
      return error.value === null
    } catch {
      error.value = 'save'
      return false
    }
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === reminderStorageKey) reloadStates()
    if (event.key === null || event.key === 'market-desk-research-workspace-v1') reloadWorkspace()
    actionError.value = null
  }
  let timer: number | undefined
  onMounted(() => {
    window.addEventListener('storage', onStorage)
    timer = window.setInterval(() => {
      now.value = new Date()
    }, 60_000)
  })
  onUnmounted(() => {
    window.removeEventListener('storage', onStorage)
    window.clearInterval(timer)
  })
  return {
    items,
    pendingCount,
    watchedIds,
    now,
    record,
    error,
    workspaceError,
    actionError,
    inactiveStateCount,
    earnings,
    earningsCheckedAt: megaCaps.updatedAt,
    reload,
    act,
    replaceBackup,
  }
}
