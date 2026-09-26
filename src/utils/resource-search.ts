const normalize = (value: string) => value.normalize('NFKC').toLocaleLowerCase()

// Words may match different fields, e.g. a category plus a site name.
export const createResourceMatcher = (query: string) => {
  const words = normalize(query).trim().split(/\s+/).filter(Boolean)
  return (...fields: (string | undefined)[]) => {
    const text = normalize(fields.filter(Boolean).join(' '))
    return words.every((word) => text.includes(word))
  }
}

export const parseResourceFavorites = (saved: string): string[] => {
  const values: unknown = JSON.parse(saved)
  if (!Array.isArray(values)) return []
  return [
    ...new Set(
      values.filter((value): value is string => {
        if (typeof value !== 'string') return false
        try {
          return ['https:', 'http:'].includes(new URL(value).protocol)
        } catch {
          return false
        }
      }),
    ),
  ]
}
