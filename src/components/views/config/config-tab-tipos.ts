import { PreactSignalWatcher } from "../../shared/preact-signal-watcher.js";
import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { addTipo, deleteTipo, plannerData, updateTipo } from "../../../state/store.js";

const EMOJI_GRID = [
  // Escritura & documentos
  "📝", "📋", "📖", "📚", "📓", "📕", "📑", "🖊", "✏️", "📎",
  // Ciencia & tecnología
  "🔬", "🧪", "💻", "📊", "📐", "🧮", "⚗️", "🔭", "🧬", "💾",
  // Ideas & creatividad
  "💡", "🧠", "🎨", "🎯", "🏆", "⚡", "🔍", "🧩", "🎓", "🌟",
  // Organización & tiempo
  "📌", "🗂", "📅", "⏰", "🔔", "📢", "🗓", "📮", "🏷", "✅",
  // Actividades & varios
  "🎲", "🎵", "🌍", "⚖️", "🏛", "💬", "🤝", "🏃", "☕", "🔧",
];

@customElement("config-tab-tipos")
export class ConfigTabTipos extends PreactSignalWatcher(LitElement) {
  @state() private newNombre = "";
  @state() private newIcono = "📝";
  @state() private emojiOpen = false;
  @state() private editingId: string | null = null;
  @state() private editNombre = "";
  @state() private editIcono = "";
  @state() private editEmojiOpen = false;

  static styles = css`
    :host { display: block; }

    .empty {
      text-align: center;
      padding: var(--space-8, 3rem) var(--space-4, 1rem);
      color: var(--text2);
    }
    .empty-icon { font-size: 2.5rem; margin-bottom: var(--space-3, 0.75rem); }
    .empty-title { font-size: 1rem; font-weight: 600; color: var(--text1); margin: 0 0 var(--space-2, 0.5rem); }
    .empty-desc { font-size: var(--text-sm, 0.8125rem); margin: 0; }

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
    .row:hover { background: var(--bg3); }

    .row-icon { font-size: 1.125rem; flex-shrink: 0; }
    .row-name {
      flex: 1;
      font-size: var(--text-sm, 0.8125rem);
      font-weight: 500;
      color: var(--text0);
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
    .row-btn:hover { background: var(--bg1); color: var(--text0); }
    .row-btn.del:hover { color: var(--err-text, #ef4444); }

    .edit-row {
      display: flex;
      align-items: center;
      gap: var(--space-2, 0.5rem);
      padding: var(--space-2, 0.5rem) var(--space-3, 0.75rem);
      border-radius: 0.5rem;
      background: var(--bg3);
      border: 1px solid var(--accent);
    }

    .add-label {
      font-size: var(--text-xs, 0.75rem);
      color: var(--text3);
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-bottom: var(--space-2, 0.5rem);
    }

    .add-form {
      display: flex;
      align-items: center;
      gap: var(--space-2, 0.5rem);
      padding: var(--space-3, 0.75rem);
      border-radius: 0.5rem;
      background: var(--bg2);
      border: 1px dashed var(--border2);
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
      flex: 1;
      min-width: 0;
    }
    input[type="text"]:focus { border-color: var(--accent); }

    /* ── Emoji picker ── */
    .emoji-trigger {
      position: relative;
    }
    .emoji-btn {
      width: 2.25rem;
      height: 2.25rem;
      border: 1px solid var(--border);
      border-radius: 0.375rem;
      background: var(--bg1);
      font-size: 1.125rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: border-color 0.12s;
    }
    .emoji-btn:hover { border-color: var(--border2); }

    .emoji-popover {
      position: absolute;
      top: calc(100% + 0.375rem);
      left: 0;
      width: 13rem;
      background: var(--bg1);
      border: 1px solid var(--border2);
      border-radius: 0.5rem;
      box-shadow: 0 8px 24px rgba(0,0,0,.15);
      z-index: var(--z-popover, 200);
      padding: 0.5rem;
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 0.25rem;
    }
    .emoji-option {
      width: 100%;
      aspect-ratio: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      border: none;
      background: transparent;
      border-radius: 0.25rem;
      cursor: pointer;
      transition: background 0.1s;
    }
    .emoji-option:hover { background: var(--bg2); }
    .emoji-option[data-active] { background: var(--bg3); }

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
    .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }

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
    .btn-secondary:hover { background: var(--bg2); color: var(--text0); }
  `;

  private _startEdit(t: { id: string; nombre: string; icono: string }) {
    this.editingId = t.id;
    this.editNombre = t.nombre;
    this.editIcono = t.icono;
    this.editEmojiOpen = false;
  }

