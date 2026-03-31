/* ═══ Oda v3.0 — App Store (Signals) ═══ */
import { computed, signal } from "@preact/signals-core";
import { driveConnected, scheduleAutoSave } from "./gdrive.js";
import type { AlertConfig, AppMode, FranjaDef, Materia, MateriaSlot, Periodo, PlannerData, Sesion, Tarea, TipoTarea } from "./types.js";

// ── Storage keys ──
const KEY_MODE = "oda-mode";
const KEY_DATA = "oda-data-v1";

// ── Default empty data ──
const DEFAULT_FRANJAS: FranjaDef[] = [
  { id: "f-am", nombre: "Matutino", emoji: "☀️", horaInicio: 480, horaFin: 720 },
  { id: "f-pm", nombre: "Vespertino", emoji: "🌤", horaInicio: 780, horaFin: 1080 },
  { id: "f-nt", nombre: "Nocturno", emoji: "🌙", horaInicio: 1140, horaFin: 1380 },
];

const DEFAULT_TIPOS: TipoTarea[] = [
  { id: "t-tp", nombre: "TP", icono: "📝", activo: true },
  { id: "t-parcial", nombre: "Parcial", icono: "📝", activo: true },
  { id: "t-final", nombre: "Final", icono: "🎯", activo: true },
  { id: "t-lectura", nombre: "Lectura", icono: "📖", activo: true },
  { id: "t-guia", nombre: "Guía de ejercicios", icono: "📊", activo: true },
  { id: "t-video", nombre: "Video / Clase", icono: "🎥", activo: true },
  { id: "t-resumen", nombre: "Resumen", icono: "🗒️", activo: true },
  { id: "t-proyecto", nombre: "Proyecto", icono: "🛠️", activo: true },
  { id: "t-otro", nombre: "Otro", icono: "📌", activo: true },
];

export const DEFAULT_ALERTAS: AlertConfig = { rojo: 2, amarillo: 7, verde: 14, inicio: 2 };

const emptyData = (): PlannerData => ({
  materias: [],
  tipos: DEFAULT_TIPOS.map((t) => ({ ...t })),
  tareas: [],
  sesiones: [],
  franjas: DEFAULT_FRANJAS.map((f) => ({ ...f })),
  alertas: { ...DEFAULT_ALERTAS },
});

// ── Core signals ──
export const appMode = signal<AppMode>((localStorage.getItem(KEY_MODE) as AppMode) || "welcome");

export const plannerData = signal<PlannerData>(
  (() => {
    try {
      const raw = localStorage.getItem(KEY_DATA);
      if (!raw) return emptyData();
      const data = JSON.parse(raw) as PlannerData;
      // Backfill default franjas for existing users
      if (!data.franjas || data.franjas.length === 0) {
        data.franjas = DEFAULT_FRANJAS.map((f) => ({ ...f }));
      }
      // Backfill default alertas for existing users
      if (!data.alertas) {
        data.alertas = { ...DEFAULT_ALERTAS };
      }
      return data;
    } catch {
      return emptyData();
    }
  })(),
);

// ── Pomodoro runtime (not persisted) ──
export interface PomoSession {
  materiaId: string;
  tareaId: string | null;
  titulo: string;
}

export const pomoSession = signal<PomoSession | null>(null);
export const pomoFocusMode = signal(false);

// ── Derived ──
export const materias = computed(() => plannerData.value.materias);
export const tareas = computed(() => plannerData.value.tareas);
export const sesiones = computed(() => plannerData.value.sesiones);
export const isWelcome = computed(() => appMode.value === "welcome");
export const alertConfig = computed(() => plannerData.value.alertas ?? DEFAULT_ALERTAS);

// ── Global filter ──
export const globalFilterAnio = signal<number | null>(null);
export const globalFilterPeriodos = signal<Periodo[]>([]);

const _filterMateriaIds = computed(() => {
  const anio = globalFilterAnio.value;
  const periodos = globalFilterPeriodos.value;
  if (anio === null && periodos.length === 0) return null;
  const ids = new Set<string>();
  for (const m of plannerData.value.materias) {
    if (anio !== null && m.anio !== anio) continue;
    if (periodos.length > 0 && (!m.periodo || !periodos.includes(m.periodo))) continue;
    ids.add(m.id);
  }
  return ids;
});

export const filteredMaterias = computed(() => {
  const ids = _filterMateriaIds.value;
  return ids === null ? plannerData.value.materias : plannerData.value.materias.filter((m) => ids.has(m.id));
});

export const filteredTareas = computed(() => {
  const ids = _filterMateriaIds.value;
  return ids === null ? plannerData.value.tareas : plannerData.value.tareas.filter((t) => ids.has(t.materiaId));
});

export const filteredSesiones = computed(() => {
  const ids = _filterMateriaIds.value;
  return ids === null ? plannerData.value.sesiones : plannerData.value.sesiones.filter((s) => ids.has(s.materiaId));
});

// ── Actions ──
export function setAppMode(mode: AppMode) {
  appMode.value = mode;
  localStorage.setItem(KEY_MODE, mode);
}

