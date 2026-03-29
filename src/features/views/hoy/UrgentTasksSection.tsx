import { getAlertColor } from '../../../domains/alerts/alertEngine'
import type { AlertasConfig, Materia, Tarea, TipoTarea } from '../../../domains/planner/types'
import { daysUntil, formatDate } from '../../../utils/dateUtils'
import styles from './UrgentTasksSection.module.css'

interface UrgentTasksSectionProps {
  tasks: Tarea[]
  materiasById: Record<string, Materia>
  tiposById: Record<string, TipoTarea>
  alertas?: AlertasConfig | undefined
  onSelectTask: (taskId: string) => void
}

function alertClass(color: ReturnType<typeof getAlertColor>) {
  if (color === 'start_overdue') return styles.alertOverdue
  if (color === 'start_now' || color === 'start_soon') return styles.alertSoon
  if (color === 'yellow') return styles.alertWarn
  return styles.alertNormal
}

export function UrgentTasksSection({
  tasks,
  materiasById,
  tiposById,
  alertas,
  onSelectTask,
}: UrgentTasksSectionProps) {
  if (tasks.length === 0) {
    return null
  }

  return (
    <section className={styles.section}>
      <header className={styles.header}>
        <h3 className={styles.title}>Tareas urgentes</h3>
        <span className={styles.count}>{tasks.length}</span>
      </header>

      <ul className={styles.list} role="list">
        {tasks.map((task) => {
          const materia = materiasById[task.materiaId]
          const tipo = tiposById[task.tipo]
          const color = alertas ? getAlertColor(task, alertas) : null
          const until = task.fechaLimite ? daysUntil(task.fechaLimite) : null

          return (
            <li key={task.id}>
              <button
                type="button"
                className={`${styles.task} ${alertClass(color)}`}
                onClick={() => onSelectTask(task.id)}
              >
                <div className={styles.main}>
                  <div className={styles.topLine}>
                    <svg className={styles.dot} viewBox="0 0 8 8" aria-hidden="true">
                      <circle cx="4" cy="4" r="4" fill={materia?.color ?? '#888888'} />
                    </svg>
                    <span className={styles.materia}>{materia?.nombre ?? 'Sin materia'}</span>
                    <span className={styles.tipo}>{tipo ? `${tipo.icon} ${tipo.label}` : 'Sin tipo'}</span>
                  </div>
                  <strong className={styles.taskTitle}>{task.titulo}</strong>
                </div>

                <div className={styles.dateInfo}>
                  <span>{task.fechaLimite ? formatDate(task.fechaLimite) : 'Sin fecha'}</span>
                  {until !== null && <small>{until < 0 ? 'Vencida' : `${until} dias`}</small>}
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}