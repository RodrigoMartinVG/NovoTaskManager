import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import "../shared/view-placeholder.js";

@customElement("calendario-view")
export class CalendarioView extends LitElement {
  render() {
    return html`<view-placeholder
      icon="🗓️"
      title="Calendario"
      message="Vista mensual con tus tareas y eventos. Navegá entre meses de un vistazo."
    ></view-placeholder>`;
  }
}
