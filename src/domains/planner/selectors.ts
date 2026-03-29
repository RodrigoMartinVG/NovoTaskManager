import { getAlertColor } from '@domains/alerts/alertEngine'
import { daysUntil } from '@/utils/dateUtils'
import type {
  Materia,
  PlannerData,
  Sesion,
  TipoTarea,
  Tarea,
  AlertasConfig,
} from './types'
import type { GlobalFilters, ListFilters } from '@store/types'

export function selectMateriasFiltradas(data: PlannerData, filters?: GlobalFilters): Materia[] {
  if (!filters) {
    return data.materias
  }

  return data.materias.filter((materia) => {
    const matchesMateriaIds = !filters.materiaIds || filters.materiaIds.length === 0 || filters.materiaIds.includes(materia.id)
    const matchesPeriodo = !filters.periodo || materia.periodo === filters.periodo
    const matchesNombre = !filters.textoLibre || materia.nombre.toLowerCase().includes(filters.textoLibre.toLowerCase())
    return matchesMateriaIds && matchesPeriodo && matchesNombre
  })
}

export function selectMatIdsActivos(materias: Materia[]): Set<string> {
  return new Set(materias.filter((materia) => materia.activo !== false).map((materia) => materia.id))
}

export function selectTareasFiltradas(data: PlannerData, materiaIds: Set<string>, filters?: ListFilters): Tarea[] {
  return data.tareas.filter((tarea) => {
    if (materiaIds.size > 0 && !materiaIds.has(tarea.materiaId)) {
      return false
    }

    if (!filters) {
      return true
    }

    if (filters.estado && filters.estado !== 'todos' && tarea.estado !== filters.estado) {
      return false
    }

    if (filters.prioridad && filters.prioridad !== 'todos' && tarea.prioridad !== filters.prioridad) {
      return false
    }

    if (filters.materiaId && tarea.materiaId !== filters.materiaId) {
      return false
    }

    if (filters.tipoId && tarea.tipo !== filters.tipoId) {
      return false
    }

    if (filters.alerta) {
      const alertas = data.alertas
      if (!alertas) {
        return false
      }
      const color = getAlertColor(tarea, alertas)
      if (color !== filters.alerta) {
        return false
      }
    }

    if (filters.search) {
      const normalizedSearch = filters.search.toLowerCase()
      const haystack = `${tarea.titulo} ${tarea.descripcion}`.toLowerCase()
      if (!haystack.includes(normalizedSearch)) {
        return false
      }
    }

    if (filters.fechaLimiteAntesDe && tarea.fechaLimite) {
      if (tarea.fechaLimite > filters.fechaLimiteAntesDe) {
        return false
      }
    }

    if (filters.fechaInicioDespuesDe && tarea.fechaInicio) {
      if (tarea.fechaInicio < filters.fechaInicioDespuesDe) {
        return false
      }
    }

    return true
  })
}

export function selectSubjectsById(materias: Materia[]): Record<string, Materia> {
  return materias.reduce<Record<string, Materia>>((acc, materia) => {
    acc[materia.id] = materia
    return acc
  }, {})
}

export function selectTaskTypesById(tipos: TipoTarea[]): Record<string, TipoTarea> {
  return tipos.reduce<Record<string, TipoTarea>>((acc, tipo) => {
    acc[tipo.id] = tipo
    return acc
  }, {})
}

export function selectUrgentTasks(tareas: Tarea[], alertas?: AlertasConfig): Tarea[] {
  if (!alertas || !alertas.enabled) {
    return []
  }

  return tareas.filter((tarea) => {
    const color = getAlertColor(tarea, alertas)
    return color === 'red' || color === 'yellow' || color === 'start_now' || color === 'start_soon' || color === 'start_overdue'
  })
}

export function selectHorasSemanaPorMateria(sesiones: Sesion[], materiaId: string): number {
  const ahora = new Date()
  const sieteDiasAntes = new Date(ahora.valueOf() - 7 * 24 * 60 * 60 * 1000)

  const minutos = sesiones.reduce((total, sesion) => {
    if (sesion.materiaId !== materiaId) {
      return total
    }

    const inicio = new Date(sesion.inicio)
    if (Number.isNaN(inicio.getTime())) {
      return total
    }

    if (inicio >= sieteDiasAntes && inicio <= ahora) {
      return total + sesion.minutos
    }

    return total
  }, 0)

  return Math.round(minutos / 60)
}

export function selectSesionesPorTarea(sesiones: Sesion[], tareaId: string): Sesion[] {
  return sesiones.filter((sesion) => sesion.tareaId === tareaId)
}

export function selectTareasConFechaCercana(tareas: Tarea[]): Tarea[] {
  return tareas
    .filter((tarea) => tarea.fechaLimite !== null && daysUntil(tarea.fechaLimite) !== null)
    .sort((a, b) => (a.fechaLimite ?? '').localeCompare(b.fechaLimite ?? ''))
}
