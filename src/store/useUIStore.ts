import { create } from 'zustand'
import { PlannerService } from '../domains/planner/service'
import type { CalendarFilters, ConfirmConfig, GlobalFilters, ListFilters } from './types'
import type { GridLayout, Periodo, Tarea, ViewMode } from '../domains/planner/types'

interface UIStore {
  activeView: ViewMode
  filters: GlobalFilters
  listFilters: ListFilters
  calendarFilters: CalendarFilters
  weekLayout: GridLayout

  selectedTaskId: string | null
  editingTask: Partial<Tarea> | null
  settingsOpen: false | string
  importTasksOpen: boolean
  resetModalOpen: boolean
  confirm: ConfirmConfig | null
  helpOpen: boolean
  editObjetivoMateriaId: string | null
  manualSessionMateriaId: string | null

  viewChanged(view: ViewMode): void
  anioChanged(anio: number | 'all'): void
  periodoToggled(periodo: Periodo): void
  listMateriaChanged(id: string | undefined): void
  listTipoChanged(id: string | undefined): void
  listAlertaChanged(value: string | undefined): void
  calendarInicioToggled(): void
  calendarFinToggled(): void
  weekLayoutChanged(layout: GridLayout): void

  taskSelected(id: string | null): void
  taskEditOpened(task: Partial<Tarea> | null): void
  taskEditClosed(): void
  settingsOpened(tab?: string): void
  settingsClosed(): void
  importTasksOpened(): void
  importTasksClosed(): void
  resetModalOpened(): void
  resetModalClosed(): void
  confirmOpened(config: ConfirmConfig): void
  confirmClosed(): void
  helpOpened(): void
  helpClosed(): void
  objetivoEditOpened(materiaId: string): void
  objetivoEditClosed(): void
  manualSessionOpened(materiaId: string): void
  manualSessionClosed(): void
}

const initialFilters: GlobalFilters = {
  anio: 'all',
}

const initialListFilters: ListFilters = {
  estado: 'todos',
  prioridad: 'todos',
}

const initialCalendarFilters: CalendarFilters = {
  showInicio: true,
  showFin: true,
}

export const useUIStore = create<UIStore>()((set, get) => ({
  activeView: PlannerService.getLastView(),
  filters: initialFilters,
  listFilters: initialListFilters,
  calendarFilters: initialCalendarFilters,
  weekLayout: PlannerService.getGridLayout(),

  selectedTaskId: null,
  editingTask: null,
  settingsOpen: false,
  importTasksOpen: false,
  resetModalOpen: false,
  confirm: null,
  helpOpen: false,
  editObjetivoMateriaId: null,
  manualSessionMateriaId: null,

  viewChanged: (view) => {
    PlannerService.setLastView(view)
    set({ activeView: view })
  },

  anioChanged: (anio) => {
    const filters = { ...get().filters, anio }
    PlannerService.setFilters({ id: 'filters', nombre: 'global', filters, createdAt: new Date().toISOString() })
    set({ filters })
  },

  periodoToggled: (periodo) => {
    const current = get().filters
    const nextPeriodo = current.periodo === periodo ? undefined : periodo
    const filters = { ...current, periodo: nextPeriodo }
    PlannerService.setFilters({ id: 'filters', nombre: 'global', filters, createdAt: new Date().toISOString() })
    set({ filters })
  },

  listMateriaChanged: (id) => set({ listFilters: { ...get().listFilters, materiaId: id } }),
  listTipoChanged: (id) => set({ listFilters: { ...get().listFilters, tipoId: id } }),
  listAlertaChanged: (value) => set({ listFilters: { ...get().listFilters, alerta: value } }),
  calendarInicioToggled: () => {
    const current = get().calendarFilters
    if (current.showInicio && !current.showFin) {
      return
    }
    set({ calendarFilters: { ...current, showInicio: !current.showInicio } })
  },
  calendarFinToggled: () => {
    const current = get().calendarFilters
    if (current.showFin && !current.showInicio) {
      return
    }
    set({ calendarFilters: { ...current, showFin: !current.showFin } })
  },
  weekLayoutChanged: (layout) => {
    PlannerService.setGridLayout(layout)
    set({ weekLayout: layout })
  },

  taskSelected: (id) => set({ selectedTaskId: id }),
  taskEditOpened: (task) => set({ editingTask: task }),
  taskEditClosed: () => set({ editingTask: null }),
  settingsOpened: (tab = 'general') => set({ settingsOpen: tab }),
  settingsClosed: () => set({ settingsOpen: false }),
  importTasksOpened: () => set({ importTasksOpen: true }),
  importTasksClosed: () => set({ importTasksOpen: false }),
  resetModalOpened: () => set({ resetModalOpen: true }),
  resetModalClosed: () => set({ resetModalOpen: false }),
  confirmOpened: (config) => set({ confirm: config }),
  confirmClosed: () => set({ confirm: null }),
  helpOpened: () => set({ helpOpen: true }),
  helpClosed: () => set({ helpOpen: false }),
  objetivoEditOpened: (materiaId) => set({ editObjetivoMateriaId: materiaId }),
  objetivoEditClosed: () => set({ editObjetivoMateriaId: null }),
  manualSessionOpened: (materiaId) => set({ manualSessionMateriaId: materiaId }),
  manualSessionClosed: () => set({ manualSessionMateriaId: null }),
}))
