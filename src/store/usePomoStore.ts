import { create } from 'zustand'
import type { PomoSession, MateriaContext } from './types'
import type { Sesion } from '@domains/planner/types'
import { localISONow } from '../utils/dateUtils'

interface PomoStore {
  session: PomoSession | null
  contextMateria: MateriaContext | null
  elapsedSeconds: number
  isPaused: boolean
  pauseSeconds: number
  focusMode: boolean

  pomoStarted(session: PomoSession): void
  pomoStopped(): Omit<Sesion, 'id'> | null
  pomoCancelled(): void
  pomoPaused(): void
  pomoResumed(): void
  focusModeToggled(): void
  contextOpened(materia: MateriaContext): void
  contextClosed(): void
  tickOccurred(): void
}

export const usePomoStore = create<PomoStore>()((set, get) => ({
  session: null,
  contextMateria: null,
  elapsedSeconds: 0,
  isPaused: false,
  pauseSeconds: 0,
  focusMode: true,

  pomoStarted: (session) => set({ session, elapsedSeconds: 0, isPaused: false, pauseSeconds: 0, focusMode: true }),

  pomoStopped: () => {
    const session = get().session
    const elapsedSeconds = get().elapsedSeconds
    if (!session) {
      return null
    }

    const minutos = elapsedSeconds > 0 ? Math.max(1, Math.round(elapsedSeconds / 60)) : 0
    const inicioDate = new Date(Date.now() - elapsedSeconds * 1000)
    const result: Omit<Sesion, 'id'> = {
      materiaId: session.materiaId,
      tareaId: session.tareaId,
      inicio: localISONow(inicioDate),
      minutos,
      origen: 'timer',
      titulo: session.titulo,
    }

    set({ session: null, elapsedSeconds: 0, isPaused: false, pauseSeconds: 0, focusMode: false })
    return result
  },

  pomoCancelled: () => set({ session: null, elapsedSeconds: 0, isPaused: false, pauseSeconds: 0, focusMode: false }),

  pomoPaused: () => set({ isPaused: true }),
  pomoResumed: () => set({ isPaused: false }),
  focusModeToggled: () => set((state) => ({ focusMode: !state.focusMode })),

  contextOpened: (materia) => set({ contextMateria: materia }),
  contextClosed: () => set({ contextMateria: null }),
  tickOccurred: () => {
    const { isPaused } = get()
    if (isPaused) {
      set((state) => ({ pauseSeconds: state.pauseSeconds + 1 }))
    } else {
      set((state) => ({ elapsedSeconds: state.elapsedSeconds + 1 }))
    }
  },
}))
