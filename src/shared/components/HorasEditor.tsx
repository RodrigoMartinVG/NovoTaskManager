import { useState } from 'react'
import type { MateriaSlot } from '../../domains/planner/types'
import { SlotGrid } from './SlotGrid'
import styles from './HorasEditor.module.css'

interface HorasEditorProps {
  horasMin: number
  horasMax: number
  slots: MateriaSlot[]
  onCancel: () => void
  onSave: (payload: { horasMin: number; horasMax: number; slots: MateriaSlot[] }) => void
}

export function HorasEditor({ horasMin, horasMax, slots, onCancel, onSave }: HorasEditorProps) {
  const [min, setMin] = useState(horasMin)
  const [max, setMax] = useState(horasMax)
  const [localSlots, setLocalSlots] = useState<MateriaSlot[]>(slots)
  const [error, setError] = useState<string | null>(null)

  function handleSave() {
    if (min > max) {
      setError('Las horas minimas no pueden superar las maximas.')
      return
    }
    setError(null)
    onSave({ horasMin: min, horasMax: max, slots: localSlots })
  }

  return (
    <section className={styles.editor}>
      <div className={styles.fields}>
        <label className={styles.field}>
          <span>Min/semana</span>
          <input
            type="number"
            min={0}
            max={80}
            value={min}
            onChange={(e) => setMin(Number(e.target.value || 0))}
          />
        </label>
        <label className={styles.field}>
          <span>Max/semana</span>
          <input
            type="number"
            min={0}
            max={80}
            value={max}
            onChange={(e) => setMax(Number(e.target.value || 0))}
          />
        </label>
      </div>

      <SlotGrid slots={localSlots} onChange={setLocalSlots} />

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.actions}>
        <button type="button" className={styles.secondary} onClick={onCancel}>
          Cancelar
        </button>
        <button type="button" className={styles.primary} onClick={handleSave}>
          Guardar
        </button>
      </div>
    </section>
  )
}
