import type {
  DiaId,
  FranjaId,
  Materia,
  MateriaSlot,
  PlannerData,
  Sesion,
  SesionOrigen,
  Tarea,
  TareaEstado,
  TipoTarea,
} from './types'

export type PlannerAction =
  | { type: 'LOAD_DATA'; payload: PlannerData }
  | { type: 'ADD_TAREA'; payload: Tarea }
  | { type: 'UPDATE_TAREA'; payload: { id: string; changes: Partial<Tarea> } }
  | { type: 'DELETE_TAREA'; payload: { id: string } }
  | { type: 'MOVE_TAREA'; payload: { id: string; estado: TareaEstado } }
  | {
      type: 'MOVE_TASK_TO_DATE'
      payload: { id: string; fechaInicio?: string | null; fechaLimite?: string | null }
    }
  | { type: 'TOGGLE_CHECKLIST_ITEM'; payload: { tareaId: string; itemId: string } }
  | { type: 'IMPORT_TAREAS'; payload: Tarea[] }
  | {
      type: 'UPDATE_MATERIA_HORAS'
      payload: { materiaId: string; horasMin: number; horasMax: number; slots?: MateriaSlot[] }
    }
  | {
      type: 'MOVE_MATERIA_SLOT'
      payload: { materiaId: string; slotIndex: number; dia: DiaId; momento: FranjaId }
    }
  | { type: 'UPDATE_MATERIAS'; payload: Materia[] }
  | { type: 'UPDATE_TIPOS'; payload: TipoTarea[] }
  | { type: 'ADD_SESION'; payload: Sesion }
  | {
      type: 'ADD_SESION_WITH_TASK'
      payload: {
        materiaId: string
        tareaId: string | null
        inicio: string
        minutos: number
        origen: SesionOrigen
        titulo: string
        nota?: string
      }
    }
  | { type: 'UPDATE_SESION'; payload: { id: string; changes: Partial<Sesion> } }
  | { type: 'DELETE_SESION'; payload: { id: string } }

export function plannerReducer(data: PlannerData, action: PlannerAction): PlannerData {
  switch (action.type) {
    case 'LOAD_DATA':
      return { ...action.payload, updatedAt: new Date().toISOString() }

    case 'ADD_TAREA':
      return updateTimestamp({ ...data, tareas: [...data.tareas, action.payload] })

    case 'UPDATE_TAREA':
      return updateTimestamp({
        ...data,
        tareas: data.tareas.map((tarea) =>
          tarea.id === action.payload.id ? { ...tarea, ...action.payload.changes } : tarea,
        ),
      })

    case 'DELETE_TAREA':
      return updateTimestamp({
        ...data,
        tareas: data.tareas.filter((tarea) => tarea.id !== action.payload.id),
      })

    case 'MOVE_TAREA':
      return updateTimestamp({
        ...data,
        tareas: data.tareas.map((tarea) =>
          tarea.id === action.payload.id ? { ...tarea, estado: action.payload.estado } : tarea,
        ),
      })

    case 'MOVE_TASK_TO_DATE':
      return updateTimestamp({
        ...data,
        tareas: data.tareas.map((tarea) =>
          tarea.id === action.payload.id
            ? {
                ...tarea,
                fechaInicio: action.payload.fechaInicio ?? tarea.fechaInicio,
                fechaLimite: action.payload.fechaLimite ?? tarea.fechaLimite,
              }
            : tarea,
        ),
      })

    case 'TOGGLE_CHECKLIST_ITEM':
      return updateTimestamp({
        ...data,
        tareas: data.tareas.map((tarea) =>
          tarea.id !== action.payload.tareaId
            ? tarea
            : {
                ...tarea,
                items: tarea.items.map((item) =>
                  item.id === action.payload.itemId ? { ...item, done: !item.done } : item,
                ),
              },
        ),
      })

    case 'IMPORT_TAREAS':
      return updateTimestamp({ ...data, tareas: [...data.tareas, ...action.payload] })

    case 'UPDATE_MATERIA_HORAS':
      return updateTimestamp({
        ...data,
        materias: data.materias.map((materia) =>
          materia.id !== action.payload.materiaId
            ? materia
            : {
                ...materia,
                horasMin: action.payload.horasMin,
                horasMax: action.payload.horasMax,
                slots: action.payload.slots ?? materia.slots,
              },
        ),
      })

    case 'MOVE_MATERIA_SLOT':
      return updateTimestamp({
        ...data,
        materias: data.materias.map((materia) =>
          materia.id !== action.payload.materiaId
            ? materia
            : {
                ...materia,
                slots: materia.slots.map((slot, index) =>
                  index !== action.payload.slotIndex
                    ? slot
                    : { ...slot, dia: action.payload.dia, momento: action.payload.momento },
                ),
              },
        ),
      })

    case 'UPDATE_MATERIAS':
      return updateTimestamp({ ...data, materias: action.payload })

    case 'UPDATE_TIPOS':
      return updateTimestamp({ ...data, tipos: action.payload })

    case 'ADD_SESION':
      return updateTimestamp({ ...data, sesiones: [...data.sesiones, action.payload] })

    case 'ADD_SESION_WITH_TASK': {
      const nextSession: Sesion = {
        id: `ses_${Math.random().toString(36).slice(2, 11)}`,
        materiaId: action.payload.materiaId,
        tareaId: action.payload.tareaId,
        inicio: action.payload.inicio,
        minutos: action.payload.minutos,
        origen: action.payload.origen,
        titulo: action.payload.titulo,
        nota: action.payload.nota ?? '',
      }
      return updateTimestamp({ ...data, sesiones: [...data.sesiones, nextSession] })
    }

    case 'UPDATE_SESION':
      return updateTimestamp({
        ...data,
        sesiones: data.sesiones.map((sesion) =>
          sesion.id === action.payload.id ? { ...sesion, ...action.payload.changes } : sesion,
        ),
      })

    case 'DELETE_SESION':
      return updateTimestamp({
        ...data,
        sesiones: data.sesiones.filter((sesion) => sesion.id !== action.payload.id),
      })

    default:
      return data
  }
}

function updateTimestamp(data: PlannerData): PlannerData {
  return { ...data, updatedAt: new Date().toISOString() }
}
