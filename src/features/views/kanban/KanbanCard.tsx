import { daysUntil, formatDate } from '../../../utils/dateUtils'
import { getAlertColor } from '../../../domains/alerts/alertEngine'
import type { AlertasConfig, Materia, Tarea, TipoTarea } from '../../../domains/planner/types'
import styles from './KanbanCard.module.css'

interface KanbanCardProps {
  task: Tarea
  materia?: Materia | undefined
  tipo?: TipoTarea | undefined
  alertas?: AlertasConfig | undefined
  onSelect: (id: string) => void
  onDragStart: (id: string) => void
  onKeyboardMove: (id: string) => void
}

function progress(items: Tarea['items']): { done: number; total: number; percent: number } {
  const total = items.length
  if (total === 0) return { done: 0, total: 0, percent: 0 }
  const done = items.filter((i) => i.done).length
  return { done, total, percent: Math.round((done / total) * 100) }
}

export function KanbanCard({
  task,
  materia,
  tipo,
  alertas,
  onSelect,
  onDragStart,
  onKeyboardMove,
}: KanbanCardProps) {
  const alertColor = alertas ? getAlertColor(task, alertas) : null
  const until = task.fechaLimite ? daysUntil(task.fechaLimite) : null
  const checklist = progress(task.items)

  const urgClass =
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
    <div
      className={`${styles.card} ${urgClass}`}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move'
        onDragStart(task.id)
      }}
      onClick={() => onSelect(task.id)}
      role="button"
      tabIndex={0}
      aria-label={`Tarea ${task.titulo}. Presiona Enter o Espacio para mover de columna.`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onKeyboardMove(task.id)
        }
      }}
    >
      <div className={styles.colorBar} style={{ backgroundColor: materia?.color ?? 'var(--accent)' }} />
      <div className={styles.body}>
        <div className={styles.materiaName}>{materia?.nombre ?? 'Sin materia'}</div>
        <div className={styles.title}>{task.titulo}</div>
        <div className={styles.chips}>
          {task.hora && <span className={styles.hour}>{task.hora}</span>}
          {tipo && (
            <span className={styles.badge} style={{ background: tipo.bg, color: tipo.accent }}>
              {tipo.label}
            </span>
          )}
          {task.link_vc && <span className={styles.video} aria-label="Tiene videollamada">📹</span>}
        </div>
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
      </div>
    </div>
  )
}
