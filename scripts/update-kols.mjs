import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { load } from 'js-yaml'
import Parser from 'rss-parser'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const configPath = resolve(root, 'src/data/kols.yml')
const outputPath = resolve(root, 'src/data/kol-monitor.json')
const MAX_ITEMS = 12
const feedParser = new Parser({
  timeout: 25_000,
  headers: {
    'User-Agent': 'Mozilla/5.0 finance-desk/1.0',
    Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml',
  },
})

const stockDictionary = [
  { code: '600519', name: '贵州茅台', market: 'A股', aliases: ['贵州茅台', '茅台'] },
  { code: '000858', name: '五粮液', market: 'A股', aliases: ['五粮液'] },
  { code: '300750', name: '宁德时代', market: 'A股', aliases: ['宁德时代'] },
  { code: '002594', name: '比亚迪', market: 'A股', aliases: ['比亚迪'] },
  { code: '600036', name: '招商银行', market: 'A股', aliases: ['招商银行'] },
  { code: '601318', name: '中国平安', market: 'A股', aliases: ['中国平安'] },
  { code: '00700', name: '腾讯控股', market: '港股', aliases: ['腾讯控股', '腾讯'] },
  { code: '09988', name: '阿里巴巴', market: '港股', aliases: ['阿里巴巴'] },
  { code: '03690', name: '美团', market: '港股', aliases: ['美团'] },
  { code: '01810', name: '小米集团', market: '港股', aliases: ['小米集团'] },
  { code: 'AAPL', name: 'Apple', market: '美股', aliases: ['AAPL', '苹果公司'] },
  { code: 'TSLA', name: 'Tesla', market: '美股', aliases: ['TSLA', '特斯拉'] },
  { code: 'NVDA', name: 'NVIDIA', market: '美股', aliases: ['NVDA', '英伟达'] },
  { code: 'MSFT', name: 'Microsoft', market: '美股', aliases: ['MSFT', '微软'] },
  { code: 'GOOGL', name: 'Alphabet', market: '美股', aliases: ['GOOGL', '谷歌'] },
  { code: 'AMZN', name: 'Amazon', market: '美股', aliases: ['AMZN', '亚马逊'] },
  { code: 'META', name: 'Meta', market: '美股', aliases: ['META', 'Meta Platforms'] },
]

