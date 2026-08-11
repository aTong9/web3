import type {
  AssetTechnicalDataset,
  CrossAssetDataset,
  CrossAssetItem,
  OptionMarketDataset,
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
  optionDteRange: { min: 365, max: 730 },
  optionDeltaRange: { min: 0.6, max: 0.8 },
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
const direction = (value: number | null) =>
  value === null ? 0 : value > 0 ? 1 : value < 0 ? -1 : 0
const daysFromToday = (value: string | null) => {
  if (!value) return null
  const parsed = new Date(value.includes('/') ? `${value} 12:00:00 UTC` : `${value}T12:00:00Z`)
  if (Number.isNaN(parsed.getTime())) return null
  const today = new Date()
  today.setUTCHours(12, 0, 0, 0)
  return Math.round((parsed.getTime() - today.getTime()) / 86_400_000)
}
const calendarIso = (value: string | null) => {
  if (!value) return null
  const parsed = new Date(value.includes('/') ? `${value} 12:00:00 UTC` : `${value}T12:00:00Z`)
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10)
}

const earningsEventWindow = (
  stock: UsMegaCapDataset['stocks'][number],
  technicals: AssetTechnicalDataset | null,
): QuantOptionCandidate['earningsEvent'] => {
  const reportDate = calendarIso(stock.earnings.lastReportedDate)
  const asset = technicals?.assets.find(
    (item) => item.id === `us-${stock.symbol.toLocaleLowerCase()}`,
  )
  if (!reportDate || !asset?.points.length)
    return {
      status: 'insufficient',
      reportDate,
      baselineDate: null,
      eventSessionDate: null,
      pre5dReturnPct: null,
      reaction1dPct: null,
      post5dReturnPct: null,
      post20dReturnPct: null,
    }
  const eventIndex = asset.points.findIndex((point) => point.date >= reportDate)
  const baseline = asset.points[eventIndex - 1]
  const event = asset.points[eventIndex]
  const beforeFive = asset.points[eventIndex - 6]
  const afterFive = asset.points[eventIndex + 4]
  const afterTwenty = asset.points[eventIndex + 19]
  const returnFromBaseline = (point: typeof baseline) =>
    point && baseline ? round((point.close / baseline.close - 1) * 100, 2) : null
  return {
    status: baseline && event ? 'available' : 'insufficient',
    reportDate,
    baselineDate: baseline?.date ?? null,
    eventSessionDate: event?.date ?? null,
    pre5dReturnPct:
      beforeFive && baseline ? round((baseline.close / beforeFive.close - 1) * 100, 2) : null,
    reaction1dPct: returnFromBaseline(event),
    post5dReturnPct: returnFromBaseline(afterFive),
    post20dReturnPct: returnFromBaseline(afterTwenty),
  }
}

