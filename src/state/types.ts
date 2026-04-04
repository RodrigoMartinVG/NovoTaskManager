/* ═══ Oda v3.0 — Domain Types ═══ */

// ── Materia ──
export interface MateriaSlot {
  dia: number;      // 0=lun, 1=mar, 2=mié, 3=jue, 4=vie, 5=sáb, 6=dom
  franjaId: string; // referencia a FranjaDef.id
}

export type Periodo = "C1" | "C2" | "anual";

export interface Profesor {
  nombre: string;
  email: string;
  descripcion: string;
}

export interface Materia {
  id: string;
  nombre: string;
  color: string;
  codigo?: string;
  anio?: number;
  periodo?: Periodo;
  horasSemanalesMin?: number;
  horasSemanalesMax?: number;
  slots?: MateriaSlot[];
  activa?: boolean;
  tags?: string[];
  comision?: string;
  profesores?: Profesor[];
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
  tags?: string[];
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
  tags?: string[];
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

// ── Tags ──
export interface Tag {
  id: string;
  nombre: string;
  color: string; // hex
}

// ── PlannerData (raíz) ──
export interface PlannerData {
  materias: Materia[];
  tipos: TipoTarea[];
  tareas: Tarea[];
  sesiones: Sesion[];
  franjas: FranjaDef[];
  alertas: AlertConfig;
  tags: Tag[];
  updatedAt?: string; // ISO 8601
}

// ── App mode ──
export type AppMode = "welcome" | "local" | "drive";
