import { Modal } from '../../shared/components/Modal'
import { useDriveStore } from '../../store/useDriveStore'
import { usePlannerStore } from '../../store/usePlannerStore'
import styles from './DriveConflictModal.module.css'

export function DriveConflictModal() {
  const conflict = useDriveStore((state) => state.conflict)
  const conflictResolved = useDriveStore((state) => state.conflictResolved)

  const dataLoaded = usePlannerStore((state) => state.dataLoaded)

  if (!conflict) {
    return null
  }

  return (
    <Modal title="Conflicto de datos con Drive" onClose={conflictResolved} maxWidth={640}>
      <div className={styles.wrapper}>
        <p className={styles.description}>
          Detectamos diferencias entre tus datos locales y los de Drive. Elegi cual version queres mantener como base activa.
        </p>

        <div className={styles.grid}>
          <article className={styles.card}>
            <h3>Version de Drive</h3>
            <p>{`${conflict.remote.materias.length} materias · ${conflict.remote.tareas.length} tareas · ${conflict.remote.sesiones.length} sesiones`}</p>
            <button
              type="button"
              className={styles.primary}
              onClick={() => {
                dataLoaded(conflict.remote)
                conflictResolved()
              }}
            >
              Usar version de Drive
            </button>
          </article>

          <article className={styles.card}>
            <h3>Version local</h3>
            <p>{`${conflict.local.materias.length} materias · ${conflict.local.tareas.length} tareas · ${conflict.local.sesiones.length} sesiones`}</p>
            <button type="button" className={styles.secondary} onClick={conflictResolved}>
              Mantener mis datos locales
            </button>
          </article>
        </div>
      </div>
    </Modal>
  )
}
