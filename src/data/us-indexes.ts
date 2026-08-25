export type UsIndexId = 'qqq' | 'sp500'
export type UsIndexMilestoneKind = '发布' | '产品化' | '危机' | '方法调整'

export interface UsIndexHolding {
  rank: number
  ticker: string
  name: string
  sector: string
  weightPct: number | null
}

export interface UsWeightedIndexHolding extends UsIndexHolding {
  weightPct: number
}

export interface UsIndexMilestone {
  year: string
  indexId: UsIndexId | 'both'
  title: string
  summary: string
  impact: string
  kind: UsIndexMilestoneKind
  isTurningPoint: boolean
  sourceUrl: string
}

export const usIndexSources = {
  qqqHome: 'https://www.invesco.com/qqq-etf/en/home.html',
  qqqAbout: 'https://www.invesco.com/qqq-etf/en/about.html',
  nasdaqOverview: 'https://indexes.nasdaqomx.com/Index/Overview/NDX',
  nasdaqMethodology: 'https://indexes.nasdaqomx.com/docs/methodology_NDX.pdf',
  nasdaqSnapshot: 'https://indexes.nasdaqomx.com/docs/NDXESG_Research_Presentation.pdf',
  sp500: 'https://www.spglobal.com/spdji/en/indices/equity/sp-500/',
  sp500Methodology:
    'https://www.spglobal.com/spdji/en/documents/methodologies/methodology-sp-us-indices.pdf',
}

export const qqqProfile = {
  id: 'qqq' as const,
  name: 'Invesco QQQ ETF',
  indexName: 'Nasdaq-100',
  productType: 'ETF' as const,
  inceptionDate: '1999-03-10',
  fundAsOfDate: '2026-06-30',
  holdingsAsOfDate: '2026-03-31',
  expenseRatioPct: 0.18,
  constituentCount: 100,
  top10WeightPct: 46.9,
  largestWeightPct: 8.7,
  technologyWeightPct: 59.8,
  sectorSystem: 'ICB',
  weighting: '修正市值加权',
  selection: 'Nasdaq 上市的大型非金融公司，采用系统化规则选择',
  review: '12 月年度重构；3、6、9 月再平衡；另有 Fast Entry 与特别再平衡',
}

export const sp500Profile = {
  id: 'sp500' as const,
  name: 'S&P 500',
  indexName: 'S&P 500',
  productType: 'Index' as const,
  inceptionDate: '1957-03-04',
  holdingsAsOfDate: '2026-07-31',
  expenseRatioPct: null,
  constituentCount: 500,
  securityLineCount: 503,
  top10WeightPct: 37.6,
  largestWeightPct: 7.6,
  technologyWeightPct: 36.8,
  sectorSystem: 'GICS',
  weighting: '自由流通市值加权',
  selection: '美国公司先满足规模、流动性、自由流通与盈利条件，再由委员会选择',
  review: '没有固定年度重构；委员会按需调整，股数按季度更新',
}

export const qqqTopHoldings: UsWeightedIndexHolding[] = [
  [1, 'NVDA', 'NVIDIA', '科技', 8.7],
  [2, 'AAPL', 'Apple', '科技', 7.6],
  [3, 'MSFT', 'Microsoft', '科技', 5.6],
  [4, 'AMZN', 'Amazon', '可选消费', 4.6],
  [5, 'TSLA', 'Tesla', '可选消费', 3.8],
  [6, 'META', 'Meta Platforms', '科技', 3.5],
  [7, 'WMT', 'Walmart', '必选消费', 3.4],
  [8, 'GOOGL', 'Alphabet A', '科技', 3.4],
  [9, 'GOOG', 'Alphabet C', '科技', 3.2],
  [10, 'AVGO', 'Broadcom', '科技', 3],
].map(([rank, ticker, name, sector, weightPct]) => ({
  rank: Number(rank),
  ticker: String(ticker),
  name: String(name),
  sector: String(sector),
  weightPct: Number(weightPct),
}))

export const sp500TopHoldings: UsIndexHolding[] = [
  [1, 'NVDA', 'NVIDIA', '信息技术'],
  [2, 'AAPL', 'Apple', '信息技术'],
  [3, 'MSFT', 'Microsoft', '信息技术'],
  [4, 'AMZN', 'Amazon', '可选消费'],
  [5, 'GOOGL', 'Alphabet A', '通信服务'],
  [6, 'AVGO', 'Broadcom', '信息技术'],
  [7, 'GOOG', 'Alphabet C', '通信服务'],
  [8, 'META', 'Meta Platforms A', '通信服务'],
  [9, 'JPM', 'JPMorgan Chase', '金融'],
  [10, 'BRK.B', 'Berkshire Hathaway B', '金融'],
].map(([rank, ticker, name, sector]) => ({
  rank: Number(rank),
  ticker: String(ticker),
  name: String(name),
  sector: String(sector),
  weightPct: null,
}))

export const qqqSectors = [
  ['科技', 59.8],
  ['可选消费', 21.2],
  ['医疗保健', 5.1],
  ['电信', 3.8],
  ['工业', 3.7],
  ['必选消费', 2.6],
  ['基础材料', 1.6],
  ['公用事业', 1.5],
  ['能源', 0.7],
  ['房地产', 0.1],
] as const

