import { useMemo, useState } from 'react'
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
import { DIAS } from '../../../domains/schedule/franjas'
import { getDiaActual, getMomentoActualEnFranjas, getPlannerNowParts } from '../../../domains/schedule/timezone'
import type { DiaId, FranjaId, Materia } from '../../../domains/planner/types'
import { usePlannerStore } from '../../../store/usePlannerStore'
import { usePomoStore } from '../../../store/usePomoStore'
import { useUIStore } from '../../../store/useUIStore'
import { CurrentSlotSection } from './CurrentSlotSection'
import { LaterSection } from './LaterSection'
import { UrgentTasksSection } from './UrgentTasksSection'
import { WeekReferenceSection } from './WeekReferenceSection'
import styles from './HoyView.module.css'

const DAY_LABELS: Record<DiaId, string> = {
  lun: 'Lunes',
  mar: 'Martes',
  mie: 'Miercoles',
  jue: 'Jueves',
  vie: 'Viernes',
  sab: 'Sabado',
  dom: 'Domingo',
}

function franjaEmoji(franjaId: FranjaId): string {
  if (franjaId.startsWith('manana')) return '🌅'
  if (franjaId.startsWith('tarde')) return '☀'
  return '🌙'
}

function cellKey(dia: DiaId, franjaId: FranjaId): string {
  return `${dia}:${franjaId}`
}

export function HoyView() {
  const data = usePlannerStore((state) => state.data)
  const materiaSlotMovido = usePlannerStore((state) => state.materiaSlotMovido)
  const materiaHorasCambiadas = usePlannerStore((state) => state.materiaHorasCambiadas)
  const filters = useUIStore((state) => state.filters)
  const listFilters = useUIStore((state) => state.listFilters)
  const weekLayout = useUIStore((state) => state.weekLayout)
  const weekLayoutChanged = useUIStore((state) => state.weekLayoutChanged)
  const taskSelected = useUIStore((state) => state.taskSelected)
  const viewChanged = useUIStore((state) => state.viewChanged)
  const contextOpened = usePomoStore((state) => state.contextOpened)

  const [dragInfo, setDragInfo] = useState<{ materiaId: string; fromDia: DiaId; fromFranjaId: FranjaId } | null>(null)
  const [openCell, setOpenCell] = useState<{ dia: DiaId; franjaId: FranjaId } | null>(null)

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

  const materiasByCell = useMemo(() => {
    return materiasFiltradas.reduce<Record<string, Materia[]>>((acc, materia) => {
      for (const slot of materia.slots) {
        const key = cellKey(slot.dia, slot.momento)
        acc[key] = [...(acc[key] ?? []), materia]
      }
      return acc
    }, {})
  }, [materiasFiltradas])

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

  function updateMateriaSlots(
    materiaId: string,
    updater: (materia: Materia) => { slots: Materia['slots'] } | null,
  ) {
    const materia = data.materias.find((item) => item.id === materiaId)
    if (!materia) {
      return
    }

    const next = updater(materia)
    if (!next) {
      return
    }

    materiaHorasCambiadas(materia.id, materia.horasMin, materia.horasMax, next.slots)
  }

  function onStartSession(materia: Materia) {
    contextOpened({
      materiaId: materia.id,
      tareaId: null,
      titulo: `Sesion · ${materia.nombre}`,
    })
  }

  function handleDropMateria(dia: DiaId, franjaId: FranjaId) {
    if (!dragInfo) {
      return
    }

    const alreadyAssigned = data.materias
      .find((materia) => materia.id === dragInfo.materiaId)
      ?.slots.some((slot) => slot.dia === dia && slot.momento === franjaId)

    if (!alreadyAssigned && (dragInfo.fromDia !== dia || dragInfo.fromFranjaId !== franjaId)) {
      materiaSlotMovido(
        dragInfo.materiaId,
        { dia: dragInfo.fromDia, momento: dragInfo.fromFranjaId },
        { dia, momento: franjaId },
      )
    }

    setDragInfo(null)
  }

  function handleAddMateria(materiaId: string, dia: DiaId, franjaId: FranjaId) {
    updateMateriaSlots(materiaId, (materia) => {
      const exists = materia.slots.some((slot) => slot.dia === dia && slot.momento === franjaId)
      if (exists) {
        return null
      }

      return {
        slots: [...materia.slots, { dia, momento: franjaId }],
      }
    })
  }

  function handleRemoveMateria(materiaId: string, dia: DiaId, franjaId: FranjaId) {
    updateMateriaSlots(materiaId, (materia) => ({
      slots: materia.slots.filter((slot) => !(slot.dia === dia && slot.momento === franjaId)),
    }))
  }

  const totalWeeklySlots = useMemo(
    () => materiasFiltradas.reduce((count, materia) => count + materia.slots.length, 0),
    [materiasFiltradas],
  )

  return (
    <section className={styles.wrapper}>
      <header className={styles.header}>
        <h2 className={styles.title}>Hoy</h2>
        <p className={styles.subtitle}>{`${DAY_LABELS[currentDia]} · ${franjaEmoji(currentFranja)} ${franjas.find((item) => item.id === currentFranja)?.label ?? 'Franja actual'}`}</p>
      </header>

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

      <WeekReferenceSection
        title="📅 Semana"
        subtitle={`${materiasFiltradas.length} materias · ${totalWeeklySlots} slots`}
        weekLayout={weekLayout}
        onChangeLayout={weekLayoutChanged}
        dias={DIAS}
        franjas={franjas}
        currentDia={currentDia}
        currentFranja={currentFranja}
        materiasByCell={materiasByCell}
        materiasFiltradas={materiasFiltradas}
        openCell={openCell}
        dayLabels={DAY_LABELS}
        onToggleCell={(dia, franjaId) =>
          setOpenCell((current) =>
            current?.dia === dia && current.franjaId === franjaId ? null : { dia, franjaId },
          )
        }
        onClosePopover={() => setOpenCell(null)}
        onDragStart={(materiaId, fromDia, fromFranjaId) => setDragInfo({ materiaId, fromDia, fromFranjaId })}
        onDragEnd={() => setDragInfo(null)}
        onDropMateria={handleDropMateria}
        onAddMateria={handleAddMateria}
        onRemoveMateria={handleRemoveMateria}
      />
    </section>
  )
}
