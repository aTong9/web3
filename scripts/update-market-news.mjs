import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { translateNewsTitle, translationProvider } from './lib/news-translator.mjs'

const outputPath = new URL('../src/data/market-news.json', import.meta.url)
const userAgent = 'web3-market-monitor/1.0 (+https://github.com/aTong9/web3)'

const topics = [
  [
    'global',
    '(inflation OR "interest rate" OR sanctions OR tariff OR war OR stocks OR earnings OR bankruptcy OR oil OR OPEC OR gold OR semiconductor OR antitrust)',
  ],
]

const officialFeeds = [
  ['美联储', 'https://www.federalreserve.gov/feeds/press_all.xml', 'macro'],
  ['欧洲央行', 'https://www.ecb.europa.eu/rss/press.html', 'macro'],
  ['美国证监会', 'https://www.sec.gov/news/pressreleases.rss', 'equities'],
]

const mediaFeeds = [
  ['CNBC', 'https://www.cnbc.com/id/100003114/device/rss/rss.html', 'global'],
  ['华尔街日报', 'https://feeds.a.dj.com/rss/RSSMarketsMain.xml', 'global'],
]

const decodeXml = (value = '') =>
  value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()

const extractTag = (xml, tag) => {
  const match = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i'))
  return decodeXml(match?.[1] ?? '')
}

const fetchText = async (url) => {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch(url, { headers: { 'user-agent': userAgent } })
    if (response.ok) return response.text()
    if (response.status !== 429 || url.includes('gdeltproject.org') || attempt === 2)
      throw new Error(`${response.status} ${url}`)
    await new Promise((resolve) => setTimeout(resolve, (attempt + 1) * 4000))
  }
  throw new Error(`Unable to fetch ${url}`)
}

const parseGdeltDate = (value) => {
  const match = value?.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/)
  return match ? `${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${match[6]}Z` : null
}

const classifyCategory = (title) => {
  if (/war|attack|sanction|tariff|blockade|coup/i.test(title)) return 'geopolitics'
  if (/oil|opec|gold|copper|gas|shipping/i.test(title)) return 'commodities'
  if (/semiconductor|artificial intelligence|\bai\b|antitrust|export control/i.test(title))
    return 'technology'
  if (/stock|share|earnings|bankruptcy|default|merger|acquisition/i.test(title)) return 'equities'
  return 'macro'
}

const fetchGdelt = async ([category, query]) => {
  const params = new URLSearchParams({
    query,
    mode: 'ArtList',
    maxrecords: '50',
    format: 'json',
    sort: 'DateDesc',
    timespan: '24h',
  })
  const payload = JSON.parse(
    await fetchText(`https://api.gdeltproject.org/api/v2/doc/doc?${params.toString()}`),
  )
  return (payload.articles ?? []).map((article) => ({
    title: article.title,
    url: article.url,
    publishedAt: parseGdeltDate(article.seendate),
    source: article.domain,
    sourceType: 'media',
    category: category === 'global' ? classifyCategory(article.title) : category,
    language: article.language || null,
  }))
}

const fetchOfficialFeed = async ([source, url, category]) => {
  const xml = await fetchText(url)
  return [...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)].slice(0, 30).map((match) => {
    const item = match[1]
    const publishedAt = extractTag(item, 'pubDate') || extractTag(item, 'dc:date')
    return {
      title: extractTag(item, 'title'),
      url: extractTag(item, 'link'),
      publishedAt: publishedAt ? new Date(publishedAt).toISOString() : null,
      source,
      sourceType: 'official',
      category: category === 'global' ? classifyCategory(extractTag(item, 'title')) : category,
      language: 'English',
    }
  })
}

const fetchMediaFeed = async ([feedName, url, category]) => {
  const xml = await fetchText(url)
  return [...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)].slice(0, 30).map((match) => {
    const item = match[1]
    const publishedAt = extractTag(item, 'pubDate')
    return {
      title: extractTag(item, 'title').replace(/\s+-\s+[^-]+$/, ''),
      url: extractTag(item, 'link'),
      publishedAt: publishedAt ? new Date(publishedAt).toISOString() : null,
      source: extractTag(item, 'source') || feedName,
      sourceType: 'media',
      category,
      language: 'English',
    }
  })
}

const impactRules = [
  [
    5,
    /rate decision|emergency|invasion|sovereign default|bank run|capital control|trading halt|nuclear|coup/i,
  ],
  [
    3,
    /inflation|\bcpi\b|payroll|sanction|tariff|opec|export ban|bankruptcy|profit warning|antitrust|acquisition/i,
  ],
  [2, /interest rate|central bank|recession|\bgdp\b|oil|gold|earnings|regulation|semiconductor/i],
]

