import { Suspense, lazy } from 'react'
import styles from './App.module.css'
import { usePlannerStore } from './store/usePlannerStore'
import { useUIStore } from './store/useUIStore'
import { AppShell } from './features/shell/AppShell'
import { OnboardingFlow } from './features/onboarding/OnboardingFlow'
import { createEmptyPlannerData } from './domains/import-export/normalizer'

const HoyView = lazy(() => import('./features/views/hoy/HoyView').then((mod) => ({ default: mod.HoyView })))
const SemanaView = lazy(() => import('./features/views/semana/SemanaView').then((mod) => ({ default: mod.SemanaView })))
const KanbanView = lazy(() => import('./features/views/kanban/KanbanView').then((mod) => ({ default: mod.KanbanView })))
const BacklogView = lazy(() => import('./features/views/backlog/BacklogView').then((mod) => ({ default: mod.BacklogView })))
const CalendarView = lazy(() => import('./features/views/calendar/CalendarView').then((mod) => ({ default: mod.CalendarView })))
const MateriasView = lazy(() => import('./features/views/materias/MateriasView').then((mod) => ({ default: mod.MateriasView })))

export default function App() {
  const appMode = usePlannerStore((state) => state.appMode)
  const activeView = useUIStore((state) => state.activeView)
  const dataLoaded = usePlannerStore((state) => state.dataLoaded)

  if (appMode === 'welcome') {
    return <OnboardingFlow />
  }

  return (
    <AppShell>
      <Suspense fallback={<div className={styles.viewSkeleton}>Cargando vista...</div>}>
        {activeView === 'hoy' && <HoyView />}
        {activeView === 'semana' && <SemanaView />}
        {activeView === 'kanban' && <KanbanView />}
        {activeView === 'backlog' && <BacklogView />}
        {activeView === 'calendar' && <CalendarView />}
        {activeView === 'materias' && <MateriasView />}
      </Suspense>
      <div className={styles.actionRow}>
        <button type="button" className={styles.primaryButton} onClick={() => dataLoaded(createEmptyPlannerData())}>
          Reset local
        </button>
      </div>
    </AppShell>
  )
}
