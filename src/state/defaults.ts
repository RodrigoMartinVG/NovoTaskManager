import type { AlertConfig, FranjaDef, PlannerData, TipoTarea } from "./types.js";

export const DEFAULT_FRANJAS: FranjaDef[] = [
  { id: "f-am", nombre: "Matutino", emoji: "☀️", horaInicio: 480, horaFin: 720 },
  { id: "f-pm", nombre: "Vespertino", emoji: "🌤", horaInicio: 780, horaFin: 1080 },
  { id: "f-nt", nombre: "Nocturno", emoji: "🌙", horaInicio: 1140, horaFin: 1380 },
];

export const DEFAULT_TIPOS: TipoTarea[] = [
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

export function emptyData(): PlannerData {
  return {
    materias: [],
    tipos: DEFAULT_TIPOS.map((t) => ({ ...t })),
    tareas: [],
    sesiones: [],
    franjas: DEFAULT_FRANJAS.map((f) => ({ ...f })),
    alertas: { ...DEFAULT_ALERTAS },
  };
}
