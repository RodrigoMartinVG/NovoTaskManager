import { SignalWatcher } from "@lit-labs/signals";
import { LitElement, css, html, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import type { Sesion } from "../../state/types.js";
import {
  addSesion,
  deleteSesion,
  materias,
  plannerData,
  updateSesion,
} from "../../state/store.js";
import { editingSesionId, sesionReturnView } from "../../state/navigation.js";
import type { ViewId } from "../shell/nav-bar.js";

const uid = () => crypto.randomUUID();

/** Generate time options (HH:MM) every 15 minutes */
function timeOptions(): string[] {
  const opts: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      opts.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
    }
  }
  return opts;
}

const TIME_OPTIONS = timeOptions();

/** Duration presets (minutes) */
const DUR_PRESETS = [15, 25, 30, 45, 60, 90, 120];

@customElement("sesion-edit-view")
export class SesionEditView extends SignalWatcher(LitElement) {
  @state() private materiaId = "";
  @state() private tareaId = "";
  @state() private fecha = "";
  @state() private hora = "";
  @state() private minutos = 25;
  @state() private origen: "timer" | "manual" = "manual";
  @state() private titulo = "";

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

    .section {
      display: flex;
      flex-direction: column;
      gap: var(--space-4, 1rem);
    }

    /* ── Form fields ── */
    .field {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .field-label {
      font-size: var(--text-xs);
      font-weight: 600;
      color: var(--text3);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .field-input {
      background: var(--bg0, var(--bg));
      color: var(--text1);
      border: 1px solid var(--border);
      border-radius: 0.375rem;
      padding: 0.5rem 0.625rem;
      font: inherit;
      font-size: var(--text-sm);
      transition: border-color 0.16s;
    }
    .field-input:focus {
      outline: none;
      border-color: var(--accent);
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 20%, transparent);
    }

    .title-input {
      font-size: var(--text-lg);
      font-weight: 600;
      padding: 0.625rem 0.75rem;
    }

    /* ── Row layout ── */
    .field-row {
      display: flex;
      gap: var(--space-3, 0.75rem);
      flex-wrap: wrap;
    }
    .field-row > .field { flex: 1; min-width: 8rem; }

    /* ── Duration presets ── */
    .dur-presets {
      display: flex;
      gap: 0.375rem;
      flex-wrap: wrap;
    }
    .dur-chip {
      background: var(--bg2);
      color: var(--text2);
      border: 1px solid var(--border);
      border-radius: 1rem;
      padding: 0.25rem 0.75rem;
      font: inherit;
      font-size: var(--text-xs);
      cursor: pointer;
      transition: all 0.16s;
    }
    .dur-chip:hover { background: var(--bg1); color: var(--text0); }
    .dur-chip.active {
      background: var(--accent);
      color: #fff;
      border-color: var(--accent);
    }

    .dur-custom {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 0.375rem;
    }
    .dur-custom input {
      width: 4rem;
      text-align: center;
    }
    .dur-custom span {
      font-size: var(--text-sm);
      color: var(--text3);
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
      align-self: start;
    }

    .sidebar-title {
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--text0);
    }

