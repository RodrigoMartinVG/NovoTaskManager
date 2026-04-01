import { LitElement, css, html, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import type { Sesion } from "../../state/types.js";
import {
  filteredMaterias as materias,
  plannerData,
  filteredSesiones as sesiones,
} from "../../state/store.js";
import { editingSesionId, sesionReturnView } from "../../state/navigation.js";
import { pomoActive, pomoStart } from "../../state/pomo.js";
import type { ViewId } from "../shell/nav-bar.js";
import { PreactSignalWatcher } from "../shared/preact-signal-watcher.js";
import { fmtDur, fmtTimeIso } from "../../utils/time-fmt.js";

const DIA_NOMBRES = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];

function fmtDate(iso: string): string {
  const d = new Date(iso);
  const dia = DIA_NOMBRES[d.getDay()];
  return `${dia} ${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}`;
}

/** Get ISO week start (Monday) for a date */
function weekStart(d: Date): string {
  const dt = new Date(d);
  const day = dt.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  dt.setDate(dt.getDate() + diff);
  return dt.toISOString().slice(0, 10);
}

type FilterOrigen = "" | "timer" | "manual";
type FilterPeriod = "semana" | "mes" | "todo";

@customElement("sesiones-view")
export class SesionesView extends PreactSignalWatcher(LitElement) {
  @state() private filterMateria = "";
  @state() private filterOrigen: FilterOrigen = "";
  @state() private filterPeriod: FilterPeriod = "todo";
  @state() private showPomoPopup = false;
  @state() private pomoMateriaId = "";
  @state() private pomoTareaId = "";
  @state() private pomoTitulo = "";

