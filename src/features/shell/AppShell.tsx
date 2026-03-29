import { ChromeShell } from './ChromeShell'
import { UnsavedToast } from './UnsavedToast'
import { useDriveAutoSave } from './useDriveAutoSave'
import styles from './AppShell.module.css'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  useDriveAutoSave()

  return (
    <div className={styles.appShell}>
      <ChromeShell />
      <main className={styles.content}>
        {children}
      </main>
      <UnsavedToast />
    </div>
  )
}
