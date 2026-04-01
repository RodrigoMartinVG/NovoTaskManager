import { PreactSignalWatcher } from "../../shared/preact-signal-watcher.js";
import { LitElement, css, html, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import { addTag, deleteTag, plannerData, updateTag } from "../../../state/store.js";

const TAG_COLORS = [
  "#6366f1", "#8b5cf6", "#a855f7", "#ec4899",
  "#ef4444", "#f97316", "#f59e0b", "#84cc16",
  "#10b981", "#14b8a6", "#3b82f6", "#64748b",
];

@customElement("config-tab-tags")
export class ConfigTabTags extends PreactSignalWatcher(LitElement) {
  @state() private newNombre = "";
  @state() private newColor = TAG_COLORS[0];
  @state() private editingId: string | null = null;
  @state() private editNombre = "";
  @state() private editColor = "";

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

    .row-dot {
      width: 0.75rem;
      height: 0.75rem;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .row-name {
      flex: 1;
      font-size: var(--text-sm, 0.8125rem);
      font-weight: 500;
      color: var(--text0);
    }

    .row-stat {
      font-size: var(--text-xs, 0.75rem);
      color: var(--text3);
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
      gap: var(--space-2, 0.5rem);
      align-items: center;
    }

    input[type="text"] {
      font: inherit;
      font-size: var(--text-sm, 0.8125rem);
      background: var(--bg0);
      color: var(--text0);
      border: 1px solid var(--border);
      border-radius: 0.375rem;
      padding: 0.375rem 0.625rem;
      flex: 1;
      min-width: 0;
    }
    input[type="text"]:focus { outline: none; border-color: var(--accent); }

    .color-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;
    }

    .color-dot {
      width: 1.25rem;
      height: 1.25rem;
      border-radius: 50%;
      border: 2px solid transparent;
      cursor: pointer;
      transition: border-color 0.12s, transform 0.12s;
    }
    .color-dot:hover { transform: scale(1.15); }
    .color-dot[data-sel] { border-color: var(--text0); }

    .btn-add {
      background: var(--accent);
      color: #fff;
      border: none;
      border-radius: 0.375rem;
      padding: 0.375rem 0.75rem;
      font-family: inherit;
      font-size: var(--text-sm, 0.8125rem);
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
    }
    .btn-add:disabled { opacity: 0.4; cursor: default; }

    .btn-sm {
      background: transparent;
      border: 1px solid var(--border);
      border-radius: 0.25rem;
      padding: 0.25rem 0.5rem;
      font-size: 0.75rem;
      font-family: inherit;
      cursor: pointer;
      color: var(--text1);
    }
    .btn-sm:hover { background: var(--bg2); }
    .btn-sm.save { border-color: var(--accent); color: var(--accent); }

    .stats-section {
      margin-top: var(--space-5, 1.5rem);
      padding-top: var(--space-4, 1rem);
      border-top: 1px solid var(--border);
    }
    .stats-title {
      font-size: var(--text-sm, 0.8125rem);
      font-weight: 600;
      color: var(--text1);
      margin: 0 0 var(--space-3, 0.75rem);
    }
    .stats-grid {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2, 0.5rem);
    }
    .stat-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.25rem 0.625rem;
      border-radius: 999px;
      font-size: var(--text-xs, 0.75rem);
      font-weight: 500;
      color: var(--text0);
      background: var(--bg2);
    }
    .stat-dot {
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .stat-count {
      font-weight: 700;
      color: var(--text1);
    }
  `;

  private _countUsages(tagId: string): { tareas: number; sesiones: number; materias: number } {
    const d = plannerData.value;
    return {
      tareas: d.tareas.filter((t) => t.tags?.includes(tagId)).length,
      sesiones: d.sesiones.filter((s) => s.tags?.includes(tagId)).length,
      materias: d.materias.filter((m) => m.tags?.includes(tagId)).length,
    };
  }

  private _add() {
    const nombre = this.newNombre.trim();
    if (!nombre) return;
    addTag({ id: `tag-${Date.now()}`, nombre, color: this.newColor });
    this.newNombre = "";
    this.newColor = TAG_COLORS[0];
  }

  private _startEdit(id: string) {
    const tag = plannerData.value.tags?.find((t) => t.id === id);
    if (!tag) return;
    this.editingId = id;
    this.editNombre = tag.nombre;
    this.editColor = tag.color;
  }

  private _saveEdit() {
    if (!this.editingId || !this.editNombre.trim()) return;
    updateTag(this.editingId, { nombre: this.editNombre.trim(), color: this.editColor });
    this.editingId = null;
  }

  private _cancelEdit() {
    this.editingId = null;
  }

  private _delete(id: string) {
    deleteTag(id);
    if (this.editingId === id) this.editingId = null;
  }

  render() {
    const tags = plannerData.value.tags ?? [];

    return html`
      ${tags.length === 0
        ? html`
          <div class="empty">
            <div class="empty-icon">🏷</div>
            <p class="empty-title">Sin tags</p>
            <p class="empty-desc">Creá tags para organizar tareas, sesiones y materias.</p>
          </div>`
        : html`
          <div class="list">
            ${tags.map((tag) => {
              if (this.editingId === tag.id) {
                return html`
                  <div class="edit-row">
                    <div class="color-grid">
                      ${TAG_COLORS.map(
                        (c) => html`<button
                          class="color-dot"
                          style="background:${c}"
                          ?data-sel=${c === this.editColor}
                          @click=${() => { this.editColor = c; }}
                        ></button>`,
                      )}
                    </div>
                    <input
                      type="text"
                      .value=${this.editNombre}
                      @input=${(e: InputEvent) => { this.editNombre = (e.target as HTMLInputElement).value; }}
                      @keydown=${(e: KeyboardEvent) => {
                        if (e.key === "Enter") this._saveEdit();
                        if (e.key === "Escape") this._cancelEdit();
                      }}
                    />
                    <button class="btn-sm save" @click=${this._saveEdit}>✓</button>
                    <button class="btn-sm" @click=${this._cancelEdit}>✕</button>
                  </div>
                `;
              }
              const usage = this._countUsages(tag.id);
              const total = usage.tareas + usage.sesiones + usage.materias;
              return html`
                <div class="row">
                  <span class="row-dot" style="background:${tag.color}"></span>
                  <span class="row-name">${tag.nombre}</span>
                  <span class="row-stat">${total > 0 ? `${total} usos` : "sin uso"}</span>
                  <button class="row-btn" @click=${() => this._startEdit(tag.id)} title="Editar">✏️</button>
                  <button class="row-btn del" @click=${() => this._delete(tag.id)} title="Eliminar">🗑</button>
                </div>
              `;
            })}
          </div>`}

      <div class="add-label">Nuevo tag</div>
      <div class="add-form">
        <div class="color-grid">
          ${TAG_COLORS.map(
            (c) => html`<button
              class="color-dot"
              style="background:${c}"
              ?data-sel=${c === this.newColor}
              @click=${() => { this.newColor = c; }}
            ></button>`,
          )}
        </div>
        <input
          type="text"
          placeholder="Nombre del tag..."
          .value=${this.newNombre}
          @input=${(e: InputEvent) => { this.newNombre = (e.target as HTMLInputElement).value; }}
          @keydown=${(e: KeyboardEvent) => { if (e.key === "Enter") this._add(); }}
        />
        <button class="btn-add" @click=${this._add} ?disabled=${!this.newNombre.trim()}>Agregar</button>
      </div>

      ${tags.length > 0 ? html`
        <div class="stats-section">
          <div class="stats-title">Uso de tags</div>
          <div class="stats-grid">
            ${tags.map((tag) => {
              const u = this._countUsages(tag.id);
              const total = u.tareas + u.sesiones + u.materias;
              const parts: string[] = [];
              if (u.tareas > 0) parts.push(`${u.tareas}T`);
              if (u.sesiones > 0) parts.push(`${u.sesiones}S`);
              if (u.materias > 0) parts.push(`${u.materias}M`);
              return html`
                <span class="stat-chip">
                  <span class="stat-dot" style="background:${tag.color}"></span>
                  ${tag.nombre}
                  <span class="stat-count">${total > 0 ? parts.join(" · ") : "—"}</span>
                </span>
              `;
            })}
          </div>
        </div>
      ` : nothing}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "config-tab-tags": ConfigTabTags;
  }
}
