<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type {
  TradingReviewAttestationDraft,
  TradingReviewChecklist,
  TradingReviewChecklistCategory,
  TradingReviewChecklistEvaluation,
  TradingReviewChecklistKey,
} from '@/types'
import { useI18n } from '@/composables/use-i18n'

const props = defineProps<{
  checklist: TradingReviewChecklist
  evaluation: TradingReviewChecklistEvaluation
}>()
const emit = defineEmits<{
  save: [draft: TradingReviewAttestationDraft[]]
  export: []
}>()
const { locale } = useI18n()
const draft = ref<TradingReviewAttestationDraft[]>([])
watch(
  () => props.checklist,
  (checklist) => {
    draft.value = checklist.attestations.map(({ category, key, confirmed, evidence }) => ({
      category,
      key,
      confirmed,
      evidence,
    }))
  },
  { immediate: true, deep: true },
)

const categories: TradingReviewChecklistCategory[] = [
  'accountControls',
  'riskControls',
  'eligibility',
]
const copy = computed(() => {
  const zh = locale.value === 'zh'
  return {
    eyebrow: zh ? '人工评审准备' : 'HUMAN REVIEW PREPARATION',
    title: zh ? '账户、风险与资格核验清单' : 'Account, risk, and eligibility checklist',
    warning: zh
      ? '这里记录的是带时间的人工声明，不是自动验证；有效期30天，全部通过也只允许提交人工评审。'
      : 'These are time-bound human attestations, not automated verification. They expire after 30 days and only permit a separate human review.',
    progress: zh ? '有效核验' : 'Valid attestations',
    evidence: zh ? '证据说明（至少8个字符）' : 'Evidence note (at least 8 characters)',
    confirmed: zh ? '确认此项已核验' : 'Confirm verification',
    save: zh ? '保存核验清单' : 'Save checklist',
    export: zh ? '导出审计JSON' : 'Export audit JSON',
    expired: zh ? '已过期' : 'Expired',
    missingEvidence: zh ? '证据不足' : 'Insufficient evidence',
    category: {
      accountControls: zh ? '账户安全' : 'Account security',
      riskControls: zh ? '组合风险控制' : 'Portfolio risk controls',
      eligibility: zh ? '交易资格' : 'Trading eligibility',
    },
  }
})

const labels = computed<Record<TradingReviewChecklistKey, string>>(() => {
  const zh = locale.value === 'zh'
  return {
    isolatedAccount: zh ? '独立交易账户' : 'Isolated trading account',
    withdrawalsDisabled: zh ? '禁用提现权限' : 'Withdrawals disabled',
    ipAllowlist: zh ? 'API IP白名单' : 'API IP allowlist',
    leastPrivilegeKey: zh ? '最小权限API密钥' : 'Least-privilege API key',
    perTradeLimit: zh ? '单笔风险上限' : 'Per-trade risk limit',
    dailyLossLimit: zh ? '单日亏损上限' : 'Daily loss limit',
    directionalExposureLimit: zh ? '单方向敞口上限' : 'Directional exposure limit',
    portfolioExposureLimit: zh ? '组合总敞口上限' : 'Portfolio exposure limit',
    humanKillSwitch: zh ? '人工紧急停止' : 'Human kill switch',
    anomalyCircuitBreaker: zh ? '异常自动熔断' : 'Anomaly circuit breaker',
    idempotentOrders: zh ? '订单幂等控制' : 'Idempotent orders',
    continuousReconciliation: zh ? '持续成交对账' : 'Continuous reconciliation',
    jurisdictionConfirmed: zh ? '所在地规则已确认' : 'Jurisdiction confirmed',
    accountEligible: zh ? '账户资格已确认' : 'Account eligibility confirmed',
    productEligible: zh ? '产品权限已确认' : 'Product eligibility confirmed',
  }
})

const categoryDraft = (category: TradingReviewChecklistCategory) =>
  draft.value.filter((item) => item.category === category)
const itemState = (key: TradingReviewChecklistKey) => ({
  expired: props.evaluation.expiredKeys.includes(key),
  missingEvidence: props.evaluation.missingEvidenceKeys.includes(key),
})
</script>

<template>
  <section class="review-checklist">
    <header>
      <div>
        <span>{{ copy.eyebrow }}</span>
        <h2>{{ copy.title }}</h2>
      </div>
      <strong>{{ copy.progress }} · {{ evaluation.validCount }}/{{ evaluation.totalCount }}</strong>
    </header>
    <p>{{ copy.warning }}</p>
    <form @submit.prevent="emit('save', draft)">
      <section v-for="category in categories" :key="category">
        <h3>{{ copy.category[category] }}</h3>
        <article
          v-for="item in categoryDraft(category)"
          :key="item.key"
          :class="itemState(item.key)"
        >
          <label class="confirmation">
            <input v-model="item.confirmed" type="checkbox" />
            <b>{{ labels[item.key] }}</b>
            <small>{{ copy.confirmed }}</small>
          </label>
          <input
            v-model="item.evidence"
            type="text"
            :placeholder="copy.evidence"
            maxlength="500"
          />
          <em v-if="itemState(item.key).expired">{{ copy.expired }}</em>
          <em v-else-if="itemState(item.key).missingEvidence">{{ copy.missingEvidence }}</em>
        </article>
      </section>
      <footer>
        <button type="button" @click="emit('export')">{{ copy.export }}</button>
        <button class="primary" type="submit">{{ copy.save }}</button>
      </footer>
    </form>
  </section>
</template>

<style scoped>
.review-checklist {
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
}
.review-checklist > header,
.review-checklist footer {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 12px;
}
.review-checklist header span,
.review-checklist h3 {
  color: var(--accent);
  font-size: 8px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.review-checklist h2 {
  margin: 5px 0 0;
  font-size: 16px;
}
.review-checklist header strong {
  padding: 6px 8px;
  border: 1px solid var(--border);
  border-radius: 99px;
  font-size: 8px;
}
.review-checklist > p {
  margin: 12px 0;
  color: var(--muted);
  font-size: 8px;
  line-height: 1.6;
}
.review-checklist form {
  display: grid;
  gap: 12px;
}
.review-checklist form > section {
  display: grid;
  gap: 7px;
  padding: 12px;
  border-radius: 8px;
  background: var(--surface-soft);
}
.review-checklist h3 {
  margin: 0 0 3px;
}
.review-checklist article {
  display: grid;
  grid-template-columns: minmax(180px, 0.8fr) minmax(240px, 2fr) auto;
  gap: 8px;
  align-items: center;
}
.confirmation {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 3px 7px;
  align-items: center;
  font-size: 8px;
}
.confirmation small {
  grid-column: 2;
  color: var(--muted);
  font-size: 7px;
}
.review-checklist article > input {
  min-width: 0;
  min-height: 34px;
  padding: 7px 8px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
  color: var(--ink);
  font: inherit;
}
.review-checklist article em {
  color: var(--warning);
  font-size: 7px;
  font-style: normal;
}
.review-checklist footer {
  justify-content: end;
}
.review-checklist button {
  min-height: 34px;
  padding: 7px 10px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
  color: var(--ink);
  font-size: 8px;
  cursor: pointer;
}
.review-checklist button.primary {
  border-color: var(--accent);
  background: var(--accent);
  color: white;
}
@media (max-width: 760px) {
  .review-checklist > header,
  .review-checklist article {
    grid-template-columns: 1fr;
  }
  .review-checklist > header {
    flex-direction: column;
  }
}
</style>
