<script setup lang="ts">
import { computed, ref } from 'vue'
import type {
  TradingEvidenceAuditCheckpointVerification,
  TradingEvidenceBundleDiff,
  TradingEvidenceAuditVerification,
  TradingEvidenceCloudSnapshot,
  TradingEvidenceCloudVersion,
} from '@/types'
import { useI18n } from '@/composables/use-i18n'

const props = defineProps<{
  snapshot: TradingEvidenceCloudSnapshot | null
  busy: boolean
  error: string | null
  versions: TradingEvidenceCloudVersion[]
  preview: TradingEvidenceCloudSnapshot | null
  diff: TradingEvidenceBundleDiff | null
  audit: TradingEvidenceAuditVerification | null
  checkpointVerification: TradingEvidenceAuditCheckpointVerification | null
}>()
const emit = defineEmits<{
  refresh: []
  upload: []
  adopt: []
  preview: [revision: number]
  restore: [revision: number]
  exportCheckpoint: []
  verifyCheckpoint: [file: File]
}>()
const { locale } = useI18n()
const checkpointInput = ref<HTMLInputElement | null>(null)
const integrityBlocked = computed(
  () => Boolean(props.snapshot?.bundle) && (!props.audit || props.audit.status === 'broken'),
)
const copy = computed(() =>
  locale.value === 'zh'
    ? {
        eyebrow: '权限化云端证据',
        title: '跨设备审计资料包',
        warning:
          '仅同步回测、Paper遥测和人工核验；服务端拒绝疑似密钥、私钥或助记词。采用云端版本会覆盖当前设备的对应本地证据。',
        empty: '云端尚无资料包',
        revision: '修订版',
        updated: '更新时间',
        digest: '内容摘要',
        refresh: '重新读取',
        upload: '上传当前证据',
        adopt: '采用云端证据',
        busy: '同步中…',
        diff: '本地与对比版本差异',
        identical: '证据内容一致',
        backtest: '回测版本',
        sessions: '监控会话',
        cycles: '周期观测',
        gaps: '数据缺口',
        attestations: '核验项变化',
        history: '云端历史（最近20版）',
        current: '当前',
        preview: '预览差异',
        restore: '恢复为新版本',
        auditTitle: '同步审计链',
        auditStatuses: {
          empty: '尚无审计记录',
          valid: '完整可验证',
          partial: '旧记录部分可验证',
          broken: '完整性异常',
        },
        verified: '已验证记录',
        legacy: '旧记录',
        chainHead: '链头摘要',
        integrityBlocked: '审计状态缺失或异常，已禁止上传、采用和恢复；请先重新读取并排查链条。',
        exportCheckpoint: '导出链头检查点',
        verifyCheckpoint: '核对检查点文件',
        checkpointResult: '外部检查点核对',
        checkpointCurrent: '当前链头',
        checkpointAncestor: '历史祖先',
        checkpointInvalid: '不属于当前链',
        checkpointNotice:
          '检查点依靠独立保存形成外部锚点；导入并验证有效后会进入下一次综合评审包。它不是数字签名或实盘授权。',
      }
    : {
        eyebrow: 'PERMISSIONED CLOUD EVIDENCE',
        title: 'Cross-device audit bundle',
        warning:
          'Only backtest, Paper telemetry, and human attestations are synchronized. Suspected keys, private keys, or seed phrases are rejected. Adopting cloud evidence replaces the corresponding local evidence.',
        empty: 'No cloud bundle yet',
        revision: 'Revision',
        updated: 'Updated',
        digest: 'Content digest',
        refresh: 'Reload',
        upload: 'Upload current evidence',
        adopt: 'Adopt cloud evidence',
        busy: 'Syncing…',
        diff: 'Local vs selected cloud version',
        identical: 'Evidence is identical',
        backtest: 'Backtest version',
        sessions: 'Monitoring sessions',
        cycles: 'Cycle observations',
        gaps: 'Data gaps',
        attestations: 'Changed attestations',
        history: 'Cloud history (latest 20)',
        current: 'Current',
        preview: 'Preview diff',
        restore: 'Restore as new revision',
        auditTitle: 'Sync audit chain',
        auditStatuses: {
          empty: 'No audit records',
          valid: 'Fully verifiable',
          partial: 'Legacy records partially verifiable',
          broken: 'Integrity failure',
        },
        verified: 'Verified records',
        legacy: 'Legacy records',
        chainHead: 'Chain head',
        integrityBlocked:
          'Audit status is missing or broken. Upload, adopt, and restore are blocked until the chain is investigated.',
        exportCheckpoint: 'Export head checkpoint',
        verifyCheckpoint: 'Verify checkpoint file',
        checkpointResult: 'External checkpoint verification',
        checkpointCurrent: 'Current head',
        checkpointAncestor: 'Historical ancestor',
        checkpointInvalid: 'Not in current chain',
        checkpointNotice:
          'A checkpoint becomes an external anchor only when stored independently. Once imported and verified, it is attached to the next review package. It is not a digital signature or live-trading authorization.',
      },
)

