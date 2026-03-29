import { usePlannerStore } from '../../../store/usePlannerStore'
import { KanbanBoard } from './KanbanBoard'
import styles from './KanbanView.module.css'

export function KanbanView() {
  const tareas = usePlannerStore((state) => state.data.tareas)
  const totalActivas = tareas.filter((t) => t.estado !== 'completado').length

  return (
    <section className={styles.wrapper}>
      <header className={styles.header}>
        <h2 className={styles.title}>Kanban</h2>
        <span className={styles.meta}>{`${totalActivas} activas`}</span>
      </header>
      <KanbanBoard />
    </section>
  )
}
