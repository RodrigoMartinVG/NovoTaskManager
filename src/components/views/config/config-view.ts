import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import "./config-tab-tipos.js";
import "./config-tab-franjas.js";
import "./config-tab-tema.js";
import "./config-tab-alertas.js";

type ConfigTab = "tipos" | "franjas" | "tema" | "alertas";

interface TabDef {
  id: ConfigTab;
  label: string;
  icon: string;
}

const TABS: TabDef[] = [
  { id: "tipos", label: "Tipos", icon: "📋" },
  { id: "franjas", label: "Franjas", icon: "🕐" },
  { id: "tema", label: "Apariencia", icon: "🎨" },
  { id: "alertas", label: "Alertas", icon: "🔔" },
];

@customElement("config-view")
export class ConfigView extends LitElement {
  @state() private activeTab: ConfigTab = "tipos";

  static styles = css`
    :host {
      display: block;
      max-width: 52rem;
      margin: 0 auto;
      padding: var(--space-5, 1.5rem) var(--space-4, 1rem);
    }

    .header {
      margin-bottom: var(--space-5, 1.5rem);
    }

    .title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text0);
      margin: 0 0 var(--space-3, 0.75rem);
    }

    /* ── Tab bar ── */
    .tabs {
      display: flex;
      gap: 0.25rem;
      border-bottom: 1px solid var(--border);
      padding-bottom: 0;
      overflow-x: auto;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
    }
    .tabs::-webkit-scrollbar { display: none; }

    .tab {
      background: transparent;
      border: none;
      border-bottom: 2px solid transparent;
      color: var(--text2);
      padding: 0.5rem 1rem;
      font-family: inherit;
      font-size: var(--text-sm, 0.8125rem);
      font-weight: 500;
      cursor: pointer;
      transition: all 0.16s;
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      margin-bottom: -1px;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .tab:hover {
      color: var(--text0);
      background: var(--bg2);
    }

    .tab[data-active] {
      color: var(--accent);
      border-bottom-color: var(--accent);
      font-weight: 600;
    }

    .tab:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: -2px;
      border-radius: 0.25rem 0.25rem 0 0;
    }

    .tab-icon {
      font-size: 0.875rem;
    }

    /* ── Panel ── */
    .panel {
      padding-top: var(--space-5, 1.5rem);
    }
  `;

  private _onTabClick(id: ConfigTab) {
    this.activeTab = id;
  }

  private _renderPanel() {
    switch (this.activeTab) {
      case "tipos":
        return html`<config-tab-tipos></config-tab-tipos>`;
      case "franjas":
        return html`<config-tab-franjas></config-tab-franjas>`;
      case "tema":
        return html`<config-tab-tema></config-tab-tema>`;
      case "alertas":
        return html`<config-tab-alertas></config-tab-alertas>`;
    }
  }

  render() {
    return html`
      <div class="header">
        <h1 class="title">Configuración</h1>
        <div class="tabs" role="tablist" aria-label="Secciones de configuración">
          ${TABS.map(
            (tab) => html`
            <button
              class="tab"
              role="tab"
              ?data-active=${this.activeTab === tab.id}
              aria-selected=${this.activeTab === tab.id}
              @click=${() => this._onTabClick(tab.id)}
            >
              <span class="tab-icon">${tab.icon}</span>
              ${tab.label}
            </button>
          `,
          )}
        </div>
      </div>
      <div class="panel" role="tabpanel">
        ${this._renderPanel()}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "config-view": ConfigView;
  }
}
