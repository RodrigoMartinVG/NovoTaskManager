import type { Periodo, Prioridad, TareaEstado, PlannerData } from '@domains/planner/types'

export interface ConfirmConfig {
  title: string
  description: string
  confirmLabel: string
  cancelLabel: string
  tone?: 'danger' | 'warn' | 'info' | undefined
  onConfirm?: () => void
  onCancel?: () => void
}

export interface DriveConflict {
  local: PlannerData
  remote: PlannerData
  resolution?: 'local' | 'remote' | 'merge'
}

export interface PomoSession {
  id: string
  materiaId: string
  tareaId: string | null
  titulo: string
  iniciadoEn: string
  minutos: number
  completado: boolean
}

export interface MateriaContext {
  materiaId: string
  tareaId: string | null
  titulo: string
}

export interface GlobalFilters {
  materiaIds?: string[] | undefined
  tipoIds?: string[] | undefined
  periodo?: Periodo | undefined
  estado?: TareaEstado | undefined
  prioridad?: Prioridad | undefined
  textoLibre?: string | undefined
  anio?: number | 'all' | undefined
}

export interface ListFilters {
  estado?: TareaEstado | 'todos' | undefined
  prioridad?: Prioridad | 'todos' | undefined
  materiaId?: string | undefined
  tipoId?: string | undefined
  alerta?: string | undefined
  search?: string | undefined
  fechaLimiteAntesDe?: string | undefined
  fechaInicioDespuesDe?: string | undefined
}

export interface CalendarFilters {
  showInicio: boolean
  showFin: boolean
}

export interface StoredFilters {
  id: string
  nombre: string
  filters: GlobalFilters | ListFilters | CalendarFilters
  createdAt: string
}
