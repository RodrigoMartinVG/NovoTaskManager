import { useCallback } from 'react'
import { driveMarkSaved, driveSave } from '../../domains/drive/driveApi'
import { useDriveStore } from '../../store/useDriveStore'
import { usePlannerStore } from '../../store/usePlannerStore'

export function useDriveSave(): { saveNow: () => Promise<void> } {
  const data = usePlannerStore((state) => state.data)
  const syncStarted = useDriveStore((state) => state.syncStarted)
  const syncSucceeded = useDriveStore((state) => state.syncSucceeded)
  const syncFailed = useDriveStore((state) => state.syncFailed)

  const saveNow = useCallback(async () => {
    syncStarted('Guardando en Drive...')
    try {
      await driveSave(data)
      driveMarkSaved()
      syncSucceeded('Guardado manual completado')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo guardar en Drive.'
      syncFailed(message)
    }
  }, [data, syncFailed, syncStarted, syncSucceeded])

  return { saveNow }
}