  static styles = css`
    :host {
      display: block;
      max-width: var(--content-max-width, 75rem);
      margin: 0 auto;
      padding: var(--space-5, 1.5rem) var(--space-4, 1rem);
    }

    /* ── Header ── */
    .hdr {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-3, 0.75rem);
      margin-bottom: var(--space-4, 1rem);
      flex-wrap: wrap;
    }
    .hdr-left {
      display: flex;
      align-items: center;
      gap: var(--space-3, 0.75rem);
    }
    .hdr-actions {
      display: flex;
      align-items: center;
      gap: var(--space-2, 0.5rem);
    }
    .hdr-title {
      font-size: var(--text-xl);
      font-weight: 700;
      color: var(--text0);
      margin: 0;
    }
    .count {
      font-size: var(--text-xs);
      color: var(--text3);
      background: var(--bg2);
      padding: 0.125rem 0.5rem;
      border-radius: 0.75rem;
    }
    .btn-new {
      background: var(--accent);
      color: #fff;
      border: none;
      padding: 0.4375rem 1rem;
      border-radius: 0.375rem;
      font: inherit;
      font-size: var(--text-sm);
      cursor: pointer;
      transition: opacity 0.16s;
    }
    .btn-new:hover { opacity: 0.85; }

    /* ── Stats bar ── */
    .stats {
      display: flex;
      gap: var(--space-4, 1rem);
      margin-bottom: var(--space-4, 1rem);
      flex-wrap: wrap;
    }
    .stat-card {
      background: var(--bg1);
      border: 1px solid var(--border);
      border-radius: 0.5rem;
      padding: 0.75rem 1rem;
      min-width: 8rem;
      flex: 1;
    }
    .stat-label {
      font-size: var(--text-xs);
      color: var(--text3);
      margin-bottom: 0.25rem;
    }
    .stat-value {
      font-size: var(--text-lg);
      font-weight: 700;
      color: var(--text0);
    }

    /* ── Filters ── */
    .filters {
      display: flex;
      gap: var(--space-3, 0.75rem);
      margin-bottom: var(--space-4, 1rem);
      flex-wrap: wrap;
    }
    .filter-sel {
      background: var(--bg1);
      color: var(--text1);
      border: 1px solid var(--border);
      border-radius: 0.375rem;
      padding: 0.375rem 0.625rem;
      font: inherit;
      font-size: var(--text-sm);
      cursor: pointer;
    }
    .filter-sel:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 1px;
    }

    /* ── Table ── */
    .tbl {
      width: 100%;
      border-collapse: collapse;
      font-size: var(--text-sm);
    }
    .tbl th {
      text-align: left;
      font-weight: 600;
      color: var(--text3);
      font-size: var(--text-xs);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      padding: 0.5rem 0.75rem;
      border-bottom: 2px solid var(--border);
      white-space: nowrap;
    }
    .tbl td {
      padding: 0.625rem 0.75rem;
      color: var(--text1);
      border-bottom: 1px solid var(--border);
      vertical-align: middle;
    }
    .tbl tr:hover td {
      background: var(--bg2);
    }
    .tbl tr { cursor: pointer; }

    /* ── Row cells ── */
    .mat-dot {
      display: inline-block;
      width: 0.625rem;
      height: 0.625rem;
      border-radius: 50%;
      margin-right: 0.375rem;
      vertical-align: middle;
    }
    .origen-badge {
      display: inline-block;
      font-size: var(--text-xs);
      padding: 0.0625rem 0.375rem;
      border-radius: 0.25rem;
      background: var(--bg2);
      color: var(--text3);
    }
    .origen-badge.timer { background: var(--info-bg, #e8e7f8); color: var(--info-text, #3930a0); }
    .origen-badge.manual { background: var(--ok-bg, #e5fbe9); color: var(--ok-text, #146035); }

    .titulo-cell {
      font-weight: 500;
      color: var(--text0);
    }

    .col-hide-narrow {
      /* hide on narrow screens */
    }
    @media (max-width: 40em) {
      .col-hide-narrow { display: none; }
    }

    /* ── Empty state ── */
    .empty {
      text-align: center;
      padding: var(--space-8, 3rem) var(--space-4, 1rem);
      color: var(--text3);
    }
    .empty-icon {
      font-size: 2.5rem;
      margin-bottom: var(--space-3, 0.75rem);
    }
    .empty-msg {
      font-size: var(--text-base);
      margin-bottom: var(--space-4, 1rem);
    }
    .empty-cta {
      background: var(--accent);
      color: #fff;
      border: none;
      padding: 0.5rem 1.25rem;
      border-radius: 0.375rem;
      font: inherit;
      font-size: var(--text-sm);
      cursor: pointer;
    }
    .empty-cta:hover { opacity: 0.85; }

    /* ── Pomo button ── */
    .btn-pomo {
      background: var(--info-bg, #e8e7f8);
      color: var(--info-text, #3930a0);
      border: 1px solid color-mix(in srgb, var(--info-text, #3930a0) 25%, transparent);
      padding: 0.4375rem 1rem;
      border-radius: 0.375rem;
      font: inherit;
      font-size: var(--text-sm);
      cursor: pointer;
      transition: all 0.16s;
    }
    .btn-pomo:hover { opacity: 0.85; }
    .btn-pomo:disabled { opacity: 0.5; cursor: not-allowed; }

    /* ── Pomo popup ── */
    .pomo-popup-wrap {
      position: relative;
      display: inline-block;
    }
    .pomo-popup {
      position: absolute;
      top: calc(100% + 0.5rem);
      right: 0;
      z-index: 50;
      background: var(--bg1);
      border: 1px solid var(--border);
      border-radius: 0.5rem;
      box-shadow: 0 4px 16px rgba(0,0,0,0.12);
      padding: var(--space-4, 1rem);
      min-width: 18rem;
      display: flex;
      flex-direction: column;
      gap: var(--space-3, 0.75rem);
    }
    .pomo-popup-title {
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--text0);
    }
    .pomo-popup .field-label {
      font-size: var(--text-xs);
      font-weight: 600;
      color: var(--text3);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-bottom: 0.125rem;
    }
    .pomo-popup select {
      width: 100%;
      background: var(--bg0, var(--bg));
      color: var(--text1);
      border: 1px solid var(--border);
      border-radius: 0.375rem;
      padding: 0.375rem 0.5rem;
      font: inherit;
      font-size: var(--text-sm);
    }
    .pomo-popup-actions {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
    }
    .pomo-popup .btn-start {
      background: var(--accent);
      color: #fff;
      border: none;
      padding: 0.375rem 1rem;
      border-radius: 0.375rem;
      font: inherit;
      font-size: var(--text-sm);
      cursor: pointer;
    }
    .pomo-popup .btn-start:disabled { opacity: 0.5; cursor: not-allowed; }
    .pomo-popup .btn-cancel {
      background: var(--bg2);
      color: var(--text2);
      border: none;
      padding: 0.375rem 0.75rem;
      border-radius: 0.375rem;
      font: inherit;
      font-size: var(--text-sm);
      cursor: pointer;
    }
    .pomo-titulo-input {
      width: 100%;
      background: var(--bg0, var(--bg));
      color: var(--text1);
      border: 1px solid var(--border);
      border-radius: 0.375rem;
      padding: 0.375rem 0.5rem;
      font: inherit;
      font-size: var(--text-sm);
      box-sizing: border-box;
    }
    .pomo-titulo-input:focus {
      outline: none;
      border-color: var(--accent);
    }
  `;

  /* ── Helpers ── */

  private _matName(id: string): string {
    const m = materias.value.find((m) => m.id === id);
    return m?.nombre ?? "—";
  }

