import { useMemo, useState } from 'react'
import { PlannerService } from '../../domains/planner/service'
import { DEFAULT_FRANJAS_3, DEFAULT_FRANJAS_6, franjasTo3, franjasTo6, slotsTo3, slotsTo6 } from '../../domains/schedule/franjas'
import { TimeInputField } from '../../shared/components/TimeInputField'
import type { FranjaHoraria, FranjaId, FranjaMode, FranjaMap, Materia } from '../../domains/planner/types'
import styles from './FranjasEditor.module.css'

type FranjaLocal = {
  id: FranjaId
  label: string
  startsAt: string
  endsAt: string
}

interface FranjasEditorProps {
  materias: Materia[]
  onMateriasUpdated: (materias: Materia[]) => void
}

function orderedFranjas(mode: FranjaMode): FranjaLocal[] {
  if (mode === '6-franjas') {
    return Object.values(DEFAULT_FRANJAS_6)
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
      .map((item) => ({ id: item.id, label: item.label, startsAt: item.startsAt, endsAt: item.endsAt }))
  }

  return Object.values(DEFAULT_FRANJAS_3)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    .map((item) => ({ id: item.id, label: item.label, startsAt: item.startsAt, endsAt: item.endsAt }))
}

function mapToOrderedList(map: FranjaMap): FranjaLocal[] {
  return Object.values(map)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    .map((item) => ({
      id: item.id,
      label: item.label,
      startsAt: item.startsAt,
      endsAt: item.endsAt,
    }))
}

function parseClock(value: string): number | null {
  const [hh, mm] = value.split(':')
  if (!hh || !mm) {
    return null
  }
  const hour = Number(hh)
  const minute = Number(mm)
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return null
  }
  return hour * 60 + minute
}

function asMap(franjas: FranjaLocal[]): FranjaMap {
  return franjas.reduce((acc, item) => {
    acc[item.id] = {
      id: item.id,
      label: item.label,
      startsAt: item.startsAt,
      endsAt: item.endsAt,
    } as FranjaHoraria
    return acc
  }, {} as FranjaMap)
}

function uniqueSlots(slots: Materia['slots']): Materia['slots'] {
  const seen = new Set<string>()
  return slots.filter((slot) => {
    const key = `${slot.dia}:${slot.momento}`
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

export function FranjasEditor({ materias, onMateriasUpdated }: FranjasEditorProps) {
  const storedMode = PlannerService.getFranjaMode()
  const [mode, setMode] = useState<FranjaMode>(storedMode)
  const [franjas, setFranjas] = useState<FranjaLocal[]>(() => {
    const fromService = mapToOrderedList(PlannerService.getFranjas())
    if (!fromService.length) {
      return orderedFranjas(storedMode)
    }
    const expectedCount = storedMode === '6-franjas' ? 6 : 3
    if (fromService.length !== expectedCount) {
      return orderedFranjas(storedMode)
    }
    return fromService
  })
  const [error, setError] = useState<string | null>(null)

  const preview = useMemo(
    () => franjas.map((franja) => `${franja.label}: ${franja.startsAt || '--:--'} - ${franja.endsAt || '--:--'}`),
    [franjas],
  )

  function updateFranja(id: FranjaId, patch: Partial<FranjaLocal>) {
    setFranjas((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  function handleModeChange(nextMode: FranjaMode) {
    if (nextMode === mode) {
      return
    }

    setMode(nextMode)

    if (nextMode === '6-franjas') {
      const base3 = franjas.length === 3 ? asMap(franjas) : (DEFAULT_FRANJAS_3 as unknown as FranjaMap)
      const nextMap = franjasTo6(base3 as typeof DEFAULT_FRANJAS_3)
      setFranjas(
        Object.values(nextMap)
          .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
          .map((item) => ({ id: item.id, label: item.label, startsAt: item.startsAt, endsAt: item.endsAt })),
      )

      const converted = materias.map((materia) => ({ ...materia, slots: uniqueSlots(slotsTo6(materia.slots)) }))
      onMateriasUpdated(converted)
      return
    }

    const base6 = franjas.length === 6 ? asMap(franjas) : (DEFAULT_FRANJAS_6 as unknown as FranjaMap)
    const nextMap = franjasTo3(base6 as typeof DEFAULT_FRANJAS_6)
    setFranjas(
      Object.values(nextMap)
        .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
        .map((item) => ({ id: item.id, label: item.label, startsAt: item.startsAt, endsAt: item.endsAt })),
    )

    const converted = materias.map((materia) => ({ ...materia, slots: uniqueSlots(slotsTo3(materia.slots)) }))
    onMateriasUpdated(converted)
  }

  function validate(): string | null {
    if (!franjas.length) {
      return 'No hay franjas para guardar.'
    }

    const parsed = franjas.map((franja) => ({
      ...franja,
      startMinutes: parseClock(franja.startsAt),
      endMinutes: parseClock(franja.endsAt),
    }))

    if (parsed.some((item) => item.startMinutes === null || item.endMinutes === null)) {
      return 'Todas las franjas deben tener hora de inicio y fin válidas.'
    }

    for (const item of parsed) {
      if ((item.startMinutes as number) >= (item.endMinutes as number)) {
        return `La franja ${item.label} tiene horario inválido.`
      }
    }

    const ordered = [...parsed].sort((a, b) => (a.startMinutes as number) - (b.startMinutes as number))
    for (let idx = 1; idx < ordered.length; idx += 1) {
      const prev = ordered[idx - 1]
      const next = ordered[idx]
      if (!prev || !next) {
        continue
      }
      if ((next.startMinutes as number) < (prev.endMinutes as number)) {
        return 'Las franjas se superponen. Ajustá los horarios.'
      }
    }

    const last = ordered[ordered.length - 1]
    if (!last) {
      return null
    }
    if ((last.endMinutes as number) > 24 * 60) {
      return 'La última franja no puede terminar después de 24:00.'
    }

    return null
  }

  function handleSave() {
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    PlannerService.setFranjaMode(mode)
    PlannerService.setFranjas(asMap(franjas))
  }

  return (
    <section className={styles.wrapper}>
      <label className={styles.modeField}>
        <span>Modo de franjas</span>
        <select value={mode} onChange={(event) => handleModeChange(event.target.value as FranjaMode)}>
          <option value="3-franjas">3 franjas (Manana / Tarde / Noche)</option>
          <option value="6-franjas">6 franjas (1/2 por bloque)</option>
        </select>
      </label>

      <div className={styles.rows}>
        {franjas.map((franja) => (
          <div key={franja.id} className={styles.row}>
            <p className={styles.rowLabel}>{franja.label}</p>
            <div className={styles.timeGroup}>
              <TimeInputField
                value={franja.startsAt || null}
                onChange={(value) => updateFranja(franja.id, { startsAt: value ?? '' })}
              />
              <span className={styles.separator}>-</span>
              <TimeInputField
                value={franja.endsAt || null}
                onChange={(value) => updateFranja(franja.id, { endsAt: value ?? '' })}
              />
            </div>
          </div>
        ))}
      </div>

      <div className={styles.preview}>
        {preview.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <button type="button" className={styles.saveButton} onClick={handleSave}>
        Guardar horarios
      </button>
    </section>
  )
}
