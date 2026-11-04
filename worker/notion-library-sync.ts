import { parseNotionLibrary } from '../src/utils/notion-library'

interface LibraryRow {
  payload: string
  revision: number
  updated_at: string
}

export class NotionLibrarySyncError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message)
  }
}

export const loadNotionLibrary = async (env: Env, userId: string) => {
  const row = await env.DB.prepare(
    'SELECT payload, revision, updated_at FROM notion_libraries WHERE user_id = ?',
  )
    .bind(userId)
    .first<LibraryRow>()
  return row
    ? {
        library: parseNotionLibrary(row.payload),
        revision: row.revision,
        updatedAt: row.updated_at,
      }
    : { library: null, revision: 0, updatedAt: null }
}

export const saveNotionLibrary = async (env: Env, userId: string, input: unknown) => {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw new NotionLibrarySyncError(400, '请求格式无效')
  const { library, revision } = input as { library?: unknown; revision?: unknown }
  if (!Number.isSafeInteger(revision) || (revision as number) < 0)
    throw new NotionLibrarySyncError(400, '版本号无效')
  let payload: string
  try {
    payload = JSON.stringify(parseNotionLibrary(JSON.stringify(library)))
    if (new TextEncoder().encode(payload).byteLength > 2_000_000) throw new Error('Too large')
  } catch {
    throw new NotionLibrarySyncError(400, '资料格式无效或超过2MB')
  }
  const expectedRevision = revision as number
  const updatedAt = new Date().toISOString()
  const result =
    expectedRevision === 0
      ? await env.DB.prepare(
          'INSERT INTO notion_libraries (user_id, payload, revision, updated_at) VALUES (?, ?, 1, ?) ON CONFLICT(user_id) DO NOTHING',
        )
          .bind(userId, payload, updatedAt)
          .run()
      : await env.DB.prepare(
          'UPDATE notion_libraries SET payload = ?, revision = revision + 1, updated_at = ? WHERE user_id = ? AND revision = ?',
        )
          .bind(payload, updatedAt, userId, expectedRevision)
          .run()
  if (result.meta.changes !== 1)
    throw new NotionLibrarySyncError(409, '账号资料已更新，请先导出本地修改，再重新载入账号资料')
  return { library: JSON.parse(payload), revision: expectedRevision + 1, updatedAt }
}
