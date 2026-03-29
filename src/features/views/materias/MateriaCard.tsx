import { useMemo } from 'react'
import { usePomoStore } from '../../../store/usePomoStore'
import { useUIStore } from '../../../store/useUIStore'
import type { Materia, Sesion, Tarea } from '../../../domains/planner/types'
import { MateriaSessionList } from './MateriaSessionList'
import { MateriaTaskList } from './MateriaTaskList'
import styles from './MateriaCard.module.css'

interface MateriaCardProps {
  materia: Materia
  horasSemana: number
  sesiones: Sesion[]
  tareas: Tarea[]
  onUpdateSesion: (id: string, patch: Partial<Sesion>) => void
  onDeleteSesion: (id: string, title: string) => void
}

function periodLabel(periodo: Materia['periodo']): string {
  if (periodo === 'c1') return 'C1'
  if (periodo === 'c2') return 'C2'
  return 'Anual'
}

function progressColor(materia: Materia, horasSemana: number): string {
  if (materia.horasMin === 0 && materia.horasMax === 0) return 'var(--text3)'
  if (horasSemana < materia.horasMin) return 'var(--warning)'
  if (horasSemana > materia.horasMax) return 'var(--accent)'
  return 'var(--success)'
}

function progressPct(materia: Materia, horasSemana: number): number {
  const objective = Math.max(1, materia.horasMax || materia.horasMin || 1)
  return Math.min(100, Math.round((horasSemana / objective) * 100))
}

export function MateriaCard({
  materia,
  horasSemana,
  sesiones,
  tareas,
  onUpdateSesion,
  onDeleteSesion,
}: MateriaCardProps) {
  const contextOpened = usePomoStore((state) => state.contextOpened)
  const objetivoEditOpened = useUIStore((state) => state.objetivoEditOpened)
  const manualSessionOpened = useUIStore((state) => state.manualSessionOpened)

  const progress = useMemo(() => ({
    color: progressColor(materia, horasSemana),
    pct: progressPct(materia, horasSemana),
  }), [materia, horasSemana])

  const hasGoal = materia.horasMin !== 0 || materia.horasMax !== 0

  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <div className={styles.mainInfo}>
          <span className={styles.dot} style={{ backgroundColor: materia.color }} />
          <div>
            <h3 className={styles.title}>{materia.nombre}</h3>
            <p className={styles.code}>{`${materia.codigo} · ${periodLabel(materia.periodo)} ${materia.anio}`}</p>
          </div>
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.actionBtn}
            onClick={() => contextOpened({ materiaId: materia.id, tareaId: null, titulo: `Sesion · ${materia.nombre}` })}
          >
            ▶ Iniciar sesion
          </button>
          <button type="button" className={styles.actionBtn} onClick={() => objetivoEditOpened(materia.id)}>
            ✎ Objetivos
          </button>
          <button type="button" className={styles.actionBtn} onClick={() => manualSessionOpened(materia.id)}>
            ＋ Cargar sesion manual
          </button>
        </div>
      </header>

      {hasGoal && (
        <section className={styles.progressWrap}>
          <div className={styles.progressMeta}>
            <span>{`${horasSemana}h esta semana`}</span>
            <span>{`${materia.horasMin}h - ${materia.horasMax}h objetivo`}</span>
          </div>
          <div className={styles.progressBar}>
            <span style={{ width: `${progress.pct}%`, backgroundColor: progress.color }} />
          </div>
        </section>
      )}

      <div className={styles.columns}>
        <MateriaSessionList
          sesiones={sesiones}
          tareas={tareas}
          onUpdateSesion={onUpdateSesion}
          onDeleteSesion={onDeleteSesion}
        />
        <MateriaTaskList tareas={tareas} />
      </div>
    </article>
  )
}
