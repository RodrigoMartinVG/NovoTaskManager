import { useEffect, useRef } from 'react'
import { driveMarkSaved, driveSave } from '../../domains/drive/driveApi'
import { useDriveStore } from '../../store/useDriveStore'
import { usePlannerStore } from '../../store/usePlannerStore'

export function useDriveAutoSave(): void {
  const data = usePlannerStore((state) => state.data)
  const connected = useDriveStore((state) => state.connected)
  const autoSave = useDriveStore((state) => state.autoSave)
  const syncStarted = useDriveStore((state) => state.syncStarted)
  const syncSucceeded = useDriveStore((state) => state.syncSucceeded)
  const syncFailed = useDriveStore((state) => state.syncFailed)
  const firstRun = useRef(true)

  useEffect(() => {
    if (!connected || !autoSave) {
      return
    }

    if (firstRun.current) {
      firstRun.current = false
      return
    }

    const debounceTimer = window.setTimeout(async () => {
      syncStarted('Auto-save en progreso...')
      try {
        await driveSave(data)
        driveMarkSaved()
        syncSucceeded('Auto-save completado')
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Error al auto-guardar en Drive.'
        syncFailed(message)
      }
    }, 2500)

    return () => {
      window.clearTimeout(debounceTimer)
    }
  }, [autoSave, connected, data, syncFailed, syncStarted, syncSucceeded])
}
