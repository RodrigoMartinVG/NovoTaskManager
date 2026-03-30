import { useMemo } from 'react'
import { usePlannerStore } from '../../store/usePlannerStore'
import { usePomoStore } from '../../store/usePomoStore'
import { useUIStore } from '../../store/useUIStore'
import styles from './PomoWidget.module.css'

function formatElapsed(seconds: number): string {
  const mm = Math.floor(seconds / 60)
  const ss = seconds % 60
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
}

export function PomoWidget() {
  const session = usePomoStore((state) => state.session)
  const elapsedSeconds = usePomoStore((state) => state.elapsedSeconds)
  const isPaused = usePomoStore((state) => state.isPaused)
  const pomoStopped = usePomoStore((state) => state.pomoStopped)
  const pomoCancelled = usePomoStore((state) => state.pomoCancelled)
  const pomoPaused = usePomoStore((state) => state.pomoPaused)
  const pomoResumed = usePomoStore((state) => state.pomoResumed)
  const focusModeToggled = usePomoStore((state) => state.focusModeToggled)

  const data = usePlannerStore((state) => state.data)
  const sesionAgregada = usePlannerStore((state) => state.sesionAgregada)
  const confirmOpened = useUIStore((state) => state.confirmOpened)

  const materia = useMemo(() => {
    if (!session) {
      return null
    }
    return data.materias.find((item) => item.id === session.materiaId) ?? null
  }, [data.materias, session])

  const tarea = useMemo(() => {
    if (!session || !session.tareaId) {
      return null
    }
    return data.tareas.find((item) => item.id === session.tareaId) ?? null
  }, [data.tareas, session])

  if (!session) {
    return null
  }

  function handleStop() {
    const result = pomoStopped()
    if (result) {
      sesionAgregada(result)
    }
  }

  function handleCancel() {
    if (elapsedSeconds < 60) {
      pomoCancelled()
      return
    }

    confirmOpened({
      title: 'Cancelar sesión Pomodoro',
      description: 'La sesión tiene más de un minuto. Si cancelás, no se guardará en el historial.',
      confirmLabel: 'Cancelar sesión',
      cancelLabel: 'Volver',
      tone: 'warn',
      onConfirm: () => {
        pomoCancelled()
      },
    })
  }

  return (
    <aside className={styles.widget} aria-live="polite">
      <header className={styles.header}>
        <div className={styles.subject}>
          <span className={styles.dot} style={{ backgroundColor: materia?.color ?? '#999999' }} aria-hidden="true" />
          <span>{materia?.nombre ?? 'Materia'}</span>
        </div>
      </header>

      {tarea && <p className={styles.taskLabel}>{tarea.titulo}</p>}
      <p className={styles.timer}>{formatElapsed(elapsedSeconds)}</p>

      <div className={styles.actions}>
        <button
          type="button"
          className={isPaused ? styles.stopBtn : styles.cancelBtn}
          onClick={() => (isPaused ? pomoResumed() : pomoPaused())}
          aria-label={isPaused ? 'Retomar sesion' : 'Pausar sesion'}
        >
          {isPaused ? '▶' : '⏸'}
        </button>
        <button type="button" className={styles.stopBtn} onClick={handleStop}>
          ⏹ Detener
        </button>
        <button type="button" className={styles.cancelBtn} onClick={handleCancel} aria-label="Cancelar sesion">
          ✕
        </button>
        <button type="button" className={styles.expandBtn} onClick={focusModeToggled} aria-label="Expandir a vista completa">
          ▴
        </button>
      </div>
    </aside>
  )
}
