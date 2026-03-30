import { useMemo } from 'react'
import { usePlannerStore } from '../../store/usePlannerStore'
import { usePomoStore } from '../../store/usePomoStore'
import { useUIStore } from '../../store/useUIStore'
import { getDiaActual } from '../../domains/schedule/timezone'
import { DIAS } from '../../domains/schedule/franjas'
import type { Materia, Sesion } from '../../domains/planner/types'
import styles from './PomoFocusView.module.css'

/* ── Helpers ── */

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

function fmtSecs(s: number): string {
  const si = Math.floor(s)
  return `${pad2(Math.floor(si / 3600))}:${pad2(Math.floor((si % 3600) / 60))}:${pad2(si % 60)}`
}

function fmtMin(m: number): string {
  if (!m) return '0min'
  const h = Math.floor(m / 60)
  const mn = m % 60
  return h > 0 ? (mn > 0 ? `${h}h ${mn}min` : `${h}h`) : `${mn}min`
}

function getWeekStart(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return d
}

interface SlotObjetivo {
  simpleMin: number
  simpleMax: number
  pondMin: number
  pondMax: number
  totalSlots: number
  remainingSlots: number
  doneThisWeek: number
}

function calcSlotObjetivo(
  materiaId: string,
  materias: Materia[],
  sesiones: Sesion[],
): SlotObjetivo | null {
  const m = materias.find((x) => x.id === materiaId)
  if (!m) return null
  const slots = m.slots || []
  const totalSlots = slots.length
  if (!totalSlots) return null
  const minH = m.horasMin || 0
  const maxH = m.horasMax || 0
  if (!minH && !maxH) return null

  const simpleMin = Math.round((minH / totalSlots) * 60)
  const simpleMax = Math.round((maxH / totalSlots) * 60)

  const weekStart = getWeekStart()
  const doneThisWeek = sesiones
    .filter((s) => s.materiaId === m.id && new Date(s.inicio) >= weekStart)
    .reduce((a, s) => a + s.minutos, 0)
  const doneH = doneThisWeek / 60

  const dia = getDiaActual()
  const diaIds = DIAS as unknown as string[]
  const diaIdx = diaIds.indexOf(dia)
  const remainingSlots =
    slots.filter((s) => {
      const sd = diaIds.indexOf(s.dia)
      return sd >= diaIdx
    }).length || 1

  const pondMin = Math.max(0, Math.round(((minH - doneH) / remainingSlots) * 60))
  const pondMax = Math.max(0, Math.round(((maxH - doneH) / remainingSlots) * 60))

  return { simpleMin, simpleMax, pondMin, pondMax, totalSlots, remainingSlots, doneThisWeek }
}

/* ── Ruler sub-component ── */

function RulerRow({
  label,
  minVal,
  maxVal,
  currentMins,
  color,
  scale,
}: {
  label: string
  minVal: number
  maxVal: number
  currentMins: number
  color: string
  scale: number
}) {
  const LABEL_W = 72
  const minPct = Math.round((minVal / scale) * 100)
  const maxPct = maxVal > 0 ? Math.round((maxVal / scale) * 100) : 100
  const minMet = currentMins >= minVal

  return (
    <div className={styles.rulerRow}>
      <div className={styles.rulerLabel}>
        <span className={styles.rulerLabelText}>{label}</span>
      </div>
      <div className={styles.rulerLine} />

      {minVal > 0 ? (
        <div
          className={styles.rulerTick}
          style={{ left: `calc(${LABEL_W}px + ${minPct}% * (1 - ${LABEL_W}px / 100%))` }}
        >
          <div className={styles.rulerTickLine} style={{ background: color }} />
          <div className={styles.rulerTickLabel} style={{ color }}>
            {fmtMin(minVal)} mín
          </div>
        </div>
      ) : (
        <div className={styles.rulerMinMet}>✓ mín cumplido</div>
      )}

      {maxVal > 0 && (
        <div
          className={styles.rulerTick}
          style={{ left: `calc(${LABEL_W}px + ${maxPct}% * (1 - ${LABEL_W}px / 100%))` }}
        >
          <div className={styles.rulerTickLine} style={{ background: 'var(--text2)' }} />
          <div className={styles.rulerTickLabel} style={{ color: 'var(--text2)' }}>
            {fmtMin(maxVal)} máx
          </div>
        </div>
      )}

      {minMet && <span className={styles.rulerCheck}>✓</span>}
    </div>
  )
}

/* ── Main component ── */

