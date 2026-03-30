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

interface DensityDef {
  id: string;
  label: string;
  icon: string;
}

const DENSITIES: DensityDef[] = [
  { id: "compacto", label: "Compacto", icon: "A" },
  { id: "", label: "Normal", icon: "A" },
  { id: "comodo", label: "Cómodo", icon: "A" },
];

@customElement("nav-bar")
export class NavBar extends LitElement {
  @property() activeView: ViewId = "hoy";
  @property() currentTheme = "noche";
  @property() currentDensity = "";

  private themeOpen = false;

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
      gap: 0.375rem;
      font-size: 0.75rem;
    }
    .tsw-dot {
      width: 0.75rem;
      height: 0.75rem;
      border-radius: 50%;
      border: 1px solid var(--border2);
      flex-shrink: 0;
    }
    .tsw-popover {
      position: absolute;
      top: calc(100% + 0.5rem);
      right: 0;
      width: 10rem;
      background: var(--bg1);
      border: 1px solid var(--border2);
      border-radius: 0.5625rem;
      box-shadow: 0 8px 24px rgba(0,0,0,.15);
      z-index: var(--z-dropdown, 100);
      overflow: hidden;
      padding: 0.5rem;
    }
    .tsw-pop-title {
      font-size: 0.5625rem;
      color: var(--text3);
      letter-spacing: .1em;
      font-weight: 600;
      padding: 0.125rem 0.375rem 0.375rem;
      text-transform: uppercase;
    }
    .tsw-option {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      width: 100%;
      background: transparent;
      border: none;
      color: var(--text1);
      padding: 0.375rem 0.5rem;
      border-radius: 0.375rem;
      font-size: 0.75rem;
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
      width: 0.625rem;
      height: 0.625rem;
      border-radius: 50%;
      border: 1px solid var(--border);
      flex-shrink: 0;
    }

    /* ── Density options ── */
    .tsw-separator {
      height: 1px;
      background: var(--border);
      margin: 0.375rem 0;
    }
    .density-option {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      width: 100%;
      background: transparent;
      border: none;
      color: var(--text1);
      padding: 0.375rem 0.5rem;
      border-radius: 0.375rem;
      font-size: 0.75rem;
      font-family: inherit;
      cursor: pointer;
      transition: all .12s;
    }
    .density-option:hover {
      background: var(--bg2);
      color: var(--text0);
    }
    .density-option[data-active] {
      color: var(--text0);
      font-weight: 600;
    }
    .density-ico {
      font-weight: 700;
      flex-shrink: 0;
      line-height: 1;
    }
    .density-ico-sm { font-size: 0.625rem; }
    .density-ico-md { font-size: 0.75rem; }
    .density-ico-lg { font-size: 0.875rem; }
  `;

  private _onNavClick(id: ViewId) {
    this.dispatchEvent(
      new CustomEvent("view-change", { detail: id, bubbles: true, composed: true }),
    );
  }

  private _onThemeClick(id: string) {
    document.documentElement.setAttribute("data-theme", id);
    localStorage.setItem("oda-theme", id);
    this.currentTheme = id;
    this.themeOpen = false;
    this.requestUpdate();
  }

  private _onDensityClick(id: string) {
    if (id) {
      document.documentElement.setAttribute("data-density", id);
      localStorage.setItem("oda-density", id);
    } else {
      document.documentElement.removeAttribute("data-density");
      localStorage.removeItem("oda-density");
    }
    this.currentDensity = id;
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
    this.currentDensity = document.documentElement.getAttribute("data-density") || "";
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
        <span class="logo"><span class="logo-glyph">◈</span><span class="logo-full">Oda Planner</span><span class="logo-short">Oda</span></span>

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
              <div class="tsw-popover" role="group" aria-label="Apariencia">
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
                <div class="tsw-separator"></div>
                <div class="tsw-pop-title">DENSIDAD</div>
                ${DENSITIES.map(
                  (d) => html`
                  <button
                    class="density-option"
                    ?data-active=${this.currentDensity === d.id}
                    @click=${() => this._onDensityClick(d.id)}
                  >
                    <span class="density-ico ${d.id === "compacto" ? "density-ico-sm" : d.id === "comodo" ? "density-ico-lg" : "density-ico-md"}">${d.icon}</span>
                    ${d.label}
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
