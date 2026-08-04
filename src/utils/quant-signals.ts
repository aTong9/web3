import type {
  CrossAssetDataset,
  CrossAssetItem,
  QuantAssetSignal,
  QuantDashboard,
  QuantOptionCandidate,
  QuantSignalLevel,
  QuantStrategyConfig,
  UsMegaCapDataset,
} from '@/types'

const defaultConfig: QuantStrategyConfig = {
  forwardPeThreshold: 35,
  valuationBufferPct: 20,
  minimumEvidenceScore: 55,
  maximumPositionRiskPct: 0.75,
  optionDteRange: { min: 60, max: 120 },
  optionDeltaRange: { min: 0.55, max: 0.7 },
}

const coreAssetIds = new Set([
  'sp500',
  'nasdaq',
  'shanghai',
  'hangseng',
  'euro50',
  'nikkei',
  'us2y',
  'us10y',
  'us30y',
  'usd',
  'eurusd',
  'usdjpy',
  'usdcny',
  'wti',
  'brent',
  'gold',
  'copper',
  'natgas',
  'btc',
  'eth',
])
const inversePriceProxyIds = new Set(['us2y', 'us10y', 'us30y'])

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const round = (value: number, decimals = 1) => Number(value.toFixed(decimals))
const direction = (value: number | null) => (value === null ? 0 : value > 0 ? 1 : value < 0 ? -1 : 0)

const changeScore = (asset: CrossAssetItem) => {
  const weights = { day: 0.1, week: 0.25, month: 0.35, quarter: 0.2, halfYear: 0.1 }
  const weighted = Object.entries(weights).reduce((sum, [period, weight]) => {
    const value = asset.changes[period as keyof typeof weights]
    if (value === null) return sum
    const scale = asset.mode === 'difference' ? 0.25 : asset.mode === 'absolute' ? 3 : 5
    return sum + clamp(value / scale, -1, 1) * weight
  }, 0)
  return weighted * 100 * (inversePriceProxyIds.has(asset.id) ? -1 : 1)
}

const signalFromScore = (score: number, evidence: number): QuantSignalLevel => {
  if (evidence < 35) return 'unavailable'
  if (score >= 55 && evidence >= 65) return 'buy'
  if (score >= 25) return 'accumulate'
  if (score <= -55 && evidence >= 65) return 'sell'
  if (score <= -25) return 'reduce'
  return 'hold'
}

