import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { driveConnected, syncStatus } from "../../state/gdrive.js";
import { PreactSignalWatcher } from "../shared/preact-signal-watcher.js";
import "./global-filter.js";

export type ViewId = "hoy" | "semana" | "materias" | "backlog" | "sesiones" | "kanban" | "calendario" | "config" | "datos" | "task" | "materia-edit" | "materia-stats" | "sesion-edit" | "ayuda";

export interface NavItem {
  id: ViewId;
  icon: string;
  label: string;
}

/* ── Nav groups ── */
interface NavGroup {
  key: string;
  icon: string;          // shown when no child is active
  items: NavItem[];
}

const PLAN_GROUP: NavGroup = {
  key: "plan",
  icon: "◈",
  items: [
    { id: "hoy", icon: "H", label: "Hoy" },
    { id: "semana", icon: "S", label: "Semana" },
    { id: "materias", icon: "M", label: "Materias" },
  ],
};

const TASK_GROUP: NavGroup = {
  key: "task",
  icon: "☰",
  items: [
    { id: "backlog", icon: "B", label: "Backlog" },
    { id: "kanban", icon: "K", label: "Kanban" },
    { id: "calendario", icon: "C", label: "Calendario" },
  ],
};

const UTIL_GROUP: NavGroup = {
  key: "util",
  icon: "⚙",
  items: [
    { id: "ayuda", icon: "?", label: "Ayuda" },
    { id: "config", icon: "⚙", label: "Configuración" },
    { id: "datos", icon: "💾", label: "Datos" },
  ],
};

const SESION_ITEM: NavItem = { id: "sesiones", icon: "🕐", label: "Sesiones" };

@customElement("nav-bar")
export class NavBar extends PreactSignalWatcher(LitElement) {
  @property() activeView: ViewId = "hoy";
  /** Which group popup is open (null = none) */
  @state() private _openGroup: string | null = null;

