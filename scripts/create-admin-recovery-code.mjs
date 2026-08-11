import { createHash, randomBytes, randomUUID } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const wranglerPath = resolve(root, 'node_modules/wrangler/bin/wrangler.js')

const fail = (message) => {
  process.stderr.write(`${message}\n`)
  process.exit(1)
}

const argument = (name) => {
  const index = process.argv.indexOf(name)
  return index >= 0 ? process.argv[index + 1] : undefined
}

const email = argument('--email')?.trim().toLowerCase()
const minutes = Number(argument('--minutes') ?? 15)

if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
  fail('用法：npm run auth:recovery-code -- --email 管理员邮箱 [--minutes 15]')
}
if (!Number.isInteger(minutes) || minutes < 5 || minutes > 60) {
  fail('--minutes 必须是 5 至 60 之间的整数')
}
if (!existsSync(wranglerPath)) fail('未找到 Wrangler，请先运行 npm install')

const sqlLiteral = (value) => `'${String(value).replaceAll("'", "''")}'`
const execute = (sql) => {
  const result = spawnSync(
    process.execPath,
    [wranglerPath, 'd1', 'execute', 'DB', '--remote', '--json', '--command', sql],
    { cwd: root, encoding: 'utf8' },
  )
  if (result.status !== 0) fail(result.stderr.trim() || 'D1 命令执行失败')
  try {
    return JSON.parse(result.stdout)
  } catch {
    fail('无法解析 Wrangler 返回结果')
  }
}

const lookup = execute(
  `SELECT id FROM users WHERE email=${sqlLiteral(email)} AND role='admin' AND status='active' LIMIT 1`,
)
const adminId = lookup?.[0]?.results?.[0]?.id
if (!adminId) fail('未找到该邮箱对应的启用中管理员账号')

const code = `recovery_${randomBytes(32).toString('base64url')}`
const tokenHash = createHash('sha256').update(code).digest('hex')
const now = new Date()
const expiresAt = new Date(now.getTime() + minutes * 60_000)
const accessCodeId = randomUUID()
const auditId = randomUUID()
const metadata = JSON.stringify({ expiresAt: expiresAt.toISOString(), method: 'local-recovery' })

const writeResult = execute(
  [
    `INSERT INTO access_codes(id,user_id,token_hash,expires_at,used_at,created_by,created_at) VALUES(${sqlLiteral(accessCodeId)},${sqlLiteral(adminId)},${sqlLiteral(tokenHash)},${sqlLiteral(expiresAt.toISOString())},NULL,${sqlLiteral(adminId)},${sqlLiteral(now.toISOString())})`,
    `INSERT INTO admin_audit_log(id,actor_user_id,action,target_type,target_id,metadata,created_at) VALUES(${sqlLiteral(auditId)},${sqlLiteral(adminId)},'auth.recovery_code.create','user',${sqlLiteral(adminId)},${sqlLiteral(metadata)},${sqlLiteral(now.toISOString())})`,
  ].join(';'),
)

if (!writeResult?.every((item) => item.success)) fail('恢复口令未能完整写入 D1')

process.stdout.write(
  [
    '',
    '管理员一次性恢复口令（仅显示本次）：',
    code,
    '',
    `有效期至：${expiresAt.toISOString()}（${minutes} 分钟）`,
    '登录成功后该口令立即失效。请勿将它写入源码、聊天记录或 GitHub Secret。',
    '',
  ].join('\n'),
)
