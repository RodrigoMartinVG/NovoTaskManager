import { SignalWatcher } from "@lit-labs/signals";
import { effect } from "@preact/signals-core";
/* ═══ Oda v3.0 — Pomodoro Mini Widget ═══ */
import { LitElement, css, html, nothing } from "lit";
import { customElement } from "lit/decorators.js";
import {
  fmtSecs,
  pomoActive,
  pomoPause,
  pomoPaused,
  pomoResume,
  pomoStudySecs,
  pomoToggleFocus,
} from "../../state/pomo.js";
import { pomoFocusMode } from "../../state/store.js";

@customElement("pomo-widget")
export class PomoWidget extends SignalWatcher(LitElement) {
  private _dispose?: () => void;

  connectedCallback() {
    super.connectedCallback();
    this._dispose = effect(() => {
      pomoActive.value;
      pomoFocusMode.value;
      pomoStudySecs.value;
      pomoPaused.value;
      this.requestUpdate();
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._dispose?.();
  }
  static styles = css`
    :host {
      display: block;
    }

    .pw {
      position: fixed;
      bottom: 1.25rem;
      right: 1.25rem;
      z-index: var(--z-toast, 600);
      background: var(--bg1);
      border: 1px solid var(--border2);
      border-radius: 0.75rem;
      padding: 0.625rem 0.875rem;
      box-shadow: 0 0.5rem 1.5rem rgba(0,0,0,.2);
      display: flex;
      align-items: center;
      gap: 0.625rem;
      min-width: 13rem;
      cursor: pointer;
      transition: all .16s;
    }
    .pw:hover {
      border-color: var(--accent);
      box-shadow: 0 0.5rem 2rem rgba(0,0,0,.3);
    }

    /* ── Pulse dot ── */
    .pw-dot {
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .pw-dot-active {
      background: var(--ok-text, #1a7a3a);
      animation: pwPulse 1.5s ease-in-out infinite;
    }
    .pw-dot-paused {
      background: var(--warn-text, #b88a00);
    }
    @keyframes pwPulse {
      0%, 100% { box-shadow: 0 0 0 0 var(--ok-text, #1a7a3a); }
      50% { box-shadow: 0 0 0 0.25rem transparent; }
    }

    /* ── Timer ── */
    .pw-timer {
      font-size: 1rem;
      font-weight: 700;
      color: var(--text0);
      font-variant-numeric: tabular-nums;
      letter-spacing: .02em;
      flex: 1;
    }
    .pw-timer-paused {
      color: var(--text3);
    }

    /* ── Buttons ── */
    .pw-actions {
      display: flex;
      gap: 0.25rem;
    }
    .pw-btn {
      background: var(--bg2);
      border: none;
      color: var(--text2);
      width: 1.75rem;
      height: 1.75rem;
      border-radius: 0.375rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      cursor: pointer;
      transition: all .12s;
    }
    .pw-btn:hover {
      background: var(--bg3);
      color: var(--text0);
    }
  `;

  render() {
    // Show widget only when pomo is active AND focus mode is off
    if (!pomoActive.value || pomoFocusMode.value) return nothing;

    const paused = pomoPaused.value;
    const time = fmtSecs(pomoStudySecs.value);

    return html`
      <div class="pw" @click=${pomoToggleFocus} title="Expandir sesión">
        <span class="pw-dot ${paused ? "pw-dot-paused" : "pw-dot-active"}"></span>
        <span class="pw-timer ${paused ? "pw-timer-paused" : ""}">${time}</span>
        <div class="pw-actions" @click=${(e: Event) => e.stopPropagation()}>
          <button
            class="pw-btn"
            @click=${paused ? pomoResume : pomoPause}
            title=${paused ? "Retomar" : "Pausar"}
            aria-label=${paused ? "Retomar sesión" : "Pausar sesión"}
          >
            ${paused ? "▶" : "⏸"}
          </button>
          <button
            class="pw-btn"
            @click=${pomoToggleFocus}
            title="Expandir"
            aria-label="Expandir sesión"
          >
            ↗
          </button>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pomo-widget": PomoWidget;
  }
}
