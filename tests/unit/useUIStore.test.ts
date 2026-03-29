import { afterEach, describe, expect, it } from 'vitest'
import { useUIStore } from '../../src/store/useUIStore'

describe('useUIStore', () => {
  afterEach(() => {
    localStorage.clear()
    useUIStore.setState({
      activeView: 'hoy',
      filters: { anio: 'all' },
      listFilters: { estado: 'todos', prioridad: 'todos' },
      calendarFilters: { showInicio: true, showFin: true },
      weekLayout: 'horizontal',
      selectedTaskId: null,
      editingTask: null,
      settingsOpen: false,
      importTasksOpen: false,
      resetModalOpen: false,
      confirm: null,
      helpOpen: false,
      editObjetivoMateriaId: null,
      manualSessionMateriaId: null,
    })
  })

  it('taskSelected sets selectedTaskId', () => {
    useUIStore.getState().taskSelected('task-123')
    expect(useUIStore.getState().selectedTaskId).toBe('task-123')
  })

  it('viewChanged updates activeView', () => {
    useUIStore.getState().viewChanged('kanban')
    expect(useUIStore.getState().activeView).toBe('kanban')
  })

  it('weekLayoutChanged updates and persists the week layout', () => {
    useUIStore.getState().weekLayoutChanged('vertical')

    expect(useUIStore.getState().weekLayout).toBe('vertical')
    expect(localStorage.getItem('uai-grid-layout')).toBe('vertical')
  })
})