const assetRules = [
  ['A股', /china|chinese|beijing|pboc|renminbi|yuan/i],
  ['港股', /hong kong|hang seng/i],
  ['美股', /wall street|nasdaq|s&p|stock|shares|earnings|sec\b/i],
  ['债券', /bond|treasury|yield|interest rate|central bank/i],
  ['美元', /dollar|federal reserve|fed\b|payroll/i],
  ['黄金', /gold|bullion/i],
  ['原油', /oil|opec|crude/i],
  ['加密', /bitcoin|crypto|ethereum/i],
]

const enrich = (article) => {
  const text = article.title ?? ''
  let score = article.sourceType === 'official' ? 2 : 0
  for (const [points, pattern] of impactRules) if (pattern.test(text)) score += points
  if (
    article.publishedAt &&
    Date.now() - new Date(article.publishedAt).getTime() < 2 * 60 * 60 * 1000
  )
    score += 1
  const impact = score >= 7 ? 'critical' : score >= 4 ? 'high' : score >= 2 ? 'medium' : 'low'
  return {
    id: createHash('sha1').update(article.url).digest('hex').slice(0, 16),
    ...article,
    title: article.title.trim(),
    impact,
    impactScore: score,
    affectedAssets: assetRules.filter(([, pattern]) => pattern.test(text)).map(([asset]) => asset),
  }
}

const results = []
for (const topic of topics) {
  results.push(await Promise.allSettled([fetchGdelt(topic)]).then(([result]) => result))
  await new Promise((resolve) => setTimeout(resolve, 1500))
}
results.push(
  ...(await Promise.allSettled([
    ...officialFeeds.map(fetchOfficialFeed),
    ...mediaFeeds.map(fetchMediaFeed),
  ])),
)
const sourceNames = [
  ...topics.map(([name]) => `GDELT · ${name}`),
  ...officialFeeds.map(([name]) => name),
  ...mediaFeeds.map(([name]) => name),
]
const sourceStatus = results.map((result, index) => ({
  source: sourceNames[index],
  status: result.status === 'fulfilled' ? 'ok' : 'failed',
  message: result.status === 'rejected' ? String(result.reason) : '',
}))
const rawArticles = results.flatMap((result) => (result.status === 'fulfilled' ? result.value : []))
const unique = new Map()
for (const article of rawArticles) {
  if (!article.title || !article.url || !article.publishedAt) continue
  if (Date.now() - new Date(article.publishedAt).getTime() > 48 * 60 * 60 * 1000) continue
  const key = article.url.replace(/^https?:\/\//, '').replace(/\/$/, '')
  const existing = unique.get(key)
  if (!existing || article.sourceType === 'official') unique.set(key, article)
}
const rawRankedArticles = [...unique.values()]
  .map(enrich)
  .sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime() ||
      b.impactScore - a.impactScore,
  )
  .slice(0, 180)

let previous = null
try {
  previous = JSON.parse(await readFile(outputPath, 'utf8'))
} catch {
  // First run.
}
if (rawRankedArticles.length < 10)
  throw new Error(`Only ${rawRankedArticles.length} articles fetched; keeping old data`)

const previousTranslations = new Map(
  (previous?.articles ?? [])
    .filter((article) => article.translatedTitle)
    .map((article) => [article.id, article]),
)
const articles = []
for (const article of rawRankedArticles) {
  const cached = previousTranslations.get(article.id)
  if (cached?.title === article.title) {
    articles.push({
      ...article,
      translatedTitle: cached.translatedTitle,
      translationStatus: cached.translationStatus,
      translationProvider: cached.translationProvider,
    })
    continue
  }
  try {
    const translation = await translateNewsTitle(article.title)
    articles.push({ ...article, ...translation, translationProvider })
  } catch (error) {
    process.stderr.write(`translation failed ${article.id}: ${error.message}\n`)
    articles.push({
      ...article,
      translatedTitle: null,
      translationStatus: 'failed',
      translationProvider,
    })
  }
  await new Promise((resolve) => setTimeout(resolve, 150))
}
const unchanged =
  previous?.articles
    ?.map((article) => `${article.id}:${article.translatedTitle ?? ''}`)
    .join(',') ===
  articles.map((article) => `${article.id}:${article.translatedTitle ?? ''}`).join(',')

if (unchanged) {
  console.log(`No article changes (${articles.length} retained)`)
} else {
  await writeFile(
    outputPath,
    `${JSON.stringify(
      {
        updatedAt: new Date().toISOString(),
        source: 'GDELT、CNBC、华尔街日报与央行、监管机构公开信息源',
        refreshMinutes: 15,
        translationProvider,
        sourceStatus,
        articles,
      },
      null,
      2,
    )}\n`,
  )
  console.log(`Updated ${articles.length} market-news articles`)
}
