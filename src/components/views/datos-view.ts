import { SignalWatcher } from "@lit-labs/signals";
import { effect } from "@preact/signals-core";
import { LitElement, css, html, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import {
  driveConnect,
  driveConnected,
  driveConflictData,
  driveDisconnect,
  driveFlush,
  driveUser,
  gisReady,
  syncError,
  syncStatus,
  type SyncStatus,
} from "../../state/gdrive.js";
import type { PlannerData } from "../../state/types.js";
import {
  materias,
  plannerData,
  sesiones,
  setAppMode,
  setPlannerData,
  tareas,
} from "../../state/store.js";

/* ═══ Normalization ═══ */
function normalize(raw: unknown): PlannerData {
  const obj = (typeof raw === "object" && raw !== null ? raw : {}) as Record<string, unknown>;
  return {
    materias: Array.isArray(obj.materias)
      ? obj.materias.map((m: Record<string, unknown>) => ({
          id: String(m.id ?? crypto.randomUUID()),
          nombre: String(m.nombre ?? "Sin nombre"),
          color: String(m.color ?? "#6366f1"),
          horasSemanalesMin: Number(m.horasSemanalesMin ?? 0),
          horasSemanalesMax: Number(m.horasSemanalesMax ?? 0),
          slots: Array.isArray(m.slots) ? m.slots : [],
          activa: m.activa !== false,
        }))
      : [],
    tipos: Array.isArray(obj.tipos)
      ? obj.tipos.map((t: Record<string, unknown>) => ({
          id: String(t.id ?? crypto.randomUUID()),
          nombre: String(t.nombre ?? "Sin nombre"),
          icono: String(t.icono ?? "📌"),
          activo: t.activo !== false,
        }))
      : [],
    tareas: Array.isArray(obj.tareas)
      ? obj.tareas.map((t: Record<string, unknown>) => ({
          id: String(t.id ?? crypto.randomUUID()),
          titulo: String(t.titulo ?? "Sin título"),
          materiaId: String(t.materiaId ?? ""),
          tipo: String(t.tipo ?? ""),
          estado: (["pendiente", "en_progreso", "completada"].includes(t.estado as string)
            ? t.estado
            : "pendiente") as "pendiente" | "en_progreso" | "completada",
          prioridad: (["alta", "media", "baja"].includes(t.prioridad as string)
            ? t.prioridad
            : "media") as "alta" | "media" | "baja",
          fechaInicio: typeof t.fechaInicio === "string" ? t.fechaInicio : undefined,
          fechaLimite: typeof t.fechaLimite === "string" ? t.fechaLimite : undefined,
          horaLimite: typeof t.horaLimite === "string" ? t.horaLimite : undefined,
          obligatorio: Boolean(t.obligatorio),
          descripcion: typeof t.descripcion === "string" ? t.descripcion : undefined,
          link: typeof t.link === "string" ? t.link : undefined,
          items: Array.isArray(t.items) ? t.items : [],
        }))
      : [],
    sesiones: Array.isArray(obj.sesiones)
      ? obj.sesiones.map((s: Record<string, unknown>) => ({
          id: String(s.id ?? crypto.randomUUID()),
          materiaId: String(s.materiaId ?? ""),
          tareaId: typeof s.tareaId === "string" ? s.tareaId : null,
          inicio: String(s.inicio ?? new Date().toISOString()),
          minutos: Number(s.minutos ?? 0),
          origen: (s.origen === "timer" ? "timer" : "manual") as "timer" | "manual",
          titulo: typeof s.titulo === "string" ? s.titulo : undefined,
        }))
      : [],
    franjas: Array.isArray(obj.franjas) ? obj.franjas as PlannerData["franjas"] : undefined,
    alertas: typeof obj.alertas === "object" && obj.alertas !== null
      ? obj.alertas as PlannerData["alertas"]
      : undefined,
  };
}

@customElement("datos-view")
export class DatosView extends SignalWatcher(LitElement) {
  @state() private importError = "";
  @state() private importSuccess = "";
  @state() private driveLoading = false;

  private _dispose?: () => void;

  override connectedCallback() {
    super.connectedCallback();
    this._dispose = effect(() => {
      plannerData.value;
      driveConnected.value;
      driveUser.value;
      syncStatus.value;
      syncError.value;
      driveConflictData.value;
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
      margin-bottom: var(--space-5);
    }
    .hdr-title {
      font-size: var(--text-xl);
      font-weight: 700;
      color: var(--text0);
      margin: 0;
    }

    /* ── Sections ── */
    .section {
      background: var(--bg1);
      border: 1px solid var(--border);
      border-radius: 0.5rem;
      padding: var(--space-4);
      margin-bottom: var(--space-4);
    }
    .sec-title {
      font-size: var(--text-base);
      font-weight: 700;
      color: var(--text0);
      margin: 0 0 var(--space-1);
    }
    .sec-desc {
      font-size: var(--text-sm);
      color: var(--text3);
      margin-bottom: var(--space-3);
    }

    /* ── Stats ── */
    .stats {
      display: flex;
      gap: var(--space-3);
      margin-bottom: var(--space-3);
      flex-wrap: wrap;
    }
    .stat {
      background: var(--bg0);
      border: 1px solid var(--border);
      border-radius: 0.375rem;
      padding: 0.5rem 0.75rem;
      min-width: 6rem;
      text-align: center;
    }
    .stat-num {
      font-size: var(--text-lg);
      font-weight: 700;
      color: var(--text0);
    }
    .stat-label {
      font-size: var(--text-xs);
      color: var(--text3);
    }

    /* ── Buttons ── */
    .btn {
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      border: 1px solid var(--border);
      background: var(--bg0);
      color: var(--text0);
      font: inherit;
      font-size: var(--text-sm);
      cursor: pointer;
      transition: background 0.16s;
    }
    .btn:hover { background: var(--bg2); }
    .btn-accent {
      background: var(--accent);
      color: #fff;
      border: none;
    }
    .btn-accent:hover { opacity: 0.85; }
    .btn-danger {
      background: var(--err-bg);
      color: var(--err-text);
      border: none;
    }
    .btn-danger:hover { opacity: 0.85; }
    .btn-row {
      display: flex;
      gap: var(--space-2);
      flex-wrap: wrap;
    }

    /* ── File input ── */
    input[type="file"] { display: none; }

    /* ── Messages ── */
    .msg-error {
      background: var(--err-bg);
      color: var(--err-text);
      padding: 0.5rem 0.75rem;
      border-radius: 0.375rem;
      font-size: var(--text-sm);
      margin-top: var(--space-2);
    }
    .msg-success {
      background: var(--ok-bg);
      color: var(--ok-text);
      padding: 0.5rem 0.75rem;
      border-radius: 0.375rem;
      font-size: var(--text-sm);
      margin-top: var(--space-2);
    }

    /* ── Drive placeholder ── */
    .drive-placeholder {
      text-align: center;
      padding: var(--space-4);
      color: var(--text3);
      font-size: var(--text-sm);
    }
    .drive-icon { font-size: 2rem; margin-bottom: var(--space-2); }

    /* ── Drive section ── */
    .drive-status {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      margin-bottom: var(--space-3);
      padding: 0.5rem 0.75rem;
      background: var(--bg0);
      border: 1px solid var(--border);
      border-radius: 0.375rem;
    }
    .drive-dot {
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .drive-dot[data-status="idle"] { background: var(--text3); }
    .drive-dot[data-status="saving"] { background: var(--warn-text, #f59e0b); animation: pulse-dot 1s ease infinite; }
    .drive-dot[data-status="saved"] { background: var(--ok-text, #22c55e); }
    .drive-dot[data-status="error"] { background: var(--err-text, #ef4444); }
    @keyframes pulse-dot {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }
    .drive-info {
      flex: 1;
      min-width: 0;
    }
    .drive-email {
      font-size: var(--text-sm);
      color: var(--text0);
      font-weight: 600;
    }
    .drive-sync-label {
      font-size: var(--text-xs);
      color: var(--text3);
    }
    .drive-err {
      font-size: var(--text-xs);
      color: var(--err-text);
    }

    /* ── Conflict modal ── */
    .conflict-overlay {
      position: fixed;
      inset: 0;
      background: var(--overlay, rgba(0,0,0,.5));
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: var(--z-modal, 500);
    }
    .conflict-box {
      background: var(--bg1);
      border: 1px solid var(--border);
      border-radius: 0.75rem;
      padding: var(--space-5);
      max-width: 28rem;
      width: 90%;
    }
    .conflict-title {
      font-size: var(--text-base);
      font-weight: 700;
      color: var(--text0);
      margin: 0 0 var(--space-2);
    }
    .conflict-desc {
      font-size: var(--text-sm);
      color: var(--text2);
      margin-bottom: var(--space-4);
      line-height: 1.5;
    }
    .conflict-btns {
      display: flex;
      gap: var(--space-2);
      flex-wrap: wrap;
    }
  `;

  render() {
    const nMaterias = materias.value.length;
    const nTareas = tareas.value.length;
    const nSesiones = sesiones.value.length;
    const totalMins = sesiones.value.reduce((sum, s) => sum + s.minutos, 0);

    return html`
      <div class="hdr">
        <h2 class="hdr-title">💾 Datos</h2>
      </div>

      <!-- Stats overview -->
      <div class="section">
        <h3 class="sec-title">Resumen de datos</h3>
        <div class="stats">
          <div class="stat">
            <div class="stat-num">${nMaterias}</div>
            <div class="stat-label">Materias</div>
          </div>
          <div class="stat">
            <div class="stat-num">${nTareas}</div>
            <div class="stat-label">Tareas</div>
          </div>
          <div class="stat">
            <div class="stat-num">${nSesiones}</div>
            <div class="stat-label">Sesiones</div>
          </div>
          <div class="stat">
            <div class="stat-num">${this._fmtH(totalMins)}</div>
            <div class="stat-label">Horas estudio</div>
          </div>
        </div>
      </div>

      <!-- Export -->
      <div class="section">
        <h3 class="sec-title">Exportar</h3>
        <p class="sec-desc">Descargá toda tu información como archivo JSON para respaldo o transferencia.</p>
        <button class="btn btn-accent" @click=${this._export}>📥 Descargar JSON</button>
      </div>

      <!-- Import -->
      <div class="section">
        <h3 class="sec-title">Importar</h3>
        <p class="sec-desc">Cargá un archivo JSON exportado previamente. Los datos actuales serán reemplazados.</p>
        <div class="btn-row">
          <button class="btn" @click=${this._triggerImport}>📤 Seleccionar archivo JSON</button>
        </div>
        <input type="file" accept=".json,application/json" @change=${this._handleImport} />
        ${this.importError ? html`<div class="msg-error">${this.importError}</div>` : nothing}
        ${this.importSuccess ? html`<div class="msg-success">${this.importSuccess}</div>` : nothing}
      </div>

      <!-- Reset -->
      <div class="section">
        <h3 class="sec-title">Restablecer</h3>
        <p class="sec-desc">Borrá todos los datos y volvé al estado inicial.</p>
        <button class="btn btn-danger" @click=${this._reset}>🗑️ Borrar todo</button>
      </div>

      <!-- Google Drive -->
      <div class="section">
        <h3 class="sec-title">Google Drive</h3>
        ${driveConnected.value ? this._renderDriveConnected() : this._renderDriveDisconnected()}
      </div>

      <!-- Conflict modal -->
      ${driveConflictData.value ? this._renderConflictModal() : nothing}
    `;
  }

  /* ── Drive rendering ── */

  private _renderDriveDisconnected() {
    const loading = this.driveLoading;
    return html`
      <p class="sec-desc">Sincronizá tus datos con Google Drive para acceder desde cualquier dispositivo.</p>
      <button
        class="btn btn-accent"
        ?disabled=${loading}
        @click=${this._handleDriveConnect}
      >${loading ? "Conectando…" : "☁️ Conectar con Google Drive"}</button>
      ${!gisReady() ? html`<div class="msg-error" style="margin-top: 0.5rem">Google Identity Services no cargó. Verificá tu conexión o que no tengas un bloqueador activo.</div>` : nothing}
    `;
  }

  private _renderDriveConnected() {
    const status: SyncStatus = syncStatus.value;
    const email = driveUser.value;
    const err = syncError.value;
    const statusLabels: Record<SyncStatus, string> = {
      idle: "En espera",
      saving: "Guardando…",
      saved: "Guardado ✓",
      error: "Error de sincronización",
    };
    return html`
      <div class="drive-status">
        <div class="drive-dot" data-status=${status}></div>
        <div class="drive-info">
          ${email ? html`<div class="drive-email">${email}</div>` : nothing}
          <div class="drive-sync-label">${statusLabels[status]}</div>
          ${err ? html`<div class="drive-err">${err}</div>` : nothing}
        </div>
        <button class="btn" style="flex-shrink:0" @click=${this._handleDriveSaveNow}>Guardar ahora</button>
      </div>
      <div class="btn-row">
        <button class="btn btn-danger" @click=${this._handleDriveDisconnect}>Desconectar</button>
      </div>
    `;
  }

  private _renderConflictModal() {
    return html`
      <div class="conflict-overlay" @click=${(e: Event) => e.target === e.currentTarget && this._resolveConflict("local")}>
        <div class="conflict-box">
          <h3 class="conflict-title">Conflicto de datos</h3>
          <p class="conflict-desc">
            Se encontraron datos diferentes en Google Drive. ¿Qué datos querés usar?
          </p>
          <div class="conflict-btns">
            <button class="btn btn-accent" @click=${() => this._resolveConflict("remote")}>Usar datos de Drive</button>
            <button class="btn" @click=${() => this._resolveConflict("local")}>Mantener datos locales</button>
          </div>
        </div>
      </div>
    `;
  }

  /* ── Drive handlers ── */

  private async _handleDriveConnect() {
    this.driveLoading = true;
    try {
      const result = await driveConnect();
      if (!result.ok) {
        this.driveLoading = false;
        return;
      }

      if (result.remoteData) {
        // Check if remote differs from local
        const local = plannerData.value;
        const remoteMats = result.remoteData.materias?.length ?? 0;
        const localMats = local.materias.length;
        const remoteTasks = result.remoteData.tareas?.length ?? 0;
        const localTasks = local.tareas.length;

        if (localMats === 0 && localTasks === 0) {
          // Local is empty → use remote directly
          setPlannerData(result.remoteData);
        } else if (remoteMats !== localMats || remoteTasks !== localTasks) {
          // Conflict → show modal
          driveConflictData.value = result.remoteData;
        }
        // else: same counts → keep local, it'll auto-save
      }

      setAppMode("drive");
    } catch (err) {
      console.error("[GDrive] Connect error:", err);
    }
    this.driveLoading = false;
  }

  private _handleDriveDisconnect() {
    if (!confirm("¿Desconectar Google Drive? Tus datos locales se mantendrán.")) return;
    driveDisconnect();
    setAppMode("local");
  }

  private async _handleDriveSaveNow() {
    await driveFlush(() => plannerData.value);
  }

  private _resolveConflict(choice: "local" | "remote") {
    if (choice === "remote" && driveConflictData.value) {
      setPlannerData(driveConflictData.value);
    }
    driveConflictData.value = null;
  }

  private _export() {
    const json = JSON.stringify(plannerData.value, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const now = new Date();
    a.download = `oda-planner-${now.toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private _triggerImport() {
    this.importError = "";
    this.importSuccess = "";
    const input = this.shadowRoot?.querySelector('input[type="file"]') as HTMLInputElement;
    input?.click();
  }

  private _handleImport(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const raw = JSON.parse(reader.result as string);
        const normalized = normalize(raw);

        // Basic validation
        if (
          normalized.materias.length === 0 &&
          normalized.tareas.length === 0 &&
          normalized.sesiones.length === 0
        ) {
          this.importError = "El archivo no contiene datos válidos (sin materias, tareas ni sesiones).";
          return;
        }

        setPlannerData(normalized);
        this.importSuccess = `Importación exitosa: ${normalized.materias.length} materias, ${normalized.tareas.length} tareas, ${normalized.sesiones.length} sesiones.`;
        this.importError = "";
      } catch {
        this.importError = "El archivo no es un JSON válido.";
        this.importSuccess = "";
      }
    };
    reader.readAsText(file);

    // Reset file input so the same file can be re-selected
    (e.target as HTMLInputElement).value = "";
  }

  private _reset() {
    if (!confirm("¿Borrar todos los datos? Esta acción no se puede deshacer.")) return;
    setPlannerData({
      materias: [],
      tipos: [],
      tareas: [],
      sesiones: [],
    });
    this.importSuccess = "";
    this.importError = "";
  }

  private _fmtH(mins: number): string {
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "datos-view": DatosView;
  }
}
