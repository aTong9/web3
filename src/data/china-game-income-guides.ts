export interface ChinaGameRoute {
  name: string
  entry: string
  cadence: string
  output: string
  operation: string
  risk: string
}

export interface ChinaGameGuide {
  id: string
  name: string
  edition: string
  stage: '深度指南' | '扩展中'
  positioning: string
  settlement: string
  routes: ChinaGameRoute[]
}

export const chinaGameIncomeUpdatedAt = '2026-08-29'

export const fantasyWestwardRoutes: ChinaGameRoute[] = [
  {
    name: '师门与日常',
    entry: '角色等级与基础装备',
    cadence: '每日',
    output: '游戏币、经验、储备金',
    operation: '先清固定时长、低波动任务，记录每组完成时间与净产出。',
    risk: '任务成本和区服物价会吃掉毛利。',
  },
  {
    name: '抓鬼与周常',
    entry: '稳定五人队、基础药品旗子',
    cadence: '每日 / 每周',
    output: '游戏币、环装与随机物品',
    operation: '固定队长与路线，按小时统计现金、物品估值和消耗。',
    risk: '随机掉落不能当固定收入。',
  },
  {
    name: '普通 / 侠士副本',
    entry: '达到副本门槛并熟悉机制',
    cadence: '副本周期',
    output: '副本积分、物品与游戏币',
    operation: '优先选择通关稳定、单位时间价值高的副本，再逐步提高难度。',
    risk: '高难失败、耐久和药品成本。',
  },
  {
    name: '节日与限时活动',
    entry: '关注游戏内活动日历',
    cadence: '限时',
    output: '活动物品、积分与经验',
    operation: '活动首日先小样本测算，收益高于常规任务再切换排班。',
    risk: '奖励与市场价格随活动快速变化。',
  },
  {
    name: '生活技能制造',
    entry: '烹饪、炼药、家具、打造等技能',
    cadence: '持续经营',
    output: '消耗品与制造品',
    operation: '用体力活力生产高周转品，按材料、手续费和滞销天数核算。',
    risk: '技能投入沉没、同质竞争压价。',
  },
  {
    name: '打图与宝图链路',
    entry: '符合任务门槛的角色',
    cadence: '日常',
    output: '藏宝图及相关物品',
    operation: '可直接销售，也可继续挖图；两条路径分开记账，避免混淆运气与产能。',
    risk: '挖图波动大，不能用单日爆品外推月收益。',
  },
  {
    name: '召唤兽与装备经营',
    entry: '懂资质、技能、属性和区服成交价',
    cadence: '低频高客单',
    output: '买卖价差',
    operation: '只交易能说明估值逻辑的标的，先从低库存、快周转的小额商品开始。',
    risk: '鉴定、炼妖和追涨均可能造成大额亏损。',
  },
  {
    name: '摆摊与跨时段价差',
    entry: '启动资金、摊位与价格记录',
    cadence: '持续经营',
    output: '商品买卖价差',
    operation: '记录早晚成交区间，收购刚需品后在需求时段零售，不追求一次性暴利。',
    risk: '摊位费、库存占用、改价与版本更新。',
  },
]

export const aionRoutes: ChinaGameRoute[] = [
  {
    name: '采集与奥德',
    entry: '对应采集熟练度与安全路线',
    cadence: '日常',
    output: '原材料',
    operation: '观察交易中介所成交需求，优先采集高周转材料并错峰出售。',
    risk: '抢点、阵营冲突、地图与版本调整。',
  },
  {
    name: '制作与炼金',
    entry: '制作熟练度、图纸和周转金',
    cadence: '持续经营',
    output: '消耗品、装备与部件',
    operation: '以订单和真实成交价反推生产，不按挂牌价盲目囤料。',
    risk: '暴击制作波动、材料涨价与成品滞销。',
  },
  {
    name: '副本材料与装备',
    entry: '满足副本装等并有稳定队伍',
    cadence: '周常 / 重置周期',
    output: '可交易掉落、材料与角色成长',
    operation: '固定队降低组队时间，按可交易掉落而非账面总掉落核算。',
    risk: '绑定物品无法变现，失败和消耗会降低时薪。',
  },
  {
    name: '交易中介所价差',
    entry: '本金与价格记录',
    cadence: '持续经营',
    output: '基纳价差',
    operation: '聚焦少量熟悉品类，设置最高库存与止损天数。',
    risk: '手续费、低流动性、版本更新与违规交易风险。',
  },
]

export const chinaGameGuides: ChinaGameGuide[] = [
  {
    id: 'fantasy-westward-journey',
    name: '梦幻西游电脑版',
    edition: '五开 / 十开与商人经营',
    stage: '深度指南',
    positioning: '任务产出打底，生活技能和低风险周转提高资金效率。',
    settlement: '游戏内经济为主；涉及现实货币时只使用官方认可渠道并复核当期规则。',
    routes: fantasyWestwardRoutes,
  },
  {
    id: 'aion',
    name: '永恒之塔',
    edition: '采集 / 制作 / 副本 / 交易',
    stage: '深度指南',
    positioning: '围绕材料、消耗品和可交易副本掉落建立小规模经营闭环。',
    settlement: '先按游戏内基纳核算；不把非官方现金交易计入收入。',
    routes: aionRoutes,
  },
  {
    id: 'westward-journey-2',
    name: '大话西游2',
    edition: '多开任务与召唤兽经济',
    stage: '扩展中',
    positioning: '后续补充日常、副本、职业与藏宝阁资产经营。',
    settlement: '待按最新官方规则核验。',
    routes: [],
  },
  {
    id: 'wendao',
    name: '问道',
    edition: '五开任务与市场经营',
    stage: '扩展中',
    positioning: '后续补充等级段、日常周期、宠物与装备市场。',
    settlement: '待按最新官方规则核验。',
    routes: [],
  },
  {
    id: 'ghost-online',
    name: '新倩女幽魂',
    edition: '生活技能与装备经济',
    stage: '扩展中',
    positioning: '后续补充日常副本、生活技能、装备词条与官方寄售。',
    settlement: '待按最新官方规则核验。',
    routes: [],
  },
  {
    id: 'justice-online',
    name: '逆水寒',
    edition: '身份玩法与版本供需',
    stage: '扩展中',
    positioning: '后续区分端游与手游，补充生活玩法、材料和交易行供需。',
    settlement: '待按最新官方规则核验。',
    routes: [],
  },
  {
    id: 'dnf-cn',
    name: '地下城与勇士国服',
    edition: '材料、副本与拍卖行',
    stage: '扩展中',
    positioning: '后续补充单账号角色、可交易材料、拍卖行和版本周期。',
    settlement: '游戏内金币核算；现金化边界待官方规则核验。',
    routes: [],
  },
  {
    id: 'world-of-warcraft-cn',
    name: '魔兽世界国服',
    edition: '专业制造与拍卖行',
    stage: '扩展中',
    positioning: '后续补充专业、材料、团本消耗品和版本周期。',
    settlement: '游戏内金币核算；现金化边界待官方规则核验。',
    routes: [],
  },
]
