import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";

interface ThemeDef {
  id: string;
  label: string;
  dot: string;
  desc: string;
}

const THEMES: ThemeDef[] = [
  { id: "hueso", label: "Hueso", dot: "#c8b89a", desc: "Cálido y suave" },
  { id: "claro", label: "Claro", dot: "#d0d0d0", desc: "Limpio y neutro" },
  { id: "noche", label: "Noche", dot: "#242428", desc: "Oscuro elegante" },
  { id: "pizarron", label: "Pizarrón", dot: "#1f2440", desc: "Azul profundo" },
  { id: "cafe", label: "Café", dot: "#362820", desc: "Marrón intenso" },
];

interface DensityDef {
  id: string;
  label: string;
  desc: string;
  sampleClass: string;
}

const DENSITIES: DensityDef[] = [
  { id: "compacto", label: "Compacto", desc: "Más info en pantalla", sampleClass: "sm" },
  { id: "", label: "Normal", desc: "Balance ideal", sampleClass: "md" },
  { id: "comodo", label: "Cómodo", desc: "Más legible", sampleClass: "lg" },
  { id: "grande", label: "Extra grande", desc: "Máxima legibilidad", sampleClass: "xl" },
];

@customElement("config-tab-tema")
export class ConfigTabTema extends LitElement {
  @state() private currentTheme = "noche";
  @state() private currentDensity = "";

  static styles = css`
    :host { display: block; }

    .section {
      margin-bottom: var(--space-6, 2rem);
    }

    .section-title {
      font-size: var(--text-sm, 0.8125rem);
      font-weight: 600;
      color: var(--text1);
      margin: 0 0 var(--space-3, 0.75rem);
      letter-spacing: 0.03em;
    }

    /* ── Theme grid ── */
    .theme-grid {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .theme-chip {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.875rem;
      border: 1.5px solid var(--border);
      border-radius: 0.5rem;
      background: var(--bg2);
      color: var(--text1);
      font-family: inherit;
      font-size: var(--text-sm, 0.8125rem);
      cursor: pointer;
      transition: all 0.14s;
    }
    .theme-chip:hover {
      border-color: var(--text3);
      background: var(--bg3);
    }
    .theme-chip[data-active] {
      border-color: var(--accent);
      color: var(--text0);
      font-weight: 600;
      box-shadow: 0 0 0 1px var(--accent);
    }

    .theme-dot {
      width: 1rem;
      height: 1rem;
      border-radius: 50%;
      border: 1px solid rgba(128,128,128,.3);
      flex-shrink: 0;
    }

    .theme-info {
      display: flex;
      flex-direction: column;
      gap: 0.0625rem;
    }

    .theme-label {
      font-weight: inherit;
      line-height: 1.2;
    }

    .theme-desc {
      font-size: var(--text-xs, 0.75rem);
      color: var(--text3);
      font-weight: 400;
    }

    /* ── Density grid ── */
    .density-grid {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .density-chip {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.875rem;
      border: 1.5px solid var(--border);
      border-radius: 0.5rem;
      background: var(--bg2);
      color: var(--text1);
      font-family: inherit;
      font-size: var(--text-sm, 0.8125rem);
      cursor: pointer;
      transition: all 0.14s;
    }
    .density-chip:hover {
      border-color: var(--text3);
      background: var(--bg3);
    }
    .density-chip[data-active] {
      border-color: var(--accent);
      color: var(--text0);
      font-weight: 600;
      box-shadow: 0 0 0 1px var(--accent);
    }

    .density-sample {
      font-weight: 700;
      flex-shrink: 0;
      color: var(--text2);
    }
    .density-sample.sm { font-size: 0.75rem; }
    .density-sample.md { font-size: 0.9375rem; }
    .density-sample.lg { font-size: 1.125rem; }
    .density-sample.xl { font-size: 1.375rem; }

    .density-info {
      display: flex;
      flex-direction: column;
      gap: 0.0625rem;
    }

    .density-label {
      font-weight: inherit;
      line-height: 1.2;
    }

    .density-desc {
      font-size: var(--text-xs, 0.75rem);
      color: var(--text3);
      font-weight: 400;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.currentTheme = document.documentElement.getAttribute("data-theme") || "noche";
    this.currentDensity = document.documentElement.getAttribute("data-density") || "";
  }

  private _applyTheme(id: string) {
    this.currentTheme = id;
    document.documentElement.setAttribute("data-theme", id);
    localStorage.setItem("oda-theme", id);
  }

  private _applyDensity(id: string) {
    this.currentDensity = id;
    if (id) {
      document.documentElement.setAttribute("data-density", id);
      localStorage.setItem("oda-density", id);
    } else {
      document.documentElement.removeAttribute("data-density");
      localStorage.removeItem("oda-density");
    }
  }

  render() {
    return html`
      <div class="section">
        <h3 class="section-title">Tema</h3>
        <div class="theme-grid">
          ${THEMES.map(
            (t) => html`
            <button
              class="theme-chip"
              ?data-active=${this.currentTheme === t.id}
              @click=${() => this._applyTheme(t.id)}
              aria-label="Tema ${t.label}"
            >
              <span class="theme-dot" style="background:${t.dot}"></span>
              <span class="theme-info">
                <span class="theme-label">${t.label}</span>
                <span class="theme-desc">${t.desc}</span>
              </span>
            </button>
          `,
          )}
        </div>
      </div>

      <div class="section">
        <h3 class="section-title">Densidad</h3>
        <div class="density-grid">
          ${DENSITIES.map(
            (d) => html`
            <button
              class="density-chip"
              ?data-active=${this.currentDensity === d.id}
              @click=${() => this._applyDensity(d.id)}
              aria-label="Densidad ${d.label}"
            >
              <span class="density-sample ${d.sampleClass}">A</span>
              <span class="density-info">
                <span class="density-label">${d.label}</span>
                <span class="density-desc">${d.desc}</span>
              </span>
            </button>
          `,
          )}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "config-tab-tema": ConfigTabTema;
  }
}
