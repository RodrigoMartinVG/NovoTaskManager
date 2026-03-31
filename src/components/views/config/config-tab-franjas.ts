import { SignalWatcher } from "@lit-labs/signals";
import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { plannerData, setFranjas } from "../../../state/store.js";
import type { FranjaDef } from "../../../state/types.js";

// horaInicio/horaFin stored as minutes from midnight (e.g. 480 = 08:00, 750 = 12:30)
const DEFAULT_3: FranjaDef[] = [
  { id: "f-am", nombre: "Mañana", emoji: "☀️", horaInicio: 480, horaFin: 720 },
  { id: "f-pm", nombre: "Tarde", emoji: "🌤", horaInicio: 780, horaFin: 1080 },
  { id: "f-nt", nombre: "Noche", emoji: "🌙", horaInicio: 1140, horaFin: 1380 },
];

const DEFAULT_6: FranjaDef[] = [
  { id: "f-1", nombre: "Temprano", emoji: "🌅", horaInicio: 360, horaFin: 480 },
  { id: "f-2", nombre: "Mañana", emoji: "☀️", horaInicio: 480, horaFin: 660 },
  { id: "f-3", nombre: "Mediodía", emoji: "🌤", horaInicio: 660, horaFin: 840 },
  { id: "f-4", nombre: "Tarde", emoji: "🌇", horaInicio: 840, horaFin: 1080 },
  { id: "f-5", nombre: "Noche", emoji: "🌙", horaInicio: 1080, horaFin: 1260 },
  { id: "f-6", nombre: "Trasnochar", emoji: "🦉", horaInicio: 1260, horaFin: 1440 },
];

