import { afterEach, describe, expect, it } from 'vitest'
import { usePlannerStore } from '../../src/store/usePlannerStore'
import { createEmptyPlannerData, hashData } from '../../src/domains/import-export/normalizer'

describe('usePlannerStore', () => {
  afterEach(() => {
    usePlannerStore.setState({
      data: createEmptyPlannerData(),
      dirty: false,
      lastSavedHash: hashData(createEmptyPlannerData()),
      appMode: 'local',
    })
    window.localStorage.clear()
  })

  it('tareaAdded generates a unique id and updates data length', () => {
    const initialCount = usePlannerStore.getState().data.tareas.length
    usePlannerStore.getState().tareaAdded({
      titulo: 'Nueva tarea',
      descripcion: 'Descripción de prueba',
      materiaId: 'mat_test',
      tipo: 'tp',
      fechaLimite: null,
      fechaInicio: null,
      hora: null,
      estado: 'pendiente',
      prioridad: 'media',
      obligatorio: false,
      items: [],
      link_vc: null,
    })

    const state = usePlannerStore.getState()
    expect(state.data.tareas.length).toBe(initialCount + 1)
    const addedTask = state.data.tareas[state.data.tareas.length - 1]
    expect(addedTask).toBeDefined()
    expect(addedTask?.id).toMatch(/^tar_?/) 
    expect(state.dirty).toBe(false)
    expect(state.lastSavedHash).toBe(hashData(state.data))
  })

  it('tareaDeleted reduces the task array by one', () => {
    usePlannerStore.getState().tareaAdded({
      titulo: 'Tarea eliminar',
      descripcion: '',
      materiaId: 'mat_test',
      tipo: 'tp',
      fechaLimite: null,
      fechaInicio: null,
      hora: null,
      estado: 'pendiente',
      prioridad: 'baja',
      obligatorio: false,
      items: [],
      link_vc: null,
    })

    const stateBefore = usePlannerStore.getState()
    const addedTask = stateBefore.data.tareas[stateBefore.data.tareas.length - 1]
    expect(addedTask).toBeDefined()
    const beforeCount = stateBefore.data.tareas.length

    if (addedTask) {
      usePlannerStore.getState().tareaDeleted(addedTask.id)
    }

    const stateAfter = usePlannerStore.getState()
    expect(stateAfter.data.tareas.length).toBe(beforeCount - 1)
    expect(stateAfter.data.tareas.find((task) => task.id === addedTask?.id)).toBeUndefined()
    expect(stateAfter.dirty).toBe(false)
  })
})
