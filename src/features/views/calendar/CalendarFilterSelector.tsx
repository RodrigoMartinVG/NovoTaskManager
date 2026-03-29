import { useRef, useState } from 'react'
import { useClickOutside } from '../../../shared/hooks/useClickOutside'
import { useKeyDown } from '../../../shared/hooks/useKeyDown'
import styles from './CalendarFilterSelector.module.css'

interface CalendarFilterSelectorProps {
  showInicio: boolean
  showFin: boolean
  onToggleInicio: () => void
  onToggleFin: () => void
}

function label(showInicio: boolean, showFin: boolean): string {
  if (showInicio && showFin) return 'Inicio y fin'
  if (showInicio) return 'Inicio'
  if (showFin) return 'Fin'
  return 'Sin eventos'
}

export function CalendarFilterSelector({
  showInicio,
  showFin,
  onToggleInicio,
  onToggleFin,
}: CalendarFilterSelectorProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useClickOutside(ref, () => setOpen(false))
  useKeyDown((event) => {
    if (event.key === 'Escape') {
      setOpen(false)
    }
  })

  return (
    <div className={styles.wrap} ref={ref}>
      <button type="button" className={styles.trigger} onClick={() => setOpen((curr) => !curr)}>
        {label(showInicio, showFin)}
      </button>
      {open && (
        <div className={styles.panel}>
          <button
            type="button"
            className={`${styles.option} ${showInicio ? styles.active : ''}`}
            onClick={onToggleInicio}
          >
            Fecha inicio
          </button>
          <button
            type="button"
            className={`${styles.option} ${showFin ? styles.active : ''}`}
            onClick={onToggleFin}
          >
            Fecha fin
          </button>
        </div>
      )}
    </div>
  )
}
