import { useMemo, useRef } from 'react'
import type { ReactNode } from 'react'
import { useFocusTrap } from '../hooks/useFocusTrap'
import styles from './Modal.module.css'

type ModalProps = {
  title: string
  icon?: ReactNode
  onClose: () => void
  maxWidth?: number
  children: ReactNode
}

export function Modal({ title, icon, onClose, maxWidth = 420, children }: ModalProps) {
  const cardRef = useRef<HTMLDivElement | null>(null)
  useFocusTrap(cardRef)

  const sizeClassName = useMemo(() => {
    if (maxWidth >= 1040) return styles.cardXxl
    if (maxWidth >= 900) return styles.cardXl
    if (maxWidth >= 720) return styles.cardLg
    if (maxWidth >= 560) return styles.cardMd
    return styles.cardSm
  }, [maxWidth])

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
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          onClose()
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div ref={cardRef} className={`${styles.card} ${sizeClassName}`} onClick={handleCardClick} tabIndex={-1}>
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
