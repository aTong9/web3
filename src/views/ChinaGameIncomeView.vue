<script setup lang="ts">
import { computed, onMounted, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ResearchPageHeader from '@/components/research/ResearchPageHeader.vue'
import {
  chinaGameGuides,
  chinaGameIncomeUpdatedAt,
} from '@/data/china-game-income-guides'
import type { ChinaGameGuide } from '@/data/china-game-income-guides'

const route = useRoute()
const router = useRouter()
const defaultGame = chinaGameGuides[0]!
const requestedGameId = typeof route.query.game === 'string' ? route.query.game : ''
const initialGame = chinaGameGuides.find((game) => game.id === requestedGameId) ?? defaultGame
const activeGameId = shallowRef(initialGame.id)
const activeGame = computed<ChinaGameGuide>(
  () => chinaGameGuides.find((game) => game.id === activeGameId.value) ?? defaultGame,
)
const routeQuery = shallowRef('')
const realizedIncome = shallowRef(0)
const inventoryValue = shallowRef(0)
const inventoryRealizationRate = shallowRef(70)
const operatingCost = shallowRef(0)
const tradingCost = shallowRef(0)
const hoursSpent = shallowRef(0)
const calculatorStatus = shallowRef('尚未输入')
const calculatorStorageKey = 'china-game-income-calculators-v1'

interface CalculatorSnapshot {
  realizedIncome: number
  inventoryValue: number
  inventoryRealizationRate: number
  operatingCost: number
  tradingCost: number
  hoursSpent: number
  updatedAt: string
}

const calculatorSnapshots = shallowRef<Record<string, CalculatorSnapshot>>({})
let suppressCalculatorSave = false
const checklistStorageKey = 'china-game-income-readiness-v1'
const checklistByGame = shallowRef<Record<string, string[]>>({})
const readinessItems = [
  { id: 'rules', title: '复核当前官方规则', detail: '确认客户端、多开、绑定和交易限制' },
  { id: 'server', title: '确定版本与服务器', detail: '不同服务器经济不可直接套用' },
  { id: 'prices', title: '采集 7 天价格', detail: '记录真实成交线索，不用最高挂牌价' },
  { id: 'budget', title: '设置启动与库存上限', detail: '预留在线、补给、养成及失败成本' },
  { id: 'trial', title: '完成 14 天人工试运行', detail: '不使用脚本、同步器或无人值守操作' },
  { id: 'settlement', title: '确认结算边界', detail: '没有官方渠道时只统计游戏内净值' },
]
const activeChecklist = computed(() => checklistByGame.value[activeGameId.value] ?? [])
const readinessCompleted = computed(() => activeChecklist.value.length)
const readinessPercent = computed(() =>
  Math.round((readinessCompleted.value / readinessItems.length) * 100),
)
const persistChecklist = () => {
  try {
    window.localStorage.setItem(checklistStorageKey, JSON.stringify(checklistByGame.value))
  } catch (error) {
    console.warn('游戏开工清单保存失败', error)
  }
}
const toggleReadinessItem = (itemId: string) => {
  const current = activeChecklist.value
  const next = current.includes(itemId)
    ? current.filter((id) => id !== itemId)
    : [...current, itemId]
  checklistByGame.value = { ...checklistByGame.value, [activeGameId.value]: next }
  persistChecklist()
}
const resetReadiness = () => {
  const next = { ...checklistByGame.value }
  delete next[activeGameId.value]
  checklistByGame.value = next
  persistChecklist()
}
const emptyCalculator = (): CalculatorSnapshot => ({
  realizedIncome: 0,
  inventoryValue: 0,
  inventoryRealizationRate: 70,
  operatingCost: 0,
  tradingCost: 0,
  hoursSpent: 0,
  updatedAt: '',
})
const applyCalculator = (gameId: string) => {
  suppressCalculatorSave = true
  const saved = calculatorSnapshots.value[gameId] ?? emptyCalculator()
  realizedIncome.value = saved.realizedIncome
  inventoryValue.value = saved.inventoryValue
  inventoryRealizationRate.value = saved.inventoryRealizationRate
  operatingCost.value = saved.operatingCost
  tradingCost.value = saved.tradingCost
  hoursSpent.value = saved.hoursSpent
  calculatorStatus.value = saved.updatedAt ? `已保存 · ${saved.updatedAt}` : '尚未输入'
  queueMicrotask(() => {
    suppressCalculatorSave = false
  })
}
const persistCalculators = () => {
  try {
    window.localStorage.setItem(calculatorStorageKey, JSON.stringify(calculatorSnapshots.value))
  } catch (error) {
    console.warn('游戏收益试算保存失败', error)
  }
}
const saveCalculator = (gameId = activeGameId.value) => {
  const snapshot: CalculatorSnapshot = {
    realizedIncome: Number(realizedIncome.value) || 0,
    inventoryValue: Number(inventoryValue.value) || 0,
    inventoryRealizationRate: Number(inventoryRealizationRate.value) || 0,
    operatingCost: Number(operatingCost.value) || 0,
    tradingCost: Number(tradingCost.value) || 0,
    hoursSpent: Number(hoursSpent.value) || 0,
    updatedAt: new Intl.DateTimeFormat('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date()),
  }
  calculatorSnapshots.value = { ...calculatorSnapshots.value, [gameId]: snapshot }
  calculatorStatus.value = `已保存在此设备 · ${snapshot.updatedAt}`
  persistCalculators()
}
const resetCalculator = () => {
  const nextSnapshots = { ...calculatorSnapshots.value }
  delete nextSnapshots[activeGameId.value]
  calculatorSnapshots.value = nextSnapshots
  persistCalculators()
  applyCalculator(activeGameId.value)
  calculatorStatus.value = '已重置当前游戏'
}
const visibleRoutes = computed(() => {
  const needle = routeQuery.value.trim().toLocaleLowerCase()
  if (!needle) return activeGame.value.routes
  return activeGame.value.routes.filter((item) =>
    [item.name, item.entry, item.cadence, item.output, item.operation, item.risk]
      .join(' ')
      .toLocaleLowerCase()
      .includes(needle),
  )
})
const conservativeInventoryValue = computed(
  () => (Number(inventoryValue.value) || 0) * ((Number(inventoryRealizationRate.value) || 0) / 100),
)
const estimatedNetValue = computed(
  () =>
    (Number(realizedIncome.value) || 0) +
    conservativeInventoryValue.value -
    (Number(operatingCost.value) || 0) -
    (Number(tradingCost.value) || 0),
)
const estimatedHourlyValue = computed(() =>
  (Number(hoursSpent.value) || 0) > 0
    ? estimatedNetValue.value / (Number(hoursSpent.value) || 1)
    : 0,
)
const formatNumber = (value: number) =>
  new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 2 }).format(value)
