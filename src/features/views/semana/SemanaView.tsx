import { useMemo, useState } from 'react'
import { PlannerService } from '../../../domains/planner/service'
import { selectMateriasFiltradas } from '../../../domains/planner/selectors'
import { DIAS } from '../../../domains/schedule/franjas'
import { getDiaActual, getMomentoActualEnFranjas } from '../../../domains/schedule/timezone'
import type { DiaId, FranjaId, Materia } from '../../../domains/planner/types'
import { usePlannerStore } from '../../../store/usePlannerStore'
import { useUIStore } from '../../../store/useUIStore'
import { HorizontalGrid } from './HorizontalGrid'
import { VerticalGrid } from './VerticalGrid'
import styles from './SemanaView.module.css'

interface DragInfo {
  materiaId: string
  fromDia: DiaId
  fromFranjaId: FranjaId
}

interface OpenCell {
  dia: DiaId
  franjaId: FranjaId
}

const DAY_LABELS: Record<DiaId, string> = {
  lun: 'Lunes',
  mar: 'Martes',
  mie: 'Miercoles',
  jue: 'Jueves',
  vie: 'Viernes',
  sab: 'Sabado',
  dom: 'Domingo',
}

function cellKey(dia: DiaId, franjaId: FranjaId): string {
  return `${dia}:${franjaId}`
}

export function SemanaView() {
  const data = usePlannerStore((state) => state.data)
  const materiaSlotMovido = usePlannerStore((state) => state.materiaSlotMovido)
  const materiaHorasCambiadas = usePlannerStore((state) => state.materiaHorasCambiadas)
  const filters = useUIStore((state) => state.filters)
  const weekLayout = useUIStore((state) => state.weekLayout)
  const weekLayoutChanged = useUIStore((state) => state.weekLayoutChanged)
  const settingsOpened = useUIStore((state) => state.settingsOpened)

  const [dragInfo, setDragInfo] = useState<DragInfo | null>(null)
  const [openCell, setOpenCell] = useState<OpenCell | null>(null)

  const franjasMap = PlannerService.getFranjas()
  const franjas = Object.values(franjasMap).sort((left, right) => left.startsAt.localeCompare(right.startsAt))
  const currentDia = getDiaActual()
  const currentFranja = getMomentoActualEnFranjas(franjasMap)

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

  const totalSlots = useMemo(
    () => materiasFiltradas.reduce((count, materia) => count + materia.slots.length, 0),
    [materiasFiltradas],
  )

  function toggleCell(dia: DiaId, franjaId: FranjaId) {
    setOpenCell((current) => {
      if (current?.dia === dia && current.franjaId === franjaId) {
        return null
      }
      return { dia, franjaId }
    })
  }

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

  if (materiasFiltradas.length === 0) {
    return (
      <section className={styles.wrapper}>
        <header className={styles.header}>
          <div>
            <h2 className={styles.title}>Semana</h2>
            <p className={styles.subtitle}>Organiza los slots semanales por dia y franja.</p>
          </div>
          <div className={styles.layoutSwitch}>
            <button
              type="button"
              className={`${styles.layoutButton} ${weekLayout === 'horizontal' ? styles.layoutButtonActive : ''}`}
              onClick={() => weekLayoutChanged('horizontal')}
            >
              ⇆ Horizontal
            </button>
            <button
              type="button"
              className={`${styles.layoutButton} ${weekLayout === 'vertical' ? styles.layoutButtonActive : ''}`}
              onClick={() => weekLayoutChanged('vertical')}
            >
              ⇅ Vertical
            </button>
          </div>
        </header>
        <p className={styles.empty}>
          {data.materias.length === 0
            ? <>
                Agrega tus materias para armar el horario semanal.
                <button type="button" className={styles.emptyAction} onClick={() => settingsOpened('materias')}>Abrir Configuracion ⚙</button>
              </>
            : 'No hay materias para los filtros actuales.'}
        </p>
      </section>
    )
  }

  const sharedProps = {
    dias: DIAS,
    franjas,
    currentDia,
    currentFranja,
    materiasByCell,
    materiasFiltradas,
    openCell,
    dayLabels: DAY_LABELS,
    onToggleCell: toggleCell,
    onClosePopover: () => setOpenCell(null),
    onDragStart: (materiaId: string, fromDia: DiaId, fromFranjaId: FranjaId) =>
      setDragInfo({ materiaId, fromDia, fromFranjaId }),
    onDragEnd: () => setDragInfo(null),
    onDropMateria: handleDropMateria,
    onAddMateria: handleAddMateria,
    onRemoveMateria: handleRemoveMateria,
  }

  return (
    <section className={styles.wrapper}>
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>Semana</h2>
          <p className={styles.subtitle}>Arrastra materias entre celdas o haz clic para editar el slot.</p>
        </div>

        <div className={styles.controls}>
          <span className={styles.meta}>{`${materiasFiltradas.length} materias · ${totalSlots} slots`}</span>
          <div className={styles.layoutSwitch}>
            <button
              type="button"
              className={`${styles.layoutButton} ${weekLayout === 'horizontal' ? styles.layoutButtonActive : ''}`}
              onClick={() => weekLayoutChanged('horizontal')}
            >
              ⇆ Horizontal
            </button>
            <button
              type="button"
              className={`${styles.layoutButton} ${weekLayout === 'vertical' ? styles.layoutButtonActive : ''}`}
              onClick={() => weekLayoutChanged('vertical')}
            >
              ⇅ Vertical
            </button>
          </div>
        </div>
      </header>

      {weekLayout === 'horizontal' ? <HorizontalGrid {...sharedProps} /> : <VerticalGrid {...sharedProps} />}
    </section>
  )
}
