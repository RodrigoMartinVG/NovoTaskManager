import { ChromeShell } from './ChromeShell'
import { UnsavedToast } from './UnsavedToast'
import { useDriveAutoSave } from '../drive/useDriveAutoSave'
import { ConfirmModal } from '../../shared/components/ConfirmModal'
import { TaskModal } from '../tasks/TaskModal'
import { FormModal } from '../tasks/FormModal'
import { ImportTasksModal } from '../tasks/ImportTasksModal'
import { SchemaHint } from './SchemaHint'
import { usePomoTimer } from '../pomodoro/usePomoTimer'
import { PomoContextPopup } from '../pomodoro/PomoContextPopup'
import { PomoWidget } from '../pomodoro/PomoWidget'
import { SettingsModal } from '../settings/SettingsModal'
import { ResetModal } from '../settings/ResetModal'
import { HorasEditorModal } from '../settings/HorasEditorModal'
import { ManualSessionModal } from '../settings/ManualSessionModal'
import { DriveConflictModal } from '../drive/DriveConflictModal'
import { useUIStore } from '../../store/useUIStore'
import { usePomoStore } from '../../store/usePomoStore'
import { useDriveStore } from '../../store/useDriveStore'
import styles from './AppShell.module.css'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  useDriveAutoSave()
  usePomoTimer()
  const selectedTaskId = useUIStore((state) => state.selectedTaskId)
  const editingTask = useUIStore((state) => state.editingTask)
  const settingsOpen = useUIStore((state) => state.settingsOpen)
  const importTasksOpen = useUIStore((state) => state.importTasksOpen)
  const resetModalOpen = useUIStore((state) => state.resetModalOpen)
  const editObjetivoMateriaId = useUIStore((state) => state.editObjetivoMateriaId)
  const manualSessionMateriaId = useUIStore((state) => state.manualSessionMateriaId)
  const confirm = useUIStore((state) => state.confirm)
  const contextMateria = usePomoStore((state) => state.contextMateria)
  const pomoSession = usePomoStore((state) => state.session)
  const driveConflict = useDriveStore((state) => state.conflict)

  return (
    <div className={styles.appShell}>
      <ChromeShell />
      <main className={styles.content}>
        {children}
      </main>
      <UnsavedToast />
      <SchemaHint />
      {selectedTaskId && <TaskModal />}
      {editingTask !== null && <FormModal />}
      {settingsOpen && <SettingsModal initialTab={settingsOpen} />}
      {importTasksOpen && <ImportTasksModal />}
      {resetModalOpen && <ResetModal />}
      {editObjetivoMateriaId && <HorasEditorModal />}
      {manualSessionMateriaId && <ManualSessionModal />}
      {contextMateria && <PomoContextPopup />}
      {pomoSession && <PomoWidget />}
      {driveConflict && <DriveConflictModal />}
      {confirm && <ConfirmModal />}
    </div>
  )
}
