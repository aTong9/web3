export type Role = 'admin' | 'editor' | 'viewer'
export type Permission =
  | 'admin.view'
  | 'users.manage'
  | 'analytics.view'
  | 'analytics.manage'
  | 'paper.manage'
  | 'technicalAlerts.manage'

export class AuthError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message)
  }
}

const rolePermissions: Record<Role, Permission[]> = {
  admin: [
    'admin.view',
    'users.manage',
    'analytics.view',
    'analytics.manage',
    'paper.manage',
    'technicalAlerts.manage',
  ],
  editor: ['analytics.view', 'paper.manage', 'technicalAlerts.manage'],
  viewer: ['analytics.view'],
}

const digest = async (value: string) => {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

const randomToken = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  return btoa(String.fromCharCode(...bytes))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '')
}

interface UserRow {
  id: string
  name: string
  email: string
  role: Role
  status: 'active' | 'disabled'
  created_at: string
  last_login_at: string | null
}
const publicUser = (row: UserRow) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  role: row.role,
  status: row.status,
  createdAt: row.created_at,
  lastLoginAt: row.last_login_at,
  permissions: rolePermissions[row.role],
})

export const authenticate = async (request: Request, env: Env, permission?: Permission) => {
  const token = request.headers.get('Authorization')?.match(/^Bearer\s+(.+)$/i)?.[1]
  if (!token) throw new AuthError(401, '请先登录')
  const row = await env.DB.prepare(
    `SELECT u.id,u.name,u.email,u.role,u.status,u.created_at,u.last_login_at FROM auth_sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>? AND u.status='active'`,
  )
    .bind(await digest(token), new Date().toISOString())
    .first<UserRow>()
  if (!row) throw new AuthError(401, '登录已失效')
  if (permission && !rolePermissions[row.role].includes(permission))
    throw new AuthError(403, '权限不足')
  return publicUser(row)
}

export const authStatus = async (env: Env) => ({
  initialized:
    ((await env.DB.prepare('SELECT COUNT(*) count FROM users').first<{ count: number }>())?.count ??
      0) > 0,
})

export const exchangeCode = async (
  env: Env,
  input: { code?: string; name?: string; email?: string },
) => {
  const code = input.code?.trim()
  if (!code || code.length < 20) throw new AuthError(400, '访问口令无效')
  const hash = await digest(code)
  const now = new Date().toISOString()
  let user = await env.DB.prepare(
    `SELECT u.id,u.name,u.email,u.role,u.status,u.created_at,u.last_login_at FROM access_codes c JOIN users u ON u.id=c.user_id WHERE c.token_hash=? AND c.used_at IS NULL AND c.expires_at>?`,
  )
    .bind(hash, now)
    .first<UserRow>()
  if (!user) {
    const status = await authStatus(env)
    const bootstrap = await env.DB.prepare(
      `SELECT value FROM system_settings WHERE key='bootstrap_token_hash'`,
    ).first<{ value: string }>()
    if (status.initialized || bootstrap?.value !== hash)
      throw new AuthError(401, '访问口令无效或已过期')
    const name = input.name?.trim() || 'Administrator'
    const email = input.email?.trim().toLowerCase()
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) throw new AuthError(400, '首次登录请填写有效邮箱')
    const id = crypto.randomUUID()
    await env.DB.batch([
      env.DB.prepare(
        `INSERT INTO users(id,name,email,role,status,created_at,updated_at,last_login_at) VALUES(?,?,?,'admin','active',?,?,?)`,
      ).bind(id, name, email, now, now, now),
      env.DB.prepare(`DELETE FROM system_settings WHERE key='bootstrap_token_hash'`),
    ])
    user = { id, name, email, role: 'admin', status: 'active', created_at: now, last_login_at: now }
  } else {
    await env.DB.batch([
      env.DB.prepare('UPDATE access_codes SET used_at=? WHERE token_hash=?').bind(now, hash),
      env.DB.prepare('UPDATE users SET last_login_at=?,updated_at=? WHERE id=?').bind(
        now,
        now,
        user.id,
      ),
    ])
  }
  const token = randomToken()
  const expiresAt = new Date(Date.now() + 30 * 86400000).toISOString()
  await env.DB.prepare(
    'INSERT INTO auth_sessions(id,user_id,token_hash,expires_at,created_at,last_seen_at) VALUES(?,?,?,?,?,?)',
  )
    .bind(crypto.randomUUID(), user.id, await digest(token), expiresAt, now, now)
    .run()
  return { token, expiresAt, user: publicUser(user) }
}

export const logout = async (request: Request, env: Env) => {
  const token = request.headers.get('Authorization')?.match(/^Bearer\s+(.+)$/i)?.[1]
  if (token)
    await env.DB.prepare('DELETE FROM auth_sessions WHERE token_hash=?')
      .bind(await digest(token))
      .run()
}

