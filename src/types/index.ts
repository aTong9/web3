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

export interface HotStock {
  rank: number
  code: string
  name: string
  price: number | null
  dayChangePct: number | null
  weekChangePct: number | null
  activityValue: number | null
  activityLabel: string
  turnoverRatePct: number | null
  sector?: string | null
  url: string
}

export interface HotStockMarket {
  status: 'ok' | 'stale' | 'failed'
  statusMessage?: string
  source: string
  sourceUrl: string
  dailyMethod: string
  weeklyMethod: string
  daily: HotStock[]
  weekly: HotStock[]
}

export interface HotStockDataset {
  updatedAt: string
  markets: {
    aShare: HotStockMarket
    us: HotStockMarket
  }
}

export interface UsMegaCapStock {
  marketCapRank: number
  symbol: string
  name: string
  marketCapUsd: number | null
  price: number | null
  trailingPe: number | null
  historicalPeMedian5y: number | null
  forwardPe: number | null
  historicalYears: Array<{ year: number; pe: number }>
  url: string
}

export interface UsMegaCapDataset {
  updatedAt: string
  status: 'ok' | 'stale'
  statusMessage?: string
  methodology: string
  sources: Array<{ name: string; url: string }>
  stocks: UsMegaCapStock[]
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

export type CrossAssetCategory = 'stocks' | 'bonds' | 'fx' | 'commodities' | 'crypto' | 'macro'

export interface CrossAssetItem {
  id: string
  name: string
  category: CrossAssetCategory
  series: string
  unit: string
  mode: 'return' | 'difference' | 'absolute'
  releaseLagDays?: number
  maxStaleDays?: number
  value: number | null
  date: string | null
  availableDate: string | null
  stale: boolean
  changes: Record<'day' | 'week' | 'month' | 'quarter' | 'yearToDate', number | null>
  flow: {
    status: 'proxy' | 'actual' | 'unavailable'
    label: string
    value: number | null
    note: string
  }
}

export interface CrossAssetDataset {
  updatedAt: string
  correlationWindow: string
  source: string
  sourceUrl: string
  limitations: string[]
  assets: CrossAssetItem[]
  matrix: { ids: string[]; correlations: Array<{ id: string; values: Array<number | null> }> }
  transmissionChains: Array<{
    group: string
    title: string
    left: string
    right: string
    expectedSign: 'positive' | 'negative' | 'context'
    steps: string[]
    signal: number | null
    windows: { short: number | null; medium: number | null; long: number | null }
    statistics: Record<
      'short' | 'medium' | 'long',
      {
        value: number | null
        samples: number
        ciLow: number | null
        ciHigh: number | null
        pValue: number | null
      }
    >
    stability: 'stable' | 'mixed' | 'insufficient'
    regimeShift: boolean
    evidence: 'strong' | 'supported' | 'uncertain'
    predictive: {
      horizon: number
      overlapping: boolean
      value: number | null
      samples: number
      ciLow: number | null
      ciHigh: number | null
      pValue: number | null
      qValue: number | null
      evidence: 'supported' | 'uncertain'
    }
    shock: {
      tail: 'upper10pct'
      horizon: number
      threshold: number | null
      currentMove: number | null
      triggered: boolean
      eventSamples: number
      controlSamples: number
      eventUpRatePct: number | null
      baselineUpRatePct: number | null
      liftPct: number | null
      medianOutcome: number | null
      pValue: number | null
      qValue: number | null
      evidence: 'supported' | 'uncertain'
    }
    lowerShock: {
      tail: 'lower10pct'
      horizon: number
      threshold: number | null
      currentMove: number | null
      triggered: boolean
      eventSamples: number
      controlSamples: number
      eventUpRatePct: number | null
      baselineUpRatePct: number | null
      liftPct: number | null
      medianOutcome: number | null
      pValue: number | null
      qValue: number | null
      evidence: 'supported' | 'uncertain'
    }
    strength: 'strong' | 'medium' | 'weak' | 'unavailable'
    status: 'confirming' | 'diverging' | 'dormant' | 'context' | 'unavailable'
    interpretation: string
    sourceTitle: string
    sourceUrl: string
  }>
  marketBrief: {
    asOfDate: string | null
    methodology: string
    disclaimer: string
    regime: { title: string; summary: string }
    rateRegime: {
      title: string
      dominant: 'term-premium' | 'expected-rate' | 'unknown'
      yieldMoveBp: number | null
      termPremiumMoveBp: number | null
      expectedRateMoveBp: number | null
      summary: string
    }
    cryptoRegime: { title: string; summary: string }
    breadth: { title: string; summary: string }
    leaders: Array<{ id: string; name: string; move: number | null }>
    laggards: Array<{ id: string; name: string; move: number | null }>
    markets: Array<{
      id: string
      name: string
      date: string | null
      dailyMove: number | null
      dailySummary: string
      dailyAttribution: {
        alignment: 'confirming' | 'diverging' | 'insufficient'
        netContribution: number
        alignedDrivers: number
        totalDrivers: number
      }
      drivers: Array<{
        chain: string
        driver: string
        driverMove: number | null
        driverZ: number | null
        correlation: number
        contribution: number
        effect: 'tailwind' | 'headwind' | 'neutral'
        text: string
      }>
      horizonOutlooks: Array<{
        id: 'day' | 'week' | 'month' | 'quarter'
        label: string
        observations: number
        direction: 'bullish' | 'bearish'
        score: number
        validated: boolean
        confidence: 'validated' | 'watch'
        upProbabilityPct: number
        ruleName: string
        threshold: number
        training: {
          samples: number
          accuracyPct: number | null
          accuracyIntervalPct: { low: number | null; high: number | null }
          bestBaselinePct: number | null
          liftPct: number | null
        }
        validation: {
          samples: number
          accuracyPct: number | null
          accuracyIntervalPct: { low: number | null; high: number | null }
          bestBaselinePct: number | null
          liftPct: number | null
        }
        factors: Array<{ name: string; value: number; text: string }>
      }>
      outlook: {
        horizon: string
        bias: 'bullish' | 'bearish' | 'neutral'
        confidence: 'low' | 'medium'
        score: number
        momentumSignals: { week: number; month: number }
        probability: {
          upProbabilityPct: number
          downProbabilityPct: number
          intervalPct: { low: number | null; high: number | null }
          trainingSamples: number
          signalDirection: 'bullish' | 'bearish'
          source: 'macro-regime' | 'all-regimes'
          macroRegime: string
          validationBrierScore: number | null
          validationClimatologyBrierScore: number | null
          validationBrierSkillPct: number | null
          validationBrierAdvantagePValue: number | null
          validated: boolean
        }
        liveEvaluation: {
          modelVersion: string
          totalSnapshots: number
          allVersionSnapshots: number
          resolvedSamples: number
          directionalSamples: number
          directionalAccuracyPct: number | null
          brierScore: number | null
          latestOutcomeDate: string | null
        }
        directionGate: { eligible: boolean; reasons: string[] }
        consensus: { aligned: number; total: number; pct: number | null }
        predictiveDrivers: Array<{
          chain: string
          driver: string
          driverMove: number | null
          driverZ: number | null
          correlation: number
          contribution: number
          effect: 'tailwind' | 'headwind' | 'neutral'
          text: string
        }>
        reasons: string[]
        risks: string[]
        backtest: {
          horizon: string
          samples: number
          directionalAccuracyPct: number | null
          accuracyIntervalPct: { low: number | null; high: number | null }
          baselineAccuracyPct: number | null
          majorityBaselineAccuracyPct: number | null
          bestBaselineAccuracyPct: number
          liftPct: number | null
          liftVsBestBaselinePct: number | null
          regime: string
          regimeSamples: number
          regimeAccuracyPct: number | null
          regimeBaselineAccuracyPct: number | null
          regimeLiftPct: number | null
          directionalBuckets: Record<
            'bullish' | 'bearish',
            {
              direction: 'bullish' | 'bearish'
              samples: number
              directionalAccuracyPct: number | null
              accuracyIntervalPct: { low: number | null; high: number | null }
              medianReturnPct: number | null
              q25ReturnPct: number | null
              q75ReturnPct: number | null
            }
          >
          validation: {
            split: string
            startDate: string | null
            endDate: string | null
            samples: number
            directionalAccuracyPct: number | null
            accuracyIntervalPct: { low: number | null; high: number | null }
            baselineAccuracyPct: number | null
            majorityBaselineAccuracyPct: number | null
            bestBaselineAccuracyPct: number
            liftPct: number | null
            liftVsBestBaselinePct: number | null
            directionalBuckets: Record<
              'bullish' | 'bearish',
              {
                direction: 'bullish' | 'bearish'
                samples: number
                directionalAccuracyPct: number | null
                accuracyIntervalPct: { low: number | null; high: number | null }
                medianReturnPct: number | null
                q25ReturnPct: number | null
                q75ReturnPct: number | null
              }
            >
          }
          selectivity: {
            candidateCount: number
            selectedThreshold: number
            selectedConservativeEdgePct: number | null
            selectedRule: {
              id: string
              name: string
              featureMode: 'normalized' | 'direction'
              weekWeight: number
              monthWeight: number
              driverWeight: number
            }
            driverAblation: {
              selectedUsesCrossAsset: boolean
              samples: number
              fullAccuracyPct: number | null
              momentumOnlyAccuracyPct: number | null
              liftPct: number | null
              fullWins: number
              momentumWins: number
              pairedAdvantagePValue: number | null
              allowed: boolean
            }
            probabilityValidation: {
              trainingProbabilities: Record<
                'bullish' | 'bearish',
                {
                  direction: 'bullish' | 'bearish'
                  samples: number
                  upProbabilityPct: number
                  intervalPct: { low: number | null; high: number | null }
                }
              >
              trainingClimatologyUpPct: number
              samples: number
              meanForecastUpPct: number | null
              observedUpPct: number | null
              brierScore: number | null
              climatologyBrierScore: number | null
              brierSkillPct: number | null
              brierAdvantagePValue: number | null
            }
            macroRegime: {
              id: string
              name: string
              training: {
                samples: number
                directionalAccuracyPct: number | null
                accuracyIntervalPct: { low: number | null; high: number | null }
                momentumBaselineAccuracyPct: number | null
                majorityBaselineAccuracyPct: number | null
                bestBaselineAccuracyPct: number
                liftVsBestBaselinePct: number | null
                directionalBuckets: Record<
                  'bullish' | 'bearish',
                  {
                    direction: 'bullish' | 'bearish'
                    samples: number
                    directionalAccuracyPct: number | null
                    accuracyIntervalPct: { low: number | null; high: number | null }
                    medianReturnPct: number | null
                    q25ReturnPct: number | null
                    q75ReturnPct: number | null
                  }
                >
              }
              validation: {
                samples: number
                directionalAccuracyPct: number | null
                accuracyIntervalPct: { low: number | null; high: number | null }
                momentumBaselineAccuracyPct: number | null
                majorityBaselineAccuracyPct: number | null
                bestBaselineAccuracyPct: number
                liftVsBestBaselinePct: number | null
                directionalBuckets: Record<
                  'bullish' | 'bearish',
                  {
                    direction: 'bullish' | 'bearish'
                    samples: number
                    directionalAccuracyPct: number | null
                    accuracyIntervalPct: { low: number | null; high: number | null }
                    medianReturnPct: number | null
                    q25ReturnPct: number | null
                    q75ReturnPct: number | null
                  }
                >
              }
              trainingProbabilities: Record<
                'bullish' | 'bearish',
                {
                  direction: 'bullish' | 'bearish'
                  samples: number
                  upProbabilityPct: number
                  intervalPct: { low: number | null; high: number | null }
                }
              >
              probabilityValidation: {
                samples: number
                brierScore: number | null
                climatologyBrierScore: number | null
                brierSkillPct: number | null
                brierAdvantagePValue: number | null
              }
            }
            overall: {
              samples: number
              directionalAccuracyPct: number | null
              accuracyIntervalPct: { low: number | null; high: number | null }
              momentumBaselineAccuracyPct: number | null
              majorityBaselineAccuracyPct: number | null
              bestBaselineAccuracyPct: number
              liftVsBestBaselinePct: number | null
              directionalBuckets: Record<
                'bullish' | 'bearish',
                {
                  direction: 'bullish' | 'bearish'
                  samples: number
                  directionalAccuracyPct: number | null
                  accuracyIntervalPct: { low: number | null; high: number | null }
                  medianReturnPct: number | null
                  q25ReturnPct: number | null
                  q75ReturnPct: number | null
                }
              >
            }
            training: {
              samples: number
              directionalAccuracyPct: number | null
              accuracyIntervalPct: { low: number | null; high: number | null }
              momentumBaselineAccuracyPct: number | null
              majorityBaselineAccuracyPct: number | null
              bestBaselineAccuracyPct: number
              liftVsBestBaselinePct: number | null
              directionalBuckets: Record<
                'bullish' | 'bearish',
                {
                  direction: 'bullish' | 'bearish'
                  samples: number
                  directionalAccuracyPct: number | null
                  accuracyIntervalPct: { low: number | null; high: number | null }
                  medianReturnPct: number | null
                  q25ReturnPct: number | null
                  q75ReturnPct: number | null
                }
              >
            }
            validation: {
              samples: number
              directionalAccuracyPct: number | null
              accuracyIntervalPct: { low: number | null; high: number | null }
              momentumBaselineAccuracyPct: number | null
              majorityBaselineAccuracyPct: number | null
              bestBaselineAccuracyPct: number
              liftVsBestBaselinePct: number | null
              directionalBuckets: Record<
                'bullish' | 'bearish',
                {
                  direction: 'bullish' | 'bearish'
                  samples: number
                  directionalAccuracyPct: number | null
                  accuracyIntervalPct: { low: number | null; high: number | null }
                  medianReturnPct: number | null
                  q25ReturnPct: number | null
                  q75ReturnPct: number | null
                }
              >
            }
            validationCoveragePct: number | null
          }
          note: string
        }
        scenario: {
          direction: 'bullish' | 'bearish'
          samples: number
          directionalAccuracyPct: number | null
          accuracyIntervalPct: { low: number | null; high: number | null }
          medianReturnPct: number | null
          q25ReturnPct: number | null
          q75ReturnPct: number | null
        } | null
      }
    }>
  }
}

export interface MarketHomeDataset {
  updatedAt: string
  transmissionChains: CrossAssetDataset['transmissionChains']
  marketBrief: {
    asOfDate: string | null
    disclaimer: string
    regime: CrossAssetDataset['marketBrief']['regime']
    rateRegime: CrossAssetDataset['marketBrief']['rateRegime']
    breadth: CrossAssetDataset['marketBrief']['breadth']
    markets: Array<
      Pick<
        CrossAssetDataset['marketBrief']['markets'][number],
        'id' | 'name' | 'date' | 'dailyMove' | 'drivers' | 'horizonOutlooks'
      >
    >
  }
}

export interface DailyReportConfig {
  authorName: string
  email: string
  xHandle: string
  titlePrefix: string
  selectedMarketIds: string[]
  chainCount: number
  includeDisclaimer: boolean
}

export interface DailyMarketReport {
  title: string
  asOfDate: string
  markdown: string
  socialText: string
  emailSubject: string
}