const stockTechnicalReading = (
  stock: UsMegaCapDataset['stocks'][number],
  technicals: AssetTechnicalDataset | null,
): QuantOptionCandidate['technical'] => {
  const asset = technicals?.assets.find(
    (item) => item.id === `us-${stock.symbol.toLocaleLowerCase()}`,
  )
  const points = asset?.points ?? []
  const latest = points[points.length - 1]
  const monthBase = points[points.length - 21]
  const quarterBase = points[points.length - 61]
  const monthReturnPct =
    latest && monthBase ? round((latest.close / monthBase.close - 1) * 100, 2) : null
  const quarterReturnPct =
    latest && quarterBase ? round((latest.close / quarterBase.close - 1) * 100, 2) : null
  const score =
    monthReturnPct === null || quarterReturnPct === null
      ? null
      : round(clamp(monthReturnPct * 1.4 + quarterReturnPct * 0.6, -30, 30))
  return {
    date: latest?.date ?? null,
    score,
    monthReturnPct,
    quarterReturnPct,
    stale: asset?.stale ?? true,
  }
}

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
  if (direction(asset.changes.week) !== direction(asset.changes.month))
    risks.push('周线与月线方向分歧')
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
  optionMarket: OptionMarketDataset | null,
  technicals: AssetTechnicalDataset | null,
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
      const marketOptions =
        optionMarket?.symbols.find((item) => item.symbol === stock.symbol) ?? null
      const earningsEvent = earningsEventWindow(stock, technicals)
      const technical = stockTechnicalReading(stock, technicals)
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
          : clamp(
              ((config.forwardPeThreshold - forwardPe) / config.forwardPeThreshold) * 100,
              -60,
              60,
            )
      const revisionBalance =
        stock.earnings.revisionsUp === null || stock.earnings.revisionsDown === null
          ? null
          : stock.earnings.revisionsUp - stock.earnings.revisionsDown
      const earningsScore = clamp(
        (revisionBalance ?? 0) * 3 +
          (stock.earnings.lastResultReliable ? (stock.earnings.lastSurprisePct ?? 0) * 0.35 : 0),
        -20,
        20,
      )
      const technicalScore = technical.stale ? 0 : (technical.score ?? 0)
      const score = clamp(valuationScore + marketScore + earningsScore + technicalScore, -100, 100)
      const daysToEarnings = daysFromToday(stock.earnings.nextEarningsDate)
      const daysSinceEarnings = daysFromToday(stock.earnings.lastReportedDate)
      const earningsWindow: QuantOptionCandidate['earningsWindow'] =
        daysToEarnings !== null && daysToEarnings >= 0 && daysToEarnings <= 14
          ? 'pre-earnings'
          : daysSinceEarnings !== null && daysSinceEarnings <= 0 && daysSinceEarnings >= -3
            ? 'post-earnings'
            : stock.earnings.nextEarningsDate === null
              ? 'unknown'
              : 'clear'
      const evidenceScore = clamp(
        30 +
          (forwardPe !== null ? 20 : 0) +
          (stock.price !== null ? 10 : 0) +
          (stock.historicalPeMedian5y !== null ? 15 : 0) +
          (marketValidated ? 15 : 0) +
          (stock.earnings.nextConsensusEps !== null ? 10 : 0) +
          (revisionBalance !== null ? 10 : 0) +
          (marketOptions?.status === 'ok' ? 10 : marketOptions?.status === 'partial' ? 5 : 0) +
          (technical.score !== null && !technical.stale ? 10 : 0),
        0,
        100,
      )
      let action: QuantOptionCandidate['action'] = 'hold'
      if (forwardPe === null || stock.price === null) action = 'unavailable'
      else if (forwardPe >= expensiveLine) action = 'exit-long-call'
      else if (forwardPe > config.forwardPeThreshold) action = 'avoid'
      else if (forwardPe <= deepValueLine && marketScore > 0) action = 'long-call-candidate'
      else if (forwardPe < config.forwardPeThreshold) action = 'long-call-watch'

      const earningsSupportsBullish =
        stock.earnings.lastResultReliable &&
        stock.earnings.positiveSurpriseStreak > 0 &&
        revisionBalance !== null &&
        revisionBalance >= 0
      let direction: QuantOptionCandidate['direction'] = 'neutral'
      if (earningsWindow === 'pre-earnings') direction = 'event-risk'
      else if (
        ['long-call-candidate', 'long-call-watch'].includes(action) &&
        earningsSupportsBullish &&
        technicalScore >= 0
      )
        direction = 'bullish'
      else if (
        (action === 'exit-long-call' || action === 'avoid') &&
        marketScore < 0 &&
        technicalScore < 0 &&
        (revisionBalance ?? 0) <= 0
      )
        direction = 'bearish'

      let strategy: QuantOptionCandidate['template']['strategy'] = 'wait'
      if (direction === 'bullish') {
        strategy =
          action === 'long-call-candidate' && (marketOptions?.leapsIvRank52w ?? 100) < 65
            ? 'long-call'
            : 'call-debit-spread'
      } else if (direction === 'bearish') {
        strategy = 'put-debit-spread'
      } else if (action === 'exit-long-call') {
        strategy = 'exit-or-avoid'
      }

      const blockers = ['研究模式不连接券商，也不自动下单']
      if (!marketOptions || marketOptions.status === 'unavailable')
        blockers.push(marketOptions?.message ?? 'LEAPS期权链、隐含波动率与Put/Call数据不可用')
      if (marketOptions?.status === 'partial')
        blockers.push(marketOptions.message ?? '期权链数据不完整，禁止形成可执行合约建议')
      if (marketOptions?.leapsIvRank52w === null)
        blockers.push(
          `LEAPS IV Rank历史不足，当前${marketOptions?.ivRankObservations ?? 0}/20个最低观测`,
        )
      if (earningsWindow === 'pre-earnings')
        blockers.push('14天内进入财报窗口，隐含波动率可能明显抬升，等待财报后重新评估')
      if (earningsWindow === 'unknown') blockers.push('下一次财报日期尚未公布或数据源尚未更新')
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
        stock.earnings.nextConsensusEps === null
          ? '下一季度EPS预期缺失'
          : `${stock.earnings.nextFiscalQuarter ?? '下一季度'} EPS共识 ${stock.earnings.nextConsensusEps.toFixed(2)}，近4周上修/下修 ${stock.earnings.revisionsUp ?? '—'}/${stock.earnings.revisionsDown ?? '—'}`,
        stock.earnings.lastSurprisePct === null
          ? '最近财报结果缺失'
          : !stock.earnings.lastResultReliable
            ? '最近财报EPS与共识口径异常，结果不参与方向评分'
            : `最近财报EPS ${stock.earnings.lastActualEps?.toFixed(2) ?? '—'}，超预期 ${stock.earnings.lastSurprisePct > 0 ? '+' : ''}${stock.earnings.lastSurprisePct.toFixed(2)}%`,
        marketOptions?.leapsIvPct === null || marketOptions?.leapsIvPct === undefined
          ? '近端LEAPS平值IV不可用'
          : `近端LEAPS平值IV ${marketOptions.leapsIvPct.toFixed(2)}%，IV Rank ${marketOptions.leapsIvRank52w?.toFixed(1) ?? '历史不足'}，Put/Call成交量比 ${marketOptions.putCallVolumeRatio?.toFixed(2) ?? '—'}`,
        technical.score === null
          ? '个股技术历史不足'
          : `个股技术得分 ${technical.score > 0 ? '+' : ''}${technical.score}，1月/1季度 ${technical.monthReturnPct?.toFixed(2) ?? '—'}%/${technical.quarterReturnPct?.toFixed(2) ?? '—'}%`,
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
        direction,
        earningsWindow,
        earnings: stock.earnings,
        optionMarket: marketOptions,
        earningsEvent,
        technical,
        executable: false,
        reasons,
        blockers,
        template: {
          strategy,
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
  optionMarket: OptionMarketDataset | null = null,
  technicals: AssetTechnicalDataset | null = null,
  overrides: Partial<QuantStrategyConfig> = {},
): QuantDashboard => {
  const config: QuantStrategyConfig = { ...defaultConfig, ...overrides }
  const assets = dataset.assets
    .map((asset) => buildAssetSignal(asset, dataset))
    .filter((asset): asset is QuantAssetSignal => asset !== null)
    .sort((left, right) => right.score - left.score)
  const options = buildOptionCandidates(megaCaps, dataset, optionMarket, technicals, config)
  return {
    generatedAt: dataset.updatedAt > megaCaps.updatedAt ? dataset.updatedAt : megaCaps.updatedAt,
    asOfDate: dataset.marketBrief.asOfDate,
    config,
    summary: {
      buyCandidates: assets.filter((asset) => ['buy', 'accumulate'].includes(asset.signal)).length,
      sellCandidates: assets.filter((asset) => ['sell', 'reduce'].includes(asset.signal)).length,
      optionLongCallCandidates: options.filter((item) => item.action === 'long-call-candidate')
        .length,
      optionExitCandidates: options.filter((item) =>
        ['exit-long-call', 'avoid'].includes(item.action),
      ).length,
      unavailable: assets.filter((asset) => asset.signal === 'unavailable').length,
    },
    assets,
    options,
    limitations: [
      '所有结果均为规则模型候选，不是交易指令。模型未接券商，不会自动下单。',
      '35x是可配置纪律线；低于或高于阈值本身不足以证明期权具有正期望。',
      'EPS预期、修正和财报结果已接入；LEAPS IV、IV Rank、Put/Call和期限结构来自独立期权数据集，缺失时明确降级。',
      'IV Rank按近端LEAPS平值IV每日快照计算，至少20个观测后显示；不是常见30天恒定期限IV Rank。',
      '模拟记录只跟踪标的股票价格变化，不等同于期权收益。',
    ],
  }
}
