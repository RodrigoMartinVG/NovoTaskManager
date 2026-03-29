import styles from './TimeInputField.module.css'

type TimeInputFieldProps = {
  value: string | null
  onChange: (value: string | null) => void
  id?: string
}

const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const minutes = ['00', '15', '30', '45']

export function TimeInputField({ value, onChange, id }: TimeInputFieldProps) {
  const [hh, mm] = value ? value.split(':') : ['', '']

  function handleHourChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const newHour = event.target.value
    if (!newHour) {
      onChange(null)
      return
    }
    const newMinute = mm || '00'
    onChange(`${newHour}:${newMinute}`)
  }

  function handleMinuteChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const newMinute = event.target.value
    if (!newMinute) {
      onChange(null)
      return
    }
    const newHour = hh || '00'
    onChange(`${newHour}:${newMinute}`)
  }

  return (
    <div className={styles.wrapper}>
      <select
        id={id}
        className={styles.select}
        value={hh ?? ''}
        onChange={handleHourChange}
        aria-label="Hora"
      >
        <option value="">--</option>
        {hours.map((h) => (
          <option key={h} value={h}>{h}</option>
        ))}
      </select>
      <span className={styles.separator}>:</span>
      <select
        className={styles.select}
        value={mm ?? ''}
        onChange={handleMinuteChange}
        aria-label="Minutos"
        disabled={!hh}
      >
        <option value="">--</option>
        {minutes.map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>
    </div>
  )
}
