import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { Tarea } from "../../state/types.js";
import { addTarea } from "../../state/store.js";

const uid = () => crypto.randomUUID();

/* ═══ Date generation (pure functions) ═══ */

type EndMode = "date" | "count";
type GenMode = "copia" | "semanal" | "mensual" | "cada-n" | "fechas";
type MensualTipo = "dia" | "posicion";
type SufixMode = "fecha" | "numero" | "ninguno";

const DIA_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const DIA_SHORT = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"];
const ORDINAL = ["1er", "2do", "3er", "4to", "5to"];

/** JS getDay() is 0=Sun..6=Sat → convert to 0=Mon..6=Sun */
function jsDayToMon(d: number): number {
  return d === 0 ? 6 : d - 1;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function toIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function parseDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function fmtShort(d: Date): string {
  const dia = DIA_SHORT[jsDayToMon(d.getDay())];
  return `${dia} ${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}`;
}

interface GenConfig {
  mode: GenMode;
  // copia
  copias: number;
  // semanal
  dias: number[]; // 0=Lun..6=Dom
  intervaloSem: number;
  // mensual
  mensualTipo: MensualTipo;
  mensualDia: number; // 1-31
  mensualOrdinal: number; // 0-4 (1er..5to)
  mensualDiaSem: number; // 0=Lun..6=Dom
  // cada-n
  intervaloDias: number;
  // fechas
  fechasText: string;
  // common
  desde: string;
  endMode: EndMode;
  hasta: string;
  cantidad: number;
}

function generateDates(cfg: GenConfig): string[] {
  const MAX = 200; // safety cap

  if (cfg.mode === "copia") {
    // No dates — copies use the base task's fechaLimite
    return Array.from({ length: cfg.copias }, () => "");
  }

  if (cfg.mode === "fechas") {
    return cfg.fechasText
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter((s) => /^\d{4}-\d{2}-\d{2}$/.test(s))
      .slice(0, MAX);
  }

  const desde = parseDate(cfg.desde);
  const dates: string[] = [];

  if (cfg.mode === "semanal") {
    if (cfg.dias.length === 0) return [];
    const diasSet = new Set(cfg.dias);
    let cursor = new Date(desde);
    let weekCount = 0;
    let lastWeekStart = -1;

    while (dates.length < MAX) {
      const monDay = jsDayToMon(cursor.getDay());
      const weekNum = Math.floor((cursor.getTime() - desde.getTime()) / (7 * 86400000));

      // Track week transitions for interval
      if (weekNum !== lastWeekStart) {
        if (weekNum > 0 && cfg.intervaloSem > 1) {
          weekCount++;
          if ((weekCount % cfg.intervaloSem) !== 0 && weekNum !== 0) {
            // Skip this whole week
            cursor = addDays(cursor, 1);
            lastWeekStart = weekNum;
            // Fast-forward to next week
            const skip = 7 - monDay;
            cursor = addDays(cursor, skip > 0 ? skip : 7);
            continue;
          }
        }
        lastWeekStart = weekNum;
      }

      if (diasSet.has(monDay)) {
        const iso = toIso(cursor);
        if (cfg.endMode === "date" && iso > cfg.hasta) break;
        dates.push(iso);
        if (cfg.endMode === "count" && dates.length >= cfg.cantidad) break;
      }
      cursor = addDays(cursor, 1);
      if (cfg.endMode === "date" && toIso(cursor) > cfg.hasta) break;
    }
    return dates;
  }

  if (cfg.mode === "cada-n") {
    if (cfg.intervaloDias < 1) return [];
    let cursor = new Date(desde);
    while (dates.length < MAX) {
      const iso = toIso(cursor);
      if (cfg.endMode === "date" && iso > cfg.hasta) break;
      dates.push(iso);
      if (cfg.endMode === "count" && dates.length >= cfg.cantidad) break;
      cursor = addDays(cursor, cfg.intervaloDias);
    }
    return dates;
  }

  if (cfg.mode === "mensual") {
    let cursor = new Date(desde);
    while (dates.length < MAX) {
      let target: Date | null = null;

      if (cfg.mensualTipo === "dia") {
        // Specific day of month
        const y = cursor.getFullYear();
        const m = cursor.getMonth();
        const lastDay = new Date(y, m + 1, 0).getDate();
        const day = Math.min(cfg.mensualDia, lastDay);
        target = new Date(y, m, day);
      } else {
        // Nth weekday of month (e.g. 2nd Tuesday)
        const y = cursor.getFullYear();
        const m = cursor.getMonth();
        const targetJsDay = cfg.mensualDiaSem === 6 ? 0 : cfg.mensualDiaSem + 1; // Mon=0→JS1, Sun=6→JS0
        let count = 0;
        for (let d = 1; d <= 31; d++) {
          const dt = new Date(y, m, d);
          if (dt.getMonth() !== m) break;
          if (dt.getDay() === targetJsDay) {
            if (count === cfg.mensualOrdinal) {
              target = dt;
              break;
            }
            count++;
          }
        }
      }

      if (target && toIso(target) >= cfg.desde) {
        const iso = toIso(target);
        if (cfg.endMode === "date" && iso > cfg.hasta) break;
        dates.push(iso);
        if (cfg.endMode === "count" && dates.length >= cfg.cantidad) break;
      }

      // Advance to next month
      cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
      if (cfg.endMode === "date" && toIso(cursor) > cfg.hasta) break;
    }
    return dates;
  }

  return dates;
}

/* ═══ Component ═══ */

@customElement("task-generator-dialog")
export class TaskGeneratorDialog extends LitElement {
  @property({ type: Object }) base!: Tarea;

  @state() private mode: GenMode = "copia";
  @state() private copias = 1;
  @state() private dias: number[] = [];
  @state() private intervaloSem = 1;
  @state() private mensualTipo: MensualTipo = "dia";
  @state() private mensualDia = 15;
  @state() private mensualOrdinal = 0;
  @state() private mensualDiaSem = 0;
  @state() private intervaloDias = 7;
  @state() private fechasText = "";
  @state() private desde = new Date().toISOString().slice(0, 10);
  @state() private endMode: EndMode = "date";
  @state() private hasta = "";
  @state() private cantidad = 10;
  @state() private tituloBase = "";
  @state() private sufijo: SufixMode = "fecha";
  @state() private excluded = new Set<string>();
  @state() private generatedCount = 0;

  connectedCallback() {
    super.connectedCallback();
    this.tituloBase = this.base?.titulo ?? "";
    // Default hasta: 3 months from now
    const h = new Date();
    h.setMonth(h.getMonth() + 3);
    this.hasta = toIso(h);
  }

  static styles = css`
    :host { display: block; }

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
      max-width: 36rem;
      max-height: 88vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: slideUp 0.2s ease-out;
    }
    @keyframes slideUp { from { opacity: 0; transform: translateY(0.75rem); } }

    .dlg-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-4, 1rem) var(--space-5, 1.5rem);
      border-bottom: 1px solid var(--border);
    }
    .dlg-title {
      font-size: 1rem; font-weight: 700; color: var(--text0); margin: 0;
      display: flex; align-items: center; gap: 0.5rem;
    }
    .dlg-close {
      background: transparent; border: none; color: var(--text3);
      font-size: 1.125rem; cursor: pointer; padding: 0.25rem;
      border-radius: 0.25rem; line-height: 1;
    }
    .dlg-close:hover { color: var(--text0); background: var(--bg2); }

    .dlg-body {
      flex: 1; overflow-y: auto;
      padding: var(--space-4, 1rem) var(--space-5, 1.5rem);
      display: flex; flex-direction: column; gap: var(--space-4, 1rem);
    }

    .dlg-footer {
      display: flex; align-items: center; justify-content: space-between;
      gap: var(--space-2, 0.5rem);
      padding: var(--space-3, 0.75rem) var(--space-5, 1.5rem);
      border-top: 1px solid var(--border);
    }
    .footer-info {
      font-size: var(--text-xs, 0.75rem);
      color: var(--text3);
    }
    .footer-actions {
      display: flex; gap: 0.5rem;
    }

    /* ── Form ── */
    .field { display: flex; flex-direction: column; gap: 0.25rem; }
    .field-label {
      font-size: var(--text-xs, 0.75rem); font-weight: 600;
      color: var(--text3); text-transform: uppercase; letter-spacing: 0.04em;
    }
    .field-input {
      font: inherit; font-size: var(--text-sm, 0.8125rem);
      background: var(--bg0); color: var(--text0);
      border: 1px solid var(--border); border-radius: 0.375rem;
      padding: 0.375rem 0.625rem; transition: border-color 0.14s;
    }
    .field-input:focus { outline: none; border-color: var(--accent); }
    .field-row { display: flex; gap: 0.75rem; flex-wrap: wrap; }
    .field-row > .field { flex: 1; min-width: 7rem; }

    /* ── Mode tabs ── */
    .mode-tabs {
      display: flex; gap: 0.25rem; flex-wrap: wrap;
    }
    .mode-tab {
      background: var(--bg2); color: var(--text2);
      border: 1px solid var(--border); border-radius: 0.375rem;
      padding: 0.3125rem 0.625rem; font: inherit;
      font-size: var(--text-xs, 0.75rem); cursor: pointer;
      transition: all 0.14s; white-space: nowrap;
    }
    .mode-tab:hover { background: var(--bg1); color: var(--text0); }
    .mode-tab[data-active] {
      background: var(--accent); color: #fff;
      border-color: var(--accent);
    }

    /* ── Day chips ── */
    .day-chips { display: flex; gap: 0.25rem; flex-wrap: wrap; }
    .day-chip {
      width: 2.25rem; height: 2.25rem;
      border-radius: 50%; border: 1.5px solid var(--border);
      background: var(--bg2); color: var(--text2);
      font: inherit; font-size: var(--text-xs, 0.75rem); font-weight: 600;
      cursor: pointer; transition: all 0.14s;
      display: flex; align-items: center; justify-content: center;
    }
    .day-chip:hover { border-color: var(--accent); color: var(--text0); }
    .day-chip[data-on] {
      background: var(--accent); color: #fff; border-color: var(--accent);
    }

    /* ── End mode toggle ── */
    .end-toggle {
      display: flex; gap: 0.5rem; align-items: center;
      font-size: var(--text-xs, 0.75rem);
    }
    .end-opt {
      display: flex; align-items: center; gap: 0.25rem;
      cursor: pointer; color: var(--text2); transition: color 0.14s;
    }
    .end-opt[data-active] { color: var(--text0); font-weight: 600; }
    .end-opt input[type="radio"] { accent-color: var(--accent); }

    /* ── Sufijo ── */
    .sufijo-group {
      display: flex; gap: 0.375rem; flex-wrap: wrap;
    }
    .sufijo-chip {
      background: var(--bg2); color: var(--text2);
      border: 1px solid var(--border); border-radius: 1rem;
      padding: 0.1875rem 0.625rem; font: inherit;
      font-size: var(--text-xs, 0.75rem); cursor: pointer;
      transition: all 0.14s;
    }
    .sufijo-chip:hover { color: var(--text0); }
    .sufijo-chip[data-active] {
      background: var(--accent); color: #fff; border-color: var(--accent);
    }

    /* ── Preview ── */
    .preview-section {
      border-top: 1px solid var(--border);
      padding-top: var(--space-3, 0.75rem);
    }
    .preview-title {
      font-size: var(--text-xs, 0.75rem); font-weight: 600;
      color: var(--text1); margin: 0 0 0.5rem;
    }
    .preview-grid {
      display: flex; flex-wrap: wrap; gap: 0.25rem;
      max-height: 10rem; overflow-y: auto;
    }
    .preview-chip {
      display: inline-flex; align-items: center; gap: 0.25rem;
      padding: 0.1875rem 0.5rem; border-radius: 0.25rem;
      font-size: var(--text-xs, 0.75rem);
      background: var(--bg2); color: var(--text1);
      cursor: pointer; transition: all 0.12s; user-select: none;
      border: 1px solid transparent;
    }
    .preview-chip:hover { border-color: var(--border); }
    .preview-chip[data-excluded] {
      opacity: 0.4; text-decoration: line-through;
      background: transparent;
    }
    .preview-chip-cb {
      width: 0.625rem; height: 0.625rem;
      accent-color: var(--accent); pointer-events: none;
    }
    .preview-summary {
      font-size: var(--text-xs, 0.75rem); color: var(--text3);
      margin-top: 0.375rem;
    }

    .textarea {
      font-family: "Cascadia Code", "Fira Code", monospace;
      font-size: 0.75rem; line-height: 1.5;
      background: var(--bg0); color: var(--text0);
      border: 1px solid var(--border); border-radius: 0.375rem;
      padding: 0.5rem; resize: vertical; min-height: 4rem;
      width: 100%; box-sizing: border-box;
    }
    .textarea:focus { outline: none; border-color: var(--accent); }

    /* ── Buttons ── */
    .btn {
      font: inherit; font-size: var(--text-sm, 0.8125rem);
      padding: 0.4375rem 1rem; border-radius: 0.375rem;
      cursor: pointer; transition: all 0.14s; border: none;
    }
    .btn-ghost {
      background: transparent; color: var(--text2);
      border: 1px solid var(--border);
    }
    .btn-ghost:hover { background: var(--bg2); color: var(--text0); }
    .btn-primary {
      background: var(--accent); color: #fff; font-weight: 600;
    }
    .btn-primary:hover { opacity: 0.88; }
    .btn-primary:disabled { opacity: 0.4; cursor: default; }

    .mensual-row { display: flex; gap: 0.5rem; align-items: center; }
    .mensual-row select {
      font: inherit; font-size: var(--text-sm, 0.8125rem);
      background: var(--bg0); color: var(--text0);
      border: 1px solid var(--border); border-radius: 0.375rem;
      padding: 0.25rem 0.375rem;
    }
    .mensual-row select:focus { outline: none; border-color: var(--accent); }
    .mensual-toggle {
      display: flex; gap: 0.25rem;
    }
    .mensual-opt {
      background: var(--bg2); color: var(--text2);
      border: 1px solid var(--border); border-radius: 0.25rem;
      padding: 0.25rem 0.5rem; font: inherit;
      font-size: var(--text-xs, 0.75rem); cursor: pointer;
    }
    .mensual-opt[data-active] {
      background: var(--accent); color: #fff; border-color: var(--accent);
    }

    /* ── Done state ── */
    .done-state {
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      gap: 0.75rem; padding: 2rem 1rem;
      text-align: center;
      animation: fadeIn 0.2s ease-out;
    }
    .done-icon {
      font-size: 2.5rem;
      animation: popIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    @keyframes popIn {
      from { transform: scale(0.3); opacity: 0; }
      50% { transform: scale(1.15); }
      to { transform: scale(1); opacity: 1; }
    }
    .done-title {
      font-size: 1.125rem; font-weight: 700;
      color: var(--text0); margin: 0;
    }
    .done-desc {
      font-size: var(--text-sm, 0.8125rem);
      color: var(--text3); margin: 0;
      max-width: 22rem;
    }
  `;

  /* ── Helpers ── */

  private _getConfig(): GenConfig {
    return {
      mode: this.mode,
      copias: this.copias,
      dias: this.dias,
      intervaloSem: this.intervaloSem,
      mensualTipo: this.mensualTipo,
      mensualDia: this.mensualDia,
      mensualOrdinal: this.mensualOrdinal,
      mensualDiaSem: this.mensualDiaSem,
      intervaloDias: this.intervaloDias,
      fechasText: this.fechasText,
      desde: this.desde,
      endMode: this.endMode,
      hasta: this.hasta,
      cantidad: this.cantidad,
    };
  }

  private _getDates(): string[] {
    return generateDates(this._getConfig());
  }

  private _getActiveDates(): string[] {
    return this._getDates().filter((d) => !this.excluded.has(d));
  }

  private _toggleDay(d: number) {
    this.dias = this.dias.includes(d) ? this.dias.filter((x) => x !== d) : [...this.dias, d];
  }

  private _toggleExclude(date: string) {
    const next = new Set(this.excluded);
    if (next.has(date)) next.delete(date);
    else next.add(date);
    this.excluded = next;
  }

  private _makeTitulo(date: string, idx: number): string {
    const base = this.tituloBase.trim() || this.base.titulo;
    if (this.mode === "copia" && this.copias === 1) return `Copia de ${base}`;
    if (this.sufijo === "fecha" && date) return `${base} — ${fmtShort(parseDate(date))}`;
    if (this.sufijo === "numero") return `${base} #${idx + 1}`;
    return base;
  }

  /* ── Actions ── */

  private _generate() {
    const dates = this._getActiveDates();
    if (dates.length === 0) return;

    let idx = 0;
    for (const date of dates) {
      const t: Tarea = {
        id: uid(),
        titulo: this._makeTitulo(date, idx),
        materiaId: this.base.materiaId,
        tipo: this.base.tipo,
        estado: "pendiente",
        prioridad: this.base.prioridad,
        fechaInicio: undefined,
        fechaLimite: date || this.base.fechaLimite,
        horaLimite: this.base.horaLimite,
        obligatorio: this.base.obligatorio,
        descripcion: this.base.descripcion,
        link: this.base.link,
        items: this.base.items.map((i) => ({ ...i, id: uid(), hecho: false })),
        tags: this.base.tags ? [...this.base.tags] : undefined,
      };
      addTarea(t);
      idx++;
    }

    this.generatedCount = idx;

    this.dispatchEvent(new CustomEvent("generated", {
      detail: idx,
      bubbles: true,
      composed: true,
    }));
  }

  private _close() {
    this.dispatchEvent(new CustomEvent("close", { bubbles: true, composed: true }));
  }

  /* ── Render ── */

  render() {
    if (this.generatedCount > 0) return this._renderDone();

    const dates = this._getDates();
    const active = dates.filter((d) => !this.excluded.has(d));

    return html`
      <div class="overlay" @click=${(e: Event) => { if (e.target === e.currentTarget) this._close(); }}>
        <div class="dialog">
          <div class="dlg-header">
            <h2 class="dlg-title">🔁 Generar tareas</h2>
            <button class="dlg-close" @click=${this._close}>✕</button>
          </div>

          <div class="dlg-body">
            <!-- Título base -->
            <div class="field">
              <label class="field-label">Título base</label>
              <input class="field-input" type="text"
                .value=${this.tituloBase}
                @input=${(e: InputEvent) => { this.tituloBase = (e.target as HTMLInputElement).value; }}
              />
            </div>

            <!-- Sufijo -->
            <div class="field">
              <label class="field-label">Sufijo en cada tarea</label>
              <div class="sufijo-group">
                <button class="sufijo-chip" ?data-active=${this.sufijo === "fecha"}
                  @click=${() => { this.sufijo = "fecha"; }}>+ Fecha</button>
                <button class="sufijo-chip" ?data-active=${this.sufijo === "numero"}
                  @click=${() => { this.sufijo = "numero"; }}># Número</button>
                <button class="sufijo-chip" ?data-active=${this.sufijo === "ninguno"}
                  @click=${() => { this.sufijo = "ninguno"; }}>Sin sufijo</button>
              </div>
            </div>

            <!-- Mode tabs -->
            <div class="field">
              <label class="field-label">Modo</label>
              <div class="mode-tabs">
                ${(["copia", "semanal", "mensual", "cada-n", "fechas"] as GenMode[]).map((m) => {
                  const labels: Record<GenMode, string> = {
                    copia: "📋 Copia",
                    semanal: "📅 Semanal",
                    mensual: "🗓 Mensual",
                    "cada-n": "🔢 Cada N días",
                    fechas: "📌 Fechas",
                  };
                  return html`<button class="mode-tab" ?data-active=${this.mode === m}
                    @click=${() => { this.mode = m; this.excluded = new Set(); }}>${labels[m]}</button>`;
                })}
              </div>
            </div>

            <!-- Mode-specific fields -->
            ${this._renderModeFields()}

            <!-- Preview -->
            ${dates.length > 0 ? html`
              <div class="preview-section">
                <p class="preview-title">
                  Preview: ${active.length} tarea${active.length !== 1 ? "s" : ""}
                  ${this.excluded.size > 0 ? html` <span style="color:var(--text3)">(${this.excluded.size} excluida${this.excluded.size !== 1 ? "s" : ""})</span>` : nothing}
                </p>
                ${this.mode !== "copia" ? html`
                  <div class="preview-grid">
                    ${dates.map((d) => {
                      const ex = this.excluded.has(d);
                      return html`
                        <span class="preview-chip" ?data-excluded=${ex}
                          @click=${() => this._toggleExclude(d)}
                          title="${ex ? "Click para incluir" : "Click para excluir"}">
                          <input type="checkbox" class="preview-chip-cb" .checked=${!ex} tabindex="-1" />
                          ${fmtShort(parseDate(d))}
                        </span>`;
                    })}
                  </div>
                  <p class="preview-summary">
                    ${active.length > 0
                      ? `${fmtShort(parseDate(active[0]))} → ${fmtShort(parseDate(active[active.length - 1]))}`
                      : "Sin tareas seleccionadas"}
                  </p>
                ` : html`
                  <p class="preview-summary">
                    Se ${this.copias === 1 ? "creará 1 copia" : `crearán ${this.copias} copias`} de "${this.tituloBase || this.base.titulo}"
                  </p>
                `}
              </div>
            ` : nothing}
          </div>

          <div class="dlg-footer">
            <span class="footer-info">
              ${active.length > 0
                ? `${active.length} tarea${active.length !== 1 ? "s" : ""}`
                : ""}
            </span>
            <div class="footer-actions">
              <button class="btn btn-ghost" @click=${this._close}>Cancelar</button>
              <button class="btn btn-primary" ?disabled=${active.length === 0}
                @click=${this._generate}>
                Generar ${active.length} tarea${active.length !== 1 ? "s" : ""}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private _renderModeFields() {
    switch (this.mode) {
      case "copia":
        return html`
          <div class="field">
            <label class="field-label">Cantidad de copias</label>
            <input class="field-input" type="number" min="1" max="50"
              .value=${this.copias.toString()}
              @input=${(e: InputEvent) => {
                const v = Number.parseInt((e.target as HTMLInputElement).value, 10);
                if (v > 0 && v <= 50) this.copias = v;
              }}
            />
          </div>
        `;

      case "semanal":
        return html`
          <div class="field">
            <label class="field-label">Días de la semana</label>
            <div class="day-chips">
              ${DIA_LABELS.map((label, i) => html`
                <button class="day-chip" ?data-on=${this.dias.includes(i)}
                  @click=${() => this._toggleDay(i)}>${label}</button>
              `)}
            </div>
          </div>
          <div class="field-row">
            <div class="field">
              <label class="field-label">Cada</label>
              <div style="display:flex;align-items:center;gap:0.375rem;">
                <input class="field-input" type="number" min="1" max="12"
                  style="width:3.5rem;"
                  .value=${this.intervaloSem.toString()}
                  @input=${(e: InputEvent) => {
                    const v = Number.parseInt((e.target as HTMLInputElement).value, 10);
                    if (v > 0 && v <= 12) this.intervaloSem = v;
                  }}
                />
                <span style="font-size:var(--text-sm);color:var(--text2);">semana${this.intervaloSem !== 1 ? "s" : ""}</span>
              </div>
            </div>
          </div>
          ${this._renderRangeFields()}
        `;

      case "mensual":
        return html`
          <div class="field">
            <label class="field-label">Repetir el</label>
            <div class="mensual-toggle">
              <button class="mensual-opt" ?data-active=${this.mensualTipo === "dia"}
                @click=${() => { this.mensualTipo = "dia"; }}>Día fijo</button>
              <button class="mensual-opt" ?data-active=${this.mensualTipo === "posicion"}
                @click=${() => { this.mensualTipo = "posicion"; }}>Por posición</button>
            </div>
          </div>
          ${this.mensualTipo === "dia" ? html`
            <div class="field">
              <div class="mensual-row">
                <span style="font-size:var(--text-sm);color:var(--text2);">Día</span>
                <select @change=${(e: Event) => { this.mensualDia = Number((e.target as HTMLSelectElement).value); }}>
                  ${Array.from({ length: 31 }, (_, i) => i + 1).map((d) =>
                    html`<option value=${d} ?selected=${d === this.mensualDia}>${d}</option>`
                  )}
                </select>
                <span style="font-size:var(--text-sm);color:var(--text2);">de cada mes</span>
              </div>
            </div>
          ` : html`
            <div class="field">
              <div class="mensual-row">
                <span style="font-size:var(--text-sm);color:var(--text2);">El</span>
                <select @change=${(e: Event) => { this.mensualOrdinal = Number((e.target as HTMLSelectElement).value); }}>
                  ${ORDINAL.map((label, i) =>
                    html`<option value=${i} ?selected=${i === this.mensualOrdinal}>${label}</option>`
                  )}
                </select>
                <select @change=${(e: Event) => { this.mensualDiaSem = Number((e.target as HTMLSelectElement).value); }}>
                  ${DIA_LABELS.map((label, i) =>
                    html`<option value=${i} ?selected=${i === this.mensualDiaSem}>${label}</option>`
                  )}
                </select>
                <span style="font-size:var(--text-sm);color:var(--text2);">de cada mes</span>
              </div>
            </div>
          `}
          ${this._renderRangeFields()}
        `;

      case "cada-n":
        return html`
          <div class="field">
            <label class="field-label">Intervalo</label>
            <div style="display:flex;align-items:center;gap:0.375rem;">
              <span style="font-size:var(--text-sm);color:var(--text2);">Cada</span>
              <input class="field-input" type="number" min="1" max="365"
                style="width:4rem;"
                .value=${this.intervaloDias.toString()}
                @input=${(e: InputEvent) => {
                  const v = Number.parseInt((e.target as HTMLInputElement).value, 10);
                  if (v > 0 && v <= 365) this.intervaloDias = v;
                }}
              />
              <span style="font-size:var(--text-sm);color:var(--text2);">días</span>
            </div>
          </div>
          ${this._renderRangeFields()}
        `;

      case "fechas":
        return html`
          <div class="field">
            <label class="field-label">Fechas (YYYY-MM-DD, separadas por coma o salto de línea)</label>
            <textarea class="textarea"
              placeholder="2026-04-15, 2026-05-22, 2026-06-18"
              .value=${this.fechasText}
              @input=${(e: InputEvent) => { this.fechasText = (e.target as HTMLTextAreaElement).value; }}
            ></textarea>
          </div>
        `;

      default:
        return nothing;
    }
  }

  private _renderRangeFields() {
    return html`
      <div class="field">
        <label class="field-label">Desde</label>
        <input class="field-input" type="date"
          .value=${this.desde}
          @input=${(e: InputEvent) => { this.desde = (e.target as HTMLInputElement).value; }}
        />
      </div>
      <div class="field">
        <label class="field-label">Termina</label>
        <div class="end-toggle">
          <label class="end-opt" ?data-active=${this.endMode === "date"}>
            <input type="radio" name="end" value="date"
              .checked=${this.endMode === "date"}
              @change=${() => { this.endMode = "date"; }}
            /> En fecha
          </label>
          <label class="end-opt" ?data-active=${this.endMode === "count"}>
            <input type="radio" name="end" value="count"
              .checked=${this.endMode === "count"}
              @change=${() => { this.endMode = "count"; }}
            /> Después de
          </label>
        </div>
      </div>
      ${this.endMode === "date" ? html`
        <div class="field">
          <input class="field-input" type="date"
            .value=${this.hasta}
            @input=${(e: InputEvent) => { this.hasta = (e.target as HTMLInputElement).value; }}
          />
        </div>
      ` : html`
        <div class="field">
          <div style="display:flex;align-items:center;gap:0.375rem;">
            <input class="field-input" type="number" min="1" max="200"
              style="width:4rem;"
              .value=${this.cantidad.toString()}
              @input=${(e: InputEvent) => {
                const v = Number.parseInt((e.target as HTMLInputElement).value, 10);
                if (v > 0 && v <= 200) this.cantidad = v;
              }}
            />
            <span style="font-size:var(--text-sm);color:var(--text2);">ocurrencias</span>
          </div>
        </div>
      `}
    `;
  }

  private _renderDone() {
    const n = this.generatedCount;
    return html`
      <div class="overlay" @click=${(e: Event) => { if (e.target === e.currentTarget) this._close(); }}>
        <div class="dialog">
          <div class="dlg-header">
            <h2 class="dlg-title">🔁 Generar tareas</h2>
            <button class="dlg-close" @click=${this._close}>✕</button>
          </div>
          <div class="dlg-body">
            <div class="done-state">
              <div class="done-icon">✅</div>
              <p class="done-title">${n} tarea${n !== 1 ? "s" : ""} generada${n !== 1 ? "s" : ""}</p>
              <p class="done-desc">
                ${this.mode === "copia"
                  ? `Se ${n === 1 ? "creó 1 copia" : `crearon ${n} copias`} de "${this.tituloBase || this.base.titulo}".`
                  : `Las tareas ya aparecen en tu backlog con estado pendiente.`}
              </p>
            </div>
          </div>
          <div class="dlg-footer">
            <span></span>
            <button class="btn btn-primary" @click=${this._close}>Cerrar</button>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "task-generator-dialog": TaskGeneratorDialog;
  }
}
