import { Fragment } from 'react'
import type { DiaId, FranjaHoraria, FranjaId, Materia } from '../../../domains/planner/types'
import { SemanaCell } from './SemanaCell'
import styles from './WeekGrid.module.css'

interface HorizontalGridProps {
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

export function HorizontalGrid({
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
}: HorizontalGridProps) {
  const gridClassName = `${styles.grid} ${franjas.length === 3 ? styles.gridHorizontalThree : styles.gridHorizontalSix} ${compact ? styles.compact : ''}`

  return (
    <div className={styles.wrapper}>
      <div className={gridClassName}>
        <div className={styles.corner}>Franja</div>
        {dias.map((dia) => (
          <div
            key={dia}
            className={`${styles.headerCell} ${dia === currentDia ? styles.currentHeader : ''}`}
          >
            {dayLabels[dia]}
          </div>
        ))}

        {franjas.map((franja) => (
          <Fragment key={franja.id}>
            <div className={styles.rowHeader}>
              <span className={styles.rowBadge}>{franjaEmoji(franja.id)}</span>
              <div>
                <strong className={styles.rowLabel}>{franja.label}</strong>
                <span className={styles.rowMeta}>{`${franja.startsAt} - ${franja.endsAt}`}</span>
              </div>
            </div>

            {dias.map((dia) => (
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