  static styles = css`
    :host { display: block; }

    /* ═══ Header bar ═══ */
    .hdr {
      display: flex;
      align-items: center;
      padding: 0 0.75rem;
      height: var(--header-height, 3rem);
      border-bottom: 1px solid var(--border);
      background: var(--bg1);
      gap: 0.375rem;
      container-type: inline-size;
      container-name: hdr;
    }

    /* ── Logo ── */
    .logo {
      flex: 0 0 auto;
      font-size: 0.9375rem;
      font-weight: 700;
      color: var(--text0);
      letter-spacing: .05em;
      white-space: nowrap;
      margin-right: 0.25rem;
    }
    .logo-glyph { color: var(--accent); margin-right: 0.25rem; }
    .logo-full { display: inline; }
    .logo-short { display: none; }
    @media (max-width: 60em) { .logo-full { display: none; } .logo-short { display: inline; } }
    @media (max-width: 30em) { .logo-short { display: none; } }

    /* ── Nav area ── */
    .nav {
      flex: 1 1 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      min-width: 0;
    }

    /* ── Util group pushed right ── */
    .util-right {
      flex: 0 0 auto;
      margin-left: auto;
    }

    /* ═══ Mode toggle ═══ */
    .wide-mode  { display: contents; }
    .compact-mode { display: none; }
    @container hdr (max-width: 56rem) {
      .wide-mode  { display: none; }
      .compact-mode { display: contents; }
    }

    /* ═══════════════════════════════════
       WIDE — Segmented-control bars
       ═══════════════════════════════════ */
    .group-bar {
      display: inline-flex;
      align-items: center;
      gap: 1px;
      padding: 0.1875rem;
      background: var(--bg2);
      border: 1px solid var(--border);
      border-radius: 0.5rem;
    }

    .g-btn {
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 0.3125rem;
      padding: 0.25rem 0.4375rem;
      background: transparent;
      border: none;
      border-radius: 0.375rem;
      cursor: pointer;
      font-family: inherit;
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--text2);
      transition: background .16s, color .16s, box-shadow .16s;
      white-space: nowrap;
      -webkit-tap-highlight-color: transparent;
    }
    .g-btn:hover {
      color: var(--text0);
      background: color-mix(in srgb, var(--bg3) 70%, transparent);
    }
    .g-btn[data-active] {
      background: var(--bg0, var(--bg1));
      color: var(--text0);
      font-weight: 600;
      box-shadow: 0 1px 4px rgba(0,0,0,.08);
    }
    .g-btn:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 1px;
    }

    .g-ico {
      width: 1.125rem;
      height: 1.125rem;
      border-radius: 0.25rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 0.625rem;
      font-weight: 700;
      background: var(--bg3);
      color: var(--text1);
      flex-shrink: 0;
      transition: background .16s, color .16s;
    }
    .g-btn[data-active] .g-ico {
      background: var(--accent);
      color: #fff;
    }
    .g-btn:hover .g-ico { color: var(--text0); }

    .g-label {
      display: none;
      font-size: 0.6875rem;
    }
    @container hdr (min-width: 72rem) { .g-label { display: inline; } }

    .g-sync {
      width: 0.4375rem;
      height: 0.4375rem;
      border-radius: 50%;
      flex-shrink: 0;
      margin-left: -0.0625rem;
    }
    .g-sync[data-s="idle"]   { background: var(--text3); opacity: 0.5; }
    .g-sync[data-s="saving"] { background: var(--accent); animation: navPulse 1s ease infinite; }
    .g-sync[data-s="saved"]  { background: var(--ok-text, #22c55e); }
    .g-sync[data-s="error"]  { background: var(--err-text, #ef4444); }

    /* ═══════════════════════════════════
       COMPACT — Popup pills (narrow)
       ═══════════════════════════════════ */

    /* ── Pill wrapper (relative for popup) ── */
    .pill-wrap {
      position: relative;
    }

    /* ── Pill button ── */
    .pill {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      background: transparent;
      border: none;
      color: var(--text2);
      padding: 0.3125rem 0.625rem;
      border-radius: 0.375rem;
      cursor: pointer;
      font-family: inherit;
      font-size: 0.75rem;
      font-weight: 500;
      transition: all .16s;
      white-space: nowrap;
      line-height: 1;
      -webkit-tap-highlight-color: transparent;
    }
    .pill:hover { color: var(--text0); background: var(--bg2); }
    .pill[data-active] {
      background: var(--bg2);
      color: var(--text0);
      font-weight: 600;
      box-shadow: 0 1px 3px rgba(0,0,0,.08);
    }
    .pill[data-open] { color: var(--accent); }
    .pill:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

    .pill-ico {
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
    .pill[data-active] .pill-ico {
      background: var(--accent);
      color: #fff;
    }

    /* Chevron */
    .pill-chev {
      font-size: 0.5rem;
      opacity: 0.5;
      transition: transform .16s;
    }
    .pill[data-open] .pill-chev { transform: rotate(180deg); opacity: 0.8; }

    /* ── Backdrop (invisible click catcher) ── */
    .pop-backdrop {
      position: fixed;
      inset: 0;
      z-index: 99;
    }

    /* ── Popup ── */
    .popup {
      position: absolute;
      top: calc(100% + 0.375rem);
      left: 50%;
      transform: translateX(-50%);
      z-index: 100;
      min-width: 11rem;
      background: var(--bg1);
      border: 1px solid var(--border);
      border-radius: 0.625rem;
      box-shadow: 0 8px 28px rgba(0,0,0,.18);
      padding: 0.375rem 0;
      animation: popIn .14s ease-out;
    }
    @keyframes popIn {
      from { opacity: 0; transform: translateX(-50%) translateY(-0.25rem); }
      to   { opacity: 1; transform: translateX(-50%) translateY(0); }
    }

    .pop-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      width: 100%;
      text-align: left;
      padding: 0.4375rem 0.75rem;
      background: transparent;
      border: none;
      cursor: pointer;
      font-family: inherit;
      font-size: 0.8125rem;
      color: var(--text1);
      transition: background .12s;
      -webkit-tap-highlight-color: transparent;
    }
    .pop-item:hover { background: var(--bg2); color: var(--text0); }
    .pop-item[data-active] {
      color: var(--accent);
      font-weight: 600;
      background: color-mix(in srgb, var(--accent) 8%, transparent);
    }
    .pop-ico {
      width: 1.375rem;
      height: 1.375rem;
      border-radius: 0.3125rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.6875rem;
      font-weight: 700;
      background: var(--bg3);
      color: var(--text1);
      flex-shrink: 0;
    }
    .pop-item[data-active] .pop-ico {
      background: var(--accent);
      color: #fff;
    }

    /* ── Sync dot in popup ── */
    .pop-sync {
      margin-left: auto;
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .pop-sync[data-s="idle"]   { background: var(--text3); opacity: 0.5; }
    .pop-sync[data-s="saving"] { background: var(--accent); animation: navPulse 1s ease infinite; }
    .pop-sync[data-s="saved"]  { background: var(--ok-text, #22c55e); }
    .pop-sync[data-s="error"]  { background: var(--err-text, #ef4444); }
    @keyframes navPulse { 0%,100%{opacity:1} 50%{opacity:.3} }

    /* ── Separator dot between groups ── */
    .sep {
      width: 3px;
      height: 3px;
      border-radius: 50%;
      background: var(--border2);
      flex-shrink: 0;
    }
  `;

