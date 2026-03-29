import { useMemo, useState } from 'react'
import { createEmptyPlannerData, isEmptyPlannerData, SAMPLE_DATA } from '../../domains/import-export/normalizer'
import type { PlannerData } from '../../domains/planner/types'
import { useDriveStore } from '../../store/useDriveStore'
import { usePlannerStore } from '../../store/usePlannerStore'
import { useUIStore } from '../../store/useUIStore'
import { Modal } from '../../shared/components/Modal'
import styles from './ResetModal.module.css'

type DataKind = 'empty' | 'demo' | 'real'
type ResetTarget = 'empty' | 'demo'

function isDemoData(data: PlannerData): boolean {
  if (isEmptyPlannerData(data)) {
    return false
  }

  const sampleMateriaIds = new Set(SAMPLE_DATA.materias.map((m) => m.id))
  const sampleTaskIds = new Set(SAMPLE_DATA.tareas.map((t) => t.id))

  return (
    data.materias.length === SAMPLE_DATA.materias.length &&
    data.tareas.length === SAMPLE_DATA.tareas.length &&
    data.materias.every((item) => sampleMateriaIds.has(item.id)) &&
    data.tareas.every((item) => sampleTaskIds.has(item.id))
  )
}

function getPlannerDataKind(data: PlannerData): DataKind {
  if (isEmptyPlannerData(data)) {
    return 'empty'
  }
  if (isDemoData(data)) {
    return 'demo'
  }
  return 'real'
}

function getResetCopy(kind: DataKind, target: ResetTarget, driveConnected: boolean): {
  title: string
  description: string
  tone: 'danger' | 'warn' | 'info'
  confirmLabel: string
} {
  const driveNote = driveConnected
    ? ' Tenes Drive conectado: este cambio impacta en los datos locales y puede sobrescribir el proximo sync.'
    : ''

  if (kind === 'empty' && target === 'empty') {
    return {
      title: 'Planner vacio',
      description: `Tu planner ya esta vacio.${driveNote}`,
      tone: 'info',
      confirmLabel: 'Entendido',
    }
  }

  if (kind === 'empty' && target === 'demo') {
    return {
      title: 'Cargar datos de ejemplo',
      description: `Se van a cargar materias, tareas y sesiones de demo.${driveNote}`,
      tone: 'info',
      confirmLabel: 'Cargar demo',
    }
  }

  if (kind === 'demo' && target === 'empty') {
    return {
      title: 'Borrar datos de ejemplo',
      description: `Se eliminaran los datos de demo y quedara un planner vacio.${driveNote}`,
      tone: 'warn',
      confirmLabel: 'Vaciar planner',
    }
  }

  if (kind === 'demo' && target === 'demo') {
    return {
      title: 'Recargar demo',
      description: `Se reemplazaran los datos de demo actuales por una copia nueva.${driveNote}`,
      tone: 'warn',
      confirmLabel: 'Recargar demo',
    }
  }

  if (kind === 'real' && target === 'empty') {
    return {
      title: 'Eliminar datos reales',
      description: `Vas a perder tus materias, tareas y sesiones actuales.${driveNote}`,
      tone: 'danger',
      confirmLabel: 'Eliminar todo',
    }
  }

  return {
    title: 'Reemplazar por demo',
    description: `Tus datos actuales se van a reemplazar por datos de ejemplo.${driveNote}`,
    tone: 'danger',
    confirmLabel: 'Reemplazar',
  }
}

export function ResetModal() {
  const data = usePlannerStore((state) => state.data)
  const dataLoaded = usePlannerStore((state) => state.dataLoaded)
  const connected = useDriveStore((state) => state.connected)

  const confirmOpened = useUIStore((state) => state.confirmOpened)
  const resetModalClosed = useUIStore((state) => state.resetModalClosed)

  const [target, setTarget] = useState<ResetTarget>('empty')

  const kind = useMemo(() => getPlannerDataKind(data), [data])
  const copy = useMemo(() => getResetCopy(kind, target, connected), [kind, target, connected])

  function handleApply() {
    confirmOpened({
      title: copy.title,
      description: copy.description,
      confirmLabel: copy.confirmLabel,
      cancelLabel: 'Cancelar',
      tone: copy.tone,
      onConfirm: () => {
        const next = target === 'empty' ? createEmptyPlannerData() : SAMPLE_DATA
        dataLoaded(next)
        resetModalClosed()
      },
    })
  }

  return (
    <Modal title="Reset de datos" onClose={resetModalClosed} maxWidth={620}>
      <div className={styles.wrapper}>
        <p className={styles.currentState}>{`Estado actual: ${kind === 'empty' ? 'vacio' : kind === 'demo' ? 'demo' : 'real'}`}</p>

        <div className={styles.options} role="radiogroup" aria-label="Destino del reset">
          <button
            type="button"
            className={`${styles.option} ${target === 'empty' ? styles.optionActive : ''}`}
            onClick={() => setTarget('empty')}
          >
            <strong>Limpiar planner</strong>
            <span>Empezar desde cero con planner vacio.</span>
          </button>
          <button
            type="button"
            className={`${styles.option} ${target === 'demo' ? styles.optionActive : ''}`}
            onClick={() => setTarget('demo')}
          >
            <strong>Cargar datos de ejemplo</strong>
            <span>Usar el dataset de demo para explorar la app.</span>
          </button>
        </div>

        <div className={styles.preview}>
          <p className={styles.previewTitle}>{copy.title}</p>
          <p className={styles.previewDescription}>{copy.description}</p>
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.cancel} onClick={resetModalClosed}>
            Cancelar
          </button>
          <button
            type="button"
            className={`${styles.confirm} ${copy.tone === 'danger' ? styles.confirmDanger : copy.tone === 'warn' ? styles.confirmWarn : styles.confirmInfo}`}
            onClick={handleApply}
          >
            {copy.confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}
