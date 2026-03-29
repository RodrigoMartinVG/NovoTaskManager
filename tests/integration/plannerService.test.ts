import { afterEach, describe, expect, it, vi } from 'vitest'
import { createEmptyPlannerData } from '../../src/domains/import-export/normalizer'
import { DEFAULT_FRANJAS_3 } from '../../src/domains/schedule/franjas'
import { LS, PlannerService } from '../../src/domains/planner/service'

describe('PlannerService', () => {
  afterEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('saves and loads planner data without email', () => {
    const data = createEmptyPlannerData()
    data.materias = [
      {
        id: 'mat_test',
        nombre: 'Test',
        codigo: 'TEST',
        color: '#000000',
        anio: 2026,
        periodo: 'c1',
        horasMin: 0,
        horasMax: 0,
        slots: [],
      },
    ]

    PlannerService.saveData(data)
    const loaded = PlannerService.loadData()

    expect(loaded).toEqual(data)
    expect(localStorage.getItem(LS.DATA())).toBeTruthy()
  })

  it('uses distinct storage keys for different emails', () => {
    const first = createEmptyPlannerData()
    first.version = '1'
    const second = createEmptyPlannerData()
    second.version = '2'

    PlannerService.saveData(first, 'user1@example.com')
    PlannerService.saveData(second, 'user2@example.com')

    expect(localStorage.getItem(LS.DATA('user1@example.com'))).toBeTruthy()
    expect(localStorage.getItem(LS.DATA('user2@example.com'))).toBeTruthy()
    expect(localStorage.getItem(LS.DATA('user1@example.com'))).not.toEqual(
      localStorage.getItem(LS.DATA('user2@example.com')),
    )

    expect(PlannerService.loadData('user1@example.com')).toEqual(first)
    expect(PlannerService.loadData('user2@example.com')).toEqual(second)
  })

  it('returns empty planner data when stored JSON is corrupt', () => {
    localStorage.setItem(LS.DATA(), 'not a valid json')
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const loaded = PlannerService.loadData()

    expect(loaded).toEqual(createEmptyPlannerData())
    expect(errorSpy).toHaveBeenCalledWith('[PlannerService] Failed to load data, returning empty')
  })

  it('falls back to defaults for theme, view, and franjas', () => {
    expect(PlannerService.getTheme()).toBe('theme-1')
    expect(PlannerService.getLastView()).toBe('hoy')
    expect(PlannerService.getFranjas()).toEqual(DEFAULT_FRANJAS_3)
    expect(PlannerService.getGridLayout()).toBe('horizontal')
  })

  it('persists theme and last view settings', () => {
    PlannerService.setTheme('theme-3')
    PlannerService.setLastView('kanban')
    PlannerService.setGridLayout('vertical')
    expect(PlannerService.getTheme()).toBe('theme-3')
    expect(PlannerService.getLastView()).toBe('kanban')
    expect(PlannerService.getGridLayout()).toBe('vertical')
  })

  it('applies the theme attribute to document.documentElement', () => {
    PlannerService.setTheme('theme-2')
    expect(document.documentElement.getAttribute('data-theme')).toBe('theme-2')
  })
})
