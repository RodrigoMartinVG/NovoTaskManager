import { PreactSignalWatcher } from "../../shared/preact-signal-watcher.js";
import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import {
  addMateria,
  deleteMateria,
  materias,
  plannerData,
  updateMateria,
} from "../../../state/store.js";

const COLOR_PRESETS = [
  "#6366f1",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

@customElement("config-tab-materias")
export class ConfigTabMaterias extends PreactSignalWatcher(LitElement) {
  @state() private newNombre = "";
  @state() private newColor = COLOR_PRESETS[0];
  @state() private newHoras = 4;
  @state() private editingId: string | null = null;
  @state() private editNombre = "";
  @state() private editColor = "";
  @state() private editHoras = 0;

  static styles = css`
    :host { display: block; }

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
      font-size: var(--text-sm, 0.8125rem);
      margin: 0;
    }

    /* ── List ── */
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
      transition: background 0.12s;
    }
    .row:hover {
      background: var(--bg3);
    }

    .dot {
      width: 0.875rem;
      height: 0.875rem;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .row-name {
      flex: 1;
      font-size: var(--text-sm, 0.8125rem);
      font-weight: 500;
      color: var(--text0);
    }

    .row-horas {
      font-size: var(--text-xs, 0.75rem);
      color: var(--text2);
      white-space: nowrap;
    }

    .row-btn {
      background: transparent;
      border: none;
      cursor: pointer;
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      color: var(--text2);
      transition: all 0.12s;
    }
    .row-btn:hover {
      background: var(--bg1);
      color: var(--text0);
    }
    .row-btn.del:hover {
      color: var(--err-text, #ef4444);
    }

    /* ── Edit row ── */
    .edit-row {
      display: flex;
      align-items: center;
      gap: var(--space-2, 0.5rem);
      padding: var(--space-2, 0.5rem) var(--space-3, 0.75rem);
      border-radius: 0.5rem;
      background: var(--bg3);
      border: 1px solid var(--accent);
    }

    /* ── Add form ── */
    .add-form {
      display: flex;
      align-items: center;
      gap: var(--space-2, 0.5rem);
      padding: var(--space-3, 0.75rem);
      border-radius: 0.5rem;
      background: var(--bg2);
      border: 1px dashed var(--border2);
    }

    .add-label {
      font-size: var(--text-xs, 0.75rem);
      color: var(--text3);
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-bottom: var(--space-2, 0.5rem);
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
      transition: border-color 0.12s;
    }
    input[type="text"]:focus {
      border-color: var(--accent);
    }
    input[type="text"].name-input {
      flex: 1;
      min-width: 0;
    }

    input[type="color"] {
      width: 2rem;
      height: 2rem;
      border: 1px solid var(--border);
      border-radius: 0.375rem;
      padding: 0.125rem;
      cursor: pointer;
      background: var(--bg1);
    }

    input[type="number"] {
      background: var(--bg1);
      border: 1px solid var(--border);
      border-radius: 0.375rem;
      color: var(--text0);
      font-family: inherit;
      font-size: var(--text-sm, 0.8125rem);
      padding: 0.375rem 0.5rem;
      width: 3.5rem;
      outline: none;
      transition: border-color 0.12s;
    }
    input[type="number"]:focus {
      border-color: var(--accent);
    }

    .color-presets {
      display: flex;
      gap: 0.25rem;
    }
    .color-chip {
      width: 1.25rem;
      height: 1.25rem;
      border-radius: 50%;
      border: 2px solid transparent;
      cursor: pointer;
      transition: all 0.12s;
    }
    .color-chip:hover {
      transform: scale(1.15);
    }
    .color-chip[data-active] {
      border-color: var(--text0);
    }

    .btn-primary {
      background: var(--accent);
      color: #fff;
      border: none;
      border-radius: 0.375rem;
      padding: 0.375rem 0.75rem;
      font-family: inherit;
      font-size: var(--text-sm, 0.8125rem);
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.12s;
      white-space: nowrap;
    }
    .btn-primary:hover { opacity: 0.85; }
    .btn-primary:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: var(--bg1);
      color: var(--text1);
      border: 1px solid var(--border);
      border-radius: 0.375rem;
      padding: 0.375rem 0.75rem;
      font-family: inherit;
      font-size: var(--text-sm, 0.8125rem);
      cursor: pointer;
      transition: all 0.12s;
      white-space: nowrap;
    }
    .btn-secondary:hover {
      background: var(--bg2);
      color: var(--text0);
    }

    .horas-label {
      font-size: var(--text-xs, 0.75rem);
      color: var(--text2);
      white-space: nowrap;
    }

    .warning {
      font-size: var(--text-xs, 0.75rem);
      color: var(--err-text, #ef4444);
      margin-top: var(--space-1, 0.25rem);
    }
  `;

  private _startEdit(m: { id: string; nombre: string; color: string; horasSemanalesMin?: number }) {
    this.editingId = m.id;
    this.editNombre = m.nombre;
    this.editColor = m.color;
    this.editHoras = m.horasSemanalesMin ?? 0;
  }

  private _cancelEdit() {
    this.editingId = null;
  }

  private _saveEdit() {
    if (!this.editingId || !this.editNombre.trim()) return;
    updateMateria(this.editingId, {
      nombre: this.editNombre.trim(),
      color: this.editColor,
      horasSemanalesMin: this.editHoras || undefined,
    });
    this.editingId = null;
  }

  private _add() {
    if (!this.newNombre.trim()) return;
    addMateria({
      id: crypto.randomUUID(),
      nombre: this.newNombre.trim(),
      color: this.newColor,
      horasSemanalesMin: this.newHoras || undefined,
      activa: true,
    });
    this.newNombre = "";
    this.newColor = COLOR_PRESETS[materias.value.length % COLOR_PRESETS.length];
    this.newHoras = 4;
  }

  private _delete(id: string) {
    const tareasCount = plannerData.value.tareas.filter((t) => t.materiaId === id).length;
    if (tareasCount > 0) {
      if (
        !confirm(
          `Esta materia tiene ${tareasCount} tarea(s) asociada(s). ¿Eliminar de todas formas?`,
        )
      )
        return;
    }
    deleteMateria(id);
    this.requestUpdate();
  }

  private _onAddKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter") this._add();
  }

  render() {
    const items = materias.value;

    if (items.length === 0) {
      return html`
        <div class="empty">
          <div class="empty-icon">🎓</div>
          <p class="empty-title">Creá tu primera materia</p>
          <p class="empty-desc">Las materias son la base de todo: tareas, sesiones y la grilla semanal.</p>
        </div>
        ${this._renderAddForm()}
      `;
    }

    return html`
      <div class="list">
        ${items.map((m) => (this.editingId === m.id ? this._renderEditRow() : this._renderRow(m)))}
      </div>
      ${this._renderAddForm()}
    `;
  }

  private _renderRow(m: { id: string; nombre: string; color: string; horasSemanalesMin?: number }) {
    return html`
      <div class="row">
        <span class="dot" style="background:${m.color}"></span>
        <span class="row-name">${m.nombre}</span>
        ${m.horasSemanalesMin ? html`<span class="row-horas">${m.horasSemanalesMin}h/sem</span>` : null}
        <button class="row-btn" @click=${() => this._startEdit(m)} aria-label="Editar ${m.nombre}">✏️</button>
        <button class="row-btn del" @click=${() => this._delete(m.id)} aria-label="Eliminar ${m.nombre}">🗑</button>
      </div>
    `;
  }

  private _renderEditRow() {
    return html`
      <div class="edit-row">
        <input
          type="color"
          .value=${this.editColor}
          @input=${(e: Event) => {
            this.editColor = (e.target as HTMLInputElement).value;
          }}
          aria-label="Color de materia"
        />
        <input
          type="text"
          class="name-input"
          .value=${this.editNombre}
          @input=${(e: Event) => {
            this.editNombre = (e.target as HTMLInputElement).value;
          }}
          aria-label="Nombre de materia"
        />
        <span class="horas-label">h/sem</span>
        <input
          type="number"
          min="0"
          max="40"
          .value=${String(this.editHoras)}
          @input=${(e: Event) => {
            this.editHoras = Number.parseInt((e.target as HTMLInputElement).value) || 0;
          }}
          aria-label="Horas semanales"
        />
        <button class="btn-primary" @click=${this._saveEdit} ?disabled=${!this.editNombre.trim()}>Guardar</button>
        <button class="btn-secondary" @click=${this._cancelEdit}>Cancelar</button>
      </div>
    `;
  }

  private _renderAddForm() {
    return html`
      <div>
        <div class="add-label">Agregar materia</div>
        <div class="add-form">
          <input
            type="color"
            .value=${this.newColor}
            @input=${(e: Event) => {
              this.newColor = (e.target as HTMLInputElement).value;
            }}
            aria-label="Color"
          />
          <div class="color-presets">
            ${COLOR_PRESETS.map(
              (c) => html`
              <button
                class="color-chip"
                style="background:${c}"
                ?data-active=${this.newColor === c}
                @click=${() => {
                  this.newColor = c;
                }}
                aria-label="Color ${c}"
              ></button>
            `,
            )}
          </div>
          <input
            type="text"
            class="name-input"
            placeholder="Nombre de materia"
            .value=${this.newNombre}
            @input=${(e: Event) => {
              this.newNombre = (e.target as HTMLInputElement).value;
            }}
            @keydown=${this._onAddKeyDown}
            aria-label="Nombre de materia"
          />
          <span class="horas-label">h/sem</span>
          <input
            type="number"
            min="0"
            max="40"
            .value=${String(this.newHoras)}
            @input=${(e: Event) => {
              this.newHoras = Number.parseInt((e.target as HTMLInputElement).value) || 0;
            }}
            aria-label="Horas semanales"
          />
          <button class="btn-primary" @click=${this._add} ?disabled=${!this.newNombre.trim()}>Agregar</button>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "config-tab-materias": ConfigTabMaterias;
  }
}
