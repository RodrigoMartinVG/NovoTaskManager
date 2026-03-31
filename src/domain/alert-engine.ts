/* ═══ Oda v3.0 — Alert Engine ═══ */
import type { AlertConfig, Tarea } from "../state/types.js";

/**
 * Alert levels returned by the engine.
 *
 * Deadline alerts (task has fechaLimite, not completada):
 *   - "overdue" → deadline ya pasó
 *   - "red"     → dentro de umbral rojo
 *   - "yellow"  → dentro de umbral amarillo
 *   - "green"   → dentro de umbral verde
 *
 * Start alerts (task has fechaInicio, still "pendiente"):
 *   - "start_overdue" → fecha inicio ya pasó
 *   - "start_now"     → fecha inicio es hoy
 *   - "start_soon"    → dentro de umbral inicio
 */
export type AlertLevel =
  | "overdue"
  | "red"
  | "yellow"
  | "green"
  | "start_overdue"
  | "start_now"
  | "start_soon";

export interface AlertInfo {
  level: AlertLevel;
  label: string;
  emoji: string;
  cssClass: string;
}

const ALERT_INFO: Record<AlertLevel, AlertInfo> = {
  overdue:        { level: "overdue",        label: "Vencida",       emoji: "⛔", cssClass: "alert-overdue" },
  red:            { level: "red",            label: "Urgente",       emoji: "🔴", cssClass: "alert-red" },
  yellow:         { level: "yellow",         label: "Próximo",       emoji: "🟡", cssClass: "alert-yellow" },
  green:          { level: "green",          label: "Aviso",         emoji: "🟢", cssClass: "alert-green" },
  start_overdue:  { level: "start_overdue",  label: "Inicio pasado", emoji: "⚡", cssClass: "alert-start-overdue" },
  start_now:      { level: "start_now",      label: "Empieza hoy",   emoji: "⚡", cssClass: "alert-start-now" },
  start_soon:     { level: "start_soon",     label: "Inicio cerca",  emoji: "🔔", cssClass: "alert-start-soon" },
};

export function getAlertInfo(level: AlertLevel): AlertInfo {
  return ALERT_INFO[level];
}

/**
 * Compute the alert level for a single task.
 * Returns null if no alert applies.
 *
 * Rules (evaluated in priority order):
 * 1. Deadline vencido → overdue
 * 2. Inicio retrasado (pendiente) → start_overdue
 * 3. Inicio hoy (pendiente) → start_now
 * 4. Deadline ≤ rojo días → red
 * 5. Inicio ≤ inicio días (pendiente) → start_soon
 * 6. Deadline ≤ amarillo días → yellow
 * 7. Deadline ≤ verde días → green
 */
export function computeAlertLevel(
  tarea: Tarea,
  cfg: AlertConfig,
  today?: Date,
): AlertLevel | null {
  // Only non-completed, obligatory tasks participate
  if (tarea.estado === "completada" || !tarea.obligatorio) return null;

  const now = today ?? new Date();
  const todayMs = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const DAY = 86_400_000;

  // Deadline diff (null if no fechaLimite)
  const diffLimit = tarea.fechaLimite
    ? Math.ceil((new Date(tarea.fechaLimite + "T00:00:00").getTime() - todayMs) / DAY)
    : null;

  // Start diff (only for "pendiente" tasks with fechaInicio)
  const diffStart =
    tarea.estado === "pendiente" && tarea.fechaInicio
      ? Math.ceil((new Date(tarea.fechaInicio + "T00:00:00").getTime() - todayMs) / DAY)
      : null;

  // 1. Deadline vencido
  if (diffLimit !== null && diffLimit < 0) return "overdue";

  // 2-3. Inicio retrasado / hoy
  if (diffStart !== null) {
    if (diffStart < 0) return "start_overdue";
    if (diffStart === 0) return "start_now";
  }

  // 4. Deadline ≤ rojo
  if (diffLimit !== null && diffLimit <= cfg.rojo) return "red";

  // 5. Inicio próximo
  if (diffStart !== null && diffStart <= cfg.inicio) return "start_soon";

  // 6-7. Deadline amarillo / verde
  if (diffLimit !== null) {
    if (diffLimit <= cfg.amarillo) return "yellow";
    if (diffLimit <= cfg.verde) return "green";
  }

  return null;
}

/** CSS custom property definitions for alert colors (use with :host or .alert-* classes) */
export const ALERT_CSS = /* css */ `
  .alert-overdue { --alert-bg: var(--err-bg); --alert-text: var(--err-text); --alert-border: var(--err-border); }
  .alert-red { --alert-bg: var(--err-bg); --alert-text: var(--err-text); --alert-border: var(--err-border); }
  .alert-yellow { --alert-bg: var(--warn-bg); --alert-text: var(--warn-text); --alert-border: var(--warn-border); }
  .alert-green { --alert-bg: var(--ok-bg); --alert-text: var(--ok-text); --alert-border: var(--ok-border); }
  .alert-start-overdue { --alert-bg: var(--err-bg); --alert-text: var(--err-text); --alert-border: var(--err-border); }
  .alert-start-now { --alert-bg: var(--info-bg); --alert-text: var(--info-text); --alert-border: var(--accent); }
  .alert-start-soon { --alert-bg: var(--info-bg); --alert-text: var(--info-text); --alert-border: var(--accent); }
`;
