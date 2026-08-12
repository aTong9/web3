import type { ContractInstrumentCategory, ContractInstrumentRiskTag } from '@/types'

interface ContractInstrumentMetadata {
  displayName: string
  category: ContractInstrumentCategory
  underlyingVenue: string | null
  riskTags: ContractInstrumentRiskTag[]
}

const equity = (
  displayName: string,
  underlyingVenue: string,
  extraRisks: ContractInstrumentRiskTag[] = [],
): ContractInstrumentMetadata => ({
  displayName,
  category: 'equity',
  underlyingVenue,
  riskTags: ['underlyingSession', ...extraRisks],
})

const etf = (
  displayName: string,
  underlyingVenue: string,
  extraRisks: ContractInstrumentRiskTag[] = [],
): ContractInstrumentMetadata => ({
  displayName,
  category: 'etf',
  underlyingVenue,
  riskTags: ['underlyingSession', ...extraRisks],
})

const commodity = (displayName: string): ContractInstrumentMetadata => ({
  displayName,
  category: 'commodity',
  underlyingVenue: 'GLOBAL',
  riskTags: ['commodityBasis'],
})

const metadataByBase: Record<string, ContractInstrumentMetadata> = {
  AAPL: equity('Apple Inc.', 'NASDAQ'),
  AMZN: equity('Amazon.com, Inc.', 'NASDAQ'),
  AVGO: equity('Broadcom Inc.', 'NASDAQ'),
  BABA: equity('Alibaba Group ADR', 'NYSE'),
  COIN: equity('Coinbase Global, Inc.', 'NASDAQ'),
  CRCL: equity('Circle Internet Group, Inc.', 'NYSE'),
  GOOGL: equity('Alphabet Inc.', 'NASDAQ'),
  HOOD: equity('Robinhood Markets, Inc.', 'NASDAQ'),
  INTC: equity('Intel Corporation', 'NASDAQ'),
  META: equity('Meta Platforms, Inc.', 'NASDAQ'),
  MSFT: equity('Microsoft Corporation', 'NASDAQ'),
  MSTR: equity('Strategy Inc.', 'NASDAQ'),
  MU: equity('Micron Technology, Inc.', 'NASDAQ'),
  NVDA: equity('NVIDIA Corporation', 'NASDAQ'),
  PAYP: equity('PayPay Corporation', 'NASDAQ'),
  PLTR: equity('Palantir Technologies Inc.', 'NASDAQ'),
  POPMART: equity('Pop Mart International', 'HKEX', ['regionalMarket']),
  SKHYNIX: equity('SK Hynix Inc.', 'KRX', ['regionalMarket']),
  SNDK: equity('Sandisk Corporation', 'NASDAQ'),
  TSLA: equity('Tesla, Inc.', 'NASDAQ'),
  TSM: equity('Taiwan Semiconductor ADR', 'NYSE'),
  BITO: etf('ProShares Bitcoin Strategy ETF', 'NYSE ARCA', ['futuresUnderlying']),
  EWJ: etf('iShares MSCI Japan ETF', 'NYSE ARCA'),
  EWY: etf('iShares MSCI South Korea ETF', 'NYSE ARCA'),
  QQQ: etf('Invesco QQQ Trust', 'NASDAQ'),
  SPY: etf('SPDR S&P 500 ETF Trust', 'NYSE ARCA'),
  TBT: etf('ProShares UltraShort 20+ Year Treasury', 'NYSE ARCA', [
    'leveragedUnderlying',
    'inverseUnderlying',
  ]),
  TMF: etf('Direxion Daily 20+ Year Treasury Bull 3X', 'NYSE ARCA', ['leveragedUnderlying']),
  CL: commodity('WTI Crude Oil'),
  COPPER: commodity('Copper'),
  XAG: commodity('Silver'),
  XAU: commodity('Gold'),
  XPD: commodity('Palladium'),
  XPT: commodity('Platinum'),
}

export const verifiedFallbackBases = {
  equity: Object.keys(metadataByBase).filter(
    (baseAsset) => metadataByBase[baseAsset]?.category === 'equity',
  ),
  etf: Object.keys(metadataByBase).filter(
    (baseAsset) => metadataByBase[baseAsset]?.category === 'etf',
  ),
  commodity: Object.keys(metadataByBase).filter(
    (baseAsset) => metadataByBase[baseAsset]?.category === 'commodity',
  ),
} satisfies Record<'equity' | 'etf' | 'commodity', string[]>

export const resolveContractInstrumentMetadata = (
  baseAsset: string,
  category: ContractInstrumentCategory,
): ContractInstrumentMetadata => {
  const metadata = metadataByBase[baseAsset]
  if (metadata) return metadata
  return {
    displayName: baseAsset,
    category,
    underlyingVenue: null,
    riskTags:
      category === 'equity' || category === 'etf'
        ? ['underlyingSession']
        : category === 'commodity'
          ? ['commodityBasis']
          : [],
  }
}