export const listUsers = async (env: Env) =>
  (
    await env.DB.prepare(
      'SELECT id,name,email,role,status,created_at,last_login_at FROM users ORDER BY created_at',
    ).all<UserRow>()
  ).results.map(publicUser)

export const createUser = async (
  env: Env,
  actorId: string,
  input: { name?: string; email?: string; role?: Role },
) => {
  const name = input.name?.trim(),
    email = input.email?.trim().toLowerCase(),
    role = input.role
  if (
    !name ||
    !email ||
    !/^\S+@\S+\.\S+$/.test(email) ||
    !role ||
    !['admin', 'editor', 'viewer'].includes(role)
  )
    throw new AuthError(400, '用户信息无效')
  const id = crypto.randomUUID(),
    now = new Date().toISOString(),
    code = randomToken(),
    expiresAt = new Date(Date.now() + 7 * 86400000).toISOString()
  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO users(id,name,email,role,status,created_at,updated_at) VALUES(?,?,?,?,'active',?,?)`,
    ).bind(id, name, email, role, now, now),
    env.DB.prepare(
      'INSERT INTO access_codes(id,user_id,token_hash,expires_at,created_by,created_at) VALUES(?,?,?,?,?,?)',
    ).bind(crypto.randomUUID(), id, await digest(code), expiresAt, actorId, now),
    env.DB.prepare(
      `INSERT INTO admin_audit_log(id,actor_user_id,action,target_type,target_id,metadata,created_at) VALUES(?,?,'user.create','user',?,?,?)`,
    ).bind(crypto.randomUUID(), actorId, id, JSON.stringify({ role }), now),
  ])
  return {
    user: publicUser({
      id,
      name,
      email,
      role,
      status: 'active',
      created_at: now,
      last_login_at: null,
    }),
    accessCode: code,
    expiresAt,
  }
}

export const updateUser = async (
  env: Env,
  actorId: string,
  id: string,
  input: { role?: Role; status?: 'active' | 'disabled' },
) => {
  if (id === actorId && input.status === 'disabled') throw new AuthError(409, '不能停用当前账号')
  if (input.role && !['admin', 'editor', 'viewer'].includes(input.role))
    throw new AuthError(400, '角色无效')
  if (input.status && !['active', 'disabled'].includes(input.status))
    throw new AuthError(400, '状态无效')
  await env.DB.prepare(
    'UPDATE users SET role=COALESCE(?,role),status=COALESCE(?,status),updated_at=? WHERE id=?',
  )
    .bind(input.role ?? null, input.status ?? null, new Date().toISOString(), id)
    .run()
}

export const analyticsConfig = async (env: Env, includeKey = false) => {
  const row = await env.DB.prepare(
    "SELECT enabled,host,project_key,autocapture,session_replay,consent_required,updated_at FROM analytics_settings WHERE id='default'",
  ).first<{
    enabled: number
    host: string
    project_key: string
    autocapture: number
    session_replay: number
    consent_required: number
    updated_at: string
  }>()
  return {
    provider: 'posthog',
    enabled: Boolean(row?.enabled && row.project_key),
    host: row?.host ?? '',
    projectKey: includeKey ? (row?.project_key ?? '') : row?.enabled ? row.project_key : '',
    autocapture: Boolean(row?.autocapture),
    sessionReplay: Boolean(row?.session_replay),
    consentRequired: Boolean(row?.consent_required),
    updatedAt: row?.updated_at ?? null,
  }
}

export const saveAnalytics = async (
  env: Env,
  actorId: string,
  input: {
    enabled?: boolean
    host?: string
    projectKey?: string
    autocapture?: boolean
    sessionReplay?: boolean
    consentRequired?: boolean
  },
) => {
  const host = input.host?.trim()
  if (!host || !/^https:\/\//.test(host)) throw new AuthError(400, 'Host 必须使用 HTTPS')
  if (input.enabled && !input.projectKey?.trim())
    throw new AuthError(400, '启用前请填写 Project Key')
  const now = new Date().toISOString()
  await env.DB.prepare(
    `UPDATE analytics_settings SET enabled=?,host=?,project_key=?,autocapture=?,session_replay=?,consent_required=?,updated_by=?,updated_at=? WHERE id='default'`,
  )
    .bind(
      input.enabled ? 1 : 0,
      host,
      input.projectKey?.trim() ?? '',
      input.autocapture ? 1 : 0,
      input.sessionReplay ? 1 : 0,
      input.consentRequired ? 1 : 0,
      actorId,
      now,
    )
    .run()
  return analyticsConfig(env, true)
}
