import { useEffect, useState } from 'react'
import { getPlannerNowParts, getMomentoActualEnFranjas } from '../../../domains/schedule/timezone'
import { PlannerService } from '../../../domains/planner/service'
import type { FranjaId } from '../../../domains/planner/types'
import styles from './HeroClock.module.css'

const DIAS_LABEL = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const MESES_LABEL = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

const DIA_INDEX: Record<string, number> = {
  dom: 0, lun: 1, mar: 2, mie: 3, jue: 4, vie: 5, sab: 6,
}

function franjaEmoji(id: FranjaId): string {
  if (id.startsWith('manana')) return '🌅'
  if (id.startsWith('tarde')) return '☀️'
  return '🌙'
}

export function HeroClock() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const msToNextMin = 60000 - (Date.now() % 60000) + 50
    const timeout = setTimeout(() => {
      setNow(new Date())
      const interval = setInterval(() => setNow(new Date()), 30000)
      return () => clearInterval(interval)
    }, msToNextMin)
    return () => clearTimeout(timeout)
  }, [])

  const parts = getPlannerNowParts(now)
  const franjasMap = PlannerService.getFranjas()
  const currentFranja = getMomentoActualEnFranjas(franjasMap, now)
  const timeStr = `${String(parts.hour).padStart(2, '0')}:${String(parts.minute).padStart(2, '0')}`
  const dayName = DIAS_LABEL[DIA_INDEX[parts.weekdayId] ?? now.getDay()]
  const dateStr = `${dayName}, ${parts.day} de ${MESES_LABEL[parts.month - 1]} ${parts.year}`

  return (
    <div className={styles.hero}>
      <p className={styles.time}>{timeStr}</p>
      <div className={styles.dateLine}>
        <span className={styles.dateText}>{dateStr}</span>
        <span className={styles.franjaTag} aria-label={`Franja: ${currentFranja}`}>{franjaEmoji(currentFranja)}</span>
      </div>
    </div>
  )
}
