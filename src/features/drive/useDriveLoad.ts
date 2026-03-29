import { useCallback } from 'react'
import { driveLoad } from '../../domains/drive/driveApi'
import { useDriveStore } from '../../store/useDriveStore'
import { usePlannerStore } from '../../store/usePlannerStore'

export function useDriveLoad(): { loadNow: () => Promise<void> } {
  const dataLoaded = usePlannerStore((state) => state.dataLoaded)
  const syncStarted = useDriveStore((state) => state.syncStarted)
  const syncSucceeded = useDriveStore((state) => state.syncSucceeded)
  const syncFailed = useDriveStore((state) => state.syncFailed)

  const loadNow = useCallback(async () => {
    syncStarted('Cargando desde Drive...')
    try {
      const loaded = await driveLoad()
      if (loaded) {
        dataLoaded(loaded)
        syncSucceeded('Datos de Drive cargados')
        return
      }
      syncSucceeded('No se encontro backup en Drive')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo cargar desde Drive.'
      syncFailed(message)
    }
  }, [dataLoaded, syncFailed, syncStarted, syncSucceeded])

  return { loadNow }
}
