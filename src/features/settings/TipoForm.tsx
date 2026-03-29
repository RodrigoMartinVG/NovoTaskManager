import { useState } from 'react'
import type { TipoTarea } from '../../domains/planner/types'
import styles from './TipoForm.module.css'

interface TipoFormProps {
  initial?: TipoTarea | undefined
  onCancel: () => void
  onSave: (tipo: TipoTarea) => void
}

function toTipoId(label: string): string {
  return label
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
}

export function TipoForm({ initial, onCancel, onSave }: TipoFormProps) {
  const [icon, setIcon] = useState(initial?.icon ?? '📝')
  const [label, setLabel] = useState(initial?.label ?? '')
  const [bg, setBg] = useState(initial?.bg ?? '#eae8f6')
  const [accent, setAccent] = useState(initial?.accent ?? '#4e47b8')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (!label.trim()) {
      setError('El nombre del tipo es obligatorio.')
      return
    }

    if (!icon.trim()) {
      setError('El emoji es obligatorio.')
      return
    }

    const normalizedId = initial?.id ?? toTipoId(label)
    if (!normalizedId) {
      setError('No se pudo generar el id del tipo.')
      return
    }

    setError(null)
    onSave({
      id: normalizedId,
      label: label.trim(),
      icon: icon.trim().slice(0, 2),
      bg,
      accent,
    })
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.grid}>
        <label className={styles.field}>
          <span>Emoji</span>
          <input value={icon} onChange={(event) => setIcon(event.target.value)} maxLength={2} />
        </label>
        <label className={styles.field}>
          <span>Nombre *</span>
          <input value={label} onChange={(event) => setLabel(event.target.value)} />
        </label>
        <label className={styles.field}>
          <span>Color fondo</span>
          <input type="color" value={bg} onChange={(event) => setBg(event.target.value)} />
        </label>
        <label className={styles.field}>
          <span>Color acento</span>
          <input type="color" value={accent} onChange={(event) => setAccent(event.target.value)} />
        </label>
      </div>

      <div className={styles.preview}>
        <span className={styles.previewBadge} style={{ backgroundColor: bg, borderColor: accent, color: accent }}>
          {`${icon} ${label || 'Tipo'}`}
        </span>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.actions}>
        <button type="button" className={styles.cancelButton} onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className={styles.saveButton}>
          Guardar tipo
        </button>
      </div>
    </form>
  )
}
