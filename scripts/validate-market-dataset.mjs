import { appendFile, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const validTimestamp = (value) => typeof value === 'string' && Number.isFinite(Date.parse(value))

const assertFresh = (value, now, errors, maximumMinutes = 120) => {
  if (!validTimestamp(value)) {
    errors.push('更新时间缺失或格式无效')
    return null
  }
  const ageMs = now.getTime() - Date.parse(value)
  if (ageMs < -10 * 60 * 1000) errors.push('更新时间超过当前时间10分钟')
  if (ageMs > maximumMinutes * 60 * 1000)
    errors.push(
      maximumMinutes === 120
        ? '更新时间距校验时刻超过2小时'
        : `更新时间距校验时刻超过${maximumMinutes}分钟`,
    )
  return Number((ageMs / 60_000).toFixed(1))
}

const ascendingDates = (rows) =>
  rows.every((row, index) => index === 0 || row.date > rows[index - 1].date)

const assertRecentDate = (value, now, maximumDays, label, errors) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? '')) {
    errors.push(`${label}日期无效`)
    return
  }
  const ageMs = now.getTime() - Date.parse(`${value}T23:59:59.999Z`)
  if (ageMs > maximumDays * 86_400_000) errors.push(`${label}距校验时刻超过${maximumDays}天`)
  if (ageMs < -2 * 86_400_000) errors.push(`${label}超过当前日期2天`)
}

