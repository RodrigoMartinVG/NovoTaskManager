import { SignalWatcher } from "@lit-labs/signals";
import { effect } from "@preact/signals-core";
import { LitElement, css, html, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import type { FranjaDef, Materia, MateriaSlot } from "../../state/types.js";
import { filteredMaterias as materias, plannerData, filteredSesiones as sesiones, statsMateriaId, statsReturnView, updateMateria } from "../../state/store.js";
import type { ViewId } from "../shell/nav-bar.js";

/* ═══ Constants ═══ */
const DIA_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

/* ═══ Helpers ═══ */
function fmtMins(m: number): string {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${h.toString().padStart(2, "0")}:${mm.toString().padStart(2, "0")}`;
}

function getWeekStart(): Date {
  const d = new Date();
  const day = d.getDay(); // 0=dom
  const diff = day === 0 ? -6 : 1 - day;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + diff);
}

function getHoyDia(): number {
  const day = new Date().getDay(); // 0=dom
  return day === 0 ? 6 : day - 1; // 0=lun...6=dom
}

/** Map de materiaId → minutos sesión esta semana */
function sesMinutosSemana(): Map<string, number> {
  const ws = getWeekStart();
  const map = new Map<string, number>();
  for (const s of sesiones.value) {
    const d = new Date(s.inicio);
    if (d >= ws) {
      map.set(s.materiaId, (map.get(s.materiaId) ?? 0) + s.minutos);
    }
  }
  return map;
}

@customElement("semana-view")
export class SemanaView extends SignalWatcher(LitElement) {
  @state() private _dragOverCell = ""; // "dia,franjaId"
  @state() private _addCell = ""; // "dia,franjaId" for open add-dropdown
  private _dragging: { materiaId: string; dia: number; franjaId: string } | null = null;
  private _dispose?: () => void;
  private _outsideClick = (e: MouseEvent) => {
    const path = e.composedPath();
    if (!path.some((el) => (el as HTMLElement).classList?.contains("add-drop"))) {
      this._addCell = "";
    }
  };

  override connectedCallback() {
    super.connectedCallback();
    this._dispose = effect(() => {
      materias.value;
      plannerData.value;
      sesiones.value;
      this.requestUpdate();
    });
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this._dispose?.();
    document.removeEventListener("click", this._outsideClick);
  }

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
      margin-bottom: var(--space-4, 1rem);
    }
    .hdr-title {
      font-size: var(--text-xl);
      font-weight: 700;
      color: var(--text0);
      margin: 0;
    }
    .hdr-sub {
      font-size: var(--text-sm);
      color: var(--text3);
    }

    /* ── Grid ── */
    .grid {
      display: grid;
      grid-template-columns: minmax(7rem, auto) repeat(7, 1fr);
      border: 1px solid var(--border);
      border-radius: 0.5rem;
      background: var(--bg0);
    }

    /* Corner cell */
    .corner {
      background: var(--bg1);
      border-bottom: 1px solid var(--border);
      border-right: 1px solid var(--border);
      padding: 0.5rem 0.75rem;
      font-size: var(--text-xs);
      color: var(--text3);
      display: flex;
      align-items: flex-end;
      justify-content: flex-end;
    }

    /* Day headers */
    .day-hdr {
      background: var(--bg1);
      border-bottom: 1px solid var(--border);
      border-right: 1px solid var(--border);
      padding: 0.5rem 0.25rem;
      text-align: center;
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--text1);
    }
    .day-hdr:last-child { border-right: none; }
    .day-hdr.is-today {
      color: var(--accent);
      background: color-mix(in srgb, var(--accent) 8%, var(--bg1));
    }

    /* Franja label */
    .franja-label {
      background: var(--bg1);
      border-bottom: 1px solid var(--border);
      border-right: 1px solid var(--border);
      padding: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }
    .franja-name {
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--text1);
    }
    .franja-time {
      font-size: var(--text-xs);
      color: var(--text3);
    }

    /* Slot cells */
    .cell {
      border-bottom: 1px solid var(--border);
      border-right: 1px solid var(--border);
      padding: 0.375rem;
      min-height: 4rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      position: relative;
    }
    .cell:nth-child(8n) { border-right: none; }
    .cell.is-today {
      background: color-mix(in srgb, var(--accent) 4%, var(--bg0));
    }

    /* Materia chip inside cell */
    .mat-chip {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.2rem 0.4rem;
      border-radius: 0.25rem;
      font-size: var(--text-xs);
      font-weight: 500;
      color: #fff;
      cursor: grab;
      user-select: none;
      transition: opacity 0.16s;
    }
    .mat-chip:active { cursor: grabbing; }
    .mat-chip.dragging { opacity: 0.35; }
    .chip-name {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .chip-x {
      background: none;
      border: none;
      color: rgba(255,255,255,0.6);
      font-size: 0.7rem;
      line-height: 1;
      padding: 0;
      cursor: pointer;
      flex-shrink: 0;
      opacity: 0;
      transition: opacity 0.12s;
    }
    .mat-chip:hover .chip-x { opacity: 1; }
    .chip-x:hover { color: #fff; }

    /* Drop target highlight */
    .cell.drag-over {
      background: color-mix(in srgb, var(--accent) 14%, var(--bg0));
      box-shadow: inset 0 0 0 2px var(--accent);
    }

    /* Add button (＋) */
    .cell-add-btn {
      align-self: flex-end;
      background: none;
      border: none;
      color: var(--text3);
      font-size: 0.85rem;
      line-height: 1;
      cursor: pointer;
      padding: 0.125rem;
      border-radius: 0.25rem;
      opacity: 0;
      transition: opacity 0.12s, color 0.12s;
      margin-top: auto;
      flex-shrink: 0;
    }
    .cell:hover .cell-add-btn { opacity: 0.6; }
    .cell-add-btn:hover { opacity: 1 !important; color: var(--accent); }
    .cell-add-btn.open { opacity: 1; color: var(--accent); }

    /* ── Add dropdown ── */
    .add-drop {
      position: absolute;
      left: 0;
      z-index: 30;
      min-width: 11rem;
      max-width: 14rem;
      background: var(--bg1);
      border: 1px solid var(--border);
      border-radius: 0.375rem;
      box-shadow: 0 4px 16px rgba(0,0,0,0.18);
      padding: 0.375rem;
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }
    .add-drop.drop-up   { bottom: 0; }
    .add-drop.drop-down { top: 100%; }
    .add-row {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.25rem 0.375rem;
      border-radius: 0.25rem;
      font-size: var(--text-sm);
      color: var(--text0);
      cursor: pointer;
      border: none;
      background: none;
      text-align: left;
      width: 100%;
    }
    .add-row:hover { background: var(--bg2); }
    .add-dot {
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .add-name {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .add-empty {
      font-size: var(--text-xs);
      color: var(--text3);
      padding: 0.25rem;
      font-style: italic;
    }

    /* Empty cell message */
    .empty-slot {
      font-size: var(--text-xs);
      color: var(--text3);
      opacity: 0.5;
      padding: 0.25rem;
    }

    /* ── Summary bar ── */
    .summary {
      display: flex;
      gap: var(--space-4, 1rem);
      margin-top: var(--space-4, 1rem);
      flex-wrap: wrap;
    }
    .sum-card {
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
    .sum-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,.08); }
    .sum-dot {
      width: 0.75rem;
      height: 0.75rem;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .sum-info {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .sum-name {
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--text0);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .sum-detail {
      font-size: var(--text-xs);
      color: var(--text3);
    }
    .sum-bar {
      height: 0.25rem;
      border-radius: 0.125rem;
      background: var(--bg2);
      margin-top: 0.25rem;
      overflow: hidden;
    }
    .sum-fill {
      height: 100%;
      border-radius: 0.125rem;
      transition: width 0.3s;
    }

    /* ── Empty state ── */
    .empty-state {
      text-align: center;
      padding: var(--space-8, 3rem) var(--space-4, 1rem);
      color: var(--text3);
    }
    .empty-icon {
      font-size: 3rem;
      margin-bottom: var(--space-3);
    }
    .empty-msg {
      font-size: var(--text-base);
      margin-bottom: var(--space-2);
    }
    .empty-hint {
      font-size: var(--text-sm);
      opacity: 0.7;
    }

    /* ── Responsive ── */
    @media (max-width: 768px) {
      .grid {
        grid-template-columns: minmax(4rem, auto) repeat(7, 1fr);
      }
      .franja-label { padding: 0.5rem 0.375rem; }
      .franja-name { font-size: var(--text-xs); }
      .franja-time { display: none; }
      .mat-chip { font-size: 0.625rem; padding: 0.125rem 0.25rem; }
      .day-hdr { font-size: var(--text-xs); padding: 0.375rem 0.125rem; }
    }
  `;

  render() {
    const franjas: FranjaDef[] = plannerData.value.franjas;
    const mats = materias.value.filter((m) => m.activa !== false);
    const hoy = getHoyDia();

    // No franjas → empty state
    if (franjas.length === 0) {
      return html`
        <div class="hdr">
          <h2 class="hdr-title">Semana</h2>
        </div>
        <div class="empty-state">
          <div class="empty-icon">📅</div>
          <div class="empty-msg">No hay franjas horarias configuradas</div>
          <div class="empty-hint">Configurá franjas en ⚙ → Franjas para ver tu grilla semanal.</div>
        </div>
      `;
    }

    // Build lookup: dia,franjaId → materia[]
    const slotMap = new Map<string, Materia[]>();
    for (const m of mats) {
      for (const s of m.slots ?? []) {
        const key = `${s.dia},${s.franjaId}`;
        const arr = slotMap.get(key) ?? [];
        arr.push(m);
        slotMap.set(key, arr);
      }
    }

    // Summary: slots asignados + sesiones esta semana
    const sesMap = sesMinutosSemana();
    const totalSlots = mats.reduce((acc, m) => acc + (m.slots?.length ?? 0), 0);

    return html`
      <div class="hdr">
        <h2 class="hdr-title">Semana</h2>
        <span class="hdr-sub">${totalSlots} slots asignados · ${mats.length} materias activas</span>
      </div>

      <div class="grid">
        <!-- Corner -->
        <div class="corner">Horario</div>
        <!-- Day headers -->
        ${DIA_LABELS.map((label, i) => html`
          <div class="day-hdr ${i === hoy ? "is-today" : ""}">${label}</div>
        `)}

        <!-- Rows: one per franja -->
        ${franjas.map((f) => html`
          <div class="franja-label">
            <span class="franja-name">${f.emoji} ${f.nombre}</span>
            <span class="franja-time">${fmtMins(f.horaInicio)} – ${fmtMins(f.horaFin)}</span>
          </div>
          ${DIA_LABELS.map((_, di) => {
            const cellKey = `${di},${f.id}`;
            const cellMats = slotMap.get(cellKey) ?? [];
            const isAdding = this._addCell === cellKey;
            const available = isAdding
              ? mats.filter((m) => !cellMats.some((cm) => cm.id === m.id))
              : [];
            return html`
              <div class="cell ${di === hoy ? "is-today" : ""} ${this._dragOverCell === cellKey ? "drag-over" : ""}"
                @dragover=${(e: DragEvent) => { e.preventDefault(); this._dragOverCell = cellKey; }}
                @dragleave=${() => { if (this._dragOverCell === cellKey) this._dragOverCell = ""; }}
                @drop=${(e: DragEvent) => this._onDrop(e, di, f.id)}>
                ${cellMats.map(
                    (m) => html`<div class="mat-chip ${this._dragging?.materiaId === m.id && this._dragging?.dia === di && this._dragging?.franjaId === f.id ? "dragging" : ""}"
                      style="background:${m.color}"
                      draggable="true"
                      @dragstart=${(e: DragEvent) => this._onDragStart(e, m.id, di, f.id)}
                      @dragend=${() => this._onDragEnd()}>
                      <span class="chip-name">${m.nombre}</span>
                      <button class="chip-x" title="Quitar" @click=${(e: Event) => { e.stopPropagation(); this._removeFromCell(m.id, di, f.id); }}>✕</button>
                    </div>`
                  )}
                <button class="cell-add-btn ${isAdding ? "open" : ""}"
                  title="Agregar materia"
                  @click=${(e: Event) => { e.stopPropagation(); this._toggleAdd(cellKey, e); }}>＋</button>
                ${isAdding ? html`
                  <div class="add-drop ${this._dropDir}"
                    @keydown=${(e: KeyboardEvent) => { if (e.key === "Escape") this._addCell = ""; }}>
                    ${available.length > 0
                      ? available.map((m) => html`
                        <button class="add-row" @click=${() => this._addToCell(m.id, di, f.id)}>
                          <span class="add-dot" style="background:${m.color}"></span>
                          <span class="add-name">${m.nombre}</span>
                        </button>`)
                      : html`<span class="add-empty">Todas asignadas</span>`}
                  </div>
                ` : nothing}
              </div>
            `;
          })}
        `)}
      </div>

      <!-- Summary: hours per materia -->
      ${mats.some((m) => (m.slots?.length ?? 0) > 0) ? html`
        <div class="summary">
          ${mats.filter((m) => (m.slots?.length ?? 0) > 0).map((m) => {
            const nSlots = m.slots?.length ?? 0;
            const slotMins = nSlots * this._avgSlotMins(franjas, m.slots ?? []);
            const sesMins = sesMap.get(m.id) ?? 0;
            const pct = slotMins > 0 ? Math.min(100, Math.round((sesMins / slotMins) * 100)) : 0;
            const minObj = m.horasSemanalesMin ?? 0;
            return html`
              <div class="sum-card" @click=${() => this._openStats(m.id)}>
                <div class="sum-dot" style="background:${m.color}"></div>
                <div class="sum-info">
                  <div class="sum-name">${m.nombre}</div>
                  <div class="sum-detail">
                    ${nSlots} slots · ${this._fmtH(sesMins)} / ${this._fmtH(slotMins)} plan
                    ${minObj > 0 ? html` · obj ${minObj}h` : nothing}
                  </div>
                  <div class="sum-bar">
                    <div class="sum-fill" style="width:${pct}%;background:${m.color}"></div>
                  </div>
                </div>
              </div>
            `;
          })}
        </div>
      ` : nothing}
    `;
  }

  /** Average minutes per slot, weighted by franja duration */
  private _avgSlotMins(franjas: FranjaDef[], slots: MateriaSlot[]): number {
    if (slots.length === 0) return 0;
    let total = 0;
    for (const s of slots) {
      const f = franjas.find((fr) => fr.id === s.franjaId);
      total += f ? f.horaFin - f.horaInicio : 0;
    }
    return total / slots.length;
  }

  private _openStats(materiaId: string) {
    statsMateriaId.value = materiaId;
    statsReturnView.value = "semana";
    this.dispatchEvent(new CustomEvent<ViewId>("view-change", {
      detail: "materia-stats",
      bubbles: true,
      composed: true,
    }));
  }

  private _fmtH(mins: number): string {
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h${m}m` : `${h}h`;
  }

  /* ── Drag & Drop ── */
  private _onDragStart(e: DragEvent, materiaId: string, dia: number, franjaId: string) {
    this._dragging = { materiaId, dia, franjaId };
    e.dataTransfer!.effectAllowed = "move";
    e.dataTransfer!.setData("text/plain", `${materiaId},${dia},${franjaId}`);
  }

  private _onDragEnd() {
    this._dragging = null;
    this._dragOverCell = "";
  }

  private _onDrop(e: DragEvent, toDia: number, toFranjaId: string) {
    e.preventDefault();
    this._dragOverCell = "";

    const src = this._dragging;
    this._dragging = null;
    if (!src) return;

    // Same cell → no-op
    if (src.dia === toDia && src.franjaId === toFranjaId) return;

    const mat = materias.value.find((m) => m.id === src.materiaId);
    if (!mat) return;

    const oldSlots = mat.slots ?? [];

    // Remove old slot for this materia at the source cell
    const filtered = oldSlots.filter(
      (s) => !(s.dia === src.dia && s.franjaId === src.franjaId),
    );

    // Add new slot (avoid duplicate if already present)
    const alreadyThere = filtered.some(
      (s) => s.dia === toDia && s.franjaId === toFranjaId,
    );
    const newSlots = alreadyThere
      ? filtered
      : [...filtered, { dia: toDia, franjaId: toFranjaId }];

    updateMateria(src.materiaId, { slots: newSlots });
  }

  /* ── Cell Add Dropdown ── */
  private _dropDir: "drop-down" | "drop-up" = "drop-down";

  private _toggleAdd(cellKey: string, e: Event) {
    if (this._addCell === cellKey) {
      this._addCell = "";
      document.removeEventListener("click", this._outsideClick);
      return;
    }
    // Decide direction: if button is in the lower half of viewport, open upward
    const btn = e.currentTarget as HTMLElement;
    const rect = btn.getBoundingClientRect();
    this._dropDir = rect.bottom > window.innerHeight * 0.6 ? "drop-up" : "drop-down";
    this._addCell = cellKey;
    requestAnimationFrame(() => {
      document.addEventListener("click", this._outsideClick);
    });
  }

  private _addToCell(materiaId: string, dia: number, franjaId: string) {
    const mat = materias.value.find((m) => m.id === materiaId);
    if (!mat) return;
    const oldSlots = mat.slots ?? [];
    if (oldSlots.some((s) => s.dia === dia && s.franjaId === franjaId)) return;
    updateMateria(materiaId, { slots: [...oldSlots, { dia, franjaId }] });
  }

  private _removeFromCell(materiaId: string, dia: number, franjaId: string) {
    const mat = materias.value.find((m) => m.id === materiaId);
    if (!mat) return;
    const newSlots = (mat.slots ?? []).filter(
      (s) => !(s.dia === dia && s.franjaId === franjaId),
    );
    updateMateria(materiaId, { slots: newSlots });
  }
}
