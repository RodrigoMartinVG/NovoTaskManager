import { ChromeShell } from './ChromeShell'
import { UnsavedToast } from './UnsavedToast'
import { useDriveAutoSave } from './useDriveAutoSave'
import { ConfirmModal } from '../../shared/components/ConfirmModal'
import { TaskModal } from '../tasks/TaskModal'
import { FormModal } from '../tasks/FormModal'
import { ImportTasksModal } from '../tasks/ImportTasksModal'
import { SchemaHint } from './SchemaHint'
import { useUIStore } from '../../store/useUIStore'
import styles from './AppShell.module.css'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  useDriveAutoSave()
  const selectedTaskId = useUIStore((state) => state.selectedTaskId)
  const editingTask = useUIStore((state) => state.editingTask)
  const importTasksOpen = useUIStore((state) => state.importTasksOpen)
  const confirm = useUIStore((state) => state.confirm)

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
      {importTasksOpen && <ImportTasksModal />}
      {confirm && <ConfirmModal />}
    </div>
  )
}
