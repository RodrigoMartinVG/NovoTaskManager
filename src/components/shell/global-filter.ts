/* ═══ Oda v3.0 — Global Filter Chip + Dropdown ═══ */
import { SignalWatcher } from "@lit-labs/signals";
import { effect } from "@preact/signals-core";
import { LitElement, css, html, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import type { Periodo } from "../../state/types.js";
import {
  globalFilterAnio,
  globalFilterPeriodos,
  plannerData,
} from "../../state/store.js";

const PERIODO_LABEL: Record<Periodo, string> = {
  C1: "Cuatrimestre 1",
  C2: "Cuatrimestre 2",
  anual: "Anual",
};

const PERIODO_SHORT: Record<Periodo, string> = {
  C1: "C1",
  C2: "C2",
  anual: "Anual",
};

@customElement("global-filter")
export class GlobalFilter extends SignalWatcher(LitElement) {
  @state() private _open = false;
  @state() private _anio: number | null = null;
  @state() private _periodos: Periodo[] = [];
  @state() private _hasMeta = false;

  private _dispose?: () => void;

  override connectedCallback() {
    super.connectedCallback();
    this._dispose = effect(() => {
      this._anio = globalFilterAnio.value;
      this._periodos = globalFilterPeriodos.value;
      this._hasMeta = plannerData.value.materias.some((m) => m.anio != null || m.periodo != null);
      this.requestUpdate();
    });
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this._dispose?.();
  }

  static styles = css`
    :host {
      display: inline-flex;
      position: relative;
      z-index: 50;
    }

    /* ── Chip button ── */
    .chip {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      background: transparent;
      border: 1px solid var(--border);
      border-radius: 1rem;
      padding: 0.15rem 0.6rem;
      font: inherit;
      font-size: 0.675rem;
      color: var(--text3);
      cursor: pointer;
      transition: all 0.16s;
      white-space: nowrap;
      line-height: 1.3;
      letter-spacing: 0.01em;
    }
    .chip:hover {
      background: var(--bg2);
      border-color: var(--border2);
      color: var(--text2);
    }
    .chip.active {
      background: color-mix(in srgb, var(--accent) 8%, transparent);
      border-color: color-mix(in srgb, var(--accent) 50%, var(--border));
      color: var(--accent);
    }
    .chip-icon {
      font-size: 0.65rem;
    }

    /* ── Backdrop ── */
    .backdrop {
      position: fixed;
      inset: 0;
      z-index: 99;
    }

    /* ── Dropdown ── */
    .dropdown {
      position: absolute;
      top: calc(100% + 0.375rem);
      left: 0;
      z-index: 100;
      width: 16rem;
      background: var(--bg1);
      border: 1px solid var(--border);
      border-radius: 0.625rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, .2);
      padding: 0.5rem 0;
      max-height: 24rem;
      overflow-y: auto;
    }

    .section-title {
      font-size: 0.625rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text3);
      padding: 0.625rem 1rem 0.375rem;
    }

    .opt {
      display: flex;
      align-items: center;
      padding: 0.5rem 1rem;
      font-size: var(--text-sm, 0.8125rem);
      color: var(--text0);
      cursor: pointer;
      transition: background 0.12s;
    }
    .opt:hover {
      background: var(--bg2);
    }
    .opt[data-selected] {
      background: color-mix(in srgb, var(--accent) 8%, var(--bg1));
    }
    .opt-label {
      flex: 1;
    }
    .opt-check {
      color: var(--ok-text);
      font-size: 0.875rem;
      font-weight: 700;
      flex-shrink: 0;
    }

    .divider {
      height: 1px;
      background: var(--border);
      margin: 0.375rem 0;
    }

    .hint {
      font-size: var(--text-xs, 0.75rem);
      color: var(--text3);
      padding: 0.375rem 1rem 0.5rem;
      text-align: center;
      font-style: italic;
    }
  `;

  private get _anioOptions(): number[] {
    const anios = new Set<number>();
    for (const m of plannerData.value.materias) {
      if (m.anio != null) anios.add(m.anio);
    }
    return [...anios].sort((a, b) => a - b);
  }

  private get _hasFilter(): boolean {
    return this._anio !== null || this._periodos.length > 0;
  }

  private get _chipLabel(): string {
    const anio = this._anio;
    const periodos = this._periodos;
    if (anio === null && periodos.length === 0) return "Todos";
    const parts: string[] = [];
    if (anio !== null) parts.push(`${anio}°`);
    if (periodos.length > 0 && periodos.length < 3) parts.push(periodos.map((p) => PERIODO_SHORT[p]).join(", "));
    return parts.length > 0 ? parts.join(" · ") : "Todos";
  }

  private _selectAnio(val: number | null) {
    globalFilterAnio.value = val;
  }

  private _togglePeriodo(p: Periodo) {
    const current = globalFilterPeriodos.value;
    if (current.includes(p)) {
      globalFilterPeriodos.value = current.filter((x) => x !== p);
    } else {
      globalFilterPeriodos.value = [...current, p];
    }
  }

  render() {
    const anioOptions = this._anioOptions;
    const currentAnio = this._anio;
    const currentPeriodos = this._periodos;

    // Don't show chip if no materias have año/periodo set
    if (!this._hasMeta) return nothing;

    return html`
      <button class="chip ${this._hasFilter ? "active" : ""}"
        @click=${() => { this._open = !this._open; }}>
        <span class="chip-icon">📅</span>
        ${this._chipLabel}
      </button>

      ${this._open ? html`
        <div class="backdrop" @click=${() => { this._open = false; }}></div>
        <div class="dropdown">
          ${anioOptions.length > 0 ? html`
            <div class="section-title">Año</div>
            <div class="opt"
              ?data-selected=${currentAnio === null}
              @click=${() => this._selectAnio(null)}>
              <span class="opt-label">Todos</span>
              ${currentAnio === null ? html`<span class="opt-check">✓</span>` : nothing}
            </div>
            ${anioOptions.map((a) => html`
              <div class="opt"
                ?data-selected=${currentAnio === a}
                @click=${() => this._selectAnio(a)}>
                <span class="opt-label">${a}° año</span>
                ${currentAnio === a ? html`<span class="opt-check">✓</span>` : nothing}
              </div>
            `)}
            <div class="divider"></div>
          ` : nothing}

          <div class="section-title">Período</div>
          ${(["C1", "C2", "anual"] as Periodo[]).map((p) => html`
            <div class="opt"
              ?data-selected=${currentPeriodos.includes(p)}
              @click=${() => this._togglePeriodo(p)}>
              <span class="opt-label">${PERIODO_LABEL[p]}</span>
              ${currentPeriodos.includes(p) ? html`<span class="opt-check">✓</span>` : nothing}
            </div>
          `)}
          <div class="hint">Podés seleccionar varios períodos</div>
        </div>
      ` : nothing}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "global-filter": GlobalFilter;
  }
}
