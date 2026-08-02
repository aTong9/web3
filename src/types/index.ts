export interface NavLink {
  title: string
  logo: string
  url: string
  description?: string
}

export interface NavTerm {
  term: string
  links: NavLink[]
}

export interface NavTaxonomy {
  taxonomy: string
  icon: string
  list: NavTerm[]
}

export interface SiteConfig {
  title: string
  description: string
  author: string
  siteurl: string
  upload?: string
  about?: string
  repository?: string
  enablePreLoad?: boolean
  textPreLoad?: string
  expandSidebar?: boolean
  logosPath?: string
  defaultLogo?: string
}

// 博主监控相关类型定义
export interface BloggerInfo {
  id: string
  name: string
  platform: 'youtube' | 'xiaohongshu' | 'wechat'
  url: string
  userId?: string
  accountName?: string
}

export interface StockMention {
  stockCode: string
  stockName: string
  market: 'A 股' | '港股' | '美股'
  confidence: number // 提及的可信度 0-1
}

export interface ContentItem {
  id: string
  bloggerId: string
  title: string
  content: string
  publishDate: string
  url: string
  type: 'article' | 'video'
  platform: 'youtube' | 'xiaohongshu' | 'wechat'
  stocks: StockMention[]
}

export interface BloggerData {
  blogger: BloggerInfo
  contents: ContentItem[]
}

export type FundVenue = 'exchange' | 'offExchange'
export type FundPurchaseStatus = 'open' | 'limited' | 'suspended'

export interface UsFund {
  code: string
  venue: FundVenue
  index: string
  name: string
  scaleBillionCny: number | null
  scaleDate: string | null
  managementFeePct: number | null
  custodianFeePct: number | null
  serviceFeePct: number | null
  purchaseFeePct: number | null
  latestClose: number | null
  latestCloseDate: string | null
  latestNav: number | null
  navDate: string | null
  premiumRatePct: number | null
  dailyInvestmentLimitCny: number | null
  purchaseStatus: FundPurchaseStatus | null
  recurringInvestmentOpen: boolean | null
  sourceUrl: string
}

export interface UsFundDataset {
  updatedAt: string
  source: string
  funds: UsFund[]
}

export type SectorKind = 'industry' | 'theme'
export type SectorPeriod = 'day' | 'week' | 'month' | 'quarter' | 'yearToDate' | 'year'

export interface SectorReturns {
  day: number | null
  week: number | null
  month: number | null
  quarter: number | null
  yearToDate: number | null
  year: number | null
}

export interface AShareFund {
  code: string
  name: string
  sector: string
  kind: SectorKind
  latestDate: string
  latestClose: number
  volumeMillion: number
  scaleBillionCny: number | null
  scaleDate: string | null
  managementFeePct: number | null
  custodianFeePct: number | null
  latestNav: number | null
  navDate: string | null
  premiumRatePct: number | null
  returns: SectorReturns
  sourceUrl: string
}

export interface AShareSector {
  name: string
  kind: SectorKind
  representativeFundCode: string
  fundCount: number
  returns: SectorReturns
}

export interface AShareSectorDataset {
  updatedAt: string
  tradingDate: string
  marketStatus: 'closed' | 'holiday'
  source: string
  periods: Record<SectorPeriod, string>
  sectors: AShareSector[]
  funds: AShareFund[]
}

export type KolPlatform =
  | 'youtube'
  | 'xiaohongshu'
  | 'wechat'
  | 'bilibili'
  | 'x'
  | 'instagram'
  | 'tiktok'
  | 'douyin'
  | 'weibo'
  | 'zhihu'
  | 'rss'
  | 'web'
export type KolSyncStatus = 'ok' | 'partial' | 'stale' | 'failed'

export interface KolStockMention {
  code: string
  name: string
  market: 'A股' | '港股' | '美股'
}

export interface KolContentItem {
  id: string
  title: string
  description: string
  url: string
  publishedAt: string | null
  stocks: KolStockMention[]
}

export interface MonitoredKol {
  id: string
  name: string
  url: string
  tags: string[]
  platform: KolPlatform
  status: KolSyncStatus
  statusMessage: string
  items: KolContentItem[]
}

export interface KolMonitorDataset {
  updatedAt: string
  source: string
  kols: MonitoredKol[]
}

export type MarketNewsCategory = 'macro' | 'geopolitics' | 'equities' | 'commodities' | 'technology'
export type MarketNewsImpact = 'critical' | 'high' | 'medium' | 'low'

export interface MarketNewsArticle {
  id: string
  title: string
  url: string
  publishedAt: string
  source: string
  sourceType: 'official' | 'media'
  category: MarketNewsCategory
  language: string | null
  translatedTitle: string | null
  translationStatus: 'translated' | 'original' | 'failed'
  translationProvider: string
  impact: MarketNewsImpact
  impactScore: number
  affectedAssets: string[]
}

export interface MarketNewsDataset {
  updatedAt: string
  source: string
  refreshMinutes: number
  translationProvider: string
  sourceStatus: Array<{ source: string; status: 'ok' | 'failed'; message: string }>
  articles: MarketNewsArticle[]
}