export const validateDataset = (kind, dataset, now = new Date(), related = {}) => {
  const errors = []
  const facts = []
  const updatedAt = kind === 'us-indexes' ? dataset.generatedAt : dataset.updatedAt
  const requiresFreshTimestamp = kind !== 'us-technicals'
  const maximumAgeMinutes = kind === 'market-news' ? 360 : kind === 'kol-monitor' ? 480 : 120
  const ageMinutes = requiresFreshTimestamp
    ? assertFresh(updatedAt, now, errors, maximumAgeMinutes)
    : null
  facts.push(
    ['更新时间', updatedAt ?? '—'],
    ['距校验', ageMinutes === null ? '—' : `${ageMinutes} 分钟`],
  )

  if (kind === 'a-share') {
    if (!Array.isArray(dataset.funds) || dataset.funds.length < 35) errors.push('基金记录少于35条')
    if (!Array.isArray(dataset.sectors) || dataset.sectors.length < 30)
      errors.push('行业记录少于30条')
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dataset.tradingDate ?? '')) errors.push('交易日期无效')
    facts.push(['基金', dataset.funds?.length ?? 0], ['行业', dataset.sectors?.length ?? 0])
  } else if (kind === 'us-funds') {
    if (!Array.isArray(dataset.funds) || dataset.funds.length < 20) errors.push('基金记录少于20条')
    const exchange = dataset.funds?.filter((fund) => fund.venue === 'exchange').length ?? 0
    const offExchange = dataset.funds?.filter((fund) => fund.venue === 'offExchange').length ?? 0
    if (exchange < 10 || offExchange < 10) errors.push('场内或场外基金记录少于10条')
    facts.push(['基金', dataset.funds?.length ?? 0], ['场内/场外', `${exchange}/${offExchange}`])
  } else if (kind === 'us-indexes') {
    if (dataset.status !== 'complete') errors.push('数据状态不是complete')
    const expected = ['QQQ', 'SPY', 'GLD', 'BTC-USD']
    const isSplitBundle = (dataset.schemaVersion ?? 0) >= 6
    const dailyDataset = isSplitBundle ? related.dailyDataset : dataset
    const series = Array.isArray(dailyDataset?.marketSeries) ? dailyDataset.marketSeries : []
    const monthlySeries = Array.isArray(dataset.monthlySeries) ? dataset.monthlySeries : []
    if (isSplitBundle) {
      if (!validTimestamp(dataset.datasetVersion)) errors.push('概况数据版本无效')
      if (!dailyDataset) errors.push('缺少定投日线数据文件')
      else {
        if (dailyDataset.status !== 'complete') errors.push('定投日线状态不是complete')
        if (dailyDataset.schemaVersion !== 1) errors.push('定投日线schema版本不是1')
        if (dailyDataset.datasetVersion !== dataset.datasetVersion)
          errors.push('概况与定投日线版本不一致')
        if (dailyDataset.generatedAt !== dataset.generatedAt)
          errors.push('概况与定投日线生成时间不一致')
      }
      if (monthlySeries.length !== expected.length) errors.push('月度概况序列数量不是4')
    }
    for (const symbol of expected) {
      const item = series.find((row) => row.symbol === symbol)
      if (!item) {
        errors.push(`缺少${symbol}行情序列`)
        continue
      }
      if (!Array.isArray(item.prices) || item.prices.length < 250)
        errors.push(`${symbol}行情少于250条`)
      else if (!ascendingDates(item.prices)) errors.push(`${symbol}日期未严格递增`)
      if (isSplitBundle) {
        const monthly = monthlySeries.find((row) => row.symbol === symbol)
        if (!monthly) errors.push(`缺少${symbol}月度概况序列`)
        else if (!Array.isArray(monthly.prices) || monthly.prices.length < 120)
          errors.push(`${symbol}月度概况少于120条`)
        else if (
          !ascendingDates(monthly.prices) ||
          new Set(monthly.prices.map((point) => point.date.slice(0, 7))).size !==
            monthly.prices.length
        )
          errors.push(`${symbol}月度概况日期无效或月份重复`)
        else {
          const dailyLast = item?.prices?.[item.prices.length - 1]
          const monthlyLast = monthly.prices[monthly.prices.length - 1]
          if (
            dailyLast?.date !== monthlyLast?.date ||
            (dailyLast?.adjClose ?? dailyLast?.close) !==
              (monthlyLast?.adjClose ?? monthlyLast?.close)
          )
            errors.push(`${symbol}月度概况未使用最新日线收盘`)
        }
      }
    }
    if (series.length !== expected.length) errors.push('核心资产行情序列数量不是4')
    const leaderSnapshots = Array.isArray(dataset.leaderSnapshots) ? dataset.leaderSnapshots : []
    const leaderComparisons = Array.isArray(dataset.leaderComparisons)
      ? dataset.leaderComparisons
      : []
    const productProfiles = Array.isArray(dataset.productProfiles) ? dataset.productProfiles : []
    if ((dataset.schemaVersion ?? 0) >= 4) {
      const profileIds = (dataset.schemaVersion ?? 0) >= 5 ? ['qqq', 'spy', 'gld'] : ['qqq', 'spy']
      if (productProfiles.length !== profileIds.length)
        errors.push(`官方产品概况数量不是${profileIds.length}`)
      if (new Set(productProfiles.map((profile) => profile.id)).size !== productProfiles.length)
        errors.push('官方产品概况ID重复')
      for (const id of profileIds) {
        const profile = productProfiles.find((item) => item.id === id)
        if (!profile) {
          errors.push(`缺少${id.toUpperCase()}官方产品概况`)
          continue
        }
        for (const [field, label] of [
          ['sourceAsOfDate', '产品概况'],
          ['netAssetsAsOfDate', '资产规模'],
          ['inceptionDate', '成立'],
        ]) {
          if (!/^\d{4}-\d{2}-\d{2}$/.test(profile[field] ?? ''))
            errors.push(`${id.toUpperCase()}${label}日期无效`)
          else if (field !== 'inceptionDate' && profile[field] > dataset.generatedAt?.slice(0, 10))
            errors.push(`${id.toUpperCase()}${label}日期晚于生成日期`)
        }
        if (!profile.sourceUrl?.startsWith('https://'))
          errors.push(`${id.toUpperCase()}产品概况来源无效`)
        if (!profile.sourceLabel?.trim()) errors.push(`${id.toUpperCase()}产品概况来源标签缺失`)
        if (!Number.isFinite(profile.expenseRatioPct) || profile.expenseRatioPct <= 0)
          errors.push(`${id.toUpperCase()}费率无效`)
        if (
          !Number.isFinite(profile.totalNetAssetsUsd) ||
          profile.totalNetAssetsUsd < 1_000_000_000
        )
          errors.push(`${id.toUpperCase()}资产规模无效`)
        if (id === 'gld') {
          if (!/^\d{4}-\d{2}-\d{2}$/.test(profile.goldHoldingsAsOfDate ?? ''))
            errors.push('GLD黄金持仓日期无效')
          else if (profile.goldHoldingsAsOfDate > dataset.generatedAt?.slice(0, 10))
            errors.push('GLD黄金持仓日期晚于生成日期')
          if (!Number.isFinite(profile.goldHoldingsTonnes) || profile.goldHoldingsTonnes < 100)
            errors.push('GLD黄金吨数无效')
          if (!Number.isFinite(profile.goldOuncesPerShare) || profile.goldOuncesPerShare <= 0)
            errors.push('GLD每份黄金盎司数无效')
          if (!profile.holdingsSourceUrl?.startsWith('https://')) errors.push('GLD黄金持仓来源无效')
        } else {
          if (!/^\d{4}-\d{2}-\d{2}$/.test(profile.holdingsCountAsOfDate ?? ''))
            errors.push(`${id.toUpperCase()}持仓数量日期无效`)
          else if (profile.holdingsCountAsOfDate > dataset.generatedAt?.slice(0, 10))
            errors.push(`${id.toUpperCase()}持仓数量日期晚于生成日期`)
          if (!Number.isInteger(profile.holdingsCount) || profile.holdingsCount < 50)
            errors.push(`${id.toUpperCase()}持仓数量无效`)
        }
        const product = dataset.products?.find((item) => item.id === id)
        if (
          !product ||
          product.feePct !== profile.expenseRatioPct ||
          product.inception !== profile.inceptionDate
        )
          errors.push(`${id.toUpperCase()}计算器产品参数未与官方概况同步`)
      }
    }
    if ((dataset.schemaVersion ?? 0) >= 2) {
      if (!leaderSnapshots.length) errors.push('缺少前瞻龙头持仓快照')
      for (const snapshot of leaderSnapshots) {
        if (!/^\d{4}-\d{2}$/.test(snapshot.period ?? '')) errors.push('龙头快照月份无效')
        if (!Number.isFinite(new Date(snapshot.capturedAt).valueOf()))
          errors.push('龙头快照归档时间无效')
        if (snapshot.status !== 'archived') errors.push('龙头快照状态不是archived')
        if (!Array.isArray(snapshot.indexes) || snapshot.indexes.length !== 2) {
          errors.push(`${snapshot.period ?? '未知月份'}龙头指数数量不是2`)
          continue
        }
        for (const index of snapshot.indexes) {
          const leaders = Array.isArray(index.leaders) ? index.leaders : []
          if (!['qqq', 'sp500'].includes(index.id)) errors.push('龙头快照指数ID无效')
          if (!/^\d{4}-\d{2}-\d{2}$/.test(index.holdingsAsOfDate ?? ''))
            errors.push(`${index.id ?? '未知指数'}持仓截止日无效`)
          if (index.holdingsAsOfDate > snapshot.capturedAt?.slice(0, 10))
            errors.push(`${index.id ?? '未知指数'}持仓日期晚于归档日期`)
          if (!index.sourceUrl?.startsWith('https://'))
            errors.push(`${index.id ?? '未知指数'}来源无效`)
          if (leaders.length !== 10) errors.push(`${index.id ?? '未知指数'}龙头数量不是10`)
          if (new Set(leaders.map((leader) => leader.ticker)).size !== leaders.length)
            errors.push(`${index.id ?? '未知指数'}龙头代码重复`)
          if (
            leaders.some(
              (leader, position) =>
                leader.rank !== position + 1 ||
                !Number.isFinite(leader.weightPct) ||
                leader.weightPct <= 0 ||
                (position > 0 && leader.weightPct > leaders[position - 1].weightPct),
            )
          )
            errors.push(`${index.id ?? '未知指数'}龙头排名或权重无效`)
          if ((dataset.schemaVersion ?? 0) >= 3) {
            const sectors = Array.isArray(index.sectors) ? index.sectors : []
            if (!/^\d{4}-\d{2}-\d{2}$/.test(index.sectorAsOfDate ?? ''))
              errors.push(`${index.id ?? '未知指数'}行业截止日无效`)
            if (index.sectorAsOfDate > snapshot.capturedAt?.slice(0, 10))
              errors.push(`${index.id ?? '未知指数'}行业日期晚于归档日期`)
            if (!index.sectorSourceUrl?.startsWith('https://'))
              errors.push(`${index.id ?? '未知指数'}行业来源无效`)
            if (!index.sectorSystem) errors.push(`${index.id ?? '未知指数'}行业体系缺失`)
            if (index.id === 'qqq' && (sectors.length < 9 || sectors.length > 11))
              errors.push('QQQ行业数量异常')
            if (index.id === 'sp500' && sectors.length !== 11) errors.push('SPY行业数量不是11')
            if (new Set(sectors.map((sector) => sector.name)).size !== sectors.length)
              errors.push(`${index.id ?? '未知指数'}行业名称重复`)
            const sectorWeight = sectors.reduce(
              (total, sector) => total + (sector.weightPct ?? 0),
              0,
            )
            if (sectorWeight < 99 || sectorWeight > 101)
              errors.push(`${index.id ?? '未知指数'}行业权重不在99%到101%之间`)
            if (
              sectors.some(
                (sector, sectorIndex) =>
                  !Number.isFinite(sector.weightPct) ||
                  sector.weightPct <= 0 ||
                  (sectorIndex > 0 && sector.weightPct > sectors[sectorIndex - 1].weightPct),
              )
            )
              errors.push(`${index.id ?? '未知指数'}行业权重顺序无效`)
          }
        }
      }
      if (leaderComparisons.length !== Math.max(0, leaderSnapshots.length - 1))
        errors.push('龙头闭合持有期数量与相邻快照不一致')
      leaderComparisons.forEach((comparison, position) => {
        const previousSnapshot = leaderSnapshots[position]
        const nextSnapshot = leaderSnapshots[position + 1]
        if (
          comparison.fromPeriod !== previousSnapshot?.period ||
          comparison.toPeriod !== nextSnapshot?.period
        )
          errors.push('龙头闭合持有期未与相邻快照对应')
        if (comparison.status !== 'complete') errors.push('龙头持有期状态不是complete')
        if (!Number.isFinite(comparison.roundTripCostPct) || comparison.roundTripCostPct < 0)
          errors.push('龙头持有期成本假设无效')
        if (!Array.isArray(comparison.indexes) || comparison.indexes.length !== 2)
          errors.push('龙头持有期指数数量不是2')
        for (const index of comparison.indexes ?? []) {
          if (!/^\d{4}-\d{2}-\d{2}$/.test(index.startDate ?? ''))
            errors.push('龙头持有期开始日无效')
          if (!/^\d{4}-\d{2}-\d{2}$/.test(index.endDate ?? '') || index.endDate <= index.startDate)
            errors.push('龙头持有期结束日无效')
          if (!Array.isArray(index.strategies) || index.strategies.length !== 8)
            errors.push(`${index.id ?? '未知指数'}龙头策略数量不是8`)
        }
      })
    }
    facts.push(
      ['产品', dataset.products?.length ?? 0],
      ['行情序列', series.length],
      ['月度概况序列', monthlySeries.length],
      ['龙头归档期', leaderSnapshots.length],
      ['龙头闭合期', leaderComparisons.length],
      ['官方产品概况', productProfiles.length],
      ['价格记录', series.map((row) => `${row.symbol}:${row.prices?.length ?? 0}`).join(' · ')],
    )
  } else if (kind === 'hot-stocks') {
    for (const key of ['aShare', 'us']) {
      const market = dataset.markets?.[key]
      if (market?.status !== 'ok') errors.push(`${key}热点状态不是ok`)
      if (!Array.isArray(market?.daily) || market.daily.length < 20)
        errors.push(`${key}日榜少于20条`)
      if (!Array.isArray(market?.weekly) || market.weekly.length < 20)
        errors.push(`${key}周榜少于20条`)
    }
    facts.push(
      [
        'A股日榜/周榜',
        `${dataset.markets?.aShare?.daily?.length ?? 0}/${dataset.markets?.aShare?.weekly?.length ?? 0}`,
      ],
      [
        '美股日榜/周榜',
        `${dataset.markets?.us?.daily?.length ?? 0}/${dataset.markets?.us?.weekly?.length ?? 0}`,
      ],
    )
  } else if (kind === 'us-megacaps') {
    if (dataset.status !== 'ok') errors.push('龙头估值状态不是ok')
    if (!Array.isArray(dataset.stocks) || dataset.stocks.length !== 10)
      errors.push('龙头股票数量不是10')
    const symbols = new Set(dataset.stocks?.map((stock) => stock.symbol))
    if (symbols.size !== dataset.stocks?.length) errors.push('龙头股票代码存在重复')
    if (
      dataset.stocks?.some(
        (stock) => !Number.isFinite(stock.marketCapUsd) || stock.marketCapUsd <= 0,
      )
    )
      errors.push('存在无效市值')
    facts.push(['龙头股票', dataset.stocks?.length ?? 0], ['唯一代码', symbols.size])
  } else if (kind === 'us-technicals') {
    const assets = Array.isArray(dataset.assets) ? dataset.assets : []
    if (assets.length < 8) errors.push('技术行情资产少于8个')
    for (const asset of assets) {
      if (!Array.isArray(asset.points) || asset.points.length < 200)
        errors.push(`${asset.series ?? '未知资产'}日线少于200条`)
      else if (!ascendingDates(asset.points)) errors.push(`${asset.series}日期未严格递增`)
      assertRecentDate(asset.date, now, 7, asset.series ?? '未知资产', errors)
    }
    facts.push(
      ['技术行情资产', assets.length],
      ['最新行情', assets.map((asset) => `${asset.series}:${asset.date}`).join(' · ')],
    )
  } else if (kind === 'option-market') {
    const symbols = Array.isArray(dataset.symbols) ? dataset.symbols : []
    if (symbols.length !== 10) errors.push('期权标的数量不是10')
    if (!['ok', 'partial', 'unavailable'].includes(dataset.status)) errors.push('期权状态无效')
    if (dataset.configurationStatus === 'configured' && dataset.status === 'unavailable')
      errors.push('已配置期权数据源但没有任何可用数据')
    facts.push(
      ['期权标的', symbols.length],
      ['状态', dataset.status ?? '—'],
      [
        '可用/部分可用',
        `${symbols.filter((item) => item.status === 'ok').length}/${symbols.filter((item) => item.status === 'partial').length}`,
      ],
    )
  } else if (kind === 'market-news') {
    const articles = Array.isArray(dataset.articles) ? dataset.articles : []
    const sourceStatus = Array.isArray(dataset.sourceStatus) ? dataset.sourceStatus : []
    const healthySources = sourceStatus.filter((source) => source.status === 'ok')
    if (articles.length < 10) errors.push('市场新闻少于10条')
    if (healthySources.length < 3) errors.push('可用新闻源少于3个')
    if (
      !healthySources.some((source) => ['美联储', '欧洲央行', '美国证监会'].includes(source.source))
    )
      errors.push('没有可用的官方新闻源')
    const ids = new Set()
    const urls = new Set()
    for (const article of articles) {
      if (!article.id || ids.has(article.id)) errors.push('新闻ID缺失或重复')
      if (!article.url || urls.has(article.url)) errors.push('新闻链接缺失或重复')
      ids.add(article.id)
      urls.add(article.url)
      if (!article.title?.trim()) errors.push(`${article.id ?? '未知新闻'}标题为空`)
      const publishedAt = Date.parse(article.publishedAt)
      if (!Number.isFinite(publishedAt)) errors.push(`${article.id ?? '未知新闻'}发布时间无效`)
      else {
        const ageMs = now.getTime() - publishedAt
        if (ageMs > 49 * 60 * 60 * 1000) errors.push(`${article.id}发布时间超过49小时`)
        if (ageMs < -10 * 60 * 1000) errors.push(`${article.id}发布时间超过当前时间10分钟`)
      }
    }
    facts.push(
      ['新闻/唯一链接', `${articles.length}/${urls.size}`],
      ['可用来源', `${healthySources.length}/${sourceStatus.length}`],
      ['官方新闻', articles.filter((article) => article.sourceType === 'official').length],
    )
  } else if (kind === 'kol-monitor') {
    const kols = Array.isArray(dataset.kols) ? dataset.kols : []
    const usable = kols.filter(
      (kol) => ['ok', 'partial', 'stale'].includes(kol.status) && kol.items?.length,
    )
    if (kols.length < 3) errors.push('KOL数量少于3个')
    if (usable.length < Math.ceil(kols.length / 2)) errors.push('有内容的可用KOL不足一半')
    const ids = new Set(kols.map((kol) => kol.id))
    const urls = new Set(kols.map((kol) => kol.url))
    if (ids.size !== kols.length || ids.has(undefined)) errors.push('KOL ID缺失或重复')
    if (urls.size !== kols.length || urls.has(undefined)) errors.push('KOL链接缺失或重复')
    for (const kol of kols) {
      if (!['ok', 'partial', 'stale', 'failed'].includes(kol.status))
        errors.push(`${kol.name ?? kol.id ?? '未知KOL'}状态无效`)
      const itemUrls = (kol.items ?? []).map((item) => item.url).filter(Boolean)
      if (new Set(itemUrls).size !== itemUrls.length)
        errors.push(`${kol.name ?? kol.id}内容链接重复`)
      if ((kol.items ?? []).some((item) => !item.title?.trim() || !item.url))
        errors.push(`${kol.name ?? kol.id}存在标题或链接缺失的内容`)
    }
    facts.push(
      ['KOL/有内容可用', `${kols.length}/${usable.length}`],
      ['同步状态', kols.map((kol) => `${kol.name}:${kol.status}`).join(' · ')],
    )
  } else if (kind === 'technical-funds') {
    const assets = Array.isArray(dataset.assets) ? dataset.assets : []
    if (assets.length !== 12) errors.push('技术基金资产数量不是12')
    const ids = new Set(assets.map((asset) => asset.id))
    if (ids.size !== assets.length || ids.has(undefined)) errors.push('技术基金ID缺失或重复')
    for (const asset of assets) {
      if (!Array.isArray(asset.points) || asset.points.length < 200)
        errors.push(`${asset.series ?? '未知基金'}历史少于200条`)
      else if (!ascendingDates(asset.points)) errors.push(`${asset.series}日期未严格递增`)
      assertRecentDate(asset.date, now, 7, asset.series ?? '未知基金', errors)
    }
    facts.push(
      ['技术基金', assets.length],
      [
        '历史记录',
        assets.map((asset) => `${asset.series}:${asset.points?.length ?? 0}`).join(' · '),
      ],
    )
  } else if (kind === 'norway-fund') {
    const summary = dataset.summary ?? {}
    const allocation = Array.isArray(dataset.assetAllocation) ? dataset.assetAllocation : []
    const sectors = Array.isArray(dataset.equitySectors) ? dataset.equitySectors : []
    const regions = Array.isArray(dataset.equityRegions) ? dataset.equityRegions : []
    const holdings = Array.isArray(dataset.topHoldings) ? dataset.topHoldings : []
    const fixedIncome = Array.isArray(dataset.fixedIncome) ? dataset.fixedIncome : []
    if (dataset.status !== 'complete') errors.push('挪威基金快照状态不是complete')
    if (!/^\d{4}-\d{2}-\d{2}$/.test(summary.asOfDate ?? '')) errors.push('报告日期无效')
    if (!/^\d{4}-\d{2}-\d{2}$/.test(summary.publishedDate ?? '')) errors.push('发布日期无效')
    if (!Number.isFinite(summary.valueBillionNok) || summary.valueBillionNok < 1_000)
      errors.push('基金规模无效')
    if (!Number.isFinite(summary.listedCompanies) || summary.listedCompanies < 5_000)
      errors.push('股票发行人数量异常')
    if (allocation.length !== 4) errors.push('一级资产配置数量不是4')
    const allocationWeight = allocation.reduce((sum, item) => sum + (item.weightPct ?? 0), 0)
    if (allocationWeight < 99 || allocationWeight > 101)
      errors.push('一级资产配置权重不在99%到101%之间')
    if (sectors.length !== 11) errors.push('股票行业数量不是11')
    const regionAvailability = dataset.availability?.equityRegions
    if (regionAvailability === 'reported' && regions.length !== 4)
      errors.push('已报告区域数据的数量不是4')
    if (regionAvailability === 'not-reported' && regions.length !== 0)
      errors.push('未报告区域数据时不应生成推算值')
    if (!['reported', 'not-reported'].includes(regionAvailability))
      errors.push('股票区域可用性标记无效')
    if (fixedIncome.length !== 5) errors.push('固定收益分类数量不是5')
    if (holdings.length !== 10) errors.push('十大持仓数量不是10')
    if (new Set(holdings.map((item) => item.company)).size !== holdings.length)
      errors.push('十大持仓公司存在重复')
    if (
      holdings.some(
        (item, index) =>
          item.rank !== index + 1 ||
          !Number.isFinite(item.marketValueBillionNok) ||
          (index > 0 && item.marketValueBillionNok > holdings[index - 1].marketValueBillionNok),
      )
    )
      errors.push('十大持仓排名或市值顺序无效')
    if (!dataset.sources?.report?.startsWith('https://www.nbim.no/'))
      errors.push('报告来源不是NBIM官方地址')
    if (!dataset.sources?.holdingsApi?.startsWith('https://www.nbim.no/api/investments/v2/'))
      errors.push('持仓来源不是NBIM官方接口')
    facts.push(
      ['报告期/发布日期', `${summary.periodLabel ?? '—'} / ${summary.publishedDate ?? '—'}`],
      ['基金规模', `${summary.valueBillionNok ?? 0} 十亿 NOK`],
      ['股票发行人/十大持仓', `${summary.listedCompanies ?? 0}/${holdings.length}`],
      [
        '配置/行业/区域/固收',
        `${allocation.length}/${sectors.length}/${regions.length}/${fixedIncome.length}`,
      ],
    )
  } else {
    errors.push(`未知数据类型: ${kind}`)
  }

  return { ok: errors.length === 0, kind, errors, facts }
}

