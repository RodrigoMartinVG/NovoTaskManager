import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import type { ViewId } from "./nav-bar.js";
import "./nav-bar.js";
import "../views/hoy-view.js";
import "../views/semana-view.js";
import "../views/materias-view.js";
import "../views/backlog-view.js";
import "../views/kanban-view.js";
import "../views/calendario-view.js";

@customElement("app-shell")
export class AppShell extends LitElement {
  @state() private activeView: ViewId = "hoy";

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .main {
      flex: 1;
      overflow-y: auto;
    }

    /* Custom elements default to display:inline — force block */
    .main > * {
      display: block;
    }

    /* View transition animation (fallback for browsers without View Transitions API) */
    .view-enter {
      animation: viewFadeIn var(--duration-normal, 250ms) var(--ease-out);
    }

    @keyframes viewFadeIn {
      from {
        opacity: 0;
        transform: translateY(6px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;

  private _onViewChange(e: CustomEvent<ViewId>) {
    const newView = e.detail;
    if (newView === this.activeView) return;

    // Use View Transitions API if available
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        this.activeView = newView;
        this.requestUpdate();
      });
    } else {
      this.activeView = newView;
    }
  }

  private _renderView() {
    switch (this.activeView) {
      case "hoy":
        return html`<hoy-view class="view-enter"></hoy-view>`;
      case "semana":
        return html`<semana-view class="view-enter"></semana-view>`;
      case "materias":
        return html`<materias-view class="view-enter"></materias-view>`;
      case "backlog":
        return html`<backlog-view class="view-enter"></backlog-view>`;
      case "kanban":
        return html`<kanban-view class="view-enter"></kanban-view>`;
      case "calendario":
        return html`<calendario-view class="view-enter"></calendario-view>`;
    }
  }

  render() {
    return html`
      <nav-bar
        .activeView=${this.activeView}
        @view-change=${this._onViewChange}
      ></nav-bar>
      <main class="main">
        ${this._renderView()}
      </main>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "app-shell": AppShell;
  }
}
