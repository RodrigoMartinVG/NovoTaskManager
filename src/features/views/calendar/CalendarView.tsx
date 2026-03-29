import { useMemo } from 'react'
import { selectMatIdsActivos, selectTareasFiltradas, selectSubjectsById } from '../../../domains/planner/selectors'
import { usePlannerStore } from '../../../store/usePlannerStore'
import { useUIStore } from '../../../store/useUIStore'
import { useLocalStorage } from '../../../shared/hooks/useLocalStorage'
import { CalendarHeader } from './CalendarHeader'
import { CalendarGrid } from './CalendarGrid'
import type { CalendarEventItem } from './CalendarEvent'
import styles from './CalendarView.module.css'

function parseLocalDateString(raw: string): Date | null {
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) {
    return null
  }

  const [, year, month, day] = match
  const parsed = new Date(Number(year), Number(month) - 1, Number(day))
  if (Number.isNaN(parsed.getTime())) {
    return null
  }
  return parsed
}

function parseMonth(raw: string): Date {
  const date = parseLocalDateString(raw) ?? new Date(raw)
  if (Number.isNaN(date.getTime())) {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  }
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function monthToString(date: Date): string {
  const y = date.getFullYear()
  const m = `${date.getMonth() + 1}`.padStart(2, '0')
  return `${y}-${m}-01`
}

export function CalendarView() {
  const data = usePlannerStore((state) => state.data)
  const tareaFechaCambiada = usePlannerStore((state) => state.tareaFechaCambiada)
  const listFilters = useUIStore((state) => state.listFilters)
  const calendarFilters = useUIStore((state) => state.calendarFilters)
  const taskSelected = useUIStore((state) => state.taskSelected)
  const calendarInicioToggled = useUIStore((state) => state.calendarInicioToggled)
  const calendarFinToggled = useUIStore((state) => state.calendarFinToggled)
  const [storedMonth, setStoredMonth] = useLocalStorage('uai-calendar-current-month', monthToString(new Date()))

  const currentMonth = useMemo(() => parseMonth(storedMonth), [storedMonth])

  const materiaIds = useMemo(() => selectMatIdsActivos(data.materias), [data.materias])
  const tareasFiltradas = useMemo(
    () => selectTareasFiltradas(data, materiaIds, listFilters),
    [data, materiaIds, listFilters],
  )
  const materiasById = useMemo(() => selectSubjectsById(data.materias), [data.materias])

  const eventsByDate = useMemo(() => {
    const byDate: Record<string, CalendarEventItem[]> = {}

    for (const task of tareasFiltradas) {
      if (calendarFilters.showInicio && task.fechaInicio) {
        const event: CalendarEventItem = {
          id: `${task.id}-inicio-${task.fechaInicio}`,
          task,
          field: 'fechaInicio',
          materia: materiasById[task.materiaId],
        }
        byDate[task.fechaInicio] = [...(byDate[task.fechaInicio] ?? []), event]
      }

      if (calendarFilters.showFin && task.fechaLimite) {
        const event: CalendarEventItem = {
          id: `${task.id}-limite-${task.fechaLimite}`,
          task,
          field: 'fechaLimite',
          materia: materiasById[task.materiaId],
        }
        byDate[task.fechaLimite] = [...(byDate[task.fechaLimite] ?? []), event]
      }
    }

    return byDate
  }, [tareasFiltradas, calendarFilters.showInicio, calendarFilters.showFin, materiasById])

  const totalEvents = useMemo(() => Object.values(eventsByDate).reduce((acc, list) => acc + list.length, 0), [eventsByDate])

  function changeMonth(delta: number) {
    const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + delta, 1)
    setStoredMonth(monthToString(next))
  }

  return (
    <section className={styles.wrapper}>
      <header className={styles.top}>
        <h2 className={styles.title}>Calendario</h2>
        <span className={styles.meta}>{`${totalEvents} eventos`}</span>
      </header>

      <CalendarHeader
        currentMonth={currentMonth}
        showInicio={calendarFilters.showInicio}
        showFin={calendarFilters.showFin}
        onPrevMonth={() => changeMonth(-1)}
        onNextMonth={() => changeMonth(1)}
        onToggleInicio={calendarInicioToggled}
        onToggleFin={calendarFinToggled}
      />

      <CalendarGrid
        currentMonth={currentMonth}
        eventsByDate={eventsByDate}
        alertas={data.alertas}
        onSelectTask={taskSelected}
        onDropEvent={(taskId, field, dateKey) => tareaFechaCambiada(taskId, field, dateKey)}
      />
    </section>
  )
}
