import { SignalWatcher } from "@lit-labs/signals";
import { effect } from "@preact/signals-core";
import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { driveConnected, syncStatus, type SyncStatus } from "../../state/gdrive.js";
import "./global-filter.js";

export type ViewId = "hoy" | "semana" | "materias" | "backlog" | "sesiones" | "kanban" | "calendario" | "config" | "datos" | "task" | "materia-edit" | "materia-stats" | "sesion-edit" | "ayuda";

export interface NavItem {
  id: ViewId;
  icon: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "hoy", icon: "H", label: "Hoy" },
  { id: "semana", icon: "S", label: "Semana" },
  { id: "materias", icon: "M", label: "Materias" },
  { id: "sesiones", icon: "🕐", label: "Sesiones" },
  { id: "backlog", icon: "B", label: "Backlog" },
  { id: "kanban", icon: "K", label: "Kanban" },
  { id: "calendario", icon: "C", label: "Calendario" },
];

@customElement("nav-bar")
export class NavBar extends SignalWatcher(LitElement) {
  @property() activeView: ViewId = "hoy";
  @state() private _connected = false;
  @state() private _syncStatus: SyncStatus = "idle";

  private _dispose?: () => void;

  override connectedCallback() {
    super.connectedCallback();
    this._dispose = effect(() => {
      this._connected = driveConnected.value;
      this._syncStatus = syncStatus.value;
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
    }

    .hdr {
      display: flex;
      align-items: center;
      padding: 0 1rem;
      height: var(--header-height, 3.5rem);
      border-bottom: 1px solid var(--border);
      background: var(--bg1);
      gap: 0.5rem;
    }

    /* ── Logo ── */
    .logo {
      flex: 0 0 auto;
      font-size: 0.9375rem;
      font-weight: 700;
      color: var(--text0);
      letter-spacing: .05em;
      white-space: nowrap;
    }
    .logo-glyph {
      color: var(--accent);
      margin-right: 0.25rem;
    }
    .logo-full { display: inline; }
    .logo-short { display: none; }

    @media (max-width: 60em) {
      .logo-full { display: none; }
      .logo-short { display: inline; }
    }
    @media (max-width: 30em) {
      .logo-short { display: none; }
    }

    /* ── Nav pills (centradas, ocupan espacio restante) ── */
    .nav {
      flex: 1 1 0;
      display: flex;
      gap: 0.25rem;
      justify-content: center;
      min-width: 0;
      overflow-x: auto;
      scrollbar-width: none;
    }
    .nav::-webkit-scrollbar { display: none; }

    .nb {
      background: transparent;
      border: none;
      color: var(--text2);
      padding: 0.375rem 0.875rem;
      border-radius: 0.375rem;
      cursor: pointer;
      font-family: inherit;
      font-size: 0.75rem;
      font-weight: 500;
      transition: all .18s;
      white-space: nowrap;
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      line-height: 1;
    }
    .nb:hover {
      color: var(--text0);
      background: var(--bg2);
    }
    .nb[data-active] {
      background: var(--bg2);
      color: var(--text0);
      box-shadow: 0 1px 3px rgba(0,0,0,.12);
      font-weight: 600;
    }
    .nb:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 2px;
    }
    .nb-ico {
      font-size: 0.6875rem;
      font-weight: 700;
      width: 1.125rem;
      height: 1.125rem;
      border-radius: 0.25rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: var(--bg3);
      color: var(--text1);
      flex-shrink: 0;
    }
    .nb[data-active] .nb-ico {
      background: var(--accent);
      color: #fff;
    }
    .nb-label {
      display: inline;
    }

    /* ── Responsive: icon-only pills on narrow viewports ── */
    @media (max-width: 48em) {
      .nb-label {
        display: none;
      }
      .nb {
        padding: 0.375rem 0.5rem;
      }
      .ibtn {
        width: 1.75rem;
        height: 1.75rem;
        font-size: 0.75rem;
      }
      .tsw-dot {
        width: 0.625rem;
        height: 0.625rem;
      }
      .actions {
        gap: 0.1875rem;
      }
    }

    /* ── Actions (derecha) ── */
    .actions {
      flex: 0 0 auto;
      display: flex;
      gap: 0.25rem;
      align-items: center;
    }

    .ibtn {
      background: transparent;
      border: 1px solid var(--border);
      color: var(--text2);
      width: 2rem;
      height: 2rem;
      border-radius: 0.5rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all .16s;
      position: relative;
    }
    .ibtn:hover {
      color: var(--text0);
      background: var(--bg2);
      border-color: var(--border2);
    }
    .ibtn[data-active] {
      color: var(--accent);
      background: var(--bg2);
      border-color: var(--accent);
    }
    .ibtn:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 2px;
    }

    /* ── Sync indicator ── */
    .sync-dot {
      width: 0.375rem;
      height: 0.375rem;
      border-radius: 50%;
      position: absolute;
      top: 0.25rem;
      right: 0.25rem;
    }
    .sync-dot[data-s="idle"] { background: var(--text3); opacity: 0.5; }
    .sync-dot[data-s="saving"] { background: var(--accent); animation: navPulse 1s ease infinite; }
    .sync-dot[data-s="saved"] { background: var(--ok-text, #22c55e); }
    .sync-dot[data-s="error"] { background: var(--err-text, #ef4444); }
    @keyframes navPulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }

  `;

  private _onNavClick(id: ViewId) {
    this.dispatchEvent(
      new CustomEvent("view-change", { detail: id, bubbles: true, composed: true }),
    );
  }

  render() {
    return html`
      <header class="hdr">
        <span class="logo"><span class="logo-glyph">◈</span><span class="logo-full">Oda Planner</span><span class="logo-short">Oda</span></span>

        <global-filter></global-filter>

        <nav class="nav" aria-label="Vistas principales">
          ${NAV_ITEMS.map(
            (item) => html`
            <button
              class="nb"
              ?data-active=${this.activeView === item.id}
              @click=${() => this._onNavClick(item.id)}
              aria-current=${this.activeView === item.id ? "page" : "false"}
              aria-label=${item.label}
            >
              <span class="nb-ico">${item.icon}</span>
              <span class="nb-label">${item.label}</span>
            </button>
          `,
          )}
        </nav>

        <div class="actions">
          <button class="ibtn" aria-label="Ayuda" title="Ayuda" ?data-active=${this.activeView === "ayuda"} @click=${() => this._onNavClick("ayuda")}>?</button>
          <button class="ibtn" aria-label="Configuración" title="Configuración" ?data-active=${this.activeView === "config"} @click=${() => this._onNavClick("config")}>⚙</button>
          <button class="ibtn" aria-label="Datos" title="Datos" ?data-active=${this.activeView === "datos"} @click=${() => this._onNavClick("datos")}>💾${this._connected ? html`<span class="sync-dot" data-s=${this._syncStatus}></span>` : ""}</button>
        </div>
      </header>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "nav-bar": NavBar;
  }
}