const fetchText = async (url) => {
  const response = await fetch(url, {
    headers: {
      'user-agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124 Safari/537.36',
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
    redirect: 'follow',
    signal: AbortSignal.timeout(25_000),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.text()
}

const decodeEntities = (text = '') =>
  text
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))

const stripHtml = (text = '') =>
  decodeEntities(text.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim()

const match = (text, pattern) => decodeEntities(text.match(pattern)?.[1]?.trim() ?? '')

const detectPlatform = (url, feedUrl) => {
  if (feedUrl) return 'rss'
  const host = new URL(url).hostname
  if (host.includes('youtube.com') || host.includes('youtu.be')) return 'youtube'
  if (host.includes('xiaohongshu.com')) return 'xiaohongshu'
  if (host.includes('mp.weixin.qq.com')) return 'wechat'
  if (host.includes('bilibili.com')) return 'bilibili'
  if (host === 'x.com' || host.includes('twitter.com')) return 'x'
  if (host.includes('instagram.com')) return 'instagram'
  if (host.includes('tiktok.com')) return 'tiktok'
  if (host.includes('douyin.com')) return 'douyin'
  if (host.includes('weibo.com')) return 'weibo'
  if (host.includes('zhihu.com')) return 'zhihu'
  return 'web'
}

const extractStocks = (text) => {
  const stocks = stockDictionary
    .filter((stock) =>
      stock.aliases.some((alias) => text.toLowerCase().includes(alias.toLowerCase())),
    )
    .map(({ code, name, market }) => ({ code, name, market }))
  const knownCodes = new Set(stocks.map((stock) => stock.code))
  const explicitTickers = [...text.matchAll(/\$([A-Z]{1,5})\b/g)].map((result) => result[1])
  explicitTickers.forEach((code) => {
    if (!knownCodes.has(code)) stocks.push({ code, name: code, market: '美股' })
  })
  return stocks
}

const parseFeed = async (xml) => {
  const feed = await feedParser.parseString(xml)
  return (feed.items ?? []).slice(0, MAX_ITEMS).map((item, index) => {
    const title = stripHtml(item.title ?? '')
    const description = stripHtml(
      item.contentSnippet ?? item.content ?? item.summary ?? item.description ?? '',
    )
    const link = item.link ?? ''
    const rawDate = item.isoDate ?? item.pubDate ?? null
    const parsedDate = rawDate ? new Date(rawDate) : null
    const publishedAt = parsedDate && Number.isFinite(parsedDate.valueOf()) ? parsedDate.toISOString() : null
    const combined = `${title} ${description}`
    return {
      id: item.guid ?? item.id ?? link ?? `${index}-${title}`,
      title: title || '未命名内容',
      description: description.slice(0, 260),
      url: link,
      publishedAt,
      stocks: extractStocks(combined),
    }
  })
}

const parseHtmlMetadata = (html, url) => {
  const title =
    match(html, /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)["']/i) ||
    match(html, /<title[^>]*>([\s\S]*?)<\/title>/i)
  const description =
    match(
      html,
      /<meta[^>]+(?:name|property)=["'](?:description|og:description)["'][^>]+content=["']([^"']*)["']/i,
    ) || ''
  const publishedAt =
    match(
      html,
      /<meta[^>]+property=["']article:published_time["'][^>]+content=["']([^"']*)["']/i,
    ) || null
  return {
    id: url,
    title: stripHtml(title) || new URL(url).hostname,
    description: stripHtml(description).slice(0, 260),
    url,
    publishedAt: publishedAt ? new Date(publishedAt).toISOString() : null,
    stocks: extractStocks(`${title} ${description}`),
  }
}

const readYouTube = async (config) => {
  const page = await fetchText(config.url)
  const channelId =
    match(page, /<meta[^>]+itemprop=["']channelId["'][^>]+content=["']([^"']+)["']/i) ||
    match(page, /["']channelId["']\s*:\s*["']([^"']+)["']/i)
  if (!channelId) throw new Error('无法解析 YouTube channelId')
  const items = await parseFeed(
    await fetchText(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`),
  )
  return { status: 'ok', statusMessage: `已通过 YouTube Feed 同步 ${items.length} 条`, items }
}

const readKol = async (config) => {
  const platform = detectPlatform(config.url, config.feedUrl)
  try {
    if (config.feedUrl) {
      const items = await parseFeed(await fetchText(config.feedUrl))
      return { platform, status: 'ok', statusMessage: `已通过 Feed 同步 ${items.length} 条`, items }
    }
    if (platform === 'youtube') return { platform, ...(await readYouTube(config)) }

    const item = parseHtmlMetadata(await fetchText(config.url), config.url)
    const limited = [
      'xiaohongshu',
      'wechat',
      'bilibili',
      'x',
      'instagram',
      'tiktok',
      'douyin',
      'weibo',
      'zhihu',
    ].includes(platform)
    return {
      platform,
      status: limited ? 'partial' : 'ok',
      statusMessage: limited
        ? '平台限制内容列表抓取；已同步公开页面元数据，可配置 feedUrl 增强'
        : '已同步公开网页元数据',
      items: [item],
    }
  } catch (error) {
    return { platform, status: 'failed', statusMessage: error.message, items: [] }
  }
}

const config = load(await readFile(configPath, 'utf8'))
if (!Array.isArray(config)) throw new Error('kols.yml 顶层必须是数组')

let previousKols = []
try {
  previousKols = JSON.parse(await readFile(outputPath, 'utf8')).kols ?? []
} catch {
  previousKols = []
}

const enabledKols = config.filter((item) => item.enabled !== false)
const kols = []
for (const item of enabledKols) {
  if (!item.name || !item.url) throw new Error('每个 KOL 必须包含 name 和 url')
  let result = await readKol(item)
  const previous = previousKols.find((kol) => kol.url === item.url)
  if (result.status === 'failed' && previous?.items?.length) {
    result = {
      ...result,
      status: 'stale',
      statusMessage: `本次更新失败，保留上次内容：${result.statusMessage}`,
      items: previous.items,
    }
  }
  kols.push({
    id:
      item.id ??
      `${result.platform}-${new URL(item.url).pathname.replace(/\W+/g, '-').replace(/^-|-$/g, '')}`,
    name: item.name,
    url: item.url,
    tags: Array.isArray(item.tags) ? item.tags : [],
    ...result,
  })
  process.stdout.write(`${item.name}: ${result.status}\n`)
}

const output = {
  updatedAt: new Date().toISOString(),
  source: '各平台公开页面、RSS 与 Atom Feed；受平台访问策略影响时自动降级为元数据监控',
  kols,
}

await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`)
process.stdout.write(`wrote ${kols.length} KOLs\n`)
