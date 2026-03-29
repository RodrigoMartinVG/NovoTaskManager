import { useMemo, useState } from 'react'
import { useUIStore } from '../../store/useUIStore'
import { PlannerService } from '../../domains/planner/service'
import { NavBar } from './NavBar'
import styles from './ChromeShell.module.css'

const viewLabels: Record<string, string> = {
  hoy: 'Hoy',
  semana: 'Semana',
  kanban: 'Kanban',
  backlog: 'Backlog',
  calendar: 'Calendario',
  materias: 'Materias',
}

export function ChromeShell() {
  const activeView = useUIStore((state) => state.activeView)
  const [isHovered, setIsHovered] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isPinned, setIsPinned] = useState(PlannerService.getChromePinned())

  const headerLabel = useMemo(() => viewLabels[activeView] ?? activeView, [activeView])
  const expanded = isPinned || isHovered || isOpen

  const togglePin = () => {
    const next = !isPinned
    PlannerService.setChromePinned(next)
    setIsPinned(next)
  }

  const handlePeekClick = () => {
    if (!expanded) {
      setIsOpen(true)
    }
  }

  const handleMouseLeave = () => {
    if (!isPinned) {
      setIsOpen(false)
    }
    setIsHovered(false)
  }

  return (
    <div
      className={`${styles.chromeShellSlot} ${expanded ? styles.expanded : styles.collapsed}`}
    >
      <div
        className={styles.chromeShellSticky}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className={styles.peekBar}
          onClick={handlePeekClick}
        >
          <div className={styles.peekTitle}>{headerLabel}</div>
          <button
            type="button"
            className={styles.pinButton}
            onClick={togglePin}
            aria-pressed={isPinned}
            aria-label={isPinned ? 'Desfijar barra superior' : 'Fijar barra superior'}
          >
            {isPinned ? 'Unpin' : 'Pin'}
          </button>
        </div>
        <div className={styles.contentArea}>
          <div className={styles.headerIntro}>
            <div className={styles.headerTitle}>{headerLabel}</div>
            <p className={styles.headerSubtitle}>Navegación rápida entre vistas y acceso a filtros.</p>
          </div>
          <NavBar />
        </div>
      </div>
    </div>
  )
}
