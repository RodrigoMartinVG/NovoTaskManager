import { signal } from "@preact/signals-core";

// ── Tarea ──
/** ID de la tarea en edición. "new" = creación, null = ninguna. */
export const editingTaskId = signal<string | null>(null);
/** Vista a la que volver al cerrar la edición de tarea. */
export const taskReturnView = signal<string>("backlog");
/** Materia preseleccionada para una nueva tarea. */
export const newTaskMateriaId = signal<string>("");

// ── Materia ──
/** ID de la materia en edición. "new" = creación, null = ninguna. */
export const editingMateriaId = signal<string | null>(null);
/** Vista a la que volver al cerrar la edición de materia. */
export const materiaReturnView = signal<string>("materias");

// ── Stats de materia ──
/** ID de la materia cuyas stats se están viendo. */
export const statsMateriaId = signal<string | null>(null);
/** Vista a la que volver al cerrar las stats de materia. */
export const statsReturnView = signal<string>("materias");

// ── Sesión ──
/** ID de la sesión en edición. "new" = creación, null = ninguna. */
export const editingSesionId = signal<string | null>(null);
/** Vista a la que volver al cerrar la edición de sesión. */
export const sesionReturnView = signal<string>("sesiones");
