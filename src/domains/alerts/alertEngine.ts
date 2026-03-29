import { daysUntil } from '@/utils/dateUtils'
import type { AlertColor, AlertasConfig, Tarea } from '../planner/types'

export function getAlertColor(tarea: Tarea, config: AlertasConfig): AlertColor | null {
  if (tarea.estado === 'completado' || !config.enabled) {
    return null
  }

  if (!tarea.fechaLimite) {
    return null
  }

  const dias = daysUntil(tarea.fechaLimite)
  if (dias === null) {
    return null
  }

  if (dias < 0) {
    return 'start_overdue'
  }

  if (dias === 0) {
    return 'start_now'
  }

  if (dias <= config.dueSoonDays) {
    return 'start_soon'
  }

  if (dias <= config.dueSoonDays + 2) {
    return 'yellow'
  }

  return 'green'
}

export function getUrgentTaskSummary(tareas: Tarea[], alertas?: AlertasConfig) {
  const summary = {
    red: 0,
    yellow: 0,
    green: 0,
    start_overdue: 0,
    start_now: 0,
    start_soon: 0,
  } as Record<AlertColor, number>

  if (!alertas || !alertas.enabled) {
    return summary
  }

  tareas.forEach((tarea) => {
    const color = getAlertColor(tarea, alertas)
    if (color) {
      summary[color] += 1
    }
  })

  return summary
}
