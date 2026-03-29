export function isSafeUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

export function checklistProgress(doneCount: number, totalCount: number): number {
  if (totalCount === 0) {
    return 0
  }
  return Math.round((doneCount / totalCount) * 100)
}