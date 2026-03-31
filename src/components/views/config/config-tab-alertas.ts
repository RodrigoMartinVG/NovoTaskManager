/* ═══ Oda v3.0 — Config Tab: Alertas ═══ */
import { SignalWatcher } from "@lit-labs/signals";
import { effect } from "@preact/signals-core";
import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import type { AlertConfig } from "../../../state/types.js";
import { alertConfig, DEFAULT_ALERTAS, setAlertConfig } from "../../../state/store.js";

interface ThresholdDef {
  key: keyof AlertConfig;
  label: string;
  emoji: string;
  desc: string;
  colorClass: string;
  group: "limite" | "inicio";
}

const THRESHOLDS: ThresholdDef[] = [
  { key: "rojo", label: "Rojo — Urgente", emoji: "🔴", desc: "Días restantes para fecha límite → alerta roja", colorClass: "th-red", group: "limite" },
  { key: "amarillo", label: "Amarillo — Próximo", emoji: "🟡", desc: "Días restantes para fecha límite → alerta amarilla", colorClass: "th-yellow", group: "limite" },
  { key: "verde", label: "Verde — Aviso temprano", emoji: "🟢", desc: "Días restantes para fecha límite → alerta verde", colorClass: "th-green", group: "limite" },
  { key: "inicio", label: "Inicio — Debería empezar", emoji: "🔔", desc: "Días restantes para fecha de inicio → alerta de inicio", colorClass: "th-start", group: "inicio" },
];

@customElement("config-tab-alertas")
export class ConfigTabAlertas extends SignalWatcher(LitElement) {
  @state() private _rojo = 2;
  @state() private _amarillo = 7;
  @state() private _verde = 14;
  @state() private _inicio = 2;

  private _dispose?: () => void;

  override connectedCallback() {
    super.connectedCallback();
    this._dispose = effect(() => {
      const cfg = alertConfig.value;
      this._rojo = cfg.rojo;
      this._amarillo = cfg.amarillo;
      this._verde = cfg.verde;
      this._inicio = cfg.inicio;
      this.requestUpdate();
    });
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this._dispose?.();
  }

  static styles = css`
    :host { display: block; }

    .intro {
      font-size: var(--text-sm);
      color: var(--text2);
      line-height: 1.65;
      margin-bottom: var(--space-5, 1.5rem);
    }

    /* ── Section ── */
    .section {
      margin-bottom: var(--space-5, 1.5rem);
    }
    .section-title {
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--text1);
      margin: 0 0 var(--space-2);
      display: flex;
      align-items: center;
      gap: 0.375rem;
    }
    .section-desc {
      font-size: var(--text-xs);
      color: var(--text3);
      margin-bottom: var(--space-3);
      line-height: 1.5;
    }

    /* ── Threshold rows ── */
    .th-grid {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .th-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.625rem 0.75rem;
      background: var(--bg1);
      border: 1px solid var(--border);
      border-radius: 0.5rem;
      transition: border-color 0.12s;
    }
    .th-row:hover {
      border-color: var(--border2);
    }
    .th-indicator {
      width: 0.625rem;
      height: 0.625rem;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .th-red .th-indicator { background: var(--err-text); }
    .th-yellow .th-indicator { background: var(--warn-text); }
    .th-green .th-indicator { background: var(--ok-text); }
    .th-start .th-indicator { background: var(--info-text, var(--accent)); }

    .th-info {
      flex: 1;
      min-width: 0;
    }
    .th-label {
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--text0);
    }
    .th-desc {
      font-size: var(--text-xs);
      color: var(--text3);
      margin-top: 0.125rem;
    }
    .th-input {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      flex-shrink: 0;
    }
    .th-input input {
      width: 3.5rem;
      background: var(--bg0);
      border: 1px solid var(--border);
      border-radius: 0.375rem;
      padding: 0.375rem 0.5rem;
      font: inherit;
      font-size: var(--text-sm);
      color: var(--text0);
      text-align: center;
    }
    .th-input input:focus {
      outline: none;
      border-color: var(--accent);
    }
    .th-unit {
      font-size: var(--text-xs);
      color: var(--text3);
    }

    /* ── Preview ── */
    .preview {
      margin-top: var(--space-4);
      padding: 0.875rem 1rem;
      background: var(--bg1);
      border: 1px solid var(--border);
      border-radius: 0.5rem;
    }
    .preview-title {
      font-size: var(--text-xs);
      font-weight: 600;
      color: var(--text2);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 0.75rem;
    }
    .timeline {
      display: flex;
      align-items: stretch;
      height: 2rem;
      border-radius: 0.375rem;
      overflow: hidden;
      font-size: 0.5625rem;
      font-weight: 600;
    }
    .tl-seg {
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--bg0);
      min-width: 2rem;
      white-space: nowrap;
      padding: 0 0.25rem;
    }
    .tl-red { background: var(--err-text); }
    .tl-yellow { background: var(--warn-text); }
    .tl-green { background: var(--ok-text); }
    .tl-rest { background: var(--bg3); color: var(--text3); flex: 1; }

    .timeline-labels {
      display: flex;
      margin-top: 0.25rem;
      font-size: 0.5625rem;
      color: var(--text3);
    }
    .tl-label {
      text-align: center;
      min-width: 2rem;
      padding: 0 0.25rem;
    }
    .tl-label-rest { flex: 1; text-align: center; }

    /* ── Actions ── */
    .actions {
      display: flex;
      gap: 0.5rem;
      margin-top: var(--space-4);
    }
    .btn-reset {
      background: transparent;
      border: 1px solid var(--border);
      color: var(--text2);
      padding: 0.375rem 0.75rem;
      border-radius: 0.375rem;
      font: inherit;
      font-size: var(--text-xs);
      cursor: pointer;
      transition: all 0.12s;
    }
    .btn-reset:hover {
      background: var(--bg2);
      color: var(--text0);
    }
  `;

