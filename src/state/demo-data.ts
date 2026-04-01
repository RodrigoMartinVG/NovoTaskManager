import { DEFAULT_ALERTAS, DEFAULT_FRANJAS, DEFAULT_TIPOS } from "./defaults.js";
import type { PlannerData } from "./types.js";

export function buildDemoData(): PlannerData {
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
    alertas: { ...DEFAULT_ALERTAS },
    tags: [],
  };
}
