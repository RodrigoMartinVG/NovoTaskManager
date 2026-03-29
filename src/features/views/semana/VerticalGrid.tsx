import { Fragment } from 'react'
import type { DiaId, FranjaHoraria, FranjaId, Materia } from '../../../domains/planner/types'
import { SemanaCell } from './SemanaCell'
import styles from './WeekGrid.module.css'

interface VerticalGridProps {
  dias: readonly DiaId[]
  franjas: FranjaHoraria[]
  currentDia: DiaId
  currentFranja: FranjaId
  materiasByCell: Record<string, Materia[]>
  materiasFiltradas: Materia[]
  openCell: { dia: DiaId; franjaId: FranjaId } | null
  dayLabels: Record<DiaId, string>
  onToggleCell: (dia: DiaId, franjaId: FranjaId) => void
  onClosePopover: () => void
  onDragStart: (materiaId: string, fromDia: DiaId, fromFranjaId: FranjaId) => void
  onDragEnd: () => void
  onDropMateria: (dia: DiaId, franjaId: FranjaId) => void
  onAddMateria: (materiaId: string, dia: DiaId, franjaId: FranjaId) => void
  onRemoveMateria: (materiaId: string, dia: DiaId, franjaId: FranjaId) => void
  compact?: boolean | undefined
}

function cellKey(dia: DiaId, franjaId: FranjaId): string {
  return `${dia}:${franjaId}`
}

function franjaEmoji(franjaId: FranjaId): string {
  if (franjaId.startsWith('manana')) return '🌅'
  if (franjaId.startsWith('tarde')) return '☀'
  return '🌙'
}

export function VerticalGrid({
  dias,
  franjas,
  currentDia,
  currentFranja,
  materiasByCell,
  materiasFiltradas,
  openCell,
  dayLabels,
  onToggleCell,
  onClosePopover,
  onDragStart,
  onDragEnd,
  onDropMateria,
  onAddMateria,
  onRemoveMateria,
  compact = false,
}: VerticalGridProps) {
  const gridClassName = `${styles.grid} ${franjas.length === 3 ? styles.gridVerticalThree : styles.gridVerticalSix} ${compact ? styles.compact : ''}`

  return (
    <div className={styles.wrapper}>
      <div className={gridClassName}>
        <div className={styles.corner}>Dia</div>
        {franjas.map((franja) => (
          <div
            key={franja.id}
            className={`${styles.headerCell} ${franja.id === currentFranja ? styles.currentHeader : ''}`}
          >
            <span className={styles.headerEmoji}>{franjaEmoji(franja.id)}</span>
            <span>{franja.label}</span>
          </div>
        ))}

        {dias.map((dia) => (
          <Fragment key={dia}>
            <div className={`${styles.rowHeader} ${dia === currentDia ? styles.currentHeader : ''}`}>
              <strong className={styles.rowLabel}>{dayLabels[dia]}</strong>
              <span className={styles.rowMeta}>Slots del dia</span>
            </div>

            {franjas.map((franja) => (
              <SemanaCell
                key={cellKey(dia, franja.id)}
                dia={dia}
                franjaId={franja.id}
                franjaLabel={franja.label}
                diaLabel={dayLabels[dia]}
                materias={materiasByCell[cellKey(dia, franja.id)] ?? []}
                allMaterias={materiasFiltradas}
                isCurrent={dia === currentDia && franja.id === currentFranja}
                isOpen={openCell?.dia === dia && openCell.franjaId === franja.id}
                onToggleOpen={() => onToggleCell(dia, franja.id)}
                onClosePopover={onClosePopover}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onDropMateria={() => onDropMateria(dia, franja.id)}
                onAddMateria={(materiaId) => onAddMateria(materiaId, dia, franja.id)}
                onRemoveMateria={(materiaId) => onRemoveMateria(materiaId, dia, franja.id)}
                compact={compact}
              />
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  )
}