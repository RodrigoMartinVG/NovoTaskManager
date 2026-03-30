/* ═══ Oda v3.0 — App Store (Signals) ═══ */
import { computed, signal } from "@preact/signals-core";
import type { AppMode, PlannerData, Sesion } from "./types.js";

// ── Storage keys ──
const KEY_MODE = "oda-mode";
const KEY_DATA = "oda-data-v1";

// ── Default empty data ──
const emptyData = (): PlannerData => ({
  materias: [],
  tipos: [],
  tareas: [],
  sesiones: [],
});

// ── Core signals ──
export const appMode = signal<AppMode>((localStorage.getItem(KEY_MODE) as AppMode) || "welcome");

export const plannerData = signal<PlannerData>(
  (() => {
    try {
      const raw = localStorage.getItem(KEY_DATA);
      return raw ? (JSON.parse(raw) as PlannerData) : emptyData();
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

// ── Actions ──
export function setAppMode(mode: AppMode) {
  appMode.value = mode;
  localStorage.setItem(KEY_MODE, mode);
}

export function setPlannerData(data: PlannerData) {
  plannerData.value = data;
  localStorage.setItem(KEY_DATA, JSON.stringify(data));
}

export function addSesion(ses: Sesion) {
  const d = plannerData.value;
  setPlannerData({ ...d, sesiones: [...d.sesiones, ses] });
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
        horasSemanales: 6,
        activa: true,
      },
      { id: "m2", nombre: "Bases de Datos", color: "#f59e0b", horasSemanales: 4, activa: true },
      { id: "m3", nombre: "Historia", color: "#10b981", horasSemanales: 3, activa: true },
    ],
    tipos: [
      { id: "t1", nombre: "TP", icono: "📝", activo: true },
      { id: "t2", nombre: "Parcial", icono: "📋", activo: true },
      { id: "t3", nombre: "Lectura", icono: "📖", activo: true },
    ],
    tareas: [
      {
        id: "ta1",
        titulo: "TP Integrales definidas",
        materiaId: "m1",
        tipo: "t1",
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
        tipo: "t3",
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
        tipo: "t2",
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
        tipo: "t1",
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
  };
}
