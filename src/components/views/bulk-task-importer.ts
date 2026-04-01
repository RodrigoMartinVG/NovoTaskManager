import { PreactSignalWatcher } from "../shared/preact-signal-watcher.js";
import { LitElement, css, html, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import type { Tarea, ChecklistItem } from "../../state/types.js";
import { addTarea, materias, plannerData } from "../../state/store.js";

const uid = () => crypto.randomUUID();

const EXAMPLE_JSON = `[
  { "titulo": "TP Integración", "materiaId": "...", "prioridad": "alta", "fechaLimite": "2026-04-15" },
  { "titulo": "Leer cap 5", "obligatorio": true },
  { "titulo": "Ejercicios 1 a 20", "tipo": "practica" }
]`;

function normalizeTarea(raw: Record<string, unknown>): Tarea {
  return {
    id: uid(),
    titulo: typeof raw.titulo === "string" && raw.titulo.trim() ? raw.titulo.trim() : "Sin título",
    materiaId: typeof raw.materiaId === "string" ? raw.materiaId : "",
    tipo: typeof raw.tipo === "string" ? raw.tipo : "",
    estado: (["pendiente", "en_progreso", "completada"].includes(raw.estado as string)
      ? raw.estado
      : "pendiente") as Tarea["estado"],
    prioridad: (["alta", "media", "baja"].includes(raw.prioridad as string)
      ? raw.prioridad
      : "media") as Tarea["prioridad"],
    fechaInicio: typeof raw.fechaInicio === "string" ? raw.fechaInicio : undefined,
    fechaLimite: typeof raw.fechaLimite === "string" ? raw.fechaLimite : undefined,
    horaLimite: typeof raw.horaLimite === "string" ? raw.horaLimite : undefined,
    obligatorio: typeof raw.obligatorio === "boolean" ? raw.obligatorio : false,
    descripcion: typeof raw.descripcion === "string" ? raw.descripcion : undefined,
    link: typeof raw.link === "string" ? raw.link : undefined,
    items: Array.isArray(raw.items)
      ? raw.items.map((i: Record<string, unknown>): ChecklistItem => ({
          id: uid(),
          texto: String(i.texto ?? ""),
          hecho: Boolean(i.hecho),
        }))
      : [],
    tags: Array.isArray(raw.tags) ? raw.tags.filter((t): t is string => typeof t === "string") : undefined,
  };
}

@customElement("bulk-task-importer")
export class BulkTaskImporter extends PreactSignalWatcher(LitElement) {
  @state() private jsonText = "";
  @state() private parsed: Tarea[] = [];
  @state() private parseError = "";
  @state() private imported = 0;
  @state() private step: "input" | "preview" | "done" = "input";

  static styles = css`
    :host { display: block; }

    /* ── Overlay ── */
    .overlay {
      position: fixed;
      inset: 0;
      z-index: 200;
      background: rgba(0,0,0,0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-4, 1rem);
      animation: fadeIn 0.16s ease-out;
    }
    @keyframes fadeIn { from { opacity: 0; } }

    .dialog {
      background: var(--bg1);
      border: 1px solid var(--border);
      border-radius: 0.75rem;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
      width: 100%;
      max-width: 64rem;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: slideUp 0.2s ease-out;
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(0.75rem); }
    }

    /* ── Header ── */
    .dlg-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-4, 1rem) var(--space-5, 1.5rem);
      border-bottom: 1px solid var(--border);
    }
    .dlg-title {
      font-size: 1rem;
      font-weight: 700;
      color: var(--text0);
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .dlg-close {
      background: transparent;
      border: none;
      color: var(--text3);
      font-size: 1.125rem;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 0.25rem;
      line-height: 1;
    }
    .dlg-close:hover { color: var(--text0); background: var(--bg2); }

    /* ── Body ── */
    .dlg-body {
      flex: 1;
      overflow-y: auto;
      padding: var(--space-4, 1rem) var(--space-5, 1.5rem);
    }

    /* ── Steps indicator ── */
    .steps {
      display: flex;
      gap: 0.5rem;
      margin-bottom: var(--space-4, 1rem);
    }
    .step-dot {
      width: 2rem;
      height: 0.25rem;
      border-radius: 0.125rem;
      background: var(--border);
      transition: background 0.2s;
    }
    .step-dot.active { background: var(--accent); }
    .step-dot.done { background: var(--ok-text, #10b981); }

    /* ── Textarea ── */
    .json-ta {
      width: 100%;
      min-height: 10rem;
      max-height: 22rem;
      font-family: "Cascadia Code", "Fira Code", monospace;
      font-size: 0.8125rem;
      line-height: 1.5;
      background: var(--bg0);
      color: var(--text0);
      border: 1px solid var(--border);
      border-radius: 0.5rem;
      padding: 0.75rem;
      resize: vertical;
      tab-size: 2;
      box-sizing: border-box;
    }
    .json-ta:focus { outline: none; border-color: var(--accent); }
    .json-ta.has-error { border-color: var(--err-text, #ef4444); }

    .hint {
      font-size: var(--text-xs, 0.75rem);
      color: var(--text3);
      margin: 0.5rem 0 0;
      line-height: 1.5;
    }
    .hint code {
      background: var(--bg2);
      padding: 0.0625rem 0.25rem;
      border-radius: 0.25rem;
      font-size: 0.6875rem;
    }

    .error-msg {
      font-size: var(--text-xs, 0.75rem);
      color: var(--err-text, #ef4444);
      margin: 0.5rem 0 0;
      padding: 0.5rem 0.625rem;
      background: var(--err-bg, #fef2f2);
      border-radius: 0.375rem;
      border: 1px solid var(--err-border, #fca5a5);
    }

    .example-toggle {
      background: transparent;
      border: none;
      color: var(--accent);
      font: inherit;
      font-size: var(--text-xs, 0.75rem);
      cursor: pointer;
      padding: 0;
      text-decoration: underline;
      margin-top: 0.375rem;
      display: inline-block;
    }

    /* ── Preview table ── */
    .preview-info {
      font-size: var(--text-sm, 0.8125rem);
      color: var(--text1);
      margin-bottom: var(--space-3, 0.75rem);
      font-weight: 500;
    }
    .preview-info strong { color: var(--accent); }

    .preview-scroll {
      overflow-x: auto;
      margin: 0 -1.5rem;
      padding: 0 1.5rem;
    }

    .preview-tbl {
      width: 100%;
      min-width: 52rem;
      border-collapse: collapse;
      font-size: var(--text-xs, 0.75rem);
    }
    .preview-tbl th {
      text-align: left;
      font-weight: 600;
      color: var(--text3);
      padding: 0.375rem 0.25rem;
      border-bottom: 2px solid var(--border);
      white-space: nowrap;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      font-size: 0.5625rem;
      position: sticky;
      top: 0;
      background: var(--bg1);
      z-index: 1;
    }
    .preview-tbl td {
      padding: 0.25rem 0.25rem;
      border-bottom: 1px solid var(--border);
      color: var(--text1);
      vertical-align: middle;
    }
    .preview-tbl tr:hover td { background: var(--bg2); }
    .preview-tbl .mat-dot {
      display: inline-block;
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 50%;
      margin-right: 0.25rem;
      vertical-align: middle;
    }

    /* ── Inline edit controls ── */
    .cell-input {
      font: inherit;
      font-size: var(--text-xs, 0.75rem);
      background: var(--bg0);
      color: var(--text0);
      border: 1px solid transparent;
      border-radius: 0.25rem;
      padding: 0.25rem 0.375rem;
      width: 100%;
      min-width: 0;
      box-sizing: border-box;
      transition: border-color 0.12s;
    }
    .cell-input:focus {
      outline: none;
      border-color: var(--accent);
      background: var(--bg1);
    }
    .cell-input:hover:not(:focus) {
      border-color: var(--border);
    }
    .cell-select {
      font: inherit;
      font-size: var(--text-xs, 0.75rem);
      background: var(--bg0);
      color: var(--text0);
      border: 1px solid transparent;
      border-radius: 0.25rem;
      padding: 0.25rem 0.25rem;
      width: 100%;
      min-width: 0;
      box-sizing: border-box;
      cursor: pointer;
      transition: border-color 0.12s;
    }
    .cell-select:focus { outline: none; border-color: var(--accent); }
    .cell-select:hover:not(:focus) { border-color: var(--border); }
    .cell-date {
      font: inherit;
      font-size: var(--text-xs, 0.75rem);
      background: var(--bg0);
      color: var(--text0);
      border: 1px solid transparent;
      border-radius: 0.25rem;
      padding: 0.25rem 0.25rem;
      width: 100%;
      min-width: 0;
      box-sizing: border-box;
    }
    .cell-date:focus { outline: none; border-color: var(--accent); }
    .cell-date:hover:not(:focus) { border-color: var(--border); }
    .cell-cb {
      width: 0.875rem;
      height: 0.875rem;
      accent-color: var(--accent);
      cursor: pointer;
    }

    .remove-btn {
      background: transparent;
      border: none;
      color: var(--text3);
      cursor: pointer;
      font-size: 0.6875rem;
      padding: 0.125rem 0.375rem;
      border-radius: 0.25rem;
    }
    .remove-btn:hover { color: var(--err-text, #ef4444); background: var(--bg2); }

    .btn-add-row {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      background: transparent;
      border: 1px dashed var(--border);
      color: var(--text2);
      padding: 0.375rem 0.75rem;
      border-radius: 0.375rem;
      font: inherit;
      font-size: var(--text-xs, 0.75rem);
      cursor: pointer;
      margin-top: var(--space-3, 0.75rem);
      transition: all 0.14s;
    }
    .btn-add-row:hover {
      border-color: var(--accent);
      color: var(--accent);
      background: var(--bg2);
    }

    .row-num {
      color: var(--text3);
      font-size: 0.625rem;
      width: 1.25rem;
      text-align: center;
    }
    .col-titulo { min-width: 10rem; }
    .col-materia { min-width: 7rem; }
    .col-tipo { min-width: 5.5rem; }
    .col-prio { min-width: 4.5rem; }
    .col-estado { min-width: 5.5rem; }
    .col-fecha { min-width: 6.5rem; }
    .col-oblig { width: 2rem; text-align: center; }
    .col-actions { width: 1.75rem; }

    /* ── Done ── */
    .done-state {
      text-align: center;
      padding: var(--space-6, 2rem) 0;
    }
    .done-icon { font-size: 3rem; margin-bottom: var(--space-3, 0.75rem); }
    .done-title {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--text0);
      margin: 0 0 var(--space-2, 0.5rem);
    }
    .done-desc {
      font-size: var(--text-sm, 0.8125rem);
      color: var(--text2);
      margin: 0;
    }

    /* ── Footer ── */
    .dlg-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: var(--space-2, 0.5rem);
      padding: var(--space-3, 0.75rem) var(--space-5, 1.5rem);
      border-top: 1px solid var(--border);
    }
    .btn {
      font: inherit;
      font-size: var(--text-sm, 0.8125rem);
      padding: 0.4375rem 1rem;
      border-radius: 0.375rem;
      cursor: pointer;
      transition: all 0.14s;
      border: none;
    }
    .btn-ghost {
      background: transparent;
      color: var(--text2);
      border: 1px solid var(--border);
    }
    .btn-ghost:hover { background: var(--bg2); color: var(--text0); }
    .btn-primary {
      background: var(--accent);
      color: #fff;
      font-weight: 600;
    }
    .btn-primary:hover { opacity: 0.88; }
    .btn-primary:disabled { opacity: 0.4; cursor: default; }
    .btn-ok {
      background: var(--ok-bg, #dcfce7);
      color: var(--ok-text, #146035);
      font-weight: 600;
      border: 1px solid var(--ok-text, #146035);
    }
    .btn-ok:hover { opacity: 0.88; }
  `;

  /* ── Actions ── */

  private _parse() {
    this.parseError = "";
    try {
      const raw = JSON.parse(this.jsonText);
      const arr = Array.isArray(raw) ? raw : [raw];
      if (arr.length === 0) {
        this.parseError = "El JSON está vacío.";
        return;
      }
      this.parsed = arr.map((item) => normalizeTarea(item as Record<string, unknown>));
      this.step = "preview";
    } catch (e) {
      this.parseError = `JSON inválido: ${(e as Error).message}`;
    }
  }

  private _removeParsed(idx: number) {
    this.parsed = this.parsed.filter((_, i) => i !== idx);
    if (this.parsed.length === 0) this.step = "input";
  }

  private _addRow() {
    this.parsed = [...this.parsed, normalizeTarea({ titulo: "" })];
  }

  private _updateField(idx: number, field: keyof Tarea, value: unknown) {
    this.parsed = this.parsed.map((t, i) =>
      i === idx ? { ...t, [field]: value } : t,
    );
  }

  private _import() {
    for (const t of this.parsed) {
      addTarea(t);
    }
    this.imported = this.parsed.length;
    this.step = "done";
  }

  private _close() {
    this.step = "input";
    this.jsonText = "";
    this.parsed = [];
    this.parseError = "";
    this.imported = 0;
    this.dispatchEvent(new CustomEvent("close", { bubbles: true, composed: true }));
  }

  private _loadExample() {
    this.jsonText = EXAMPLE_JSON;
  }

  private _backToInput() {
    this.step = "input";
  }

  /* ── Render ── */

  render() {
    return html`
      <div class="overlay" @click=${(e: Event) => { if (e.target === e.currentTarget) this._close(); }}>
        <div class="dialog" @click=${(e: Event) => e.stopPropagation()}>
          <div class="dlg-header">
            <h2 class="dlg-title">📥 Importar tareas masivamente</h2>
            <button class="dlg-close" @click=${this._close} aria-label="Cerrar">✕</button>
          </div>

          <!-- Steps indicator -->
          <div style="padding: 0.75rem 1.5rem 0;">
            <div class="steps">
              <div class="step-dot ${this.step === "input" ? "active" : "done"}"></div>
              <div class="step-dot ${this.step === "preview" ? "active" : this.step === "done" ? "done" : ""}"></div>
              <div class="step-dot ${this.step === "done" ? "active" : ""}"></div>
            </div>
          </div>

          <div class="dlg-body">
            ${this.step === "input" ? this._renderInput()
              : this.step === "preview" ? this._renderPreview()
              : this._renderDone()}
          </div>

          <div class="dlg-footer">
            ${this.step === "input" ? html`
              <button class="btn btn-ghost" @click=${this._close}>Cancelar</button>
              <button class="btn btn-primary" @click=${this._parse} ?disabled=${!this.jsonText.trim()}>
                Previsualizar →
              </button>
            ` : this.step === "preview" ? html`
              <button class="btn btn-ghost" @click=${this._backToInput}>← Volver</button>
              <button class="btn btn-primary" @click=${this._import} ?disabled=${this.parsed.length === 0}>
                Importar ${this.parsed.length} tarea${this.parsed.length !== 1 ? "s" : ""}
              </button>
            ` : html`
              <button class="btn btn-ok" @click=${this._close}>Cerrar</button>
            `}
          </div>
        </div>
      </div>
    `;
  }

  private _renderInput() {
    const allMats = materias.value;

    return html`
      <textarea
        class="json-ta ${this.parseError ? "has-error" : ""}"
        placeholder='Pegá un JSON con un array de tareas...\n[\n  { "titulo": "Mi tarea", "prioridad": "alta" }\n]'
        .value=${this.jsonText}
        @input=${(e: InputEvent) => { this.jsonText = (e.target as HTMLTextAreaElement).value; this.parseError = ""; }}
      ></textarea>
      ${this.parseError ? html`<div class="error-msg">${this.parseError}</div>` : nothing}
      <p class="hint">
        Campos soportados:
        <code>titulo</code>, <code>materiaId</code>, <code>tipo</code>,
        <code>estado</code>, <code>prioridad</code>, <code>fechaInicio</code>,
        <code>fechaLimite</code>, <code>horaLimite</code>, <code>obligatorio</code>,
        <code>descripcion</code>, <code>link</code>, <code>items</code>, <code>tags</code>.
        Los campos omitidos se autocompletan con los valores por defecto.
      </p>
      <button class="example-toggle" @click=${this._loadExample}>Ver ejemplo</button>
      ${allMats.length > 0
        ? html`<p class="hint">
            IDs de materias: ${allMats.map((m) => html`<code>${m.id}</code> `)}
          </p>`
        : nothing}
    `;
  }

  private _renderPreview() {
    const allMats = materias.value;
    const tipos = plannerData.value.tipos;
    return html`
      <p class="preview-info">
        <strong>${this.parsed.length}</strong> tarea${this.parsed.length !== 1 ? "s" : ""} — editá directamente en la tabla antes de importar.
      </p>
      <div class="preview-scroll">
        <table class="preview-tbl">
          <thead>
            <tr>
              <th></th>
              <th class="col-titulo">Título</th>
              <th class="col-materia">Materia</th>
              <th class="col-tipo">Tipo</th>
              <th class="col-prio">Prioridad</th>
              <th class="col-estado">Estado</th>
              <th class="col-fecha">Fecha límite</th>
              <th class="col-oblig">Oblig.</th>
              <th class="col-actions"></th>
            </tr>
          </thead>
          <tbody>
            ${this.parsed.map((t, i) => html`
              <tr>
                <td class="row-num">${i + 1}</td>
                <td class="col-titulo">
                  <input class="cell-input" type="text"
                    .value=${t.titulo}
                    placeholder="Título de la tarea"
                    @input=${(e: InputEvent) => this._updateField(i, "titulo", (e.target as HTMLInputElement).value)}
                  />
                </td>
                <td class="col-materia">
                  <select class="cell-select"
                    @change=${(e: Event) => this._updateField(i, "materiaId", (e.target as HTMLSelectElement).value)}>
                    <option value="" ?selected=${!t.materiaId}>—</option>
                    ${allMats.map((m) => html`<option value=${m.id} ?selected=${m.id === t.materiaId}>${m.nombre}</option>`)}
                  </select>
                </td>
                <td class="col-tipo">
                  <select class="cell-select"
                    @change=${(e: Event) => this._updateField(i, "tipo", (e.target as HTMLSelectElement).value)}>
                    <option value="" ?selected=${!t.tipo}>—</option>
                    ${tipos.map((tp) => html`<option value=${tp.id} ?selected=${tp.id === t.tipo}>${tp.icono} ${tp.nombre}</option>`)}
                  </select>
                </td>
                <td class="col-prio">
                  <select class="cell-select"
                    @change=${(e: Event) => this._updateField(i, "prioridad", (e.target as HTMLSelectElement).value)}>
                    <option value="alta" ?selected=${t.prioridad === "alta"}>🔴 Alta</option>
                    <option value="media" ?selected=${t.prioridad === "media"}>🟡 Media</option>
                    <option value="baja" ?selected=${t.prioridad === "baja"}>🟢 Baja</option>
                  </select>
                </td>
                <td class="col-estado">
                  <select class="cell-select"
                    @change=${(e: Event) => this._updateField(i, "estado", (e.target as HTMLSelectElement).value)}>
                    <option value="pendiente" ?selected=${t.estado === "pendiente"}>Pendiente</option>
                    <option value="en_progreso" ?selected=${t.estado === "en_progreso"}>En progreso</option>
                    <option value="completada" ?selected=${t.estado === "completada"}>Completada</option>
                  </select>
                </td>
                <td class="col-fecha">
                  <input class="cell-date" type="date"
                    .value=${t.fechaLimite ?? ""}
                    @input=${(e: InputEvent) => this._updateField(i, "fechaLimite", (e.target as HTMLInputElement).value || undefined)}
                  />
                </td>
                <td class="col-oblig">
                  <input class="cell-cb" type="checkbox"
                    .checked=${t.obligatorio}
                    @change=${(e: Event) => this._updateField(i, "obligatorio", (e.target as HTMLInputElement).checked)}
                  />
                </td>
                <td class="col-actions">
                  <button class="remove-btn" @click=${() => this._removeParsed(i)} title="Quitar">✕</button>
                </td>
              </tr>
            `)}
          </tbody>
        </table>
      </div>
      <button class="btn-add-row" @click=${this._addRow}>+ Agregar tarea</button>
    `;
  }

  private _renderDone() {
    return html`
      <div class="done-state">
        <div class="done-icon">✅</div>
        <p class="done-title">${this.imported} tarea${this.imported !== 1 ? "s" : ""} importada${this.imported !== 1 ? "s" : ""}</p>
        <p class="done-desc">Ya aparecen en tu backlog con los valores por defecto aplicados.</p>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "bulk-task-importer": BulkTaskImporter;
  }
}
