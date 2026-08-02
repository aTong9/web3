const endpoint = 'https://api.mymemory.translated.net/get'

export const translationProvider = 'MyMemory'

export const translateNewsTitle = async (title) => {
  if (/^[\p{Script=Han}\p{P}\p{N}\p{Zs}]+$/u.test(title)) {
    return { translatedTitle: title, translationStatus: 'original' }
  }

  const params = new URLSearchParams({ q: title, langpair: 'en|zh-CN' })
  if (process.env.MYMEMORY_EMAIL) params.set('de', process.env.MYMEMORY_EMAIL)
  const response = await fetch(`${endpoint}?${params.toString()}`, {
    headers: { 'user-agent': 'web3-market-monitor/1.0 (+https://github.com/aTong9/web3)' },
    signal: AbortSignal.timeout(15_000),
  })
  if (!response.ok) throw new Error(`Translation HTTP ${response.status}`)
  const payload = await response.json()
  const translatedTitle = payload.responseData?.translatedText?.trim()
  if (!translatedTitle || payload.responseStatus !== 200) {
    throw new Error(payload.responseDetails || 'Translation returned no text')
  }
  return { translatedTitle, translationStatus: 'translated' }
}
