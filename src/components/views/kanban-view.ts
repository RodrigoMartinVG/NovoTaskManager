import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import "../shared/view-placeholder.js";

@customElement("kanban-view")
export class KanbanView extends LitElement {
  render() {
    return html`<view-placeholder
      icon="🗂️"
      title="Kanban"
      message="Tus tareas en columnas. Arrastrá entre Pendiente, En Progreso y Completada."
    ></view-placeholder>`;
  }
}
