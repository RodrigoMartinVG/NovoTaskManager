import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import "../shared/view-placeholder.js";

@customElement("backlog-view")
export class BacklogView extends LitElement {
  render() {
    return html`<view-placeholder
      icon="📋"
      title="Backlog"
      message="La lista maestra de todas tus tareas. Filtros, prioridades y señal táctica por fila."
    ></view-placeholder>`;
  }
}