const sectionLinks = computed(() => {
  if (activeGame.value.id === 'fantasy-westward-journey') {
    return [
      { id: 'readiness', label: '开工检查' },
      { id: 'account-plan', label: '五开 / 十开' },
      { id: 'route-matrix', label: '赚钱玩法' },
      { id: 'market-desk', label: '宝石商人' },
      { id: 'cost-ledger', label: '净收益账本' },
      { id: 'calculator', label: '收益试算' },
      { id: 'official-sources', label: '规则来源' },
    ]
  }
  if (activeGame.value.id === 'aion') {
    return [
      { id: 'readiness', label: '开工检查' },
      { id: 'route-matrix', label: '经营路线' },
      { id: 'cost-ledger', label: '推荐顺序' },
      { id: 'official-sources', label: '官方来源' },
      { id: 'calculator', label: '收益试算' },
    ]
  }
  return [
    { id: 'readiness', label: '开工检查' },
    { id: 'account-plan', label: '账号与规则' },
    { id: 'schedule-plan', label: '日周排班' },
    { id: 'route-matrix', label: '经济玩法' },
    { id: 'market-desk', label: '市场经营' },
    { id: 'cost-ledger', label: '成本账本' },
    { id: 'official-sources', label: '官方来源' },
    { id: 'calculator', label: '收益试算' },
  ]
})

watch(activeGameId, (game, previousGame) => {
  if (previousGame) saveCalculator(previousGame)
  applyCalculator(game)
  routeQuery.value = ''
  if (route.query.game === game) return
  void router.replace({ query: { ...route.query, game } })
})

watch(
  () => route.query.game,
  (game) => {
    if (typeof game === 'string' && chinaGameGuides.some((item) => item.id === game)) {
      activeGameId.value = game
    }
  },
)

watch(
  [
    realizedIncome,
    inventoryValue,
    inventoryRealizationRate,
    operatingCost,
    tradingCost,
    hoursSpent,
  ],
  () => {
    if (!suppressCalculatorSave) saveCalculator()
  },
)

onMounted(() => {
  try {
    const stored = window.localStorage.getItem(calculatorStorageKey)
    if (stored) calculatorSnapshots.value = JSON.parse(stored) as Record<string, CalculatorSnapshot>
  } catch (error) {
    console.warn('游戏收益试算读取失败', error)
  }
  applyCalculator(activeGameId.value)
  try {
    const storedChecklist = window.localStorage.getItem(checklistStorageKey)
    if (storedChecklist) {
      checklistByGame.value = JSON.parse(storedChecklist) as Record<string, string[]>
    }
  } catch (error) {
    console.warn('游戏开工清单读取失败', error)
  }
})

const fiveAccountPlan = [
  ['准备', '选定同一等级段与固定队形，先用低投入装备完成基础闭环'],
  ['每日 60–90 分钟', '师门、抓鬼及当日高确定性任务，优先完成固定收益'],
  ['周期任务', '按刷新周期安排副本、周常与限时活动，不为“清完”牺牲时薪'],
  ['收尾', '处理体力活力、集中摆摊，并记录现金、物品、消耗和工时'],
]

const tenAccountPlan = [
  ['组织方式', '拆成 A/B 两支五人队，分别配置队长、补给与库存账本'],
  ['错峰执行', '一队做任务时，另一队只做补给、摆摊或离线恢复；全程人工操作'],
  ['轮换逻辑', 'A 队主刷高确定性任务，B 队承担活动或补充产能，次日互换验证效率'],
  ['止损门槛', '连续两周净时薪不及五开，立即降回单队，避免账号和装备继续扩张'],
]

