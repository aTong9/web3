import { access, mkdir, rename, rm, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'

const pathExists = async (path) => access(path).then(() => true, () => false)

export const writeJsonBatchAtomic = async (entries, operations = {}) => {
  if (!Array.isArray(entries) || entries.length === 0) throw new Error('No JSON outputs provided')
  const paths = entries.map(({ outputPath }) => outputPath)
  if (new Set(paths).size !== paths.length) throw new Error('Duplicate JSON output path')

  const renameFile = operations.renameFile ?? rename
  const token = `${process.pid}.${Date.now()}.${Math.random().toString(16).slice(2)}`
  const prepared = entries.map(({ outputPath, value }) => {
    const serialized = `${JSON.stringify(value, null, 2)}\n`
    JSON.parse(serialized)
    return {
      outputPath,
      serialized,
      temporaryPath: `${outputPath}.${token}.tmp`,
      backupPath: `${outputPath}.${token}.bak`,
      hadOriginal: false,
    }
  })

  const backedUp = []
  const committed = []
  try {
    for (const item of prepared) {
      await mkdir(dirname(item.outputPath), { recursive: true })
      await writeFile(item.temporaryPath, item.serialized, { encoding: 'utf8', flag: 'wx' })
    }
    for (const item of prepared) {
      item.hadOriginal = await pathExists(item.outputPath)
      if (item.hadOriginal) {
        await renameFile(item.outputPath, item.backupPath)
        backedUp.push(item)
      }
    }
    for (const item of prepared) {
      await renameFile(item.temporaryPath, item.outputPath)
      committed.push(item)
    }
    await Promise.all(backedUp.map((item) => rm(item.backupPath, { force: true })))
  } catch (error) {
    await Promise.all(committed.map((item) => rm(item.outputPath, { force: true })))
    for (const item of backedUp.toReversed()) {
      if (await pathExists(item.backupPath)) await rename(item.backupPath, item.outputPath)
    }
    throw error
  } finally {
    await Promise.all(
      prepared.flatMap((item) => [item.temporaryPath, item.backupPath]).map((path) =>
        rm(path, { force: true }).catch(() => undefined),
      ),
    )
  }
}

export const writeJsonAtomic = async (outputPath, value) =>
  writeJsonBatchAtomic([{ outputPath, value }])
