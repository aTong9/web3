export type NorwayFundMilestoneKind = '制度' | '配置' | '危机' | '责任投资' | '地缘政治'

export interface NorwayFundMilestone {
  year: number
  title: string
  summary: string
  impact: string
  kind: NorwayFundMilestoneKind
  isTurningPoint: boolean
  sourceUrl: string
}

export interface NorwayFundHolding {
  rank: number
  company: string
  country: string
  sector: string
  marketValueBillionNok: number
  ownershipPct: number
}

export const norwayFundSources = {
  halfYear:
    'https://www.nbim.no/en/news-and-insights/reports/2026/half-year-report-2026/web-report-half-year-report-2026/',
  history: 'https://www.nbim.no/en/the-fund/the-history/',
  holdings: 'https://www.nbim.no/en/investments/all-investments/',
  fiscalRule:
    'https://www.regjeringen.no/no/tema/okonomi-og-budsjett/norsk_okonomi/economic-policy/id418083/',
}

export const norwayFundSummary = {
  asOfDate: '2026-06-30',
  publishedDate: '2026-08-12',
  valueBillionNok: 22683,
  halfYearReturnPct: 9.4,
  halfYearReturnBillionNok: 1753,
  relativeReturnPctPoints: 0.22,
  netInflowBillionNok: 89,
  currencyEffectBillionNok: -427,
  expectedVolatilityPct: 11.1,
  listedCompanies: '约 7,000 家',
}

export const norwayFundAssetAllocation = [
  { id: 'equity', label: '上市股票', weightPct: 72.08, valueBillionNok: 16357.8, returnPct: 13 },
  {
    id: 'fixed-income',
    label: '固定收益',
    weightPct: 25.82,
    valueBillionNok: 5860.1,
    returnPct: 0.9,
  },
  {
    id: 'real-estate',
    label: '非上市房地产',
    weightPct: 1.64,
    valueBillionNok: 372.8,
    returnPct: 3,
  },
  {
    id: 'renewable',
    label: '非上市可再生能源基础设施',
    weightPct: 0.46,
    valueBillionNok: 104.4,
    returnPct: -0.2,
  },
]

export const norwayFundEquitySectors = [
  ['科技', 32.2, 5288, 25.3],
  ['金融', 15.8, 2592.2, 7],
  ['工业', 12.9, 2120.9, 12.3],
  ['可选消费', 11.3, 1851.1, -4],
  ['医疗保健', 8.4, 1391.4, 3.4],
  ['通信', 3.8, 624.5, 42.9],
  ['房地产（上市）', 3.7, 600.2, 7.6],
  ['必选消费', 3.6, 590, 5],
  ['基础材料', 3.5, 566.4, 10.5],
  ['能源', 2.9, 482.4, 17.1],
  ['公用事业', 2.4, 397.9, 9.8],
] as const

export const norwayFundEquityRegions = [
  ['北美', 57],
  ['欧洲', 20.1],
  ['亚洲及大洋洲', 12.9],
  ['新兴市场', 10.5],
] as const

export const norwayFundTopHoldings: NorwayFundHolding[] = [
  [1, 'NVIDIA', '美国', '科技', 612, 1.28],
  [2, 'Apple', '美国', '科技', 521.7, 1.24],
  [3, 'Alphabet', '美国', '科技', 499.4, 1.17],
  [4, 'Microsoft', '美国', '科技', 347.5, 1.27],
  [5, 'Taiwan Semiconductor Manufacturing', '台湾', '科技', 331.8, 1.7],
  [6, 'Amazon.com', '美国', '可选消费', 315.3, 1.24],
  [7, 'Broadcom', '美国', '科技', 231.6, 1.3],
  [8, 'Samsung Electronics', '韩国', '通信（NBIM 分类）', 222.8, 1.88],
  [9, 'ASML Holding', '荷兰', '科技', 175, 2.32],
  [10, 'SK hynix', '韩国', '科技', 174.1, 1.44],
].map(([rank, company, country, sector, marketValueBillionNok, ownershipPct]) => ({
  rank: Number(rank),
  company: String(company),
  country: String(country),
  sector: String(sector),
  marketValueBillionNok: Number(marketValueBillionNok),
  ownershipPct: Number(ownershipPct),
}))

export const norwayFundFixedIncome = [
  ['政府债', 54.9, 0.5],
  ['公司债', 26.3, 1.3],
  ['政府相关债', 10.4, 1.7],
  ['通胀挂钩债', 6.4, 2.1],
  ['证券化债券', 5.9, -0.5],
] as const

