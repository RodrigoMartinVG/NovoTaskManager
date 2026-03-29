import type { AlertasConfig } from '../../../domains/planner/types'
import { CalendarEvent, type CalendarEventItem, type CalendarEventField } from './CalendarEvent'
import styles from './CalendarCell.module.css'

interface CalendarCellProps {
  dateKey: string
  dayLabel: string
  isCurrentMonth: boolean
  isToday: boolean
  events: CalendarEventItem[]
  alertas?: AlertasConfig | undefined
  onSelectTask: (id: string) => void
  onDropEvent: (taskId: string, field: CalendarEventField, dateKey: string) => void
}

export function CalendarCell({
  dateKey,
  dayLabel,
  isCurrentMonth,
  isToday,
  events,
  alertas,
  onSelectTask,
  onDropEvent,
}: CalendarCellProps) {
  const visible = events.slice(0, 4)
  const hiddenCount = Math.max(0, events.length - visible.length)

  return (
    <div
      className={`${styles.cell} ${!isCurrentMonth ? styles.outMonth : ''} ${isToday ? styles.today : ''}`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault()
        const raw = e.dataTransfer.getData('application/uai-calendar-event')
        if (!raw) {
          return
        }
        try {
          const parsed = JSON.parse(raw) as { taskId?: string; field?: CalendarEventField }
          if (parsed.taskId && (parsed.field === 'fechaInicio' || parsed.field === 'fechaLimite')) {
            onDropEvent(parsed.taskId, parsed.field, dateKey)
          }
        } catch {
          // Ignore malformed drop payloads.
        }
      }}
    >
      <div className={styles.head}>
        <span>{dayLabel}</span>
      </div>
      <div className={styles.events}>
        {visible.map((event) => (
          <CalendarEvent key={event.id} event={event} alertas={alertas} onSelectTask={onSelectTask} />
        ))}
        {hiddenCount > 0 && <span className={styles.more}>{`+${hiddenCount} mas`}</span>}
      </div>
    </div>
  )
}
