import { useCallback } from 'react'
import { hashData, isEmptyPlannerData } from '../../domains/import-export/normalizer'
import { driveConnect, driveLoad, driveSave, getUserInfo } from '../../domains/drive/driveApi'
import { useDriveStore } from '../../store/useDriveStore'
import { usePlannerStore } from '../../store/usePlannerStore'

export function useDriveConnect(): { connect: () => Promise<void> } {
  const data = usePlannerStore((state) => state.data)
  const dataLoaded = usePlannerStore((state) => state.dataLoaded)
  const modeChanged = usePlannerStore((state) => state.modeChanged)

  const driveConnected = useDriveStore((state) => state.driveConnected)
  const syncStarted = useDriveStore((state) => state.syncStarted)
  const syncSucceeded = useDriveStore((state) => state.syncSucceeded)
  const syncFailed = useDriveStore((state) => state.syncFailed)
  const conflictDetected = useDriveStore((state) => state.conflictDetected)

  const connect = useCallback(async () => {
    syncStarted()
    try {
      const { accessToken } = await driveConnect('consent')
      const { email } = await getUserInfo(accessToken)

      modeChanged('drive')
      driveConnected(email)

      const remoteData = await driveLoad()
      if (!remoteData) {
        await driveSave(data)
        syncSucceeded()
        return
      }

      if (isEmptyPlannerData(data)) {
        dataLoaded(remoteData)
        syncSucceeded()
        return
      }

      if (hashData(remoteData) !== hashData(data)) {
        conflictDetected({ local: data, remote: remoteData })
        syncFailed('Conflicto detectado entre local y Drive.')
        return
      }

      syncSucceeded()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido al conectar Drive.'
      syncFailed(message)
    }
  }, [conflictDetected, data, dataLoaded, driveConnected, modeChanged, syncFailed, syncStarted, syncSucceeded])

  return { connect }
}
