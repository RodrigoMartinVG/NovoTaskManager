import { SignalWatcher } from "@lit-labs/signals";
import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { isWelcome } from "../../state/store.js";
import type { ViewId } from "./nav-bar.js";
import "./nav-bar.js";
import "../views/hoy-view.js";
import "../views/semana-view.js";
import "../views/materias-view.js";
import "../views/backlog-view.js";
import "../views/kanban-view.js";
import "../views/calendario-view.js";
import "../views/config/config-view.js";
import "../views/task-view.js";
import "../views/materia-edit-view.js";
import "../views/materia-stats-view.js";
import "../views/sesiones-view.js";
import "../views/sesion-edit-view.js";
import "../views/datos-view.js";
import "../views/ayuda-view.js";
import "../pomodoro/pomo-focus-view.js";
import "../pomodoro/pomo-widget.js";

@customElement("app-shell")
export class AppShell extends SignalWatcher(LitElement) {
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
        transform: translateY(0.375rem);
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
      case "sesiones":
        return html`<sesiones-view class="view-enter" @view-change=${this._onViewChange}></sesiones-view>`;
      case "kanban":
        return html`<kanban-view class="view-enter"></kanban-view>`;
      case "calendario":
        return html`<calendario-view class="view-enter"></calendario-view>`;
      case "config":
        return html`<config-view class="view-enter"></config-view>`;
      case "datos":
        return html`<datos-view class="view-enter"></datos-view>`;
      case "ayuda":
        return html`<ayuda-view class="view-enter"></ayuda-view>`;
      case "task":
        return html`<task-view class="view-enter" @view-change=${this._onViewChange}></task-view>`;
      case "materia-edit":
        return html`<materia-edit-view class="view-enter" @view-change=${this._onViewChange}></materia-edit-view>`;
      case "materia-stats":
        return html`<materia-stats-view class="view-enter" @view-change=${this._onViewChange}></materia-stats-view>`;
      case "sesion-edit":
        return html`<sesion-edit-view class="view-enter" @view-change=${this._onViewChange}></sesion-edit-view>`;
    }
  }

  render() {
    // Onboarding mode: only show the wizard
    if (isWelcome.value) {
      return html`<onboarding-flow @onboarding-done=${() => { this.activeView = "ayuda"; this.requestUpdate(); }}></onboarding-flow>`;
    }

    return html`
      <nav-bar
        .activeView=${this.activeView}
        @view-change=${this._onViewChange}
      ></nav-bar>
      <main class="main" @view-change=${this._onViewChange}>
        ${this._renderView()}
      </main>

      <!-- Pomodoro overlays (self-hide via signals) -->
      <pomo-focus-view></pomo-focus-view>
      <pomo-widget></pomo-widget>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "app-shell": AppShell;
  }
}
