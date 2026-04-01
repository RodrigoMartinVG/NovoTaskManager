/* ═══ Oda v3.0 — Materia Stats View ═══ */
import { SignalWatcher } from "@lit-labs/signals";
import { effect } from "@preact/signals-core";
import { LitElement, css, html, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import type { EstadoTarea, Materia, Sesion, Tarea, FranjaDef, MateriaSlot } from "../../state/types.js";
import {
  editingMateriaId,
  materiaReturnView,
  plannerData,
  statsMateriaId,
  statsReturnView,
} from "../../state/store.js";
import type { ViewId } from "../shell/nav-bar.js";

/* ═══ Helpers ═══ */
const DIA_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function fmtDur(mins: number): string {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}`;
}

function weekStart(d: Date): Date {
  const dt = new Date(d);
  const day = dt.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  dt.setDate(dt.getDate() + diff);
  dt.setHours(0, 0, 0, 0);
  return dt;
}

function weeksAgo(n: number): Date {
  const ws = weekStart(new Date());
  ws.setDate(ws.getDate() - n * 7);
  return ws;
}

type EstadoKey = EstadoTarea;
const ESTADO_LABEL: Record<EstadoKey, string> = {
  pendiente: "Pendiente",
  en_progreso: "En progreso",
  completada: "Completada",
};
const ESTADO_COLOR: Record<EstadoKey, string> = {
  pendiente: "var(--warn-text, #7a4808)",
  en_progreso: "var(--info-text, #3930a0)",
  completada: "var(--ok-text, #146035)",
};
const PRIO_LABEL: Record<string, string> = { alta: "Alta", media: "Media", baja: "Baja" };
const PRIO_ICON: Record<string, string> = { alta: "🔴", media: "🟡", baja: "🟢" };

/* ═══ Component ═══ */
@customElement("materia-stats-view")
export class MateriaStatsView extends SignalWatcher(LitElement) {
  @state() private _mat: Materia | null = null;
  @state() private _tareas: Tarea[] = [];
  @state() private _sesiones: Sesion[] = [];
  @state() private _franjas: FranjaDef[] = [];

  private _dispose?: () => void;

  override connectedCallback() {
    super.connectedCallback();
    this._dispose = effect(() => {
      const id = statsMateriaId.value;
      const data = plannerData.value;
      this._mat = data.materias.find((m) => m.id === id) ?? null;
      this._tareas = id ? data.tareas.filter((t) => t.materiaId === id) : [];
      this._sesiones = id ? data.sesiones.filter((s) => s.materiaId === id) : [];
      this._franjas = data.franjas;
      this.requestUpdate();
    });
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this._dispose?.();
  }

  static styles = css`
    :host {
      display: block;
      max-width: var(--content-max-width, 60rem);
      margin: 0 auto;
      padding: var(--space-5, 1.5rem) var(--space-4, 1rem);
    }

    /* ── Header ── */
    .hdr {
      display: flex; align-items: center; gap: var(--space-3, 0.75rem);
      margin-bottom: var(--space-5, 1.5rem);
    }
    .btn-back {
      background: transparent; border: 1px solid var(--border); border-radius: 0.375rem;
      padding: 0.375rem 0.625rem; font: inherit; font-size: var(--text-sm);
      color: var(--text2); cursor: pointer; transition: all 0.12s;
      display: inline-flex; align-items: center; gap: 0.25rem;
    }
    .btn-back:hover { background: var(--bg2); color: var(--text0); }
    .hdr-dot {
      width: 0.875rem; height: 0.875rem; border-radius: 50%; flex-shrink: 0;
    }
    .hdr-title { font-size: var(--text-xl); font-weight: 700; color: var(--text0); margin: 0; flex: 1; }
    .hdr-sub { font-size: var(--text-xs); color: var(--text3); }
    .btn-edit {
      background: transparent; color: var(--accent); border: 1px solid var(--accent);
      border-radius: 0.375rem; padding: 0.375rem 0.75rem; font: inherit;
      font-size: var(--text-xs); font-weight: 600; cursor: pointer;
      transition: all 0.12s; white-space: nowrap;
    }
    .btn-edit:hover { background: var(--accent); color: #fff; }

    /* ── Stat cards row ── */
    .stat-row {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
      gap: var(--space-3, 0.75rem); margin-bottom: var(--space-5, 1.5rem);
    }
    .stat-card {
      background: var(--bg1); border: 1px solid var(--border); border-radius: 0.625rem;
      padding: var(--space-3, 0.75rem) var(--space-4, 1rem);
      display: flex; flex-direction: column; gap: 0.25rem;
    }
    .stat-label { font-size: var(--text-xs); color: var(--text3); font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
    .stat-value { font-size: var(--text-lg, 1.125rem); font-weight: 700; color: var(--text0); }
    .stat-sub { font-size: var(--text-xs); color: var(--text2); }

    /* ── Sections ── */
    .section {
      margin-bottom: var(--space-5, 1.5rem);
    }
    .sec-title {
      font-size: var(--text-base); font-weight: 700; color: var(--text0);
      margin-bottom: var(--space-3, 0.75rem);
      display: flex; align-items: center; gap: 0.375rem;
    }

    /* ── Progress bar ── */
    .prog-wrap {
      background: var(--bg1); border: 1px solid var(--border); border-radius: 0.625rem;
      padding: var(--space-4, 1rem);
    }
    .prog-info {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: var(--space-2, 0.5rem);
    }
    .prog-bar {
      height: 0.625rem; background: var(--bg3); border-radius: 0.375rem;
      overflow: hidden;
    }
    .prog-fill {
      height: 100%; border-radius: 0.375rem;
      transition: width 0.3s var(--ease-out, ease-out);
    }

    /* ── Weekly chart ── */
    .chart-wrap {
      background: var(--bg1); border: 1px solid var(--border); border-radius: 0.625rem;
      padding: var(--space-4, 1rem);
    }
    .chart {
      display: flex; align-items: flex-end; gap: 0.5rem;
      height: 7rem;
    }
    .chart-col {
      flex: 1; display: flex; flex-direction: column; align-items: center;
      gap: 0.25rem; height: 100%;
      justify-content: flex-end;
    }
    .chart-bar-wrap {
      width: 100%; flex: 1; display: flex; align-items: flex-end;
    }
    .chart-bar {
      width: 100%; border-radius: 0.25rem 0.25rem 0 0;
      min-height: 2px; transition: height 0.3s;
    }
    .chart-label {
      font-size: 0.625rem; color: var(--text3); white-space: nowrap;
    }
    .chart-val {
      font-size: 0.625rem; color: var(--text2); font-weight: 600;
    }

    /* ── Breakdown tables ── */
    .bk-grid {
      display: grid; grid-template-columns: 1fr 1fr;
      gap: var(--space-3, 0.75rem);
    }
    @media (max-width: 32rem) {
      .bk-grid { grid-template-columns: 1fr; }
    }
    .bk-card {
      background: var(--bg1); border: 1px solid var(--border); border-radius: 0.625rem;
      padding: var(--space-3, 0.75rem) var(--space-4, 1rem);
    }
    .bk-title {
      font-size: var(--text-sm); font-weight: 600; color: var(--text1);
      margin-bottom: var(--space-2, 0.5rem);
    }
    .bk-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 0.25rem 0; font-size: var(--text-sm);
    }
    .bk-row + .bk-row { border-top: 1px solid var(--border); }
    .bk-dot {
      width: 0.5rem; height: 0.5rem; border-radius: 50%;
      display: inline-block; margin-right: 0.375rem;
    }
    .bk-count { font-weight: 600; color: var(--text0); }

    /* ── Session list ── */
    .ses-list {
      background: var(--bg1); border: 1px solid var(--border); border-radius: 0.625rem;
      overflow: hidden;
    }
    .ses-row {
      display: flex; align-items: center; gap: var(--space-3, 0.75rem);
      padding: var(--space-2, 0.5rem) var(--space-4, 1rem);
      font-size: var(--text-sm); color: var(--text1);
    }
    .ses-row + .ses-row { border-top: 1px solid var(--border); }
    .ses-date { color: var(--text3); min-width: 3rem; }
    .ses-title { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .ses-dur { font-weight: 600; color: var(--text0); white-space: nowrap; }
    .ses-origin { font-size: var(--text-xs); color: var(--text3); }
    .ses-empty { padding: var(--space-4, 1rem); text-align: center; color: var(--text3); font-size: var(--text-sm); }

    /* ── Slots visual ── */
    .slot-visual {
      display: grid;
      grid-template-columns: minmax(5rem, auto) repeat(7, 1fr);
      gap: 0.25rem; font-size: var(--text-xs);
      background: var(--bg1); border: 1px solid var(--border); border-radius: 0.625rem;
      padding: var(--space-3, 0.75rem) var(--space-4, 1rem);
    }
    .slot-visual .day-hdr { text-align: center; font-weight: 600; color: var(--text2); padding: 0.125rem 0; }
    .slot-visual .franja-label { display: flex; align-items: center; gap: 0.25rem; color: var(--text2); white-space: nowrap; }
    .slot-dot-cell { display: flex; align-items: center; justify-content: center; }
    .slot-dot { width: 0.875rem; height: 0.875rem; border-radius: 0.25rem; }
    .slot-dot-on { opacity: 0.85; }
    .slot-dot-off { background: var(--bg3); }

    /* ── Empty ── */
    .empty {
      text-align: center; padding: var(--space-8, 3rem) var(--space-4, 1rem); color: var(--text2);
    }
    .empty-icon { font-size: 2.5rem; margin-bottom: var(--space-3, 0.75rem); }
    .empty-title { font-size: 1rem; font-weight: 600; color: var(--text1); margin: 0 0 var(--space-2, 0.5rem); }
  `;

  /* ── Navigation ── */
  private _goBack() {
    this.dispatchEvent(
      new CustomEvent<ViewId>("view-change", {
        detail: statsReturnView.value as ViewId,
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _goEdit() {
    editingMateriaId.value = this._mat!.id;
    materiaReturnView.value = "materia-stats";
    this.dispatchEvent(
      new CustomEvent<ViewId>("view-change", {
        detail: "materia-edit",
        bubbles: true,
        composed: true,
      }),
    );
  }

  /* ── Computed stats ── */
  private _weekSesiones(): { weekLabel: string; mins: number }[] {
    const result: { weekLabel: string; mins: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const ws = weeksAgo(i);
      const we = new Date(ws);
      we.setDate(we.getDate() + 7);
      const mins = this._sesiones
        .filter((s) => { const d = new Date(s.inicio); return d >= ws && d < we; })
        .reduce((acc, s) => acc + s.minutos, 0);
      const label = i === 0 ? "Esta" : i === 1 ? "Ant." : `−${i}`;
      result.push({ weekLabel: label, mins });
    }
    return result;
  }

  private _thisWeekMins(): number {
    const ws = weekStart(new Date());
    return this._sesiones
      .filter((s) => new Date(s.inicio) >= ws)
      .reduce((acc, s) => acc + s.minutos, 0);
  }

  private _totalMins(): number {
    return this._sesiones.reduce((acc, s) => acc + s.minutos, 0);
  }

  private _avgSessionMins(): number {
    if (this._sesiones.length === 0) return 0;
    return Math.round(this._totalMins() / this._sesiones.length);
  }

  private _tasksByEstado(): Record<EstadoKey, number> {
    const counts: Record<EstadoKey, number> = { pendiente: 0, en_progreso: 0, completada: 0 };
    for (const t of this._tareas) counts[t.estado]++;
    return counts;
  }

  private _tasksByPrio(): Record<string, number> {
    const counts: Record<string, number> = { alta: 0, media: 0, baja: 0 };
    for (const t of this._tareas) counts[t.prioridad] = (counts[t.prioridad] ?? 0) + 1;
    return counts;
  }

  private _tasksByTipo(): { nombre: string; count: number }[] {
    const tipos = plannerData.value.tipos;
    const map = new Map<string, number>();
    for (const t of this._tareas) {
      map.set(t.tipo, (map.get(t.tipo) ?? 0) + 1);
    }
    return tipos
      .filter((tp) => map.has(tp.id))
      .map((tp) => ({ nombre: `${tp.icono} ${tp.nombre}`, count: map.get(tp.id)! }));
  }

  /* ── Render ── */
  render() {
    const mat = this._mat;
    if (!mat) {
      return html`
        <div class="empty">
          <div class="empty-icon">📊</div>
          <p class="empty-title">Materia no encontrada</p>
          <button class="btn-back" @click=${this._goBack}>← Volver</button>
        </div>
      `;
    }

    const totalMins = this._totalMins();
    const thisWeekMins = this._thisWeekMins();
    const avgSes = this._avgSessionMins();
    const byEstado = this._tasksByEstado();
    const byPrio = this._tasksByPrio();
    const byTipo = this._tasksByTipo();
    const weekData = this._weekSesiones();
    const maxWeekMins = Math.max(...weekData.map((w) => w.mins), 1);
    const objMins = (mat.horasSemanalesMin ?? 0) * 60;
    const pct = objMins > 0 ? Math.min(100, Math.round((thisWeekMins / objMins) * 100)) : 0;
    const completionPct = this._tareas.length > 0
      ? Math.round((byEstado.completada / this._tareas.length) * 100)
      : 0;
    const recentSesiones = [...this._sesiones].sort((a, b) => b.inicio.localeCompare(a.inicio)).slice(0, 10);
    const slots = mat.slots ?? [];
    const franjas = this._franjas;

    return html`
      <!-- Header -->
      <div class="hdr">
        <button class="btn-back" @click=${this._goBack}>←</button>
        <span class="hdr-dot" style="background:${mat.color}"></span>
        <div>
          <h1 class="hdr-title">${mat.nombre}</h1>
          ${(mat.codigo || mat.anio || mat.periodo) ? html`
            <span class="hdr-sub">
              ${[mat.codigo, mat.anio ? `Año ${mat.anio}` : "", mat.periodo === "anual" ? "Anual" : mat.periodo ?? ""].filter(Boolean).join(" · ")}
            </span>
          ` : nothing}
        </div>
        <button class="btn-edit" @click=${this._goEdit}>✏️ Editar</button>
      </div>

      <!-- Overview stats -->
      <div class="stat-row">
        <div class="stat-card">
          <span class="stat-label">Total estudiado</span>
          <span class="stat-value">${fmtDur(totalMins)}</span>
          <span class="stat-sub">${this._sesiones.length} sesión${this._sesiones.length !== 1 ? "es" : ""}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Esta semana</span>
          <span class="stat-value">${fmtDur(thisWeekMins)}</span>
          ${objMins > 0 ? html`<span class="stat-sub">${pct}% del objetivo</span>` : nothing}
        </div>
        <div class="stat-card">
          <span class="stat-label">Promedio por sesión</span>
          <span class="stat-value">${fmtDur(avgSes)}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Tareas</span>
          <span class="stat-value">${this._tareas.length}</span>
          <span class="stat-sub">${completionPct}% completadas</span>
        </div>
      </div>

      <!-- Weekly progress -->
      ${objMins > 0 ? html`
        <div class="section">
          <div class="sec-title">📈 Progreso semanal</div>
          <div class="prog-wrap">
            <div class="prog-info">
              <span style="font-size:var(--text-sm);color:var(--text1);font-weight:600">${fmtDur(thisWeekMins)} / ${fmtDur(objMins)}</span>
              <span style="font-size:var(--text-sm);color:var(--text2)">${pct}%</span>
            </div>
            <div class="prog-bar">
              <div class="prog-fill" style="width:${pct}%;background:${mat.color}"></div>
            </div>
          </div>
        </div>
      ` : nothing}

      <!-- Last 6 weeks chart -->
      ${this._sesiones.length > 0 ? html`
        <div class="section">
          <div class="sec-title">📊 Horas por semana</div>
          <div class="chart-wrap">
            <div class="chart">
              ${weekData.map((w) => {
                const h = maxWeekMins > 0 ? Math.max(2, (w.mins / maxWeekMins) * 100) : 2;
                return html`
                  <div class="chart-col">
                    <span class="chart-val">${w.mins > 0 ? fmtDur(w.mins) : ""}</span>
                    <div class="chart-bar-wrap">
                      <div class="chart-bar" style="height:${h}%;background:${mat.color}"></div>
                    </div>
                    <span class="chart-label">${w.weekLabel}</span>
                  </div>
                `;
              })}
            </div>
            ${objMins > 0 ? html`<div style="margin-top:0.5rem;font-size:var(--text-xs);color:var(--text3);text-align:center">Objetivo: ${fmtDur(objMins)}/sem</div>` : nothing}
          </div>
        </div>
      ` : nothing}

      <!-- Tasks breakdown -->
      ${this._tareas.length > 0 ? html`
        <div class="section">
          <div class="sec-title">📋 Tareas</div>
          <div class="bk-grid">
            <div class="bk-card">
              <div class="bk-title">Por estado</div>
              ${(["pendiente", "en_progreso", "completada"] as EstadoKey[]).map((e) => html`
                <div class="bk-row">
                  <span><span class="bk-dot" style="background:${ESTADO_COLOR[e]}"></span>${ESTADO_LABEL[e]}</span>
                  <span class="bk-count">${byEstado[e]}</span>
                </div>
              `)}
            </div>
            <div class="bk-card">
              <div class="bk-title">Por prioridad</div>
              ${(["alta", "media", "baja"] as const).map((p) => html`
                <div class="bk-row">
                  <span>${PRIO_ICON[p]} ${PRIO_LABEL[p]}</span>
                  <span class="bk-count">${byPrio[p] ?? 0}</span>
                </div>
              `)}
            </div>
            ${byTipo.length > 0 ? html`
              <div class="bk-card">
                <div class="bk-title">Por tipo</div>
                ${byTipo.map((t) => html`
                  <div class="bk-row">
                    <span>${t.nombre}</span>
                    <span class="bk-count">${t.count}</span>
                  </div>
                `)}
              </div>
            ` : nothing}
          </div>
        </div>
      ` : nothing}

      <!-- Slots / schedule -->
      ${franjas.length > 0 && slots.length > 0 ? html`
        <div class="section">
          <div class="sec-title">🗓️ Horarios</div>
          <div class="slot-visual">
            <div></div>
            ${DIA_LABELS.map((d) => html`<div class="day-hdr">${d}</div>`)}
            ${franjas.map((f) => html`
              <div class="franja-label">${f.emoji} ${f.nombre}</div>
              ${DIA_LABELS.map((_, di) => {
                const on = slots.some((s: MateriaSlot) => s.dia === di && s.franjaId === f.id);
                return html`
                  <div class="slot-dot-cell">
                    <div class="slot-dot ${on ? "slot-dot-on" : "slot-dot-off"}"
                      style="${on ? `background:${mat.color}` : ""}"></div>
                  </div>
                `;
              })}
            `)}
          </div>
        </div>
      ` : nothing}

      <!-- Recent sessions -->
      <div class="section">
        <div class="sec-title">🕐 Sesiones recientes</div>
        ${recentSesiones.length > 0 ? html`
          <div class="ses-list">
            ${recentSesiones.map((s) => {
              const tarea = this._tareas.find((t) => t.id === s.tareaId);
              return html`
                <div class="ses-row">
                  <span class="ses-date">${fmtDate(s.inicio)}</span>
                  <span class="ses-title">${s.titulo || tarea?.titulo || "Sin título"}</span>
                  <span class="ses-dur">${fmtDur(s.minutos)}</span>
                  <span class="ses-origin">${s.origen === "timer" ? "⏱" : "✍️"}</span>
                </div>
              `;
            })}
          </div>
        ` : html`
          <div class="ses-list">
            <div class="ses-empty">No hay sesiones registradas todavía</div>
          </div>
        `}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "materia-stats-view": MateriaStatsView;
  }
}
