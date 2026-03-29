import type { AlertasConfig, Materia, Tarea } from '../../../domains/planner/types'
import { getAlertColor } from '../../../domains/alerts/alertEngine'
import styles from './CalendarEvent.module.css'

export type CalendarEventField = 'fechaInicio' | 'fechaLimite'

export interface CalendarEventItem {
  id: string
  task: Tarea
  field: CalendarEventField
  materia?: Materia | undefined
}

interface CalendarEventProps {
  event: CalendarEventItem
  alertas?: AlertasConfig | undefined
  onSelectTask: (id: string) => void
}

export function CalendarEvent({ event, alertas, onSelectTask }: CalendarEventProps) {
  const alert = alertas ? getAlertColor(event.task, alertas) : null
  const markerClass =
    alert === 'start_overdue'
      ? styles.overdue
      : alert === 'start_now' || alert === 'start_soon'
        ? styles.soon
        : alert === 'yellow'
          ? styles.warn
          : styles.normal

  return (
    <button
      type="button"
      className={styles.event}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('application/uai-calendar-event', JSON.stringify({
          taskId: event.task.id,
          field: event.field,
        }))
      }}
      onClick={() => onSelectTask(event.task.id)}
      title={event.task.titulo}
    >
      <span className={styles.dot} style={{ backgroundColor: event.materia?.color ?? 'var(--accent)' }} />
      <span className={styles.title}>{event.task.titulo}</span>
      <span className={`${styles.marker} ${markerClass}`}>{event.field === 'fechaInicio' ? 'I' : 'F'}</span>
    </button>
  )
}
