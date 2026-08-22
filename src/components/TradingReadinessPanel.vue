<script setup lang="ts">
import { computed } from 'vue'
import type {
  ContractPaperDriftReport,
  ContractStrategyBacktestReport,
  LiveTradingReadinessReport,
  TestnetExecutionCalibrationReport,
} from '@/types'
import { useI18n } from '@/composables/use-i18n'

const props = defineProps<{
  report: LiveTradingReadinessReport
  backtest: ContractStrategyBacktestReport | null
  paperDrift: ContractPaperDriftReport | null
  testnet: TestnetExecutionCalibrationReport | null
  importError: string | null
  packageVerification: {
    status: 'verified' | 'local-only' | 'stale' | 'invalid'
    message: string
  } | null
}>()
const emit = defineEmits<{
  importBacktest: [file: File]
  removeBacktest: []
  exportReviewPackage: []
  verifyReviewPackage: [file: File]
}>()
const { locale } = useI18n()
const monthCohort = computed(
  () => props.paperDrift?.cohorts.find((cohort) => cohort.period === 'month') ?? null,
)
const selectBacktest = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) emit('importBacktest', file)
  input.value = ''
}
const selectReviewPackage = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) emit('verifyReviewPackage', file)
  input.value = ''
}
const copy = computed(() =>
  locale.value === 'zh'
    ? {
        eyebrow: '交易证据闸门',
        title: '当前仅可作为研究与模拟参考',
        level: '证据等级',
        evidence: '动态证据',
        backtest: '样本外回测',
        paper: 'Paper 月度偏差',
        testnet: 'Testnet 执行',
        missing: '尚未接入',
        samples: '样本',
        filledSamples: '有效成交',
        auditEvents: '审计事件',
        import: '导入可重算回测JSON',
        replace: '替换回测证据',
        remove: '移除',
        exportPackage: '导出综合评审包',
        verifyPackage: '验证综合评审包',
        packageVerified: '评审包及云端锚点验证通过',
        packageLocalOnly: '评审包仅完成包内验证',
        packageStale: '评审包证据当前无效',
        packageInvalid: '评审包验证失败',
        blocker: '首要缺口',
        prohibition: '固定禁令',
        levels: {
          research: '研究',
          paper: 'Paper验证',
          testnet: 'Testnet校准',
          reviewEligible: '可提交人工评审',
        },
      }
    : {
        eyebrow: 'Trading evidence gate',
        title: 'Research and simulation reference only',
        level: 'Evidence level',
        evidence: 'Dynamic evidence',
        backtest: 'Holdout backtest',
        paper: 'Monthly Paper drift',
        testnet: 'Testnet execution',
        missing: 'Not connected',
        samples: 'samples',
        filledSamples: 'filled',
        auditEvents: 'audit events',
        import: 'Import reproducible backtest JSON',
        replace: 'Replace backtest evidence',
        remove: 'Remove',
        exportPackage: 'Export combined review package',
        verifyPackage: 'Verify review package',
        packageVerified: 'Review package and cloud anchor verified',
        packageLocalOnly: 'Review package verified locally only',
        packageStale: 'Review package evidence is not current',
        packageInvalid: 'Review package verification failed',
        blocker: 'Primary gaps',
        prohibition: 'Fixed prohibitions',
        levels: {
          research: 'Research',
          paper: 'Paper validated',
          testnet: 'Testnet calibrated',
          reviewEligible: 'Eligible for human review',
        },
      },
)
</script>

