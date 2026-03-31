import { SignalWatcher } from "@lit-labs/signals";
import { effect } from "@preact/signals-core";
import { LitElement, css, html, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import type { FranjaDef, Materia } from "../../state/types.js";
import {
  editingMateriaId,
  materiaReturnView,
  filteredMaterias as materias,
  plannerData,
  statsMateriaId,
  statsReturnView,
} from "../../state/store.js";
import type { ViewId } from "../shell/nav-bar.js";

/* ═══ Constants ═══ */

type ProgresoEstado = "al_dia" | "casi" | "atrasado" | "sin_slots" | "sin_objetivo";

interface ProgresoInfo {
  actual: number;
  expected: number;
  pct: number;
  estado: ProgresoEstado;
}

/* ═══ Helpers ═══ */
function getWeekStart(): Date {
  const d = new Date();
  const day = d.getDay(); // 0=dom
  const diff = day === 0 ? -6 : 1 - day; // lunes
  const mon = new Date(d.getFullYear(), d.getMonth(), d.getDate() + diff);
  mon.setHours(0, 0, 0, 0);
  return mon;
}

function getCurrentDia(): number {
  const day = new Date().getDay();
  return day === 0 ? 6 : day - 1; // 0=lun..6=dom
}

function getCurrentMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

function franjaDuration(f: FranjaDef): number {
  return Math.max(0, f.horaFin - f.horaInicio);
}

function computeProgreso(
  mat: Materia,
  franjaMap: Map<string, FranjaDef>,
  weekMinutes: number,
): ProgresoInfo {
  const goalMin = mat.horasSemanalesMin;
  if (!goalMin || goalMin <= 0) {
    return { actual: weekMinutes / 60, expected: 0, pct: 0, estado: "sin_objetivo" };
  }

  const slots = mat.slots ?? [];
  if (slots.length === 0) {
    return { actual: weekMinutes / 60, expected: 0, pct: 0, estado: "sin_slots" };
  }

  const currentDia = getCurrentDia();
  const currentMins = getCurrentMinutes();

  let totalSlotMins = 0;
  let elapsedSlotMins = 0;

  for (const slot of slots) {
    const franja = franjaMap.get(slot.franjaId);
    if (!franja) continue;
    const dur = franjaDuration(franja);
    totalSlotMins += dur;

    if (slot.dia < currentDia) {
      elapsedSlotMins += dur;
    } else if (slot.dia === currentDia && franja.horaFin <= currentMins) {
      elapsedSlotMins += dur;
    }
  }

  if (totalSlotMins === 0) {
    return { actual: weekMinutes / 60, expected: 0, pct: 0, estado: "sin_slots" };
  }

  const proportion = elapsedSlotMins / totalSlotMins;
  const expected = goalMin * proportion;
  const actual = weekMinutes / 60;

  if (expected <= 0) {
    return { actual, expected: 0, pct: 100, estado: "al_dia" };
  }

  const pct = Math.min(100, Math.round((actual / expected) * 100));

  let estado: ProgresoEstado;
  if (actual >= expected) estado = "al_dia";
  else if (actual >= expected * 0.8) estado = "casi";
  else estado = "atrasado";

  return { actual, expected, pct, estado };
}

const ESTADO_BADGE: Record<ProgresoEstado, { label: string; cls: string }> = {
  al_dia: { label: "Al día", cls: "badge-ok" },
  casi: { label: "Casi al día", cls: "badge-warn" },
  atrasado: { label: "Atrasado", cls: "badge-err" },
  sin_slots: { label: "Sin horarios", cls: "badge-muted" },
  sin_objetivo: { label: "Sin objetivo", cls: "badge-muted" },
};

/* ═══ Component ═══ */
@customElement("materias-view")
export class MateriasView extends SignalWatcher(LitElement) {
  private _dispose?: () => void;

  override connectedCallback() {
    super.connectedCallback();
    this._dispose = effect(() => {
      materias.value;
      plannerData.value;
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
      display: flex;
      align-items: center;
      gap: var(--space-3, 0.75rem);
      margin-bottom: var(--space-5, 1.5rem);
    }
    .hdr-title { font-size: var(--text-xl); font-weight: 700; color: var(--text0); margin: 0; }
    .count {
      font-size: var(--text-xs); color: var(--text3);
      background: var(--bg2); padding: 0.125rem 0.5rem; border-radius: 0.75rem;
    }
    .hdr-spacer { flex: 1; }

    /* ── Buttons ── */
    .btn-primary {
      background: var(--accent); color: #fff; border: none; border-radius: 0.375rem;
      padding: 0.5rem 1rem; font: inherit; font-size: var(--text-sm, 0.8125rem);
      font-weight: 600; cursor: pointer; transition: opacity 0.12s; white-space: nowrap;
      display: inline-flex; align-items: center; gap: 0.375rem;
    }
    .btn-primary:hover { opacity: 0.85; }

    /* ── Cards list ── */
    .cards { display: flex; flex-direction: column; gap: var(--space-3, 0.75rem); }

    /* ── Card ── */
    .card {
      background: var(--bg1); border: 1px solid var(--border);
      border-radius: 0.625rem; overflow: hidden; transition: box-shadow 0.2s;
    }
    .card:hover { box-shadow: 0 2px 12px rgba(0,0,0,.08); }
    .card[data-inactive] { opacity: 0.55; }

    /* card header */
    .card-hdr {
      display: flex; align-items: center; gap: var(--space-3, 0.75rem);
      padding: var(--space-3, 0.75rem) var(--space-4, 1rem);
      cursor: pointer; user-select: none;
    }
    .color-dot {
      width: 0.75rem; height: 0.75rem; border-radius: 50%; flex-shrink: 0;
    }
    .card-info { flex: 1; min-width: 0; }
    .card-name-row {
      display: flex; align-items: baseline; gap: 0.5rem; flex-wrap: wrap;
    }
    .card-name {
      font-size: var(--text-base); font-weight: 600; color: var(--text0); margin: 0;
    }
    .card-subtitle {
      font-size: var(--text-xs); color: var(--text3);
      display: inline-flex; gap: 0.375rem; align-items: baseline;
    }
    .card-meta {
      display: flex; gap: var(--space-3, 0.75rem);
      margin-top: var(--space-1, 0.25rem); flex-wrap: wrap;
      align-items: center;
    }
    .meta-item {
      font-size: var(--text-xs); color: var(--text2);
      display: inline-flex; align-items: center; gap: 0.25rem;
    }

    /* badge */
    .badge {
      font-size: var(--text-xs); font-weight: 600; padding: 0.125rem 0.5rem;
      border-radius: 0.75rem; white-space: nowrap;
    }
    .badge-ok { background: #dcfce7; color: #166534; }
    .badge-warn { background: #fef9c3; color: #854d0e; }
    .badge-err { background: #fee2e2; color: #991b1b; }
    .badge-muted { background: var(--bg2); color: var(--text3); }

    /* progress (compact in header) */
    .progress-compact {
      height: 0.1875rem; background: var(--bg3); border-radius: 0.125rem;
      overflow: hidden; margin-top: var(--space-1, 0.25rem);
    }
    .progress-fill {
      height: 100%; border-radius: 0.125rem;
      transition: width 0.3s var(--ease-out, ease-out);
    }

    /* chevron */
    .expand-ico {
      font-size: 1.25rem; color: var(--text3); flex-shrink: 0;
      line-height: 1;
    }
    .btn-icon {
      background: transparent; border: none; cursor: pointer;
      font-size: var(--text-sm); padding: 0.25rem; border-radius: 0.25rem;
      opacity: 0; transition: opacity 0.15s;
      flex-shrink: 0;
    }
    .card-hdr:hover .btn-icon { opacity: 0.7; }
    .btn-icon:hover { opacity: 1 !important; background: var(--bg2); }

    /* ── Empty state ── */
    .empty {
      text-align: center; padding: var(--space-8, 3rem) var(--space-4, 1rem); color: var(--text2);
    }
    .empty-icon { font-size: 2.5rem; margin-bottom: var(--space-3, 0.75rem); }
    .empty-title {
      font-size: 1rem; font-weight: 600; color: var(--text1);
      margin: 0 0 var(--space-2, 0.5rem);
    }
    .empty-desc { font-size: var(--text-sm); margin: 0 0 var(--space-4, 1rem); max-width: 22rem; margin-inline: auto; }

    .hint { font-size: var(--text-xs); color: var(--text3); margin: 0; }
  `;

  /* ── Helpers ── */
  private _getFranjaMap(): Map<string, FranjaDef> {
    const map = new Map<string, FranjaDef>();
    for (const f of plannerData.value.franjas ?? []) map.set(f.id, f);
    return map;
  }

  private _weekMinutesFor(materiaId: string): number {
    const weekStart = getWeekStart();
    const allSesiones = plannerData.value.sesiones;
    let total = 0;
    for (const s of allSesiones) {
      if (s.materiaId !== materiaId) continue;
      const d = new Date(s.inicio);
      if (d >= weekStart) total += s.minutos;
    }
    return total;
  }

  private _taskCountFor(materiaId: string): number {
    return plannerData.value.tareas.filter((t) => t.materiaId === materiaId).length;
  }

  /* ── Actions ── */
  private _openEdit(id: string) {
    editingMateriaId.value = id;
    materiaReturnView.value = "materias";
    this.dispatchEvent(
      new CustomEvent<ViewId>("view-change", {
        detail: "materia-edit",
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _openStats(id: string) {
    statsMateriaId.value = id;
    statsReturnView.value = "materias";
    this.dispatchEvent(
      new CustomEvent<ViewId>("view-change", {
        detail: "materia-stats",
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _openNew() {
    editingMateriaId.value = "new";
    materiaReturnView.value = "materias";
    this.dispatchEvent(
      new CustomEvent<ViewId>("view-change", {
        detail: "materia-edit",
        bubbles: true,
        composed: true,
      }),
    );
  }

  /* ── Render ── */
  render() {
    const mats = materias.value;
    const franjaMap = this._getFranjaMap();

    return html`
      <div class="hdr">
        <h1 class="hdr-title">Materias</h1>
        ${mats.length > 0 ? html`<span class="count">${mats.length}</span>` : nothing}
        <div class="hdr-spacer"></div>
        <button class="btn-primary" @click=${this._openNew}>+ Nueva materia</button>
      </div>

      ${mats.length === 0
        ? html`
          <div class="empty">
            <div class="empty-icon">📚</div>
            <p class="empty-title">No hay materias todavía</p>
            <p class="empty-desc">Creá tu primera materia para empezar a organizar el estudio.</p>
            <button class="btn-primary" @click=${this._openNew}>+ Crear materia</button>
          </div>
        `
        : nothing}

      <div class="cards">
        ${mats.map((m) => this._renderCard(m, franjaMap))}
      </div>
    `;
  }

  private _renderCard(mat: Materia, franjaMap: Map<string, FranjaDef>) {
    const weekMins = this._weekMinutesFor(mat.id);
    const progreso = computeProgreso(mat, franjaMap, weekMins);
    const taskCount = this._taskCountFor(mat.id);
    const badge = ESTADO_BADGE[progreso.estado];

    return html`
      <div class="card" ?data-inactive=${mat.activa === false}>
        <div class="card-hdr" @click=${() => this._openStats(mat.id)}>
          <span class="color-dot" style="background:${mat.color}"></span>
          <div class="card-info">
            <div class="card-name-row">
              <p class="card-name">${mat.nombre}</p>
              ${(mat.codigo || mat.anio || mat.periodo) ? html`
                <span class="card-subtitle">
                  ${mat.codigo ? html`<span>${mat.codigo}</span>` : nothing}
                  ${mat.anio ? html`<span>Año ${mat.anio}</span>` : nothing}
                  ${mat.periodo ? html`<span>${mat.periodo === "anual" ? "Anual" : mat.periodo}</span>` : nothing}
                </span>
              ` : nothing}
            </div>
            <div class="card-meta">
              <span class="meta-item">📋 ${taskCount} tarea${taskCount !== 1 ? "s" : ""}</span>
              ${mat.horasSemanalesMin
                ? html`<span class="meta-item">⏱ ${progreso.actual.toFixed(1)}h / ${mat.horasSemanalesMin}h</span>`
                : nothing}
              <span class="badge ${badge.cls}">${badge.label}</span>
            </div>
            ${mat.horasSemanalesMin && progreso.estado !== "sin_slots" && progreso.estado !== "sin_objetivo"
              ? html`
                <div class="progress-compact">
                  <div class="progress-fill" style="width:${progreso.pct}%; background:${mat.color}"></div>
                </div>
              `
              : nothing}
          </div>
          <button class="btn-icon" @click=${(e: Event) => { e.stopPropagation(); this._openEdit(mat.id); }} title="Editar">✏️</button>
          <span class="expand-ico">›</span>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "materias-view": MateriasView;
  }
}
