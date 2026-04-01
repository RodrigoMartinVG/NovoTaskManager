import { PreactSignalWatcher } from "../shared/preact-signal-watcher.js";
import { LitElement, css, html, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import type { ChecklistItem, EstadoTarea, Prioridad, Tarea } from "../../state/types.js";
import {
  addTarea,
  deleteTarea,
  materias,
  plannerData,
  updateTarea,
} from "../../state/store.js";
import { editingTaskId, newTaskMateriaId, taskReturnView } from "../../state/navigation.js";
import type { ViewId } from "../shell/nav-bar.js";
import { TIME_OPTIONS } from "../../utils/time-fmt.js";
import "../shared/tag-picker.js";
import "./task-generator-dialog.js";
import type { Tarea as TareaType } from "../../state/types.js";

const uid = () => crypto.randomUUID();

@customElement("task-view")
export class TaskView extends PreactSignalWatcher(LitElement) {
  // ── Form state ──
  @state() private titulo = "";
  @state() private materiaId = "";
  @state() private tipo = "";
  @state() private estado: EstadoTarea = "pendiente";
  @state() private prioridad: Prioridad = "media";
  @state() private fechaInicio = "";
  @state() private fechaLimite = "";
  @state() private horaLimite = "";
  @state() private obligatorio = false;
  @state() private descripcion = "";
  @state() private link = "";
  @state() private items: ChecklistItem[] = [];
  @state() private tagIds: string[] = [];

  @state() private confirmDelete = false;
  @state() private newCheckText = "";
  @state() private showGenerator = false;

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
    .back-btn:hover {
      background: var(--bg2);
      color: var(--text0);
    }
    .hdr-title {
      font-size: var(--text-xl);
      font-weight: 700;
      color: var(--text0);
      margin: 0;
    }

    /* ── Form layout ── */
    .form {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--space-5, 1.5rem);
    }
    @media (min-width: 52em) {
      .form {
        grid-template-columns: 1fr 20rem;
        gap: var(--space-6, 2rem);
      }
    }

    /* ── Sections ── */
    .section {
      display: flex;
      flex-direction: column;
      gap: var(--space-4, 1rem);
    }

    /* ── Field groups ── */
    .field {
      display: flex;
      flex-direction: column;
      gap: var(--space-1, 0.25rem);
    }
    .field label {
      font-size: var(--text-xs);
      font-weight: 600;
      color: var(--text2);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .field input[type="text"],
    .field input[type="url"],
    .field input[type="date"],
    .field select,
    .field textarea {
      font: inherit;
      font-size: var(--text-sm);
      background: var(--bg0);
      color: var(--text0);
      border: 1px solid var(--border);
      border-radius: 0.375rem;
      padding: 0.5rem 0.625rem;
      transition: border-color 0.16s;
    }
    .field input:focus,
    .field select:focus,
    .field textarea:focus {
      outline: none;
      border-color: var(--accent);
    }
    .field textarea {
      resize: vertical;
      min-height: 5rem;
    }

    /* ── Titulo input (bigger) ── */
    .titulo-input {
      font-size: var(--text-lg) !important;
      font-weight: 600;
      padding: 0.625rem 0.75rem !important;
    }

    /* ── Inline row ── */
    .inline-row {
      display: flex;
      gap: var(--space-3, 0.75rem);
      flex-wrap: wrap;
    }
    .inline-row .field {
      flex: 1;
      min-width: 8rem;
    }

    /* ── Checkbox ── */
    .checkbox-row {
      display: flex;
      align-items: center;
      gap: var(--space-2, 0.5rem);
    }
    .checkbox-row input[type="checkbox"] {
      width: 1rem;
      height: 1rem;
      accent-color: var(--accent);
    }
    .checkbox-row span {
      font-size: var(--text-sm);
      color: var(--text1);
    }

    /* ── Sidebar card ── */
    .sidebar-card {
      background: var(--bg1);
      border: 1px solid var(--border);
      border-radius: 0.5rem;
      padding: var(--space-4, 1rem);
      display: flex;
      flex-direction: column;
      gap: var(--space-4, 1rem);
    }

    /* ── Checklist ── */
    .checklist-title {
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--text1);
      margin: 0;
    }
    .checklist-items {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: var(--space-2, 0.5rem);
    }
    .ck-item {
      display: flex;
      align-items: center;
      gap: var(--space-2, 0.5rem);
    }
    .ck-item input[type="checkbox"] {
      width: 0.875rem;
      height: 0.875rem;
      accent-color: var(--accent);
      flex-shrink: 0;
    }
    .ck-item input[type="text"] {
      flex: 1;
      background: transparent;
      border: none;
      border-bottom: 1px solid var(--border);
      color: var(--text0);
      font: inherit;
      font-size: var(--text-sm);
      padding: 0.25rem 0;
    }
    .ck-item input[type="text"]:focus {
      outline: none;
      border-color: var(--accent);
    }
    .ck-item .ck-done {
      text-decoration: line-through;
      color: var(--text3);
    }
    .ck-del {
      background: none;
      border: none;
      color: var(--text3);
      cursor: pointer;
      font-size: 0.75rem;
      padding: 0.125rem 0.25rem;
      border-radius: 0.25rem;
      flex-shrink: 0;
    }
    .ck-del:hover { color: var(--err-text); }

    .ck-add-row {
      display: flex;
      gap: var(--space-2, 0.5rem);
    }
    .ck-add-row input {
      flex: 1;
      background: var(--bg0);
      border: 1px solid var(--border);
      color: var(--text0);
      font: inherit;
      font-size: var(--text-sm);
      padding: 0.375rem 0.5rem;
      border-radius: 0.375rem;
    }
    .ck-add-row input:focus {
      outline: none;
      border-color: var(--accent);
    }
    .ck-add-btn {
      background: var(--bg2);
      border: 1px solid var(--border);
      color: var(--text1);
      padding: 0.375rem 0.625rem;
      border-radius: 0.375rem;
      cursor: pointer;
      font: inherit;
      font-size: var(--text-xs);
      font-weight: 600;
    }
    .ck-add-btn:hover { background: var(--bg3); }

    /* ── Actions bar ── */
    .actions {
      display: flex;
      gap: var(--space-3, 0.75rem);
      padding-top: var(--space-4, 1rem);
      border-top: 1px solid var(--border);
      flex-wrap: wrap;
    }

    .btn-primary {
      background: var(--accent);
      color: #fff;
      border: none;
      padding: 0.5rem 1.25rem;
      border-radius: 0.375rem;
      font: inherit;
      font-size: var(--text-sm);
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.16s;
    }
    .btn-primary:hover { opacity: 0.9; }
    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: transparent;
      border: 1px solid var(--border);
      color: var(--text1);
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      font: inherit;
      font-size: var(--text-sm);
      cursor: pointer;
      transition: all 0.16s;
    }
    .btn-secondary:hover {
      background: var(--bg2);
      color: var(--text0);
    }

    .btn-danger {
      background: transparent;
      border: 1px solid var(--err-border, #c06060);
      color: var(--err-text, #8c2018);
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      font: inherit;
      font-size: var(--text-sm);
      cursor: pointer;
      margin-left: auto;
      transition: all 0.16s;
    }
    .btn-danger:hover {
      background: var(--err-bg);
    }

    /* ── materia color dot ── */
    .materia-dot {
      display: inline-block;
      width: 0.625rem;
      height: 0.625rem;
      border-radius: 50%;
      vertical-align: middle;
      margin-right: 0.375rem;
    }

    /* ── Delete confirm ── */
    .del-confirm {
      display: flex;
      align-items: center;
      gap: var(--space-2, 0.5rem);
      margin-left: auto;
    }
    .del-confirm span {
      font-size: var(--text-xs);
      color: var(--err-text);
    }
  `;

  willUpdate() {
    const taskId = editingTaskId.value;
    if (this._initialized) return;
    this._initialized = true;

    if (taskId === "new" && newTaskMateriaId.value) {
      this.materiaId = newTaskMateriaId.value;
      newTaskMateriaId.value = "";
    } else if (taskId && taskId !== "new") {
      const tarea = plannerData.value.tareas.find((t) => t.id === taskId);
      if (tarea) {
        this.titulo = tarea.titulo;
        this.materiaId = tarea.materiaId;
        this.tipo = tarea.tipo;
        this.estado = tarea.estado;
        this.prioridad = tarea.prioridad;
        this.fechaInicio = tarea.fechaInicio ?? "";
        this.fechaLimite = tarea.fechaLimite ?? "";
        this.horaLimite = tarea.horaLimite ?? "";
        this.obligatorio = tarea.obligatorio;
        this.descripcion = tarea.descripcion ?? "";
        this.link = tarea.link ?? "";
        this.items = tarea.items.map((i) => ({ ...i }));
        this.tagIds = tarea.tags ? [...tarea.tags] : [];
      }
    }
  }

  private get _isNew() {
    return editingTaskId.value === "new";
  }

  private _goBack() {
    this._initialized = false;
    editingTaskId.value = null;
    this.dispatchEvent(
      new CustomEvent<ViewId>("view-change", {
        detail: taskReturnView.value as ViewId,
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _save() {
    if (!this.titulo.trim()) return;

    const data: Tarea = {
      id: this._isNew ? uid() : (editingTaskId.value as string),
      titulo: this.titulo.trim(),
      materiaId: this.materiaId,
      tipo: this.tipo,
      estado: this.estado,
      prioridad: this.prioridad,
      fechaInicio: this.fechaInicio || undefined,
      fechaLimite: this.fechaLimite || undefined,
      horaLimite: this.horaLimite || undefined,
      obligatorio: this.obligatorio,
      descripcion: this.descripcion.trim() || undefined,
      link: this.link.trim() || undefined,
      items: this.items,
      tags: this.tagIds.length > 0 ? this.tagIds : undefined,
    };

    if (this._isNew) {
      addTarea(data);
    } else {
      updateTarea(data.id, data);
    }

    this._goBack();
  }

  private _delete() {
    if (!this.confirmDelete) {
      this.confirmDelete = true;
      return;
    }
    deleteTarea(editingTaskId.value as string);
    this._goBack();
  }

  // ── Checklist helpers ──
  private _addCheckItem() {
    const text = this.newCheckText.trim();
    if (!text) return;
    this.items = [...this.items, { id: uid(), texto: text, hecho: false }];
    this.newCheckText = "";
  }

  private _toggleCheckItem(id: string) {
    this.items = this.items.map((i) => (i.id === id ? { ...i, hecho: !i.hecho } : i));
  }

  private _updateCheckText(id: string, texto: string) {
    this.items = this.items.map((i) => (i.id === id ? { ...i, texto } : i));
  }

  private _removeCheckItem(id: string) {
    this.items = this.items.filter((i) => i.id !== id);
  }

  render() {
    const mats = materias.value;
    const tipos = plannerData.value.tipos;

    return html`
      <!-- Header -->
      <div class="hdr">
        <button class="back-btn" @click=${this._goBack} aria-label="Volver">
          ← Volver
        </button>
        <h1 class="hdr-title">${this._isNew ? "Nueva tarea" : "Editar tarea"}</h1>
      </div>

      <!-- Form -->
      <div class="form">
        <!-- Main column -->
        <div class="section">
          <div class="field">
            <label for="task-titulo">Título</label>
            <input
              id="task-titulo"
              class="titulo-input"
              type="text"
              placeholder="¿Qué hay que hacer?"
              .value=${this.titulo}
              @input=${(e: InputEvent) => { this.titulo = (e.target as HTMLInputElement).value; }}
            />
          </div>

          <div class="field">
            <label for="task-desc">Descripción</label>
            <textarea
              id="task-desc"
              placeholder="Notas, consignas, detalles..."
              .value=${this.descripcion}
              @input=${(e: InputEvent) => { this.descripcion = (e.target as HTMLTextAreaElement).value; }}
            ></textarea>
          </div>

          <div class="field">
            <label for="task-link">Link</label>
            <input
              id="task-link"
              type="url"
              placeholder="https://..."
              .value=${this.link}
              @input=${(e: InputEvent) => { this.link = (e.target as HTMLInputElement).value; }}
            />
          </div>

          <!-- Checklist -->
          <div class="field">
            <p class="checklist-title">Checklist</p>
            ${this.items.length > 0
              ? html`
                <ul class="checklist-items">
                  ${this.items.map(
                    (item) => html`
                      <li class="ck-item">
                        <input
                          type="checkbox"
                          .checked=${item.hecho}
                          @change=${() => this._toggleCheckItem(item.id)}
                          aria-label="Marcar ${item.texto}"
                        />
                        <input
                          type="text"
                          class=${item.hecho ? "ck-done" : ""}
                          .value=${item.texto}
                          @input=${(e: InputEvent) =>
                            this._updateCheckText(item.id, (e.target as HTMLInputElement).value)}
                        />
                        <button class="ck-del" @click=${() => this._removeCheckItem(item.id)} aria-label="Eliminar item">✕</button>
                      </li>
                    `,
                  )}
                </ul>
              `
              : nothing}
            <div class="ck-add-row">
              <input
                type="text"
                placeholder="Nuevo item..."
                .value=${this.newCheckText}
                @input=${(e: InputEvent) => { this.newCheckText = (e.target as HTMLInputElement).value; }}
                @keydown=${(e: KeyboardEvent) => { if (e.key === "Enter") this._addCheckItem(); }}
              />
              <button class="ck-add-btn" @click=${this._addCheckItem}>+ Agregar</button>
            </div>
          </div>

          <!-- Actions -->
          <div class="actions">
            <button
              class="btn-primary"
              @click=${this._save}
              ?disabled=${!this.titulo.trim()}
            >
              ${this._isNew ? "Crear tarea" : "Guardar cambios"}
            </button>
            <button class="btn-secondary" @click=${this._goBack}>Cancelar</button>

            ${!this._isNew
              ? html`<button class="btn-secondary" @click=${() => { this.showGenerator = true; }}>🔁 Generar serie</button>`
              : nothing}

            ${!this._isNew
              ? this.confirmDelete
                ? html`
                  <div class="del-confirm">
                    <span>¿Seguro?</span>
                    <button class="btn-danger" @click=${this._delete}>Sí, eliminar</button>
                    <button class="btn-secondary" @click=${() => { this.confirmDelete = false; }}>No</button>
                  </div>
                `
                : html`<button class="btn-danger" @click=${this._delete}>Eliminar</button>`
              : nothing}
          </div>

          ${this.showGenerator ? html`
            <task-generator-dialog
              .base=${{ 
                id: editingTaskId.value ?? "",
                titulo: this.titulo,
                materiaId: this.materiaId,
                tipo: this.tipo,
                estado: this.estado,
                prioridad: this.prioridad,
                fechaInicio: this.fechaInicio || undefined,
                fechaLimite: this.fechaLimite || undefined,
                horaLimite: this.horaLimite || undefined,
                obligatorio: this.obligatorio,
                descripcion: this.descripcion.trim() || undefined,
                link: this.link.trim() || undefined,
                items: this.items,
                tags: this.tagIds.length > 0 ? this.tagIds : undefined,
              } as TareaType}
              @close=${() => { this.showGenerator = false; }}
            ></task-generator-dialog>
          ` : nothing}
        </div>

        <!-- Sidebar -->
        <div class="section">
          <div class="sidebar-card">
            <div class="field">
              <label for="task-materia">Materia</label>
              <select
                id="task-materia"
                .value=${this.materiaId}
                @change=${(e: Event) => { this.materiaId = (e.target as HTMLSelectElement).value; }}
              >
                <option value="">Sin materia</option>
                ${mats.map(
                  (m) => html`
                    <option value=${m.id} ?selected=${m.id === this.materiaId}>
                      ${m.nombre}
                    </option>
                  `,
                )}
              </select>
            </div>

            <div class="field">
              <label for="task-tipo">Tipo</label>
              <select
                id="task-tipo"
                .value=${this.tipo}
                @change=${(e: Event) => { this.tipo = (e.target as HTMLSelectElement).value; }}
              >
                <option value="">Sin tipo</option>
                ${tipos.map(
                  (t) => html`
                    <option value=${t.id} ?selected=${t.id === this.tipo}>
                      ${t.icono} ${t.nombre}
                    </option>
                  `,
                )}
              </select>
            </div>

            <div class="inline-row">
              <div class="field">
                <label for="task-estado">Estado</label>
                <select
                  id="task-estado"
                  .value=${this.estado}
                  @change=${(e: Event) => { this.estado = (e.target as HTMLSelectElement).value as EstadoTarea; }}
                >
                  <option value="pendiente" ?selected=${this.estado === "pendiente"}>Pendiente</option>
                  <option value="en_progreso" ?selected=${this.estado === "en_progreso"}>En progreso</option>
                  <option value="completada" ?selected=${this.estado === "completada"}>Completada</option>
                </select>
              </div>

              <div class="field">
                <label for="task-prio">Prioridad</label>
                <select
                  id="task-prio"
                  .value=${this.prioridad}
                  @change=${(e: Event) => { this.prioridad = (e.target as HTMLSelectElement).value as Prioridad; }}
                >
                  <option value="alta" ?selected=${this.prioridad === "alta"}>🔴 Alta</option>
                  <option value="media" ?selected=${this.prioridad === "media"}>🟡 Media</option>
                  <option value="baja" ?selected=${this.prioridad === "baja"}>🟢 Baja</option>
                </select>
              </div>
            </div>

            <div class="inline-row">
              <div class="field">
                <label for="task-inicio">Fecha inicio</label>
                <input
                  id="task-inicio"
                  type="date"
                  .value=${this.fechaInicio}
                  @input=${(e: InputEvent) => { this.fechaInicio = (e.target as HTMLInputElement).value; }}
                />
              </div>
              <div class="field">
                <label for="task-limite">Fecha límite</label>
                <input
                  id="task-limite"
                  type="date"
                  .value=${this.fechaLimite}
                  @input=${(e: InputEvent) => { this.fechaLimite = (e.target as HTMLInputElement).value; }}
                />
              </div>
            </div>

            <div class="inline-row">
              <div class="field">
                <label for="task-hora">Hora límite</label>
                <select
                  id="task-hora"
                  @change=${(e: Event) => { this.horaLimite = (e.target as HTMLSelectElement).value; }}
                >
                  <option value="" ?selected=${!this.horaLimite}>—</option>
                  ${TIME_OPTIONS.map((t) => html`<option value=${t} ?selected=${t === this.horaLimite}>${t}</option>`)}
                </select>
              </div>
              <div class="field" style="justify-content: flex-end;">
                <div class="checkbox-row">
                  <input
                    id="task-oblig"
                    type="checkbox"
                    .checked=${this.obligatorio}
                    @change=${(e: Event) => { this.obligatorio = (e.target as HTMLInputElement).checked; }}
                  />
                  <span>Obligatoria</span>
                </div>
              </div>
            </div>
          </div>

            <div class="field">
              <label>Tags</label>
              <tag-picker
                .selected=${this.tagIds}
                @tags-changed=${(e: CustomEvent<string[]>) => { this.tagIds = e.detail; }}
              ></tag-picker>
            </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "task-view": TaskView;
  }
}
