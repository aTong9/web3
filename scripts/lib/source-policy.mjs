export const normalizeSource = (source) =>
  String(source)
    .toLowerCase()
    .replaceAll(/[^a-z0-9\u4e00-\u9fff]/g, '')

export const sourceRank = (source, priority) => {
  const normalized = normalizeSource(source)
  const index = priority.findIndex((candidate) => {
    const target = normalizeSource(candidate)
    return target === normalized || target.includes(normalized) || normalized.includes(target)
  })
  return index === -1 ? priority.length : index
}

export const selectSourceCandidate = (candidates, priority) => {
  const valid = candidates.filter(
    (candidate) => Array.isArray(candidate.history) && candidate.history.length >= 2,
  )
  return [...valid].sort(
    (left, right) =>
      sourceRank(left.source, priority) - sourceRank(right.source, priority) ||
      String(right.history.at(-1)?.date ?? '').localeCompare(
        String(left.history.at(-1)?.date ?? ''),
      ) ||
      right.history.length - left.history.length,
  )[0]
}
