import { useMemo, useState } from 'react'
import { useDriveConnect } from '../drive/useDriveConnect'
import { useDriveSave } from './useDriveSave'
import { useDriveLoad } from './useDriveLoad'
import { useDriveDisconnect } from './useDriveDisconnect'
import { useDriveStore } from '../../store/useDriveStore'
import styles from './DriveDropdown.module.css'

export function DriveDropdown() {
  const [open, setOpen] = useState(false)

  const { connect } = useDriveConnect()
  const { saveNow } = useDriveSave()
  const { loadNow } = useDriveLoad()
  const { disconnectNow } = useDriveDisconnect()

  const connected = useDriveStore((state) => state.connected)
  const status = useDriveStore((state) => state.status)
  const message = useDriveStore((state) => state.message)
  const userEmail = useDriveStore((state) => state.userEmail)
  const autoSave = useDriveStore((state) => state.autoSave)
  const autoSaveToggled = useDriveStore((state) => state.autoSaveToggled)

  const statusLabel = useMemo(() => {
    if (status === 'saving') return 'Sincronizando...'
    if (status === 'saved') return 'Sincronizado'
    if (status === 'error') return message || 'Error de sincronizacion'
    return 'Sin actividad'
  }, [message, status])

  return (
    <div className={styles.wrapper}>
      <button type="button" className={styles.button} onClick={() => setOpen((value) => !value)}>
        💾 Datos
      </button>

      {open && (
        <div className={styles.popover}>
          {!connected ? (
            <div className={styles.column}>
              <p className={styles.helper}>Conecta Drive para sincronizar tu planner.</p>
              <button
                type="button"
                className={styles.actionPrimary}
                onClick={async () => {
                  await connect()
                  setOpen(false)
                }}
              >
                Conectar Google Drive
              </button>
            </div>
          ) : (
            <div className={styles.column}>
              <p className={styles.helper}>{userEmail ?? 'Cuenta conectada'}</p>
              <p className={styles.status}>{statusLabel}</p>

              <label className={styles.autoSaveRow}>
                <input
                  type="checkbox"
                  checked={autoSave}
                  onChange={(event) => autoSaveToggled(event.target.checked)}
                />
                <span>Auto-save</span>
              </label>

              <button type="button" className={styles.actionButton} onClick={saveNow}>
                Guardar ahora
              </button>
              <button type="button" className={styles.actionButton} onClick={loadNow}>
                Cargar desde Drive
              </button>
              <button type="button" className={styles.actionDanger} onClick={disconnectNow}>
                Desconectar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
