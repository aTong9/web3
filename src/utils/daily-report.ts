import type {
  CrossAssetDataset,
  DailyMarketReport,
  DailyReportConfig,
  MarketHomeDataset,
} from '@/types'

type TranslateFn = (key: string, params?: Record<string, string | number>) => string

const directionName = (value: 'bullish' | 'bearish', t: TranslateFn) =>
  value === 'bullish' ? t('direction.bullish') : t('direction.bearish')

const formatMove = (value: number | null) => (value === null ? '—' : `${value > 0 ? '+' : ''}${value.toFixed(2)}%`)
const formatSignal = (value: number | null) => (value === null ? '—' : `ρ ${value.toFixed(2)}`)
const truncate = (value: string, limit: number) => {
  const chars = Array.from(value)
  return chars.length <= limit ? value : `${chars.slice(0, limit - 1).join('')}…`
}

export const buildDailyMarketReport = (
  home: MarketHomeDataset,
  crossAsset: CrossAssetDataset,
  config: DailyReportConfig,
  t: TranslateFn,
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
          `- ${outlook.label}：${directionName(outlook.direction, t)}｜${t('report.conditionProbability', { value: outlook.upProbabilityPct.toFixed(1) })}｜${outlook.validated ? t('report.validationPassed') : t('report.validationWatch')}`,
      )
      .join('\n')

    const drivers = market.drivers.length
      ? market.drivers
          .map((driver) => `- ${driver.effect === 'tailwind' ? t('report.driverTailwind') : t('report.driverHeadwind')}：${driver.text}`)
          .join('\n')
      : `- ${t('report.noDrivers')}`

    return `${t('report.marketPrefix')} ${market.name} ${formatMove(market.dailyMove)}\n\n${horizons}\n\n${t('report.driverTitle')}：\n${drivers}`
  })

  const chainLines = chains.length
    ? chains
        .map(
          (chain) =>
            `- **${chain.title}**｜${formatSignal(chain.signal)}｜${chain.steps.join(' → ')}｜${chain.interpretation}`,
        )
        .join('\n')
    : `- ${t('report.noChain')}`

  const author = config.authorName ? `\n\n${t('report.authorSuffix')} ${config.authorName}` : ''
  const disclaimer = config.includeDisclaimer
    ? `\n\n> ${t('report.disclaimer')}`
    : ''

  const markdown = `${t('report.mdTitle')} ${title}\n\n## ${t('report.sectionStatus')}\n\n**${home.marketBrief.regime.title}**\n\n${home.marketBrief.regime.summary}\n\n- ${t('report.rateRegime')} ${home.marketBrief.rateRegime.title}。${home.marketBrief.rateRegime.summary}\n- ${t('report.mktBreadth')} ${home.marketBrief.breadth.title}。${home.marketBrief.breadth.summary}\n\n## ${t('report.sectionMarkets')}\n\n${marketSections.join('\n\n')}\n\n## ${t('report.sectionChains')}\n\n${chainLines}\n\n${t('report.dataDate')}：${asOfDate}${t('report.updatedAtPrefix')}${home.updatedAt}${author}${disclaimer}\n`

  const lead = markets[0]
  const leadHorizons = lead
    ? lead.horizonOutlooks
        .map((outlook) => `${outlook.label.replace('未来', '')}${directionName(outlook.direction, t)}`)
        .join(' / ')
    : t('report.unknownMarket')

  const strongestChain = chains[0]
    ? `${chains[0].title} ${formatSignal(chains[0].signal)}`
    : t('report.noChainSelected')
  const account = config.xHandle ? ` @${config.xHandle}` : ''
  const socialText = truncate(
    `${asOfDate} ${t('report.socialTitle')}｜${home.marketBrief.regime.title}\n${lead?.name ?? t('report.marketFallback')}：${formatMove(lead?.dailyMove ?? null)}，${leadHorizons}\n${t('report.socialTransmission')}：${strongestChain}\n${t('report.disclaimerShort')}${account}`,
    280,
  )

  return { title, asOfDate, markdown, socialText, emailSubject: title }
}
