import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import "../shared/view-placeholder.js";

@customElement("materias-view")
export class MateriasView extends LitElement {
  render() {
    return html`<view-placeholder
      icon="📚"
      title="Materias"
      message="El catálogo de tus materias. Cards con colores, estadísticas y detalle expandible."
    ></view-placeholder>`;
  }
}
