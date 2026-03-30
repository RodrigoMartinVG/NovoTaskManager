import { useMemo } from 'react'
import {
  selectMatIdsActivos,
  selectSubjectsById,
  selectTaskTypesById,
  selectTareasFiltradas,
} from '../../../domains/planner/selectors'
import { usePlannerStore } from '../../../store/usePlannerStore'
import { useUIStore } from '../../../store/useUIStore'
import { BacklogList } from './BacklogList'
import styles from './BacklogView.module.css'

export function BacklogView() {
  const data = usePlannerStore((state) => state.data)
  const listFilters = useUIStore((state) => state.listFilters)
  const taskSelected = useUIStore((state) => state.taskSelected)
  const taskEditOpened = useUIStore((state) => state.taskEditOpened)

  const materiaIds = useMemo(() => selectMatIdsActivos(data.materias), [data.materias])
  const tareasFiltradas = useMemo(
    () => selectTareasFiltradas(data, materiaIds, listFilters),
    [data, materiaIds, listFilters],
  )
  const materiasById = useMemo(() => selectSubjectsById(data.materias), [data.materias])
  const tiposById = useMemo(() => selectTaskTypesById(data.tipos), [data.tipos])

  if (tareasFiltradas.length === 0) {
    return (
      <section className={styles.wrapper}>
        <header className={styles.header}>
          <h2 className={styles.title}>Backlog</h2>
          <span className={styles.meta}>0 tareas</span>
        </header>
        <div className={styles.empty}>
          {data.tareas.length === 0
            ? <>
                Todavia no hay tareas cargadas.
                <button type="button" className={styles.emptyAction} onClick={() => taskEditOpened({})}>+ Nueva tarea</button>
              </>
            : 'No hay tareas para los filtros actuales.'}
        </div>
      </section>
    )
  }

  return (
    <section className={styles.wrapper}>
      <header className={styles.header}>
        <h2 className={styles.title}>Backlog</h2>
        <span className={styles.meta}>{`${tareasFiltradas.length} tareas`}</span>
      </header>
      <BacklogList
        tasks={tareasFiltradas}
        materiasById={materiasById}
        tiposById={tiposById}
        alertas={data.alertas}
        onSelectTask={taskSelected}
      />
    </section>
  )
}