function timeLabel(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function buildTimeOptions(): number[] {
  const opts: number[] = [];
  for (let m = 0; m <= 24 * 60; m += 5) opts.push(m);
  return opts;
}

@customElement("config-tab-franjas")
export class ConfigTabFranjas extends SignalWatcher(LitElement) {
  @state() private localFranjas: FranjaDef[] = [];
  @state() private dirty = false;

  static styles = css`
    :host { display: block; }

    .mode-toggle {
      display: flex;
      gap: 0.5rem;
      margin-bottom: var(--space-5, 1.5rem);
    }

    .mode-btn {
      background: var(--bg2);
      border: 1px solid var(--border);
      color: var(--text1);
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      font-family: inherit;
      font-size: var(--text-sm, 0.8125rem);
      font-weight: 500;
      cursor: pointer;
      transition: all 0.14s;
      flex: 1;
      text-align: center;
    }
    .mode-btn:hover {
      background: var(--bg3);
      color: var(--text0);
    }
    .mode-btn[data-active] {
      background: var(--accent);
      color: #fff;
      border-color: var(--accent);
      font-weight: 600;
    }

    .list {
      display: flex;
      flex-direction: column;
      gap: var(--space-2, 0.5rem);
      margin-bottom: var(--space-5, 1.5rem);
    }

    .row {
      display: flex;
      align-items: center;
      gap: var(--space-3, 0.75rem);
      padding: var(--space-2, 0.5rem) var(--space-3, 0.75rem);
      border-radius: 0.5rem;
      background: var(--bg2);
    }

    .row-emoji {
      font-size: 1.125rem;
      flex-shrink: 0;
    }

    .row-name {
      flex: 1;
      min-width: 0;
      margin-right: var(--space-3, 0.75rem);
    }

    input[type="text"] {
      background: var(--bg1);
      border: 1px solid var(--border);
      border-radius: 0.375rem;
      color: var(--text0);
      font-family: inherit;
      font-size: var(--text-sm, 0.8125rem);
      padding: 0.375rem 0.5rem;
      outline: none;
      width: 100%;
      transition: border-color 0.12s;
    }
    input[type="text"]:focus { border-color: var(--accent); }

    .hora-group {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: var(--text-xs, 0.75rem);
      color: var(--text2);
      white-space: nowrap;
    }

    select {
      background: var(--bg1);
      border: 1px solid var(--border);
      border-radius: 0.375rem;
      color: var(--text0);
      font-family: inherit;
      font-size: var(--text-sm, 0.8125rem);
      padding: 0.25rem 0.375rem;
      outline: none;
      cursor: pointer;
    }
    select:focus { border-color: var(--accent); }

    .actions {
      display: flex;
      gap: var(--space-2, 0.5rem);
      align-items: center;
    }

    .btn-primary {
      background: var(--accent);
      color: #fff;
      border: none;
      border-radius: 0.375rem;
      padding: 0.5rem 1rem;
      font-family: inherit;
      font-size: var(--text-sm, 0.8125rem);
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.12s;
    }
    .btn-primary:hover { opacity: 0.85; }
    .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }

    .saved-msg {
      font-size: var(--text-xs, 0.75rem);
      color: var(--ok-text, #10b981);
      font-weight: 500;
    }

    .hint {
      font-size: var(--text-xs, 0.75rem);
      color: var(--text3);
      margin-top: var(--space-2, 0.5rem);
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this._syncFromStore();
  }

  private _syncFromStore() {
    const stored = plannerData.value.franjas;
    this.localFranjas =
      stored && stored.length > 0
        ? stored.map((f) => ({ ...f }))
        : DEFAULT_3.map((f) => ({ ...f }));
    this.dirty = false;
  }

  private _setMode(n: 3 | 6) {
    const cur = this.localFranjas;

    if (n === 6 && cur.length > 0 && cur.length <= 3) {
      // Split each current franja at its midpoint → 2× franjas
      const result: FranjaDef[] = [];
      for (let i = 0; i < cur.length; i++) {
        const f = cur[i];
        const mid = Math.round((f.horaInicio + f.horaFin) / 2 / 5) * 5; // snap to 5-min grid
        const ref1 = DEFAULT_6[i * 2];
        const ref2 = DEFAULT_6[i * 2 + 1];
        result.push({
          id: ref1?.id ?? `f-${i * 2 + 1}`,
          nombre: `${f.nombre} 1`,
          emoji: ref1?.emoji ?? f.emoji,
          horaInicio: f.horaInicio,
          horaFin: mid,
        });
        result.push({
          id: ref2?.id ?? `f-${i * 2 + 2}`,
          nombre: `${f.nombre} 2`,
          emoji: ref2?.emoji ?? f.emoji,
          horaInicio: mid,
          horaFin: f.horaFin,
        });
      }
      this.localFranjas = result;
    } else if (n === 3 && cur.length >= 6) {
      // Merge consecutive pairs → 3 franjas
      const result: FranjaDef[] = [];
      for (let i = 0; i < 3; i++) {
        const a = cur[i * 2];
        const b = cur[i * 2 + 1];
        const ref = DEFAULT_3[i];
        result.push({
          id: ref?.id ?? `f-${["am", "pm", "nt"][i]}`,
          nombre: ref?.nombre ?? a.nombre,
          emoji: ref?.emoji ?? a.emoji,
          horaInicio: a.horaInicio,
          horaFin: b ? b.horaFin : a.horaFin,
        });
      }
      this.localFranjas = result;
    } else {
      this.localFranjas = (n === 3 ? DEFAULT_3 : DEFAULT_6).map((f) => ({ ...f }));
    }

    this.dirty = true;
  }

  private _updateFranja(index: number, patch: Partial<FranjaDef>) {
    this.localFranjas = this.localFranjas.map((f, i) => (i === index ? { ...f, ...patch } : f));
    this.dirty = true;
  }

  private _save() {
    setFranjas(this.localFranjas);
    this.dirty = false;
  }

  render() {
    const count = this.localFranjas.length;
    const is3 = count <= 3;
    const is6 = count > 3;
    const timeOpts = buildTimeOptions();

    return html`
      <div class="mode-toggle">
        <button class="mode-btn" ?data-active=${is3} @click=${() => this._setMode(3)}>
          3 franjas (Mañana/Tarde/Noche)
        </button>
        <button class="mode-btn" ?data-active=${is6} @click=${() => this._setMode(6)}>
          6 franjas (personalizado)
        </button>
      </div>

      <div class="list">
        ${this.localFranjas.map(
          (f, i) => html`
          <div class="row">
            <span class="row-emoji">${f.emoji}</span>
            <div class="row-name">
              <input
                type="text"
                .value=${f.nombre}
                @input=${(e: Event) => this._updateFranja(i, { nombre: (e.target as HTMLInputElement).value })}
                aria-label="Nombre franja ${i + 1}"
              />
            </div>
            <div class="hora-group">
              <select
                .value=${String(f.horaInicio)}
                @change=${(e: Event) => this._updateFranja(i, { horaInicio: Number((e.target as HTMLSelectElement).value) })}
                aria-label="Hora inicio franja ${i + 1}"
              >
                ${timeOpts.map((m) => html`<option value=${m} ?selected=${m === f.horaInicio}>${timeLabel(m)}</option>`)}
              </select>
              <span>—</span>
              <select
                .value=${String(f.horaFin)}
                @change=${(e: Event) => this._updateFranja(i, { horaFin: Number((e.target as HTMLSelectElement).value) })}
                aria-label="Hora fin franja ${i + 1}"
              >
                ${timeOpts.map((m) => html`<option value=${m} ?selected=${m === f.horaFin}>${timeLabel(m)}</option>`)}
              </select>
            </div>
          </div>
        `,
        )}
      </div>

      <div class="actions">
        <button class="btn-primary" @click=${this._save} ?disabled=${!this.dirty}>
          Guardar franjas
        </button>
        ${!this.dirty ? html`<span class="saved-msg">✓ Guardado</span>` : null}
      </div>

      <p class="hint">Las franjas definen los bloques horarios de tu grilla semanal.</p>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "config-tab-franjas": ConfigTabFranjas;
  }
}
