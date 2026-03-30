import { SignalWatcher } from "@lit-labs/signals";
/* ═══ Oda v3.0 — Pomodoro Focus View ═══ */
import { LitElement, css, html, nothing } from "lit";
import { customElement } from "lit/decorators.js";
import {
  fmtSecs,
  pomoActive,
  pomoCancel,
  pomoPause,
  pomoPauseSecs,
  pomoPaused,
  pomoResume,
  pomoStop,
  pomoStudySecs,
  pomoToggleFocus,
} from "../../state/pomo.js";
import { pomoFocusMode, pomoSession } from "../../state/store.js";
import { materias } from "../../state/store.js";

@customElement("pomo-focus-view")
export class PomoFocusView extends SignalWatcher(LitElement) {
  static styles = css`
    :host {
      display: block;
    }

    /* ── Overlay ── */
    .pf-overlay {
      position: fixed;
      inset: 0;
      z-index: var(--z-pomo-focus, 900);
      background: var(--overlay, rgba(0,0,0,.6));
      backdrop-filter: blur(6px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }

    /* ── Card ── */
    .pf-card {
      background: var(--bg1);
      border: 1px solid var(--border2);
      border-radius: 1rem;
      padding: 2.5rem 3.5rem;
      max-width: 35rem;
      width: 100%;
      text-align: center;
      box-shadow: 0 1.5rem 3.75rem rgba(0,0,0,.25);
    }

    /* ── Status badge ── */
    .pf-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.25rem 0.75rem;
      border-radius: 1rem;
      font-size: 0.6875rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .06em;
      margin-bottom: 1.25rem;
    }
    .pf-badge-active {
      background: var(--ok-bg, #e6f9ed);
      color: var(--ok-text, #1a7a3a);
    }
    .pf-badge-paused {
      background: var(--warn-bg, #fff8e6);
      color: var(--warn-text, #b88a00);
    }
    .pf-pulse-dot {
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 50%;
      background: currentColor;
      animation: pfPulse 1.5s ease-in-out infinite;
    }
    @keyframes pfPulse {
      0%, 100% { box-shadow: 0 0 0 0 currentColor; }
      50% { box-shadow: 0 0 0 0.375rem transparent; }
    }

    /* ── Materia + task ── */
    .pf-materia {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin-bottom: 0.375rem;
    }
    .pf-materia-dot {
      width: 0.75rem;
      height: 0.75rem;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .pf-materia-name {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text0);
    }
    .pf-task-name {
      font-size: var(--text-sm);
      color: var(--text2);
      margin-bottom: 1.5rem;
    }
    .pf-no-task {
      font-size: 0.75rem;
      color: var(--text3);
      margin-bottom: 1.5rem;
    }

    /* ── Timer ── */
    .pf-timer {
      font-size: 4rem;
      font-weight: 700;
      color: var(--text0);
      font-variant-numeric: tabular-nums;
      letter-spacing: .04em;
      line-height: 1;
      margin-bottom: 0.75rem;
    }
    .pf-timer-paused {
      color: var(--text3);
    }

    /* ── Pause timer ── */
    .pf-pause-section {
      height: 3.75rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.5rem;
    }
    .pf-pause-label {
      font-size: 0.6875rem;
      color: var(--text3);
      letter-spacing: .1em;
      text-transform: uppercase;
      margin-bottom: 0.25rem;
    }
    .pf-pause-timer {
      font-size: 1.625rem;
      font-weight: 600;
      color: var(--warn-text, #b88a00);
      font-variant-numeric: tabular-nums;
    }

    /* ── Actions ── */
    .pf-actions {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
    }
    .pf-btn {
      flex: 1;
      padding: 0.6875rem 1rem;
      border-radius: 0.5rem;
      font-family: inherit;
      font-size: var(--text-sm);
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all .16s;
    }
    .pf-btn-pause {
      background: var(--bg2);
      color: var(--text0);
    }
    .pf-btn-pause:hover { background: var(--bg3); }
    .pf-btn-stop {
      background: var(--ok-bg, #e6f9ed);
      color: var(--ok-text, #1a7a3a);
    }
    .pf-btn-stop:hover { filter: brightness(0.95); }

    /* ── Secondary actions ── */
    .pf-secondary {
      display: flex;
      justify-content: center;
      gap: 1.5rem;
    }
    .pf-link {
      background: transparent;
      border: none;
      color: var(--text3);
      font-family: inherit;
      font-size: 0.6875rem;
      cursor: pointer;
      padding: 0.25rem 0;
      transition: color .16s;
    }
    .pf-link:hover { color: var(--text1); }
    .pf-link-cancel:hover { color: var(--err-text, #d44); }

    /* ── Responsive ── */
    @media (max-width: 30em) {
      .pf-card { padding: 2rem 1.5rem; }
      .pf-timer { font-size: 3rem; }
    }
  `;

  private _getMateria() {
    const session = pomoSession.value;
    if (!session) return null;
    return materias.value.find((m) => m.id === session.materiaId) || null;
  }

  render() {
    if (!pomoActive.value || !pomoFocusMode.value) return nothing;

    const session = pomoSession.value!;
    const materia = this._getMateria();
    const paused = pomoPaused.value;
    const studyTime = fmtSecs(pomoStudySecs.value);
    const pauseTime = fmtSecs(pomoPauseSecs.value);

    return html`
      <div class="pf-overlay">
        <div class="pf-card">
          <!-- Status badge -->
          <div class="pf-badge ${paused ? "pf-badge-paused" : "pf-badge-active"}">
            ${paused ? html`◎ EN PAUSA` : html`<span class="pf-pulse-dot"></span> EN SESIÓN`}
          </div>

          <!-- Materia + task -->
          ${
            materia
              ? html`
            <div class="pf-materia">
              <span class="pf-materia-dot" style="background:${materia.color}"></span>
              <span class="pf-materia-name">${materia.nombre}</span>
            </div>
          `
              : nothing
          }

          ${
            session.tareaId
              ? html`<div class="pf-task-name">${session.titulo || "Tarea en curso"}</div>`
              : html`<div class="pf-no-task">${session.titulo || "Sin tarea específica"}</div>`
          }

          <!-- Timer -->
          <div class="pf-timer ${paused ? "pf-timer-paused" : ""}">${studyTime}</div>

          <!-- Pause section -->
          <div class="pf-pause-section">
            ${
              paused
                ? html`
              <div class="pf-pause-label">TIEMPO DE PAUSA</div>
              <div class="pf-pause-timer">${pauseTime}</div>
            `
                : nothing
            }
          </div>

          <!-- Action buttons -->
          <div class="pf-actions">
            <button class="pf-btn pf-btn-pause" @click=${paused ? pomoResume : pomoPause}>
              ${paused ? "▶ Retomar" : "⏸ Pausar"}
            </button>
            <button class="pf-btn pf-btn-stop" @click=${pomoStop}>
              ⏹ Terminar y guardar
            </button>
          </div>

          <!-- Secondary -->
          <div class="pf-secondary">
            <button class="pf-link" @click=${pomoToggleFocus}>
              ↙ Minimizar
            </button>
            <button class="pf-link pf-link-cancel" @click=${pomoCancel}>
              ✕ Cancelar sin guardar
            </button>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pomo-focus-view": PomoFocusView;
  }
}
