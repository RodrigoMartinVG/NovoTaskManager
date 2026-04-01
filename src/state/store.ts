/* ═══ Oda v3.0 — App Store (Signals) ═══ */
import { computed, signal } from "@preact/signals-core";
import { driveConnected, scheduleAutoSave } from "./gdrive.js";
import { migrateSlots } from "../domain/slot-migration.js";
import { DEFAULT_ALERTAS, DEFAULT_FRANJAS, emptyData } from "./defaults.js";
import { buildDemoData } from "./demo-data.js";
import type { AlertConfig, AppMode, FranjaDef, Materia, Periodo, PlannerData, Sesion, Tag, Tarea, TipoTarea } from "./types.js";

// Re-export for consumers that import from store
export { DEFAULT_ALERTAS } from "./defaults.js";

// ── Storage keys ──
const KEY_MODE = "oda-mode";
const KEY_DATA = "oda-data-v1";

// ── Core signals ──
export const appMode = signal<AppMode>((localStorage.getItem(KEY_MODE) as AppMode) || "welcome");

/** Aplica migraciones de compatibilidad a datos de versiones anteriores. */
function migrateStoredData(raw: Partial<PlannerData>): PlannerData {
  return {
    ...emptyData(),
    ...raw,
    franjas: (raw.franjas && raw.franjas.length > 0)
      ? raw.franjas
      : DEFAULT_FRANJAS.map((f) => ({ ...f })),
    alertas: raw.alertas ?? { ...DEFAULT_ALERTAS },
  };
}

/** Carga PlannerData desde localStorage. Retorna emptyData() si no existe o falla el parse. */
function loadStoredData(): PlannerData {
  try {
    const raw = localStorage.getItem(KEY_DATA);
    if (!raw) return emptyData();
    return migrateStoredData(JSON.parse(raw) as Partial<PlannerData>);
  } catch {
    return emptyData();
  }
}

export const plannerData = signal<PlannerData>(loadStoredData());

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
export const alertConfig = computed(() => plannerData.value.alertas);

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

export function setPlannerData(data: PlannerData, preserveTimestamp = false) {
  const stamped: PlannerData = preserveTimestamp
    ? data
    : { ...data, updatedAt: new Date().toISOString() };
  plannerData.value = stamped;
  localStorage.setItem(KEY_DATA, JSON.stringify(stamped));
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
  const oldFranjas = d.franjas;

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

// ── Tarea CRUD ──

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

// ── Tag CRUD ──
export function addTag(tag: Tag) {
  const d = plannerData.value;
  setPlannerData({ ...d, tags: [...(d.tags ?? []), tag] });
}

export function updateTag(id: string, patch: Partial<Tag>) {
  const d = plannerData.value;
  setPlannerData({
    ...d,
    tags: (d.tags ?? []).map((t) => (t.id === id ? { ...t, ...patch } : t)),
  });
}

export function deleteTag(id: string) {
  const d = plannerData.value;
  // Remove tag definition and strip from all entities
  const tags = (d.tags ?? []).filter((t) => t.id !== id);
  const strip = (arr?: string[]) => arr?.filter((tid) => tid !== id);
  setPlannerData({
    ...d,
    tags,
    tareas: d.tareas.map((t) => ({ ...t, tags: strip(t.tags) })),
    sesiones: d.sesiones.map((s) => ({ ...s, tags: strip(s.tags) })),
    materias: d.materias.map((m) => ({ ...m, tags: strip(m.tags) })),
  });
}

export function enterLocal() {
  setPlannerData(emptyData());
  setAppMode("local");
}

export function enterDemo() {
  setPlannerData(buildDemoData());
  setAppMode("local");
}
