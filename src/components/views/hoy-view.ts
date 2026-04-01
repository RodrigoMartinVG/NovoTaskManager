import { LitElement, css, html, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import type { FranjaDef, Materia, Sesion, Tarea } from "../../state/types.js";
import {
  filteredMaterias as materias,
  plannerData,
  filteredSesiones as sesiones,
  filteredTareas as tareas,
} from "../../state/store.js";
import { editingTaskId, statsMateriaId, statsReturnView, taskReturnView } from "../../state/navigation.js";
import { pomoActive, pomoStart } from "../../state/pomo.js";
import type { ViewId } from "../shell/nav-bar.js";
import { PreactSignalWatcher } from "../shared/preact-signal-watcher.js";

/* ═══ Helpers ═══ */
const DIA_NOMBRES = [
  "domingo", "lunes", "martes", "miércoles",
  "jueves", "viernes", "sábado",
];
const MES_NOMBRES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

/** 0=lun...6=dom from JS Date */
function hoyDia(): number {
  const d = new Date().getDay(); // 0=dom
  return d === 0 ? 6 : d - 1;
}

function getFranjaActual(franjas: FranjaDef[]): FranjaDef | null {
  const mins = new Date().getHours() * 60 + new Date().getMinutes();
  return franjas.find((f) => mins >= f.horaInicio && mins < f.horaFin) ?? null;
}

function fmtTime(h: number, m: number): string {
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

function fmtMins(m: number): string {
  const hh = Math.floor(m / 60);
  const mm = m % 60;
  return `${hh.toString().padStart(2, "0")}:${mm.toString().padStart(2, "0")}`;
}

function getWeekStart(): Date {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + diff);
}

function sesMinsSemana(materiaId: string, allSesiones: Sesion[]): number {
  const ws = getWeekStart();
  let total = 0;
  for (const s of allSesiones) {
    if (s.materiaId === materiaId && new Date(s.inicio) >= ws) total += s.minutos;
  }
  return total;
}

function fmtDur(mins: number): string {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

@customElement("hoy-view")
export class HoyView extends PreactSignalWatcher(LitElement) {
  @state() private _time = new Date();
  @state() private _showPomo = false;
  @state() private _pomoMatId = "";
  @state() private _pomoTareaId = "";
  @state() private _pomoTitulo = "";
  private _tick?: ReturnType<typeof setInterval>;

  override connectedCallback() {
    super.connectedCallback();
    this._tick = setInterval(() => {
      this._time = new Date();
    }, 30_000);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    if (this._tick) clearInterval(this._tick);
  }

  static styles = css`
    :host {
      display: block;
      max-width: var(--content-max-width, 75rem);
      margin: 0 auto;
      padding: var(--space-5, 1.5rem) var(--space-4, 1rem);
    }

    /* ── Hero Clock ── */
    .hero {
      text-align: center;
      padding: var(--space-4) 0 var(--space-3);
    }
    .hero-time {
      font-size: var(--text-5xl, 3rem);
      font-weight: 800;
      color: var(--text0);
      letter-spacing: -0.02em;
      line-height: 1.1;
    }
    .hero-date {
      font-size: var(--text-lg);
      color: var(--text2);
      margin-top: var(--space-1);
      text-transform: capitalize;
    }
    .hero-franja {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      margin-top: var(--space-2);
      padding: 0.25rem 0.75rem;
      border-radius: 1rem;
      background: color-mix(in srgb, var(--accent) 12%, var(--bg1));
      font-size: var(--text-sm);
      color: var(--accent);
      font-weight: 500;
    }

    /* ── Section ── */
    .section { margin-bottom: var(--space-5, 1.5rem); }
    .sec-hdr {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--space-3);
    }
    .sec-title {
      font-size: var(--text-base);
      font-weight: 700;
      color: var(--text1);
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    /* ── Ahora card (current franja materias) ── */
    .ahora-card {
      background: var(--bg1);
      border: 2px solid var(--accent);
      border-radius: 0.75rem;
      padding: var(--space-4);
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }
    .ahora-empty {
      text-align: center;
      padding: var(--space-3);
      color: var(--text3);
      font-size: var(--text-sm);
    }
    .mat-block {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      padding: var(--space-3);
      border-radius: 0.5rem;
      background: var(--bg0);
      border: 1px solid var(--border);
    }
    .mat-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .mat-dot {
      width: 0.75rem;
      height: 0.75rem;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .mat-name {
      font-size: var(--text-base);
      font-weight: 700;
      color: var(--text0);
      flex: 1;
      min-width: 0;
    }
    .mat-hours {
      font-size: var(--text-sm);
      color: var(--text2);
      font-weight: 500;
      flex-shrink: 0;
    }
    /* progress bar */
    .prog-bar {
      height: 0.375rem;
      background: var(--bg2);
      border-radius: 0.25rem;
      overflow: hidden;
    }
    .prog-fill {
      height: 100%;
      border-radius: 0.25rem;
      transition: width 0.3s;
    }
    /* task sub-list inside a materia block */
    .mat-tasks {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }
    .mat-tasks-label {
      font-size: var(--text-xs);
      color: var(--text3);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .task-mini {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      cursor: pointer;
      transition: background 0.12s;
      font-size: var(--text-sm);
      color: var(--text0);
    }
    .task-mini:hover { background: var(--bg1); }
    .task-estado {
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .estado-pendiente { background: var(--text3); }
    .estado-en_progreso { background: var(--accent); }
    .task-mini-title {
      flex: 1; min-width: 0;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .task-badge {
      font-size: 0.6rem;
      padding: 0.0625rem 0.325rem;
      border-radius: 0.2rem;
      font-weight: 600;
      flex-shrink: 0;
    }
    .badge-alta { background: var(--err-bg); color: var(--err-text); }
    .badge-oblig { background: var(--info-bg); color: var(--info-text); }
    .btn-pomo {
      align-self: flex-start;
      background: var(--info-bg, #e8e7f8);
      color: var(--info-text, #3930a0);
      border: 1px solid color-mix(in srgb, var(--info-text, #3930a0) 25%, transparent);
      padding: 0.4375rem 1rem;
      border-radius: 0.375rem;
      font: inherit;
      font-size: var(--text-sm);
      cursor: pointer;
      transition: opacity 0.16s;
    }
    .btn-pomo:hover { opacity: 0.85; }
    .btn-pomo:disabled { opacity: 0.5; cursor: not-allowed; }

    /* ── Pomo popup ── */
    .pomo-wrap { position: relative; }
    .pomo-popup {
      position: absolute;
      top: calc(100% + 0.5rem);
      right: 0;
      z-index: 50;
      background: var(--bg1);
      border: 1px solid var(--border);
      border-radius: 0.5rem;
      box-shadow: 0 4px 16px rgba(0,0,0,0.12);
      padding: var(--space-4, 1rem);
      min-width: 18rem;
      display: flex;
      flex-direction: column;
      gap: var(--space-3, 0.75rem);
    }
    .pomo-popup-title {
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--text0);
    }
    .pomo-popup .field-label {
      font-size: var(--text-xs);
      font-weight: 600;
      color: var(--text3);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-bottom: 0.125rem;
    }
    .pomo-popup select,
    .pomo-popup input {
      width: 100%;
      background: var(--bg0, var(--bg));
      color: var(--text1);
      border: 1px solid var(--border);
      border-radius: 0.375rem;
      padding: 0.375rem 0.5rem;
      font: inherit;
      font-size: var(--text-sm);
      box-sizing: border-box;
    }
    .pomo-popup input:focus {
      outline: none;
      border-color: var(--accent);
    }
    .pomo-popup-actions {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
    }
    .pomo-popup .btn-start {
      background: var(--accent);
      color: #fff;
      border: none;
      padding: 0.375rem 1rem;
      border-radius: 0.375rem;
      font: inherit;
      font-size: var(--text-sm);
      cursor: pointer;
    }
    .pomo-popup .btn-start:disabled { opacity: 0.5; cursor: not-allowed; }
    .pomo-popup .btn-cancel {
      background: var(--bg2);
      color: var(--text2);
      border: none;
      padding: 0.375rem 0.75rem;
      border-radius: 0.375rem;
      font: inherit;
      font-size: var(--text-sm);
      cursor: pointer;
    }

    /* ── Day timeline ── */
    .timeline {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }
    .tl-franja {
      display: flex;
      gap: var(--space-3);
      padding: var(--space-3);
      border-radius: 0.5rem;
      background: var(--bg1);
      border: 1px solid var(--border);
    }
    .tl-franja.is-past { opacity: 0.55; }
    .tl-franja.is-now {
      border-color: var(--accent);
      box-shadow: 0 0 0 1px var(--accent);
    }
    .tl-time {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 4.5rem;
      flex-shrink: 0;
      gap: 0.125rem;
    }
    .tl-emoji { font-size: 1.25rem; }
    .tl-range {
      font-size: var(--text-xs);
      color: var(--text3);
      white-space: nowrap;
    }
    .tl-fname {
      font-size: var(--text-xs);
      font-weight: 600;
      color: var(--text1);
    }
    .tl-badge-now {
      font-size: 0.6rem;
      font-weight: 700;
      color: var(--accent);
      background: color-mix(in srgb, var(--accent) 12%, transparent);
      padding: 0.0625rem 0.375rem;
      border-radius: 0.75rem;
      margin-top: 0.125rem;
    }
    .tl-mats {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
      flex: 1;
      min-width: 0;
    }
    .tl-mat-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .tl-mat-dot {
      width: 0.5rem; height: 0.5rem;
      border-radius: 50%; flex-shrink: 0;
    }
    .tl-mat-name {
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--text0);
    }
    .tl-mat-prog {
      font-size: var(--text-xs);
      color: var(--text3);
    }
    .tl-empty {
      font-size: var(--text-sm);
      color: var(--text3);
      font-style: italic;
    }

    /* ── Progress cards ── */
    .progress-row {
      display: flex;
      gap: var(--space-3);
      flex-wrap: wrap;
    }
    .prog-card {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--bg1);
      border: 1px solid var(--border);
      border-radius: 0.5rem;
      padding: 0.5rem 0.75rem;
      min-width: 10rem;
      flex: 1;
      cursor: pointer;
      transition: box-shadow 0.15s;
    }
    .prog-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,.08); }
    .prog-card-dot {
      width: 0.625rem; height: 0.625rem;
      border-radius: 50%; flex-shrink: 0;
    }
    .prog-card-info { display: flex; flex-direction: column; min-width: 0; flex: 1; }
    .prog-card-name {
      font-size: var(--text-sm); font-weight: 600; color: var(--text0);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .prog-card-detail { font-size: var(--text-xs); color: var(--text3); }
    .prog-card-bar {
      height: 0.25rem; background: var(--bg2); border-radius: 0.125rem;
      overflow: hidden; margin-top: 0.25rem;
    }
    .prog-card-fill {
      height: 100%; border-radius: 0.125rem; transition: width 0.3s;
    }

    /* ── Empty ── */
    .empty {
      text-align: center;
      padding: var(--space-4);
      color: var(--text3);
      font-size: var(--text-sm);
    }
    .empty-icon { font-size: 2rem; margin-bottom: var(--space-2); }

    @media (max-width: 600px) {
      .tl-time { min-width: 3.5rem; }
      .tl-franja { padding: var(--space-2); gap: var(--space-2); }
    }
  `;

  render() {
    const now = this._time;
    const h = now.getHours();
    const m = now.getMinutes();
    const franjas: FranjaDef[] = plannerData.value.franjas;
    const franja = getFranjaActual(franjas);
    const dia = hoyDia();
    const nowMins = h * 60 + m;
    const allMats = materias.value.filter((mm) => mm.activa !== false);

    // Materias in current franja
    const matsAhora = franja
      ? allMats.filter((mm) =>
          mm.slots?.some((s) => s.dia === dia && s.franjaId === franja.id),
        )
      : [];

    // Franjas that have materias today (sorted by horaInicio)
    const franjasHoy = franjas
      .filter((f) => allMats.some((mm) => mm.slots?.some((s) => s.dia === dia && s.franjaId === f.id)))
      .sort((a, b) => a.horaInicio - b.horaInicio);

    // All active mats for progress
    const matsConObj = allMats.filter((mm) =>
      (mm.slots?.length ?? 0) > 0 || (mm.horasSemanalesMin ?? 0) > 0
    );

    const allTareas = tareas.value.filter((t) => t.estado !== "completada");

    return html`
      <!-- Hero Clock -->
      <div class="hero">
        <div class="hero-time">${fmtTime(h, m)}</div>
        <div class="hero-date">${DIA_NOMBRES[now.getDay()]} ${now.getDate()} de ${MES_NOMBRES[now.getMonth()]}</div>
        ${franja
          ? html`<div class="hero-franja">${franja.emoji} ${franja.nombre}
              <span style="opacity:0.7;font-size:var(--text-xs)">${fmtMins(franja.horaInicio)} – ${fmtMins(franja.horaFin)}</span>
            </div>`
          : nothing}
      </div>

      <!-- AHORA: current franja materias -->
      <div class="section">
        <div class="sec-hdr">
          <div class="sec-title">🎯 Ahora</div>
          <div class="pomo-wrap">
            <button class="btn-pomo" @click=${this._togglePomo}
              ?disabled=${pomoActive.value}>
              ${pomoActive.value ? "⏱ Pomo activo" : "⏱ Iniciar Pomodoro"}
            </button>
            ${this._showPomo ? html`
              <div class="pomo-popup">
                <div class="pomo-popup-title">Iniciar sesión Pomodoro</div>
                <div>
                  <div class="field-label">Materia</div>
                  <select .value=${this._pomoMatId}
                    @change=${(e: Event) => { this._pomoMatId = (e.target as HTMLSelectElement).value; this._pomoTareaId = ""; }}>
                    <option value="">— Seleccionar —</option>
                    ${allMats.map((mm) => html`<option value=${mm.id}>${mm.nombre}</option>`)}
                  </select>
                </div>
                ${this._pomoMatId ? html`
                  <div>
                    <div class="field-label">Tarea (opcional)</div>
                    <select .value=${this._pomoTareaId}
                      @change=${(e: Event) => { this._pomoTareaId = (e.target as HTMLSelectElement).value; }}>
                      <option value="">— Sin tarea —</option>
                      ${this._pomoTareasForMateria().map((t) => html`<option value=${t.id}>${t.titulo}</option>`)}
                    </select>
                  </div>
                ` : nothing}
                <div>
                  <div class="field-label">Nombre de la sesión (opcional)</div>
                  <input type="text" placeholder="Ej: Repaso integrales"
                    .value=${this._pomoTitulo}
                    @input=${(e: Event) => { this._pomoTitulo = (e.target as HTMLInputElement).value; }} />
                </div>
                <div class="pomo-popup-actions">
                  <button class="btn-cancel" @click=${() => { this._showPomo = false; }}>Cancelar</button>
                  <button class="btn-start" ?disabled=${!this._pomoMatId} @click=${this._startPomo}>Iniciar ⏱</button>
                </div>
              </div>
            ` : nothing}
          </div>
        </div>
        ${matsAhora.length > 0 ? html`
          <div class="ahora-card">
            ${matsAhora.map((mm) => this._renderMateriaBlock(mm, allTareas))}
          </div>
        ` : html`
          <div class="ahora-card">
            <div class="ahora-empty">
              ${franja
                ? "No hay materias asignadas a esta franja hoy"
                : "No estás en ninguna franja horaria ahora mismo"}
            </div>
          </div>
        `}
      </div>

      <!-- TU DÍA: timeline of today's franjas -->
      ${franjasHoy.length > 0 ? html`
        <div class="section">
          <div class="sec-title">📅 Tu día</div>
          <div class="timeline">
            ${franjasHoy.map((f) => {
              const isPast = nowMins >= f.horaFin;
              const isNow = franja?.id === f.id;
              const fMats = allMats.filter((mm) =>
                mm.slots?.some((s) => s.dia === dia && s.franjaId === f.id),
              );
              return html`
                <div class="tl-franja ${isPast ? "is-past" : ""} ${isNow ? "is-now" : ""}">
                  <div class="tl-time">
                    <span class="tl-emoji">${f.emoji}</span>
                    <span class="tl-fname">${f.nombre}</span>
                    <span class="tl-range">${fmtMins(f.horaInicio)} – ${fmtMins(f.horaFin)}</span>
                    ${isNow ? html`<span class="tl-badge-now">AHORA</span>` : nothing}
                  </div>
                  <div class="tl-mats">
                    ${fMats.map((mm) => {
                      const sesMins = sesMinsSemana(mm.id, sesiones.value);
                      const objMins = (mm.horasSemanalesMin ?? 0) * 60;
                      return html`
                        <div class="tl-mat-row">
                          <span class="tl-mat-dot" style="background:${mm.color}"></span>
                          <span class="tl-mat-name">${mm.nombre}</span>
                          <span class="tl-mat-prog">${fmtDur(sesMins)}${objMins > 0 ? ` / ${fmtDur(objMins)}` : ""}</span>
                        </div>
                      `;
                    })}
                  </div>
                </div>
              `;
            })}
          </div>
        </div>
      ` : html`
        <div class="section">
          <div class="sec-title">📅 Tu día</div>
          <div class="empty">
            <div class="empty-icon">📭</div>
            No hay materias asignadas para hoy. Revisá tu grilla en Semana.
          </div>
        </div>
      `}

      <!-- Progreso semanal -->
      ${matsConObj.length > 0 ? html`
        <div class="section">
          <div class="sec-title">📊 Progreso semanal</div>
          <div class="progress-row">
            ${matsConObj.map((mm) => {
              const sesMins = sesMinsSemana(mm.id, sesiones.value);
              const objMins = (mm.horasSemanalesMin ?? 0) * 60;
              const pct = objMins > 0 ? Math.min(100, Math.round((sesMins / objMins) * 100)) : 0;
              return html`
                <div class="prog-card" @click=${() => this._openStats(mm.id)}>
                  <div class="prog-card-dot" style="background:${mm.color}"></div>
                  <div class="prog-card-info">
                    <div class="prog-card-name">${mm.nombre}</div>
                    <div class="prog-card-detail">
                      ${fmtDur(sesMins)}${objMins > 0 ? ` / ${fmtDur(objMins)} (${pct}%)` : ""}
                    </div>
                    ${objMins > 0 ? html`
                      <div class="prog-card-bar">
                        <div class="prog-card-fill" style="width:${pct}%;background:${mm.color}"></div>
                      </div>
                    ` : nothing}
                  </div>
                </div>
              `;
            })}
          </div>
        </div>
      ` : nothing}
    `;
  }

  /** Renders a materia block inside the "Ahora" section */
  private _renderMateriaBlock(m: Materia, allTareas: Tarea[]) {
    const sesMins = sesMinsSemana(m.id, sesiones.value);
    const objMins = (m.horasSemanalesMin ?? 0) * 60;
    const pct = objMins > 0 ? Math.min(100, Math.round((sesMins / objMins) * 100)) : 0;

    // Relevant tasks: in_progreso first, then pendientes
    const matTareas = allTareas
      .filter((t) => t.materiaId === m.id)
      .sort((a, b) => {
        if (a.estado === "en_progreso" && b.estado !== "en_progreso") return -1;
        if (b.estado === "en_progreso" && a.estado !== "en_progreso") return 1;
        return 0;
      })
      .slice(0, 5);

    return html`
      <div class="mat-block">
        <div class="mat-header">
          <span class="mat-dot" style="background:${m.color}"></span>
          <span class="mat-name">${m.nombre}</span>
          <span class="mat-hours">${fmtDur(sesMins)}${objMins > 0 ? ` / ${fmtDur(objMins)}` : ""}</span>
        </div>
        ${objMins > 0 ? html`
          <div class="prog-bar">
            <div class="prog-fill" style="width:${pct}%;background:${m.color}"></div>
          </div>
        ` : nothing}
        ${matTareas.length > 0 ? html`
          <div class="mat-tasks">
            <span class="mat-tasks-label">Tareas</span>
            ${matTareas.map((t) => html`
              <div class="task-mini" @click=${() => this._openTask(t.id)}>
                <span class="task-estado estado-${t.estado}"></span>
                <span class="task-mini-title">${t.titulo}</span>
                ${t.obligatorio ? html`<span class="task-badge badge-oblig">Oblig</span>` : nothing}
                ${t.prioridad === "alta" ? html`<span class="task-badge badge-alta">Alta</span>` : nothing}
              </div>
            `)}
          </div>
        ` : nothing}
      </div>
    `;
  }

  private _openTask(id: string) {
    editingTaskId.value = id;
    taskReturnView.value = "hoy";
    this.dispatchEvent(new CustomEvent<ViewId>("view-change", {
      detail: "task",
      bubbles: true,
      composed: true,
    }));
  }

  private _openStats(materiaId: string) {
    statsMateriaId.value = materiaId;
    statsReturnView.value = "hoy";
    this.dispatchEvent(new CustomEvent<ViewId>("view-change", {
      detail: "materia-stats",
      bubbles: true,
      composed: true,
    }));
  }

  private _togglePomo() {
    this._showPomo = !this._showPomo;
    if (this._showPomo) {
      this._pomoMatId = "";
      this._pomoTareaId = "";
      this._pomoTitulo = "";
    }
  }

  private _startPomo() {
    if (!this._pomoMatId || pomoActive.value) return;
    const tarea = this._pomoTareaId
      ? plannerData.value.tareas.find((t) => t.id === this._pomoTareaId)
      : null;
    pomoStart({
      materiaId: this._pomoMatId,
      tareaId: this._pomoTareaId || null,
      titulo: this._pomoTitulo || tarea?.titulo || "",
    });
    this._showPomo = false;
  }

  private _pomoTareasForMateria() {
    if (!this._pomoMatId) return [];
    return plannerData.value.tareas.filter(
      (t) => t.materiaId === this._pomoMatId && t.estado !== "completada",
    );
  }
}
