import { useMemo } from 'react'
import { getLastSavedLabel } from '../../domains/drive/driveApi'
import { useDriveStore } from '../../store/useDriveStore'
import styles from './SyncStatusIndicator.module.css'

export function SyncStatusIndicator() {
  const connected = useDriveStore((state) => state.connected)
  const status = useDriveStore((state) => state.status)
  const message = useDriveStore((state) => state.message)
  const syncPanelToggled = useDriveStore((state) => state.syncPanelToggled)

  const label = useMemo(() => {
    if (!connected) {
      return 'Drive desconectado'
    }
    if (status === 'saving') {
      return 'Sincronizando...'
    }
    if (status === 'saved') {
      return getLastSavedLabel()
    }
    if (status === 'error') {
      return message || 'Error de sincronizacion'
    }
    return 'Listo para sincronizar'
  }, [connected, message, status])

  const toneClassName =
    status === 'saved'
      ? styles.dotSaved
      : status === 'saving'
        ? styles.dotSaving
        : status === 'error'
          ? styles.dotError
          : styles.dotIdle

  return (
    <button type="button" className={styles.button} title={label} onClick={syncPanelToggled}>
      <span className={`${styles.dot} ${toneClassName}`} aria-hidden="true" />
      <span className={styles.text}>{label}</span>
    </button>
  )
}
