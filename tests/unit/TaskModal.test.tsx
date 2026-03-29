import { afterEach, describe, expect, it } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { TaskModal } from '../../src/features/tasks/TaskModal'
import { createEmptyPlannerData, hashData } from '../../src/domains/import-export/normalizer'
import { usePlannerStore } from '../../src/store/usePlannerStore'
import { useUIStore } from '../../src/store/useUIStore'

function seedTaskState() {
  const data = createEmptyPlannerData()
  data.materias = [
    {
      id: 'mat_hist',
      nombre: 'Historia',
      codigo: 'HIS101',
      color: '#336699',
      anio: 2026,
      periodo: 'c1',
      horasMin: 2,
      horasMax: 4,
      slots: [],
    },
  ]
  data.tipos = [
    {
      id: 'lectura',
      label: 'Lectura',
      icon: '📘',
      bg: '#dbeafe',
      accent: '#1d4ed8',
    },
  ]
  data.tareas = [
    {
      id: 'tar_hist_1',
      titulo: 'Leer capitulo 3',
      descripcion: 'Revisar apuntes y subrayar ideas clave.',
      materiaId: 'mat_hist',
      tipo: 'lectura',
      fechaLimite: '2026-03-31',
      fechaInicio: '2026-03-29',
      hora: '18:00',
      estado: 'pendiente',
      prioridad: 'media',
      obligatorio: true,
      items: [
        { id: 'chk_1', label: 'Leer introduccion', done: false },
        { id: 'chk_2', label: 'Resumir conceptos', done: true },
      ],
      link_vc: null,
    },
  ]

  usePlannerStore.setState({
    data,
    dirty: false,
    lastSavedHash: hashData(data),
    appMode: 'local',
  })

  useUIStore.setState({
    activeView: 'backlog',
    filters: { anio: 'all' },
    listFilters: { estado: 'todos', prioridad: 'todos' },
    calendarFilters: { showInicio: true, showFin: true },
    weekLayout: 'horizontal',
    selectedTaskId: 'tar_hist_1',
    editingTask: null,
    settingsOpen: false,
    importTasksOpen: false,
    resetModalOpen: false,
    confirm: null,
    helpOpen: false,
    editObjetivoMateriaId: null,
    manualSessionMateriaId: null,
  })
}

describe('TaskModal', () => {
  afterEach(() => {
    const empty = createEmptyPlannerData()
    act(() => {
      usePlannerStore.setState({
        data: empty,
        dirty: false,
        lastSavedHash: hashData(empty),
        appMode: 'local',
      })
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
    window.localStorage.clear()
  })

  it('renders selected task and toggles checklist items', async () => {
    await act(async () => {
      seedTaskState()
      render(<TaskModal />)
    })

    expect(screen.getAllByText('Leer capitulo 3').length).toBeGreaterThan(0)
    const checkbox = screen.getByLabelText('Leer introduccion') as HTMLInputElement
    expect(checkbox.checked).toBe(false)

    await act(async () => {
      fireEvent.click(checkbox)
    })

    const updatedTask = usePlannerStore.getState().data.tareas[0]
    expect(updatedTask?.items[0]?.done).toBe(true)
  })
})