export type AppMode = 'welcome' | 'local' | 'drive'
export type ViewMode = 'hoy' | 'semana' | 'kanban' | 'backlog' | 'calendar' | 'materias'
export type SyncStatus = 'idle' | 'saving' | 'saved' | 'error'
export type ThemeId = `theme-${1 | 2 | 3 | 4 | 5}`
export type TareaEstado = 'pendiente' | 'en_progreso' | 'completado'
export type Prioridad = 'alta' | 'media' | 'baja'
export type Periodo = 'c1' | 'c2' | 'anual'
export type SesionOrigen = 'timer' | 'manual'
export type DiaId = 'lun' | 'mar' | 'mie' | 'jue' | 'vie' | 'sab' | 'dom'
export type FranjaId =
  | 'manana'
  | 'manana1'
  | 'manana2'
  | 'tarde'
  | 'tarde1'
  | 'tarde2'
  | 'noche'
  | 'noche1'
  | 'noche2'
export type FranjaMode = '3-franjas' | '6-franjas'
export type AlertColor =
  | 'green'
  | 'yellow'
  | 'red'
  | 'start_soon'
  | 'start_now'
  | 'start_overdue'
export type GridLayout = 'horizontal' | 'vertical'
export type FranjaMap = Record<FranjaId, FranjaHoraria>

export interface FranjaHoraria {
  id: FranjaId
  label: string
  startsAt: string
  endsAt: string
  description?: string
}

export interface MateriaSlot {
  dia: DiaId
  momento: FranjaId
}

export interface Materia {
  id: string
  nombre: string
  codigo: string
  color: string
  anio: number
  periodo: Periodo
  horasMin: number
  horasMax: number
  slots: MateriaSlot[]
  activo?: boolean
}

export interface TipoTarea {
  id: string
  label: string
  icon: string
  bg: string
  accent: string
}

export interface ChecklistItem {
  id: string
  label: string
  done: boolean
}

export interface Tarea {
  id: string
  titulo: string
  descripcion: string
  materiaId: string
  tipo: string
  fechaLimite: string | null
  fechaInicio: string | null
  hora: string | null
  estado: TareaEstado
  prioridad: Prioridad
  obligatorio: boolean
  items: ChecklistItem[]
  link_vc: string | null
  creadoEn?: string
  actualizadoEn?: string
}

export interface Sesion {
  id: string
  materiaId: string
  tareaId: string | null
  inicio: string
  minutos: number
  origen: SesionOrigen
  titulo: string
  nota?: string
}

export interface AlertasConfig {
  enabled: boolean
  dueSoonDays: number
  startSoonMinutes: number
  overdueMinutes: number
  notifyOnToday: boolean
}

export interface PlannerData {
  version?: string
  materias: Materia[]
  tipos: TipoTarea[]
  tareas: Tarea[]
  sesiones: Sesion[]
  alertas?: AlertasConfig
  temaId?: ThemeId
  createdAt?: string
  updatedAt?: string
}
