import { useMemo } from 'react'
import { selectHorasSemanaPorMateria, selectMateriasFiltradas } from '../../../domains/planner/selectors'
import { usePlannerStore } from '../../../store/usePlannerStore'
import { useUIStore } from '../../../store/useUIStore'
import { MateriaCard } from './MateriaCard'
import styles from './MateriasView.module.css'

export function MateriasView() {
  const data = usePlannerStore((state) => state.data)
  const sesionActualizada = usePlannerStore((state) => state.sesionActualizada)
  const sesionEliminada = usePlannerStore((state) => state.sesionEliminada)
  const filters = useUIStore((state) => state.filters)
  const confirmOpened = useUIStore((state) => state.confirmOpened)

  const materiasFiltradas = useMemo(() => {
    const byFilter = selectMateriasFiltradas(data, filters)
    if (!filters.anio || filters.anio === 'all') {
      return byFilter
    }
    return byFilter.filter((materia) => materia.anio === filters.anio)
  }, [data, filters])

  function handleDeleteSesion(id: string, title: string) {
    confirmOpened({
      title: 'Eliminar sesion',
      description: `Se eliminara la sesion "${title}". Esta accion no se puede deshacer.`,
      confirmLabel: 'Eliminar',
      cancelLabel: 'Cancelar',
      onConfirm: () => sesionEliminada(id),
    })
  }

  if (materiasFiltradas.length === 0) {
    return (
      <section className={styles.wrapper}>
        <header className={styles.header}>
          <h2 className={styles.title}>Materias</h2>
          <span className={styles.meta}>0 materias</span>
        </header>
        <p className={styles.empty}>No hay materias para los filtros actuales.</p>
      </section>
    )
  }

  return (
    <section className={styles.wrapper}>
      <header className={styles.header}>
        <h2 className={styles.title}>Materias</h2>
        <span className={styles.meta}>{`${materiasFiltradas.length} materias`}</span>
      </header>
      <div className={styles.list}>
        {materiasFiltradas.map((materia) => {
          const sesiones = data.sesiones.filter((sesion) => sesion.materiaId === materia.id)
          const tareas = data.tareas.filter((tarea) => tarea.materiaId === materia.id)
          return (
            <MateriaCard
              key={materia.id}
              materia={materia}
              horasSemana={selectHorasSemanaPorMateria(data.sesiones, materia.id)}
              sesiones={sesiones}
              tareas={tareas}
              onUpdateSesion={sesionActualizada}
              onDeleteSesion={handleDeleteSesion}
            />
          )
        })}
      </div>
    </section>
  )
}