    .mat-preview {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem;
      background: var(--bg2);
      border-radius: 0.375rem;
    }
    .mat-dot {
      width: 0.75rem;
      height: 0.75rem;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .mat-name { font-size: var(--text-sm); color: var(--text1); }

    /* ── Actions ── */
    .actions {
      display: flex;
      gap: var(--space-3, 0.75rem);
      padding-top: var(--space-4, 1rem);
      border-top: 1px solid var(--border);
      flex-wrap: wrap;
    }
    .btn {
      border: none;
      border-radius: 0.375rem;
      padding: 0.5rem 1.25rem;
      font: inherit;
      font-size: var(--text-sm);
      cursor: pointer;
      transition: all 0.16s;
    }
    .btn-save {
      background: var(--accent);
      color: #fff;
    }
    .btn-save:hover { opacity: 0.85; }
    .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-cancel {
      background: var(--bg2);
      color: var(--text2);
    }
    .btn-cancel:hover { background: var(--border); color: var(--text0); }
    .btn-del {
      background: var(--err-bg, #fce4e4);
      color: var(--err-text, #991b1b);
      margin-left: auto;
    }
    .btn-del:hover { opacity: 0.85; }

    .error-msg {
      font-size: var(--text-xs);
      color: var(--err-text, #991b1b);
    }

    .origen-badge {
      display: inline-block;
      font-size: var(--text-sm);
      padding: 0.25rem 0.625rem;
      border-radius: 0.375rem;
      background: var(--bg2);
      color: var(--text3);
    }
    .origen-badge.timer { background: var(--info-bg, #e8e7f8); color: var(--info-text, #3930a0); }
    .origen-badge.manual { background: var(--ok-bg, #e5fbe9); color: var(--ok-text, #146035); }
  `;

  willUpdate() {
    if (this._initialized) return;
    this._initialized = true;

    const sid = editingSesionId.value;
    if (!sid || sid === "new") {
      // Creating new session — set defaults
      const today = new Date();
      this.fecha = today.toISOString().slice(0, 10);
      this.hora = `${today.getHours().toString().padStart(2, "0")}:${(Math.floor(today.getMinutes() / 15) * 15).toString().padStart(2, "0")}`;
      this.minutos = 25;
      this.origen = "manual";
      this.titulo = "";
      this.materiaId = "";
      this.tareaId = "";
      return;
    }

    const ses = plannerData.value.sesiones.find((s) => s.id === sid);
    if (!ses) return;

    const d = new Date(ses.inicio);
    this.fecha = ses.inicio.slice(0, 10);
    this.hora = `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
    this.minutos = ses.minutos;
    this.origen = ses.origen;
    this.titulo = ses.titulo ?? "";
    this.materiaId = ses.materiaId;
    this.tareaId = ses.tareaId ?? "";
  }

  /* ── Helpers ── */

  private get _isNew() {
    return !editingSesionId.value || editingSesionId.value === "new";
  }

  private get _canSave() {
    return this.materiaId !== "" && this.fecha !== "" && this.minutos > 0;
  }

  private _matColor(id: string): string {
    return materias.value.find((m) => m.id === id)?.color ?? "var(--text3)";
  }

  private _matName(id: string): string {
    return materias.value.find((m) => m.id === id)?.nombre ?? "";
  }

  private _tareasForMateria() {
    if (!this.materiaId) return [];
    return plannerData.value.tareas.filter((t) => t.materiaId === this.materiaId);
  }

  /* ── Actions ── */

  private _goBack() {
    editingSesionId.value = null;
    this._initialized = false;
    const ret = sesionReturnView.value as ViewId;
    this.dispatchEvent(new CustomEvent<ViewId>("view-change", { detail: ret, bubbles: true, composed: true }));
  }

  private _save() {
    if (!this._canSave) return;

    // Build inicio datetime
    const [hh, mm] = this.hora.split(":").map(Number);
    const dt = new Date(this.fecha);
    dt.setHours(hh, mm, 0, 0);
    const inicio = dt.toISOString().replace("Z", "").slice(0, 19);

    const patch: Omit<Sesion, "id"> = {
      materiaId: this.materiaId,
      tareaId: this.tareaId || null,
      inicio,
      minutos: this.minutos,
      origen: this.origen,
      titulo: this.titulo || undefined,
    };

    if (this._isNew) {
      addSesion({ id: uid(), ...patch });
    } else {
      updateSesion(editingSesionId.value!, patch);
    }

    this._goBack();
  }

  private _delete() {
    if (!this.confirmDelete) {
      this.confirmDelete = true;
      return;
    }
    const sid = editingSesionId.value;
    if (sid && sid !== "new") {
      deleteSesion(sid);
    }
    this._goBack();
  }

  /* ── Render ── */

  render() {
    const allMats = materias.value.filter((m) => m.activa !== false);
    const tareasMateria = this._tareasForMateria();

    return html`
      <!-- Header -->
      <div class="hdr">
        <button class="back-btn" @click=${this._goBack} aria-label="Volver a sesiones">← Volver</button>
        <h2 class="hdr-title">${this._isNew ? "Nueva sesión" : "Editar sesión"}</h2>
      </div>

      <div class="form">
        <!-- Main section -->
        <div class="section">
          <!-- Título -->
          <div class="field">
            <label class="field-label">Título (opcional)</label>
            <input class="field-input title-input"
              type="text"
              placeholder="Ej: Repaso integrales"
              .value=${this.titulo}
              @input=${(e: Event) => { this.titulo = (e.target as HTMLInputElement).value; }}
            />
          </div>

          <!-- Fecha + Hora -->
          <div class="field-row">
            <div class="field">
              <label class="field-label">Fecha</label>
              <input class="field-input" type="date"
                .value=${this.fecha}
                @input=${(e: Event) => { this.fecha = (e.target as HTMLInputElement).value; }}
              />
            </div>
            <div class="field">
              <label class="field-label">Hora de inicio</label>
              <select class="field-input"
                .value=${this.hora}
                @change=${(e: Event) => { this.hora = (e.target as HTMLSelectElement).value; }}>
                ${TIME_OPTIONS.map((t) => html`<option value=${t} ?selected=${t === this.hora}>${t}</option>`)}
              </select>
            </div>
          </div>

          <!-- Duración -->
          <div class="field">
            <label class="field-label">Duración</label>
            <div class="dur-presets">
              ${DUR_PRESETS.map(
                (d) => html`
                  <button class="dur-chip ${this.minutos === d ? "active" : ""}"
                    @click=${() => { this.minutos = d; }}>
                    ${d < 60 ? `${d}m` : `${d / 60}h`}
                  </button>
                `,
              )}
            </div>
            <div class="dur-custom">
              <input class="field-input" type="number" min="1" max="600"
                .value=${this.minutos.toString()}
                @input=${(e: Event) => {
                  const v = Number.parseInt((e.target as HTMLInputElement).value, 10);
                  if (v > 0 && v <= 600) this.minutos = v;
                }}
              />
              <span>minutos</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="actions">
            <button class="btn btn-save" ?disabled=${!this._canSave} @click=${this._save}>
              ${this._isNew ? "Registrar" : "Guardar"}
            </button>
            <button class="btn btn-cancel" @click=${this._goBack}>Cancelar</button>
            ${!this._isNew
              ? html`
                <button class="btn btn-del" @click=${this._delete}>
                  ${this.confirmDelete ? "Confirmar eliminación" : "Eliminar"}
                </button>
              `
              : nothing}
          </div>
          ${!this._canSave
            ? html`<span class="error-msg">Elegí una materia, una fecha y una duración.</span>`
            : nothing}
        </div>

        <!-- Sidebar -->
        <div class="sidebar-card">
          <div class="sidebar-title">Detalles</div>

          <!-- Materia -->
          <div class="field">
            <label class="field-label">Materia</label>
            <select class="field-input"
              .value=${this.materiaId}
              @change=${(e: Event) => {
                this.materiaId = (e.target as HTMLSelectElement).value;
                this.tareaId = "";
              }}>
              <option value="">— Seleccionar —</option>
              ${allMats.map((m) => html`<option value=${m.id}>${m.nombre}</option>`)}
            </select>
          </div>

          ${this.materiaId
            ? html`
              <div class="mat-preview">
                <span class="mat-dot" style="background:${this._matColor(this.materiaId)}" aria-hidden="true"></span>
                <span class="mat-name">${this._matName(this.materiaId)}</span>
              </div>
            `
            : nothing}

          <!-- Tarea (optional) -->
          <div class="field">
            <label class="field-label">Tarea (opcional)</label>
            <select class="field-input"
              .value=${this.tareaId}
              @change=${(e: Event) => { this.tareaId = (e.target as HTMLSelectElement).value; }}>
              <option value="">— Sin tarea —</option>
              ${tareasMateria.map((t) => html`<option value=${t.id}>${t.titulo}</option>`)}
            </select>
          </div>

          <!-- Origen (read-only) -->
          <div class="field">
            <label class="field-label">Origen</label>
            <span class="origen-badge ${this.origen}">
              ${this.origen === "timer" ? "⏱ Pomodoro" : "✏️ Manual"}
            </span>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "sesion-edit-view": SesionEditView;
  }
}