const merchantPlaybook = [
  {
    title: '宝石商人与宝石周转',
    text: '先区分系统 NPC 价格与玩家市场成交价；记录品类、等级、成交时段和合成成本。只在扣除手续费后仍有安全边际时收货，设置单品库存上限，避免把价格波动误当稳定收益。',
  },
  {
    title: '消耗品摊位',
    text: '围绕药品、烹饪、临时符等高频刚需做小额快周转。根据活动和周末需求调整库存，不用全仓押注节日行情。',
  },
  {
    title: '环装、书铁与制造链',
    text: '比较直接出售、继续制造和囤货三种方案的净值；把体力活力也按机会成本记账，避免“材料免费”的错觉。',
  },
  {
    title: '召唤兽与装备',
    text: '属于知识和资金门槛最高的品类。先建立同类成交样本，再小额试单；炼妖、鉴定和追高属于高波动投机，不纳入基础搬砖收益。',
  },
]
</script>

<template>
  <main class="game-income-view">
    <ResearchPageHeader
      eyebrow="CHINA GAME ECONOMY · MANUAL PLAY ONLY"
      title="国内游戏搬砖"
      description="用任务产出、生活技能和市场周转建立可核算的游戏内经营方案。内容只覆盖人工操作与官方允许路径，不承诺收益。"
      :updated-at="chinaGameIncomeUpdatedAt"
      density="comfortable"
      variant="plain"
    />

    <section class="guardrail" aria-labelledby="rules-title">
      <div><span>合规边界</span><h2 id="rules-title">先确认规则，再计算收益</h2></div>
      <p>不提供外挂、脚本、同步器、绕过检测、账号工作室或非官方现金交易教程。多开数量、设备限制和交易渠道会随版本变化，投入前必须复核当前官方规则。</p>
    </section>

    <div class="game-picker-heading">
      <div><span>已核验游戏库</span><h2>选择一款游戏</h2></div>
      <label><span>快速选择</span><select v-model="activeGameId"><option v-for="game in chinaGameGuides" :key="game.id" :value="game.id">{{ game.name }}</option></select></label>
    </div>
    <nav class="game-tabs" aria-label="选择游戏">
      <button
        v-for="game in chinaGameGuides"
        :key="game.id"
        type="button"
        :class="{ active: activeGameId === game.id }"
        :aria-pressed="activeGameId === game.id"
        @click="activeGameId = game.id"
      >
        <span>{{ game.name }}</span><small>{{ game.edition }}</small><em>{{ game.stage }}</em>
      </button>
    </nav>

    <section class="game-summary">
      <div><small>经营定位</small><h2>{{ activeGame.name }}</h2><p>{{ activeGame.positioning }}</p></div>
      <aside><small>结算边界</small><p>{{ activeGame.settlement }}</p></aside>
    </section>

    <nav class="section-nav" aria-label="本游戏指南章节">
      <span>{{ activeGame.name }}</span>
      <a v-for="item in sectionLinks" :key="item.id" :href="`#${item.id}`">{{ item.label }}</a>
    </nav>

    <section class="route-filter" aria-labelledby="route-filter-title">
      <label for="route-search"><span id="route-filter-title">筛选当前游戏玩法</span><input id="route-search" v-model="routeQuery" type="search" :placeholder="`搜索 ${activeGame.name} 的任务、产出或风险…`" /></label>
      <p role="status" aria-live="polite"><strong>{{ visibleRoutes.length }}</strong> / {{ activeGame.routes.length }} 条路径</p>
    </section>

    <section id="readiness" class="readiness" aria-labelledby="readiness-title">
      <header>
        <div><span>READINESS GATE</span><h2 id="readiness-title">{{ activeGame.name }} 开工准备</h2><p>完成清单不代表一定盈利，只表示已经具备开始小样本人工验证的基本条件。</p></div>
        <div class="readiness-score"><strong>{{ readinessCompleted }} / {{ readinessItems.length }}</strong><span>{{ readinessCompleted === readinessItems.length ? '可以开始小样本验证' : `还需完成 ${readinessItems.length - readinessCompleted} 项` }}</span></div>
      </header>
      <div class="progress-track" role="progressbar" aria-label="开工准备完成度" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="readinessPercent"><span :style="{ transform: `scaleX(${readinessPercent / 100})` }"></span></div>
      <div class="readiness-grid">
        <label v-for="item in readinessItems" :key="item.id" :class="{ done: activeChecklist.includes(item.id) }">
          <input type="checkbox" :checked="activeChecklist.includes(item.id)" @change="toggleReadinessItem(item.id)" />
          <span><strong>{{ item.title }}</strong><small>{{ item.detail }}</small></span>
        </label>
      </div>
      <button v-if="readinessCompleted" class="readiness-reset" type="button" @click="resetReadiness">重置当前游戏清单</button>
    </section>

    <template v-if="activeGame.id === 'fantasy-westward-journey'">
      <section id="account-plan" class="section-heading"><span>01 · ACCOUNT PLAN</span><h2>五开与十开执行方案</h2><p>先跑通一组五开，再以真实净时薪决定是否扩到十开。十开不是把在线时间翻倍，而是把两支队伍拆账、错峰和止损。</p></section>
      <div class="plans">
        <article><header><small>适合起步</small><h3>五开：单队闭环</h3></header><ol><li v-for="([title, text], index) in fiveAccountPlan" :key="title"><b>{{ index + 1 }}</b><div><strong>{{ title }}</strong><p>{{ text }}</p></div></li></ol></article>
        <article><header><small>资本与管理升级</small><h3>十开：双队错峰</h3></header><ol><li v-for="([title, text], index) in tenAccountPlan" :key="title"><b>{{ index + 1 }}</b><div><strong>{{ title }}</strong><p>{{ text }}</p></div></li></ol></article>
      </div>

      <section id="route-matrix" class="section-heading"><span>02 · ROUTE MATRIX</span><h2>主要赚钱玩法矩阵</h2><p>“所有玩法”按可重复经营链路归类；具体任务奖励和门槛以所在区服、等级段和当前版本为准。</p></section>
      <div v-if="visibleRoutes.length" class="table-wrap"><table><thead><tr><th>玩法</th><th>门槛 / 周期</th><th>产出</th><th>怎么做</th><th>主要风险</th></tr></thead><tbody><tr v-for="route in visibleRoutes" :key="route.name"><th>{{ route.name }}</th><td data-label="门槛 / 周期">{{ route.entry }}<small>{{ route.cadence }}</small></td><td data-label="产出">{{ route.output }}</td><td data-label="怎么做">{{ route.operation }}</td><td data-label="主要风险">{{ route.risk }}</td></tr></tbody></table></div>
      <div v-else class="empty-routes"><strong>没有匹配的玩法</strong><p>换一个任务名、产出物或风险关键词。</p><button type="button" @click="routeQuery = ''">清除筛选</button></div>

      <section id="market-desk" class="section-heading"><span>03 · MERCHANT DESK</span><h2>宝石商人及摆摊经营</h2><p>商人利润来自信息、周转和库存纪律，不来自“必涨”。以下流程均以真实成交价而非挂牌价为依据。</p></section>
      <div class="merchant-grid"><article v-for="item in merchantPlaybook" :key="item.title"><h3>{{ item.title }}</h3><p>{{ item.text }}</p></article></div>

      <section id="cost-ledger" class="ledger"><div><span>每日只记四项</span><h2>净收益 = 现金变化 + 已售物品 − 点卡/补给/手续费 − 库存跌价</h2></div><ul><li>工时分开记录：任务、摆摊、补货</li><li>未售物品按保守成交价计，不按最高挂牌价</li><li>连续 14 天比较五开与十开的净时薪</li></ul></section>
    </template>

    <template v-else-if="activeGame.id === 'aion'">
      <section class="policy-alert"><strong>永恒之塔只提供单账号正常玩家方案</strong><p>2026 年官方处罚公告明确打击多开器、同 IP 大量账号、以盈利为目的利用多个角色获利及大规模囤货出售，因此本页不提供多开或批量经营方案。</p></section>
      <section id="route-matrix" class="section-heading"><span>AION · ECONOMY LOOP</span><h2>永恒之塔经营路线</h2><p>先选择一个材料或消耗品品类，把采集、制作、副本掉落和交易中介所连接成闭环；不同版本与服务器经济不可直接套用。</p></section>
      <div v-if="visibleRoutes.length" class="route-cards"><article v-for="route in visibleRoutes" :key="route.name"><header><h3>{{ route.name }}</h3><span>{{ route.cadence }}</span></header><p>{{ route.operation }}</p><dl><div><dt>门槛</dt><dd>{{ route.entry }}</dd></div><div><dt>产出</dt><dd>{{ route.output }}</dd></div><div><dt>风险</dt><dd>{{ route.risk }}</dd></div></dl></article></div>
      <div v-else class="empty-routes"><strong>没有匹配的玩法</strong><p>换一个任务名、产出物或风险关键词。</p><button type="button" @click="routeQuery = ''">清除筛选</button></div>
      <section id="cost-ledger" class="ledger"><div><span>推荐顺序</span><h2>采集小样本 → 验证成交 → 再投制作熟练度与库存</h2></div><ul><li>只按可交易掉落核算副本收入</li><li>制作前比较材料直接出售的机会成本</li><li>基纳只在游戏内核算，不把私下交易当收入</li></ul></section>
      <section id="official-sources" class="sources"><h3>官方规则与功能依据</h3><a href="https://aion.web.sdo.com/web12/newsContent.html?CategoryID=1362&id=389026" target="_blank" rel="noreferrer">2026 非正常行为处罚公告 ↗</a><a href="https://aion.web.sdo.com/web12/newsContent.html?CategoryID=5892&id=343757" target="_blank" rel="noreferrer">官方反外挂 FAQ ↗</a><a href="https://aion.web.sdo.com/web12/newsContent.html?CategoryID=5892&id=386696" target="_blank" rel="noreferrer">版本与世界交易所说明 ↗</a></section>
    </template>

    <template v-else>
      <section v-if="activeGame.ruleNote" class="policy-alert"><strong>{{ activeGame.accountModel }}</strong><p>{{ activeGame.ruleNote }}</p></section>

      <section id="account-plan" class="section-heading"><span>01 · OPERATING MODEL</span><h2>账号模型与合规边界</h2><p>只采用当前官方客户端与正常玩家行为；先确认服务器、版本、绑定状态和交易规则，再投入角色与库存。</p></section>
      <div class="boundary-grid">
        <article><h3>可做范围</h3><ul><li v-for="item in activeGame.allowed" :key="item">{{ item }}</li></ul></article>
        <article class="prohibited"><h3>不纳入指南</h3><ul><li v-for="item in activeGame.prohibited" :key="item">{{ item }}</li></ul></article>
      </div>

      <section id="schedule-plan" class="section-heading"><span>02 · DAILY / WEEKLY PLAN</span><h2>日常与周期排班</h2><p>固定收益先做，小样本验证后才追加时间；绑定奖励只算角色成长，不计入可交易收入。</p></section>
      <div class="plans">
        <article><header><small>DAILY LOOP</small><h3>每日执行</h3></header><ol><li v-for="(step, index) in activeGame.dailyPlan" :key="step.title"><b>{{ index + 1 }}</b><div><strong>{{ step.title }}</strong><p>{{ step.detail }}</p></div></li></ol></article>
        <article><header><small>WEEKLY LOOP</small><h3>每周复盘</h3></header><ol><li v-for="(step, index) in activeGame.weeklyPlan" :key="step.title"><b>{{ index + 1 }}</b><div><strong>{{ step.title }}</strong><p>{{ step.detail }}</p></div></li></ol></article>
      </div>

      <section id="route-matrix" class="section-heading"><span>03 · ROUTE MATRIX</span><h2>{{ activeGame.name }} 主要经济玩法</h2><p>每条路径都同时展示进入门槛、产出、执行方式和最容易被忽略的成本。</p></section>
      <div v-if="visibleRoutes.length" class="table-wrap"><table><thead><tr><th>玩法</th><th>门槛 / 周期</th><th>产出</th><th>怎么做</th><th>主要风险</th></tr></thead><tbody><tr v-for="route in visibleRoutes" :key="route.name"><th>{{ route.name }}</th><td data-label="门槛 / 周期">{{ route.entry }}<small>{{ route.cadence }}</small></td><td data-label="产出">{{ route.output }}</td><td data-label="怎么做">{{ route.operation }}</td><td data-label="主要风险">{{ route.risk }}</td></tr></tbody></table></div>
      <div v-else class="empty-routes"><strong>没有匹配的玩法</strong><p>换一个任务名、产出物或风险关键词。</p><button type="button" @click="routeQuery = ''">清除筛选</button></div>

      <section id="market-desk" class="section-heading"><span>04 · MARKET DESK</span><h2>市场与商人经营</h2><p>价差必须建立在真实成交、手续费和库存周转上，不把活动期最高挂牌价当作利润。</p></section>
      <div class="merchant-grid"><article v-for="item in activeGame.merchantPlan" :key="item.title"><h3>{{ item.title }}</h3><p>{{ item.detail }}</p></article></div>

      <section id="cost-ledger" class="ledger"><div><span>成本账本</span><h2>只比较已成交净值，不用理论最高价估算收益</h2></div><ul><li v-for="item in activeGame.ledger" :key="item">{{ item }}</li></ul></section>
      <section id="official-sources" class="sources"><h3>官方规则与系统来源</h3><a v-for="source in activeGame.sources" :key="source.url" :href="source.url" target="_blank" rel="noreferrer">{{ source.label }} ↗</a></section>
    </template>

    <section id="calculator" class="calculator" aria-labelledby="calculator-title">
      <header><div><span>PERSONAL LEDGER</span><h2 id="calculator-title">用自己的数据试算净值</h2><p>单位统一使用 {{ activeGame.accountingUnit }}。每款游戏独立保存，库存按保守变现率折算，不代表现实货币收益。</p></div><div class="calculator-actions"><small aria-live="polite">{{ calculatorStatus }}</small><button type="button" @click="resetCalculator">重置当前游戏</button></div></header>
      <div class="calculator-grid">
        <label><span>已成交收入</span><input v-model.number="realizedIncome" type="number" min="0" inputmode="decimal" /></label>
        <label><span>期末可交易库存</span><input v-model.number="inventoryValue" type="number" min="0" inputmode="decimal" /></label>
        <label><span>库存保守变现率</span><div class="input-suffix"><input v-model.number="inventoryRealizationRate" type="number" min="0" max="100" inputmode="decimal" /><b>%</b></div></label>
        <label><span>点卡、补给与养成</span><input v-model.number="operatingCost" type="number" min="0" inputmode="decimal" /></label>
        <label><span>摊位、拍卖与手续费</span><input v-model.number="tradingCost" type="number" min="0" inputmode="decimal" /></label>
        <label><span>投入工时</span><div class="input-suffix"><input v-model.number="hoursSpent" type="number" min="0" step="0.5" inputmode="decimal" /><b>小时</b></div></label>
      </div>
      <div class="calculator-result" aria-live="polite">
        <div><small>保守库存价值</small><strong>{{ formatNumber(conservativeInventoryValue) }}</strong><span>{{ activeGame.accountingUnit }}</span></div>
        <div :class="{ negative: estimatedNetValue < 0 }"><small>估算净值变化</small><strong>{{ formatNumber(estimatedNetValue) }}</strong><span>{{ activeGame.accountingUnit }}</span></div>
        <div :class="{ negative: estimatedHourlyValue < 0 }"><small>每小时净值</small><strong>{{ formatNumber(estimatedHourlyValue) }}</strong><span>{{ activeGame.accountingUnit }} / 小时</span></div>
      </div>
      <p class="calculator-verdict" :class="{ negative: estimatedNetValue < 0, positive: estimatedNetValue > 0 }"><strong>{{ estimatedNetValue > 0 ? '当前记录为正净值' : estimatedNetValue < 0 ? '当前记录为负净值' : '等待输入实际数据' }}</strong><span>{{ estimatedNetValue > 0 ? '仍需连续记录至少 14 天，避免用单次高价值掉落判断长期收益。' : estimatedNetValue < 0 ? '先减少低周转库存和非必要投入，再比较不同玩法的单位时间净值。' : '输入已成交收入、库存、全部成本和工时后再做决策。' }}</span></p>
    </section>

    <section v-if="activeGame.id === 'fantasy-westward-journey'" id="official-sources" class="sources"><h3>规则校验入口</h3><p>公开网页未提供稳定的电脑版固定多开数字。发布前仍需在当前登录器、客户端协议或官方客服确认；以下链接只用于核验网易通用行为与非官方交易边界。</p><a href="https://protocol.unisdk.netease.com/release/latest_v195.html" target="_blank" rel="noreferrer">网易游戏使用许可及服务协议 ↗</a><a href="https://unisdk.update.netease.com/html/latest_v38.html" target="_blank" rel="noreferrer">网易产品服务条款与玩家守则实例 ↗</a></section>
  </main>
