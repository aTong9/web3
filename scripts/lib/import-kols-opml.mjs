import { parseStringPromise } from 'xml2js'

const safeUrl = (value) => {
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null
  } catch {
    return null
  }
}

export const readOpmlSubscriptions = async (xml) => {
  if (/<!(?:DOCTYPE|ENTITY)/i.test(xml)) throw new Error('OPML 声明了不支持的实体')
  const document = await parseStringPromise(xml)
  if (!document?.opml?.body?.[0]) throw new Error('无效的 OPML 文件')
  const rows = []
  const visit = (outlines = [], groups = []) => {
    for (const outline of outlines) {
      const attrs = outline.$ ?? {}
      if (attrs.xmlUrl) {
        const feedUrl = safeUrl(attrs.xmlUrl)
        if (feedUrl)
          rows.push({
            name: String(attrs.title || attrs.text || new URL(feedUrl).hostname).trim(),
            url: safeUrl(attrs.htmlUrl) ?? feedUrl,
            feedUrl,
            enabled: true,
            tags: groups,
          })
      }
      const label = String(attrs.title || attrs.text || '').trim()
      visit(outline.outline, attrs.xmlUrl || !label ? groups : [...groups, label])
    }
  }
  visit(document.opml.body[0].outline)
  return [...new Map(rows.map((row) => [row.feedUrl, row])).values()]
}

export const mergeSubscriptions = (existing, incoming) => {
  const merged = [...existing]
  for (const row of incoming) {
    const index = merged.findIndex((item) => item.feedUrl && safeUrl(item.feedUrl) === row.feedUrl)
    if (index < 0) merged.push(row)
    else
      merged[index] = {
        ...merged[index],
        name: row.name,
        url: row.url,
        feedUrl: row.feedUrl,
        tags: [...new Set([...(merged[index].tags ?? []), ...row.tags])],
      }
  }
  return merged
}
