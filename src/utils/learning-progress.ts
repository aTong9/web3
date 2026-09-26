import type { LearningProgress } from '@/types/learning-paths'

export const emptyLearningProgress = (): LearningProgress => ({ version: 1, entries: [] })

export const parseLearningProgress = (raw: string): LearningProgress => {
  if (raw.length > 2_000_000) throw new Error('Backup too large')
  const value: unknown = JSON.parse(raw)
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid backup')
  const data = value as Record<string, unknown>
  if (
    data.version !== 1 ||
    Object.keys(data).length !== 2 ||
    !Array.isArray(data.entries) ||
    data.entries.length > 1000
  )
    throw new Error('Invalid backup')
  const seen = new Set<string>()
  const entries = data.entries.map((value: unknown) => {
    if (!value || typeof value !== 'object' || Array.isArray(value))
      throw new Error('Invalid entry')
    const entry = value as Record<string, unknown>
    if (
      Object.keys(entry).length !== 4 ||
      typeof entry.stepId !== 'string' ||
      !/^[a-z0-9][a-z0-9-]{0,119}$/.test(entry.stepId) ||
      seen.has(entry.stepId) ||
      typeof entry.completed !== 'boolean' ||
      typeof entry.note !== 'string' ||
      entry.note.length > 4000 ||
      typeof entry.updatedAt !== 'string' ||
      !Number.isFinite(Date.parse(entry.updatedAt)) ||
      new Date(entry.updatedAt).toISOString() !== entry.updatedAt
    )
      throw new Error('Invalid entry')
    seen.add(entry.stepId)
    return {
      stepId: entry.stepId,
      completed: entry.completed,
      note: entry.note,
      updatedAt: entry.updatedAt,
    }
  })
  return { version: 1, entries }
}