export const formatSummary = (result, file) =>
  [
    `## ${result.ok ? '✅' : '❌'} 市场数据门禁 · ${result.kind}`,
    '',
    `文件：\`${file}\``,
    '',
    '| 指标 | 值 |',
    '| --- | --- |',
    ...result.facts.map(([label, value]) => `| ${label} | ${value} |`),
    ...(result.errors.length
      ? ['', '### 阻止提交的原因', '', ...result.errors.map((error) => `- ${error}`)]
      : []),
    '',
  ].join('\n')

const isCli = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isCli) {
  const [, , kind, file, relatedFile] = process.argv
  if (!kind || !file)
    throw new Error('用法: node scripts/validate-market-dataset.mjs <kind> <file>')
  const dataset = JSON.parse(await readFile(resolve(file), 'utf8'))
  const related =
    kind === 'us-indexes' && relatedFile
      ? { dailyDataset: JSON.parse(await readFile(resolve(relatedFile), 'utf8')) }
      : {}
  const result = validateDataset(kind, dataset, new Date(), related)
  const summary = formatSummary(result, file)
  process.stdout.write(`${summary}\n`)
  if (process.env.GITHUB_STEP_SUMMARY)
    await appendFile(process.env.GITHUB_STEP_SUMMARY, `${summary}\n`)
  if (!result.ok) process.exitCode = 1
}
