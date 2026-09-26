import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { Plugin } from 'vite'
import { dataHealthDefinitions, inspectDataHealth } from '../src/utils/data-health'

export const dataHealthPlugin = (): Plugin => {
  const id = 'virtual:data-health'
  let root = ''
  return {
    name: 'data-health-metadata',
    configResolved(config) {
      root = config.root
    },
    resolveId(source) {
      if (source === id) return `\0${id}`
    },
    async load(source) {
      if (source !== `\0${id}`) return
      const snapshots = await Promise.all(
        dataHealthDefinitions.map(async (definition) => {
          const path = resolve(root, 'src/data', `${definition.id}.json`)
          this.addWatchFile(path)
          try {
            return inspectDataHealth(definition, JSON.parse(await readFile(path, 'utf8')))
          } catch {
            return inspectDataHealth(definition, null)
          }
        }),
      )
      return `export default ${JSON.stringify(snapshots)}`
    },
  }
}
