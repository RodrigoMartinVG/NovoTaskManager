import { useState } from 'react'
import type { FranjaHoraria, Materia } from '../../../domains/planner/types'
import { HoyMateriaCard } from './HoyMateriaCard'
import styles from './LaterSection.module.css'

interface LaterSectionProps {
  items: Array<{ materia: Materia; franja: FranjaHoraria; startsAtMinutes: number }>
  horasPorMateria: (materiaId: string) => number
  onStartSession: (materia: Materia) => void
}

export function LaterSection({ items, horasPorMateria, onStartSession }: LaterSectionProps) {
  const [open, setOpen] = useState(false)

  if (items.length === 0) {
    return null
  }

  return (
    <section className={styles.section}>
      <button type="button" className={styles.toggle} onClick={() => setOpen((v) => !v)}>
        <h3 className={styles.title}>Más tarde hoy</h3>
        <span className={styles.count}>{items.length}</span>
        <span className={styles.chevron}>{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <div className={styles.grid}>
          {items.map(({ materia, franja }) => (
            <HoyMateriaCard
              key={`${materia.id}-${franja.id}`}
              materia={materia}
              horasSemana={horasPorMateria(materia.id)}
              onStartSession={onStartSession}
              compact
              slotLabel={`${franja.label} · ${franja.startsAt}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}