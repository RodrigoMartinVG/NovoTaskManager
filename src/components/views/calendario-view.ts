import { LitElement, css, html, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import type { EstadoTarea, Tarea } from "../../state/types.js";
import {
  filteredMaterias as materias,
  filteredSesiones as sesiones,
  filteredTareas as tareas,
  plannerData,
  updateTarea,
} from "../../state/store.js";
import { editingTaskId, newTaskDate, taskReturnView } from "../../state/navigation.js";
import type { ViewId } from "../shell/nav-bar.js";
import { PreactSignalWatcher } from "../shared/preact-signal-watcher.js";

/* ═══ Helpers ═══ */
const MES_NOMBRES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const DIA_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function isoDate(d: Date): string {
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
}

function todayISO(): string {
  return isoDate(new Date());
}

type DateFilterMode = "inicio" | "limite" | "ambas";

const ESTADO_COLOR: Record<EstadoTarea, string> = {
  pendiente: "#9ca3af",
  en_progreso: "#3b82f6",
  completada: "#10b981",
};
const ESTADO_LABEL: Record<EstadoTarea, string> = {
  pendiente: "Pendiente",
  en_progreso: "En progreso",
  completada: "Completada",
};

/** Entry in the per-day map: tarea + which date placed it here */
interface CalEntry {
  tarea: Tarea;
  dateType: "inicio" | "limite";
}

@customElement("calendario-view")
export class CalendarioView extends PreactSignalWatcher(LitElement) {
  @state() private viewYear = new Date().getFullYear();
  @state() private viewMonth = new Date().getMonth(); // 0-indexed
  @state() private dateFilter: DateFilterMode = "ambas";
  @state() private filterMateria = "";
  @state() private _legendOpen = false;
  @state() private _dateMenuOpen = false;

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
      gap: var(--space-3);
      margin-bottom: var(--space-4);
      flex-wrap: wrap;
    }
    .hdr-title {
      font-size: var(--text-xl);
      font-weight: 700;
      color: var(--text0);
      margin: 0;
    }
    .hdr-nav {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-left: auto;
    }
    .btn-nav {
      background: var(--bg1);
      border: 1px solid var(--border);
      border-radius: 0.375rem;
      padding: 0.25rem 0.5rem;
      font: inherit;
      font-size: var(--text-sm);
      color: var(--text1);
      cursor: pointer;
      transition: background 0.16s;
    }
    .btn-nav:hover { background: var(--bg2); }
    .hdr-month {
      font-size: var(--text-base);
      font-weight: 600;
      color: var(--text0);
      min-width: 10rem;
      text-align: center;
    }

    /* ── Filter bar ── */
    .filter-bar {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      margin-bottom: var(--space-3);
      flex-wrap: wrap;
    }
    .filter-select {
      font: inherit;
      font-size: 0.675rem;
      background: var(--bg1);
      color: var(--text2);
      border: 1px solid var(--border);
      border-radius: 1rem;
      padding: 0.15rem 0.5rem;
      cursor: pointer;
      transition: all 0.16s;
      line-height: 1.3;
      max-width: 10rem;
    }
    .filter-select option {
      background: var(--bg1);
      color: var(--text1);
    }
    .filter-select:hover {
      background: var(--bg2);
      border-color: var(--border2);
      color: var(--text2);
    }
    .filter-select:focus {
      outline: none;
      border-color: var(--accent);
    }
    .filter-select.has-value {
      background: color-mix(in srgb, var(--accent) 8%, transparent);
      border-color: color-mix(in srgb, var(--accent) 50%, var(--border));
      color: var(--accent);
    }

    /* ── Color mode toggle ── */
    .color-toggle { display: none; }
    .info-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1.25rem; height: 1.25rem;
      border-radius: 50%;
      border: 1px solid var(--border);
      background: transparent;
      color: var(--text3);
      font: inherit;
      font-size: 0.625rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.14s;
      position: relative;
      flex-shrink: 0;
    }
    .info-btn:hover { background: var(--bg2); color: var(--text1); }
    .info-popup {
      position: absolute;
      top: calc(100% + 0.375rem);
      left: 0;
      z-index: 60;
      background: var(--bg1);
      border: 1px solid var(--border);
      border-radius: 0.5rem;
      box-shadow: 0 6px 20px rgba(0,0,0,.15);
      padding: 0.5rem 0.75rem;
      min-width: 9rem;
      max-width: 18rem;
    }
    .info-popup-title {
      font-size: 0.5625rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--text3);
      margin-bottom: 0.375rem;
    }
    .info-row {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.125rem 0;
      font-size: var(--text-xs);
      color: var(--text1);
    }
    .info-swatch {
      width: 0.625rem; height: 0.625rem;
      border-radius: 0.125rem;
      flex-shrink: 0;
    }
    .info-backdrop {
      position: fixed;
      inset: 0;
      z-index: 55;
    }

    .filter-spacer { flex: 1; }
    .date-chip {
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
      position: relative;
    }
    .date-chip:hover {
      background: var(--bg2);
      border-color: var(--border2);
      color: var(--text2);
    }
    .date-chip.open,
    .date-chip.active {
      background: color-mix(in srgb, var(--accent) 8%, transparent);
      border-color: color-mix(in srgb, var(--accent) 50%, var(--border));
      color: var(--accent);
    }
    .date-chip-icon { font-size: 0.65rem; }
    .date-menu {
      position: absolute;
      top: calc(100% + 0.25rem);
      right: 0;
      z-index: 60;
      background: var(--bg1);
      border: 1px solid var(--border);
      border-radius: 0.5rem;
      box-shadow: 0 6px 20px rgba(0,0,0,.15);
      padding: 0.25rem 0;
      min-width: 7rem;
    }
    .date-menu-opt {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.375rem 0.75rem;
      font: inherit;
      font-size: var(--text-xs);
      color: var(--text1);
      background: transparent;
      border: none;
      width: 100%;
      cursor: pointer;
      transition: background 0.12s;
      text-align: left;
    }
    .date-menu-opt:hover { background: var(--bg2); }
    .date-menu-opt[data-selected] {
      color: var(--accent);
      font-weight: 600;
    }
    .date-menu-opt .chk {
      font-size: 0.75rem;
      margin-left: auto;
    }
    .date-backdrop {
      position: fixed;
      inset: 0;
      z-index: 55;
    }
    .legend-inline {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      margin-left: 0.25rem;
      font-size: 0.5625rem;
      color: var(--text3);
    }
    .legend-inline .lg-shape {
      width: 0.625rem;
      height: 0.4375rem;
      border: 1.5px solid var(--text3);
    }
    .legend-inline .lg-shape.s-inicio { border-radius: 0.1875rem 0 0 0.1875rem; }
    .legend-inline .lg-shape.s-limite { border-radius: 0 0.1875rem 0.1875rem 0; }

    /* ── Grid ── */
    .cal-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      border: 1px solid var(--border);
      border-radius: 0.5rem;
      overflow: hidden;
      background: var(--bg0);
    }
    .day-hdr {
      background: var(--bg1);
      border-bottom: 1px solid var(--border);
      padding: 0.5rem 0.25rem;
      text-align: center;
      font-size: var(--text-xs);
      font-weight: 600;
      color: var(--text2);
    }

    /* ── Day cell ── */
    .day-cell {
      border-bottom: 1px solid var(--border);
      border-right: 1px solid var(--border);
      min-height: 5rem;
      padding: 0.25rem;
      transition: background 0.16s;
      position: relative;
      min-width: 0;
    }
    .day-cell:nth-child(7n) { border-right: none; }
    .day-cell:hover { background: var(--bg1); }
    .day-cell.is-today {
      background: color-mix(in srgb, var(--accent) 8%, var(--bg0));
    }
    .day-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .day-num {
      font-size: var(--text-xs);
      font-weight: 600;
      color: var(--text1);
      padding: 0.125rem 0.25rem;
    }
    .day-cell.is-today .day-num {
      color: var(--accent);
    }
    .cell-add {
      background: var(--bg2);
      border: none;
      color: var(--text3);
      font-size: 0.5625rem;
      line-height: 1;
      padding: 0.125rem 0.375rem;
      border-radius: 0.75rem;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.14s, color 0.14s, background 0.14s;
      white-space: nowrap;
    }
    .day-cell:hover .cell-add { opacity: 1; }
    .cell-add:hover { color: var(--accent); background: var(--bg3); }

    /* ── Task cards in cells ── */
    .day-cards {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
      padding: 0 0.125rem;
      min-width: 0;
    }
    .day-card {
      display: flex;
      align-items: center;
      gap: 0.3rem;
      padding: 0.125rem 0.375rem;
      padding-left: 0.375rem;
      font-size: 0.6875rem;
      line-height: 1.3;
      color: var(--text1);
      background: var(--bg1);
      border-left: 3px solid var(--text3);
      cursor: pointer;
      transition: background 0.12s;
    }
    .day-card:hover { background: var(--bg2); }
    .card-mat {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1rem;
      height: 1rem;
      min-width: 1rem;
      border-radius: 50%;
      font-size: 0.5rem;
      font-weight: 700;
      color: #fff;
      text-transform: uppercase;
      line-height: 1;
    }

    /* ── Card tooltip ── */
    .card-tip {
      display: none;
      position: absolute;
      left: 100%;
      top: 50%;
      transform: translateY(-50%);
      margin-left: 0.75rem;
      z-index: 200;
      background: var(--bg0, #fff);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid var(--border);
      border-radius: 0.625rem;
      box-shadow: 0 8px 32px rgba(0,0,0,.22), 0 2px 8px rgba(0,0,0,.1);
      padding: 0.75rem 1rem;
      min-width: 14rem;
      max-width: 20rem;
      white-space: normal;
      pointer-events: none;
    }
    /* Flip to left side for right-edge columns */
    .tip-flip .card-tip {
      left: auto;
      right: 100%;
      margin-left: 0;
      margin-right: 0.75rem;
    }
    .day-card:hover .card-tip { display: block; }

    .tip-title {
      font-size: 0.8125rem;
      font-weight: 700;
      color: var(--text0);
      margin-bottom: 0.5rem;
      line-height: 1.3;
      word-break: break-word;
    }
    .tip-divider {
      height: 1px;
      background: var(--border);
      margin: 0.375rem 0;
    }
    .tip-field {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.6875rem;
      color: var(--text1);
      line-height: 1.5;
    }
    .tip-field + .tip-field { margin-top: 0.25rem; }
    .tip-field-label {
      color: var(--text3);
      min-width: 4.5rem;
      flex-shrink: 0;
    }
    .tip-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.625rem;
      font-weight: 600;
      padding: 0.125rem 0.5rem;
      border-radius: 1rem;
      background: var(--bg2);
      color: var(--text1);
    }
    .tip-badge-dot {
      width: 0.375rem;
      height: 0.375rem;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .tip-oblig {
      display: inline-flex;
      align-items: center;
      gap: 0.125rem;
      font-size: 0.625rem;
      color: var(--warning, #f59e0b);
      font-weight: 600;
    }
    /* Rounded all when single mode */
    .day-card.shape-full {
      border-radius: 0.1875rem;
    }
    /* Start: rounded left, flat right */
    .day-card.shape-inicio {
      border-radius: 0.375rem 0 0 0.375rem;
    }
    /* End: flat left, rounded right */
    .day-card.shape-limite {
      border-radius: 0 0.375rem 0.375rem 0;
    }
    .card-label {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      min-width: 0;
    }
    .day-ses {
      font-size: 0.5rem;
      color: var(--text3);
      padding: 0 0.25rem;
    }

    /* ── Grid wrap ── */
    .grid-wrap {
      position: relative;
    }

    /* ── Hover hint on cells ── */
    .day-cell.has-entries {
      cursor: default;
    }

    /* ── Drag highlight ── */
    .day-cell.drag-over {
      background: color-mix(in srgb, var(--accent) 14%, var(--bg0));
      box-shadow: inset 0 0 0 2px var(--accent);
    }
    .day-card[draggable="true"] {
      cursor: grab;
    }
    .day-card[draggable="true"]:active {
      cursor: grabbing;
      opacity: 0.6;
    }

    /* ── Responsive ── */
    @media (max-width: 768px) {
      .day-cell { min-height: 3rem; }
      .day-num { font-size: 0.625rem; }
      .day-card { font-size: 0.5rem; }
    }
  `;

  render() {
    const hoy = todayISO();
    const days = this._buildCalDays();
    const showInicio = this.dateFilter === "inicio" || this.dateFilter === "ambas";
    const showLimite = this.dateFilter === "limite" || this.dateFilter === "ambas";
    const isAmbas = this.dateFilter === "ambas";

    // Build lookup: "YYYY-MM-DD" → CalEntry[]
    const entryMap = new Map<string, CalEntry[]>();
    const pushEntry = (date: string, tarea: Tarea, dateType: "inicio" | "limite") => {
      const arr = entryMap.get(date) ?? [];
      arr.push({ tarea, dateType });
      entryMap.set(date, arr);
    };

    for (const t of tareas.value) {
      if (this.filterMateria && t.materiaId !== this.filterMateria) continue;
      if (showLimite && t.fechaLimite) {
        pushEntry(t.fechaLimite, t, "limite");
      }
      if (showInicio && t.fechaInicio) {
        // Avoid duplicate in same cell when both dates are equal and filter is "ambas"
        if (!(isAmbas && t.fechaInicio === t.fechaLimite)) {
          pushEntry(t.fechaInicio, t, "inicio");
        }
      }
    }

    // sesiones by date
    const sesMap = new Map<string, number>();
    for (const s of sesiones.value) {
      const d = s.inicio.slice(0, 10);
      sesMap.set(d, (sesMap.get(d) ?? 0) + s.minutos);
    }

    return html`
      <div class="hdr">
        <h2 class="hdr-title">Calendario</h2>
        <div class="hdr-nav">
          <button class="btn-nav" @click=${this._prevMonth}>◀</button>
          <span class="hdr-month">${MES_NOMBRES[this.viewMonth]} ${this.viewYear}</span>
          <button class="btn-nav" @click=${this._nextMonth}>▶</button>
        </div>
      </div>

      <!-- Filters -->
      <div class="filter-bar">
        <select class="filter-select ${this.filterMateria ? "has-value" : ""}"
          @change=${(e: Event) => { this.filterMateria = (e.target as HTMLSelectElement).value; }}>
          <option value="">Todas las materias</option>
          ${materias.value.map((m) => html`
            <option value=${m.id} ?selected=${m.id === this.filterMateria}>${m.nombre}</option>
          `)}
        </select>

        <span class="info-btn" @click=${(e: Event) => { e.stopPropagation(); this._legendOpen = !this._legendOpen; }}>i
          ${this._legendOpen ? html`
            <div class="info-backdrop" @click=${(e: Event) => { e.stopPropagation(); this._legendOpen = false; }}></div>
            <div class="info-popup">
              <div class="info-popup-title">Borde izquierdo = Estado</div>
              ${(["pendiente", "en_progreso", "completada"] as EstadoTarea[]).map((est) => html`
                <div class="info-row">
                  <span class="info-swatch" style="background:${ESTADO_COLOR[est]}"></span>
                  ${ESTADO_LABEL[est]}
                </div>
              `)}
              <div class="info-popup-title" style="margin-top:0.5rem">Círculo = Materia</div>
              ${materias.value.map((m) => html`
                <div class="info-row">
                  <span class="info-swatch" style="background:${m.color}; border-radius:50%"></span>
                  ${m.nombre}
                </div>
              `)}
            </div>
          ` : nothing}
        </span>

        <span class="filter-spacer"></span>

        <span class="date-chip ${this._dateMenuOpen ? "open" : ""} ${this.dateFilter !== "ambas" ? "active" : ""}"
          @click=${(e: Event) => { e.stopPropagation(); this._dateMenuOpen = !this._dateMenuOpen; }}>
          <span class="date-chip-icon">📅</span>
          ${this.dateFilter === "inicio" ? "Inicio" : this.dateFilter === "limite" ? "Límite" : "Ambas"}
          ${this.dateFilter === "ambas" ? html`
            <span class="legend-inline">
              <span class="lg-shape s-inicio"></span>I
              <span class="lg-shape s-limite"></span>L
            </span>
          ` : nothing}
          ${this._dateMenuOpen ? html`
            <div class="date-backdrop" @click=${() => { this._dateMenuOpen = false; }}></div>
            <div class="date-menu">
              ${(["ambas", "inicio", "limite"] as DateFilterMode[]).map((m) => html`
                <button class="date-menu-opt" ?data-selected=${this.dateFilter === m}
                  @click=${(ev: Event) => { ev.stopPropagation(); this.dateFilter = m; this._dateMenuOpen = false; }}>
                  ${m === "ambas" ? "Ambas" : m === "inicio" ? "Inicio" : "Límite"}
                  ${this.dateFilter === m ? html`<span class="chk">✓</span>` : nothing}
                </button>
              `)}
            </div>
          ` : nothing}
        </span>
      </div>

      <div class="grid-wrap">
      <div class="cal-grid">
        ${DIA_LABELS.map((d) => html`<div class="day-hdr">${d}</div>`)}
        ${days.map((day, idx) => {
          const iso = isoDate(day);
          const colIdx = idx % 7;
          const isToday = iso === hoy;
          const entries = entryMap.get(iso) ?? [];
          const sesMins = sesMap.get(iso) ?? 0;
          return html`
            <div class="day-cell
              ${isToday ? "is-today" : ""}
              ${entries.length > 0 ? "has-entries" : ""}
              ${colIdx >= 5 ? "tip-flip" : ""}"
              @dragover=${(ev: DragEvent) => { ev.preventDefault(); (ev.currentTarget as HTMLElement).classList.add("drag-over"); }}
              @dragleave=${(ev: DragEvent) => { (ev.currentTarget as HTMLElement).classList.remove("drag-over"); }}
              @drop=${(ev: DragEvent) => this._onDrop(ev, iso)}>
              <div class="day-top">
                <span class="day-num">${day.getDate()}</span>
                <button class="cell-add" @click=${(ev: Event) => { ev.stopPropagation(); this._newTaskOnDate(iso); }} title="Nueva tarea">+ nueva task</button>
              </div>
              ${entries.length > 0 ? html`
                <div class="day-cards">
                  ${entries.map((e) => {
                    const mat = materias.value.find((m) => m.id === e.tarea.materiaId);
                    const estadoColor = ESTADO_COLOR[e.tarea.estado];
                    const matColor = mat?.color ?? "var(--text3)";
                    const matInitial = mat?.nombre?.charAt(0) ?? "?";
                    const shape = isAmbas ? `shape-${e.dateType}` : "shape-full";
                    const matName = mat?.nombre ?? "Sin materia";
                    return html`
                      <div class="day-card ${shape}"
                        style="border-left-color:${estadoColor}"
                        draggable="true"
                        @dragstart=${(ev: DragEvent) => { ev.dataTransfer!.setData("text/plain", JSON.stringify({ id: e.tarea.id, dateType: e.dateType })); ev.dataTransfer!.effectAllowed = "move"; }}
                        @click=${(ev: Event) => { ev.stopPropagation(); this._openTask(e.tarea.id); }}>
                        <span class="card-mat" style="background:${matColor}">${matInitial}</span>
                        <span class="card-label">${e.tarea.titulo}</span>
                        <div class="card-tip">
                          <div class="tip-title">${e.tarea.titulo}</div>
                          <div class="tip-divider"></div>
                          <div class="tip-field">
                            <span class="tip-field-label">Materia</span>
                            <span style="color:${mat?.color ?? 'var(--text1)'}; font-weight:600">${matName}</span>
                          </div>
                          <div class="tip-field">
                            <span class="tip-field-label">Estado</span>
                            <span class="tip-badge"><span class="tip-badge-dot" style="background:${ESTADO_COLOR[e.tarea.estado]}"></span>${ESTADO_LABEL[e.tarea.estado]}</span>
                          </div>
                          <div class="tip-field">
                            <span class="tip-field-label">Tipo</span>
                            <span>${(() => { const t = plannerData.value.tipos.find(t => t.id === e.tarea.tipo); return t ? `${t.icono} ${t.nombre}` : e.tarea.tipo; })()}</span>
                          </div>
                          ${e.tarea.obligatorio ? html`
                          <div class="tip-field">
                            <span class="tip-field-label"></span>
                            <span class="tip-oblig">⚠️ Obligatoria</span>
                          </div>` : nothing}
                          ${isAmbas ? html`
                          <div class="tip-field">
                            <span class="tip-field-label">Tipo fecha</span>
                            <span>${e.dateType === "inicio" ? "📍 Inicio" : "🏁 Límite"}</span>
                          </div>` : nothing}
                        </div>
                      </div>`;
                  })}
                </div>
              ` : nothing}
              ${sesMins > 0 ? html`<span class="day-ses">${sesMins}m</span>` : nothing}
            </div>
          `;
        })}
      </div>
      </div>
    `;
  }

  /** Build array of 42 days (6 weeks) for the calendar grid */
  private _buildCalDays(): Date[] {
    const first = new Date(this.viewYear, this.viewMonth, 1);
    let weekday = first.getDay(); // 0=dom
    weekday = weekday === 0 ? 6 : weekday - 1; // 0=lun

    const start = new Date(first);
    start.setDate(start.getDate() - weekday);

    const days: Date[] = [];
    for (let i = 0; i < 42; i++) {
      days.push(new Date(start));
      start.setDate(start.getDate() + 1);
    }
    return days;
  }

  private _prevMonth() {
    if (this.viewMonth === 0) {
      this.viewMonth = 11;
      this.viewYear--;
    } else {
      this.viewMonth--;
    }
  }

  private _nextMonth() {
    if (this.viewMonth === 11) {
      this.viewMonth = 0;
      this.viewYear++;
    } else {
      this.viewMonth++;
    }
  }

  private _onDrop(ev: DragEvent, targetDate: string) {
    ev.preventDefault();
    (ev.currentTarget as HTMLElement).classList.remove("drag-over");
    const raw = ev.dataTransfer?.getData("text/plain");
    if (!raw) return;
    try {
      const { id, dateType } = JSON.parse(raw) as { id: string; dateType: "inicio" | "limite" };
      const patch: Partial<Tarea> =
        dateType === "inicio" ? { fechaInicio: targetDate } : { fechaLimite: targetDate };
      updateTarea(id, patch);
    } catch { /* ignore bad data */ }
  }

  private _openTask(id: string) {
    editingTaskId.value = id;
    taskReturnView.value = "calendario";
    this.dispatchEvent(
      new CustomEvent<ViewId>("view-change", {
        detail: "task",
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _newTaskOnDate(iso: string) {
    editingTaskId.value = "new";
    taskReturnView.value = "calendario";
    // Store the date so task-view can pre-fill fechaLimite
    newTaskDate.value = iso;
    this.dispatchEvent(
      new CustomEvent<ViewId>("view-change", {
        detail: "task",
        bubbles: true,
        composed: true,
      }),
    );
  }
}
