import { create } from 'zustand'
import type { PomoSession, MateriaContext } from './types'
import type { Sesion } from '@domains/planner/types'

interface PomoStore {
  session: PomoSession | null
  contextMateria: MateriaContext | null
  elapsedSeconds: number

  pomoStarted(session: PomoSession): void
  pomoStopped(): Sesion | null
  pomoCancelled(): void
  contextOpened(materia: MateriaContext): void
  contextClosed(): void
  tickOccurred(): void
}

export const usePomoStore = create<PomoStore>()((set, get) => ({
  session: null,
  contextMateria: null,
  elapsedSeconds: 0,

  pomoStarted: (session) => set({ session, elapsedSeconds: 0 }),

  pomoStopped: () => {
    const session = get().session
    if (!session) {
      return null
    }

    const result: Sesion = {
      id: `ses_${Math.random().toString(36).slice(2, 11)}`,
      materiaId: session.materiaId,
      tareaId: session.tareaId,
      inicio: session.iniciadoEn,
      minutos: session.minutos,
      origen: 'timer',
      titulo: session.titulo,
    }

    set({ session: null, elapsedSeconds: 0 })
    return result
  },

  pomoCancelled: () => set({ session: null, elapsedSeconds: 0 }),
  contextOpened: (materia) => set({ contextMateria: materia }),
  contextClosed: () => set({ contextMateria: null }),
  tickOccurred: () => set((state) => ({ elapsedSeconds: state.elapsedSeconds + 1 })),
}))
