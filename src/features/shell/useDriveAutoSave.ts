import { useEffect, useRef } from 'react'
import { usePlannerStore } from '../../store/usePlannerStore'
import { useDriveStore } from '../../store/useDriveStore'

export function useDriveAutoSave() {
  const data = usePlannerStore((state) => state.data)
  const connected = useDriveStore((state) => state.connected)
  const autoSave = useDriveStore((state) => state.autoSave)
  const syncStarted = useDriveStore((state) => state.syncStarted)
  const syncSucceeded = useDriveStore((state) => state.syncSucceeded)
  const firstRun = useRef(true)

  useEffect(() => {
    if (!connected || !autoSave) {
      return
    }

    if (firstRun.current) {
      firstRun.current = false
      return
    }

    let completeTimer: number | undefined
    const debounceTimer = window.setTimeout(() => {
      syncStarted()
      completeTimer = window.setTimeout(() => {
        syncSucceeded()
      }, 300)
    }, 2500)

    return () => {
      window.clearTimeout(debounceTimer)
      if (completeTimer !== undefined) {
        window.clearTimeout(completeTimer)
      }
    }
  }, [autoSave, connected, data, syncStarted, syncSucceeded])
}