</template>

<style scoped>
.game-income-view{width:min(var(--content-wide),100%);margin:0 auto;padding:var(--page-gutter)}
.guardrail,.game-summary,.ledger,.coming-soon,.policy-alert,.sources,.boundary-grid article{border:1px solid var(--border);border-radius:var(--panel-radius);background:var(--surface)}
.guardrail{padding:20px 24px;display:grid;grid-template-columns:280px 1fr;gap:28px;border-left:4px solid var(--warning)}
.guardrail span,.section-heading span,.ledger span,.coming-soon>span{color:var(--accent);font-size:10px;font-weight:800;letter-spacing:.14em}.guardrail h2,.game-summary h2,.section-heading h2,.ledger h2,.coming-soon h2{margin:6px 0;font:700 clamp(22px,3vw,32px)/1.2 Georgia,serif}.guardrail p,.game-summary p,.section-heading p,.merchant-grid p,.route-cards p,.coming-soon p{margin:0;color:var(--muted);font-size:13px;line-height:1.75}
.game-picker-heading{margin:24px 0 10px;display:flex;align-items:end;justify-content:space-between;gap:20px}.game-picker-heading>div>span,.game-picker-heading label>span{color:var(--muted);font-size:10px}.game-picker-heading h2{margin:4px 0 0;font:700 24px/1.2 Georgia,serif}.game-picker-heading label{min-width:220px}.game-picker-heading label>span{display:block;margin-bottom:5px}.game-picker-heading select{width:100%;height:var(--control-height);padding:0 12px;border:1px solid var(--border);border-radius:8px;background:var(--surface);color:var(--ink)}
.game-tabs{margin:0 0 20px;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.game-tabs button{min-height:76px;padding:12px;text-align:left;border:1px solid var(--border);border-radius:10px;background:var(--surface);color:var(--ink);cursor:pointer;position:relative}.game-tabs button:hover{border-color:color-mix(in srgb,var(--accent) 55%,var(--border))}.game-tabs button:focus-visible{outline:2px solid var(--accent);outline-offset:2px}.game-tabs button.active{border-color:var(--accent);background:var(--accent-soft)}.game-tabs span,.game-tabs small{display:block}.game-tabs span{padding-right:54px;font-weight:800}.game-tabs small{margin-top:5px;color:var(--muted);font-size:11px}.game-tabs em{position:absolute;top:10px;right:10px;color:var(--accent);font-size:9px;font-style:normal}
.game-summary{padding:24px;display:grid;grid-template-columns:1.4fr 1fr;gap:30px}.game-summary small{color:var(--muted)}.game-summary aside{padding-left:24px;border-left:1px solid var(--border)}
.section-nav{position:sticky;top:8px;z-index:10;margin:12px 0 0;padding:10px 12px;border:1px solid var(--border);border-radius:10px;background:var(--surface);box-shadow:var(--shadow);display:flex;align-items:center;gap:6px;overflow-x:auto}.section-nav>span{margin-right:auto;padding:0 8px;color:var(--muted);font-size:11px;font-weight:800;white-space:nowrap}.section-nav a{padding:7px 10px;border-radius:7px;color:var(--ink);font-size:11px;font-weight:700;text-decoration:none;white-space:nowrap}.section-nav a:hover,.section-nav a:focus-visible{background:var(--accent-soft);color:var(--accent)}
.section-heading,.ledger,.sources,.calculator,.readiness{scroll-margin-top:74px}
.route-filter{margin-top:12px;padding:14px 16px;border:1px solid var(--border);border-radius:10px;background:var(--surface-soft);display:flex;align-items:end;gap:20px}.route-filter label{min-width:0;flex:1}.route-filter label span{margin-bottom:6px;color:var(--muted);font-size:10px;font-weight:800;display:block}.route-filter input{width:100%;height:var(--control-height);padding:0 12px;border:1px solid var(--border);border-radius:8px;background:var(--surface);color:var(--ink)}.route-filter p{margin:0;padding-bottom:9px;color:var(--muted);font-size:11px;white-space:nowrap}.route-filter p strong{color:var(--accent);font-size:15px}
.readiness{margin-top:16px;padding:var(--panel-padding);border:1px solid var(--border);border-radius:var(--panel-radius);background:var(--surface)}.readiness>header{display:flex;align-items:start;justify-content:space-between;gap:24px}.readiness header>div:first-child{max-width:780px}.readiness header>div:first-child>span{color:var(--accent);font-size:10px;font-weight:800}.readiness h2{margin:5px 0;font:700 clamp(21px,3vw,28px)/1.2 Georgia,serif}.readiness header p{margin:0;color:var(--muted);font-size:12px;line-height:1.7}.readiness-score{min-width:150px;text-align:right}.readiness-score strong,.readiness-score span{display:block}.readiness-score strong{color:var(--accent);font-size:24px;font-variant-numeric:tabular-nums}.readiness-score span{margin-top:4px;color:var(--muted);font-size:10px}.progress-track{height:5px;margin:18px 0;border-radius:999px;background:var(--surface-soft);overflow:hidden}.progress-track span{width:100%;height:100%;background:var(--accent);display:block;transform-origin:left}.readiness-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.readiness-grid label{min-height:76px;padding:13px;border:1px solid var(--border);border-radius:9px;background:var(--surface-elevated);display:flex;align-items:start;gap:10px;cursor:pointer}.readiness-grid label.done{border-color:color-mix(in srgb,var(--accent) 55%,var(--border));background:var(--accent-soft)}.readiness-grid input{margin-top:2px;accent-color:var(--accent)}.readiness-grid span,.readiness-grid strong,.readiness-grid small{display:block}.readiness-grid strong{font-size:12px}.readiness-grid small{margin-top:4px;color:var(--muted);font-size:10px;line-height:1.5}.readiness-reset{margin-top:12px;padding:7px 10px;border:0;background:none;color:var(--muted);font-size:10px;text-decoration:underline;cursor:pointer}
.section-heading{max-width:880px;margin:42px 0 16px}.plans{display:grid;grid-template-columns:1fr 1fr;gap:16px}.plans article,.merchant-grid article,.route-cards article{border:1px solid var(--border);border-radius:var(--panel-radius);background:var(--surface)}.plans header{padding:20px 22px;border-bottom:1px solid var(--border)}.plans header small{color:var(--accent)}.plans h3,.merchant-grid h3,.route-cards h3{margin:4px 0;font-size:17px}.plans ol{margin:0;padding:8px 22px 18px;list-style:none}.plans li{padding:14px 0;border-bottom:1px solid var(--border);display:grid;grid-template-columns:28px 1fr;gap:10px}.plans li:last-child{border:0}.plans li>b{width:24px;height:24px;border-radius:50%;background:var(--accent-soft);color:var(--accent);display:grid;place-items:center;font-size:11px}.plans p{margin:4px 0 0;color:var(--muted);font-size:12px;line-height:1.6}
.table-wrap{overflow:auto;border:1px solid var(--border);border-radius:var(--panel-radius);background:var(--surface)}table{width:100%;min-width:920px;border-collapse:collapse;text-align:left;font-size:12px}th,td{padding:14px;border-bottom:1px solid var(--border);vertical-align:top;line-height:1.55}thead th{background:var(--surface-soft);color:var(--muted);font-size:10px;letter-spacing:.08em}tbody th{width:130px}td small{display:block;margin-top:4px;color:var(--accent)}
.merchant-grid,.route-cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.merchant-grid article,.route-cards article{padding:20px}.route-cards header{display:flex;justify-content:space-between;gap:12px}.route-cards header span{color:var(--accent);font-size:11px}.route-cards dl{margin:14px 0 0}.route-cards dl div{padding:8px 0;border-top:1px solid var(--border);display:grid;grid-template-columns:54px 1fr;gap:8px;font-size:12px}.route-cards dt{color:var(--muted)}.route-cards dd{margin:0}
.ledger{margin-top:24px;padding:24px;display:grid;grid-template-columns:1.3fr 1fr;gap:24px;background:var(--inverse);color:var(--inverse-text)}.ledger ul{margin:0;padding-left:20px;color:color-mix(in srgb,var(--inverse-text) 72%,transparent);font-size:12px;line-height:1.9}.coming-soon{margin-top:24px;padding:clamp(30px,6vw,70px);text-align:center}.coming-soon p{max-width:720px;margin:10px auto}
.policy-alert{margin-top:24px;padding:18px 20px;border-color:var(--danger);background:var(--danger-soft)}.policy-alert strong{color:var(--danger)}.policy-alert p,.sources p{margin:6px 0 0;color:var(--muted);font-size:12px;line-height:1.7}.sources{margin-top:24px;padding:20px}.sources h3{margin:0 0 10px}.sources a{margin:8px 12px 0 0;color:var(--accent);font-size:12px;font-weight:700;display:inline-block}
.boundary-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.boundary-grid article{padding:20px}.boundary-grid h3{margin:0 0 10px}.boundary-grid ul{margin:0;padding-left:20px;color:var(--muted);font-size:12px;line-height:1.8}.boundary-grid .prohibited{border-color:color-mix(in srgb,var(--danger) 45%,var(--border));background:color-mix(in srgb,var(--danger-soft) 40%,var(--surface))}
.empty-routes{padding:40px 24px;border:1px dashed var(--border);border-radius:var(--panel-radius);background:var(--surface);text-align:center}.empty-routes strong{font-size:16px}.empty-routes p{margin:6px 0 14px;color:var(--muted);font-size:12px}.empty-routes button{padding:8px 12px;border:1px solid var(--border);border-radius:7px;background:var(--surface-soft);color:var(--ink);cursor:pointer}
.calculator{margin-top:24px;padding:var(--panel-padding);border:1px solid var(--border);border-radius:var(--panel-radius);background:var(--surface)}.calculator>header{display:flex;align-items:start;justify-content:space-between;gap:24px}.calculator>header>div:first-child{max-width:800px}.calculator header>div>span{color:var(--accent);font-size:10px;font-weight:800}.calculator h2{margin:6px 0;font:700 clamp(22px,3vw,30px)/1.2 Georgia,serif}.calculator header p{margin:0;color:var(--muted);font-size:12px;line-height:1.7}.calculator-actions{min-width:160px;text-align:right}.calculator-actions small{margin-bottom:8px;color:var(--muted);font-size:10px;display:block}.calculator-actions button{padding:8px 10px;border:1px solid var(--border);border-radius:7px;background:var(--surface-soft);color:var(--ink);cursor:pointer}.calculator-actions button:hover,.calculator-actions button:focus-visible{border-color:var(--accent);color:var(--accent)}.calculator-grid{margin-top:20px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.calculator-grid label>span{margin-bottom:6px;color:var(--muted);font-size:10px;font-weight:700;display:block}.calculator-grid input{width:100%;height:var(--control-height);padding:0 12px;border:1px solid var(--border);border-radius:8px;background:var(--surface-elevated);color:var(--ink);font-variant-numeric:tabular-nums}.input-suffix{position:relative}.input-suffix input{padding-right:50px}.input-suffix b{position:absolute;right:12px;top:50%;color:var(--muted);font-size:10px;transform:translateY(-50%)}.calculator-result{margin-top:16px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.calculator-result div{padding:16px;border-radius:10px;background:var(--surface-soft)}.calculator-result small,.calculator-result strong,.calculator-result span{display:block}.calculator-result small,.calculator-result span{color:var(--muted);font-size:10px}.calculator-result strong{margin:6px 0;color:var(--accent);font-size:24px;font-variant-numeric:tabular-nums}.calculator-result .negative strong{color:var(--danger)}.calculator-verdict{margin:12px 0 0;padding:12px 14px;border-left:3px solid var(--border);background:var(--surface-elevated);display:grid;gap:3px}.calculator-verdict strong{font-size:12px}.calculator-verdict span{color:var(--muted);font-size:11px;line-height:1.6}.calculator-verdict.positive{border-color:var(--accent)}.calculator-verdict.positive strong{color:var(--accent)}.calculator-verdict.negative{border-color:var(--danger)}.calculator-verdict.negative strong{color:var(--danger)}
@media(max-width:1050px){.game-tabs{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:900px){.guardrail,.game-summary,.plans,.ledger{grid-template-columns:1fr}.game-summary aside{padding:18px 0 0;border-top:1px solid var(--border);border-left:0}.section-nav>span{display:none}.calculator-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.readiness-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:620px){.game-income-view{padding:18px}.game-picker-heading{align-items:stretch;flex-direction:column}.game-picker-heading label{width:100%;min-width:0}.game-tabs{display:flex;margin-inline:-18px;padding:0 18px;overflow-x:auto;scroll-snap-type:x mandatory}.game-tabs button{min-width:210px;min-height:72px;scroll-snap-align:start}.merchant-grid,.route-cards,.boundary-grid,.calculator-grid,.calculator-result,.readiness-grid{grid-template-columns:1fr}.guardrail{padding:18px}.section-nav{top:4px;margin-inline:-6px;box-shadow:none}.route-filter{align-items:stretch;flex-direction:column;gap:4px}.route-filter p{padding:0}.readiness>header{align-items:stretch;flex-direction:column}.readiness-score{text-align:left}.calculator>header{align-items:stretch;flex-direction:column}.calculator-actions{min-width:0;text-align:left}.table-wrap{margin-inline:0;overflow:visible;border:0;background:transparent}table{min-width:0;display:block}thead{display:none}tbody{display:grid;gap:10px}tr{padding:16px;border:1px solid var(--border);border-radius:10px;background:var(--surface);display:block}tbody th{width:auto;padding:0 0 12px;border-bottom:1px solid var(--border);display:block;font-size:15px}td{padding:10px 0 0;border:0;display:grid;grid-template-columns:92px 1fr;gap:10px}td::before{content:attr(data-label);color:var(--muted);font-size:10px;font-weight:800}td small{grid-column:2}}
</style>
