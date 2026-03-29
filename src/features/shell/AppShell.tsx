import { ChromeShell } from './ChromeShell'
import { UnsavedToast } from './UnsavedToast'
import { useDriveAutoSave } from './useDriveAutoSave'
import { ConfirmModal } from '../../shared/components/ConfirmModal'
import { TaskModal } from '../tasks/TaskModal'
import { useUIStore } from '../../store/useUIStore'
import styles from './AppShell.module.css'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  useDriveAutoSave()
  const selectedTaskId = useUIStore((state) => state.selectedTaskId)
  const confirm = useUIStore((state) => state.confirm)

  return (
    <div className={styles.appShell}>
      <ChromeShell />
      <main className={styles.content}>
        {children}
      </main>
      <UnsavedToast />
      {selectedTaskId && <TaskModal />}
      {confirm && <ConfirmModal />}
    </div>
  )
}