  /* ── Helpers ── */

  private _toggleGroup(key: string) {
    this._openGroup = this._openGroup === key ? null : key;
  }

  private _closePopup() {
    this._openGroup = null;
  }

  private _onNavClick(id: ViewId) {
    this._openGroup = null;
    this.dispatchEvent(
      new CustomEvent("view-change", { detail: id, bubbles: true, composed: true }),
    );
  }

  /** Find the active item within a group (if any) */
  private _activeIn(group: NavGroup): NavItem | undefined {
    return group.items.find((i) => i.id === this.activeView);
  }

  /* ── Wide: segmented-control bar ── */

  private _renderGroupBar(group: NavGroup) {
    return html`
      <div class="group-bar">
        ${group.items.map((item) => html`
          <button
            class="g-btn"
            ?data-active=${this.activeView === item.id}
            @click=${() => this._onNavClick(item.id)}
            title=${item.label}
            aria-current=${this.activeView === item.id ? "page" : "false"}
          >
            <span class="g-ico">${item.icon}</span>
            <span class="g-label">${item.label}</span>
            ${item.id === "datos" && driveConnected.value
              ? html`<span class="g-sync" data-s=${syncStatus.value}></span>`
              : nothing}
          </button>
        `)}
      </div>
    `;
  }

  private _renderSoloBar(item: NavItem) {
    return html`
      <div class="group-bar">
        <button
          class="g-btn"
          ?data-active=${this.activeView === item.id}
          @click=${() => this._onNavClick(item.id)}
          title=${item.label}
          aria-current=${this.activeView === item.id ? "page" : "false"}
        >
          <span class="g-ico">${item.icon}</span>
          <span class="g-label">${item.label}</span>
        </button>
      </div>
    `;
  }

  /* ── Compact: popup pill ── */

  private _renderGroupPill(group: NavGroup) {
    const active = this._activeIn(group);
    const isOpen = this._openGroup === group.key;
    const pillIcon = active?.icon ?? group.icon;

    return html`
      <div class="pill-wrap">
        <button
          class="pill"
          ?data-active=${!!active}
          ?data-open=${isOpen}
          @click=${() => this._toggleGroup(group.key)}
          aria-haspopup="true"
          aria-expanded=${isOpen}
        >
          <span class="pill-ico">${pillIcon}</span>
          <span class="pill-chev">▾</span>
        </button>

        ${isOpen ? html`
          <div class="pop-backdrop" @click=${this._closePopup}></div>
          <div class="popup">
            ${group.items.map((item) => html`
              <button
                class="pop-item"
                ?data-active=${this.activeView === item.id}
                @click=${() => this._onNavClick(item.id)}
              >
                <span class="pop-ico">${item.icon}</span>
                ${item.label}
                ${item.id === "datos" && driveConnected.value
                  ? html`<span class="pop-sync" data-s=${syncStatus.value}></span>`
                  : nothing}
              </button>
            `)}
          </div>
        ` : nothing}
      </div>
    `;
  }

  render() {
    return html`
      <header class="hdr">
        <span class="logo"><span class="logo-glyph">◈</span><span class="logo-full">Oda Planner</span><span class="logo-short">Oda</span></span>

        <global-filter></global-filter>

        <nav class="nav" aria-label="Navegación principal">
          <!-- Wide: all items visible in framed groups -->
          <span class="wide-mode">
            ${this._renderGroupBar(PLAN_GROUP)}
            ${this._renderSoloBar(SESION_ITEM)}
            ${this._renderGroupBar(TASK_GROUP)}
          </span>

          <!-- Compact: popup pills -->
          <span class="compact-mode">
            ${this._renderGroupPill(PLAN_GROUP)}
            <span class="sep"></span>
            <button
              class="pill"
              ?data-active=${this.activeView === SESION_ITEM.id}
              @click=${() => this._onNavClick(SESION_ITEM.id)}
              aria-current=${this.activeView === SESION_ITEM.id ? "page" : "false"}
            >
              <span class="pill-ico">${SESION_ITEM.icon}</span>
            </button>
            <span class="sep"></span>
            ${this._renderGroupPill(TASK_GROUP)}
          </span>
        </nav>

        <span class="util-right">
          <span class="wide-mode">${this._renderGroupBar(UTIL_GROUP)}</span>
          <span class="compact-mode">${this._renderGroupPill(UTIL_GROUP)}</span>
        </span>
      </header>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "nav-bar": NavBar;
  }
}
