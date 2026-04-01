import { SignalWatcher } from "@lit-labs/signals";
import { effect } from "@preact/signals-core";
import { LitElement, css, html, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import type { EstadoTarea, Tarea } from "../../state/types.js";
import {
  filteredMaterias as materias,
  filteredTareas as tareas,
  updateTarea,
} from "../../state/store.js";
import { editingTaskId, taskReturnView } from "../../state/navigation.js";
import type { ViewId } from "../shell/nav-bar.js";

/* ═══ Constants ═══ */
interface ColDef {
  estado: EstadoTarea;
  label: string;
  emoji: string;
}

const COLUMNS: ColDef[] = [
  { estado: "pendiente", label: "Pendiente", emoji: "📋" },
  { estado: "en_progreso", label: "En progreso", emoji: "🔨" },
  { estado: "completada", label: "Completada", emoji: "✅" },
];

const PRIO_ORDER: Record<string, number> = { alta: 0, media: 1, baja: 2 };

@customElement("kanban-view")
export class KanbanView extends SignalWatcher(LitElement) {
  @state() private draggingId: string | null = null;
  @state() private overCol: EstadoTarea | null = null;

  private _dispose?: () => void;

  override connectedCallback() {
    super.connectedCallback();
    this._dispose = effect(() => {
      tareas.value;
      materias.value;
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
      max-width: var(--content-max-width, 75rem);
      margin: 0 auto;
      padding: var(--space-5, 1.5rem) var(--space-4, 1rem);
    }

    .hdr {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      margin-bottom: var(--space-4);
    }
    .hdr-title {
      font-size: var(--text-xl);
      font-weight: 700;
      color: var(--text0);
      margin: 0;
    }

    /* ── Board ── */
    .board {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-3, 0.75rem);
      min-height: 40vh;
    }

    /* ── Column ── */
    .col {
      background: var(--bg1);
      border: 1px solid var(--border);
      border-radius: 0.5rem;
      display: flex;
      flex-direction: column;
      min-height: 12rem;
      min-width: 0;
      overflow: hidden;
      transition: border-color 0.16s, background 0.16s;
    }
    .col.drag-over {
      border-color: var(--accent);
      background: color-mix(in srgb, var(--accent) 6%, var(--bg1));
    }
    .col-hdr {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.625rem 0.75rem;
      border-bottom: 1px solid var(--border);
      font-size: var(--text-sm);
      font-weight: 700;
      color: var(--text1);
    }
    .col-count {
      font-size: var(--text-xs);
      color: var(--text3);
      background: var(--bg2);
      padding: 0.0625rem 0.375rem;
      border-radius: 0.75rem;
      margin-left: auto;
    }
    .col-body {
      padding: 0.5rem;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }

    /* ── Card ── */
    .card {
      background: var(--bg0);
      border: 1px solid var(--border);
      border-radius: 0.375rem;
      padding: 0.5rem 0.625rem;
      cursor: grab;
      transition: box-shadow 0.16s, opacity 0.16s;
      user-select: none;
      overflow: hidden;
      min-width: 0;
    }
    .card:hover { box-shadow: 0 2px 6px rgba(0,0,0,0.15); }
    .card.dragging { opacity: 0.4; }
    .card-title {
      font-size: var(--text-sm);
      color: var(--text0);
      margin-bottom: 0.25rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .card-meta {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      font-size: var(--text-xs);
      color: var(--text3);
      overflow: hidden;
      min-width: 0;
    }
    .card-dot {
      width: 0.5rem; height: 0.5rem;
      border-radius: 50%; flex-shrink: 0;
    }
    .card-badge {
      font-size: 0.625rem;
      padding: 0.0625rem 0.3125rem;
      border-radius: 0.1875rem;
      font-weight: 600;
    }
    .badge-alta { background: var(--err-bg); color: var(--err-text); }
    .badge-oblig { background: var(--info-bg); color: var(--info-text); }

    /* ── Empty ── */
    .col-empty {
      text-align: center;
      color: var(--text3);
      font-size: var(--text-xs);
      padding: var(--space-3);
      opacity: 0.6;
    }

    /* ── Responsive ── */
    @media (max-width: 768px) {
      .board {
        grid-template-columns: 1fr;
      }
      .col { min-height: 6rem; }
    }
  `;

  render() {
    const allTareas = tareas.value;

    return html`
      <div class="hdr">
        <h2 class="hdr-title">Kanban</h2>
      </div>
      <div class="board">
        ${COLUMNS.map((col) => {
          const items = allTareas
            .filter((t) => t.estado === col.estado)
            .sort((a, b) => PRIO_ORDER[a.prioridad] - PRIO_ORDER[b.prioridad]);
          return html`
            <div class="col ${this.overCol === col.estado ? "drag-over" : ""}"
              @dragover=${(e: DragEvent) => { e.preventDefault(); this.overCol = col.estado; }}
              @dragleave=${() => { this.overCol = null; }}
              @drop=${(e: DragEvent) => this._onDrop(e, col.estado)}>
              <div class="col-hdr">
                ${col.emoji} ${col.label}
                <span class="col-count">${items.length}</span>
              </div>
              <div class="col-body">
                ${items.length > 0
                  ? items.map((t) => this._renderCard(t))
                  : html`<div class="col-empty">Sin tareas</div>`}
              </div>
            </div>
          `;
        })}
      </div>
    `;
  }

  private _renderCard(t: Tarea) {
    const mat = materias.value.find((m) => m.id === t.materiaId);
    return html`
      <div class="card ${this.draggingId === t.id ? "dragging" : ""}"
        draggable="true"
        @dragstart=${(e: DragEvent) => { e.dataTransfer?.setData("text/plain", t.id); this.draggingId = t.id; }}
        @dragend=${() => { this.draggingId = null; this.overCol = null; }}
        @click=${() => this._openTask(t.id)}>
        <div class="card-title">${t.titulo}</div>
        <div class="card-meta">
          <div class="card-dot" style="background:${mat?.color ?? "var(--text3)"}"></div>
          <span>${mat?.nombre ?? "—"}</span>
          ${t.prioridad === "alta" ? html`<span class="card-badge badge-alta">Alta</span>` : nothing}
          ${t.obligatorio ? html`<span class="card-badge badge-oblig">Oblig</span>` : nothing}
        </div>
      </div>
    `;
  }

  private _onDrop(e: DragEvent, target: EstadoTarea) {
    e.preventDefault();
    const id = e.dataTransfer?.getData("text/plain");
    this.overCol = null;
    this.draggingId = null;
    if (!id) return;
    const tarea = tareas.value.find((t) => t.id === id);
    if (tarea && tarea.estado !== target) {
      updateTarea(id, { estado: target });
    }
  }

  private _openTask(id: string) {
    editingTaskId.value = id;
    taskReturnView.value = "kanban";
    this.dispatchEvent(
      new CustomEvent<ViewId>("view-change", {
        detail: "task",
        bubbles: true,
        composed: true,
      }),
    );
  }
}
