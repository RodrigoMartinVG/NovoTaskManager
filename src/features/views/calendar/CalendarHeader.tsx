import { CalendarFilterSelector } from './CalendarFilterSelector'
import styles from './CalendarHeader.module.css'

interface CalendarHeaderProps {
  currentMonth: Date
  showInicio: boolean
  showFin: boolean
  onPrevMonth: () => void
  onNextMonth: () => void
  onToggleInicio: () => void
  onToggleFin: () => void
}

export function CalendarHeader({
  currentMonth,
  showInicio,
  showFin,
  onPrevMonth,
  onNextMonth,
  onToggleInicio,
  onToggleFin,
}: CalendarHeaderProps) {
  const title = currentMonth.toLocaleDateString('es-AR', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <header className={styles.header}>
      <div className={styles.nav}>
        <button type="button" className={styles.arrow} onClick={onPrevMonth}>
          ‹
        </button>
        <h3 className={styles.title}>{title}</h3>
        <button type="button" className={styles.arrow} onClick={onNextMonth}>
          ›
        </button>
      </div>
      <CalendarFilterSelector
        showInicio={showInicio}
        showFin={showFin}
        onToggleInicio={onToggleInicio}
        onToggleFin={onToggleFin}
      />
    </header>
  )
}
