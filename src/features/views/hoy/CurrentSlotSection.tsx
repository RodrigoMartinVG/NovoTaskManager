import type { FranjaId, Materia } from '../../../domains/planner/types'
import { HoyMateriaCard } from './HoyMateriaCard'
import styles from './CurrentSlotSection.module.css'

interface CurrentSlotSectionProps {
  currentFranja: FranjaId
  currentFranjaLabel: string
  materias: Materia[]
  horasPorMateria: (materiaId: string) => number
  onStartSession: (materia: Materia) => void
  onOpenSemana: () => void
}

function franjaEmoji(franjaId: FranjaId): string {
  if (franjaId.startsWith('manana')) return '🌅'
  if (franjaId.startsWith('tarde')) return '☀'
  return '🌙'
}

export function CurrentSlotSection({
  currentFranja,
  currentFranjaLabel,
  materias,
  horasPorMateria,
  onStartSession,
  onOpenSemana,
}: CurrentSlotSectionProps) {
  return (
    <section className={styles.section}>
      <header className={styles.header}>
        <h3 className={styles.title}>{`Ahora - ${franjaEmoji(currentFranja)} ${currentFranjaLabel}`}</h3>
      </header>

      {materias.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>No hay materias asignadas a este horario. Configura tu horario semanal.</p>
          <button type="button" className={styles.emptyAction} onClick={onOpenSemana}>
            Ir a Vista Semana
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {materias.map((materia) => (
            <HoyMateriaCard
              key={materia.id}
              materia={materia}
              horasSemana={horasPorMateria(materia.id)}
              onStartSession={onStartSession}
            />
          ))}
        </div>
      )}
    </section>
  )
}