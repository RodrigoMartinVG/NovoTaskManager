import type { ReactNode } from 'react'
import styles from './Modal.module.css'

type ModalProps = {
  title: string
  icon?: ReactNode
  onClose: () => void
  maxWidth?: number
  children: ReactNode
}

export function Modal({ title, icon, onClose, maxWidth = 420, children }: ModalProps) {
  const handleOverlayClick = () => {
    onClose()
  }

  const handleCardClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation()
  }

  return (
    <div
      className={styles.overlay}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className={styles.card} style={{ maxWidth }} onClick={handleCardClick}>
        <div className={styles.header}>
          {icon && <div className={styles.icon}>{icon}</div>}
          <h2 id="modal-title" className={styles.title}>
            {title}
          </h2>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  )
}
