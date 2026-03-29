import { useState } from 'react'
import type { DiaId, FranjaId, Materia } from '../../../domains/planner/types'
import { SlotEditPopover } from './SlotEditPopover'
import styles from './SemanaCell.module.css'

interface SemanaCellProps {
  dia: DiaId
  franjaId: FranjaId
  diaLabel: string
  franjaLabel: string
  materias: Materia[]
  allMaterias: Materia[]
  isCurrent: boolean
  isOpen: boolean
  onToggleOpen: () => void
  onClosePopover: () => void
  onDragStart: (materiaId: string, fromDia: DiaId, fromFranjaId: FranjaId) => void
  onDragEnd: () => void
  onDropMateria: () => void
  onAddMateria: (materiaId: string) => void
  onRemoveMateria: (materiaId: string) => void
  compact?: boolean | undefined
}

export function SemanaCell({
  dia,
  franjaId,
  diaLabel,
  franjaLabel,
  materias,
  allMaterias,
  isCurrent,
  isOpen,
  onToggleOpen,
  onClosePopover,
  onDragStart,
  onDragEnd,
  onDropMateria,
  onAddMateria,
  onRemoveMateria,
  compact = false,
}: SemanaCellProps) {
  const [isOver, setIsOver] = useState(false)

  const assignedIds = new Set(materias.map((materia) => materia.id))
  const availableMaterias = allMaterias.filter((materia) => !assignedIds.has(materia.id))

  return (
    <div
      className={`${styles.cell} ${compact ? styles.compact : ''} ${isCurrent ? styles.current : ''} ${isOver ? styles.over : ''} ${isOpen ? styles.open : ''}`}
      onClick={onToggleOpen}
      onDragOver={(event) => {
        event.preventDefault()
        setIsOver(true)
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(event) => {
        event.preventDefault()
        setIsOver(false)
        onDropMateria()
      }}
    >
      <div className={styles.cellHeader}>
        <span className={styles.cellMeta}>{materias.length === 0 ? 'Libre' : `${materias.length} asignadas`}</span>
        <div className={styles.headerActions}>
          {isCurrent && <span className={styles.currentPill}>Ahora</span>}
          <button
            type="button"
            className={styles.editButton}
            onClick={(event) => {
              event.stopPropagation()
              onToggleOpen()
            }}
            aria-label={`Editar slot ${diaLabel} ${franjaLabel}`}
          >
            Editar
          </button>
        </div>
      </div>

      {materias.length > 0 ? (
        <div className={styles.chips}>
          {materias.map((materia) => (
            <button
              key={materia.id}
              type="button"
              className={styles.chip}
              draggable
              onClick={(event) => event.stopPropagation()}
              onDragStart={(event) => {
                event.stopPropagation()
                event.dataTransfer.effectAllowed = 'move'
                event.dataTransfer.setData('text/plain', `${materia.id}:${dia}:${franjaId}`)
                onDragStart(materia.id, dia, franjaId)
              }}
              onDragEnd={() => onDragEnd()}
            >
              <svg className={styles.chipDot} viewBox="0 0 8 8" aria-hidden="true">
                <circle cx="4" cy="4" r="4" fill={materia.color} />
              </svg>
              <span className={styles.chipText}>{materia.nombre}</span>
            </button>
          ))}
        </div>
      ) : (
        <p className={styles.emptyHint}>Haz clic para agregar materia o suelta un chip aqui.</p>
      )}

      {isOpen && (
        <SlotEditPopover
          diaLabel={diaLabel}
          franjaLabel={franjaLabel}
          materias={materias}
          availableMaterias={availableMaterias}
          onClose={onClosePopover}
          onAddMateria={onAddMateria}
          onRemoveMateria={onRemoveMateria}
          compact={compact}
        />
      )}
    </div>
  )
}