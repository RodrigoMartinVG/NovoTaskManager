import { useMemo } from 'react'
import { PlannerService } from '../../domains/planner/service'
import { DIAS } from '../../domains/schedule/franjas'
import type { DiaId, FranjaId, MateriaSlot } from '../../domains/planner/types'
import styles from './SlotGrid.module.css'

interface SlotGridProps {
  slots: MateriaSlot[]
  onChange: (slots: MateriaSlot[]) => void
  disabled?: boolean | undefined
}

const DAY_LABELS: Record<DiaId, string> = {
  lun: 'Lun',
  mar: 'Mar',
  mie: 'Mie',
  jue: 'Jue',
  vie: 'Vie',
  sab: 'Sab',
  dom: 'Dom',
}

export function SlotGrid({ slots, onChange, disabled = false }: SlotGridProps) {
  const franjas = useMemo(() => {
    const map = PlannerService.getFranjas()
    return Object.values(map).sort((a, b) => a.startsAt.localeCompare(b.startsAt))
  }, [])
  const gridStyle = { gridTemplateColumns: `2.4rem repeat(${franjas.length}, minmax(0, 1fr))` }

  function hasSlot(dia: DiaId, momento: FranjaId): boolean {
    return slots.some((slot) => slot.dia === dia && slot.momento === momento)
  }

  function toggleSlot(dia: DiaId, momento: FranjaId) {
    if (disabled) {
      return
    }

    const exists = hasSlot(dia, momento)
    if (exists) {
      onChange(slots.filter((slot) => !(slot.dia === dia && slot.momento === momento)))
      return
    }

    onChange([...slots, { dia, momento }])
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.headerRow} style={gridStyle}>
        <span className={styles.corner}>Dia</span>
        {franjas.map((franja) => (
          <span key={franja.id} className={styles.headerCell}>
            {franja.label}
          </span>
        ))}
      </div>
      {DIAS.map((dia) => (
        <div key={dia} className={styles.dayRow} style={gridStyle}>
          <span className={styles.dayLabel}>{DAY_LABELS[dia]}</span>
          {franjas.map((franja) => {
            const active = hasSlot(dia, franja.id)
            return (
              <button
                key={`${dia}-${franja.id}`}
                type="button"
                className={`${styles.cell} ${active ? styles.active : ''}`}
                onClick={() => toggleSlot(dia, franja.id)}
                aria-pressed={active}
                disabled={disabled}
              >
                {active ? '●' : '○'}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}
