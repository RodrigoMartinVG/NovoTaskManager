import { LitElement, css, html, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import type { Tarea } from "../../state/types.js";
import {
  filteredMaterias as materias,
  filteredSesiones as sesiones,
  filteredTareas as tareas,
  updateTarea,
} from "../../state/store.js";
import { editingTaskId, taskReturnView } from "../../state/navigation.js";
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

/** Entry in the per-day map: tarea + which date placed it here */
interface CalEntry {
  tarea: Tarea;
  dateType: "inicio" | "limite";
}

@customElement("calendario-view")
export class CalendarioView extends PreactSignalWatcher(LitElement) {
  @state() private viewYear = new Date().getFullYear();
  @state() private viewMonth = new Date().getMonth(); // 0-indexed
  @state() private selectedDate: string | null = null;
  @state() private dateFilter: DateFilterMode = "ambas";
  @state() private _popX = 0;
  @state() private _popY = 0;

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

    /* ── Date-type filter ── */
    .filter-bar {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      margin-bottom: var(--space-3);
    }
    .filter-label {
      font-size: var(--text-xs);
      color: var(--text2);
      margin-right: 0.25rem;
    }
    .filter-btn {
      background: var(--bg1);
      border: 1px solid var(--border);
      border-radius: 0.375rem;
      padding: 0.25rem 0.625rem;
      font: inherit;
      font-size: var(--text-xs);
      color: var(--text1);
      cursor: pointer;
      transition: background 0.16s, border-color 0.16s;
    }
    .filter-btn:hover { background: var(--bg2); }
    .filter-btn.active {
      background: var(--accent);
      color: var(--bg0);
      border-color: var(--accent);
    }
    .filter-legend {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-left: auto;
      font-size: var(--text-xs);
      color: var(--text2);
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    .legend-shape {
      width: 0.875rem;
      height: 0.625rem;
      border: 1.5px solid var(--text2);
    }
    .legend-shape.shape-inicio {
      border-radius: 0.25rem 0 0 0.25rem;
    }
    .legend-shape.shape-limite {
      border-radius: 0 0.25rem 0.25rem 0;
    }

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
      cursor: pointer;
      transition: background 0.16s;
      position: relative;
      overflow: hidden;
      min-width: 0;
    }
    .day-cell:nth-child(7n) { border-right: none; }
    .day-cell:hover { background: var(--bg1); }
    .day-cell.is-today {
      background: color-mix(in srgb, var(--accent) 8%, var(--bg0));
    }
    .day-cell.selected {
      box-shadow: inset 0 0 0 2px var(--accent);
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

    /* ── Task cards in cells ── */
    .day-cards {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
      padding: 0 0.125rem;
      overflow: hidden;
      min-width: 0;
    }
    .day-card {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.125rem 0.375rem;
      font-size: 0.6875rem;
      line-height: 1.3;
      color: var(--bg0);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      cursor: pointer;
      transition: opacity 0.12s;
    }
    .day-card:hover { opacity: 0.85; }
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
    }
    .day-ses {
      font-size: 0.5rem;
      color: var(--text3);
      padding: 0 0.25rem;
    }

    /* ── Detail popover ── */
    .grid-wrap {
      position: relative;
    }
    .detail-backdrop {
      position: fixed;
      inset: 0;
      z-index: 90;
    }
    .detail {
      position: fixed;
      z-index: 100;
      width: 18rem;
      background: var(--bg1);
      border: 1px solid var(--border);
      border-radius: 0.5rem;
      padding: var(--space-3);
      box-shadow: 0 8px 24px rgba(0,0,0,.18);
      max-height: 16rem;
      overflow-y: auto;
    }
    .detail-close {
      position: absolute;
      top: 0.375rem;
      right: 0.375rem;
      background: transparent;
      border: none;
      font-size: 0.875rem;
      color: var(--text3);
      cursor: pointer;
      padding: 0.125rem 0.25rem;
      line-height: 1;
      border-radius: 0.25rem;
    }
    .detail-close:hover {
      background: var(--bg2);
      color: var(--text0);
    }
    .detail-title {
      font-size: var(--text-sm);
      font-weight: 700;
      color: var(--text0);
      margin-bottom: var(--space-2);
    }
    .detail-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.375rem 0.5rem;
      border-radius: 0.25rem;
      cursor: pointer;
      font-size: var(--text-sm);
      color: var(--text0);
      transition: background 0.16s;
    }
    .detail-row:hover { background: var(--bg2); }
    .detail-dot {
      width: 0.5rem; height: 0.5rem;
      flex-shrink: 0;
    }
    .detail-dot.shape-full { border-radius: 50%; }
    .detail-dot.shape-inicio {
      border-radius: 50% 0 0 50%;
    }
    .detail-dot.shape-limite {
      border-radius: 0 50% 50% 0;
    }
    .detail-meta {
      font-size: var(--text-xs);
      color: var(--text3);
      margin-left: auto;
    }
    .detail-type-tag {
      font-size: 0.5625rem;
      padding: 0.0625rem 0.3rem;
      border-radius: 0.25rem;
      background: var(--bg2);
      color: var(--text2);
    }
    .detail-ses {
      font-size: var(--text-xs);
      color: var(--text3);
      padding: 0.25rem 0.5rem;
    }
    .detail-empty {
      font-size: var(--text-sm);
      color: var(--text3);
      text-align: center;
      padding: var(--space-2);
    }

    /* ── Hover hint on cells with cards ── */
    .day-cell.has-entries {
      cursor: pointer;
    }
    .day-cell.has-entries::after {
      content: "•••";
      position: absolute;
      bottom: 0.125rem;
      right: 0.25rem;
      font-size: 0.5rem;
      color: var(--text3);
      opacity: 0;
      transition: opacity 0.16s;
    }
    .day-cell.has-entries:hover::after {
      opacity: 1;
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

      <!-- Date-type filter -->
      <div class="filter-bar">
        <span class="filter-label">Mostrar por:</span>
        ${(["inicio", "limite", "ambas"] as DateFilterMode[]).map((mode) => html`
          <button class="filter-btn ${this.dateFilter === mode ? "active" : ""}"
            @click=${() => { this.dateFilter = mode; }}>
            ${mode === "inicio" ? "Inicio" : mode === "limite" ? "Límite" : "Ambas"}
          </button>
        `)}
        ${isAmbas ? html`
          <div class="filter-legend">
            <div class="legend-item">
              <div class="legend-shape shape-inicio"></div>
              <span>Inicio</span>
            </div>
            <div class="legend-item">
              <div class="legend-shape shape-limite"></div>
              <span>Límite</span>
            </div>
          </div>
        ` : nothing}
      </div>

      <div class="grid-wrap">
      <div class="cal-grid">
        ${DIA_LABELS.map((d) => html`<div class="day-hdr">${d}</div>`)}
        ${days.map((day) => {
          const iso = isoDate(day);
          const isToday = iso === hoy;
          const entries = entryMap.get(iso) ?? [];
          const sesMins = sesMap.get(iso) ?? 0;
          return html`
            <div class="day-cell
              ${isToday ? "is-today" : ""}
              ${entries.length > 0 ? "has-entries" : ""}
              ${this.selectedDate === iso ? "selected" : ""}"
              @click=${(ev: MouseEvent) => this._onCellClick(iso, ev)}
              @dragover=${(ev: DragEvent) => { ev.preventDefault(); (ev.currentTarget as HTMLElement).classList.add("drag-over"); }}
              @dragleave=${(ev: DragEvent) => { (ev.currentTarget as HTMLElement).classList.remove("drag-over"); }}
              @drop=${(ev: DragEvent) => this._onDrop(ev, iso)}>
              <div class="day-num">${day.getDate()}</div>
              ${entries.length > 0 ? html`
                <div class="day-cards">
                  ${entries.map((e) => {
                    const mat = materias.value.find((m) => m.id === e.tarea.materiaId);
                    const bg = mat?.color ?? "var(--text3)";
                    const shape = isAmbas ? `shape-${e.dateType}` : "shape-full";
                    return html`
                      <div class="day-card ${shape}"
                        style="background:${bg}"
                        draggable="true"
                        @dragstart=${(ev: DragEvent) => { ev.dataTransfer!.setData("text/plain", JSON.stringify({ id: e.tarea.id, dateType: e.dateType })); ev.dataTransfer!.effectAllowed = "move"; }}
                        @click=${(ev: Event) => { ev.stopPropagation(); this._openTask(e.tarea.id); }}>
                        <span class="card-label">${e.tarea.titulo}</span>
                      </div>`;
                  })}
                </div>
              ` : nothing}
              ${sesMins > 0 ? html`<span class="day-ses">${sesMins}m</span>` : nothing}
            </div>
          `;
        })}
      </div>

      <!-- Detail popover for selected date -->
      ${this.selectedDate ? html`
        <div class="detail-backdrop" @click=${() => { this.selectedDate = null; }}></div>
        ${this._renderDetail(this.selectedDate, entryMap, sesMap)}
      ` : nothing}
      </div>
    `;
  }

  private _onCellClick(iso: string, ev: MouseEvent) {
    if (this.selectedDate === iso) {
      this.selectedDate = null;
      return;
    }
    // Calculate popover position in viewport coords
    const cell = ev.currentTarget as HTMLElement;
    const cellRect = cell.getBoundingClientRect();
    const popW = 288; // 18rem ≈ 288px
    const popH = 256; // max-height 16rem ≈ 256px
    // Try below cell, horizontally centered
    let left = cellRect.left + cellRect.width / 2 - popW / 2;
    let top = cellRect.bottom + 6;
    // If it overflows bottom, place above
    if (top + popH > window.innerHeight - 8) {
      top = cellRect.top - popH - 6;
    }
    // Clamp horizontal
    left = Math.max(8, Math.min(left, window.innerWidth - popW - 8));
    // Clamp top
    top = Math.max(8, top);
    this._popX = left;
    this._popY = top;
    this.selectedDate = iso;
  }

  private _renderDetail(
    iso: string,
    entryMap: Map<string, CalEntry[]>,
    sesMap: Map<string, number>,
  ) {
    const entries = entryMap.get(iso) ?? [];
    const sesMins = sesMap.get(iso) ?? 0;
    const d = new Date(iso + "T00:00:00");
    const label = `${DIA_LABELS[(d.getDay() + 6) % 7]} ${d.getDate()} ${MES_NOMBRES[d.getMonth()]}`;
    const isAmbas = this.dateFilter === "ambas";

    return html`
      <div class="detail" style="top:${this._popY}px;left:${this._popX}px">
        <button class="detail-close" @click=${() => { this.selectedDate = null; }}>✕</button>
        <div class="detail-title">${label}</div>
        ${entries.length > 0
          ? entries.map((e) => {
              const mat = materias.value.find((m) => m.id === e.tarea.materiaId);
              const dotShape = isAmbas ? `shape-${e.dateType}` : "shape-full";
              return html`
                <div class="detail-row" @click=${() => this._openTask(e.tarea.id)}>
                  <div class="detail-dot ${dotShape}" style="background:${mat?.color ?? "var(--text3)"}"></div>
                  <span>${e.tarea.titulo}</span>
                  ${isAmbas ? html`<span class="detail-type-tag">${e.dateType === "inicio" ? "Inicio" : "Límite"}</span>` : nothing}
                  <span class="detail-meta">${e.tarea.estado}</span>
                </div>
              `;
            })
          : html`<div class="detail-empty">Sin tareas</div>`}
        ${sesMins > 0 ? html`<div class="detail-ses">📚 ${sesMins} min de estudio</div>` : nothing}
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
    this.selectedDate = null;
  }

  private _nextMonth() {
    if (this.viewMonth === 11) {
      this.viewMonth = 0;
      this.viewYear++;
    } else {
      this.viewMonth++;
    }
    this.selectedDate = null;
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
}