export const sp500Sectors = [
  ['信息技术', 36.8],
  ['金融', 12.5],
  ['通信服务', 9.7],
  ['可选消费', 9.4],
  ['医疗保健', 9.1],
  ['工业', 8.7],
  ['必选消费', 4.7],
  ['能源', 3.4],
  ['公用事业', 2.1],
  ['房地产', 1.9],
  ['材料', 1.8],
] as const

export const usIndexMilestones: UsIndexMilestone[] = [
  {
    year: '1923',
    indexId: 'sp500',
    title: 'S&P 指数前身出现',
    summary: 'Standard Statistics 推出覆盖 233 家公司的周度指数。',
    impact: '这是历史前身，不是今天 S&P 500 的实际运行起点。',
    kind: '发布',
    isTurningPoint: false,
    sourceUrl: usIndexSources.sp500,
  },
  {
    year: '1957',
    indexId: 'sp500',
    title: 'S&P 500 以当前基本形态发布',
    summary: '1957 年 3 月 4 日成为真实指数运行起点。',
    impact: '此前的指数序列应标作历史回测，不能与实际运行期混称。',
    kind: '发布',
    isTurningPoint: true,
    sourceUrl: usIndexSources.sp500,
  },
  {
    year: '1985',
    indexId: 'qqq',
    title: 'Nasdaq-100 正式发布',
    summary: '建立 Nasdaq 上市、非金融、大市值公司的独特样本框架。',
    impact: '它不是 Nasdaq 综合指数，也不是行业均衡的美国大盘指数。',
    kind: '发布',
    isTurningPoint: true,
    sourceUrl: usIndexSources.nasdaqOverview,
  },
  {
    year: '1993',
    indexId: 'sp500',
    title: '首只美国 ETF SPY 推出',
    summary: 'S&P 500 敞口进入可盘中交易的 ETF 时代。',
    impact: '指数与跟踪产品从此必须分开理解：费用与跟踪误差属于基金。',
    kind: '产品化',
    isTurningPoint: true,
    sourceUrl: usIndexSources.sp500,
  },
  {
    year: '1999',
    indexId: 'qqq',
    title: 'Invesco QQQ 成立',
    summary: '投资者开始通过交易所基金取得 Nasdaq-100 近似敞口。',
    impact: 'QQQ 是持有资产的 ETF，不是 Nasdaq-100 指数本身。',
    kind: '产品化',
    isTurningPoint: true,
    sourceUrl: usIndexSources.qqqHome,
  },
  {
    year: '2000—2002',
    indexId: 'qqq',
    title: '科技泡沫破裂',
    summary: 'Nasdaq-100 经历约 83% 的峰谷跌幅。',
    impact: '持有约百家公司并不意味着行业和因子风险已经均匀分散。',
    kind: '危机',
    isTurningPoint: true,
    sourceUrl: usIndexSources.nasdaqOverview,
  },
  {
    year: '2007—2009',
    indexId: 'both',
    title: '全球金融危机',
    summary: '大型股指数共同经历系统性下跌，但行业结构造成路径差异。',
    impact: '指数长期历史不能替代对当前集中度和估值风险的判断。',
    kind: '危机',
    isTurningPoint: true,
    sourceUrl: usIndexSources.sp500,
  },
  {
    year: '2011',
    indexId: 'qqq',
    title: 'Nasdaq-100 特别再平衡',
    summary: '常规重构之外开始使用特别再平衡处理过度集中。',
    impact: '“修正市值加权”的集中度约束成为理解 NDX 的关键。',
    kind: '方法调整',
    isTurningPoint: true,
    sourceUrl: usIndexSources.nasdaqMethodology,
  },
  {
    year: '2018',
    indexId: 'sp500',
    title: 'GICS 通信服务板块重构',
    summary: 'Alphabet、Meta 等公司的行业归属发生制度性变化。',
    impact: '跨期比较行业权重时必须处理分类体系变化。',
    kind: '方法调整',
    isTurningPoint: true,
    sourceUrl: usIndexSources.sp500Methodology,
  },
  {
    year: '2023',
    indexId: 'qqq',
    title: '大型科技权重触发特别再平衡',
    summary: '2023 年 7 月 24 日特别再平衡生效。',
    impact: '巨头集中度再次成为 Nasdaq-100 方法维护的核心议题。',
    kind: '方法调整',
    isTurningPoint: true,
    sourceUrl: usIndexSources.nasdaqMethodology,
  },
  {
    year: '2025',
    indexId: 'qqq',
    title: 'QQQ 转为开放式 ETF 架构',
    summary: '2025 年 12 月完成法律与运营结构现代化。',
    impact: '产品结构变化，但追踪目标仍是 Nasdaq-100。',
    kind: '产品化',
    isTurningPoint: true,
    sourceUrl: usIndexSources.qqqHome,
  },
  {
    year: '2026',
    indexId: 'qqq',
    title: 'Nasdaq-100 引入 Fast Entry',
    summary: '符合条件的极大型 IPO 或转板公司可加速纳入。',
    impact: '证券数量可短期超过 100，季度调整的响应能力增强。',
    kind: '方法调整',
    isTurningPoint: true,
    sourceUrl: usIndexSources.nasdaqMethodology,
  },
]