export function setPlannerData(data: PlannerData) {
  plannerData.value = data;
  localStorage.setItem(KEY_DATA, JSON.stringify(data));
  // Auto-save to Drive if connected
  if (driveConnected.value) {
    scheduleAutoSave(() => plannerData.value);
  }
}

export function addSesion(ses: Sesion) {
  const d = plannerData.value;
  setPlannerData({ ...d, sesiones: [...d.sesiones, ses] });
}

export function updateSesion(id: string, patch: Partial<Sesion>) {
  const d = plannerData.value;
  setPlannerData({
    ...d,
    sesiones: d.sesiones.map((s) => (s.id === id ? { ...s, ...patch } : s)),
  });
}

export function deleteSesion(id: string) {
  const d = plannerData.value;
  setPlannerData({ ...d, sesiones: d.sesiones.filter((s) => s.id !== id) });
}

// ── Sesion editing ──
/** Signal: session id being edited, "new" for creation, null for none */
export const editingSesionId = signal<string | null>(null);
/** Signal: view to return to after session editing */
export const sesionReturnView = signal<string>("sesiones");

// ── Materia CRUD ──
export function addMateria(m: Materia) {
  const d = plannerData.value;
  setPlannerData({ ...d, materias: [...d.materias, m] });
}

export function updateMateria(id: string, patch: Partial<Materia>) {
  const d = plannerData.value;
  setPlannerData({
    ...d,
    materias: d.materias.map((m) => (m.id === id ? { ...m, ...patch } : m)),
  });
}

export function deleteMateria(id: string) {
  const d = plannerData.value;
  setPlannerData({ ...d, materias: d.materias.filter((m) => m.id !== id) });
}

// ── TipoTarea CRUD ──
export function addTipo(t: TipoTarea) {
  const d = plannerData.value;
  setPlannerData({ ...d, tipos: [...d.tipos, t] });
}

export function updateTipo(id: string, patch: Partial<TipoTarea>) {
  const d = plannerData.value;
  setPlannerData({
    ...d,
    tipos: d.tipos.map((t) => (t.id === id ? { ...t, ...patch } : t)),
  });
}

export function deleteTipo(id: string) {
  const d = plannerData.value;
  setPlannerData({ ...d, tipos: d.tipos.filter((t) => t.id !== id) });
}

// ── Alertas ──
export function setAlertConfig(cfg: AlertConfig) {
  const d = plannerData.value;
  setPlannerData({ ...d, alertas: cfg });
}

// ── Franjas ──
export function setFranjas(newFranjas: FranjaDef[]) {
  const d = plannerData.value;
  const oldFranjas = d.franjas ?? [];

  // Detect if franja IDs changed (not just names/times)
  const oldIds = new Set(oldFranjas.map((f) => f.id));
  const newIds = new Set(newFranjas.map((f) => f.id));
  const idsChanged = oldIds.size !== newIds.size || [...oldIds].some((id) => !newIds.has(id));

  if (idsChanged && oldFranjas.length > 0 && d.materias.some((m) => m.slots && m.slots.length > 0)) {
    const migrated = migrateSlots(oldFranjas, newFranjas, d.materias);
    setPlannerData({ ...d, franjas: newFranjas, materias: migrated });
  } else {
    setPlannerData({ ...d, franjas: newFranjas });
  }
}

/** Migrate materia slots when franja IDs change — maps by time-range overlap */
function migrateSlots(
  oldFranjas: FranjaDef[],
  newFranjas: FranjaDef[],
  mats: Materia[],
): Materia[] {
  if (newFranjas.length === 0) return mats;

  // Build mapping: oldFranjaId → newFranjaId[]
  const mapping = new Map<string, string[]>();

  for (const oldF of oldFranjas) {
    const targets: string[] = [];
    for (const newF of newFranjas) {
      // Strict interval overlap: (a1, a2) ∩ (b1, b2) ≠ ∅
      if (oldF.horaInicio < newF.horaFin && newF.horaInicio < oldF.horaFin) {
        targets.push(newF.id);
      }
    }

    // Fallback: no overlap → pick nearest franja by midpoint distance
    if (targets.length === 0) {
      const oldMid = (oldF.horaInicio + oldF.horaFin) / 2;
      let bestId = newFranjas[0].id;
      let bestDist = Infinity;
      for (const newF of newFranjas) {
        const dist = Math.abs((newF.horaInicio + newF.horaFin) / 2 - oldMid);
        if (dist < bestDist) {
          bestDist = dist;
          bestId = newF.id;
        }
      }
      targets.push(bestId);
    }

    mapping.set(oldF.id, targets);
  }

  return mats.map((mat) => {
    if (!mat.slots || mat.slots.length === 0) return mat;

    const seen = new Set<string>();
    const migrated: MateriaSlot[] = [];

    for (const slot of mat.slots) {
      const targets = mapping.get(slot.franjaId);
      if (!targets) continue;
      for (const fid of targets) {
        const key = `${slot.dia}-${fid}`;
        if (!seen.has(key)) {
          seen.add(key);
          migrated.push({ dia: slot.dia, franjaId: fid });
        }
      }
    }

    return { ...mat, slots: migrated.length > 0 ? migrated : undefined };
  });
}

