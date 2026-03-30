import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

export type ViewId = "hoy" | "semana" | "materias" | "backlog" | "kanban" | "calendario";

export interface NavItem {
  id: ViewId;
  icon: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "hoy", icon: "H", label: "Hoy" },
  { id: "semana", icon: "S", label: "Semana" },
  { id: "materias", icon: "M", label: "Materias" },
  { id: "backlog", icon: "B", label: "Backlog" },
  { id: "kanban", icon: "K", label: "Kanban" },
  { id: "calendario", icon: "C", label: "Calendario" },
];

interface ThemeDef {
  id: string;
  label: string;
  dot: string;
}

const THEMES: ThemeDef[] = [
  { id: "hueso", label: "Hueso", dot: "#c8b89a" },
  { id: "claro", label: "Claro", dot: "#d0d0d0" },
  { id: "noche", label: "Noche", dot: "#242428" },
  { id: "pizarron", label: "Pizarrón", dot: "#1f2440" },
  { id: "cafe", label: "Café", dot: "#362820" },
];

@customElement("nav-bar")
export class NavBar extends LitElement {
  @property() activeView: ViewId = "hoy";
  @property() currentTheme = "noche";

  private themeOpen = false;

  static styles = css`
    :host {
      display: block;
    }

    .hdr {
      display: flex;
      align-items: center;
      padding: 0 16px;
      height: var(--header-height, 56px);
      border-bottom: 1px solid var(--border);
      background: var(--bg1);
      gap: 8px;
    }

    /* ── Logo ── */
    .logo {
      flex: 0 0 auto;
      font-size: 15px;
      font-weight: 700;
      color: var(--text0);
      letter-spacing: .05em;
      white-space: nowrap;
    }
    .logo-glyph {
      color: var(--accent);
      margin-right: 4px;
    }

    /* ── Nav pills (centradas, ocupan espacio restante) ── */
    .nav {
      flex: 1 1 0;
      display: flex;
      gap: 4px;
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
      padding: 6px 14px;
      border-radius: 6px;
      cursor: pointer;
      font-family: inherit;
      font-size: 12px;
      font-weight: 500;
      transition: all .18s;
      white-space: nowrap;
      display: inline-flex;
      align-items: center;
      gap: 6px;
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
      font-size: 11px;
      font-weight: 700;
      width: 18px;
      height: 18px;
      border-radius: 4px;
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
    @media (max-width: 768px) {
      .nb-label {
        display: none;
      }
      .nb {
        padding: 6px 8px;
      }
      .ibtn {
        width: 28px;
        height: 28px;
        font-size: 12px;
      }
      .tsw-dot {
        width: 10px;
        height: 10px;
      }
      .actions {
        gap: 3px;
      }
    }

    /* ── Actions (derecha) ── */
    .actions {
      flex: 0 0 auto;
      display: flex;
      gap: 4px;
      align-items: center;
    }

    .ibtn {
      background: transparent;
      border: 1px solid var(--border);
      color: var(--text2);
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      cursor: pointer;
      transition: all .16s;
      position: relative;
    }
    .ibtn:hover {
      color: var(--text0);
      background: var(--bg2);
      border-color: var(--border2);
    }
    .ibtn:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 2px;
    }

    /* ── Theme switcher ── */
    .tsw {
      position: relative;
    }
    .tsw-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
    }
    .tsw-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 1px solid var(--border2);
      flex-shrink: 0;
    }
    .tsw-popover {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      width: 160px;
      background: var(--bg1);
      border: 1px solid var(--border2);
      border-radius: 9px;
      box-shadow: 0 8px 24px rgba(0,0,0,.15);
      z-index: var(--z-dropdown, 100);
      overflow: hidden;
      padding: 8px;
    }
    .tsw-pop-title {
      font-size: 9px;
      color: var(--text3);
      letter-spacing: .1em;
      font-weight: 600;
      padding: 2px 6px 6px;
      text-transform: uppercase;
    }
    .tsw-option {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      background: transparent;
      border: none;
      color: var(--text1);
      padding: 6px 8px;
      border-radius: 6px;
      font-size: 12px;
      font-family: inherit;
      cursor: pointer;
      transition: all .12s;
    }
    .tsw-option:hover {
      background: var(--bg2);
      color: var(--text0);
    }
    .tsw-option[data-active] {
      color: var(--text0);
      font-weight: 600;
    }
    .tsw-option-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      border: 1px solid var(--border);
      flex-shrink: 0;
    }
  `;

  private _onNavClick(id: ViewId) {
    this.dispatchEvent(
      new CustomEvent("view-change", { detail: id, bubbles: true, composed: true }),
    );
  }

  private _onThemeClick(id: string) {
    document.documentElement.setAttribute("data-theme", id);
    localStorage.setItem("uai-theme", id);
    this.currentTheme = id;
    this.themeOpen = false;
    this.requestUpdate();
  }

  private _toggleThemePopover() {
    this.themeOpen = !this.themeOpen;
    this.requestUpdate();
  }

  private _closeThemePopover = (e: MouseEvent) => {
    const path = e.composedPath();
    if (!path.includes(this)) {
      this.themeOpen = false;
      this.requestUpdate();
    }
  };

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener("click", this._closeThemePopover);
    this.currentTheme = document.documentElement.getAttribute("data-theme") || "noche";
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener("click", this._closeThemePopover);
  }

  private _currentThemeDef() {
    return THEMES.find((t) => t.id === this.currentTheme) || THEMES[2];
  }

  render() {
    const theme = this._currentThemeDef();

    return html`
      <header class="hdr">
        <span class="logo"><span class="logo-glyph">◈</span>UAI Planner</span>

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
          <button class="ibtn" aria-label="Ayuda" title="Ayuda">?</button>
          <button class="ibtn" aria-label="Configuración" title="Configuración">⚙</button>
          <button class="ibtn" aria-label="Datos" title="Datos">💾</button>
          <div class="tsw">
            <button
              class="ibtn tsw-btn"
              @click=${this._toggleThemePopover}
              aria-label="Cambiar tema"
              aria-expanded=${this.themeOpen}
            >
              <span class="tsw-dot" style="background:${theme.dot}"></span>
            </button>
            ${
              this.themeOpen
                ? html`
              <div class="tsw-popover" role="listbox" aria-label="Temas">
                <div class="tsw-pop-title">TEMA</div>
                ${THEMES.map(
                  (t) => html`
                  <button
                    class="tsw-option"
                    ?data-active=${t.id === this.currentTheme}
                    role="option"
                    aria-selected=${t.id === this.currentTheme}
                    @click=${() => this._onThemeClick(t.id)}
                  >
                    <span class="tsw-option-dot" style="background:${t.dot}"></span>
                    ${t.label}
                  </button>
                `,
                )}
              </div>
            `
                : null
            }
          </div>
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
