import type { CalendarEvent, CalendarEventType } from '@/types/event-calendar'

export const macroCalendarCheckedAt = '2026-09-26'
export const macroCalendarCoverageEnd = '2026-11-30'
const fed = 'https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm'
const bea = 'https://www.bea.gov/news/schedule'
const affectedAssets = [
  'sp500',
  'nasdaq',
  'us2y',
  'us10y',
  'us30y',
  'real10y',
  'usd',
  'vix',
  'gold',
  'btc',
  'eth',
]

const release = (
  type: CalendarEventType,
  date: string,
  title: string,
  titleEn: string,
  source: string,
  sourceUrl: string,
): CalendarEvent => ({
  id: `${type}-${date}`,
  type,
  title,
  titleEn,
  date,
  time: '08:30',
  status: 'scheduled',
  certainty: 'official',
  source,
  sourceUrl,
  checkedAt: macroCalendarCheckedAt,
  assetIds: affectedAssets,
  details: '官方计划日程，时间为美国东部时间；日程可能调整，未接入发布值。',
  detailsEn:
    'Official schedule in US Eastern Time. Dates may change; release values are not included.',
})

// Manually verified against the linked official calendars; see docs/event-calendar.md.
export const macroCalendarEvents: CalendarEvent[] = [
  release(
    'gdp',
    '2026-09-30',
    '美国 GDP · 2026 Q2 第三次估计',
    'US GDP · Q2 2026, third estimate',
    'BEA',
    bea,
  ),
  release(
    'pce',
    '2026-09-30',
    '美国个人收入与支出 / PCE · 2026年8月',
    'US income and outlays / PCE · August 2026',
    'BEA',
    bea,
  ),
  release(
    'employment',
    '2026-10-02',
    '美国就业报告 · 2026年9月',
    'US Employment Situation · September 2026',
    'BLS',
    'https://www.bls.gov/schedule/2026/10_sched.htm',
  ),
  release(
    'inflation',
    '2026-10-14',
    '美国 CPI · 2026年9月',
    'US CPI · September 2026',
    'BLS',
    'https://www.bls.gov/schedule/2026/10_sched.htm',
  ),
  {
    ...release(
      'fomc',
      '2026-10-28',
      'FOMC 会议结束日 · 10月27–28日会议',
      'FOMC meeting concludes · October 27–28',
      'Federal Reserve',
      fed,
    ),
    time: null,
    details: '官方会期已核验。本条仅记录会议结束日期，未核实本次声明具体发布时间，不填入惯例时间。',
    detailsEn:
      'Meeting dates verified. This is the final meeting date; the statement release time has not been independently confirmed.',
  },
  release(
    'gdp',
    '2026-10-29',
    '美国 GDP · 2026 Q3 初次估计',
    'US GDP · Q3 2026, advance estimate',
    'BEA',
    bea,
  ),
  release(
    'pce',
    '2026-10-29',
    '美国个人收入与支出 / PCE · 2026年9月',
    'US income and outlays / PCE · September 2026',
    'BEA',
    bea,
  ),
  release(
    'employment',
    '2026-11-06',
    '美国就业报告 · 2026年10月',
    'US Employment Situation · October 2026',
    'BLS',
    'https://www.bls.gov/schedule/2026/11_sched.htm',
  ),
  release(
    'inflation',
    '2026-11-10',
    '美国 CPI · 2026年10月',
    'US CPI · October 2026',
    'BLS',
    'https://www.bls.gov/schedule/2026/11_sched.htm',
  ),
  release(
    'gdp',
    '2026-11-25',
    '美国 GDP · 2026 Q3 第二次估计',
    'US GDP · Q3 2026, second estimate',
    'BEA',
    bea,
  ),
  release(
    'pce',
    '2026-11-25',
    '美国个人收入与支出 / PCE · 2026年10月',
    'US income and outlays / PCE · October 2026',
    'BEA',
    bea,
  ),
]