export const norwayFundMilestones: NorwayFundMilestone[] = [
  {
    year: 1969,
    title: 'Ekofisk 油田被发现',
    summary: '石油财富从设想变为真实财政来源。',
    impact: '挪威开始面对资源收入对汇率、通胀和国内经济的冲击。',
    kind: '制度',
    isTurningPoint: false,
    sourceUrl: norwayFundSources.history,
  },
  {
    year: 1983,
    title: 'Tempo 委员会提出基金构想',
    summary: '建议储存暂时性石油收入，并主要使用真实回报。',
    impact: '形成跨世代保存本金、节制使用收益的制度雏形。',
    kind: '制度',
    isTurningPoint: true,
    sourceUrl: norwayFundSources.history,
  },
  {
    year: 1990,
    title: '议会通过石油基金法',
    summary: 'Government Petroleum Fund 获得法定基础。',
    impact: '把资源财富管理从政策讨论转为国家制度，但当时尚未注资。',
    kind: '制度',
    isTurningPoint: true,
    sourceUrl: norwayFundSources.history,
  },
  {
    year: 1996,
    title: '首次转入接近 20 亿克朗',
    summary: '基金从法律账户成为真实的境外投资组合。',
    impact: '确立全部投资海外、隔离国内经济冲击的执行原则。',
    kind: '配置',
    isTurningPoint: true,
    sourceUrl: norwayFundSources.history,
  },
  {
    year: 1998,
    title: 'NBIM 成立并配置 40% 股票',
    summary: '约 40% 的债券组合在半年内转为股票。',
    impact: '专业投资体系成形，组合开始承担全球股票风险。',
    kind: '配置',
    isTurningPoint: true,
    sourceUrl: norwayFundSources.history,
  },
  {
    year: 2001,
    title: '财政规则建立',
    summary: '财政支出长期跟随基金预期真实回报，并允许跨周期平滑。',
    impact: '把石油收入与国内年度支出制度性分离。',
    kind: '制度',
    isTurningPoint: true,
    sourceUrl: norwayFundSources.fiscalRule,
  },
  {
    year: 2004,
    title: '建立伦理准则',
    summary: '引入所有权行使、观察、筛选和排除机制。',
    impact: '投资目标之外形成正式的责任投资治理体系。',
    kind: '责任投资',
    isTurningPoint: true,
    sourceUrl: norwayFundSources.history,
  },
  {
    year: 2007,
    title: '战略股票比例从 40% 提至 60%',
    summary: '同时把小盘公司纳入基准。',
    impact: '长期预期回报与短期回撤风险同步显著提高。',
    kind: '配置',
    isTurningPoint: true,
    sourceUrl: norwayFundSources.history,
  },
  {
    year: 2008,
    title: '金融危机回报 -23.3%',
    summary: '60% 股票路线遭遇第一次极端压力检验。',
    impact: '政策没有在低点逆转；房地产同时获准进入投资范围。',
    kind: '危机',
    isTurningPoint: true,
    sourceUrl: norwayFundSources.history,
  },
  {
    year: 2011,
    title: '首次投资非上市房地产',
    summary: '购入伦敦 Regent Street 物业组合权益。',
    impact: '资产范围扩展至流动性较低、依赖模型估值的实物资产。',
    kind: '配置',
    isTurningPoint: true,
    sourceUrl: norwayFundSources.history,
  },
  {
    year: 2017,
    title: '战略股票比例提高到 70%',
    summary: '财政规则的预期真实回报假设也从 4% 下调至 3%。',
    impact: '今天的组合由股票风险主导，同时财政使用假设更加保守。',
    kind: '配置',
    isTurningPoint: true,
    sourceUrl: norwayFundSources.history,
  },
  {
    year: 2021,
    title: '首次投资可再生能源基础设施',
    summary: '购买荷兰 Borssele 1 & 2 风场 50% 权益。',
    impact: '新增长期项目现金流，也引入电价、运营和估值风险。',
    kind: '配置',
    isTurningPoint: true,
    sourceUrl: norwayFundSources.history,
  },
  {
    year: 2022,
    title: '冻结并决定退出俄罗斯投资',
    summary: '俄乌战争后，俄罗斯从投资范围和基准中移除。',
    impact: '显示国家政策和制裁可覆盖通常的金融投资授权；退出不等于立即变现。',
    kind: '地缘政治',
    isTurningPoint: true,
    sourceUrl:
      'https://www.nbim.no/en/news-and-insights/submissions-to-ministry/2022/the-government-pension-fund-globals-investments-in-russia/',
  },
  {
    year: 2026,
    title: '规模达到 22.683 万亿克朗',
    summary: '上半年回报 9.4%，同时受到净流入与克朗升值影响。',
    impact: '规模变化必须拆分投资收益、资金流和汇率，不能只看单一总数。',
    kind: '制度',
    isTurningPoint: false,
    sourceUrl: norwayFundSources.halfYear,
  },
]
