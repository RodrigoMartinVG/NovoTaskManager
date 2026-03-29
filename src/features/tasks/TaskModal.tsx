import { useEffect, useMemo } from 'react'
import { selectSesionesPorTarea, selectSubjectsById, selectTaskTypesById } from '../../domains/planner/selectors'
import { Modal } from '../../shared/components/Modal'
import { usePlannerStore } from '../../store/usePlannerStore'
import { usePomoStore } from '../../store/usePomoStore'
import { useUIStore } from '../../store/useUIStore'
import { formatDate } from '../../utils/dateUtils'
import { checklistProgress, isSafeUrl } from './taskModalUtils'
import styles from './TaskModal.module.css'

function priorityLabel(priority: 'alta' | 'media' | 'baja'): string {
  if (priority === 'alta') return 'Alta'
  if (priority === 'media') return 'Media'
  return 'Baja'
}

function estadoLabel(estado: 'pendiente' | 'en_progreso' | 'completado'): string {
  if (estado === 'pendiente') return 'Pendiente'
  if (estado === 'en_progreso') return 'En progreso'
  return 'Completado'
}

function formatSessionDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function TaskModal() {
  const data = usePlannerStore((state) => state.data)
  const tareaEstadoCambiado = usePlannerStore((state) => state.tareaEstadoCambiado)
  const tareaDeleted = usePlannerStore((state) => state.tareaDeleted)
  const checklistItemToggled = usePlannerStore((state) => state.checklistItemToggled)

  const selectedTaskId = useUIStore((state) => state.selectedTaskId)
  const taskSelected = useUIStore((state) => state.taskSelected)
  const taskEditOpened = useUIStore((state) => state.taskEditOpened)
  const confirmOpened = useUIStore((state) => state.confirmOpened)

  const contextOpened = usePomoStore((state) => state.contextOpened)

  const task = useMemo(
    () => data.tareas.find((item) => item.id === selectedTaskId) ?? null,
    [data.tareas, selectedTaskId],
  )
  const materiasById = useMemo(() => selectSubjectsById(data.materias), [data.materias])
  const tiposById = useMemo(() => selectTaskTypesById(data.tipos), [data.tipos])

  const materia = task ? materiasById[task.materiaId] : undefined
  const tipo = task ? tiposById[task.tipo] : undefined
  const sesiones = useMemo(() => {
    if (!task) {
      return []
    }
    return selectSesionesPorTarea(data.sesiones, task.id)
  }, [data.sesiones, task])

  useEffect(() => {
    if (!selectedTaskId) {
      return
    }
    if (!task) {
      taskSelected(null)
    }
  }, [selectedTaskId, task, taskSelected])

  if (!task) {
    return null
  }

  const currentTask = task

  const doneCount = currentTask.items.filter((item) => item.done).length
  const progressPercent = checklistProgress(doneCount, currentTask.items.length)
  const safeVideoUrl = currentTask.link_vc && isSafeUrl(currentTask.link_vc) ? currentTask.link_vc : null

  function closeModal() {
    taskSelected(null)
  }

  function handleDelete() {
    confirmOpened({
      title: 'Eliminar tarea',
      description: `Se eliminara la tarea "${currentTask.titulo}". Esta accion no se puede deshacer.`,
      confirmLabel: 'Eliminar',
      cancelLabel: 'Cancelar',
      tone: 'danger',
      onConfirm: () => {
        tareaDeleted(currentTask.id)
        taskSelected(null)
      },
    })
  }

  return (
    <Modal title={currentTask.titulo} onClose={closeModal} maxWidth={760}>
      <div className={styles.wrapper}>
        <header className={styles.hero}>
          <div className={styles.titleBlock}>
            <div className={styles.subjectRow}>
              <svg className={styles.dot} viewBox="0 0 8 8" aria-hidden="true">
                <circle cx="4" cy="4" r="4" fill={materia?.color ?? '#999999'} />
              </svg>
              <span className={styles.subjectName}>{materia?.nombre ?? 'Sin materia'}</span>
            </div>
            <h3 className={styles.taskTitle}>{currentTask.titulo}</h3>
          </div>
          {tipo && (
            <div className={styles.typePill}>
              <svg className={styles.typeTone} viewBox="0 0 12 12" aria-hidden="true">
                <rect x="0" y="0" width="12" height="12" rx="6" fill={tipo.bg} />
              </svg>
              <span className={styles.typeLabel}>{`${tipo.icon} ${tipo.label}`}</span>
            </div>
          )}
        </header>

        {currentTask.descripcion && <p className={styles.description}>{currentTask.descripcion}</p>}

        <section className={styles.metaGrid}>
          <label className={styles.metaItem}>
            <span className={styles.metaLabel}>Estado</span>
            <select
              className={styles.select}
              value={currentTask.estado}
              onChange={(event) =>
                tareaEstadoCambiado(currentTask.id, event.target.value as typeof currentTask.estado)
              }
            >
              <option value="pendiente">Pendiente</option>
              <option value="en_progreso">En progreso</option>
              <option value="completado">Completado</option>
            </select>
          </label>

          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Prioridad</span>
            <span className={styles.metaValue}>{priorityLabel(currentTask.prioridad)}</span>
          </div>

          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Fecha inicio</span>
            <span className={styles.metaValue}>{currentTask.fechaInicio ? formatDate(currentTask.fechaInicio) : 'Sin fecha'}</span>
          </div>

          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Fecha limite</span>
            <span className={styles.metaValue}>{currentTask.fechaLimite ? formatDate(currentTask.fechaLimite) : 'Sin fecha'}</span>
          </div>

          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Hora</span>
            <span className={styles.metaValue}>{currentTask.hora ?? 'Sin hora'}</span>
          </div>

          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Obligatorio</span>
            <span className={styles.metaValue}>{currentTask.obligatorio ? 'Si' : 'No'}</span>
          </div>
        </section>

        {safeVideoUrl && (
          <button
            type="button"
            className={styles.videoButton}
            onClick={() => window.open(safeVideoUrl, '_blank', 'noopener,noreferrer')}
          >
            📹 Abrir videollamada
          </button>
        )}

        {currentTask.items.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h4 className={styles.sectionTitle}>Checklist</h4>
              <span className={styles.sectionMeta}>{`${doneCount}/${currentTask.items.length}`}</span>
            </div>
            <progress className={styles.progressBar} max={100} value={progressPercent} aria-hidden="true" />
            <ul className={styles.checklist} role="list">
              {currentTask.items.map((item) => (
                <li key={item.id} className={styles.checkItem}>
                  <label className={styles.checkLabel}>
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() => checklistItemToggled(currentTask.id, item.id)}
                      aria-label={item.label}
                    />
                    <span className={item.done ? styles.checkDone : ''}>{item.label}</span>
                  </label>
                </li>
              ))}
            </ul>
          </section>
        )}

        {sesiones.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h4 className={styles.sectionTitle}>Sesiones relacionadas</h4>
              <span className={styles.sectionMeta}>{sesiones.length}</span>
            </div>
            <ul className={styles.sessionList} role="list">
              {sesiones.map((sesion) => (
                <li key={sesion.id} className={styles.sessionItem}>
                  <div>
                    <strong className={styles.sessionTitle}>{sesion.titulo}</strong>
                    <p className={styles.sessionDate}>{formatSessionDate(sesion.inicio)}</p>
                  </div>
                  <span className={styles.sessionMinutes}>{`${sesion.minutos} min`}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <footer className={styles.actions}>
          <button
            type="button"
            className={styles.actionButton}
            onClick={() => {
              taskEditOpened(currentTask)
              taskSelected(null)
            }}
          >
            ✎ Editar
          </button>
          <button type="button" className={styles.actionButton} onClick={handleDelete}>
            🗑 Eliminar
          </button>
          <button
            type="button"
            className={`${styles.actionButton} ${styles.primaryAction}`}
            onClick={() => {
              contextOpened({
                materiaId: currentTask.materiaId,
                tareaId: currentTask.id,
                titulo: currentTask.titulo,
              })
              taskSelected(null)
            }}
          >
            ▶ Iniciar Pomodoro
          </button>
        </footer>
      </div>
    </Modal>
  )
}