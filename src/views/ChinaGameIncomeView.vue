<script setup lang="ts">
import { computed, ref } from 'vue'
import ResearchPageHeader from '@/components/research/ResearchPageHeader.vue'
import {
  chinaGameGuides,
  chinaGameIncomeUpdatedAt,
  fantasyWestwardRoutes,
} from '@/data/china-game-income-guides'
import type { ChinaGameGuide } from '@/data/china-game-income-guides'

const defaultGame = chinaGameGuides[0]!
const activeGameId = ref(defaultGame.id)
const activeGame = computed<ChinaGameGuide>(
  () => chinaGameGuides.find((game) => game.id === activeGameId.value) ?? defaultGame,
)

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

    <template v-if="activeGame.id === 'fantasy-westward-journey'">
      <section class="section-heading"><span>01 · ACCOUNT PLAN</span><h2>五开与十开执行方案</h2><p>先跑通一组五开，再以真实净时薪决定是否扩到十开。十开不是把在线时间翻倍，而是把两支队伍拆账、错峰和止损。</p></section>
      <div class="plans">
        <article><header><small>适合起步</small><h3>五开：单队闭环</h3></header><ol><li v-for="([title, text], index) in fiveAccountPlan" :key="title"><b>{{ index + 1 }}</b><div><strong>{{ title }}</strong><p>{{ text }}</p></div></li></ol></article>
        <article><header><small>资本与管理升级</small><h3>十开：双队错峰</h3></header><ol><li v-for="([title, text], index) in tenAccountPlan" :key="title"><b>{{ index + 1 }}</b><div><strong>{{ title }}</strong><p>{{ text }}</p></div></li></ol></article>
      </div>

      <section class="section-heading"><span>02 · ROUTE MATRIX</span><h2>主要赚钱玩法矩阵</h2><p>“所有玩法”按可重复经营链路归类；具体任务奖励和门槛以所在区服、等级段和当前版本为准。</p></section>
      <div class="table-wrap"><table><thead><tr><th>玩法</th><th>门槛 / 周期</th><th>产出</th><th>怎么做</th><th>主要风险</th></tr></thead><tbody><tr v-for="route in fantasyWestwardRoutes" :key="route.name"><th>{{ route.name }}</th><td>{{ route.entry }}<small>{{ route.cadence }}</small></td><td>{{ route.output }}</td><td>{{ route.operation }}</td><td>{{ route.risk }}</td></tr></tbody></table></div>

      <section class="section-heading"><span>03 · MERCHANT DESK</span><h2>宝石商人及摆摊经营</h2><p>商人利润来自信息、周转和库存纪律，不来自“必涨”。以下流程均以真实成交价而非挂牌价为依据。</p></section>
      <div class="merchant-grid"><article v-for="item in merchantPlaybook" :key="item.title"><h3>{{ item.title }}</h3><p>{{ item.text }}</p></article></div>

      <section class="ledger"><div><span>每日只记四项</span><h2>净收益 = 现金变化 + 已售物品 − 点卡/补给/手续费 − 库存跌价</h2></div><ul><li>工时分开记录：任务、摆摊、补货</li><li>未售物品按保守成交价计，不按最高挂牌价</li><li>连续 14 天比较五开与十开的净时薪</li></ul></section>
    </template>

    <template v-else-if="activeGame.id === 'aion'">
      <section class="policy-alert"><strong>永恒之塔只提供单账号正常玩家方案</strong><p>2026 年官方处罚公告明确打击多开器、同 IP 大量账号、以盈利为目的利用多个角色获利及大规模囤货出售，因此本页不提供多开或批量经营方案。</p></section>
      <section class="section-heading"><span>AION · ECONOMY LOOP</span><h2>永恒之塔经营路线</h2><p>先选择一个材料或消耗品品类，把采集、制作、副本掉落和交易中介所连接成闭环；不同版本与服务器经济不可直接套用。</p></section>
      <div class="route-cards"><article v-for="route in activeGame.routes" :key="route.name"><header><h3>{{ route.name }}</h3><span>{{ route.cadence }}</span></header><p>{{ route.operation }}</p><dl><div><dt>门槛</dt><dd>{{ route.entry }}</dd></div><div><dt>产出</dt><dd>{{ route.output }}</dd></div><div><dt>风险</dt><dd>{{ route.risk }}</dd></div></dl></article></div>
      <section class="ledger"><div><span>推荐顺序</span><h2>采集小样本 → 验证成交 → 再投制作熟练度与库存</h2></div><ul><li>只按可交易掉落核算副本收入</li><li>制作前比较材料直接出售的机会成本</li><li>基纳只在游戏内核算，不把私下交易当收入</li></ul></section>
      <section class="sources"><h3>官方规则与功能依据</h3><a href="https://aion.web.sdo.com/web12/newsContent.html?CategoryID=1362&id=389026" target="_blank" rel="noreferrer">2026 非正常行为处罚公告 ↗</a><a href="https://aion.web.sdo.com/web12/newsContent.html?CategoryID=5892&id=343757" target="_blank" rel="noreferrer">官方反外挂 FAQ ↗</a><a href="https://aion.web.sdo.com/web12/newsContent.html?CategoryID=5892&id=386696" target="_blank" rel="noreferrer">版本与世界交易所说明 ↗</a></section>
    </template>

    <template v-else>
      <section v-if="activeGame.ruleNote" class="policy-alert"><strong>{{ activeGame.accountModel }}</strong><p>{{ activeGame.ruleNote }}</p></section>

      <section class="section-heading"><span>01 · OPERATING MODEL</span><h2>账号模型与合规边界</h2><p>只采用当前官方客户端与正常玩家行为；先确认服务器、版本、绑定状态和交易规则，再投入角色与库存。</p></section>
      <div class="boundary-grid">
        <article><h3>可做范围</h3><ul><li v-for="item in activeGame.allowed" :key="item">{{ item }}</li></ul></article>
        <article class="prohibited"><h3>不纳入指南</h3><ul><li v-for="item in activeGame.prohibited" :key="item">{{ item }}</li></ul></article>
      </div>

      <section class="section-heading"><span>02 · DAILY / WEEKLY PLAN</span><h2>日常与周期排班</h2><p>固定收益先做，小样本验证后才追加时间；绑定奖励只算角色成长，不计入可交易收入。</p></section>
      <div class="plans">
        <article><header><small>DAILY LOOP</small><h3>每日执行</h3></header><ol><li v-for="(step, index) in activeGame.dailyPlan" :key="step.title"><b>{{ index + 1 }}</b><div><strong>{{ step.title }}</strong><p>{{ step.detail }}</p></div></li></ol></article>
        <article><header><small>WEEKLY LOOP</small><h3>每周复盘</h3></header><ol><li v-for="(step, index) in activeGame.weeklyPlan" :key="step.title"><b>{{ index + 1 }}</b><div><strong>{{ step.title }}</strong><p>{{ step.detail }}</p></div></li></ol></article>
      </div>

      <section class="section-heading"><span>03 · ROUTE MATRIX</span><h2>{{ activeGame.name }} 主要经济玩法</h2><p>每条路径都同时展示进入门槛、产出、执行方式和最容易被忽略的成本。</p></section>
      <div class="table-wrap"><table><thead><tr><th>玩法</th><th>门槛 / 周期</th><th>产出</th><th>怎么做</th><th>主要风险</th></tr></thead><tbody><tr v-for="route in activeGame.routes" :key="route.name"><th>{{ route.name }}</th><td>{{ route.entry }}<small>{{ route.cadence }}</small></td><td>{{ route.output }}</td><td>{{ route.operation }}</td><td>{{ route.risk }}</td></tr></tbody></table></div>

      <section class="section-heading"><span>04 · MARKET DESK</span><h2>市场与商人经营</h2><p>价差必须建立在真实成交、手续费和库存周转上，不把活动期最高挂牌价当作利润。</p></section>
      <div class="merchant-grid"><article v-for="item in activeGame.merchantPlan" :key="item.title"><h3>{{ item.title }}</h3><p>{{ item.detail }}</p></article></div>

      <section class="ledger"><div><span>成本账本</span><h2>只比较已成交净值，不用理论最高价估算收益</h2></div><ul><li v-for="item in activeGame.ledger" :key="item">{{ item }}</li></ul></section>
      <section class="sources"><h3>官方规则与系统来源</h3><a v-for="source in activeGame.sources" :key="source.url" :href="source.url" target="_blank" rel="noreferrer">{{ source.label }} ↗</a></section>
    </template>

    <section v-if="activeGame.id === 'fantasy-westward-journey'" class="sources"><h3>规则校验入口</h3><p>公开网页未提供稳定的电脑版固定多开数字。发布前仍需在当前登录器、客户端协议或官方客服确认；以下链接只用于核验网易通用行为与非官方交易边界。</p><a href="https://protocol.unisdk.netease.com/release/latest_v195.html" target="_blank" rel="noreferrer">网易游戏使用许可及服务协议 ↗</a><a href="https://unisdk.update.netease.com/html/latest_v38.html" target="_blank" rel="noreferrer">网易产品服务条款与玩家守则实例 ↗</a></section>
  </main>