  private _cancelEdit() {
    this.editingId = null;
    this.editEmojiOpen = false;
  }

  private _saveEdit() {
    if (!this.editingId || !this.editNombre.trim()) return;
    updateTipo(this.editingId, {
      nombre: this.editNombre.trim(),
      icono: this.editIcono,
    });
    this.editingId = null;
  }

  private _add() {
    if (!this.newNombre.trim()) return;
    addTipo({
      id: crypto.randomUUID(),
      nombre: this.newNombre.trim(),
      icono: this.newIcono,
      activo: true,
    });
    this.newNombre = "";
    this.emojiOpen = false;
  }

  private _delete(id: string) {
    const tareasCount = plannerData.value.tareas.filter((t) => t.tipo === id).length;
    if (tareasCount > 0) {
      if (
        !confirm(`Este tipo tiene ${tareasCount} tarea(s) asociada(s). ¿Eliminar de todas formas?`)
      )
        return;
    }
    deleteTipo(id);
    this.requestUpdate();
  }

  private _onAddKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter") this._add();
  }

  render() {
    const items = plannerData.value.tipos;

    if (items.length === 0) {
      return html`
        <div class="empty">
          <div class="empty-icon">📋</div>
          <p class="empty-title">Creá tu primer tipo de tarea</p>
          <p class="empty-desc">Ejemplos: TP, Parcial, Lectura, Trabajo práctico...</p>
        </div>
        ${this._renderAddForm()}
      `;
    }

    return html`
      <div class="list">
        ${items.map((t) => (this.editingId === t.id ? this._renderEditRow() : this._renderRow(t)))}
      </div>
      ${this._renderAddForm()}
    `;
  }

  private _renderRow(t: { id: string; nombre: string; icono: string }) {
    return html`
      <div class="row">
        <span class="row-icon">${t.icono}</span>
        <span class="row-name">${t.nombre}</span>
        <button class="row-btn" @click=${() => this._startEdit(t)} aria-label="Editar ${t.nombre}">✏️</button>
        <button class="row-btn del" @click=${() => this._delete(t.id)} aria-label="Eliminar ${t.nombre}">🗑</button>
      </div>
    `;
  }

  private _renderEditRow() {
    return html`
      <div class="edit-row">
        <div class="emoji-trigger">
          <button class="emoji-btn" @click=${() => {
            this.editEmojiOpen = !this.editEmojiOpen;
          }} aria-label="Elegir ícono">${this.editIcono}</button>
          ${
            this.editEmojiOpen
              ? html`
            <div class="emoji-popover">
              ${EMOJI_GRID.map(
                (e) => html`
                <button
                  class="emoji-option"
                  ?data-active=${this.editIcono === e}
                  @click=${() => {
                    this.editIcono = e;
                    this.editEmojiOpen = false;
                  }}
                >${e}</button>
              `,
              )}
            </div>
          `
              : null
          }
        </div>
        <input
          type="text"
          .value=${this.editNombre}
          @input=${(e: Event) => {
            this.editNombre = (e.target as HTMLInputElement).value;
          }}
          aria-label="Nombre del tipo"
        />
        <button class="btn-primary" @click=${this._saveEdit} ?disabled=${!this.editNombre.trim()}>Guardar</button>
        <button class="btn-secondary" @click=${this._cancelEdit}>Cancelar</button>
      </div>
    `;
  }

  private _renderAddForm() {
    return html`
      <div>
        <div class="add-label">Agregar tipo</div>
        <div class="add-form">
          <div class="emoji-trigger">
            <button class="emoji-btn" @click=${() => {
              this.emojiOpen = !this.emojiOpen;
            }} aria-label="Elegir ícono">${this.newIcono}</button>
            ${
              this.emojiOpen
                ? html`
              <div class="emoji-popover">
                ${EMOJI_GRID.map(
                  (e) => html`
                  <button
                    class="emoji-option"
                    ?data-active=${this.newIcono === e}
                    @click=${() => {
                      this.newIcono = e;
                      this.emojiOpen = false;
                    }}
                  >${e}</button>
                `,
                )}
              </div>
            `
                : null
            }
          </div>
          <input
            type="text"
            placeholder="Nombre del tipo"
            .value=${this.newNombre}
            @input=${(e: Event) => {
              this.newNombre = (e.target as HTMLInputElement).value;
            }}
            @keydown=${this._onAddKeyDown}
            aria-label="Nombre del tipo"
          />
          <button class="btn-primary" @click=${this._add} ?disabled=${!this.newNombre.trim()}>Agregar</button>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "config-tab-tipos": ConfigTabTipos;
  }
}
