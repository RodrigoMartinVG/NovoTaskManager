import { useMemo } from 'react'
import { PlannerService } from '../../../domains/planner/service'
import {
  selectHorasSemanaPorMateria,
  selectMateriasFiltradas,
  selectMatIdsActivos,
  selectSubjectsById,
  selectTaskTypesById,
  selectTareasFiltradas,
  selectUrgentTasks,
} from '../../../domains/planner/selectors'
import { getDiaActual, getMomentoActualEnFranjas, getPlannerNowParts } from '../../../domains/schedule/timezone'
import type { Materia } from '../../../domains/planner/types'
import { usePlannerStore } from '../../../store/usePlannerStore'
import { usePomoStore } from '../../../store/usePomoStore'
import { useUIStore } from '../../../store/useUIStore'
import { HeroClock } from './HeroClock'
import { CurrentSlotSection } from './CurrentSlotSection'
import { LaterSection } from './LaterSection'
import { UrgentTasksSection } from './UrgentTasksSection'
import styles from './HoyView.module.css'

export function HoyView() {
  const data = usePlannerStore((state) => state.data)
  const filters = useUIStore((state) => state.filters)
  const listFilters = useUIStore((state) => state.listFilters)
  const taskSelected = useUIStore((state) => state.taskSelected)
  const viewChanged = useUIStore((state) => state.viewChanged)
  const contextOpened = usePomoStore((state) => state.contextOpened)

  const franjasMap = PlannerService.getFranjas()
  const franjas = Object.values(franjasMap).sort((left, right) => left.startsAt.localeCompare(right.startsAt))
  const currentDia = getDiaActual()
  const currentFranja = getMomentoActualEnFranjas(franjasMap)
  const nowParts = getPlannerNowParts()
  const nowMinutes = nowParts.hour * 60 + nowParts.minute

  const materiasFiltradas = useMemo(() => {
    const byFilter = selectMateriasFiltradas(data, filters)
    if (!filters.anio || filters.anio === 'all') {
      return byFilter
    }
    return byFilter.filter((materia) => materia.anio === filters.anio)
  }, [data, filters])

  const materiasById = useMemo(() => selectSubjectsById(data.materias), [data.materias])
  const tiposById = useMemo(() => selectTaskTypesById(data.tipos), [data.tipos])
  const matIdsActivos = useMemo(() => selectMatIdsActivos(materiasFiltradas), [materiasFiltradas])
  const tareasFiltradas = useMemo(
    () => selectTareasFiltradas(data, matIdsActivos, listFilters),
    [data, matIdsActivos, listFilters],
  )
  const urgentTasks = useMemo(
    () => selectUrgentTasks(tareasFiltradas, data.alertas),
    [tareasFiltradas, data.alertas],
  )

  const materiasAhora = useMemo(
    () => materiasFiltradas.filter((materia) => materia.slots.some((slot) => slot.dia === currentDia && slot.momento === currentFranja)),
    [materiasFiltradas, currentDia, currentFranja],
  )

  const laterMaterias = useMemo(() => {
    return materiasFiltradas
      .map((materia) => {
        const upcoming = materia.slots
          .filter((slot) => slot.dia === currentDia)
          .map((slot) => {
            const franja = franjas.find((item) => item.id === slot.momento)
            if (!franja) {
              return null
            }
            const startParts = franja.startsAt.split(':')
            const startHour = Number(startParts[0] ?? '0')
            const startMinute = Number(startParts[1] ?? '0')
            const startsAtMinutes = startHour * 60 + startMinute
            return {
              materia,
              franja,
              startsAtMinutes,
            }
          })
          .filter((value): value is { materia: Materia; franja: (typeof franjas)[number]; startsAtMinutes: number } => value !== null)
          .filter((value) => value.startsAtMinutes > nowMinutes)
          .sort((left, right) => left.startsAtMinutes - right.startsAtMinutes)

        return upcoming[0] ?? null
      })
      .filter((value): value is { materia: Materia; franja: (typeof franjas)[number]; startsAtMinutes: number } => value !== null)
      .sort((left, right) => left.startsAtMinutes - right.startsAtMinutes)
  }, [materiasFiltradas, currentDia, franjas, nowMinutes])

  function onStartSession(materia: Materia) {
    contextOpened({
      materiaId: materia.id,
      tareaId: null,
      titulo: `Sesion · ${materia.nombre}`,
    })
  }

  return (
    <section className={styles.wrapper}>
      <HeroClock />

      <CurrentSlotSection
        currentFranja={currentFranja}
        currentFranjaLabel={franjas.find((item) => item.id === currentFranja)?.label ?? 'Actual'}
        materias={materiasAhora}
        horasPorMateria={(materiaId) => selectHorasSemanaPorMateria(data.sesiones, materiaId)}
        onStartSession={onStartSession}
        onOpenSemana={() => viewChanged('semana')}
      />

      <LaterSection
        items={laterMaterias}
        horasPorMateria={(materiaId) => selectHorasSemanaPorMateria(data.sesiones, materiaId)}
        onStartSession={onStartSession}
      />

      <UrgentTasksSection
        tasks={urgentTasks}
        materiasById={materiasById}
        tiposById={tiposById}
        alertas={data.alertas}
        onSelectTask={taskSelected}
      />
    </section>
  )
}
