import { useState } from 'react'
import type { AlertasConfig } from '../../domains/planner/types'
import styles from './AlertasEditor.module.css'

interface AlertasEditorProps {
  value: AlertasConfig
  onSave: (next: AlertasConfig) => void
}

export function AlertasEditor({ value, onSave }: AlertasEditorProps) {
  const [local, setLocal] = useState<AlertasConfig>(value)

  function update<K extends keyof AlertasConfig>(key: K, next: AlertasConfig[K]) {
    setLocal((current) => ({ ...current, [key]: next }))
  }

  return (
    <section className={styles.wrapper}>
      <label className={styles.toggleRow}>
        <input
          type="checkbox"
          checked={local.enabled}
          onChange={(event) => update('enabled', event.target.checked)}
        />
        <span>Activar alertas</span>
      </label>

      <label className={styles.field}>
        <span>Dias para alerta urgente (start_soon)</span>
        <input
          type="number"
          min={1}
          max={30}
          value={local.dueSoonDays}
          onChange={(event) => update('dueSoonDays', Number(event.target.value || 1))}
        />
      </label>

      <label className={styles.field}>
        <span>Minutos para por empezar</span>
        <input
          type="number"
          min={0}
          max={1440}
          value={local.startSoonMinutes}
          onChange={(event) => update('startSoonMinutes', Number(event.target.value || 0))}
        />
      </label>

      <label className={styles.field}>
        <span>Minutos para vencida</span>
        <input
          type="number"
          min={0}
          max={1440}
          value={local.overdueMinutes}
          onChange={(event) => update('overdueMinutes', Number(event.target.value || 0))}
        />
      </label>

      <label className={styles.toggleRow}>
        <input
          type="checkbox"
          checked={local.notifyOnToday}
          onChange={(event) => update('notifyOnToday', event.target.checked)}
        />
        <span>Notificar en tareas de hoy</span>
      </label>

      <div className={styles.preview}>
        <p>Preview:</p>
        <p>{`🔴 Urgente: <= ${local.dueSoonDays} dias`}</p>
        <p>{`🟡 Proxima: <= ${local.dueSoonDays + 2} dias`}</p>
        <p>{`🟢 En radar: > ${local.dueSoonDays + 2} dias`}</p>
      </div>

      <button type="button" className={styles.saveButton} onClick={() => onSave(local)}>
        Guardar alertas
      </button>
    </section>
  )
}
