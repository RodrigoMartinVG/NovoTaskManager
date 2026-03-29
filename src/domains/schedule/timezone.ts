import type { DiaId, FranjaId, FranjaMap } from '../planner/types'

const TIMEZONE = 'America/Argentina/Ushuaia'
const DIA_MAP: DiaId[] = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab']

function toLocalDate(value: Date = new Date()): Date {
  const localString = value.toLocaleString('en-US', { timeZone: TIMEZONE })
  return new Date(localString)
}

export function getPlannerNowParts(value?: Date) {
  const now = toLocalDate(value)
  return {
    weekdayId: DIA_MAP[now.getDay()] as DiaId,
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
    hour: now.getHours(),
    minute: now.getMinutes(),
  }
}

export function getDiaActual(value?: Date): DiaId {
  return getPlannerNowParts(value).weekdayId
}

export function getMomentoActual(value?: Date): FranjaId {
  const { hour } = getPlannerNowParts(value)

  if (hour < 12) {
    return 'manana'
  }

  if (hour < 18) {
    return 'tarde'
  }

  return 'noche'
}

export function getMomentoActualEnFranjas(franjas: FranjaMap, value?: Date): FranjaId {
  const { hour, minute } = getPlannerNowParts(value)
  const currentMinutes = hour * 60 + minute
  const ordered = Object.values(franjas).sort((left, right) => left.startsAt.localeCompare(right.startsAt))

  for (const franja of ordered) {
    const startParts = franja.startsAt.split(':')
    const endParts = franja.endsAt.split(':')
    const startHour = Number(startParts[0] ?? '0')
    const startMinute = Number(startParts[1] ?? '0')
    const endHour = Number(endParts[0] ?? '23')
    const endMinute = Number(endParts[1] ?? '59')
    const start = startHour * 60 + startMinute
    const end = endHour * 60 + endMinute

    if (currentMinutes >= start && currentMinutes <= end) {
      return franja.id
    }
  }

  return getMomentoActual(value)
}

export function formatPlannerDate(value?: Date): string {
  const now = toLocalDate(value)
  const year = now.getFullYear()
  const month = `${now.getMonth() + 1}`.padStart(2, '0')
  const day = `${now.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}
