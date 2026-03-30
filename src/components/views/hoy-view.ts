import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import "../shared/view-placeholder.js";

@customElement("hoy-view")
export class HoyView extends LitElement {
  render() {
    return html`<view-placeholder
      icon="☀️"
      title="Hoy"
      message="Tu dashboard diario. Acá vas a ver el reloj, las tareas de hoy y lo urgente."
    ></view-placeholder>`;
  }
}
