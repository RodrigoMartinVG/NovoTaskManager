import { PreactSignalWatcher } from "./preact-signal-watcher.js";
import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { addTag, plannerData } from "../../state/store.js";

const PALETTE = [
  "#6366f1", "#8b5cf6", "#a855f7", "#ec4899",
  "#ef4444", "#f97316", "#f59e0b", "#84cc16",
  "#10b981", "#14b8a6", "#3b82f6", "#64748b",
];

@customElement("tag-picker")
export class TagPicker extends PreactSignalWatcher(LitElement) {
  /** Currently selected tag IDs */
  @property({ type: Array }) selected: string[] = [];
  @state() private filter = "";

  static styles = css`
    :host { display: block; }

    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.3rem;
      margin-bottom: 0.5rem;
    }

    .chip {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.2rem 0.5rem;
      border-radius: 999px;
      font: inherit;
      font-size: var(--text-xs, 0.75rem);
      font-weight: 500;
      cursor: pointer;
      border: 1.5px solid var(--tag-c);
      background: transparent;
      color: var(--tag-c);
      transition: all 0.14s;
    }
    .chip:hover { opacity: 0.85; }
    .chip[data-on] {
      background: var(--tag-c);
      color: #fff;
    }
    .chip-dot {
      width: 0.4rem;
      height: 0.4rem;
      border-radius: 50%;
      background: currentColor;
    }

    .add-row {
      display: flex;
      gap: 0.375rem;
      align-items: center;
    }
    .add-row input {
      flex: 1;
      min-width: 0;
      font: inherit;
      font-size: var(--text-xs, 0.75rem);
      background: var(--bg0);
      color: var(--text0);
      border: 1px solid var(--border);
      border-radius: 0.375rem;
      padding: 0.3rem 0.5rem;
    }
    .add-row input:focus {
      outline: none;
      border-color: var(--accent);
    }
    .btn-create {
      background: var(--accent);
      color: #fff;
      border: none;
      border-radius: 0.375rem;
      padding: 0.3rem 0.5rem;
      font: inherit;
      font-size: var(--text-xs, 0.75rem);
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
    }
    .btn-create:hover { opacity: 0.85; }

    .empty-hint {
      font-size: var(--text-xs, 0.75rem);
      color: var(--text3);
      margin-bottom: 0.375rem;
    }
  `;

  private _toggle(id: string) {
    const next = this.selected.includes(id)
      ? this.selected.filter((x) => x !== id)
      : [...this.selected, id];
    this.dispatchEvent(new CustomEvent("tags-changed", { detail: next, bubbles: true, composed: true }));
  }

  private _create() {
    const nombre = this.filter.trim();
    if (!nombre) return;
    const idx = (plannerData.value.tags?.length ?? 0) % PALETTE.length;
    const id = `tag-${Date.now()}`;
    addTag({ id, nombre, color: PALETTE[idx] });
    this.dispatchEvent(
      new CustomEvent("tags-changed", { detail: [...this.selected, id], bubbles: true, composed: true }),
    );
    this.filter = "";
  }

  render() {
    const tags = plannerData.value.tags ?? [];
    const q = this.filter.toLowerCase();
    const filtered = q ? tags.filter((t) => t.nombre.toLowerCase().includes(q)) : tags;
    const exactMatch = q && tags.some((t) => t.nombre.toLowerCase() === q);

    return html`
      ${filtered.length > 0
        ? html`<div class="chips">
            ${filtered.map(
              (t) => html`
              <button
                class="chip"
                style="--tag-c:${t.color}"
                ?data-on=${this.selected.includes(t.id)}
                @click=${() => this._toggle(t.id)}
              ><span class="chip-dot"></span>${t.nombre}</button>`,
            )}
          </div>`
        : tags.length === 0
          ? html`<div class="empty-hint">Sin tags — escribí para crear uno</div>`
          : nothing}
      <div class="add-row">
        <input
          type="text"
          placeholder="Buscar o crear tag…"
          .value=${this.filter}
          @input=${(e: InputEvent) => { this.filter = (e.target as HTMLInputElement).value; }}
          @keydown=${(e: KeyboardEvent) => { if (e.key === "Enter" && !exactMatch && this.filter.trim()) this._create(); }}
        />
        ${q && !exactMatch
          ? html`<button class="btn-create" @click=${this._create}>+ ${this.filter.trim()}</button>`
          : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "tag-picker": TagPicker;
  }
}
