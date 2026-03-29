import { create } from 'zustand'
import { PlannerService } from '../domains/planner/service'
import type { DriveConflict } from './types'
import type { SyncStatus } from '../domains/planner/types'

interface DriveStore {
  connected: boolean
  status: SyncStatus
  message: string
  autoSave: boolean
  conflict: DriveConflict | null
  userEmail: string | null
  showSyncPanel: boolean

  driveConnected(email: string): void
  driveDisconnected(): void
  syncStarted(message?: string): void
  syncSucceeded(message?: string): void
  syncFailed(message: string): void
  autoSaveToggled(enabled: boolean): void
  conflictDetected(conflict: DriveConflict): void
  conflictResolved(): void
  syncPanelToggled(): void
}

export const useDriveStore = create<DriveStore>()((set) => ({
  connected: false,
  status: 'idle',
  message: '',
  autoSave: PlannerService.getAutoSave(),
  conflict: null,
  userEmail: PlannerService.getEmail(),
  showSyncPanel: false,

  driveConnected: (email) => {
    PlannerService.setEmail(email)
    set({ connected: true, userEmail: email })
  },

  driveDisconnected: () => {
    PlannerService.setEmail(null)
    set({ connected: false, status: 'idle', userEmail: null, conflict: null })
  },

  syncStarted: (message) => set({ status: 'saving', message: message ?? '' }),
  syncSucceeded: (message) => set({ status: 'saved', message: message ?? '' }),
  syncFailed: (message) => set({ status: 'error', message }),
  autoSaveToggled: (enabled) => {
    PlannerService.setAutoSave(enabled)
    set({ autoSave: enabled })
  },
  conflictDetected: (conflict) => set({ conflict }),
  conflictResolved: () => set({ conflict: null }),
  syncPanelToggled: () => set((state) => ({ showSyncPanel: !state.showSyncPanel })),
}))
