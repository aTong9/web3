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

export interface LifelongBook {
  title: string
  authors: string[]
  firstPublishYear: number | null
  editionCount: number
  rating: number | null
  source: string
  url: string
}

export interface LifelongBookCategory {
  category: string
  books: LifelongBook[]
}

export interface LifelongBookCatalog {
  generatedAt: string
  source: {
    name: string
    url: string
    methodology: string
  }
  categories: LifelongBookCategory[]
}

export type GameIncomePayout = 'fiat' | 'crypto' | 'mixed'
export type GameIncomeStartCost = 'free' | 'low' | 'capital'
export type IncomeOpportunityCategory =
  | 'freelance'
  | 'creator'
  | 'digital-product'
  | 'teaching'
  | 'research'
  | 'local-service'
  | 'game'
export type IncomeOpportunityMethod =
  | 'client-work'
  | 'audience'
  | 'product'
  | 'teaching'
  | 'tasks'
  | 'digital-economy'
export type IncomeOpportunityCoverage = 'broad' | 'multi-country' | 'limited'

export interface GameIncomeSource {
  label: string
  url: string
}

export interface GameIncomeGame {
  id: string
  name: string
  model: string
  payout: GameIncomePayout
  startCost: GameIncomeStartCost
  platforms: string
  availability: string
  summary: string
  earningRoutes: string[]
  steps: string[]
  requirements: string[]
  risks: string[]
  sources: GameIncomeSource[]
}

export interface IncomeOpportunity extends GameIncomeGame {
  category: IncomeOpportunityCategory
  method: IncomeOpportunityMethod
  coverage: IncomeOpportunityCoverage
  workMode: string
  skills: string[]
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

export type UserRole = 'admin' | 'editor' | 'viewer'
export type AppPermission =
  | 'admin.view'
  | 'users.manage'
  | 'analytics.view'
  | 'analytics.manage'
  | 'paper.manage'
  | 'autoTrade.manage'
  | 'technicalAlerts.manage'
  | 'technicalConfig.manage'

export interface AppUser {
  id: string
  name: string
  email: string
  role: UserRole
  status: 'active' | 'disabled'
  createdAt: string
  lastLoginAt: string | null
  permissions: AppPermission[]
}

export interface AnalyticsConfig {
  provider: 'posthog'
  enabled: boolean
  host: string
  projectKey: string
  autocapture: boolean
  sessionReplay: boolean
  consentRequired: boolean
  updatedAt: string | null
}

export type FundVenue = 'exchange' | 'offExchange'
export type FundPurchaseStatus = 'open' | 'limited' | 'suspended'

export interface FundHistoryPoint {
  date: string
  value: number
}

export interface FundTransmissionDataset {
  updatedAt: string
  asOfDate: string | null
  markets: Array<{
    id: string
    name: string
    date: string | null
    dailyMove: number | null
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
  }>
  chains: Array<{
    title: string
    left: string
    right: string
    status: 'confirming' | 'diverging' | 'dormant' | 'context' | 'unavailable'
    strength: 'strong' | 'medium' | 'weak' | 'unavailable'
    signal: number | null
    interpretation: string
  }>
}

export interface FundInvestmentLimitPoint {
  date: string
  limitCny: number | null
  purchaseStatus: FundPurchaseStatus | null
  recurringInvestmentOpen: boolean | null
}

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
  investmentLimitHistory: FundInvestmentLimitPoint[]
  priceHistory: FundHistoryPoint[]
  navHistory: FundHistoryPoint[]
  trackingErrorPct: number | null
  trackingBenchmark: string | null
  sourceUrl: string
}

export interface UsFundDataset {
  updatedAt: string
  source: string
  funds: UsFund[]
}

export type SectorKind = 'industry' | 'theme'
export type SectorPeriod = 'day' | 'week' | 'month' | 'quarter' | 'halfYear' | 'yearToDate' | 'year'