const selectCheckpointFile = () => checkpointInput.value?.click()
const onCheckpointSelected = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (file) emit('verifyCheckpoint', file)
}
</script>

<template>
  <section class="cloud-evidence-panel">
    <header>
      <div>
        <span>{{ copy.eyebrow }}</span>
        <h2>{{ copy.title }}</h2>
      </div>
      <strong v-if="snapshot?.bundle">{{ copy.revision }} · {{ snapshot.revision }}</strong>
      <strong v-else>{{ copy.empty }}</strong>
    </header>
    <p>{{ copy.warning }}</p>
    <dl v-if="snapshot?.bundle">
      <div>
        <dt>{{ copy.updated }}</dt>
        <dd>{{ snapshot.updatedAt }}</dd>
      </div>
      <div>
        <dt>{{ copy.digest }}</dt>
        <dd><code>{{ snapshot.contentDigest }}</code></dd>
      </div>
    </dl>
    <section v-if="diff" class="bundle-diff">
      <header>
        <span>{{ copy.diff }}</span>
        <strong v-if="diff.identical">{{ copy.identical }}</strong>
      </header>
      <dl>
        <div>
          <dt>{{ copy.backtest }}</dt>
          <dd>{{ diff.backtest.localStrategyVersion ?? '—' }} → {{ diff.backtest.cloudStrategyVersion ?? '—' }}</dd>
        </div>
        <div>
          <dt>{{ copy.sessions }}</dt>
          <dd>{{ diff.paperTelemetry.sessionDelta > 0 ? '+' : '' }}{{ diff.paperTelemetry.sessionDelta }}</dd>
        </div>
        <div>
          <dt>{{ copy.cycles }}</dt>
          <dd>{{ diff.paperTelemetry.cycleDelta > 0 ? '+' : '' }}{{ diff.paperTelemetry.cycleDelta }}</dd>
        </div>
        <div>
          <dt>{{ copy.gaps }}</dt>
          <dd>{{ diff.paperTelemetry.gapDelta > 0 ? '+' : '' }}{{ diff.paperTelemetry.gapDelta }}</dd>
        </div>
        <div>
          <dt>{{ copy.attestations }}</dt>
          <dd>{{ diff.reviewChecklist.changedKeys.length }}</dd>
        </div>
      </dl>
    </section>
    <section v-if="audit" class="audit-status" :data-status="audit.status">
      <header>
        <h3>{{ copy.auditTitle }}</h3>
        <strong>{{ copy.auditStatuses[audit.status] }}</strong>
      </header>
      <dl>
        <div>
          <dt>{{ copy.verified }}</dt>
          <dd>{{ audit.verifiedEntries }} / {{ audit.totalEntries }}</dd>
        </div>
        <div>
          <dt>{{ copy.legacy }}</dt>
          <dd>{{ audit.legacyEntries }}</dd>
        </div>
        <div>
          <dt>{{ copy.chainHead }}</dt>
          <dd><code>{{ audit.headAuditDigest?.slice(0, 16) ?? '—' }}</code></dd>
        </div>
      </dl>
      <ul v-if="audit.issues.length">
        <li v-for="issue in audit.issues" :key="issue">{{ issue }}</li>
      </ul>
    </section>
    <p v-if="integrityBlocked" class="integrity-blocked" role="alert">
      {{ copy.integrityBlocked }}
    </p>
    <section v-if="checkpointVerification" class="checkpoint-result">
      <header>
        <h3>{{ copy.checkpointResult }}</h3>
        <strong :data-valid="checkpointVerification.valid">
          {{
            !checkpointVerification.valid
              ? copy.checkpointInvalid
              : checkpointVerification.isCurrentHead
                ? copy.checkpointCurrent
                : copy.checkpointAncestor
          }}
        </strong>
      </header>
      <p>{{ checkpointVerification.message }}</p>
      <small>
        v{{ checkpointVerification.checkpointRevision }} → v{{ checkpointVerification.currentRevision }}
      </small>
    </section>
    <section v-if="versions.length" class="cloud-history">
      <h3>{{ copy.history }}</h3>
      <ol>
        <li v-for="version in versions" :key="version.revision">
          <div>
            <strong>v{{ version.revision }}</strong>
            <small>{{ version.createdAt }}</small>
            <code>{{ version.contentDigest.slice(0, 12) }}</code>
          </div>
          <span v-if="version.revision === snapshot?.revision">{{ copy.current }}</span>
          <button type="button" :disabled="busy" @click="emit('preview', version.revision)">
            {{ copy.preview }}
          </button>
          <button
            type="button"
            :disabled="busy || integrityBlocked || version.revision === snapshot?.revision"
            @click="emit('restore', version.revision)"
          >
            {{ copy.restore }}
          </button>
        </li>
      </ol>
      <small v-if="preview">{{ copy.preview }} · v{{ preview.revision }}</small>
    </section>
    <p v-if="error" class="error" role="alert">{{ error }}</p>
    <p class="checkpoint-notice">{{ copy.checkpointNotice }}</p>
    <footer>
      <button type="button" :disabled="busy" @click="emit('refresh')">
        {{ busy ? copy.busy : copy.refresh }}
      </button>
      <button type="button" :disabled="busy || integrityBlocked" @click="emit('upload')">
        {{ copy.upload }}
      </button>
      <button
        type="button"
        :disabled="busy || integrityBlocked || !audit?.headAuditDigest"
        @click="emit('exportCheckpoint')"
      >
        {{ copy.exportCheckpoint }}
      </button>
      <button type="button" :disabled="busy" @click="selectCheckpointFile">
        {{ copy.verifyCheckpoint }}
      </button>
      <input
        ref="checkpointInput"
        class="visually-hidden"
        type="file"
        accept="application/json,.json"
        @change="onCheckpointSelected"
      />
      <button
        v-if="snapshot?.bundle"
        type="button"
        :disabled="busy || integrityBlocked"
        @click="emit('adopt')"
      >
        {{ copy.adopt }}
      </button>
    </footer>
  </section>
