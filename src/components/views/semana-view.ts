import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import "../shared/view-placeholder.js";

@customElement("semana-view")
export class SemanaView extends LitElement {
  render() {
    return html`<view-placeholder
      icon="📅"
      title="Semana"
      message="Tu planificación semanal. Grilla de 7 días con franjas horarias y tareas arrastrables."
    ></view-placeholder>`;
  }
}
