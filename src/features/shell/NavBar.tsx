import { useMemo, useRef, useState } from 'react'
import { usePlannerStore } from '../../store/usePlannerStore'
import { useUIStore } from '../../store/useUIStore'
import { PlannerService } from '../../domains/planner/service'
import { useClickOutside } from '../../shared/hooks/useClickOutside'
import { useKeyDown } from '../../shared/hooks/useKeyDown'
import { ListFilters } from './ListFilters'
import { DriveDropdown } from '../drive/DriveDropdown'
import { SyncStatusIndicator } from './SyncStatusIndicator'
import styles from './NavBar.module.css'
import type { Periodo, ViewMode } from '../../domains/planner/types'

const periodos: Periodo[] = ['c1', 'c2', 'anual']

const primaryViews: { v: ViewMode; icon: string; label: string }[] = [
  { v: 'hoy', icon: '◈', label: 'Hoy' },
  { v: 'semana', icon: '◈', label: 'Semana' },
  { v: 'materias', icon: '◉', label: 'Materias' },
]

const secondaryViews: { v: ViewMode; icon: string; label: string }[] = [
  { v: 'backlog', icon: '≡', label: 'Backlog' },
  { v: 'kanban', icon: '⬡', label: 'Kanban' },
  { v: 'calendar', icon: '◷', label: 'Calendario' },
]

const themes = ['theme-1', 'theme-2', 'theme-3', 'theme-4', 'theme-5'] as const

interface NavBarProps {
  expanded?: boolean
}

export function NavBar({ expanded = false }: NavBarProps) {
  const activeView = useUIStore((state) => state.activeView)
  const viewChanged = useUIStore((state) => state.viewChanged)
  const filters = useUIStore((state) => state.filters)
  const anioChanged = useUIStore((state) => state.anioChanged)
  const periodoToggled = useUIStore((state) => state.periodoToggled)
  const settingsOpened = useUIStore((state) => state.settingsOpened)
  const importTasksOpened = useUIStore((state) => state.importTasksOpened)
  const helpOpened = useUIStore((state) => state.helpOpened)
  const taskEditOpened = useUIStore((state) => state.taskEditOpened)
  const materias = usePlannerStore((state) => state.data.materias)
  const [themeOpen, setThemeOpen] = useState(false)
  const [theme, setTheme] = useState(PlannerService.getTheme())
  const themeRef = useRef<HTMLDivElement | null>(null)
  const [periodOpen, setPeriodOpen] = useState(false)
  const periodRef = useRef<HTMLDivElement | null>(null)
  const isListView = activeView === 'backlog' || activeView === 'kanban' || activeView === 'calendar'

  const availableYears = useMemo(() => {
    const years = Array.from(new Set(materias.map((materia) => materia.anio))).sort((a, b) => b - a)
    return years.length ? years : [new Date().getFullYear()]
  }, [materias])

  useClickOutside(themeRef, () => setThemeOpen(false))
  useClickOutside(periodRef, () => setPeriodOpen(false))
  useKeyDown((event) => {
    if (event.key === 'Escape') {
      setThemeOpen(false)
      setPeriodOpen(false)
    }
  })

  const renderViewGroup = (views: typeof primaryViews) => (
    <div className={styles.viewGroup}>
      {views.map(({ v, icon, label }) => (
        <button
          key={v}
          type="button"
          className={`${styles.nb} ${activeView === v ? styles.nbActive : ''}`}
          onClick={() => viewChanged(v)}
          title={label}
        >
          <span className={styles.nbIco} aria-hidden="true">{icon}</span>
          <span className={styles.nbLabel}>{label}</span>
        </button>
      ))}
    </div>
  )

  return (
    <div className={styles.navbar}>
      <nav className={styles.nav}>
        {renderViewGroup(primaryViews)}
        {renderViewGroup(secondaryViews)}
      </nav>

      <div className={styles.actions}>
        <SyncStatusIndicator />
        <DriveDropdown />
        <button type="button" className={styles.iconBtn} onClick={helpOpened} aria-label="Abrir guía de ayuda" title="Guía de uso">
          ?
        </button>
        <button type="button" className={styles.iconBtn} onClick={() => settingsOpened('materias')} aria-label="Abrir configuración" title="Configuración">
          ⚙
        </button>
      </div>

      {expanded && (
        <div className={styles.expandedRow}>
          <div className={styles.controlGroup} ref={periodRef}>
            <button type="button" className={styles.chipBtn} onClick={() => setPeriodOpen((c) => !c)}>
              Período
            </button>
            {periodOpen && (
              <div className={styles.popover}>
                <div className={styles.filterGroup}>
                  <button
                    type="button"
                    className={`${styles.smallButton} ${filters.anio === 'all' ? styles.btnActive : ''}`}
                    onClick={() => anioChanged('all')}
                  >
                    Todos los años
                  </button>
                  {availableYears.map((year) => (
                    <button
                      key={year}
                      type="button"
                      className={`${styles.smallButton} ${filters.anio === year ? styles.btnActive : ''}`}
                      onClick={() => anioChanged(year)}
                    >
                      {year}
                    </button>
                  ))}
                </div>
                <div className={styles.filterGroup}>
                  {periodos.map((periodo) => (
                    <button
                      key={periodo}
                      type="button"
                      className={`${styles.smallButton} ${filters.periodo === periodo ? styles.btnActive : ''}`}
                      onClick={() => periodoToggled(periodo)}
                    >
                      {periodo.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className={styles.controlGroup} ref={themeRef}>
            <button type="button" className={styles.chipBtn} onClick={() => setThemeOpen((c) => !c)}>
              Tema
            </button>
            {themeOpen && (
              <div className={styles.popover}>
                <div className={styles.filterGroup}>
                  {themes.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={`${styles.smallButton} ${theme === option ? styles.btnActive : ''}`}
                      onClick={() => {
                        PlannerService.setTheme(option)
                        setTheme(option)
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button type="button" className={styles.chipBtn} onClick={() => taskEditOpened({})}>
            + Nueva tarea
          </button>
          <button type="button" className={styles.chipBtn} onClick={importTasksOpened}>
            Importar
          </button>
        </div>
      )}

      {isListView && (
        <div className={styles.listFiltersRow}>
          <ListFilters />
        </div>
      )}
    </div>
  )
}
