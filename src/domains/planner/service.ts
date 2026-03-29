import type {
  AlertasConfig,
  AppMode,
  FranjaMap,
  FranjaMode,
  GridLayout,
  PlannerData,
  ThemeId,
  ViewMode,
} from './types'
import type { StoredFilters } from '../../store/types'
import { createEmptyPlannerData, normalizePlannerData } from '../import-export/normalizer'
import { DEFAULT_FRANJAS_3 } from '../schedule/franjas'

export const LS = {
  THEME: 'uai-theme',
  MODE: 'uai-planner-mode',
  DATA: (email?: string | null) =>
    email ? `uai-planner-data-v1-${email}` : 'uai-planner-data-v1',
  EMAIL: 'uai-planner-email',
  LAST_VIEW: 'uai-last-view',
  AUTO_SAVE: 'uai-autosave',
  CHROME_PINNED: 'uai-chrome-pinned',
  FILTERS: 'uai-filters',
  FRANJAS: 'uai-franjas',
  FRANJA_MODE: 'uai-franjas-mode',
  ALERTAS: 'uai-alertas',
  DRIVE_FILE_ID: 'uai-planner-drive-fileid',
  LAST_SAVED: 'uai-planner-last-saved',
  GRID_LAYOUT: 'uai-grid-layout',
  HELP_SHOWN: 'uai-help-shown',
} as const

function safeRead(key: string): string | null {
  if (typeof window === 'undefined') {
    return null
  }
  return window.localStorage.getItem(key)
}

function safeWrite(key: string, value: string): void {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.setItem(key, value)
}

function applyTheme(theme: ThemeId): void {
  if (typeof document === 'undefined') {
    return
  }
  document.documentElement.setAttribute('data-theme', theme)
}

function normalizeTheme(raw: string | null): ThemeId {
  if (
    raw === 'theme-1' ||
    raw === 'theme-2' ||
    raw === 'theme-3' ||
    raw === 'theme-4' ||
    raw === 'theme-5'
  ) {
    return raw
  }
  return 'theme-1'
}

function safeBoolean(key: string, fallback: boolean): boolean {
  const raw = safeRead(key)
  if (raw === 'true') return true
  if (raw === 'false') return false
  return fallback
}

function safeJSON<T>(key: string, fallback: T, parser: (raw: unknown) => T): T {
  const raw = safeRead(key)
  if (!raw) {
    return fallback
  }

  try {
    const parsed: unknown = JSON.parse(raw)
    return parser(parsed)
  } catch {
    console.error(`[PlannerService] Failed to parse ${key}, returning fallback`)
    return fallback
  }
}

function normalizeJson<T>(raw: unknown, normalizer: (value: unknown) => T, fallback: T): T {
  try {
    return normalizer(raw)
  } catch {
    console.error('[PlannerService] Failed to normalize data, returning fallback')
    return fallback
  }
}