</template>

<style scoped>
.game-income-view{width:min(var(--content-wide),100%);margin:0 auto;padding:var(--page-gutter)}
.guardrail,.game-summary,.ledger,.coming-soon,.policy-alert,.sources,.boundary-grid article{border:1px solid var(--border);border-radius:var(--panel-radius);background:var(--surface)}
.guardrail{padding:20px 24px;display:grid;grid-template-columns:280px 1fr;gap:28px;border-left:4px solid var(--warning)}
.guardrail span,.section-heading span,.ledger span,.coming-soon>span{color:var(--accent);font-size:10px;font-weight:800;letter-spacing:.14em}.guardrail h2,.game-summary h2,.section-heading h2,.ledger h2,.coming-soon h2{margin:6px 0;font:700 clamp(22px,3vw,32px)/1.2 Georgia,serif}.guardrail p,.game-summary p,.section-heading p,.merchant-grid p,.route-cards p,.coming-soon p{margin:0;color:var(--muted);font-size:13px;line-height:1.75}
.game-tabs{margin:20px 0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.game-tabs button{min-height:88px;padding:14px;text-align:left;border:1px solid var(--border);border-radius:10px;background:var(--surface);color:var(--ink);cursor:pointer;position:relative}.game-tabs button.active{border-color:var(--accent);background:var(--accent-soft)}.game-tabs span,.game-tabs small{display:block}.game-tabs span{font-weight:800}.game-tabs small{margin-top:5px;color:var(--muted)}.game-tabs em{position:absolute;top:10px;right:10px;color:var(--accent);font-size:9px;font-style:normal}
.game-summary{padding:24px;display:grid;grid-template-columns:1.4fr 1fr;gap:30px}.game-summary small{color:var(--muted)}.game-summary aside{padding-left:24px;border-left:1px solid var(--border)}
.section-heading{max-width:880px;margin:42px 0 16px}.plans{display:grid;grid-template-columns:1fr 1fr;gap:16px}.plans article,.merchant-grid article,.route-cards article{border:1px solid var(--border);border-radius:var(--panel-radius);background:var(--surface)}.plans header{padding:20px 22px;border-bottom:1px solid var(--border)}.plans header small{color:var(--accent)}.plans h3,.merchant-grid h3,.route-cards h3{margin:4px 0;font-size:17px}.plans ol{margin:0;padding:8px 22px 18px;list-style:none}.plans li{padding:14px 0;border-bottom:1px solid var(--border);display:grid;grid-template-columns:28px 1fr;gap:10px}.plans li:last-child{border:0}.plans li>b{width:24px;height:24px;border-radius:50%;background:var(--accent-soft);color:var(--accent);display:grid;place-items:center;font-size:11px}.plans p{margin:4px 0 0;color:var(--muted);font-size:12px;line-height:1.6}
.table-wrap{overflow:auto;border:1px solid var(--border);border-radius:var(--panel-radius);background:var(--surface)}table{width:100%;min-width:920px;border-collapse:collapse;text-align:left;font-size:12px}th,td{padding:14px;border-bottom:1px solid var(--border);vertical-align:top;line-height:1.55}thead th{background:var(--surface-soft);color:var(--muted);font-size:10px;letter-spacing:.08em}tbody th{width:130px}td small{display:block;margin-top:4px;color:var(--accent)}
.merchant-grid,.route-cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.merchant-grid article,.route-cards article{padding:20px}.route-cards header{display:flex;justify-content:space-between;gap:12px}.route-cards header span{color:var(--accent);font-size:11px}.route-cards dl{margin:14px 0 0}.route-cards dl div{padding:8px 0;border-top:1px solid var(--border);display:grid;grid-template-columns:54px 1fr;gap:8px;font-size:12px}.route-cards dt{color:var(--muted)}.route-cards dd{margin:0}
.ledger{margin-top:24px;padding:24px;display:grid;grid-template-columns:1.3fr 1fr;gap:24px;background:var(--inverse);color:var(--inverse-text)}.ledger ul{margin:0;padding-left:20px;color:color-mix(in srgb,var(--inverse-text) 72%,transparent);font-size:12px;line-height:1.9}.coming-soon{margin-top:24px;padding:clamp(30px,6vw,70px);text-align:center}.coming-soon p{max-width:720px;margin:10px auto}
.policy-alert{margin-top:24px;padding:18px 20px;border-color:var(--danger);background:var(--danger-soft)}.policy-alert strong{color:var(--danger)}.policy-alert p,.sources p{margin:6px 0 0;color:var(--muted);font-size:12px;line-height:1.7}.sources{margin-top:24px;padding:20px}.sources h3{margin:0 0 10px}.sources a{margin:8px 12px 0 0;color:var(--accent);font-size:12px;font-weight:700;display:inline-block}
.boundary-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.boundary-grid article{padding:20px}.boundary-grid h3{margin:0 0 10px}.boundary-grid ul{margin:0;padding-left:20px;color:var(--muted);font-size:12px;line-height:1.8}.boundary-grid .prohibited{border-color:color-mix(in srgb,var(--danger) 45%,var(--border));background:color-mix(in srgb,var(--danger-soft) 40%,var(--surface))}
@media(max-width:900px){.game-tabs{grid-template-columns:repeat(2,minmax(0,1fr))}.guardrail,.game-summary,.plans,.ledger{grid-template-columns:1fr}.game-summary aside{padding:18px 0 0;border-top:1px solid var(--border);border-left:0}}
@media(max-width:620px){.game-income-view{padding:18px}.game-tabs,.merchant-grid,.route-cards,.boundary-grid{grid-template-columns:1fr}.game-tabs button{min-height:76px}.guardrail{padding:18px}.table-wrap{margin-inline:-18px;border-radius:0}}
</style>
