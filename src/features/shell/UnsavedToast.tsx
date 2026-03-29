import { usePlannerStore } from '../../store/usePlannerStore'
import { useDriveStore } from '../../store/useDriveStore'
import styles from './UnsavedToast.module.css'

export function UnsavedToast() {
  const dirty = usePlannerStore((state) => state.dirty)
  const driveConnected = useDriveStore((state) => state.connected)
  const appMode = usePlannerStore((state) => state.appMode)
  const isDemo = false

  if (!dirty || driveConnected || isDemo || appMode === 'welcome') {
    return null
  }

  return (
    <div className={styles.toast}>
      Cambios sin guardar — exportá tu backup para no perder nada.
    </div>
  )
}
