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

export interface NorwayFundSnapshot {
  schemaVersion: number
  updatedAt: string
  status: 'complete'
  source: string
  sources: { report: string; holdings: string; holdingsApi: string }
  summary: {
    asOfDate: string
    publishedDate: string
    periodLabel: string
    valueBillionNok: number
    periodReturnPct: number
    periodReturnBillionNok: number
    relativeReturnPctPoints: number
    netInflowBillionNok: number
    currencyEffectBillionNok: number
    expectedVolatilityPct: number
    listedCompanies: number
  }
  availability: {
    equityRegions: 'reported' | 'not-reported'
  }
  assetAllocation: Array<{
    id: string
    label: string
    weightPct: number
    valueBillionNok: number
    returnPct: number
  }>
  equitySectors: Array<{
    label: string
    weightPct: number
    marketValueBillionNok: number
    returnPct: number
  }>
  equityRegions: Array<{ label: string; weightPct: number; returnPct: number }>
  topHoldings: NorwayFundHolding[]
  fixedIncome: Array<{ label: string; weightPct: number; returnPct: number }>
}

export const norwayFundSources = {
  halfYear:
    'https://www.nbim.no/en/news-and-insights/reports/2026/half-year-report-2026/web-report-half-year-report-2026/',
  history: 'https://www.nbim.no/en/the-fund/the-history/',
  holdings: 'https://www.nbim.no/en/investments/all-investments/',
  fiscalRule:
    'https://www.regjeringen.no/no/tema/okonomi-og-budsjett/norsk_okonomi/economic-policy/id418083/',
}

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