export interface SectorReturns {
  day: number | null
  week: number | null
  month: number | null
  quarter: number | null
  halfYear: number | null
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
  priceHistory: FundHistoryPoint[]
  navHistory: FundHistoryPoint[]
  trackingErrorPct: number | null
  trackingBenchmark: string | null
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

export type MarketQuoteStatus = 'nearRealTime' | 'delayed' | 'closed' | 'stale' | 'unavailable'

export interface MarketQuote {
  symbol: string
  name: string
  price: number | null
  previousClose: number | null
  changePct: number | null
  currency: string | null
  marketTime: string | null
  fetchedAt: string
  session: 'pre' | 'regular' | 'post' | 'closed' | 'continuous'
  status: MarketQuoteStatus
  source: 'Yahoo Finance chart'
  sourceUrl: string
}

export interface MarketQuoteResponse {
  fetchedAt: string
  refreshAfterSeconds: number
  quotes: MarketQuote[]
  unavailableSymbols: string[]
  disclaimer: string
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
  earnings: {
    nextEarningsDate: string | null
    lastReportedDate: string | null
    lastFiscalQuarter: string | null
    lastActualEps: number | null
    lastConsensusEps: number | null
    lastSurprisePct: number | null
    lastResultReliable: boolean
    positiveSurpriseStreak: number
    nextFiscalQuarter: string | null
    nextConsensusEps: number | null
    nextHighEps: number | null
    nextLowEps: number | null
    estimateCount: number | null
    revisionsUp: number | null
    revisionsDown: number | null
    annualFiscalEnd: string | null
    annualConsensusEps: number | null
  }
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

export interface OptionTermPoint {
  expirationDate: string
  dte: number
  atmIvPct: number | null
  expectedMovePct: number | null
  putCallVolumeRatio: number | null
  putCallOpenInterestRatio: number | null
  contracts: number
}

export interface OptionMarketSymbol {
  symbol: string
  status: 'ok' | 'partial' | 'unavailable'
  message: string | null
  underlyingPrice: number | null
  leapsIvPct: number | null
  leapsIvRank52w: number | null
  ivRankObservations: number
  putCallVolumeRatio: number | null
  putCallOpenInterestRatio: number | null
  earningsExpectedMovePct: number | null
  earningsExpirationDate: string | null
  earningsDte: number | null
  termStructure: OptionTermPoint[]
  ivHistory: Array<{ date: string; value: number }>
}

export interface OptionMarketDataset {
  updatedAt: string
  attemptedAt: string
  dataUpdatedAt: string | null
  configurationStatus: 'configured' | 'missing'
  status: 'ok' | 'partial' | 'unavailable'
  source: string
  sourceUrl: string
  methodology: string
  symbols: OptionMarketSymbol[]
}

export type QuantSignalLevel = 'buy' | 'accumulate' | 'hold' | 'reduce' | 'sell' | 'unavailable'

export interface QuantStrategyConfig {
  forwardPeThreshold: number
  valuationBufferPct: number
  minimumEvidenceScore: number
  maximumPositionRiskPct: number
  optionDteRange: { min: number; max: number }
  optionDeltaRange: { min: number; max: number }
}

export interface QuantAssetSignal {
  id: string
  name: string
  category: CrossAssetCategory
  mode: CrossAssetItem['mode']
  value: number
  unit: string
  date: string
  score: number
  evidenceScore: number
  signal: QuantSignalLevel
  stale: boolean
  changes: Pick<SectorReturns, 'day' | 'week' | 'month' | 'quarter' | 'halfYear' | 'year'>
  reasons: string[]
  risks: string[]
  modelSource: 'validated-horizon' | 'horizon-watch' | 'momentum-proxy'
  validation: {
    status: 'validated' | 'watch' | 'unavailable'
    samples: number
    directionalAccuracyPct: number | null
    accuracyIntervalPct: { low: number | null; high: number | null }
    bestBaselineAccuracyPct: number | null
    liftVsBestBaselinePct: number | null
    crossAssetDriverAccepted: boolean
  }
}

export type OptionCandidateAction =
  | 'long-call-candidate'
  | 'long-call-watch'
  | 'hold'
  | 'exit-long-call'
  | 'avoid'
  | 'unavailable'

export type OptionDirection = 'bullish' | 'bearish' | 'neutral' | 'event-risk'

export type OptionStrategy =
  | 'long-call'
  | 'call-debit-spread'
  | 'put-debit-spread'
  | 'protective-put'
  | 'wait'
  | 'exit-or-avoid'

export interface QuantOptionCandidate {
  symbol: string
  name: string
  marketCapRank: number
  price: number | null
  forwardPe: number | null
  historicalPeMedian5y: number | null
  discountToThresholdPct: number | null
  gapToHistoricalAnchorPct: number | null
  score: number
  evidenceScore: number
  action: OptionCandidateAction
  direction: OptionDirection
  earningsWindow: 'pre-earnings' | 'post-earnings' | 'clear' | 'unknown'
  earnings: UsMegaCapStock['earnings']
  optionMarket: OptionMarketSymbol | null
  earningsEvent: {
    status: 'available' | 'insufficient'
    reportDate: string | null
    baselineDate: string | null
    eventSessionDate: string | null
    pre5dReturnPct: number | null
    reaction1dPct: number | null
    post5dReturnPct: number | null
    post20dReturnPct: number | null
  }
  technical: {
    date: string | null
    score: number | null
    monthReturnPct: number | null
    quarterReturnPct: number | null
    stale: boolean
  }
  executable: boolean
  reasons: string[]
  blockers: string[]
  template: {
    strategy: OptionStrategy
    dteRange: { min: number; max: number }
    deltaRange: { min: number; max: number }
    maximumPositionRiskPct: number
  }
  sourceUrl: string
}

export interface QuantDashboard {
  generatedAt: string
  asOfDate: string | null
  config: QuantStrategyConfig
  summary: {
    buyCandidates: number
    sellCandidates: number
    optionLongCallCandidates: number
    optionExitCandidates: number
    unavailable: number
  }
  assets: QuantAssetSignal[]
  options: QuantOptionCandidate[]
  limitations: string[]
}

export interface PaperSignalPosition {
  id: string
  symbol: string
  name: string
  action: OptionCandidateAction
  openedAt: string
  closedAt: string | null
  entryUnderlyingPrice: number
  exitUnderlyingPrice: number | null
  forwardPe: number | null
  signalScore: number
  status: 'open' | 'closed'
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
  source: string
  sourceUrl: string
  calendar: MarketCalendarId
  unit: string
  mode: 'return' | 'difference' | 'absolute'
  releaseLagDays?: number
  maxStaleDays?: number
  value: number | null
  date: string | null
  availableDate: string | null
  stale: boolean
  changes: Record<
    'day' | 'week' | 'month' | 'quarter' | 'halfYear' | 'yearToDate' | 'year',
    number | null
  >
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
        id: 'day' | 'week' | 'month' | 'quarter' | 'halfYear' | 'year'
        label: string
        observations: number
        direction: 'bullish' | 'bearish'
        score: number
        validated: boolean
        confidence: 'validated' | 'watch'
        upProbabilityPct: number
        historicalReturnRangePct: {
          low: number | null
          high: number | null
          samples: number
        }
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

export type TechnicalSignalStatus =
  | 'strongBullish'
  | 'weakBullish'
  | 'rangeBullish'
  | 'neutral'
  | 'rangeBearish'
  | 'weakBearish'
  | 'strongBearish'
  | 'conflicting'
  | 'insufficient'

export interface AssetPricePoint {
  date: string
  close: number
  open?: number
  high?: number
  low?: number
  volume?: number
}

export type ContractTradePathExitReason = 'stopLoss' | 'takeProfit' | 'timeStop'

export interface ContractTradePathInput {
  direction: ContractPositionDirection
  entryPrice: number
  stopLoss: number
  takeProfit: number
  notional: number
  bars: AssetPricePoint[]
  maximumHoldingMinutes: number
  feeRatePct: number
  slippageRatePct: number
  fundingRatePct: number
  fundingSettlements: number
}

export interface ContractTradePathResult {
  status: 'open' | 'closed'
  exitReason: ContractTradePathExitReason | null
  exitPrice: number | null
  exitedAt: string | null
  holdingMinutes: number
  grossPnl: number | null
  fees: number
  slippage: number
  funding: number
  netPnl: number | null
  returnPct: number | null
  maximumAdverseExcursionPct: number | null
}

export type ContractBacktestRegime = 'trending' | 'ranging' | 'volatile'
export type ContractBacktestSegment = 'training' | 'validation' | 'holdout'
export type ContractBacktestBaseline = 'strategy' | 'hold' | 'simpleTrend' | 'random'

export interface ContractBacktestCostModel {
  version: string
  feeRatePct: number
  slippageRatePct: number
  fundingRatePct: number
  fundingSettlements: number
}

export interface ContractBacktestOpportunity {
  id: string
  symbol: string
  decisionAt: string
  evidenceEndAt: string
  regime: ContractBacktestRegime
  action: 'long' | 'short' | 'wait' | 'noTrade' | 'insufficient'
  entryPrice: number
  stopLoss: number | null
  takeProfit: number | null
  notional: number
  maximumHoldingMinutes: number
  bars: AssetPricePoint[]
  baselineDirections: {
    hold: ContractPositionDirection
    simpleTrend: ContractPositionDirection
    random: ContractPositionDirection
  }
}

export interface ContractBacktestMetrics {
  opportunities: number
  trades: number
  wins: number
  losses: number
  coveragePct: number
  winRatePct: number | null
  averageNetReturnPct: number | null
  profitFactor: number | null
  maximumDrawdownPct: number
  maximumConsecutiveLosses: number
  status: 'insufficient' | 'negative' | 'watch' | 'supported'
}

export interface ContractBacktestSegmentResult {
  segment: ContractBacktestSegment
  startAt: string | null
  endAt: string | null
  metrics: ContractBacktestMetrics
  byRegime: Record<ContractBacktestRegime, ContractBacktestMetrics>
  baselines: Record<Exclude<ContractBacktestBaseline, 'strategy'>, ContractBacktestMetrics>
}

export interface ContractStrategyBacktestInput {
  strategyVersion: string
  signalModelVersion: string
  generatedAt: string
  minimumSamples: number
  trainingPct: number
  validationPct: number
  costModel: ContractBacktestCostModel
  opportunities: ContractBacktestOpportunity[]
}

export interface ContractHistoricalDecisionFrame {
  id: string
  decisionAt: string
  evidenceEndAt: string
  market: ContractMarketSnapshot
  futureBars: AssetPricePoint[]
}

export interface ContractBacktestOpportunityBuildInput {
  frames: ContractHistoricalDecisionFrame[]
  notional: number
  maximumHoldingMinutes: number
  ensembleWeight: number
}

export interface ContractStrategyBacktestReport {
  strategyVersion: string
  signalModelVersion: string
  generatedAt: string
  costModel: ContractBacktestCostModel
  minimumSamples: number
  split: {
    trainingPct: number
    validationPct: number
    holdoutPct: number
  }
  segments: Record<ContractBacktestSegment, ContractBacktestSegmentResult>
  inputDigest: string
}

export interface ContractBacktestEvidenceEnvelope {
  schemaVersion: 1
  input: ContractStrategyBacktestInput
  report: ContractStrategyBacktestReport
}

export type TradingEvaluationPeriod = 'week' | 'month'

export interface ContractPaperBacktestReference {
  strategyVersion: string
  period: TradingEvaluationPeriod
  startAt: string
  endAt: string
  averageNetReturnPct: number
  winRatePct: number
  maximumDrawdownPct: number
}

export interface ContractPaperObservation {
  id: string
  strategyVersion: string
  signalVersion: string | null
  pathId: string | null
  marketSource: string | null
  costModelVersion: string | null
  feeRatePct?: number
  slippageRatePct?: number
  plannedAt: string
  closedAt: string
  plannedEntryPrice: number
  paperEntryPrice: number
  netReturnPct: number
}

export interface ContractPaperDataGap {
  startAt: string
  endAt: string
  reason: string
}

export interface ContractPaperDriftInput {
  minimumSamples: number
  maximumExpectedReturnDegradationPct: number
  maximumWinRateDegradationPct: number
  maximumDrawdownIncreasePct: number
  cycleToleranceMinutes: number
  references: ContractPaperBacktestReference[]
  paperTrades: ContractPaperObservation[]
  expectedCycleAts: string[]
  observedCycleAts: string[]
  dataGaps: ContractPaperDataGap[]
}

export interface ContractPaperDriftCohort {
  strategyVersion: string
  period: TradingEvaluationPeriod
  startAt: string
  endAt: string
  samples: number
  explainableSamples: number
  paperAverageNetReturnPct: number | null
  paperWinRatePct: number | null
  paperMaximumDrawdownPct: number
  returnDeltaPct: number | null
  winRateDeltaPct: number | null
  drawdownDeltaPct: number
  status: 'insufficient' | 'stable' | 'watch' | 'degraded'
}

export interface ContractPaperAuditEvent {
  type: 'missingTrace' | 'missedCycle' | 'dataGap' | 'strategySwitch'
  at: string
  detail: string
  tradeId: string | null
}

export interface ContractPaperDriftReport {
  cohorts: ContractPaperDriftCohort[]
  auditEvents: ContractPaperAuditEvent[]
  strategyVersions: string[]
}

export interface ContractPaperDriftEvidenceEnvelope {
  input: ContractPaperDriftInput
  report: ContractPaperDriftReport
}

export interface ContractPaperMonitoringSession {
  id: string
  symbol: string
  interval: ContractChartInterval
  intervalMinutes: number
  startedAt: string
  lastSeenAt: string
  endedAt: string | null
}

export interface ContractPaperCycleObservation {
  id: string
  sessionId: string
  observedAt: string
  cycleAt: string
  evidenceEndAt: string
  strategyVersion: string
  signalVersion: string
  marketSource: string
}

export interface ContractPaperFeedGap {
  id: string
  sessionId: string
  startAt: string
  endAt: string | null
  reason: string
}

export interface ContractPaperTelemetry {
  schemaVersion: 1
  sessions: ContractPaperMonitoringSession[]
  cycles: ContractPaperCycleObservation[]
  gaps: ContractPaperFeedGap[]
}

export interface ContractPaperTelemetryEvidence {
  expectedCycleAts: string[]
  observedCycleAts: string[]
  dataGaps: ContractPaperDataGap[]
}

export type TestnetExecutionStatus =
  | 'filled'
  | 'partial'
  | 'rejected'
  | 'timeout'
  | 'unknown'
  | 'reconciled'
export type TestnetDrillType =
  | 'emergencyClose'
  | 'disableEntries'
  | 'staleMarketCircuitBreaker'
  | 'continuousReconciliation'

export interface TestnetExecutionObservation {
  id: string
  tradeId: string
  idempotencyKey: string
  costModelVersion: string
  command: 'open' | 'close'
  plannedAt: string
  submittedAt: string
  acknowledgedAt: string | null
  plannedPrice: number
  averageFillPrice: number | null
  plannedQuantity: number
  filledQuantity: number
  commission: number
  status: TestnetExecutionStatus
  reconciledAt: string | null
}

export interface TestnetSafetyDrill {
  type: TestnetDrillType
  costModelVersion: string
  performedAt: string
  passed: boolean
  evidence: string
}

export interface TestnetExecutionCalibrationInput {
  currentCostModelVersion: string
  observations: TestnetExecutionObservation[]
  drills: TestnetSafetyDrill[]
}

export interface TestnetExecutionCalibrationReport {
  observations: number
  filledObservations: number
  filledOpenObservations: number
  filledCloseObservations: number
  commissionObservedFillRatePct: number | null
  completedRoundTrips: number
  invalidRoundTripTradeIds: string[]
  invalidRoundTripQuantityTradeIds: string[]
  uniqueCommands: number
  duplicateIdempotencyKeys: string[]
  idempotencyConflicts: string[]
  averageSignedSlippageBps: number | null
  p95AbsoluteSlippageBps: number | null
  p95SubmissionLatencyMs: number | null
  averageAcknowledgementLatencyMs: number | null
  p95AcknowledgementLatencyMs: number | null
  aggregateFillRatePct: number | null
  rejected: number
  rejectionRatePct: number | null
  timedOut: number
  unknown: number
  recoveredUnknown: number
  recoveryDependencyRatePct: number | null
  reconciliationRecoveryPct: number | null
  recommendedCostModel: {
    version: string
    feeRatePct: number | null
    slippageRatePct: number | null
    sourceObservations: number
    feeSourceObservations: number
  }
  drills: Record<TestnetDrillType, TestnetSafetyDrill | null>
  readyForPaperComparison: boolean
  blockers: string[]
}

export interface TestnetExecutionCalibrationEvidenceEnvelope {
  schemaVersion: 1
  input: TestnetExecutionCalibrationInput
  report: TestnetExecutionCalibrationReport
}

export interface LiveTradingReadinessInput {
  thresholds: {
    minimumHoldoutSamples: number
    minimumHoldoutDays: number
    maximumHoldoutDrawdownPct: number
    minimumPaperSamples: number
    maximumPaperReturnDegradationPct: number
    minimumTestnetFilledObservations: number
  }
  backtest: {
    holdoutStatus: ContractBacktestMetrics['status']
    holdoutSamples: number
    holdoutDays: number
    averageNetReturnPct: number | null
    maximumDrawdownPct: number
  }
  paper: {
    status: ContractPaperDriftCohort['status']
    samples: number
    returnDeltaPct: number | null
  }
  testnet: {
    readyForPaperComparison: boolean
    observations: number
    filledObservations: number
    unresolvedOrders: number
  }
  accountControls: {
    isolatedAccount: boolean
    withdrawalsDisabled: boolean
    ipAllowlist: boolean
    leastPrivilegeKey: boolean
  }
  riskControls: {
    perTradeLimit: boolean
    dailyLossLimit: boolean
    directionalExposureLimit: boolean
    portfolioExposureLimit: boolean
    humanKillSwitch: boolean
    anomalyCircuitBreaker: boolean
    idempotentOrders: boolean
    continuousReconciliation: boolean
  }
  eligibility: {
    jurisdictionConfirmed: boolean
    accountEligible: boolean
    productEligible: boolean
  }
}

export interface LiveTradingReadinessReport {
  evidenceLevel: 'research' | 'paper' | 'testnet' | 'reviewEligible'
  decision: 'notReady' | 'eligibleForHumanReview'
  liveTradingAuthorized: false
  passed: string[]
  blockers: string[]
  prohibitions: string[]
}

export type TradingReviewChecklistCategory = 'accountControls' | 'riskControls' | 'eligibility'
export type TradingReviewChecklistKey =
  | keyof LiveTradingReadinessInput['accountControls']
  | keyof LiveTradingReadinessInput['riskControls']
  | keyof LiveTradingReadinessInput['eligibility']

export interface TradingReviewAttestation {
  category: TradingReviewChecklistCategory
  key: TradingReviewChecklistKey
  confirmed: boolean
  evidence: string
  confirmedAt: string | null
}

export type TradingReviewAttestationDraft = Omit<TradingReviewAttestation, 'confirmedAt'>

export interface TradingReviewChecklist {
  schemaVersion: 1
  validityDays: number
  updatedAt: string
  attestations: TradingReviewAttestation[]
}

export interface TradingReviewChecklistEvaluation {
  accountControls: LiveTradingReadinessInput['accountControls']
  riskControls: LiveTradingReadinessInput['riskControls']
  eligibility: LiveTradingReadinessInput['eligibility']
  validCount: number
  totalCount: number
  expiredKeys: TradingReviewChecklistKey[]
  missingEvidenceKeys: TradingReviewChecklistKey[]
}

export interface TradingReviewPackageCloudAudit {
  checkpoint: TradingEvidenceAuditCheckpoint
  verification: TradingEvidenceAuditCheckpointVerification
  verifiedAt: string
  verificationScope: 'server-response-not-signature'
}

export interface TradingReviewPackage {
  schemaVersion: 1 | 2 | 3
  generatedAt: string
  authorization: 'human-review-only'
  evidence: {
    backtest: ContractBacktestEvidenceEnvelope | null
    paperDrift: ContractPaperDriftEvidenceEnvelope | null
    testnet: TestnetExecutionCalibrationReport | TestnetExecutionCalibrationEvidenceEnvelope | null
    reviewChecklist: TradingReviewChecklist
    reviewChecklistEvaluation: TradingReviewChecklistEvaluation
  }
  readinessInput: LiveTradingReadinessInput
  readinessReport: LiveTradingReadinessReport
  cloudAudit?: TradingReviewPackageCloudAudit | null
  contentDigest: string
}

export interface TradingEvidenceCloudBundle {
  schemaVersion: 1
  backtest: ContractBacktestEvidenceEnvelope | null
  paperTelemetry: ContractPaperTelemetry
  reviewChecklist: TradingReviewChecklist
}

export interface TradingEvidenceCloudSnapshot {
  bundle: TradingEvidenceCloudBundle | null
  revision: number
  contentDigest: string | null
  updatedAt: string | null
}

export interface TradingEvidenceCloudVersion {
  revision: number
  contentDigest: string
  createdAt: string
}

export interface TradingEvidenceAuditDigestInput {
  userId: string
  revision: number
  contentDigest: string
  previousAuditDigest: string | null
  createdAt: string
}

export interface TradingEvidenceAuditEntry extends TradingEvidenceAuditDigestInput {
  id: string
  auditDigest: string | null
}

export interface TradingEvidenceAuditHead {
  revision: number
  contentDigest: string
  auditDigest: string | null
}

export type TradingEvidenceAuditStatus = 'empty' | 'valid' | 'partial' | 'broken'

export interface TradingEvidenceAuditVerification {
  status: TradingEvidenceAuditStatus
  chainIntact: boolean
  fullyVerifiable: boolean
  totalEntries: number
  verifiedEntries: number
  legacyEntries: number
  firstRevision: number | null
  lastRevision: number | null
  headAuditDigest: string | null
  issues: string[]
}

export interface TradingEvidenceAuditCheckpointInput {
  generatedAt: string
  revision: number
  contentDigest: string
  auditDigest: string
  totalEntries: number
  chainStatus: 'valid' | 'partial'
}

export interface TradingEvidenceAuditCheckpoint extends TradingEvidenceAuditCheckpointInput {
  schemaVersion: 1
  kind: 'trading-evidence-audit-checkpoint'
  notice: 'external-checkpoint-not-signature'
  checkpointDigest: string
}

export interface TradingEvidenceAuditCheckpointVerification {
  valid: boolean
  checkpointRevision: number
  currentRevision: number
  isCurrentHead: boolean
  message: string
}

export interface TradingEvidenceBundleDiff {
  identical: boolean
  backtest: {
    localStrategyVersion: string | null
    cloudStrategyVersion: string | null
    changed: boolean
  }
  paperTelemetry: {
    sessionDelta: number
    cycleDelta: number
    gapDelta: number
  }
  reviewChecklist: {
    changedKeys: TradingReviewChecklistKey[]
    localConfirmed: number
    cloudConfirmed: number
  }
}

export type ContractChartInterval = '1m' | '3m' | '5m' | '15m' | '30m' | '1h' | '4h'
export type ContractInstrumentCategory =
  | 'crypto'
  | 'equity'
  | 'etf'
  | 'commodity'
  | 'fx'
  | 'index'
  | 'other'
export type ContractCatalogStatus = 'idle' | 'loading' | 'ready' | 'fallback'
export type ContractInstrumentRiskTag =
  | 'underlyingSession'
  | 'leveragedUnderlying'
  | 'inverseUnderlying'
  | 'futuresUnderlying'
  | 'regionalMarket'
  | 'commodityBasis'
export type ContractConnectionStatus =
  | 'idle'
  | 'connecting'
  | 'live'
  | 'reconnecting'
  | 'restricted'
  | 'error'

export interface ContractInstrument {
  symbol: string
  pair: string
  baseAsset: string
  quoteAsset: string
  marginAsset: string
  category: ContractInstrumentCategory
  displayName: string
  underlyingVenue: string | null
  riskTags: ContractInstrumentRiskTag[]
  underlyingType: string | null
  underlyingSubTypes: string[]
  onboardDate: string | null
}

export interface ContractInstrumentCatalog {
  instruments: ContractInstrument[]
  status: ContractCatalogStatus
  updatedAt: string | null
  errorCode: 'restrictedLocation' | 'network' | 'invalidResponse' | null
}

export interface ContractTimeframeSeries {
  interval: ContractChartInterval
  points: AssetPricePoint[]
}

export interface ContractMicrostructureSnapshot {
  orderBookImbalancePct: number | null
  spreadBps: number | null
  takerBuyRatioPct: number | null
  openInterestChangePct: number | null
}

export interface ContractMarketSnapshot {
  symbol: string
  quoteAsset: string
  interval: ContractChartInterval
  points: AssetPricePoint[]
  timeframes: ContractTimeframeSeries[]
  microstructure: ContractMicrostructureSnapshot
  markPrice: number | null
  fundingRatePct: number | null
  nextFundingTime: string | null
  openInterest: number | null
  updatedAt: string | null
  latencyMs: number | null
  status: ContractConnectionStatus
  errorCode: 'restrictedLocation' | 'network' | 'invalidResponse' | null
}

export type ContractTradeAction = 'long' | 'short' | 'wait' | 'noTrade' | 'insufficient'
export type ContractIndicatorSignal = 'long' | 'short' | 'neutral' | 'risk'
export type ContractIndicatorId =
  | 'trend'
  | 'timeframes'
  | 'macd'
  | 'kdj'
  | 'rsi'
  | 'atr'
  | 'volume'
  | 'funding'
  | 'orderBook'
  | 'takerFlow'
  | 'openInterest'
  | 'strategyEnsemble'

export interface ContractIndicatorReading {
  id: ContractIndicatorId
  signal: ContractIndicatorSignal
  score: number
  value: string
}

export type ContractDecisionReason =
  | 'trendBullish'
  | 'trendBearish'
  | 'macdBullish'
  | 'macdBearish'
  | 'kdjBullish'
  | 'kdjBearish'
  | 'rsiBullish'
  | 'rsiBearish'
  | 'volumeBullish'
  | 'volumeBearish'
  | 'fundingCrowdedLong'
  | 'fundingCrowdedShort'
  | 'lowVolatility'
  | 'signalsConflict'
  | 'unconfirmedVolume'
  | 'timeframesBullish'
  | 'timeframesBearish'
  | 'timeframesConflict'
  | 'orderBookBidDominant'
  | 'orderBookAskDominant'
  | 'takerBuyDominant'
  | 'takerSellDominant'
  | 'openInterestBullish'
  | 'openInterestBearish'
  | 'openInterestFalling'
  | 'spreadWide'
  | 'microstructureConflict'

export interface ContractTimeframeReading {
  interval: ContractChartInterval
  signal: 'long' | 'short' | 'neutral'
  score: number
  latestPrice: number | null
}

export interface ContractTradeDecision {
  action: ContractTradeAction
  score: number
  confidence: number
  latestPrice: number | null
  expectedMovePct: number | null
  entryLow: number | null
  entryHigh: number | null
  stopLoss: number | null
  takeProfit: number | null
  riskReward: number | null
  invalidation: number | null
  reasons: ContractDecisionReason[]
  risks: ContractDecisionReason[]
  indicators: ContractIndicatorReading[]
  timeframes: ContractTimeframeReading[]
  strategyDiagnostics: ContractStrategyDiagnostics | null
}

export interface ContractStrategyDiagnostics {
  baselineScore: number
  baselineAction: ContractTradeAction
  ensembleVersion: string
  ensembleRegime: 'trending' | 'ranging' | 'volatile'
  ensembleScore: number
  ensembleAction: ContractTradeAction
  ensembleConfidence: number
  appliedEnsembleWeightPct: number
}

export type BtcAutoStrategyRegime = ContractStrategyDiagnostics['ensembleRegime']

export type BtcAutoExecutionMode = 'paper' | 'testnet'
export type BtcAutoMarketSource = 'binance' | 'coinbase'
export type BtcAutoTradeStatus = 'opening' | 'open' | 'closing' | 'closed' | 'error'
export type BtcAutoSignalEvolution = 'new' | 'strengthened' | 'weakened' | 'falsified' | 'unchanged'
export type BtcAutoCloseReason =
  | 'stopLoss'
  | 'takeProfit'
  | 'signalFalsified'
  | 'timeStop'
  | 'manual'
export type BtcAutoPnlSource = 'estimated' | 'reconciled'
export type BtcAutoCycleStatus = 'success' | 'failed' | 'skipped' | 'unknown'
export type BtcAutoEntryGateReason =
  | 'ready'
  | 'disabled'
  | 'positionOpen'
  | 'positionLimit'
  | 'waitingDirection'
  | 'weakScore'
  | 'lowConfidence'
  | 'confirming'
  | 'cooldown'
  | 'dailyLossLimit'
  | 'consecutiveLossPause'
  | 'rollingPerformancePause'
  | 'strategyConsensusConflict'

export interface BtcAutoTradingConfig {
  enabled: boolean
  executionMode: BtcAutoExecutionMode
  riskControlsEnabled: boolean
  hedgeModeEnabled: boolean
  maxPositionsPerDirection: number
  symbol: 'BTCUSDT'
  interval: '5m'
  notionalUsdt: number
  leverage: number
  minimumConfidence: number
  minimumDirectionalScore: number
  requiredConfirmations: number
  cooldownMinutes: number
  dailyLossLimitUsdt: number
  maxConsecutiveLosses: number
  lossPauseMinutes: number
  performanceWindowTrades: number
  minimumRollingProfitFactor: number
  maximumRollingDrawdownUsdt: number
  performancePauseMinutes: number
  maximumHoldingMinutes: number
  feeRatePct: number
  eligibilityConfirmed: boolean
  updatedAt: string
}

export interface BtcAutoStrategyDefinition {
  executionMode: BtcAutoExecutionMode
  riskControlsEnabled: boolean
  hedgeModeEnabled: boolean
  maxPositionsPerDirection: number
  symbol: 'BTCUSDT'
  interval: '5m'
  notionalUsdt: number
  leverage: number
  minimumConfidence: number
  minimumDirectionalScore: number
  requiredConfirmations: number
  cooldownMinutes: number
  dailyLossLimitUsdt: number
  maxConsecutiveLosses: number
  lossPauseMinutes: number
  performanceWindowTrades: number
  minimumRollingProfitFactor: number
  maximumRollingDrawdownUsdt: number
  performancePauseMinutes: number
  maximumHoldingMinutes: number
  feeRatePct: number
}

export type BtcAutoLegacyStrategyDefinition = Omit<
  BtcAutoStrategyDefinition,
  'riskControlsEnabled' | 'hedgeModeEnabled' | 'maxPositionsPerDirection'
>

export interface BtcAutoStrategySnapshot {
  strategyVersion: string
  definition: BtcAutoStrategyDefinition | BtcAutoLegacyStrategyDefinition
  firstSeenAt: string
  lastSeenAt: string
}

export interface BtcAutoSignalSnapshot {
  strategyVersion: string
  action: ContractTradeAction
  score: number
  confidence: number
  price: number | null
  evolution: BtcAutoSignalEvolution
  confirmations: number
  reasons: ContractDecisionReason[]
  risks: ContractDecisionReason[]
  observedAt: string
  marketSource: BtcAutoMarketSource
}

export interface BtcAutoTrade {
  id: string
  strategyVersion: string
  performanceCohortVersion: string | null
  executionMode: BtcAutoExecutionMode
  symbol: 'BTCUSDT'
  direction: ContractPositionDirection
  status: BtcAutoTradeStatus
  quantity: number
  notionalUsdt: number
  leverage: number
  entryPrice: number | null
  exitPrice: number | null
  stopLoss: number
  takeProfit: number
  openedAt: string
  closedAt: string | null
  grossPnl: number | null
  feeRatePct: number
  fees: number | null
  fundingFee: number
  netPnl: number | null
  returnPct: number | null
  pnlSource: BtcAutoPnlSource
  reconciledAt: string | null
  reconciliationError: string | null
  signalScore: number
  signalConfidence: number
  signalReasons: ContractDecisionReason[]
  closeReason: BtcAutoCloseReason | null
  openOrderId: string | null
  closeOrderId: string | null
  error: string | null
}

export interface BtcAutoPerformanceSummary {
  period: 'day' | 'week' | 'month'
  startAt: string
  endAt: string
  trades: number
  reconciledTrades: number
  estimatedTrades: number
  wins: number
  losses: number
  winRatePct: number | null
  grossProfit: number
  grossLoss: number
  netPnl: number
  averageWinLossRatio: number | null
  profitFactor: number | null
  expectancyUsdt: number | null
  maxDrawdownUsdt: number
}

export interface BtcAutoEquityPoint {
  date: string
  trades: number
  netPnl: number
  cumulativeNetPnl: number
  drawdownUsdt: number
}

export interface BtcAutoEntryGate {
  reason: BtcAutoEntryGateReason
  eligible: boolean
  consecutiveLosses: number
  resumeAt: string | null
}

export interface BtcAutoRollingHealth {
  sampleSize: number
  currentVersionSampleSize: number
  requiredSampleSize: number
  sampleScope: 'performanceCohort' | 'currentVersion' | 'allHistoryFallback'
  profitFactor: number | null
  minimumProfitFactor: number
  maxDrawdownUsdt: number
  maximumDrawdownUsdt: number
  status: 'insufficientSample' | 'healthy' | 'paused' | 'probeEligible' | 'newVersionProbeEligible'
  reasons: Array<'lowProfitFactor' | 'excessiveDrawdown'>
  resumeAt: string | null
}

export interface BtcAutoSignalHistoryItem extends BtcAutoSignalSnapshot {
  id: string
  signalModelVersion: string | null
  entryGateReason: BtcAutoEntryGateReason
  entryEligible: boolean
  forward1hPct: number | null
  forward1hAt: string | null
  forward4hPct: number | null
  forward4hAt: string | null
  forward24hPct: number | null
  forward24hAt: string | null
  appliedEnsembleWeightPct: number | null
  ensembleRegime: BtcAutoStrategyRegime | null
  baselineAction: ContractTradeAction | null
  ensembleAction: ContractTradeAction | null
  baselinePath1hPct: number | null
  ensemblePath1hPct: number | null
  shadowStopDistancePct: number | null
  shadowTargetDistancePct: number | null
}

export interface BtcAutoSignalOutcomeSummary {
  horizon: '1h' | '4h' | '24h'
  samples: number
  hitRatePct: number | null
  averageDirectionalMovePct: number | null
}

export interface BtcAutoTemporalValidation {
  maximumSamples: number
  minimumSamples: number
  baselineSamples: number
  candidateSamples: number
  baselineHitRatePct: number | null
  candidateHitRatePct: number | null
  baselineAverageNetMovePct: number | null
  candidateAverageNetMovePct: number | null
  hitRateLiftPct: number | null
  passed: boolean
}

export interface BtcAutoStrategyComparison {
  horizon: '1h'
  minimumSamples: number
  maximumSamples: number
  confidenceLevelPct: number
  pairedSamples: number
  baselineOnlyWins: number
  ensembleOnlyWins: number
  baselineSamples: number
  baselineHitRatePct: number | null
  baselineAverageMovePct: number | null
  baselineAverageNetMovePct: number | null
  ensembleSamples: number
  ensembleHitRatePct: number | null
  ensembleAverageMovePct: number | null
  ensembleAverageNetMovePct: number | null
  estimatedRoundTripCostPct: number
  hitRateAdvantagePct: number | null
  hitRateAdvantageLowerBoundPct: number | null
  hitRateAdvantageUpperBoundPct: number | null
  verdict: 'collecting' | 'outperforming' | 'mixed' | 'underperforming'
  recommendedEnsembleWeightPct: number
  temporalValidation: BtcAutoTemporalValidation
}

export interface BtcAutoRegimeStrategyComparison extends BtcAutoStrategyComparison {
  regime: BtcAutoStrategyRegime
}

export interface BtcAutoScoreThresholdStudy {
  horizon: '1h'
  minimumSamples: number
  confidenceLevelPct: number
  currentThreshold: number
  candidateThreshold: number
  currentSamples: number
  candidateSamples: number
  currentHitRatePct: number | null
  candidateHitRatePct: number | null
  currentAverageNetMovePct: number | null
  candidateAverageNetMovePct: number | null
  candidateCoveragePct: number | null
  hitRateLiftPct: number | null
  hitRateLiftLowerBoundPct: number | null
  verdict: 'collecting' | 'raise' | 'keep' | 'mixed'
  temporalValidation: BtcAutoTemporalValidation
}

export interface BtcAutoConsensusStudy {
  horizon: '1h'
  minimumSamples: number
  confidenceLevelPct: number
  baselineSamples: number
  consensusSamples: number
  baselineHitRatePct: number | null
  consensusHitRatePct: number | null
  baselineAverageNetMovePct: number | null
  consensusAverageNetMovePct: number | null
  consensusCoveragePct: number | null
  hitRateLiftPct: number | null
  hitRateLiftLowerBoundPct: number | null
  verdict: 'collecting' | 'promote' | 'keep' | 'mixed'
  consensusRequired: boolean
  temporalValidation: BtcAutoTemporalValidation
}

export interface BtcAutoTradingDashboard {
  config: BtcAutoTradingConfig
  strategyVersion: string
  signalModelVersion: string
  evidencePolicyVersion: string
  performanceCohortVersion: string
  strategySnapshots: BtcAutoStrategySnapshot[]
  credentialsReady: boolean
  lastRunAt: string | null
  lastSuccessfulRunAt: string | null
  lastFailureAt: string | null
  lastError: string | null
  lastCycleStatus: BtcAutoCycleStatus
  consecutiveFailures: number
  nextRunAt: string
  signal: BtcAutoSignalSnapshot | null
  signalHistory: BtcAutoSignalHistoryItem[]
  signalOutcomes: BtcAutoSignalOutcomeSummary[]
  strategyComparison: BtcAutoStrategyComparison
  activeStrategyRegime: BtcAutoStrategyRegime | null
  strategyComparisonsByRegime: BtcAutoRegimeStrategyComparison[]
  scoreThresholdStudy: BtcAutoScoreThresholdStudy
  consensusStudy: BtcAutoConsensusStudy
  entryGate: BtcAutoEntryGate
  rollingHealth: BtcAutoRollingHealth
  openTrade: BtcAutoTrade | null
  openTrades: BtcAutoTrade[]
  trades: BtcAutoTrade[]
  performance: BtcAutoPerformanceSummary[]
  equityCurve: BtcAutoEquityPoint[]
}

export type ContractPositionDirection = 'long' | 'short'
export type ContractPositionRiskStatus = 'within' | 'over' | 'unavailable'

export interface ContractPositionSimulationInput {
  direction: ContractPositionDirection
  entryPrice: number | null
  stopLoss: number | null
  takeProfit: number | null
  notional: number
  leverage: number
  feeRatePct: number
  slippageRatePct: number
  fundingRatePct: number | null
  fundingSettlements: number
  accountEquity: number
  maxRiskPct: number
}

export interface ContractPositionSimulation {
  marginRequired: number | null
  roundTripFee: number | null
  roundTripSlippage: number | null
  projectedFunding: number | null
  breakEvenMovePct: number | null
  stopGrossPnl: number | null
  stopNetPnl: number | null
  targetGrossPnl: number | null
  targetNetPnl: number | null
  stopLossMarginPct: number | null
  riskBudget: number | null
  enteredRiskAmount: number | null
  recommendedNotional: number | null
  recommendedMargin: number | null
  riskUtilizationPct: number | null
  riskStatus: ContractPositionRiskStatus
}

export type ContractPaperTradeStatus = 'open' | 'closed'

export interface ContractPaperTradeCreateInput {
  id: string
  symbol: string
  displayName: string
  quoteAsset: string
  direction: ContractPositionDirection
  interval: ContractChartInterval
  openedAt: string
  entryPrice: number
  stopLoss: number
  takeProfit: number
  notional: number
  leverage: number
  feeRatePct: number
  fundingRatePct: number
  fundingSettlements: number
  riskBudget: number
  enteredRiskAmount: number
  signalScore: number
  signalConfidence: number
  strategyVersion: string
  signalVersion: string
  pathId: string
  marketSource: string
  costModelVersion: string
  plannedEntryPrice: number
  slippageRatePct: number
}

export interface ContractPaperTrade extends ContractPaperTradeCreateInput {
  status: ContractPaperTradeStatus
  closedAt: string | null
  exitPrice: number | null
}

export interface ContractPaperTradeEvaluation {
  referencePrice: number
  positionMovePct: number
  grossPnl: number
  estimatedCosts: number
  netPnl: number
  marginReturnPct: number
}

export interface ContractPaperJournalSummary {
  total: number
  open: number
  closed: number
  wins: number
  winRatePct: number | null
}

export interface TechnicalChartAsset {
  id: string
  name: string
  category: CrossAssetCategory | 'funds'
  series: string
  unit: string
  mode: CrossAssetItem['mode']
  date: string | null
  stale: boolean
  source: string
  sourceUrl: string
  calendar: MarketCalendarId
  dataShape: 'close' | 'ohlcv'
  adjustmentBasis?: 'not-applicable' | 'forward-adjusted' | 'provider-adjusted' | 'as-published'
  fundMetrics?: {
    market: 'us-related' | 'a-share'
    venue: 'exchange' | 'offExchange'
    latestNav: number | null
    navDate: string | null
    premiumRatePct: number | null
    annualFeePct: number
    dailyInvestmentLimitCny: number | null
    recurringInvestmentOpen: boolean | null
    investmentLimitHistory: FundInvestmentLimitPoint[]
    trackingErrorPct: number | null
  }
  points: AssetPricePoint[]
}

export type MarketCalendarId =
  | 'nyse'
  | 'sse'
  | 'hkex'
  | 'jpx'
  | 'europe'
  | 'fred-business'
  | 'crypto-24x7'
  | 'monthly'

export interface AssetTechnicalDataset {
  updatedAt: string
  source: string
  sourceUrl: string
  sourcePriority: string[]
  limitations: string[]
  limitationsEn?: string[]
  assets: TechnicalChartAsset[]
}

export interface TechnicalIndicatorReading {
  id: 'trend' | 'momentum' | 'volatility' | 'volume' | 'crossAsset'
  value: number | null
  score: number
  status: TechnicalSignalStatus
  change: 'rising' | 'falling' | 'flat' | 'unavailable'
  evidence: string[]
}

export interface TechnicalHorizonReading {
  id: 'day' | 'week' | 'month' | 'quarter' | 'halfYear' | 'year'
  observations: number
  returnPct: number | null
  score: number
  status: TechnicalSignalStatus
}

export interface TechnicalAnalysisResult {
  status: TechnicalSignalStatus
  score: number
  confidence: number
  latest: number | null
  ma20: Array<number | null>
  ma60: Array<number | null>
  macd: Array<number | null>
  macdSignal: Array<number | null>
  rsi14: Array<number | null>
  bollingerUpper: Array<number | null>
  bollingerLower: Array<number | null>
  atr14: Array<number | null>
  support: number | null
  resistance: number | null
  indicators: TechnicalIndicatorReading[]
  horizons: TechnicalHorizonReading[]
}

export interface TechnicalBacktestHorizon {
  observations: 5 | 21 | 63
  sampleSize: number
  winRatePct: number | null
  winRateIntervalPct: { low: number; high: number } | null
  liftVsRandomPct: number | null
  averageDirectionalReturnPct: number | null
  medianDirectionalReturnPct: number | null
  maximumAdverseExcursionPct: number | null
  medianInvalidationBars: number | null
  status: 'supported' | 'watch' | 'contradicted' | 'insufficient'
}

export interface TechnicalBacktestResult {
  formulaVersion: string
  methodology: 'chronological-holdout'
  generatedAt: string
  trainingEndDate: string | null
  holdoutStartDate: string | null
  holdoutEndDate: string | null
  minimumSamples: number
  signalThreshold: number
  samplingInterval: number
  totalSignals: number
  bullishSignals: number
  bearishSignals: number
  calibration: {
    candidateCount: number
    status: 'calibrated' | 'fallback'
    selectedTemplate: {
      id: string
      name: string
      weights: TechnicalIndicatorConfig['weights']
    }
    training: {
      sampleSize: number
      winRatePct: number | null
      winRateIntervalPct: { low: number; high: number } | null
      averageDirectionalReturnPct: number | null
    }
    appliedToHoldout: true
  }
  horizons: TechnicalBacktestHorizon[]
  limitations: string[]
}

export type TechnicalAlertCondition =
  | 'priceAbove'
  | 'priceBelow'
  | 'rsiAbove'
  | 'rsiBelow'
  | 'macdBullishCross'
  | 'macdBearishCross'
  | 'volumeSpike'
  | 'volatilityAbove'
  | 'gapAbove'
  | 'earningsWithinDays'
  | 'correlationStructureChange'
  | 'volatilityPercentileAbove'
  | 'technicalDivergence'
  | 'transmissionDivergence'
  | 'fundPremiumAbove'
  | 'fundLimitChanged'

export type TechnicalAlertHorizon = TechnicalHorizonReading['id']

export interface TechnicalAlertRule {
  id: string
  assetId: string
  assetName: string
  series: string
  compareAssetId: string | null
  compareAssetName: string | null
  condition: TechnicalAlertCondition
  threshold: number | null
  horizon: TechnicalAlertHorizon
  minimumConfidence: number
  requireResonance: boolean
  enabled: boolean
  createdAt: string
  updatedAt: string
}

export interface TechnicalAlertEvaluation {
  triggered: boolean
  currentValue: number | null
  explanation: string
}

export type TechnicalChartRange =
  | 'day'
  | 'week'
  | 'month'
  | 'quarter'
  | 'halfYear'
  | 'year'
  | 'threeYear'
  | 'fiveYear'

export interface TechnicalIndicatorConfig {
  version: number
  formulaVersion: string
  updatedAt: string | null
  updatedBy: string | null
  enabled: {
    maShort: boolean
    maLong: boolean
    macd: boolean
    rsi: boolean
    bollinger: boolean
    atr: boolean
    volume: boolean
    crossAsset: boolean
    advancedMovingAverages: boolean
    adx: boolean
    stochastic: boolean
    roc: boolean
    cci: boolean
    historicalVolatility: boolean
    obv: boolean
    vwap: boolean
    marketStructure: boolean
  }
  parameters: {
    maShortPeriod: number
    maLongPeriod: number
    macdFastPeriod: number
    macdSlowPeriod: number
    macdSignalPeriod: number
    rsiPeriod: number
    rsiOverbought: number
    rsiOversold: number
    bollingerPeriod: number
    bollingerMultiplier: number
    atrPeriod: number
    supportResistanceWindow: number
    maFastPeriod: number
    maMediumPeriod: number
    maTrendPeriod: number
    maAnnualPeriod: number
    emaPeriod: number
    adxPeriod: number
    stochasticPeriod: number
    rocPeriod: number
    cciPeriod: number
    historicalVolatilityPeriod: number
    vwapPeriod: number
    highLowWindow: number
    gapLookback: number
  }
  weights: {
    trend: number
    momentum: number
    volatility: number
    volume: number
    crossAsset: number
  }
  display: {
    carouselIntervalMs: number
    carouselAutoPlay: boolean
    defaultRange: TechnicalChartRange
  }
  sourcePriority: string[]
}

export interface TechnicalIndicatorConfigVersion {
  version: number
  formulaVersion: string
  updatedAt: string
  updatedBy: string | null
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
