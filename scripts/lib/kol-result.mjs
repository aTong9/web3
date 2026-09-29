import { createHash } from 'node:crypto'

export const kolId = (item, platform) =>
  item.id ??
  `${platform}-${createHash('sha256')
    .update(new URL(item.feedUrl ?? item.url).href)
    .digest('hex')
    .slice(0, 12)}`

export const mergeKolResult = (result, previous, previousUpdatedAt, now) => {
  const previousContent = (previous?.items ?? []).filter(
    (item) =>
      item.kind === 'content' ||
      (!item.kind && ['youtube', 'rss'].includes(previous.platform) && item.url !== previous.url),
  )
  if (!result.items.some((item) => item.kind === 'content') && previousContent.length) {
    result = {
      ...result,
      status: 'stale',
      statusMessage: `本次没有取得新内容，保留上次内容：${result.statusMessage}`,
      items: previousContent.map((item) => ({ ...item, kind: 'content' })),
    }
  }
  return {
    ...result,
    lastSuccessAt:
      ['ok', 'partial'].includes(result.status) &&
      result.items.some((item) => item.kind === 'content')
        ? now
        : (previous?.lastSuccessAt ?? (previousContent.length ? previousUpdatedAt : null)),
  }
}
