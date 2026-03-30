import { useEffect, useState } from 'react'
import { useUIStore } from '../../store/useUIStore'
import { PlannerService } from '../../domains/planner/service'
import { NavBar } from './NavBar'
import styles from './ChromeShell.module.css'

export function ChromeShell() {
  const activeView = useUIStore((state) => state.activeView)
  const [isHovered, setIsHovered] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isPinned, setIsPinned] = useState(PlannerService.getChromePinned())

  const expanded = isHovered || isOpen

  useEffect(() => {
    if (!isPinned) {
      setIsHovered(false)
      setIsOpen(false)
    }
  }, [activeView, isPinned])

  const togglePin = () => {
    const next = !isPinned
    PlannerService.setChromePinned(next)
    setIsPinned(next)
  }

  const handleMouseEnter = () => {
    if (isPinned) setIsHovered(true)
  }

  const handleMouseLeave = () => {
    if (isPinned) setIsHovered(false)
    if (!isPinned) setIsOpen(false)
  }

  const handlePeekClick = () => {
    if (!isPinned) setIsOpen(true)
  }

  const handleFocus = () => {
    if (isPinned) setIsHovered(true)
  }

  const handleBlur = (e: React.FocusEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      if (isPinned) setIsHovered(false)
      if (!isPinned) setIsOpen(false)
    }
  }

  /* When pinned: show compact single-line header always */
  if (isPinned) {
    return (
      <header
        className={`${styles.shell} ${styles.pinned}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        <div className={styles.compactRow}>
          <button
            type="button"
            className={styles.pinBtn}
            onClick={togglePin}
            aria-pressed={isPinned}
            aria-label="Desfijar barra superior"
            title="Desfijar barra"
          >
            📌
          </button>
          <span className={styles.logo}>◈ UAI Planner</span>
          <NavBar expanded={expanded} />
        </div>
      </header>
    )
  }

  /* When unpinned: hide upward, show peek bar, expand on click/hover */
  return (
    <div
      className={`${styles.shell} ${styles.floating} ${isOpen ? styles.floatingOpen : styles.floatingCollapsed}`}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      <div className={styles.floatingPanel}>
        <div className={styles.compactRow}>
          <button
            type="button"
            className={styles.pinBtn}
            onClick={togglePin}
            aria-pressed={isPinned}
            aria-label="Fijar barra superior"
            title="Fijar barra"
          >
            ☰
          </button>
          <span className={styles.logo}>◈ UAI Planner</span>
          <NavBar expanded={isOpen} />
        </div>
      </div>
      <div
        className={styles.peekBar}
        onClick={handlePeekClick}
        role="button"
        tabIndex={0}
        aria-label="Expandir barra de navegación"
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handlePeekClick() }}
      >
        <span className={styles.peekLabel}>◈ UAI</span>
      </div>
    </div>
  )
}
