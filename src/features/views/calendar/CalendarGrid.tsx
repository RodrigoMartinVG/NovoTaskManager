import type { AlertasConfig } from '../../../domains/planner/types'
import { CalendarCell } from './CalendarCell'
import type { CalendarEventField, CalendarEventItem } from './CalendarEvent'
import styles from './CalendarGrid.module.css'

interface CalendarGridProps {
  currentMonth: Date
  eventsByDate: Record<string, CalendarEventItem[]>
  alertas?: AlertasConfig | undefined
  onSelectTask: (id: string) => void
  onDropEvent: (taskId: string, field: CalendarEventField, dateKey: string) => void
}

const DAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'] as const

function formatDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = `${date.getMonth() + 1}`.padStart(2, '0')
  const d = `${date.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${d}`
}

function buildGridDates(currentMonth: Date): Date[] {
  const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
  const startOffset = start.getDay()
  start.setDate(start.getDate() - startOffset)

  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
}

export function CalendarGrid({ currentMonth, eventsByDate, alertas, onSelectTask, onDropEvent }: CalendarGridProps) {
  const dates = buildGridDates(currentMonth)
  const today = formatDateKey(new Date())

  return (
    <section className={styles.gridWrap}>
      <div className={styles.headRow}>
        {DAY_LABELS.map((day) => (
          <span key={day} className={styles.dayHeader}>
            {day}
          </span>
        ))}
      </div>
      <div className={styles.grid}>
        {dates.map((date) => {
          const dateKey = formatDateKey(date)
          return (
            <CalendarCell
              key={dateKey}
              dateKey={dateKey}
              dayLabel={`${date.getDate()}`}
              isCurrentMonth={date.getMonth() === currentMonth.getMonth()}
              isToday={today === dateKey}
              events={eventsByDate[dateKey] ?? []}
              alertas={alertas}
              onSelectTask={onSelectTask}
              onDropEvent={onDropEvent}
            />
          )
        })}
      </div>
    </section>
  )
}
