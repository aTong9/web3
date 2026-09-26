import { useLocalRecord } from '@/composables/use-local-record'
import { emptyResearchWorkspace, parseResearchWorkspace } from '@/utils/research-workspace'

export const useResearchWorkspace = () => {
  const { record, error, save, reload } = useLocalRecord(
    'market-desk-research-workspace-v1',
    emptyResearchWorkspace,
    parseResearchWorkspace,
  )
  return { workspace: record, storageError: error, commit: save, reload }
}
