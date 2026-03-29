export function daysUntil(dateStr: string): number | null {
  const target = new Date(dateStr)
  if (Number.isNaN(target.getTime())) {
    return null
  }

  const now = new Date()
  const delta = target.setHours(0, 0, 0, 0) - new Date(now.setHours(0, 0, 0, 0)).getTime()
  return Math.round(delta / (1000 * 60 * 60 * 24))
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) {
    return dateStr
  }

  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
  })
}

export function localISONow(inputDate?: Date): string {
  const now = inputDate ?? new Date()
  const year = now.getFullYear()
  const month = `${now.getMonth() + 1}`.padStart(2, '0')
  const day = `${now.getDate()}`.padStart(2, '0')
  const hour = `${now.getHours()}`.padStart(2, '0')
  const minute = `${now.getMinutes()}`.padStart(2, '0')
  return `${year}-${month}-${day}T${hour}:${minute}:00`
}
