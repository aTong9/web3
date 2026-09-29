import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { load } from 'js-yaml'
import Parser from 'rss-parser'
import { writeJsonAtomic } from './lib/write-json-atomic.mjs'
import { kolId, mergeKolResult } from './lib/kol-result.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const configPath = resolve(root, 'src/data/kols.yml')
const outputPath = resolve(root, 'src/data/kol-monitor.json')
const MAX_ITEMS = 12
const onlyIndex = process.argv.indexOf('--only')
const onlyIds = new Set(
  onlyIndex >= 0 ? (process.argv[onlyIndex + 1] ?? '').split(',').filter(Boolean) : [],
)
if (onlyIndex >= 0 && !onlyIds.size)
  throw new Error('用法: npm run update:kols -- --only <订阅ID,订阅ID>')
const rsshubBase = process.env.KOLS_RSSHUB_BASE_URL
if (rsshubBase && !/^http:\/\/(?:127\.0\.0\.1|localhost):\d+\/?$/.test(rsshubBase))
  throw new Error('KOLS_RSSHUB_BASE_URL 仅支持本机 HTTP 端口')
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
  const original = new URL(url)
  const requestUrl =
    rsshubBase && original.hostname === 'rsshub.app'
      ? new URL(`${original.pathname}${original.search}`, rsshubBase).href
      : url
  const response = await fetch(requestUrl, {
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
  return feedUrl ? 'rss' : 'web'
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
  if (xml.trimStart().startsWith('{')) {
    const feed = JSON.parse(xml)
    if (!String(feed.version ?? '').startsWith('https://jsonfeed.org/version/1'))
      throw new Error('不支持的 JSON Feed 格式')
    return (feed.items ?? [])
      .slice(0, MAX_ITEMS)
      .map((item, index) => {
        const title = stripHtml(item.title ?? '')
        const description = stripHtml(item.summary ?? item.content_text ?? item.content_html ?? '')
        const parsedDate = item.date_published ? new Date(item.date_published) : null
        return {
          kind: 'content',
          id: item.id ?? item.url ?? `${index}-${title}`,
          title: title || '未命名内容',
          description: description.slice(0, 260),
          url: item.url ?? item.external_url ?? '',
          publishedAt:
            parsedDate && Number.isFinite(parsedDate.valueOf()) ? parsedDate.toISOString() : null,
          stocks: extractStocks(`${title} ${description}`),
        }
      })
      .filter((item) => {
        try {
          return ['http:', 'https:'].includes(new URL(item.url).protocol)
        } catch {
          return false
        }
      })
  }
  const feed = await feedParser.parseString(xml)
  return (feed.items ?? [])
    .slice(0, MAX_ITEMS)
    .map((item, index) => {
      const title = stripHtml(item.title ?? '')
      const description = stripHtml(
        item.contentSnippet ?? item.content ?? item.summary ?? item.description ?? '',
      )
      const link = item.link ?? ''
      const rawDate = item.isoDate ?? item.pubDate ?? null
      const parsedDate = rawDate ? new Date(rawDate) : null
      const publishedAt =
        parsedDate && Number.isFinite(parsedDate.valueOf()) ? parsedDate.toISOString() : null
      const combined = `${title} ${description}`
      return {
        kind: 'content',
        id: item.guid ?? item.id ?? link ?? `${index}-${title}`,
        title: title || '未命名内容',
        description: description.slice(0, 260),
        url: link,
        publishedAt,
        stocks: extractStocks(combined),
      }
    })
    .filter((item) => {
      try {
        return ['http:', 'https:'].includes(new URL(item.url).protocol)
      } catch {
        return false
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
    kind: 'profile',
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
    match(page, /["']channelId["']\s*:\s*["']([^"']+)["']/i) ||
    match(page, /youtube\.com\/channel\/(UC[A-Za-z0-9_-]+)/i)
  if (channelId) {
    try {
      const items = await parseFeed(
        await fetchText(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`),
      )
      if (items.length)
        return { status: 'ok', statusMessage: `已通过 YouTube Feed 同步 ${items.length} 条`, items }
    } catch (error) {
      console.warn(`YouTube Feed unavailable for ${config.name}:`, error)
    }
  }

  const initialData = page.match(/var ytInitialData = (\{.*?\});<\/script>/)?.[1]
  if (!initialData) throw new Error('无法解析 YouTube 视频列表')
  const items = []
  const visit = (value) => {
    if (!value || typeof value !== 'object' || items.length >= MAX_ITEMS) return
    const video = value.lockupViewModel
    if (video?.contentType === 'LOCKUP_CONTENT_TYPE_VIDEO' && video.contentId) {
      const title = video.metadata?.lockupMetadataViewModel?.title?.content
      if (title) {
        const metadataRows =
          video.metadata?.lockupMetadataViewModel?.metadata?.contentMetadataViewModel?.metadataRows
        const publishedLabel = metadataRows?.[0]?.metadataParts?.at(-1)?.text?.content
        items.push({
          kind: 'content',
          id: video.contentId,
          title,
          description: '',
          url: `https://www.youtube.com/watch?v=${video.contentId}`,
          publishedAt: null,
          publishedLabel,
          stocks: extractStocks(title),
        })
      }
      return
    }
    Object.values(value).forEach(visit)
  }
  visit(JSON.parse(initialData))
  if (!items.length) throw new Error('YouTube 视频列表为空')
  return {
    status: 'partial',
    statusMessage: `已从公开视频页读取 ${items.length} 条；时间为页面显示的相对时间`,
    items,
  }
}

const readKol = async (config) => {
  const platform = detectPlatform(config.url, config.feedUrl)
  try {
    if (config.feedUrl) {
      const items = await parseFeed(await fetchText(config.feedUrl))
      if (!items.length) throw new Error('Feed 中没有可用内容')
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
      status: 'partial',
      statusMessage: limited
        ? '平台限制内容列表抓取；仅获取主页元数据，可配置 feedUrl 增强'
        : '仅获取公开网页元数据；没有可验证的内容列表',
      items: [item],
    }
  } catch (error) {
    return { platform, status: 'failed', statusMessage: error.message, items: [] }
  }
}

const config = load(await readFile(configPath, 'utf8'))
if (!Array.isArray(config)) throw new Error('kols.yml 顶层必须是数组')

let previousDataset = { kols: [] }
try {
  previousDataset = JSON.parse(await readFile(outputPath, 'utf8'))
} catch {
  previousDataset = { kols: [] }
}
const previousKols = previousDataset.kols ?? []

const enabledKols = config.filter((item) => item.enabled !== false)
if (onlyIds.size && enabledKols.some((item) => onlyIds.has(item.id)) === false)
  throw new Error('--only 未匹配任何已启用订阅 ID')
if (onlyIds.size && enabledKols.filter((item) => onlyIds.has(item.id)).length !== onlyIds.size)
  throw new Error('--only 包含未知或未启用的订阅 ID')
const kols = []
for (const item of enabledKols) {
  if (!item.name || !item.url) throw new Error('每个 KOL 必须包含 name 和 url')
  const platform = detectPlatform(item.url, item.feedUrl)
  const id = kolId(item, platform)
  if (kols.some((kol) => kol.id === id)) throw new Error(`KOL ID 重复：${id}`)
  const previous = previousKols.find(
    (kol) => kol.id === id || (kol.name === item.name && kol.url === item.url),
  )
  if (onlyIds.size && !onlyIds.has(id)) {
    if (!previous) throw new Error(`未刷新订阅缺少现有快照：${id}`)
    kols.push(previous)
    continue
  }
  const readResult = await readKol(item)
  const checkedAt = new Date().toISOString()
  const result = mergeKolResult(
    readResult,
    previous,
    previousDataset.updatedAt,
    checkedAt,
  )
  kols.push({
    id,
    name: item.name,
    url: item.url,
    ...(item.feedUrl ? { feedUrl: item.feedUrl } : {}),
    tags: Array.isArray(item.tags) ? item.tags : [],
    checkedAt,
    ...result,
  })
  process.stdout.write(`${item.name}: ${result.status}\n`)
}

const output = {
  updatedAt: new Date().toISOString(),
  source: 'RSS、Atom 与公开页面；部分平台仅提供主页元数据',
  kols,
}

await writeJsonAtomic(outputPath, output)
process.stdout.write(`wrote ${kols.length} KOLs\n`)
