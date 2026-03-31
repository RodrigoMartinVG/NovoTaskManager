import { SignalWatcher } from "@lit-labs/signals";
import { LitElement, css, html, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import type { FranjaDef, Materia, MateriaSlot, Periodo } from "../../state/types.js";
import {
  addMateria,
  deleteMateria,
  editingMateriaId,
  materiaReturnView,
  plannerData,
  updateMateria,
} from "../../state/store.js";
import type { ViewId } from "../shell/nav-bar.js";

/* ═══ Constants ═══ */
const COLOR_PRESETS = [
  "#6366f1", "#f59e0b", "#10b981", "#ef4444",
  "#8b5cf6", "#ec4899", "#14b8a6", "#f97316",
  "#3b82f6", "#84cc16", "#a855f7", "#f43f5e",
];
const DIA_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

/* ═══ Helpers ═══ */
function hasSlot(slots: MateriaSlot[], dia: number, franjaId: string): boolean {
  return slots.some((s) => s.dia === dia && s.franjaId === franjaId);
}

function toggleSlot(slots: MateriaSlot[], dia: number, franjaId: string): MateriaSlot[] {
  if (hasSlot(slots, dia, franjaId)) {
    return slots.filter((s) => !(s.dia === dia && s.franjaId === franjaId));
  }
  return [...slots, { dia, franjaId }];
}

function slotSummary(slots: MateriaSlot[], franjas: FranjaDef[]): string {
  if (slots.length === 0) return "Sin horarios asignados";
  const map = new Map<string, FranjaDef>();
  for (const f of franjas) map.set(f.id, f);

  let totalMins = 0;
  for (const s of slots) {
    const f = map.get(s.franjaId);
    if (f) totalMins += Math.max(0, f.horaFin - f.horaInicio);
  }
  const h = (totalMins / 60).toFixed(1);
  const days = new Set(slots.map((s) => s.dia)).size;
  return `${slots.length} slot${slots.length !== 1 ? "s" : ""} en ${days} día${days !== 1 ? "s" : ""} (≈${h}h/sem)`;
}

/* ═══ Component ═══ */
@customElement("materia-edit-view")
export class MateriaEditView extends SignalWatcher(LitElement) {
  @state() private nombre = "";
  @state() private color = COLOR_PRESETS[0];
  @state() private codigo = "";
  @state() private anio = "";
  @state() private periodo: Periodo | "" = "";
  @state() private horasMin: string = "";
  @state() private horasMax: string = "";
  @state() private slots: MateriaSlot[] = [];
  @state() private activa = true;

  @state() private confirmDelete = false;

  private _initialized = false;

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
      gap: var(--space-3, 0.75rem);
      margin-bottom: var(--space-5, 1.5rem);
    }
    .back-btn {
      background: transparent;
      border: 1px solid var(--border);
      color: var(--text2);
      padding: 0.375rem 0.75rem;
      border-radius: 0.375rem;
      cursor: pointer;
      font: inherit;
      font-size: var(--text-sm);
      transition: all 0.16s;
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
    }
    .back-btn:hover { background: var(--bg2); color: var(--text0); }
    .hdr-title {
      font-size: var(--text-xl); font-weight: 700; color: var(--text0); margin: 0;
    }

    /* ── Form layout (2-col on wide) ── */
    .form {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--space-5, 1.5rem);
    }
    @media (min-width: 52em) {
      .form {
        grid-template-columns: 1fr 22rem;
        gap: var(--space-6, 2rem);
      }
    }

    .section {
      display: flex;
      flex-direction: column;
      gap: var(--space-4, 1rem);
    }

    /* ── Field ── */
    .field {
      display: flex;
      flex-direction: column;
      gap: var(--space-1, 0.25rem);
    }
    .field label {
      font-size: var(--text-xs); font-weight: 600; color: var(--text2);
      text-transform: uppercase; letter-spacing: 0.04em;
    }
    .field input[type="text"],
    .field input[type="number"] {
      font: inherit; font-size: var(--text-sm);
      background: var(--bg0); color: var(--text0);
      border: 1px solid var(--border); border-radius: 0.375rem;
      padding: 0.5rem 0.625rem;
      transition: border-color 0.16s;
    }
    .field input:focus { outline: none; border-color: var(--accent); }
    .field select {
      font: inherit; font-size: var(--text-sm);
      background: var(--bg0); color: var(--text0);
      border: 1px solid var(--border); border-radius: 0.375rem;
      padding: 0.5rem 0.625rem;
      transition: border-color 0.16s;
    }
    .field select:focus { outline: none; border-color: var(--accent); }

    .nombre-input {
      font-size: var(--text-lg) !important;
      font-weight: 600;
      padding: 0.625rem 0.75rem !important;
    }

    .inline-row {
      display: flex; gap: var(--space-3, 0.75rem); flex-wrap: wrap;
    }
    .inline-row .field { flex: 1; min-width: 7rem; }

    .hint { font-size: var(--text-xs); color: var(--text3); margin: 0.25rem 0 0; }

    /* ── Sidebar card ── */
    .sidebar-card {
      background: var(--bg1); border: 1px solid var(--border);
      border-radius: 0.5rem; padding: var(--space-4, 1rem);
      display: flex; flex-direction: column;
      gap: var(--space-4, 1rem);
      align-self: start;
    }

    /* ── Color picker ── */
    .color-row {
      display: flex; align-items: center; gap: var(--space-3, 0.75rem);
    }
    .color-input {
      width: 2.5rem; height: 2.5rem;
      border: 1px solid var(--border); border-radius: 0.5rem;
      padding: 0.125rem; cursor: pointer; background: var(--bg0);
    }
    .color-presets {
      display: flex; flex-wrap: wrap; gap: 0.375rem;
    }
    .color-chip {
      width: 1.375rem; height: 1.375rem; border-radius: 50%;
      border: 2.5px solid transparent; cursor: pointer;
      transition: all 0.12s;
    }
    .color-chip:hover { transform: scale(1.15); }
    .color-chip[data-active] { border-color: var(--text0); }

    /* ── Materia dot with name preview ── */
    .preview-row {
      display: flex; align-items: center; gap: var(--space-2, 0.5rem);
      padding: var(--space-3, 0.75rem);
      background: var(--bg2); border-radius: 0.375rem;
    }
    .preview-dot {
      width: 0.875rem; height: 0.875rem; border-radius: 50%; flex-shrink: 0;
    }
    .preview-name {
      font-size: var(--text-sm); font-weight: 600; color: var(--text0);
    }

    /* ── Checkbox ── */
    .checkbox-row {
      display: flex; align-items: center; gap: var(--space-2, 0.5rem);
    }
    .checkbox-row input[type="checkbox"] {
      width: 1rem; height: 1rem; accent-color: var(--accent);
    }
    .checkbox-row span {
      font-size: var(--text-sm); color: var(--text1);
    }

    /* ── Section title ── */
    .section-title {
      font-size: var(--text-sm); font-weight: 600; color: var(--text1);
      margin: 0;
    }

    /* ── Slot grid ── */
    .slot-grid {
      display: grid;
      grid-template-columns: minmax(6rem, auto) repeat(7, 1fr);
      gap: 0.25rem;
      font-size: var(--text-xs);
    }
    .slot-grid .corner { }
    .slot-grid .day-hdr {
      text-align: center; font-weight: 600; color: var(--text2); padding: 0.25rem 0;
    }
    .slot-grid .franja-label {
      display: flex; align-items: center; gap: 0.375rem;
      padding-right: 0.5rem; color: var(--text2); white-space: nowrap;
    }
    .slot-cell {
      display: flex; align-items: center; justify-content: center;
    }
    .slot-cb {
      width: 1.375rem; height: 1.375rem; cursor: pointer;
      accent-color: var(--accent);
    }
    .slot-summary {
      font-size: var(--text-xs); color: var(--text3); margin-top: var(--space-2, 0.5rem);
    }
    .no-franjas {
      font-size: var(--text-sm); color: var(--text2); font-style: italic;
      padding: var(--space-3, 0.75rem);
      background: var(--bg2); border-radius: 0.375rem;
    }
    .no-franjas a {
      color: var(--accent); cursor: pointer; text-decoration: underline;
    }

    /* ── Actions bar ── */
    .actions {
      display: flex; gap: var(--space-3, 0.75rem);
      padding-top: var(--space-4, 1rem);
      border-top: 1px solid var(--border); flex-wrap: wrap;
    }
    .btn-primary {
      background: var(--accent); color: #fff; border: none;
      padding: 0.5rem 1.25rem; border-radius: 0.375rem;
      font: inherit; font-size: var(--text-sm); font-weight: 600;
      cursor: pointer; transition: opacity 0.16s;
    }
    .btn-primary:hover { opacity: 0.9; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

    .btn-secondary {
      background: transparent; border: 1px solid var(--border);
      color: var(--text1); padding: 0.5rem 1rem; border-radius: 0.375rem;
      font: inherit; font-size: var(--text-sm); cursor: pointer;
      transition: all 0.16s;
    }
    .btn-secondary:hover { background: var(--bg2); color: var(--text0); }

    .btn-danger {
      background: transparent; border: 1px solid var(--err-border, #c06060);
      color: var(--err-text, #8c2018); padding: 0.5rem 1rem;
      border-radius: 0.375rem; font: inherit; font-size: var(--text-sm);
      cursor: pointer; margin-left: auto; transition: all 0.16s;
    }
    .btn-danger:hover { background: var(--err-bg); }

    .del-confirm {
      display: flex; align-items: center; gap: var(--space-2, 0.5rem);
      margin-left: auto;
    }
    .del-confirm span {
      font-size: var(--text-xs); color: var(--err-text);
    }
  `;

  /* ── Lifecycle ── */
  willUpdate() {
    if (this._initialized) return;
    this._initialized = true;

    const id = editingMateriaId.value;
    if (id && id !== "new") {
      const mat = plannerData.value.materias.find((m) => m.id === id);
      if (mat) {
        this.nombre = mat.nombre;
        this.color = mat.color;
        this.codigo = mat.codigo ?? "";
        this.anio = mat.anio != null ? String(mat.anio) : "";
        this.periodo = mat.periodo ?? "";
        this.horasMin = mat.horasSemanalesMin != null ? String(mat.horasSemanalesMin) : "";
        this.horasMax = mat.horasSemanalesMax != null ? String(mat.horasSemanalesMax) : "";
        this.slots = mat.slots ? mat.slots.map((s) => ({ ...s })) : [];
        this.activa = mat.activa !== false;
      }
    }
  }

  private get _isNew() {
    return editingMateriaId.value === "new";
  }

  /* ── Navigation ── */
  private _goBack() {
    this._initialized = false;
    editingMateriaId.value = null;
    this.dispatchEvent(
      new CustomEvent<ViewId>("view-change", {
        detail: materiaReturnView.value as ViewId,
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _goToConfig() {
    this._initialized = false;
    editingMateriaId.value = null;
    this.dispatchEvent(
      new CustomEvent<ViewId>("view-change", {
        detail: "config",
        bubbles: true,
        composed: true,
      }),
    );
  }

  /* ── Save / Delete ── */
  private _save() {
    if (!this.nombre.trim()) return;

    const minVal = Number.parseFloat(this.horasMin);
    const maxVal = Number.parseFloat(this.horasMax);
    const anioVal = Number.parseInt(this.anio, 10);

    const patch: Partial<Materia> = {
      nombre: this.nombre.trim(),
      color: this.color,
      codigo: this.codigo.trim() || undefined,
      anio: anioVal > 0 ? anioVal : undefined,
      periodo: (this.periodo as Periodo) || undefined,
      horasSemanalesMin: minVal > 0 ? minVal : undefined,
      horasSemanalesMax: maxVal > 0 ? maxVal : undefined,
      slots: this.slots.length > 0 ? this.slots : undefined,
      activa: this.activa,
    };

    if (this._isNew) {
      addMateria({
        id: crypto.randomUUID(),
        ...patch,
      } as Materia);
    } else {
      updateMateria(editingMateriaId.value as string, patch);
    }

    this._goBack();
  }

  private _delete() {
    if (!this.confirmDelete) {
      this.confirmDelete = true;
      return;
    }
    const id = editingMateriaId.value;
    if (id && id !== "new") {
      deleteMateria(id);
    }
    this._goBack();
  }

  /* ── Slot toggle ── */
  private _toggleSlot(dia: number, franjaId: string) {
    this.slots = toggleSlot(this.slots, dia, franjaId);
  }

  /* ── Render ── */
  render() {
    const franjas = plannerData.value.franjas ?? [];
    const taskCount = this._isNew
      ? 0
      : plannerData.value.tareas.filter((t) => t.materiaId === editingMateriaId.value).length;

    return html`
      <div class="hdr">
        <button class="back-btn" @click=${this._goBack}>← Volver</button>
        <h1 class="hdr-title">${this._isNew ? "Nueva materia" : "Editar materia"}</h1>
      </div>

      <div class="form">
        <!-- Main column -->
        <div class="section">
          <!-- Name -->
          <div class="field">
            <label for="mat-nombre">Nombre</label>
            <input id="mat-nombre" type="text" class="nombre-input"
              placeholder="ej: Análisis Matemático"
              .value=${this.nombre}
              @input=${(e: Event) => { this.nombre = (e.target as HTMLInputElement).value; }}
            />
          </div>

          <!-- Código, Año, Periodo -->
          <div class="inline-row">
            <div class="field">
              <label for="mat-codigo">Código</label>
              <input id="mat-codigo" type="text"
                placeholder="ej: MAT-201"
                .value=${this.codigo}
                @input=${(e: Event) => { this.codigo = (e.target as HTMLInputElement).value; }}
              />
            </div>
            <div class="field">
              <label for="mat-anio">Año</label>
              <input id="mat-anio" type="number" min="1" max="10" step="1"
                placeholder="ej: 2"
                .value=${this.anio}
                @input=${(e: Event) => { this.anio = (e.target as HTMLInputElement).value; }}
              />
            </div>
            <div class="field">
              <label for="mat-periodo">Período</label>
              <select id="mat-periodo"
                .value=${this.periodo}
                @change=${(e: Event) => { this.periodo = (e.target as HTMLSelectElement).value as Periodo | ""; }}>
                <option value="">—</option>
                <option value="C1">Cuatrimestre 1</option>
                <option value="C2">Cuatrimestre 2</option>
                <option value="anual">Anual</option>
              </select>
            </div>
          </div>

          <!-- Objectives -->
          <h3 class="section-title">Objetivo semanal</h3>
          <div class="inline-row">
            <div class="field">
              <label for="mat-min">Horas mínimas</label>
              <input id="mat-min" type="number" min="0" max="40" step="0.5"
                placeholder="ej: 4"
                .value=${this.horasMin}
                @input=${(e: Event) => { this.horasMin = (e.target as HTMLInputElement).value; }}
              />
            </div>
            <div class="field">
              <label for="mat-max">Horas máximas</label>
              <input id="mat-max" type="number" min="0" max="40" step="0.5"
                placeholder="ej: 6"
                .value=${this.horasMax}
                @input=${(e: Event) => { this.horasMax = (e.target as HTMLInputElement).value; }}
              />
            </div>
          </div>
          <p class="hint">Definí cuántas horas querés dedicarle por semana. El progreso se calcula en base a los horarios asignados abajo.</p>

          <!-- Slot grid -->
          <h3 class="section-title">Horarios de estudio</h3>
          ${franjas.length > 0
            ? html`
              <div class="slot-grid">
                <div class="corner"></div>
                ${DIA_LABELS.map((d) => html`<div class="day-hdr">${d}</div>`)}
                ${franjas.map((f) => html`
                  <div class="franja-label">${f.emoji} ${f.nombre}</div>
                  ${DIA_LABELS.map((_, di) => html`
                    <div class="slot-cell">
                      <input type="checkbox" class="slot-cb"
                        ?checked=${hasSlot(this.slots, di, f.id)}
                        @change=${() => this._toggleSlot(di, f.id)}
                        aria-label="${f.nombre} ${DIA_LABELS[di]}" />
                    </div>
                  `)}
                `)}
              </div>
              <p class="slot-summary">${slotSummary(this.slots, franjas)}</p>
            `
            : html`
              <div class="no-franjas">
                No hay franjas horarias configuradas. <a @click=${this._goToConfig}>Configurar franjas →</a>
              </div>
            `}

          <!-- Actions -->
          <div class="actions">
            <button class="btn-primary" @click=${this._save} ?disabled=${!this.nombre.trim()}>
              ${this._isNew ? "Crear materia" : "Guardar cambios"}
            </button>
            <button class="btn-secondary" @click=${this._goBack}>Cancelar</button>

            ${!this._isNew
              ? this.confirmDelete
                ? html`
                  <div class="del-confirm">
                    <span>${taskCount > 0 ? `Tiene ${taskCount} tarea(s). ` : ""}¿Confirmar?</span>
                    <button class="btn-danger" @click=${this._delete}>Sí, eliminar</button>
                    <button class="btn-secondary" @click=${() => { this.confirmDelete = false; }}>No</button>
                  </div>
                `
                : html`<button class="btn-danger" @click=${this._delete}>Eliminar materia</button>`
              : nothing}
          </div>
        </div>

        <!-- Sidebar -->
        <div class="sidebar-card">
          <!-- Preview -->
          <div class="preview-row">
            <span class="preview-dot" style="background:${this.color}"></span>
            <div style="min-width:0">
              <span class="preview-name">${this.nombre || "Sin nombre"}</span>
              ${(this.codigo || this.anio || this.periodo) ? html`
                <div style="font-size:var(--text-xs);color:var(--text3);margin-top:0.125rem">
                  ${[this.codigo, this.anio ? `Año ${this.anio}` : "", this.periodo ? (this.periodo === "anual" ? "Anual" : this.periodo) : ""].filter(Boolean).join(" · ")}
                </div>
              ` : nothing}
            </div>
          </div>

          <!-- Color -->
          <div class="field">
            <label>Color</label>
            <div class="color-row">
              <input type="color" class="color-input"
                .value=${this.color}
                @input=${(e: Event) => { this.color = (e.target as HTMLInputElement).value; }}
                aria-label="Color de materia" />
              <div class="color-presets">
                ${COLOR_PRESETS.map((c) => html`
                  <button class="color-chip"
                    style="background:${c}"
                    ?data-active=${this.color === c}
                    @click=${() => { this.color = c; }}
                    aria-label="Color ${c}"></button>
                `)}
              </div>
            </div>
          </div>

          <!-- Active toggle -->
          <div class="checkbox-row">
            <input type="checkbox" id="mat-activa"
              .checked=${this.activa}
              @change=${(e: Event) => { this.activa = (e.target as HTMLInputElement).checked; }}
            />
            <span>Materia activa</span>
          </div>

          <!-- Info -->
          ${!this._isNew
            ? html`
              <div style="font-size:var(--text-xs);color:var(--text3);">
                ${taskCount} tarea${taskCount !== 1 ? "s" : ""} asociada${taskCount !== 1 ? "s" : ""}
              </div>
            `
            : nothing}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "materia-edit-view": MateriaEditView;
  }
}
