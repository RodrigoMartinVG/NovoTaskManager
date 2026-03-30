/* ═══ Oda v3.0 — Domain Types ═══ */

// ── Materia ──
export interface Materia {
  id: string;
  nombre: string;
  color: string;
  horasSemanales?: number;
  activa?: boolean;
}

// ── Tipo de tarea ──
export interface TipoTarea {
  id: string;
  nombre: string;
  icono: string;
  activo?: boolean;
}

// ── Tarea ──
export type EstadoTarea = "pendiente" | "en_progreso" | "completada";
export type Prioridad = "alta" | "media" | "baja";

export interface ChecklistItem {
  id: string;
  texto: string;
  hecho: boolean;
}

export interface Tarea {
  id: string;
  titulo: string;
  materiaId: string;
  tipo: string;
  estado: EstadoTarea;
  prioridad: Prioridad;
  fechaInicio?: string;
  fechaLimite?: string;
  horaLimite?: string;
  obligatorio: boolean;
  descripcion?: string;
  link?: string;
  items: ChecklistItem[];
}

// ── Sesión de estudio ──
export type OrigenSesion = "timer" | "manual";

export interface Sesion {
  id: string;
  materiaId: string;
  tareaId: string | null;
  inicio: string;
  minutos: number;
  origen: OrigenSesion;
  titulo?: string;
}

// ── Franjas horarias ──
export interface FranjaDef {
  id: string;
  nombre: string;
  emoji: string;
  horaInicio: number;
  horaFin: number;
}

// ── Alertas ──
export interface AlertConfig {
  rojo: number;
  amarillo: number;
  verde: number;
  inicio: number;
}

// ── PlannerData (raíz) ──
export interface PlannerData {
  materias: Materia[];
  tipos: TipoTarea[];
  tareas: Tarea[];
  sesiones: Sesion[];
  franjas?: FranjaDef[];
  alertas?: AlertConfig;
}

// ── App mode ──
export type AppMode = "welcome" | "local" | "drive";