</template>

<style scoped>
.cloud-evidence-panel {
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
}
.cloud-evidence-panel header,
.cloud-evidence-panel footer {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 10px;
}
.cloud-evidence-panel header span {
  color: var(--accent);
  font-size: 8px;
  letter-spacing: 0.1em;
}
.cloud-evidence-panel h2 {
  margin: 5px 0 0;
  font-size: 16px;
}
.cloud-evidence-panel header strong {
  padding: 6px 8px;
  border: 1px solid var(--border);
  border-radius: 99px;
  font-size: 8px;
}
.cloud-evidence-panel > p,
.cloud-evidence-panel dt {
  color: var(--muted);
  font-size: 8px;
  line-height: 1.6;
}
.cloud-evidence-panel dl {
  display: grid;
  grid-template-columns: 0.5fr 1.5fr;
  gap: 8px;
  margin: 12px 0;
}
.bundle-diff,
.audit-status,
.checkpoint-result,
.cloud-history {
  margin: 12px 0;
  padding: 10px;
  border-radius: 8px;
  background: var(--surface-soft);
}
.bundle-diff > header {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 8px;
}
.bundle-diff > header strong {
  color: var(--positive);
}
.bundle-diff dl {
  grid-template-columns: repeat(5, minmax(0, 1fr));
  margin-bottom: 0;
}
.cloud-history h3 {
  margin: 0 0 8px;
  color: var(--accent);
  font-size: 8px;
}
.audit-status h3 {
  margin: 0;
  color: var(--accent);
  font-size: 8px;
}
.checkpoint-result h3 {
  margin: 0;
  color: var(--accent);
  font-size: 8px;
}
.checkpoint-result strong[data-valid='true'] {
  color: var(--positive);
}
.checkpoint-result strong[data-valid='false'] {
  color: var(--negative);
}
.checkpoint-result p,
.checkpoint-result small {
  color: var(--muted);
  font-size: 7px;
}
.audit-status[data-status='valid'] > header strong {
  color: var(--positive);
}
.audit-status[data-status='partial'] > header strong {
  color: var(--warning);
}
.audit-status[data-status='broken'] > header strong,
.audit-status ul {
  color: var(--negative);
}
.audit-status dl {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-bottom: 0;
}
.audit-status ul {
  margin: 8px 0 0;
  padding-left: 16px;
  font-size: 7px;
}
.cloud-history ol {
  display: grid;
  gap: 6px;
  max-height: 240px;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  list-style: none;
}
.cloud-history li {
  display: grid;
  grid-template-columns: minmax(180px, 1fr) auto auto auto;
  gap: 7px;
  align-items: center;
}
.cloud-history li > div {
  display: flex;
  gap: 8px;
  align-items: center;
  min-width: 0;
}
.cloud-history small,
.cloud-history li > span,
.cloud-history code {
  color: var(--muted);
  font-size: 7px;
}
.cloud-evidence-panel dl div {
  min-width: 0;
  padding: 9px;
  border-radius: 7px;
  background: var(--surface-soft);
}
.cloud-evidence-panel dd {
  margin: 4px 0 0;
  font-size: 8px;
  overflow-wrap: anywhere;
}
.cloud-evidence-panel .error {
  color: var(--negative);
}
.cloud-evidence-panel .integrity-blocked {
  color: var(--negative);
}
.cloud-evidence-panel .checkpoint-notice {
  color: var(--muted);
}
.cloud-evidence-panel footer {
  justify-content: end;
}
.cloud-evidence-panel button {
  min-height: 34px;
  padding: 7px 10px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
  color: var(--ink);
  font-size: 8px;
  cursor: pointer;
}
.cloud-evidence-panel button:disabled {
  cursor: wait;
  opacity: 0.55;
}
@media (max-width: 760px) {
  .cloud-evidence-panel header,
  .cloud-evidence-panel footer {
    flex-direction: column;
  }
  .cloud-evidence-panel dl {
    grid-template-columns: 1fr;
  }
  .bundle-diff dl,
  .cloud-history li {
    grid-template-columns: 1fr;
  }
}
</style>
