import type { AlertasConfig, Materia, Tarea, TipoTarea } from '../../../domains/planner/types'
import { BacklogRow } from './BacklogRow'
import styles from './BacklogList.module.css'

interface BacklogListProps {
  tasks: Tarea[]
  materiasById: Record<string, Materia>
  tiposById: Record<string, TipoTarea>
  alertas?: AlertasConfig | undefined
  onSelectTask: (id: string) => void
}

function sortBacklogTasks(tasks: Tarea[]): Tarea[] {
  return [...tasks].sort((a, b) => {
    if (a.estado === 'completado' && b.estado !== 'completado') return 1
    if (a.estado !== 'completado' && b.estado === 'completado') return -1

    const aDate = a.fechaLimite
    const bDate = b.fechaLimite
    if (!aDate && !bDate) return a.titulo.localeCompare(b.titulo)
    if (!aDate) return 1
    if (!bDate) return -1
    return aDate.localeCompare(bDate)
  })
}

export function BacklogList({ tasks, materiasById, tiposById, alertas, onSelectTask }: BacklogListProps) {
  const ordered = sortBacklogTasks(tasks)

  return (
    <ul className={styles.list} role="list" aria-label="Lista de tareas backlog">
      {ordered.map((task) => (
        <li key={task.id} role="listitem">
          <BacklogRow
            task={task}
            materia={materiasById[task.materiaId]}
            tipo={tiposById[task.tipo]}
            alertas={alertas}
            onSelect={onSelectTask}
          />
        </li>
      ))}
    </ul>
  )
}
