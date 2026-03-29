import { useCallback } from 'react'
import { driveDisconnect } from '../../domains/drive/driveApi'
import { useDriveStore } from '../../store/useDriveStore'
import { usePlannerStore } from '../../store/usePlannerStore'

export function useDriveDisconnect(): { disconnectNow: () => Promise<void> } {
  const modeChanged = usePlannerStore((state) => state.modeChanged)
  const driveDisconnected = useDriveStore((state) => state.driveDisconnected)
  const syncSucceeded = useDriveStore((state) => state.syncSucceeded)
  const syncFailed = useDriveStore((state) => state.syncFailed)

  const disconnectNow = useCallback(async () => {
    try {
      await driveDisconnect()
      driveDisconnected()
      modeChanged('local')
      syncSucceeded('Drive desconectado. Datos locales preservados.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo desconectar Drive.'
      syncFailed(message)
    }
  }, [driveDisconnected, modeChanged, syncFailed, syncSucceeded])

  return { disconnectNow }
}