const buildAssetSignal = (
  asset: CrossAssetItem,
  dataset: CrossAssetDataset,
): QuantAssetSignal | null => {
  if (!coreAssetIds.has(asset.id) || asset.value === null || asset.date === null) return null
  const market = dataset.marketBrief.markets.find((item) => item.id === asset.id)
  const selectedHorizons = market?.horizonOutlooks.filter((item) =>
    ['week', 'month', 'quarter'].includes(item.id),
  )
  const horizonScore = selectedHorizons?.length
    ? selectedHorizons.reduce((sum, item) => sum + item.score, 0) / selectedHorizons.length
    : null
  const validatedCount = selectedHorizons?.filter((item) => item.validated).length ?? 0
  const momentumScore = changeScore(asset)
  const score = clamp(
    horizonScore === null ? momentumScore : horizonScore * 55 + momentumScore * 0.45,
    -100,
    100,
  )
  const availableChanges = [
    asset.changes.day,
    asset.changes.week,
    asset.changes.month,
    asset.changes.quarter,
    asset.changes.halfYear,
    asset.changes.year,
  ].filter((value) => value !== null).length
  const evidenceScore = clamp(
    30 + availableChanges * 6 + (market ? 12 : 0) + validatedCount * 8 - (asset.stale ? 45 : 0),
    0,
    100,
  )
  const signal = asset.stale ? 'unavailable' : signalFromScore(score, evidenceScore)
  const reasons = [
    `1周变化 ${asset.changes.week === null ? '—' : `${asset.changes.week > 0 ? '+' : ''}${round(asset.changes.week, 2)}${asset.mode === 'return' ? '%' : ''}`}`,
    `1月变化 ${asset.changes.month === null ? '—' : `${asset.changes.month > 0 ? '+' : ''}${round(asset.changes.month, 2)}${asset.mode === 'return' ? '%' : ''}`}`,
  ]
  if (selectedHorizons?.length) {
    reasons.push(
      `中期方向 ${selectedHorizons.filter((item) => item.direction === 'bullish').length}/${selectedHorizons.length} 偏涨`,
    )
  }
  if (inversePriceProxyIds.has(asset.id)) {
    reasons.push('使用收益率的反向变化代理债券价格方向：收益率上行对应债券价格承压')
  }
  const risks = []
  if (asset.stale) risks.push('数据已过期，禁止生成交易候选')
  if (validatedCount === 0 && market) risks.push('中期方向尚未通过留出验证')
  if (direction(asset.changes.week) !== direction(asset.changes.month)) risks.push('周线与月线方向分歧')
  if (!market) risks.push('暂无专用方向模型，使用价格动量代理')
  return {
    id: asset.id,
    name: asset.name,
    category: asset.category,
    mode: asset.mode,
    value: asset.value,
    unit: asset.unit,
    date: asset.date,
    score: round(score),
    evidenceScore: round(evidenceScore, 0),
    signal,
    stale: asset.stale,
    changes: {
      day: asset.changes.day,
      week: asset.changes.week,
      month: asset.changes.month,
      quarter: asset.changes.quarter,
      halfYear: asset.changes.halfYear,
      year: asset.changes.year,
    },
    reasons,
    risks,
    modelSource:
      validatedCount > 0 ? 'validated-horizon' : market ? 'horizon-watch' : 'momentum-proxy',
  }
}

