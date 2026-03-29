import { create } from 'zustand'
import { PlannerService } from '../domains/planner/service'
import { hashData } from '../domains/import-export/normalizer'
import { plannerReducer } from '../domains/planner/reducer'
import type {
  AppMode,
  Materia,
  MateriaSlot,
  PlannerData,
  Sesion,
  Tarea,
  TareaEstado,
  TipoTarea,
} from '@domains/planner/types'

interface PlannerStore {
  data: PlannerData
  dirty: boolean
  lastSavedHash: string
  appMode: AppMode
  modeChanged(mode: AppMode): void

  dataLoaded(data: PlannerData): void
  tareaAdded(tarea: Omit<Tarea, 'id'>): void
  tareaUpdated(tarea: Tarea): void
  tareaDeleted(id: string): void
  tareaEstadoCambiado(id: string, estado: TareaEstado): void
  tareaFechaCambiada(id: string, field: 'fechaInicio' | 'fechaLimite', fecha: string): void
  checklistItemToggled(taskId: string, itemId: string): void
  tareasImportadas(tareas: Omit<Tarea, 'id'>[]): void
  materiaHorasCambiadas(materiaId: string, horasMin: number, horasMax: number, slots: MateriaSlot[]): void
  materiaSlotMovido(materiaId: string, from: MateriaSlot, to: MateriaSlot): void
  materiasActualizadas(materias: Materia[]): void
  tiposActualizados(tipos: TipoTarea[]): void
  sesionAgregada(sesion: Omit<Sesion, 'id'>): void
  sesionAgregadaConTarea(sesion: Omit<Sesion, 'id'>, tarea: Omit<Tarea, 'id'>): void
  sesionActualizada(id: string, patch: Partial<Sesion>): void
  sesionEliminada(id: string): void
}

type IdGenerator = (prefix: string) => string

const generateId: IdGenerator = (prefix) => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`
  }
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

const initialData = PlannerService.loadData()
const initialHash = hashData(initialData)

function saveState(next: PlannerData) {
  PlannerService.saveData(next)
  const nextHash = hashData(next)
  return {
    data: next,
    dirty: false,
    lastSavedHash: nextHash,
  }
}

export const usePlannerStore = create<PlannerStore>()((set, get) => ({
  data: initialData,
  dirty: false,
  lastSavedHash: initialHash,
  appMode: PlannerService.getMode(),

  dataLoaded: (data) => {
    const next = plannerReducer(get().data, { type: 'LOAD_DATA', payload: data })
    set(saveState(next))
  },
  modeChanged: (mode) => {
    PlannerService.setMode(mode)
    set({ appMode: mode })
  },

  tareaAdded: (tarea) => {
    const next = plannerReducer(get().data, {
      type: 'ADD_TAREA',
      payload: { ...tarea, id: generateId('tar') },
    })
    set(saveState(next))
  },

  tareaUpdated: (tarea) => {
    const next = plannerReducer(get().data, {
      type: 'UPDATE_TAREA',
      payload: { id: tarea.id, changes: tarea },
    })
    set(saveState(next))
  },

  tareaDeleted: (id) => {
    const next = plannerReducer(get().data, { type: 'DELETE_TAREA', payload: { id } })
    set(saveState(next))
  },

  tareaEstadoCambiado: (id, estado) => {
    const next = plannerReducer(get().data, { type: 'MOVE_TAREA', payload: { id, estado } })
    set(saveState(next))
  },

  tareaFechaCambiada: (id, field, fecha) => {
    const payload = field === 'fechaInicio' ? { fechaInicio: fecha } : { fechaLimite: fecha }
    const next = plannerReducer(get().data, {
      type: 'MOVE_TASK_TO_DATE',
      payload: { id, ...payload },
    })
    set(saveState(next))
  },

  checklistItemToggled: (taskId, itemId) => {
    const next = plannerReducer(get().data, {
      type: 'TOGGLE_CHECKLIST_ITEM',
      payload: { tareaId: taskId, itemId },
    })
    set(saveState(next))
  },

  tareasImportadas: (tareas) => {
    const imported = tareas.map((tarea) => ({ ...tarea, id: generateId('tar') }))
    const next = plannerReducer(get().data, { type: 'IMPORT_TAREAS', payload: imported })
    set(saveState(next))
  },

  materiaHorasCambiadas: (materiaId, horasMin, horasMax, slots) => {
    const next = plannerReducer(get().data, {
      type: 'UPDATE_MATERIA_HORAS',
      payload: { materiaId, horasMin, horasMax, slots },
    })
    set(saveState(next))
  },

  materiaSlotMovido: (materiaId, from, to) => {
    const materia = get().data.materias.find((item) => item.id === materiaId)
    if (!materia) {
      return
    }
    const slotIndex = materia.slots.findIndex(
      (slot) => slot.dia === from.dia && slot.momento === from.momento,
    )
    if (slotIndex === -1) {
      return
    }
    const next = plannerReducer(get().data, {
      type: 'MOVE_MATERIA_SLOT',
      payload: { materiaId, slotIndex, dia: to.dia, momento: to.momento },
    })
    set(saveState(next))
  },

  materiasActualizadas: (materias) => {
    const next = plannerReducer(get().data, { type: 'UPDATE_MATERIAS', payload: materias })
    set(saveState(next))
  },

  tiposActualizados: (tipos) => {
    const next = plannerReducer(get().data, { type: 'UPDATE_TIPOS', payload: tipos })
    set(saveState(next))
  },

  sesionAgregada: (sesion) => {
    const next = plannerReducer(get().data, { type: 'ADD_SESION_WITH_TASK', payload: sesion })
    set(saveState(next))
  },

  sesionAgregadaConTarea: (sesion, tarea) => {
    const newTaskId = generateId('tar')
    const withTask = plannerReducer(get().data, {
      type: 'ADD_TAREA',
      payload: { ...tarea, id: newTaskId },
    })
    const withSession = plannerReducer(withTask, {
      type: 'ADD_SESION_WITH_TASK',
      payload: { ...sesion, tareaId: newTaskId },
    })
    set(saveState(withSession))
  },

  sesionActualizada: (id, patch) => {
    const next = plannerReducer(get().data, { type: 'UPDATE_SESION', payload: { id, changes: patch } })
    set(saveState(next))
  },

  sesionEliminada: (id) => {
    const next = plannerReducer(get().data, { type: 'DELETE_SESION', payload: { id } })
    set(saveState(next))
  },
}))
