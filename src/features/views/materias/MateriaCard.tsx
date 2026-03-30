import { useMemo, useState } from 'react'
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
  const [expanded, setExpanded] = useState(false)

  return (
    <article className={styles.card}>
      <button type="button" className={styles.summary} onClick={() => setExpanded((prev) => !prev)} aria-expanded={expanded}>
        <span className={styles.dot} style={{ backgroundColor: materia.color }} aria-hidden="true" />
        <div className={styles.summaryInfo}>
          <h3 className={styles.title}>{materia.nombre}</h3>
          <p className={styles.code}>{`${materia.codigo} · ${periodLabel(materia.periodo)} ${materia.anio}`}</p>
        </div>
        {hasGoal && (
          <div className={styles.progressCompact}>
            <span className={styles.progressLabel}>{`${horasSemana}h / ${materia.horasMax}h`}</span>
            <div className={styles.progressBar} role="progressbar" aria-valuenow={progress.pct} aria-valuemin={0} aria-valuemax={100}>
              <span style={{ width: `${progress.pct}%`, backgroundColor: progress.color }} />
            </div>
          </div>
        )}
        <span className={styles.chevron}>{expanded ? '▾' : '▸'}</span>
      </button>

      {expanded && (
        <>
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

          {hasGoal && (
            <section className={styles.progressWrap}>
              <div className={styles.progressMeta}>
                <span>{`${horasSemana}h esta semana`}</span>
                <span>{`${materia.horasMin}h - ${materia.horasMax}h objetivo`}</span>
              </div>
              <div className={styles.progressBar} role="progressbar" aria-valuenow={progress.pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progreso semanal">
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
        </>
      )}
    </article>
  )
}
