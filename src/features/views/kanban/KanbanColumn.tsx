import type { ReactNode } from 'react'
import type { TareaEstado } from '../../../domains/planner/types'
import styles from './KanbanColumn.module.css'

interface KanbanColumnProps {
  estado: TareaEstado
  label: string
  count: number
  isOver: boolean
  onDragOver: (e: React.DragEvent, estado: TareaEstado) => void
  onDragLeave: () => void
  onDrop: (estado: TareaEstado) => void
  children: ReactNode
}

export function KanbanColumn({
  estado,
  label,
  count,
  isOver,
  onDragOver,
  onDragLeave,
  onDrop,
  children,
}: KanbanColumnProps) {
  return (
    <div
      className={`${styles.column} ${isOver ? styles.over : ''}`}
      onDragOver={(e) => onDragOver(e, estado)}
      onDragLeave={onDragLeave}
      onDrop={(e) => {
        e.preventDefault()
        onDrop(estado)
      }}
    >
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        <span className={styles.count}>{count}</span>
      </div>
      <div className={styles.cards}>{children}</div>
    </div>
  )
}
