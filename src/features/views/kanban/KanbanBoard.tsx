import { useState, useMemo } from 'react'
import { usePlannerStore } from '../../../store/usePlannerStore'
import { useUIStore } from '../../../store/useUIStore'
import {
  selectMatIdsActivos,
  selectSubjectsById,
  selectTaskTypesById,
  selectTareasFiltradas,
} from '../../../domains/planner/selectors'
import type { TareaEstado, Tarea } from '../../../domains/planner/types'
import { KanbanColumn } from './KanbanColumn'
import { KanbanCard } from './KanbanCard'
import styles from './KanbanBoard.module.css'

const COLUMNS: { estado: TareaEstado; label: string }[] = [
  { estado: 'pendiente', label: 'Pendiente' },
  { estado: 'en_progreso', label: 'En progreso' },
  { estado: 'completado', label: 'Completado' },
]

function sortColumnTasks(tasks: Tarea[]): Tarea[] {
  return [...tasks].sort((a, b) => {
    const aDate = a.fechaLimite
    const bDate = b.fechaLimite
    if (!aDate && !bDate) return a.titulo.localeCompare(b.titulo)
    if (!aDate) return 1
    if (!bDate) return -1
    return aDate.localeCompare(bDate)
  })
}

function nextEstado(estado: TareaEstado): TareaEstado {
  if (estado === 'pendiente') return 'en_progreso'
  if (estado === 'en_progreso') return 'completado'
  return 'pendiente'
}

export function KanbanBoard() {
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [overColumn, setOverColumn] = useState<TareaEstado | null>(null)

  const data = usePlannerStore((state) => state.data)
  const tareaEstadoCambiado = usePlannerStore((state) => state.tareaEstadoCambiado)
  const listFilters = useUIStore((state) => state.listFilters)
  const taskSelected = useUIStore((state) => state.taskSelected)

  const materiaIds = useMemo(() => selectMatIdsActivos(data.materias), [data.materias])
  const tareasFiltradas = useMemo(
    () => selectTareasFiltradas(data, materiaIds, listFilters),
    [data, materiaIds, listFilters],
  )
  const materiasById = useMemo(() => selectSubjectsById(data.materias), [data.materias])
  const tiposById = useMemo(() => selectTaskTypesById(data.tipos), [data.tipos])

  function handleDragStart(id: string) {
    setDraggedId(id)
  }

  function handleDragOver(e: React.DragEvent, estado: TareaEstado) {
    e.preventDefault()
    setOverColumn(estado)
  }

  function handleDragLeave() {
    setOverColumn(null)
  }

  function handleDrop(targetEstado: TareaEstado) {
    if (draggedId) {
      tareaEstadoCambiado(draggedId, targetEstado)
    }
    setDraggedId(null)
    setOverColumn(null)
  }

  function handleKeyboardMove(taskId: string) {
    const task = data.tareas.find((item) => item.id === taskId)
    if (!task) {
      return
    }
    tareaEstadoCambiado(task.id, nextEstado(task.estado))
  }

  return (
    <div className={styles.board}>
      {COLUMNS.map(({ estado, label }) => {
        const columnTasks = sortColumnTasks(tareasFiltradas.filter((t) => t.estado === estado))
        return (
          <KanbanColumn
            key={estado}
            estado={estado}
            label={label}
            count={columnTasks.length}
            isOver={overColumn === estado}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {columnTasks.map((task) => (
              <KanbanCard
                key={task.id}
                task={task}
                materia={materiasById[task.materiaId]}
                tipo={tiposById[task.tipo]}
                alertas={data.alertas}
                onSelect={taskSelected}
                onDragStart={handleDragStart}
                onKeyboardMove={handleKeyboardMove}
              />
            ))}
          </KanbanColumn>
        )
      })}
    </div>
  )
}
