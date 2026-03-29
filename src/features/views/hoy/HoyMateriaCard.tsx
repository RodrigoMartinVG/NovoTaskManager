import type { Materia } from '../../../domains/planner/types'
import styles from './HoyMateriaCard.module.css'

interface HoyMateriaCardProps {
  materia: Materia
  horasSemana: number
  compact?: boolean | undefined
  slotLabel?: string | undefined
  onStartSession: (materia: Materia) => void
}

function objetivo(materia: Materia): number {
  return materia.horasMax || materia.horasMin || 1
}

export function HoyMateriaCard({
  materia,
  horasSemana,
  compact = false,
  slotLabel,
  onStartSession,
}: HoyMateriaCardProps) {
  const goal = objetivo(materia)
  return (
    <article className={`${styles.card} ${compact ? styles.compact : ''}`}>
      <header className={styles.header}>
        <div className={styles.mainInfo}>
          <svg className={styles.dot} viewBox="0 0 8 8" aria-hidden="true">
            <circle cx="4" cy="4" r="4" fill={materia.color} />
          </svg>
          <div>
            <h4 className={styles.name}>{materia.nombre}</h4>
            <p className={styles.code}>{materia.codigo}</p>
          </div>
        </div>
        {slotLabel && <span className={styles.slot}>{slotLabel}</span>}
      </header>

      <div className={styles.progressWrap}>
        <div className={styles.progressMeta}>
          <span>{`${horasSemana}h semana`}</span>
          <span>{`${materia.horasMin}h - ${materia.horasMax}h`}</span>
        </div>
        <progress className={styles.progress} max={goal} value={Math.min(goal, horasSemana)} />
      </div>

      <button type="button" className={styles.startBtn} onClick={() => onStartSession(materia)}>
        ▶ Iniciar sesion de estudio
      </button>
    </article>
  )
}