// ── Tarea CRUD ──
/** Signal: task id being edited, "new" for creation, null for none */
export const editingTaskId = signal<string | null>(null);
/** Signal: view to return to after task editing */
export const taskReturnView = signal<string>("backlog");
/** Signal: pre-selected materia for new task */
export const newTaskMateriaId = signal<string>("");

// ── Materia editing ──
/** Signal: materia id being edited, "new" for creation, null for none */
export const editingMateriaId = signal<string | null>(null);
/** Signal: view to return to after materia editing */
export const materiaReturnView = signal<string>("materias");

// ── Materia stats ──
/** Signal: materia id whose stats are being viewed */
export const statsMateriaId = signal<string | null>(null);
/** Signal: view to return to after materia stats */
export const statsReturnView = signal<string>("materias");

export function addTarea(t: Tarea) {
  const d = plannerData.value;
  setPlannerData({ ...d, tareas: [...d.tareas, t] });
}

export function updateTarea(id: string, patch: Partial<Tarea>) {
  const d = plannerData.value;
  setPlannerData({
    ...d,
    tareas: d.tareas.map((t) => (t.id === id ? { ...t, ...patch } : t)),
  });
}

export function deleteTarea(id: string) {
  const d = plannerData.value;
  setPlannerData({ ...d, tareas: d.tareas.filter((t) => t.id !== id) });
}

export function enterLocal() {
  setPlannerData(emptyData());
  setAppMode("local");
}

export function enterDemo() {
  setPlannerData(buildDemoData());
  setAppMode("local");
}

// ── Demo data ──
function buildDemoData(): PlannerData {
  const now = new Date();
  const inDays = (d: number) => {
    const dt = new Date(now);
    dt.setDate(dt.getDate() + d);
    return dt.toISOString().slice(0, 10);
  };

  return {
    materias: [
      {
        id: "m1",
        nombre: "Análisis Matemático",
        color: "#6366f1",
        codigo: "MAT-201",
        anio: 2,
        periodo: "C1",
        horasSemanalesMin: 6,
        horasSemanalesMax: 8,
        slots: [
          { dia: 0, franjaId: "f-am" },
          { dia: 2, franjaId: "f-am" },
          { dia: 4, franjaId: "f-pm" },
        ],
        activa: true,
      },
      {
        id: "m2",
        nombre: "Bases de Datos",
        color: "#f59e0b",
        codigo: "INF-302",
        anio: 3,
        periodo: "C1",
        horasSemanalesMin: 4,
        horasSemanalesMax: 6,
        slots: [
          { dia: 1, franjaId: "f-pm" },
          { dia: 3, franjaId: "f-pm" },
        ],
        activa: true,
      },
      {
        id: "m3",
        nombre: "Historia",
        color: "#10b981",
        codigo: "HIS-101",
        anio: 1,
        periodo: "C2",
        horasSemanalesMin: 3,
        slots: [
          { dia: 4, franjaId: "f-nt" },
          { dia: 5, franjaId: "f-am" },
        ],
        activa: true,
      },
    ],
    tipos: DEFAULT_TIPOS.map((t) => ({ ...t })),
    tareas: [
      {
        id: "ta1",
        titulo: "TP Integrales definidas",
        materiaId: "m1",
        tipo: "t-tp",
        estado: "en_progreso",
        prioridad: "alta",
        fechaLimite: inDays(2),
        obligatorio: true,
        items: [],
      },
      {
        id: "ta2",
        titulo: "Resumen normalización 3FN",
        materiaId: "m2",
        tipo: "t-resumen",
        estado: "pendiente",
        prioridad: "media",
        fechaLimite: inDays(5),
        obligatorio: false,
        items: [],
      },
      {
        id: "ta3",
        titulo: "Parcial Revolución Francesa",
        materiaId: "m3",
        tipo: "t-parcial",
        estado: "pendiente",
        prioridad: "alta",
        fechaLimite: inDays(1),
        obligatorio: true,
        items: [],
      },
      {
        id: "ta4",
        titulo: "Ejercicios ecuaciones diferenciales",
        materiaId: "m1",
        tipo: "t-guia",
        estado: "completada",
        prioridad: "media",
        obligatorio: false,
        items: [],
      },
    ],
    sesiones: [
      {
        id: "s1",
        materiaId: "m1",
        tareaId: "ta1",
        inicio: `${inDays(-1)}T14:00:00`,
        minutos: 45,
        origen: "timer",
        titulo: "Integrales parte 1",
      },
      {
        id: "s2",
        materiaId: "m2",
        tareaId: null,
        inicio: `${inDays(-2)}T19:00:00`,
        minutos: 60,
        origen: "timer",
      },
      {
        id: "s3",
        materiaId: "m3",
        tareaId: "ta3",
        inicio: `${inDays(0)}T10:00:00`,
        minutos: 30,
        origen: "manual",
        titulo: "Lectura previa",
      },
    ],
    franjas: DEFAULT_FRANJAS.map((f) => ({ ...f })),
  };
}
