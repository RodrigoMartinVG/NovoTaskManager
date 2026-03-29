import { daysUntil, formatDate } from '../../../utils/dateUtils'
import { getAlertColor } from '../../../domains/alerts/alertEngine'
import type { AlertasConfig, Materia, Tarea, TipoTarea } from '../../../domains/planner/types'
import styles from './BacklogRow.module.css'

interface BacklogRowProps {
  task: Tarea
  materia?: Materia | undefined
  tipo?: TipoTarea | undefined
  alertas?: AlertasConfig | undefined
  onSelect: (id: string) => void
}

function progress(items: Tarea['items']): { done: number; total: number; percent: number } {
  const total = items.length
  if (total === 0) {
    return { done: 0, total: 0, percent: 0 }
  }
  const done = items.filter((item) => item.done).length
  return { done, total, percent: Math.round((done / total) * 100) }
}

export function BacklogRow({ task, materia, tipo, alertas, onSelect }: BacklogRowProps) {
  const alertColor = alertas ? getAlertColor(task, alertas) : null
  const until = task.fechaLimite ? daysUntil(task.fechaLimite) : null
  const checklist = progress(task.items)

  const estadoClass =
    task.estado === 'completado'
      ? styles.done
      : alertColor === 'start_overdue'
        ? styles.urgOverdue
        : alertColor === 'start_now' || alertColor === 'start_soon'
          ? styles.urgSoon
          : alertColor === 'yellow'
            ? styles.urgWarn
            : styles.urgNormal

  return (
    <button
      type="button"
      className={`${styles.row} ${estadoClass}`}
      onClick={() => onSelect(task.id)}
      aria-label={`Abrir tarea ${task.titulo}`}
    >
      <span className={styles.materiaBar} style={{ backgroundColor: materia?.color ?? 'var(--accent)' }} />
      <span className={styles.tipoIcon}>{tipo?.icon ?? '•'}</span>
      <div className={styles.main}>
        <div className={styles.meta}>{materia?.nombre ?? 'Sin materia'}</div>
        <div className={styles.title}>{task.titulo}</div>
      </div>
      {task.hora && <span className={styles.hour}>{task.hora}</span>}
      {tipo && (
        <span className={styles.badge} style={{ background: tipo.bg, color: tipo.accent }}>
          {tipo.label}
        </span>
      )}
      {checklist.total > 0 && (
        <div className={styles.progressWrap}>
          <div className={styles.progressBar}>
            <span style={{ width: `${checklist.percent}%` }} />
          </div>
          <small>{`${checklist.done}/${checklist.total}`}</small>
        </div>
      )}
      <div className={styles.dateInfo}>
        <span>{task.fechaLimite ? formatDate(task.fechaLimite) : 'Sin fecha'}</span>
        {until !== null && <small>{until < 0 ? 'Vencida' : `${until} días`}</small>}
      </div>
      {task.link_vc && <span className={styles.video} aria-label="Tiene videollamada">📹</span>}
    </button>
  )
}
