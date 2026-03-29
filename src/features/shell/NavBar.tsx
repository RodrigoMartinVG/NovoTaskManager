import { useMemo, useRef, useState } from 'react'
import { usePlannerStore } from '../../store/usePlannerStore'
import { useUIStore } from '../../store/useUIStore'
import { PlannerService } from '../../domains/planner/service'
import { useClickOutside } from '../../shared/hooks/useClickOutside'
import { useKeyDown } from '../../shared/hooks/useKeyDown'
import { ListFilters } from './ListFilters'
import styles from './NavBar.module.css'
import type { Periodo, ViewMode } from '../../domains/planner/types'

const viewOrder: ViewMode[] = ['hoy', 'semana', 'kanban', 'backlog', 'calendar', 'materias']
const periodos: Periodo[] = ['c1', 'c2', 'anual']

const mapViewLabel: Record<ViewMode, string> = {
  hoy: 'Hoy',
  semana: 'Semana',
  kanban: 'Kanban',
  backlog: 'Backlog',
  calendar: 'Calendario',
  materias: 'Materias',
}

const themes = ['theme-1', 'theme-2', 'theme-3', 'theme-4', 'theme-5'] as const

export function NavBar() {
  const activeView = useUIStore((state) => state.activeView)
  const viewChanged = useUIStore((state) => state.viewChanged)
  const filters = useUIStore((state) => state.filters)
  const anioChanged = useUIStore((state) => state.anioChanged)
  const periodoToggled = useUIStore((state) => state.periodoToggled)
  const importTasksOpened = useUIStore((state) => state.importTasksOpened)
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

  return (
    <div className={styles.navbar}>
      <div className={styles.viewButtons}>
        {viewOrder.map((view) => (
          <button
            key={view}
            type="button"
            className={`${styles.button} ${activeView === view ? styles.buttonActive : ''}`}
            onClick={() => viewChanged(view)}
          >
            {mapViewLabel[view]}
          </button>
        ))}
      </div>

      <div className={styles.actions}>
        <div className={styles.controlGroup} ref={periodRef}>
          <button
            type="button"
            className={styles.button}
            onClick={() => setPeriodOpen((current) => !current)}
          >
            Período
          </button>
          {periodOpen && (
            <div className={styles.popover}>
              <div className={styles.filterGroup}>
                <button
                  type="button"
                  className={`${styles.smallButton} ${filters.anio === 'all' ? styles.buttonActive : ''}`}
                  onClick={() => anioChanged('all')}
                >
                  Todos los años
                </button>
                {availableYears.map((year) => (
                  <button
                    key={year}
                    type="button"
                    className={`${styles.smallButton} ${filters.anio === year ? styles.buttonActive : ''}`}
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
                    className={`${styles.smallButton} ${filters.periodo === periodo ? styles.buttonActive : ''}`}
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
          <button
            type="button"
            className={styles.button}
            onClick={() => setThemeOpen((current) => !current)}
          >
            Theme
          </button>
          {themeOpen && (
            <div className={styles.popover}>
              <div className={styles.filterGroup}>
                {themes.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`${styles.smallButton} ${theme === option ? styles.buttonActive : ''}`}
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

        <button type="button" className={styles.button} onClick={() => taskEditOpened({})}>
          + Nueva tarea
        </button>
        <button type="button" className={styles.button} onClick={importTasksOpened}>
          Importar tareas
        </button>
        <button type="button" className={styles.button} onClick={() => window.alert('Ayuda placeholder')}>
          ?
        </button>
        <button type="button" className={styles.button} onClick={() => window.alert('Configuración placeholder')}>
          ⚙
        </button>
      </div>

      {isListView && (
        <div className={styles.listFiltersRow}>
          <ListFilters />
        </div>
      )}
    </div>
  )
}
