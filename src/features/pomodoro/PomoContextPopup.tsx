import { useMemo, useState } from 'react'
import { Modal } from '../../shared/components/Modal'
import { localISONow } from '../../utils/dateUtils'
import { usePlannerStore } from '../../store/usePlannerStore'
import { usePomoStore } from '../../store/usePomoStore'
import type { PomoSession } from '../../store/types'
import styles from './PomoContextPopup.module.css'

type ContextMode = 'existing' | 'quick' | 'free'

function createSessionId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `pomo_${crypto.randomUUID()}`
  }
  return `pomo_${Math.random().toString(36).slice(2, 10)}`
}

export function PomoContextPopup() {
  const contextMateria = usePomoStore((state) => state.contextMateria)
  const contextClosed = usePomoStore((state) => state.contextClosed)
  const pomoStarted = usePomoStore((state) => state.pomoStarted)

  const data = usePlannerStore((state) => state.data)
  const tareaAdded = usePlannerStore((state) => state.tareaAdded)

  const [mode, setMode] = useState<ContextMode>('existing')
  const [selectedTaskId, setSelectedTaskId] = useState<string>('')
  const [quickTitle, setQuickTitle] = useState('')
  const [sessionTitle, setSessionTitle] = useState('')
  const [error, setError] = useState<string | null>(null)

  const materia = useMemo(
    () => data.materias.find((item) => item.id === contextMateria?.materiaId),
    [data.materias, contextMateria],
  )

  const availableTasks = useMemo(() => {
    if (!contextMateria) {
      return []
    }
    return data.tareas.filter(
      (task) => task.materiaId === contextMateria.materiaId && task.estado !== 'completado',
    )
  }, [data.tareas, contextMateria])

  if (!contextMateria || !materia) {
    return null
  }

  const currentContext = contextMateria
  const currentMateria = materia

  function makeBaseSession(tareaId: string | null, titulo: string): PomoSession {
    return {
      id: createSessionId(),
      materiaId: currentMateria.id,
      tareaId,
      titulo,
      iniciadoEn: localISONow(),
      minutos: 0,
      completado: false,
    }
  }

  function resolveRecentlyAddedTaskId(beforeIds: Set<string>): string | null {
    const currentTasks = usePlannerStore.getState().data.tareas
    const created = currentTasks.find((task) => !beforeIds.has(task.id) && task.materiaId === currentMateria.id)
    return created?.id ?? null
  }

  function startSession(session: PomoSession) {
    setError(null)
    pomoStarted(session)
    contextClosed()
  }

  function handleStart() {
    if (mode === 'existing') {
      const defaultTask = currentContext.tareaId ?? availableTasks[0]?.id ?? null
      const taskId = selectedTaskId || defaultTask
      const task = taskId ? availableTasks.find((item) => item.id === taskId) : null

      if (!taskId || !task) {
        setError('Elegí una tarea para iniciar.')
        return
      }

      const title = sessionTitle.trim() || task.titulo
      startSession(makeBaseSession(taskId, title))
      return
    }

    if (mode === 'quick') {
      if (!quickTitle.trim()) {
        setError('Ingresá un título para la tarea rápida.')
        return
      }

      const beforeIds = new Set(data.tareas.map((task) => task.id))
      tareaAdded({
        titulo: quickTitle.trim(),
        descripcion: '',
        materiaId: currentMateria.id,
        tipo: data.tipos[0]?.id ?? 'tp',
        fechaLimite: null,
        fechaInicio: null,
        hora: null,
        estado: 'pendiente',
        prioridad: 'media',
        obligatorio: false,
        items: [],
        link_vc: null,
      })

      const newTaskId = resolveRecentlyAddedTaskId(beforeIds)
      const title = sessionTitle.trim() || quickTitle.trim()
      startSession(makeBaseSession(newTaskId, title))
      return
    }

    const fallbackTitle = sessionTitle.trim() || `Sesion libre · ${currentMateria.nombre}`
    startSession(makeBaseSession(null, fallbackTitle))
  }

  const defaultTaskId = currentContext.tareaId ?? availableTasks[0]?.id ?? ''

  return (
    <Modal title={`Pomodoro · ${currentMateria.nombre}`} onClose={contextClosed} maxWidth={560}>
      <div className={styles.wrapper}>
        <div className={styles.modeRow} role="radiogroup" aria-label="Modo de sesión">
          <button
            type="button"
            className={`${styles.modeButton} ${mode === 'existing' ? styles.modeActive : ''}`}
            onClick={() => setMode('existing')}
          >
            Tarea existente
          </button>
          <button
            type="button"
            className={`${styles.modeButton} ${mode === 'quick' ? styles.modeActive : ''}`}
            onClick={() => setMode('quick')}
          >
            Tarea rápida
          </button>
          <button
            type="button"
            className={`${styles.modeButton} ${mode === 'free' ? styles.modeActive : ''}`}
            onClick={() => setMode('free')}
          >
            Sesión libre
          </button>
        </div>

        {mode === 'existing' && (
          <label className={styles.field}>
            <span className={styles.label}>Tarea</span>
            <select
              className={styles.select}
              value={selectedTaskId || defaultTaskId}
              onChange={(event) => setSelectedTaskId(event.target.value)}
            >
              <option value="">Seleccionar tarea</option>
              {availableTasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.titulo}
                </option>
              ))}
            </select>
          </label>
        )}

        {mode === 'quick' && (
          <label className={styles.field}>
            <span className={styles.label}>Título de tarea rápida</span>
            <input
              className={styles.input}
              value={quickTitle}
              onChange={(event) => setQuickTitle(event.target.value)}
              placeholder="Ej: repasar ejercicios de parcial"
            />
          </label>
        )}

        <label className={styles.field}>
          <span className={styles.label}>Título de la sesión (opcional)</span>
          <input
            className={styles.input}
            value={sessionTitle}
            onChange={(event) => setSessionTitle(event.target.value)}
            placeholder="Si queda vacío, se usa uno automático"
          />
        </label>

        {error && <p className={styles.error}>{error}</p>}

        <footer className={styles.actions}>
          <button type="button" className={styles.cancelBtn} onClick={contextClosed}>
            Cancelar
          </button>
          <button type="button" className={styles.startBtn} onClick={handleStart}>
            Iniciar
          </button>
        </footer>
      </div>
    </Modal>
  )
}