export const PlannerService = {
  getMode(): AppMode {
    const raw = safeRead(LS.MODE)
    if (raw === 'local' || raw === 'drive' || raw === 'welcome') {
      return raw
    }
    return 'welcome'
  },

  setMode(mode: AppMode): void {
    safeWrite(LS.MODE, mode)
  },

  loadData(email?: string | null): PlannerData {
    try {
      const raw = safeRead(LS.DATA(email))
      if (!raw) {
        return createEmptyPlannerData()
      }
      const parsed: unknown = JSON.parse(raw)
      return normalizePlannerData(parsed)
    } catch {
      console.error('[PlannerService] Failed to load data, returning empty')
      return createEmptyPlannerData()
    }
  },

  saveData(data: PlannerData, email?: string | null): void {
    try {
      const payload = JSON.stringify(data)
      safeWrite(LS.DATA(email), payload)
    } catch (error) {
      console.error('[PlannerService] Failed to save data', error)
    }
  },

  getEmail(): string | null {
    return safeRead(LS.EMAIL)
  },

  setEmail(email: string | null): void {
    if (email === null) {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(LS.EMAIL)
      }
      return
    }
    safeWrite(LS.EMAIL, email)
  },

  getTheme(): ThemeId {
    return normalizeTheme(safeRead(LS.THEME))
  },

  setTheme(id: ThemeId): void {
    safeWrite(LS.THEME, id)
    applyTheme(id)
  },

  applyTheme(id: ThemeId): void {
    applyTheme(id)
  },

  getLastView(): ViewMode {
    const raw = safeRead(LS.LAST_VIEW)
    if (raw === 'hoy' || raw === 'semana' || raw === 'kanban' || raw === 'backlog' || raw === 'calendar' || raw === 'materias') {
      return raw
    }
    return 'hoy'
  },

  setLastView(view: ViewMode): void {
    safeWrite(LS.LAST_VIEW, view)
  },

  getFranjas(): FranjaMap {
    return safeJSON<FranjaMap>(
      LS.FRANJAS,
      DEFAULT_FRANJAS_3 as unknown as FranjaMap,
      (raw) => normalizeJson(raw, (value) => value as FranjaMap, DEFAULT_FRANJAS_3 as unknown as FranjaMap),
    )
  },

  setFranjas(franjas: FranjaMap): void {
    try {
      safeWrite(LS.FRANJAS, JSON.stringify(franjas))
    } catch (error) {
      console.error('[PlannerService] Failed to save franjas', error)
    }
  },

  getFranjaMode(): FranjaMode {
    const raw = safeRead(LS.FRANJA_MODE)
    if (raw === '3-franjas' || raw === '6-franjas') {
      return raw
    }
    return '3-franjas'
  },

  setFranjaMode(mode: FranjaMode): void {
    safeWrite(LS.FRANJA_MODE, mode)
  },

  getAlertas(): AlertasConfig {
    return safeJSON<AlertasConfig>(LS.ALERTAS, {
      enabled: true,
      dueSoonDays: 3,
      startSoonMinutes: 60,
      overdueMinutes: 0,
      notifyOnToday: true,
    }, (raw) => normalizeJson(raw, (value) => value as AlertasConfig, {
      enabled: true,
      dueSoonDays: 3,
      startSoonMinutes: 60,
      overdueMinutes: 0,
      notifyOnToday: true,
    }))
  },

  setAlertas(config: AlertasConfig): void {
    try {
      safeWrite(LS.ALERTAS, JSON.stringify(config))
    } catch (error) {
      console.error('[PlannerService] Failed to save alertas', error)
    }
  },

  getAutoSave(): boolean {
    return safeBoolean(LS.AUTO_SAVE, false)
  },

  setAutoSave(v: boolean): void {
    safeWrite(LS.AUTO_SAVE, v ? 'true' : 'false')
  },

  getChromePinned(): boolean {
    return safeBoolean(LS.CHROME_PINNED, false)
  },

  setChromePinned(v: boolean): void {
    safeWrite(LS.CHROME_PINNED, v ? 'true' : 'false')
  },

  getFilters(): StoredFilters | null {
    return safeJSON<StoredFilters | null>(LS.FILTERS, null, (raw) => raw as StoredFilters | null)
  },

  setFilters(f: StoredFilters | null): void {
    try {
      if (f === null) {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(LS.FILTERS)
        }
        return
      }
      safeWrite(LS.FILTERS, JSON.stringify(f))
    } catch (error) {
      console.error('[PlannerService] Failed to save filters', error)
    }
  },

  getGridLayout(): GridLayout {
    const raw = safeRead(LS.GRID_LAYOUT)
    if (raw === 'horizontal' || raw === 'vertical') {
      return raw
    }
    return 'horizontal'
  },

  setGridLayout(v: GridLayout): void {
    safeWrite(LS.GRID_LAYOUT, v)
  },

  getHelpShown(): boolean {
    return safeBoolean(LS.HELP_SHOWN, false)
  },

  setHelpShown(value: boolean): void {
    safeWrite(LS.HELP_SHOWN, value ? 'true' : 'false')
  },
}