export function PomoFocusView() {
  const session = usePomoStore((s) => s.session)
  const elapsedSeconds = usePomoStore((s) => s.elapsedSeconds)
  const isPaused = usePomoStore((s) => s.isPaused)
  const pauseSeconds = usePomoStore((s) => s.pauseSeconds)
  const pomoPaused = usePomoStore((s) => s.pomoPaused)
  const pomoResumed = usePomoStore((s) => s.pomoResumed)
  const pomoStopped = usePomoStore((s) => s.pomoStopped)
  const pomoCancelled = usePomoStore((s) => s.pomoCancelled)
  const focusModeToggled = usePomoStore((s) => s.focusModeToggled)

  const data = usePlannerStore((s) => s.data)
  const sesionAgregada = usePlannerStore((s) => s.sesionAgregada)
  const confirmOpened = useUIStore((s) => s.confirmOpened)

  const materia = useMemo(
    () => (session ? data.materias.find((m) => m.id === session.materiaId) ?? null : null),
    [data.materias, session],
  )

  const tarea = useMemo(
    () =>
      session?.tareaId ? data.tareas.find((t) => t.id === session.tareaId) ?? null : null,
    [data.tareas, session],
  )

  const slotObj = useMemo(
    () => (session ? calcSlotObjetivo(session.materiaId, data.materias, data.sesiones) : null),
    [session, data.materias, data.sesiones],
  )

  if (!session) return null

  function handlePauseResume() {
    if (isPaused) {
      pomoResumed()
    } else {
      pomoPaused()
    }
  }

  function handleStop() {
    const result = pomoStopped()
    if (result) {
      sesionAgregada(result)
    }
  }

  function handleCancel() {
    if (elapsedSeconds < 60) {
      pomoCancelled()
      return
    }
    confirmOpened({
      title: 'Cancelar sesión Pomodoro',
      description:
        'La sesión tiene más de un minuto. Si cancelás, no se guardará en el historial.',
      confirmLabel: 'Cancelar sesión',
      cancelLabel: 'Volver',
      tone: 'warn',
      onConfirm: () => pomoCancelled(),
    })
  }

  /* ── Objective bar calculations ── */
  const studyMins = elapsedSeconds / 60
  const scale = slotObj ? Math.max(slotObj.simpleMax, slotObj.pondMax || 0) * 1.2 || 1 : 1
  const pct = slotObj ? Math.min(100, Math.round((studyMins / scale) * 100)) : 0
  const exceeded = slotObj ? studyMins > slotObj.simpleMax : false
  const barColor = slotObj
    ? exceeded
      ? 'var(--accent)'
      : studyMins >= slotObj.simpleMin
        ? 'var(--ok-text)'
        : studyMins >= slotObj.pondMin
          ? 'var(--warn-text)'
          : 'var(--info-text)'
    : 'var(--info-text)'

  return (
    <div className={styles.overlay} role="dialog" aria-label="Sesión Pomodoro">
      <div className={styles.card}>
        {/* Status badge */}
        {isPaused ? (
          <div className={styles.badgePaused}>◎ EN PAUSA</div>
        ) : (
          <div className={styles.badgeActive}>
            <span className={styles.pulseDot} />
            EN SESIÓN
          </div>
        )}

        {/* Materia + tarea */}
        <div className={styles.materiaBlock}>
          <div className={styles.materiaName}>
            <div
              className={styles.materiaDot}
              style={{ backgroundColor: materia?.color ?? 'var(--accent)' }}
              aria-hidden="true"
            />
            <div className={styles.materiaLabel}>{materia?.nombre ?? ''}</div>
          </div>
          {tarea ? (
            <div className={styles.tareaLabel}>{tarea.titulo}</div>
          ) : (
            <div className={styles.noTarea}>Sin tarea específica</div>
          )}
        </div>

        {/* Main timer */}
        <div className={isPaused ? styles.timerPaused : styles.timer}>
          {fmtSecs(elapsedSeconds)}
        </div>

        {/* Pause timer */}
        {isPaused ? (
          <div className={styles.pauseBlock}>
            <div className={styles.pauseLabel}>TIEMPO DE PAUSA</div>
            <div className={styles.pauseTimer}>{fmtSecs(pauseSeconds)}</div>
          </div>
        ) : (
          <div className={styles.spacer} />
        )}

        {/* Slot objective bar */}
        {slotObj && (
          <div className={styles.objetivoSection}>
            {/* Weekly context */}
            <div className={styles.weekContext}>
              <span>Semana:</span>
              <span className={styles.weekBold}>
                {fmtMin(Math.round(slotObj.doneThisWeek))} cursados
              </span>
              <span className={styles.weekSep}>·</span>
              <span>
                objetivo {fmtMin(slotObj.simpleMin * slotObj.totalSlots)}–
                {fmtMin(slotObj.simpleMax * slotObj.totalSlots)}
              </span>
              <span className={styles.weekSep}>·</span>
              <span>
                {slotObj.totalSlots} slot{slotObj.totalSlots !== 1 ? 's' : ''}
              </span>
            </div>

            <div className={styles.rulerTitle}>
              <span>Objetivo del slot</span>
            </div>

            {/* Simple ruler */}
            <RulerRow
              label="Simple"
              minVal={slotObj.simpleMin}
              maxVal={slotObj.simpleMax}
              currentMins={studyMins}
              color="var(--info-text)"
              scale={scale}
            />

            {/* Progress bar */}
            <div
              className={styles.progressTrack}
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Avance de sesion"
            >
              <div
                className={styles.progressFill}
                style={{ width: `${pct}%`, background: barColor }}
              />
            </div>

            {/* Ponderado ruler */}
            {slotObj.pondMax === 0 ? (
              <div className={styles.pondMetRow}>
                <span className={styles.rulerLabelText}>Ponderado</span>
                <span style={{ fontSize: 10, color: 'var(--ok-text)', fontWeight: 600, marginLeft: 6 }}>
                  ✓ Ya cumpliste el máximo semanal
                </span>
              </div>
            ) : (
              <RulerRow
                label="Ponderado"
                minVal={slotObj.pondMin}
                maxVal={slotObj.pondMax}
                currentMins={studyMins}
                color="var(--warn-text)"
                scale={scale}
              />
            )}

            {exceeded && (
              <div className={styles.exceededNote}>
                ✓ Superaste el máximo — {fmtMin(Math.round(studyMins - slotObj.simpleMax))} extra
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className={styles.actions}>
          <button type="button" className={styles.pauseBtn} onClick={handlePauseResume}>
            {isPaused ? '▶ Retomar' : '⏸ Pausar'}
          </button>
          <button type="button" className={styles.stopBtn} onClick={handleStop}>
            ⏹ Terminar y guardar
          </button>
        </div>

        <button type="button" className={styles.cancelLink} onClick={handleCancel}>
          ✕ Cancelar sin guardar
        </button>

        <button type="button" className={styles.minimizeLink} onClick={focusModeToggled}>
          ▾ Minimizar a widget
        </button>
      </div>
    </div>
  )
}
