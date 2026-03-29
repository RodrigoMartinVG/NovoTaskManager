import { useEffect, useRef, useState } from 'react'
import type { Materia } from '../../../domains/planner/types'
import { useClickOutside } from '../../../shared/hooks/useClickOutside'
import { useKeyDown } from '../../../shared/hooks/useKeyDown'
import styles from './SlotEditPopover.module.css'

interface SlotEditPopoverProps {
  diaLabel: string
  franjaLabel: string
  materias: Materia[]
  availableMaterias: Materia[]
  onClose: () => void
  onAddMateria: (materiaId: string) => void
  onRemoveMateria: (materiaId: string) => void
  compact?: boolean | undefined
}

export function SlotEditPopover({
  diaLabel,
  franjaLabel,
  materias,
  availableMaterias,
  onClose,
  onAddMateria,
  onRemoveMateria,
  compact = false,
}: SlotEditPopoverProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [selectedMateriaId, setSelectedMateriaId] = useState(availableMaterias[0]?.id ?? '')

  useEffect(() => {
    setSelectedMateriaId((current) => {
      if (availableMaterias.some((materia) => materia.id === current)) {
        return current
      }
      return availableMaterias[0]?.id ?? ''
    })
  }, [availableMaterias])

  useClickOutside(ref, onClose)
  useKeyDown((event) => {
    if (event.key === 'Escape') {
      onClose()
    }
  })

  return (
    <div className={`${styles.panel} ${compact ? styles.compact : ''}`} ref={ref} onClick={(event) => event.stopPropagation()}>
      <div className={styles.header}>
        <div>
          <strong className={styles.title}>Editar slot</strong>
          <p className={styles.subtitle}>{`${diaLabel} · ${franjaLabel}`}</p>
        </div>
        <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Cerrar editor de slot">
          ✕
        </button>
      </div>

      <div className={styles.section}>
        <span className={styles.sectionLabel}>Materias en este slot</span>
        {materias.length > 0 ? (
          <div className={styles.list}>
            {materias.map((materia) => (
              <div key={materia.id} className={styles.row}>
                <span className={styles.rowMain}>
                  <svg className={styles.dot} viewBox="0 0 8 8" aria-hidden="true">
                    <circle cx="4" cy="4" r="4" fill={materia.color} />
                  </svg>
                  <span>{materia.nombre}</span>
                </span>
                <button
                  type="button"
                  className={styles.iconButton}
                  onClick={() => onRemoveMateria(materia.id)}
                  aria-label={`Quitar ${materia.nombre} del slot`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.empty}>No hay materias asignadas.</p>
        )}
      </div>

      <div className={styles.section}>
        <label className={styles.sectionLabel} htmlFor="slot-add-materia">
          Agregar materia
        </label>
        <div className={styles.addRow}>
          <select
            id="slot-add-materia"
            className={styles.select}
            value={selectedMateriaId}
            onChange={(event) => setSelectedMateriaId(event.target.value)}
            disabled={availableMaterias.length === 0}
          >
            {availableMaterias.length === 0 ? (
              <option value="">Sin materias disponibles</option>
            ) : (
              availableMaterias.map((materia) => (
                <option key={materia.id} value={materia.id}>
                  {materia.nombre}
                </option>
              ))
            )}
          </select>
          <button
            type="button"
            className={styles.addButton}
            disabled={!selectedMateriaId}
            onClick={() => {
              if (!selectedMateriaId) {
                return
              }
              onAddMateria(selectedMateriaId)
            }}
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  )
}