import type {
  CrossAssetDataset,
  DailyMarketReport,
  DailyReportConfig,
  MarketHomeDataset,
} from '@/types'

const directionName = (value: 'bullish' | 'bearish') => (value === 'bullish' ? '偏涨' : '偏跌')
const formatMove = (value: number | null) =>
  value === null ? '—' : `${value > 0 ? '+' : ''}${value.toFixed(2)}%`
const formatSignal = (value: number | null) => (value === null ? '—' : `ρ ${value.toFixed(2)}`)
const truncate = (value: string, limit: number) => {
  const chars = Array.from(value)
  return chars.length <= limit ? value : `${chars.slice(0, limit - 1).join('')}…`
}

export const buildDailyMarketReport = (
  home: MarketHomeDataset,
  crossAsset: CrossAssetDataset,
  config: DailyReportConfig,
): DailyMarketReport => {
  const asOfDate = home.marketBrief.asOfDate ?? home.updatedAt.slice(0, 10)
  const title = `${asOfDate} ${config.titlePrefix}`
  const markets = home.marketBrief.markets.filter((market) =>
    config.selectedMarketIds.includes(market.id),
  )
  const chains = [...crossAsset.transmissionChains]
    .filter((chain) => chain.status === 'confirming' && chain.signal !== null)
    .sort((left, right) => Math.abs(right.signal ?? 0) - Math.abs(left.signal ?? 0))
    .slice(0, config.chainCount)

  const marketSections = markets.map((market) => {
    const horizons = market.horizonOutlooks
      .map(
        (outlook) =>
          `- ${outlook.label}：${directionName(outlook.direction)}｜上涨条件频率 ${outlook.upProbabilityPct.toFixed(1)}%｜${outlook.validated ? '留出验证通过' : '观察信号'}`,
      )
      .join('\n')
    const drivers = market.drivers.length
      ? market.drivers.map((driver) => `- ${driver.effect === 'tailwind' ? '顺风' : '逆风'}：${driver.text}`).join('\n')
      : '- 当前没有足够强且稳定的跨资产共振因子。'
    return `### ${market.name} ${formatMove(market.dailyMove)}\n\n${horizons}\n\n主要因素：\n${drivers}`
  })

  const chainLines = chains.length
    ? chains
        .map(
          (chain) =>
            `- **${chain.title}**｜${formatSignal(chain.signal)}｜${chain.steps.join(' → ')}｜${chain.interpretation}`,
        )
        .join('\n')
    : '- 当前没有处于确认状态的强传导链。'

  const author = config.authorName ? `\n\n发布：${config.authorName}` : ''
  const disclaimer = config.includeDisclaimer
    ? '\n\n> 本报告仅整理系统已经生成的跨资产因子与规则模型结果，不构成投资建议。相关性不代表因果，偏涨/偏跌不是确定预测。'
    : ''
  const markdown = `# ${title}\n\n## 今日市场状态\n\n**${home.marketBrief.regime.title}**\n\n${home.marketBrief.regime.summary}\n\n- 利率环境：${home.marketBrief.rateRegime.title}。${home.marketBrief.rateRegime.summary}\n- 市场广度：${home.marketBrief.breadth.title}。${home.marketBrief.breadth.summary}\n\n## 主要市场与未来方向\n\n${marketSections.join('\n\n')}\n\n## 当前确认的市场传导链\n\n${chainLines}\n\n数据日期：${asOfDate}｜系统更新：${home.updatedAt}${author}${disclaimer}\n`

  const lead = markets[0]
  const leadHorizons = lead
    ? lead.horizonOutlooks
        .map((outlook) => `${outlook.label.replace('未来', '')}${directionName(outlook.direction)}`)
        .join(' / ')
    : '未选择市场'
  const strongestChain = chains[0]
    ? `${chains[0].title} ${formatSignal(chains[0].signal)}`
    : '暂无确认传导链'
  const account = config.xHandle ? ` @${config.xHandle}` : ''
  const socialText = truncate(
    `${asOfDate} 市场日报｜${home.marketBrief.regime.title}\n${lead?.name ?? '市场'}：${formatMove(lead?.dailyMove ?? null)}，${leadHorizons}\n传导：${strongestChain}\n仅为规则模型观察，不构成投资建议。${account}`,
    280,
  )

  return { title, asOfDate, markdown, socialText, emailSubject: title }
}