const buildOptionCandidates = (
  megaCaps: UsMegaCapDataset,
  dataset: CrossAssetDataset,
  config: QuantStrategyConfig,
): QuantOptionCandidate[] => {
  const nasdaq = dataset.marketBrief.markets.find((market) => market.id === 'nasdaq')
  const mediumHorizons = nasdaq?.horizonOutlooks.filter((item) =>
    ['week', 'month', 'quarter'].includes(item.id),
  )
  const marketScore = mediumHorizons?.length
    ? (mediumHorizons.reduce((sum, item) => sum + item.score, 0) / mediumHorizons.length) * 35
    : 0
  const marketValidated = mediumHorizons?.some((item) => item.validated) ?? false
  const deepValueLine = config.forwardPeThreshold * (1 - config.valuationBufferPct / 100)
  const expensiveLine = config.forwardPeThreshold * (1 + config.valuationBufferPct / 100)

  return megaCaps.stocks
    .map((stock) => {
      const forwardPe = stock.forwardPe
      const discountToThresholdPct =
        forwardPe === null
          ? null
          : round(((config.forwardPeThreshold - forwardPe) / config.forwardPeThreshold) * 100)
      const gapToHistoricalAnchorPct =
        forwardPe === null || stock.historicalPeMedian5y === null
          ? null
          : round(((forwardPe - stock.historicalPeMedian5y) / stock.historicalPeMedian5y) * 100)
      const valuationScore =
        forwardPe === null
          ? 0
          : clamp(((config.forwardPeThreshold - forwardPe) / config.forwardPeThreshold) * 100, -60, 60)
      const score = clamp(valuationScore + marketScore, -100, 100)
      const evidenceScore = clamp(
        30 + (forwardPe !== null ? 20 : 0) + (stock.price !== null ? 10 : 0) +
          (stock.historicalPeMedian5y !== null ? 15 : 0) + (marketValidated ? 15 : 0),
        0,
        100,
      )
      let action: QuantOptionCandidate['action'] = 'hold'
      if (forwardPe === null || stock.price === null) action = 'unavailable'
      else if (forwardPe >= expensiveLine) action = 'exit-long-call'
      else if (forwardPe > config.forwardPeThreshold) action = 'avoid'
      else if (forwardPe <= deepValueLine && marketScore > 0) action = 'long-call-candidate'
      else if (forwardPe < config.forwardPeThreshold) action = 'long-call-watch'

      const blockers = [
        '尚未接入实时期权链、隐含波动率、成交量和买卖价差',
        '尚未接入分析师EPS预期修正与财报日历',
      ]
      if (!marketValidated) blockers.push('纳指中期方向尚未通过留出验证')
      if (megaCaps.status !== 'ok') blockers.push('估值数据本次更新已降级')
      const reasons = [
        forwardPe === null
          ? 'Forward PE缺失'
          : `Forward PE ${forwardPe.toFixed(2)}x，35x纪律线差值${discountToThresholdPct !== null && discountToThresholdPct >= 0 ? '+' : ''}${discountToThresholdPct ?? '—'}%`,
        stock.historicalPeMedian5y === null
          ? '五年PE中枢缺失'
          : `五年Trailing PE中枢 ${stock.historicalPeMedian5y.toFixed(1)}x（仅作质量锚）`,
        `纳指中期环境得分 ${round(marketScore)}`,
      ]
      return {
        symbol: stock.symbol,
        name: stock.name,
        marketCapRank: stock.marketCapRank,
        price: stock.price,
        forwardPe,
        historicalPeMedian5y: stock.historicalPeMedian5y,
        discountToThresholdPct,
        gapToHistoricalAnchorPct,
        score: round(score),
        evidenceScore: round(evidenceScore, 0),
        action,
        executable: false,
        reasons,
        blockers,
        template: {
          strategy: (action === 'exit-long-call' || action === 'avoid'
            ? 'exit-or-avoid'
            : 'long-call') as QuantOptionCandidate['template']['strategy'],
          dteRange: config.optionDteRange,
          deltaRange: config.optionDeltaRange,
          maximumPositionRiskPct: config.maximumPositionRiskPct,
        },
        sourceUrl: stock.url,
      }
    })
    .sort((left, right) => right.score - left.score)
}

export const buildQuantDashboard = (
  dataset: CrossAssetDataset,
  megaCaps: UsMegaCapDataset,
  overrides: Partial<QuantStrategyConfig> = {},
): QuantDashboard => {
  const config: QuantStrategyConfig = { ...defaultConfig, ...overrides }
  const assets = dataset.assets
    .map((asset) => buildAssetSignal(asset, dataset))
    .filter((asset): asset is QuantAssetSignal => asset !== null)
    .sort((left, right) => right.score - left.score)
  const options = buildOptionCandidates(megaCaps, dataset, config)
  return {
    generatedAt:
      dataset.updatedAt > megaCaps.updatedAt ? dataset.updatedAt : megaCaps.updatedAt,
    asOfDate: dataset.marketBrief.asOfDate,
    config,
    summary: {
      buyCandidates: assets.filter((asset) => ['buy', 'accumulate'].includes(asset.signal)).length,
      sellCandidates: assets.filter((asset) => ['sell', 'reduce'].includes(asset.signal)).length,
      optionLongCallCandidates: options.filter((item) => item.action === 'long-call-candidate').length,
      optionExitCandidates: options.filter((item) => ['exit-long-call', 'avoid'].includes(item.action)).length,
      unavailable: assets.filter((asset) => asset.signal === 'unavailable').length,
    },
    assets,
    options,
    limitations: [
      '所有结果均为规则模型候选，不是交易指令。模型未接券商，不会自动下单。',
      '35x是可配置纪律线；低于或高于阈值本身不足以证明期权具有正期望。',
      '期权候选在实时期权链、IV、流动性、EPS修正和财报日历接入前一律不可执行。',
      '模拟记录只跟踪标的股票价格变化，不等同于期权收益。',
    ],
  }
}