  private _matColor(id: string): string {
    const m = materias.value.find((m) => m.id === id);
    return m?.color ?? "var(--text3)";
  }

  private _tareaTitle(tareaId: string | null): string {
    if (!tareaId) return "";
    const t = plannerData.value.tareas.find((t) => t.id === tareaId);
    return t?.titulo ?? "";
  }

  private _filtered(): Sesion[] {
    let list = [...sesiones.value];

    // Filter by materia
    if (this.filterMateria) {
      list = list.filter((s) => s.materiaId === this.filterMateria);
    }

    // Filter by origen
    if (this.filterOrigen) {
      list = list.filter((s) => s.origen === this.filterOrigen);
    }

    // Filter by period
    const now = new Date();
    if (this.filterPeriod === "semana") {
      const ws = weekStart(now);
      list = list.filter((s) => s.inicio.slice(0, 10) >= ws);
    } else if (this.filterPeriod === "mes") {
      const ms = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}-01`;
      list = list.filter((s) => s.inicio.slice(0, 10) >= ms);
    }

    // Sort by inicio descending (most recent first)
    list.sort((a, b) => b.inicio.localeCompare(a.inicio));
    return list;
  }

  private _stats(filtered: Sesion[]) {
    const totalMin = filtered.reduce((acc, s) => acc + s.minutos, 0);
    const count = filtered.length;
    const timerCount = filtered.filter((s) => s.origen === "timer").length;

    // Unique days
    const days = new Set(filtered.map((s) => s.inicio.slice(0, 10)));
    const avgMin = days.size > 0 ? Math.round(totalMin / days.size) : 0;

    return { totalMin, count, timerCount, avgMin, days: days.size };
  }

  /* ── Events ── */

  private _openNew() {
    editingSesionId.value = "new";
    sesionReturnView.value = "sesiones";
    this.dispatchEvent(new CustomEvent<ViewId>("view-change", { detail: "sesion-edit", bubbles: true, composed: true }));
  }

  private _openEdit(id: string) {
    editingSesionId.value = id;
    sesionReturnView.value = "sesiones";
    this.dispatchEvent(new CustomEvent<ViewId>("view-change", { detail: "sesion-edit", bubbles: true, composed: true }));
  }

  /* ── Pomodoro launcher ── */

  private _togglePomoPopup() {
    this.showPomoPopup = !this.showPomoPopup;
    if (this.showPomoPopup) {
      this.pomoMateriaId = "";
      this.pomoTareaId = "";
      this.pomoTitulo = "";
    }
  }

  private _startPomo() {
    if (!this.pomoMateriaId) return;
    const tarea = this.pomoTareaId
      ? plannerData.value.tareas.find((t) => t.id === this.pomoTareaId)
      : null;

    pomoStart({
      materiaId: this.pomoMateriaId,
      tareaId: this.pomoTareaId || null,
      titulo: this.pomoTitulo || tarea?.titulo || "",
    });
    this.showPomoPopup = false;
  }

  private _pomoTareasForMateria() {
    if (!this.pomoMateriaId) return [];
    return plannerData.value.tareas.filter(
      (t) => t.materiaId === this.pomoMateriaId && t.estado !== "completada",
    );
  }

  /* ── Render ── */

  render() {
    const allMats = materias.value.filter((m) => m.activa !== false);
    const filtered = this._filtered();
    const stats = this._stats(filtered);

    return html`
      <!-- Header -->
      <div class="hdr">
        <div class="hdr-left">
          <h2 class="hdr-title">Sesiones</h2>
          <span class="count">${stats.count}</span>
        </div>
        <div class="hdr-actions">
          <button class="btn-new" @click=${this._openNew} aria-label="Registrar sesión manual">+ Sesión manual</button>
          <div class="pomo-popup-wrap">
          <button class="btn-pomo" @click=${this._togglePomoPopup}
            ?disabled=${pomoActive.value}
            aria-label="Iniciar Pomodoro">
            ${pomoActive.value ? "⏱ Pomo activo" : "⏱ Iniciar Pomodoro"}
          </button>
          ${this.showPomoPopup
            ? html`
              <div class="pomo-popup">
                <div class="pomo-popup-title">Iniciar sesión Pomodoro</div>
                <div>
                  <div class="field-label">Materia</div>
                  <select
                    .value=${this.pomoMateriaId}
                    @change=${(e: Event) => {
                      this.pomoMateriaId = (e.target as HTMLSelectElement).value;
                      this.pomoTareaId = "";
                    }}>
                    <option value="">— Seleccionar —</option>
                    ${allMats.map((m) => html`<option value=${m.id}>${m.nombre}</option>`)}
                  </select>
                </div>
                ${this.pomoMateriaId
                  ? html`
                    <div>
                      <div class="field-label">Tarea (opcional)</div>
                      <select
                        .value=${this.pomoTareaId}
                        @change=${(e: Event) => { this.pomoTareaId = (e.target as HTMLSelectElement).value; }}>
                        <option value="">— Sin tarea —</option>
                        ${this._pomoTareasForMateria().map((t) => html`<option value=${t.id}>${t.titulo}</option>`)}
                      </select>
                    </div>
                  `
                  : nothing}
                <div>
                  <div class="field-label">Nombre de la sesión (opcional)</div>
                  <input type="text" class="pomo-titulo-input"
                    placeholder="Ej: Repaso integrales"
                    .value=${this.pomoTitulo}
                    @input=${(e: Event) => { this.pomoTitulo = (e.target as HTMLInputElement).value; }}
                  />
                </div>
                <div class="pomo-popup-actions">
                  <button class="btn-cancel" @click=${() => { this.showPomoPopup = false; }}>Cancelar</button>
                  <button class="btn-start" ?disabled=${!this.pomoMateriaId} @click=${this._startPomo}>Iniciar ⏱</button>
                </div>
              </div>
            `
            : nothing}
        </div>
        </div>
      </div>

      <!-- Stats -->
      ${stats.count > 0
        ? html`
          <div class="stats">
            <div class="stat-card">
              <div class="stat-label">Total</div>
              <div class="stat-value">${fmtDur(stats.totalMin)}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Promedio diario</div>
              <div class="stat-value">${fmtDur(stats.avgMin)}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Sesiones</div>
              <div class="stat-value">${stats.count}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Pomodoro</div>
              <div class="stat-value">${stats.timerCount}</div>
            </div>
          </div>
        `
        : nothing}

      <!-- Filters -->
      <div class="filters">
        <select class="filter-sel" aria-label="Filtrar por materia"
          .value=${this.filterMateria}
          @change=${(e: Event) => { this.filterMateria = (e.target as HTMLSelectElement).value; }}>
          <option value="">Todas las materias</option>
          ${allMats.map((m) => html`<option value=${m.id}>${m.nombre}</option>`)}
        </select>

        <select class="filter-sel" aria-label="Filtrar por origen"
          .value=${this.filterOrigen}
          @change=${(e: Event) => { this.filterOrigen = (e.target as HTMLSelectElement).value as FilterOrigen; }}>
          <option value="">Todo origen</option>
          <option value="timer">Pomodoro</option>
          <option value="manual">Manual</option>
        </select>

        <select class="filter-sel" aria-label="Filtrar por período"
          .value=${this.filterPeriod}
          @change=${(e: Event) => { this.filterPeriod = (e.target as HTMLSelectElement).value as FilterPeriod; }}>
          <option value="todo">Todo el historial</option>
          <option value="semana">Esta semana</option>
          <option value="mes">Este mes</option>
        </select>
      </div>

      <!-- Table or empty -->
      ${filtered.length === 0
        ? html`
          <div class="empty">
            <div class="empty-icon">📊</div>
            <div class="empty-msg">
              ${sesiones.value.length === 0
                ? "Todavía no hay sesiones de estudio. ¡Usá el Pomodoro o registrá una sesión manual!"
                : "No hay sesiones que coincidan con los filtros."}
            </div>
            ${sesiones.value.length === 0
              ? html`<button class="empty-cta" @click=${this._openNew}>+ Sesión manual</button>`
              : nothing}
          </div>
        `
        : html`
          <table class="tbl">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Materia</th>
                <th class="col-hide-narrow">Título</th>
                <th>Duración</th>
                <th class="col-hide-narrow">Origen</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.map(
                (s) => html`
                  <tr @click=${() => this._openEdit(s.id)}>
                    <td>${fmtDate(s.inicio)}</td>
                    <td>${fmtTimeIso(s.inicio)}</td>
                    <td>
                      <span class="mat-dot" style="background:${this._matColor(s.materiaId)}" aria-hidden="true"></span>
                      ${this._matName(s.materiaId)}
                    </td>
                    <td class="col-hide-narrow titulo-cell">${s.titulo || this._tareaTitle(s.tareaId) || "—"}</td>
                    <td>${fmtDur(s.minutos)}</td>
                    <td class="col-hide-narrow">
                      <span class="origen-badge ${s.origen}">${s.origen === "timer" ? "⏱ Pomo" : "✏️ Manual"}</span>
                    </td>
                  </tr>
                `,
              )}
            </tbody>
          </table>
        `}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "sesiones-view": SesionesView;
  }
}