  private _onFieldChange(key: keyof AlertConfig, val: string) {
    const num = Math.max(0, Math.round(Number(val) || 0));
    (this as Record<string, unknown>)[`_${key}`] = num;
    this._save();
  }

  private _save() {
    setAlertConfig({
      rojo: this._rojo,
      amarillo: this._amarillo,
      verde: this._verde,
      inicio: this._inicio,
    });
  }

  private _resetDefaults() {
    setAlertConfig({ ...DEFAULT_ALERTAS });
  }

  render() {
    const limiteThresholds = THRESHOLDS.filter((t) => t.group === "limite");
    const inicioThresholds = THRESHOLDS.filter((t) => t.group === "inicio");

    return html`
      <p class="intro">
        Configurá los umbrales que definen cuándo una tarea entra en zona de alerta.
        Solo las tareas marcadas como <strong>obligatorias</strong> participan del sistema de alertas.
      </p>

      <!-- Alertas de fecha límite -->
      <div class="section">
        <div class="section-title">📅 Alertas de fecha límite</div>
        <div class="section-desc">
          Para tareas no completadas que tienen fecha límite. Los días indican cuánto falta para el vencimiento.
        </div>
        <div class="th-grid">
          ${limiteThresholds.map((th) => this._renderRow(th))}
        </div>
      </div>

      <!-- Alertas de fecha de inicio -->
      <div class="section">
        <div class="section-title">🚀 Alertas de fecha de inicio</div>
        <div class="section-desc">
          Para tareas en estado <strong>pendiente</strong> que tienen fecha de inicio. Avisan cuando es momento de empezar.
        </div>
        <div class="th-grid">
          ${inicioThresholds.map((th) => this._renderRow(th))}
        </div>
      </div>

      <!-- Preview timeline -->
      ${this._renderPreview()}

      <div class="actions">
        <button class="btn-reset" @click=${this._resetDefaults}>Restaurar valores por defecto</button>
      </div>
    `;
  }

  private _renderRow(th: ThresholdDef) {
    const val = (this as Record<string, unknown>)[`_${th.key}`] as number;
    return html`
      <div class="th-row ${th.colorClass}">
        <div class="th-indicator"></div>
        <div class="th-info">
          <div class="th-label">${th.emoji} ${th.label}</div>
          <div class="th-desc">${th.desc}</div>
        </div>
        <div class="th-input">
          <input
            type="number"
            min="0"
            .value=${String(val)}
            @change=${(e: Event) => this._onFieldChange(th.key, (e.target as HTMLInputElement).value)}
          />
          <span class="th-unit">días</span>
        </div>
      </div>
    `;
  }

  private _renderPreview() {
    const total = Math.max(this._verde + 4, 20);
    const pctRojo = (this._rojo / total) * 100;
    const pctAmarillo = ((this._amarillo - this._rojo) / total) * 100;
    const pctVerde = ((this._verde - this._amarillo) / total) * 100;

    return html`
      <div class="preview">
        <div class="preview-title">Vista previa — línea de tiempo hasta fecha límite</div>
        <div class="timeline">
          <div class="tl-seg tl-red" style="width:${pctRojo}%">≤${this._rojo}d</div>
          <div class="tl-seg tl-yellow" style="width:${pctAmarillo}%">≤${this._amarillo}d</div>
          <div class="tl-seg tl-green" style="width:${pctVerde}%">≤${this._verde}d</div>
          <div class="tl-seg tl-rest">sin alerta</div>
        </div>
        <div class="timeline-labels">
          <div class="tl-label" style="width:${pctRojo}%">Urgente</div>
          <div class="tl-label" style="width:${pctAmarillo}%">Próximo</div>
          <div class="tl-label" style="width:${pctVerde}%">Aviso</div>
          <div class="tl-label-rest">Tranquilo</div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "config-tab-alertas": ConfigTabAlertas;
  }
}
