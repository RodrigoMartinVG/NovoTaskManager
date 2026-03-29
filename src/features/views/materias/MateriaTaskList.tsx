import { formatDate } from '../../../utils/dateUtils'
import type { Tarea } from '../../../domains/planner/types'
import styles from './MateriaTaskList.module.css'

interface MateriaTaskListProps {
  tareas: Tarea[]
}

function sortTasks(tasks: Tarea[]): Tarea[] {
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

export function MateriaTaskList({ tareas }: MateriaTaskListProps) {
  const ordered = sortTasks(tareas)

  return (
    <div className={styles.wrap}>
      <h4 className={styles.title}>Tareas</h4>
      {ordered.length === 0 ? (
        <p className={styles.empty}>No hay tareas en esta materia.</p>
      ) : (
        <ul className={styles.list}>
          {ordered.map((task) => (
            <li key={task.id} className={`${styles.item} ${task.estado === 'completado' ? styles.done : ''}`}>
              <span className={styles.name}>{task.titulo}</span>
              <span className={styles.meta}>{task.fechaLimite ? formatDate(task.fechaLimite) : 'Sin fecha'}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
