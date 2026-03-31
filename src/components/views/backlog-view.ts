import { SignalWatcher } from "@lit-labs/signals";
import { LitElement, css, html, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import type { EstadoTarea, Tarea } from "../../state/types.js";
import {
  editingTaskId,
  materias,
  plannerData,
  taskReturnView,
} from "../../state/store.js";
import type { ViewId } from "../shell/nav-bar.js";

const ESTADO_LABEL: Record<EstadoTarea, string> = {
  pendiente: "Pendiente",
  en_progreso: "En progreso",
  completada: "Completada",
};

const ESTADO_DOT: Record<EstadoTarea, string> = {
  pendiente: "var(--warn-text, #7a4808)",
  en_progreso: "var(--info-text, #3930a0)",
  completada: "var(--ok-text, #146035)",
};

const PRIO_ICON: Record<string, string> = {
  alta: "🔴",
  media: "🟡",
  baja: "🟢",
};

@customElement("backlog-view")
export class BacklogView extends SignalWatcher(LitElement) {
  @state() private filterMateria = "";
  @state() private filterTipo = "";
  @state() private filterEstado = "";
  @state() private searchQuery = "";

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
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.16s;
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
    }
    .btn-new:hover { opacity: 0.9; }

    /* ── Filters bar ── */
    .filters {
      display: flex;
      gap: var(--space-2, 0.5rem);
      margin-bottom: var(--space-4, 1rem);
      flex-wrap: wrap;
      align-items: center;
    }
    .filters select,
    .filters input[type="search"] {
      font: inherit;
      font-size: var(--text-xs);
      background: var(--bg0);
      color: var(--text0);
      border: 1px solid var(--border);
      border-radius: 0.375rem;
      padding: 0.375rem 0.5rem;
    }
    .filters select:focus,
    .filters input:focus {
      outline: none;
      border-color: var(--accent);
    }
    .filters input[type="search"] {
      flex: 1;
      min-width: 10rem;
      max-width: 16rem;
    }
    .clear-btn {
      background: transparent;
      border: 1px solid var(--border);
      color: var(--text3);
      padding: 0.375rem 0.5rem;
      border-radius: 0.375rem;
      cursor: pointer;
      font: inherit;
      font-size: var(--text-xs);
    }
    .clear-btn:hover {
      color: var(--text1);
      background: var(--bg2);
    }

    /* ── Table ── */
    .table-wrap {
      overflow-x: auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: var(--text-sm);
    }
    thead th {
      text-align: left;
      font-size: var(--text-xs);
      font-weight: 600;
      color: var(--text3);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      padding: 0.5rem 0.625rem;
      border-bottom: 1px solid var(--border);
      white-space: nowrap;
    }
    tbody tr {
      cursor: pointer;
      transition: background 0.12s;
    }
    tbody tr:hover {
      background: var(--bg2);
    }
    tbody td {
      padding: 0.625rem;
      border-bottom: 1px solid var(--border);
      vertical-align: middle;
    }

    /* ── Cell helpers ── */
    .cell-titulo {
      font-weight: 500;
      color: var(--text0);
    }
    .cell-titulo.done {
      text-decoration: line-through;
      color: var(--text3);
    }
    .materia-dot {
      display: inline-block;
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 50%;
      margin-right: 0.375rem;
      vertical-align: middle;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.125rem 0.5rem;
      border-radius: 0.75rem;
      font-size: var(--text-xs);
      font-weight: 500;
      white-space: nowrap;
    }
    .badge-estado {
      background: var(--bg2);
      color: var(--text1);
    }
    .estado-dot {
      width: 0.375rem;
      height: 0.375rem;
      border-radius: 50%;
      display: inline-block;
    }
    .cell-fecha {
      font-size: var(--text-xs);
      color: var(--text2);
      white-space: nowrap;
    }
    .fecha-warn {
      color: var(--warn-text);
      font-weight: 600;
    }
    .fecha-err {
      color: var(--err-text);
      font-weight: 600;
    }
    .cell-oblig {
      font-size: 0.75rem;
    }

    /* ── Responsive: hide less-important columns ── */
    .col-tipo, .col-fecha, .col-oblig {
      /* visible by default */
    }
    @media (max-width: 48em) {
      .col-tipo, .col-oblig { display: none; }
    }
    @media (max-width: 36em) {
      .col-fecha, .col-estado { display: none; }
    }

    /* ── Empty state ── */
    .empty {
      text-align: center;
      padding: var(--space-8, 3rem) var(--space-4, 1rem);
      color: var(--text2);
    }
    .empty-icon {
      font-size: 2.5rem;
      margin-bottom: var(--space-3, 0.75rem);
    }
    .empty-title {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text1);
      margin: 0 0 var(--space-2, 0.5rem);
    }
    .empty-desc {
      font-size: var(--text-sm);
      margin: 0 0 var(--space-4, 1rem);
      max-width: 22rem;
      margin-inline: auto;
    }

    /* ── No results (filter) ── */
    .no-results {
      text-align: center;
      padding: var(--space-6, 2rem);
      color: var(--text3);
      font-size: var(--text-sm);
    }
  `;

  private _openTask(id: string) {
    taskReturnView.value = "backlog";
    editingTaskId.value = id;
    this.dispatchEvent(
      new CustomEvent<ViewId>("view-change", {
        detail: "task",
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _newTask() {
    taskReturnView.value = "backlog";
    editingTaskId.value = "new";
    this.dispatchEvent(
      new CustomEvent<ViewId>("view-change", {
        detail: "task",
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _hasActiveFilters() {
    return !!(this.filterMateria || this.filterTipo || this.filterEstado || this.searchQuery);
  }

  private _clearFilters() {
    this.filterMateria = "";
    this.filterTipo = "";
    this.filterEstado = "";
    this.searchQuery = "";
  }

  private _getFiltered(): Tarea[] {
    let list = plannerData.value.tareas;

    if (this.filterMateria) {
      list = list.filter((t) => t.materiaId === this.filterMateria);
    }
    if (this.filterTipo) {
      list = list.filter((t) => t.tipo === this.filterTipo);
    }
    if (this.filterEstado) {
      list = list.filter((t) => t.estado === this.filterEstado);
    }
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter((t) => t.titulo.toLowerCase().includes(q));
    }

    // Sort: pendiente first, then en_progreso, then completada. Within each group: alta > media > baja, then by fechaLimite ascending.
    const estadoOrder: Record<string, number> = { pendiente: 0, en_progreso: 1, completada: 2 };
    const prioOrder: Record<string, number> = { alta: 0, media: 1, baja: 2 };
    return [...list].sort((a, b) => {
      const eA = estadoOrder[a.estado] ?? 1;
      const eB = estadoOrder[b.estado] ?? 1;
      if (eA !== eB) return eA - eB;
      const pA = prioOrder[a.prioridad] ?? 1;
      const pB = prioOrder[b.prioridad] ?? 1;
      if (pA !== pB) return pA - pB;
      if (a.fechaLimite && b.fechaLimite) return a.fechaLimite.localeCompare(b.fechaLimite);
      if (a.fechaLimite) return -1;
      if (b.fechaLimite) return 1;
      return 0;
    });
  }

  private _fechaClass(fecha: string | undefined): string {
    if (!fecha) return "cell-fecha";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(fecha + "T00:00:00");
    const diff = (d.getTime() - today.getTime()) / 86400000;
    if (diff < 0) return "cell-fecha fecha-err";
    if (diff <= 2) return "cell-fecha fecha-warn";
    return "cell-fecha";
  }

  private _formatFecha(fecha: string | undefined): string {
    if (!fecha) return "—";
    const d = new Date(fecha + "T00:00:00");
    return d.toLocaleDateString("es-AR", { day: "numeric", month: "short" });
  }

  render() {
    const mats = materias.value;
    const tipos = plannerData.value.tipos;
    const allTareas = plannerData.value.tareas;
    const filtered = this._getFiltered();
    const matMap = new Map(mats.map((m) => [m.id, m]));
    const tipoMap = new Map(tipos.map((t) => [t.id, t]));

    // Empty state: no tasks at all
    if (allTareas.length === 0) {
      return html`
        <div class="hdr">
          <div class="hdr-left">
            <h1 class="hdr-title">Backlog</h1>
          </div>
        </div>
        <div class="empty">
          <div class="empty-icon">📋</div>
          <p class="empty-title">Tu backlog está vacío</p>
          <p class="empty-desc">Creá tu primera tarea para empezar a organizar tus entregas y pendientes.</p>
          <button class="btn-new" @click=${this._newTask}>+ Nueva tarea</button>
        </div>
      `;
    }

    return html`
      <!-- Header -->
      <div class="hdr">
        <div class="hdr-left">
          <h1 class="hdr-title">Backlog</h1>
          <span class="count">${filtered.length}${filtered.length !== allTareas.length ? ` / ${allTareas.length}` : ""}</span>
        </div>
        <button class="btn-new" @click=${this._newTask}>+ Nueva tarea</button>
      </div>

      <!-- Filters -->
      <div class="filters">
        <input
          type="search"
          placeholder="Buscar..."
          .value=${this.searchQuery}
          @input=${(e: InputEvent) => { this.searchQuery = (e.target as HTMLInputElement).value; }}
          aria-label="Buscar tareas"
        />

        <select
          .value=${this.filterMateria}
          @change=${(e: Event) => { this.filterMateria = (e.target as HTMLSelectElement).value; }}
          aria-label="Filtrar por materia"
        >
          <option value="">Todas las materias</option>
          ${mats.map((m) => html`<option value=${m.id} ?selected=${m.id === this.filterMateria}>${m.nombre}</option>`)}
        </select>

        <select
          .value=${this.filterTipo}
          @change=${(e: Event) => { this.filterTipo = (e.target as HTMLSelectElement).value; }}
          aria-label="Filtrar por tipo"
        >
          <option value="">Todos los tipos</option>
          ${tipos.map((t) => html`<option value=${t.id} ?selected=${t.id === this.filterTipo}>${t.icono} ${t.nombre}</option>`)}
        </select>

        <select
          .value=${this.filterEstado}
          @change=${(e: Event) => { this.filterEstado = (e.target as HTMLSelectElement).value; }}
          aria-label="Filtrar por estado"
        >
          <option value="">Todos los estados</option>
          <option value="pendiente" ?selected=${this.filterEstado === "pendiente"}>Pendiente</option>
          <option value="en_progreso" ?selected=${this.filterEstado === "en_progreso"}>En progreso</option>
          <option value="completada" ?selected=${this.filterEstado === "completada"}>Completada</option>
        </select>

        ${this._hasActiveFilters()
          ? html`<button class="clear-btn" @click=${this._clearFilters}>✕ Limpiar</button>`
          : nothing}
      </div>

      <!-- Table -->
      ${filtered.length === 0
        ? html`<div class="no-results">No se encontraron tareas con estos filtros.</div>`
        : html`
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Tarea</th>
                  <th>Materia</th>
                  <th class="col-tipo">Tipo</th>
                  <th class="col-estado">Estado</th>
                  <th>Prioridad</th>
                  <th class="col-fecha">Fecha límite</th>
                  <th class="col-oblig"></th>
                </tr>
              </thead>
              <tbody>
                ${filtered.map((t) => {
                  const mat = matMap.get(t.materiaId);
                  const tipo = tipoMap.get(t.tipo);
                  return html`
                    <tr @click=${() => this._openTask(t.id)}>
                      <td class="cell-titulo ${t.estado === "completada" ? "done" : ""}">${t.titulo}</td>
                      <td>
                        ${mat
                          ? html`<span class="materia-dot" style="background:${mat.color}"></span>${mat.nombre}`
                          : html`<span style="color:var(--text3)">—</span>`}
                      </td>
                      <td class="col-tipo">${tipo ? html`${tipo.icono} ${tipo.nombre}` : "—"}</td>
                      <td class="col-estado">
                        <span class="badge badge-estado">
                          <span class="estado-dot" style="background:${ESTADO_DOT[t.estado]}"></span>
                          ${ESTADO_LABEL[t.estado]}
                        </span>
                      </td>
                      <td>${PRIO_ICON[t.prioridad] ?? ""} ${t.prioridad}</td>
                      <td class="${this._fechaClass(t.fechaLimite)} col-fecha">${this._formatFecha(t.fechaLimite)}</td>
                      <td class="col-oblig cell-oblig">${t.obligatorio ? "⚡" : ""}</td>
                    </tr>
                  `;
                })}
              </tbody>
            </table>
          </div>
        `}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "backlog-view": BacklogView;
  }
}
