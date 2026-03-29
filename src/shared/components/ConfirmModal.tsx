import { Modal } from './Modal'
import { useUIStore } from '../../store/useUIStore'
import styles from './ConfirmModal.module.css'

export function ConfirmModal() {
  const confirm = useUIStore((state) => state.confirm)
  const confirmClosed = useUIStore((state) => state.confirmClosed)

  if (!confirm) {
    return null
  }

  const currentConfirm = confirm

  function handleCancel() {
    currentConfirm.onCancel?.()
    confirmClosed()
  }

  function handleConfirm() {
    currentConfirm.onConfirm?.()
    confirmClosed()
  }

  const toneClassName =
    currentConfirm.tone === 'danger'
      ? styles.confirmDanger
      : currentConfirm.tone === 'warn'
        ? styles.confirmWarn
        : styles.confirmInfo

  return (
    <Modal title={currentConfirm.title} onClose={handleCancel} maxWidth={420}>
      <div className={styles.body}>
        <p className={styles.description}>{currentConfirm.description}</p>
        <div className={styles.actions}>
          <button type="button" className={styles.cancelButton} onClick={handleCancel}>
            {currentConfirm.cancelLabel}
          </button>
          <button type="button" className={`${styles.confirmButton} ${toneClassName}`} onClick={handleConfirm}>
            {currentConfirm.confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}