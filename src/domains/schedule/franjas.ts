import type { FranjaHoraria, FranjaId, DiaId, Materia, MateriaSlot } from '../planner/types'

export const DIAS = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'] as const

export const DEFAULT_FRANJAS_3: Record<'manana' | 'tarde' | 'noche', FranjaHoraria> = {
  manana: { id: 'manana', label: 'Mañana', startsAt: '07:00', endsAt: '12:59', description: 'Primer bloque del día' },
  tarde: { id: 'tarde', label: 'Tarde', startsAt: '13:00', endsAt: '17:59', description: 'Segundo bloque del día' },
  noche: { id: 'noche', label: 'Noche', startsAt: '18:00', endsAt: '23:59', description: 'Último bloque del día' },
}

export const DEFAULT_FRANJAS_6: Record<'manana1' | 'manana2' | 'tarde1' | 'tarde2' | 'noche1' | 'noche2', FranjaHoraria> = {
  manana1: { id: 'manana1', label: 'Mañana 1', startsAt: '07:00', endsAt: '09:29' },
  manana2: { id: 'manana2', label: 'Mañana 2', startsAt: '09:30', endsAt: '12:59' },
  tarde1: { id: 'tarde1', label: 'Tarde 1', startsAt: '13:00', endsAt: '15:29' },
  tarde2: { id: 'tarde2', label: 'Tarde 2', startsAt: '15:30', endsAt: '17:59' },
  noche1: { id: 'noche1', label: 'Noche 1', startsAt: '18:00', endsAt: '20:29' },
  noche2: { id: 'noche2', label: 'Noche 2', startsAt: '20:30', endsAt: '23:59' },
}

const FRANJA_ORDER: FranjaId[] = ['manana', 'manana1', 'manana2', 'tarde', 'tarde1', 'tarde2', 'noche', 'noche1', 'noche2']

export function franjasTo6(
  franjas3: Record<'manana' | 'tarde' | 'noche', FranjaHoraria>,
): Record<'manana1' | 'manana2' | 'tarde1' | 'tarde2' | 'noche1' | 'noche2', FranjaHoraria> {
  return {
    manana1: { ...franjas3.manana, id: 'manana1' },
    manana2: { ...franjas3.manana, id: 'manana2' },
    tarde1: { ...franjas3.tarde, id: 'tarde1' },
    tarde2: { ...franjas3.tarde, id: 'tarde2' },
    noche1: { ...franjas3.noche, id: 'noche1' },
    noche2: { ...franjas3.noche, id: 'noche2' },
  }
}

export function franjasTo3(
  franjas6: Record<'manana1' | 'manana2' | 'tarde1' | 'tarde2' | 'noche1' | 'noche2', FranjaHoraria>,
): Record<'manana' | 'tarde' | 'noche', FranjaHoraria> {
  return {
    manana: { ...franjas6.manana1, id: 'manana', label: 'Mañana' },
    tarde: { ...franjas6.tarde1, id: 'tarde', label: 'Tarde' },
    noche: { ...franjas6.noche1, id: 'noche', label: 'Noche' },
  }
}

export function slotsTo6(slots: MateriaSlot[]): MateriaSlot[] {
  return slots.map((slot) => ({
    ...slot,
    momento: `${slot.momento}1` as FranjaId,
  }))
}

export function slotsTo3(slots: MateriaSlot[]): MateriaSlot[] {
  return slots.map((slot) => ({
    ...slot,
    momento: slot.momento.replace(/[12]$/, '') as FranjaId,
  }))
}

export function getMateriasParaHoy(materias: Materia[], dia: DiaId): Materia[] {
  return materias.filter((materia) => materia.slots.some((slot) => slot.dia === dia))
}

export function getMateriasMasTarde(materias: Materia[], dia: DiaId): Materia[] {
  const ahora = new Date().getHours()
  const horaActual = ahora < 12 ? 'manana' : ahora < 18 ? 'tarde' : 'noche'
  return materias
    .filter((materia) => materia.slots.some((slot) => slot.dia === dia))
    .sort((a, b) => {
      const slotA = a.slots.find((slot) => slot.dia === dia)
      const slotB = b.slots.find((slot) => slot.dia === dia)
      return FRANJA_ORDER.indexOf(slotA?.momento ?? horaActual) - FRANJA_ORDER.indexOf(slotB?.momento ?? horaActual)
    })
}