<template>
  <section class="readiness-panel" :class="report.evidenceLevel">
    <header>
      <div>
        <span>{{ copy.eyebrow }}</span>
        <h2>{{ copy.title }}</h2>
      </div>
      <strong>{{ copy.level }} · {{ copy.levels[report.evidenceLevel] }}</strong>
    </header>
    <section class="evidence-section">
      <h3>{{ copy.evidence }}</h3>
      <div class="evidence-grid">
        <article :class="backtest?.segments.holdout.metrics.status ?? 'missing'">
          <span>{{ copy.backtest }}</span>
          <strong>{{ backtest?.segments.holdout.metrics.status ?? copy.missing }}</strong>
          <small v-if="backtest">
            {{ backtest.segments.holdout.metrics.trades }} {{ copy.samples }} ·
            {{ backtest.strategyVersion }}
          </small>
        </article>
        <article :class="monthCohort?.status ?? 'missing'">
          <span>{{ copy.paper }}</span>
          <strong>{{ monthCohort?.status ?? copy.missing }}</strong>
          <small v-if="monthCohort">
            {{ monthCohort.samples }} {{ copy.samples }} · Δ
            {{ monthCohort.returnDeltaPct ?? '—' }}% ·
            {{ paperDrift?.auditEvents.length ?? 0 }} {{ copy.auditEvents }}
          </small>
        </article>
        <article :class="testnet?.readyForPaperComparison ? 'supported' : 'missing'">
          <span>{{ copy.testnet }}</span>
          <strong>{{ testnet?.readyForPaperComparison ? 'ready' : copy.missing }}</strong>
          <small v-if="testnet">
            {{ testnet.filledObservations }} {{ copy.filledSamples }} /
            {{ testnet.observations }} {{ copy.samples }}
          </small>
        </article>
      </div>
      <div class="evidence-actions">
        <label>
          {{ backtest ? copy.replace : copy.import }}
          <input type="file" accept="application/json,.json" @change="selectBacktest" />
        </label>
        <button v-if="backtest" type="button" @click="emit('removeBacktest')">
          {{ copy.remove }}
        </button>
        <button type="button" @click="emit('exportReviewPackage')">
          {{ copy.exportPackage }}
        </button>
        <label>
          {{ copy.verifyPackage }}
          <input type="file" accept="application/json,.json" @change="selectReviewPackage" />
        </label>
        <span v-if="importError" role="alert">{{ importError }}</span>
        <span
          v-if="packageVerification"
          class="package-verification"
          :class="packageVerification.status"
          role="status"
        >
          {{
            packageVerification.status === 'verified'
              ? copy.packageVerified
              : packageVerification.status === 'local-only'
                ? copy.packageLocalOnly
                : packageVerification.status === 'stale'
                  ? copy.packageStale
                  : copy.packageInvalid
          }}
          ·
          {{ packageVerification.message }}
        </span>
      </div>
    </section>
    <div class="readiness-columns">
      <section>
        <h3>{{ copy.blocker }}</h3>
        <ul>
          <li v-for="blocker in report.blockers.slice(0, 4)" :key="blocker">{{ blocker }}</li>
        </ul>
      </section>
      <section class="prohibitions">
        <h3>{{ copy.prohibition }}</h3>
        <ul>
          <li v-for="item in report.prohibitions" :key="item">{{ item }}</li>
        </ul>
      </section>
    </div>
  </section>
</template>

<style scoped>
.readiness-panel {
  padding: 16px;
  border: 1px solid var(--warning);
  border-radius: 10px;
  background: color-mix(in srgb, var(--warning) 7%, var(--surface));
}
.readiness-panel header {
  display: flex;
  gap: 16px;
  align-items: start;
  justify-content: space-between;
}
.readiness-panel header span,
.readiness-panel h3 {
  color: var(--warning);
  font-size: 8px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.readiness-panel h2 {
  margin: 5px 0 0;
  font-size: 16px;
}
.readiness-panel header strong {
  padding: 6px 8px;
  border: 1px solid currentColor;
  border-radius: 99px;
  color: var(--warning);
  font-size: 8px;
}
.readiness-columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 14px;
}
.evidence-section {
  margin-top: 14px;
}
.evidence-section > h3 {
  margin: 0 0 8px;
}
.evidence-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}
.evidence-grid article {
  display: grid;
  gap: 5px;
  min-width: 0;
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--surface-soft);
}
.evidence-grid article.supported,
.evidence-grid article.stable {
  border-color: color-mix(in srgb, var(--positive) 55%, var(--border));
}
.evidence-grid article.negative,
.evidence-grid article.degraded {
  border-color: color-mix(in srgb, var(--negative) 55%, var(--border));
}
.evidence-grid span,
.evidence-grid small {
  color: var(--muted);
  font-size: 7px;
  overflow-wrap: anywhere;
}
.evidence-grid strong {
  font-size: 9px;
}
.evidence-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  align-items: center;
  margin-top: 8px;
}
.evidence-actions label,
.evidence-actions button {
  padding: 7px 9px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
  color: var(--ink);
  font-size: 7px;
  cursor: pointer;
}
.evidence-actions input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
}
.evidence-actions span {
  color: var(--negative);
  font-size: 7px;
}
.evidence-actions .package-verification.verified {
  color: var(--positive);
}
.evidence-actions .package-verification.local-only {
  color: var(--warning);
}
.evidence-actions .package-verification.stale {
  color: var(--warning);
}
.evidence-actions .package-verification.invalid {
  color: var(--negative);
}
.readiness-columns section {
  padding: 12px;
  border-radius: 8px;
  background: var(--surface-soft);
}
.readiness-columns h3 {
  margin: 0 0 8px;
}
.readiness-columns ul {
  display: grid;
  gap: 6px;
  margin: 0;
  padding-left: 16px;
  color: var(--muted);
  font-size: 8px;
  line-height: 1.5;
}
.prohibitions li::marker {
  color: var(--danger);
}
@media (max-width: 760px) {
  .readiness-panel header {
    flex-direction: column;
  }
  .readiness-columns {
    grid-template-columns: 1fr;
  }
  .evidence-grid {
    grid-template-columns: 1fr;
  }
}
</style>
