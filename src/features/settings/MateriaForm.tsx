import { useMemo, useState } from 'react'
import { SlotGrid } from '../../shared/components/SlotGrid'
import type { Materia, MateriaSlot, Periodo } from '../../domains/planner/types'
import styles from './MateriaForm.module.css'

interface MateriaFormProps {
  initial?: Materia | undefined
  onCancel: () => void
  onSave: (materia: Materia) => void
}

export function MateriaForm({ initial, onCancel, onSave }: MateriaFormProps) {
  const currentYear = new Date().getFullYear()
  const yearOptions = useMemo(() => [currentYear - 1, currentYear, currentYear + 1], [currentYear])

  const [nombre, setNombre] = useState(initial?.nombre ?? '')
  const [codigo, setCodigo] = useState(initial?.codigo ?? '')
  const [color, setColor] = useState(initial?.color ?? '#4e47b8')
  const [anio, setAnio] = useState(initial?.anio ?? currentYear)
  const [periodo, setPeriodo] = useState<Periodo>(initial?.periodo ?? 'c1')
  const [horasMin, setHorasMin] = useState(initial?.horasMin ?? 0)
  const [horasMax, setHorasMax] = useState(initial?.horasMax ?? 0)
  const [slots, setSlots] = useState<MateriaSlot[]>(initial?.slots ?? [])
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (!nombre.trim() || !codigo.trim()) {
      setError('Nombre y codigo son obligatorios.')
      return
    }

    if (horasMin > horasMax) {
      setError('Las horas minimas no pueden superar a las maximas.')
      return
    }

    setError(null)
    onSave({
      id: initial?.id ?? `mat_${Date.now()}`,
      nombre: nombre.trim(),
      codigo: codigo.trim(),
      color,
      anio,
      periodo,
      horasMin,
      horasMax,
      slots,
      activo: initial?.activo ?? true,
    })
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.grid}>
        <label className={styles.field}>
          <span>Nombre *</span>
          <input value={nombre} onChange={(event) => setNombre(event.target.value)} />
        </label>
        <label className={styles.field}>
          <span>Codigo *</span>
          <input value={codigo} onChange={(event) => setCodigo(event.target.value)} />
        </label>
        <label className={styles.field}>
          <span>Color</span>
          <input type="color" value={color} onChange={(event) => setColor(event.target.value)} />
        </label>
        <label className={styles.field}>
          <span>Anio</span>
          <select value={anio} onChange={(event) => setAnio(Number(event.target.value))}>
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          <span>Periodo</span>
          <select value={periodo} onChange={(event) => setPeriodo(event.target.value as Periodo)}>
            <option value="c1">C1</option>
            <option value="c2">C2</option>
            <option value="anual">Anual</option>
          </select>
        </label>
        <label className={styles.field}>
          <span>Horas min/semana</span>
          <input
            type="number"
            min={0}
            max={40}
            value={horasMin}
            onChange={(event) => setHorasMin(Number(event.target.value || 0))}
          />
        </label>
        <label className={styles.field}>
          <span>Horas max/semana</span>
          <input
            type="number"
            min={0}
            max={40}
            value={horasMax}
            onChange={(event) => setHorasMax(Number(event.target.value || 0))}
          />
        </label>
      </div>

      <div className={styles.slotWrap}>
        <p className={styles.slotTitle}>Horarios</p>
        <SlotGrid slots={slots} onChange={setSlots} />
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.actions}>
        <button type="button" className={styles.cancelButton} onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className={styles.saveButton}>
          Guardar materia
        </button>
      </div>
    </form>
  )
}
