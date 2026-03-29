import type { AlertasConfig, ChecklistItem, PlannerData, TipoTarea, Tarea } from '../planner/types'

const DEFAULT_ALERTAS: AlertasConfig = {
  enabled: true,
  dueSoonDays: 3,
  startSoonMinutes: 60,
  overdueMinutes: 0,
  notifyOnToday: true,
}

export const DEFAULT_TIPOS: TipoTarea[] = [
  { id: 'entregable', label: 'Entregable', icon: '📦', bg: '#eae8f6', accent: '#4e47b8' },
  { id: 'parcial', label: 'Parcial', icon: '📋', bg: '#f5e8cc', accent: '#7a4808' },
  { id: 'tp', label: 'TP', icon: '📝', bg: '#daeee3', accent: '#146035' },
  { id: 'final', label: 'Final', icon: '🎓', bg: '#f2dcda', accent: '#8c2018' },
  { id: 'lectura', label: 'Lectura', icon: '📖', bg: '#e8e3d8', accent: '#524c44' },
  { id: 'practica', label: 'Práctica', icon: '🔧', bg: '#e1f5ee', accent: '#0f6e56' },
]

function pad(value: number): string {
  return value.toString().padStart(2, '0')
}

function formatDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function formatDateTime(date: Date): string {
  return `${formatDate(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`
}

function addDays(base: Date, days: number): Date {
  const next = new Date(base)
  next.setDate(next.getDate() + days)
  return next
}

function addHours(base: Date, hours: number): Date {
  const next = new Date(base)
  next.setHours(next.getHours() + hours)
  return next
}

const now = new Date()
const TODAY = formatDate(now)
const TOMORROW = formatDate(addDays(now, 1))
const IN_TWO_DAYS = formatDate(addDays(now, 2))
const IN_THREE_DAYS = formatDate(addDays(now, 3))
const IN_FOUR_DAYS = formatDate(addDays(now, 4))
const IN_FIVE_DAYS = formatDate(addDays(now, 5))
const IN_SIX_DAYS = formatDate(addDays(now, 6))
const IN_SEVEN_DAYS = formatDate(addDays(now, 7))
const IN_EIGHT_DAYS = formatDate(addDays(now, 8))
const IN_TEN_DAYS = formatDate(addDays(now, 10))
const IN_TWELVE_DAYS = formatDate(addDays(now, 12))
const IN_FIFTEEN_DAYS = formatDate(addDays(now, 15))

export const SAMPLE_DATA: PlannerData = {
  version: '1',
  materias: [
    {
      id: 'mat_am2',
      nombre: 'Análisis Matemático II',
      codigo: 'AM2',
      color: '#4e47b8',
      anio: now.getFullYear(),
      periodo: 'c1',
      horasMin: 4,
      horasMax: 8,
      slots: [
        { dia: 'lun', momento: 'manana' },
        { dia: 'mie', momento: 'tarde' },
      ],
    },
    {
      id: 'mat_prog',
      nombre: 'Programación',
      codigo: 'PROG',
      color: '#0f6e56',
      anio: now.getFullYear(),
      periodo: 'c1',
      horasMin: 3,
      horasMax: 6,
      slots: [
        { dia: 'mar', momento: 'tarde' },
        { dia: 'jue', momento: 'noche' },
      ],
    },
    {
      id: 'mat_fis',
      nombre: 'Física II',
      codigo: 'FIS2',
      color: '#be185d',
      anio: now.getFullYear(),
      periodo: 'c1',
      horasMin: 3,
      horasMax: 6,
      slots: [
        { dia: 'mar', momento: 'manana' },
        { dia: 'vie', momento: 'tarde' },
      ],
    },
    {
      id: 'mat_al',
      nombre: 'Álgebra Lineal',
      codigo: 'AL',
      color: '#c2410c',
      anio: now.getFullYear(),
      periodo: 'c1',
      horasMin: 3,
      horasMax: 6,
      slots: [
        { dia: 'lun', momento: 'tarde' },
        { dia: 'jue', momento: 'tarde' },
      ],
    },
    {
      id: 'mat_quim',
      nombre: 'Química General',
      codigo: 'QUI',
      color: '#047857',
      anio: now.getFullYear(),
      periodo: 'c1',
      horasMin: 3,
      horasMax: 6,
      slots: [
        { dia: 'mie', momento: 'manana' },
        { dia: 'vie', momento: 'noche' },
      ],
    },
    {
      id: 'mat_est',
      nombre: 'Estadística',
      codigo: 'EST',
      color: '#2563eb',
      anio: now.getFullYear(),
      periodo: 'c1',
      horasMin: 2,
      horasMax: 4,
      slots: [
        { dia: 'jue', momento: 'manana' },
        { dia: 'vie', momento: 'manana' },
      ],
    },
    {
      id: 'mat_inf',
      nombre: 'Informática',
      codigo: 'INFO',
      color: '#1d4ed8',
      anio: now.getFullYear(),
      periodo: 'c1',
      horasMin: 3,
      horasMax: 5,
      slots: [
        { dia: 'mar', momento: 'noche' },
        { dia: 'jue', momento: 'noche' },
      ],
    },
  ],
  tipos: DEFAULT_TIPOS,
  tareas: [
    {
      id: 'tar_prog_1',
      titulo: 'Subir práctica de listas',
      descripcion: 'Terminar y subir el ejercicio de estructuras de datos.',
      materiaId: 'mat_prog',
      tipo: 'tp',
      fechaLimite: IN_FOUR_DAYS,
      fechaInicio: TODAY,
      hora: '20:00',
      estado: 'pendiente',
      prioridad: 'alta',
      obligatorio: true,
      items: [
        { id: 'tp1-1', label: 'Leer consigna', done: true },
        { id: 'tp1-2', label: 'Implementar funciones', done: false },
      ],
      link_vc: null,
    },
    {
      id: 'tar_am2_1',
      titulo: 'Resolver ejercicios de integración',
      descripcion: 'Repasar los métodos y resolver los ejercicios 1 a 5.',
      materiaId: 'mat_am2',
      tipo: 'lectura',
      fechaLimite: IN_THREE_DAYS,
      fechaInicio: TOMORROW,
      hora: null,
      estado: 'en_progreso',
      prioridad: 'media',
      obligatorio: false,
      items: [],
      link_vc: null,
    },
    {
      id: 'tar_fis_1',
      titulo: 'Preparar parcial de dinámica',
      descripcion: 'Hacer los ejercicios de prueba y revisar conceptos clave.',
      materiaId: 'mat_fis',
      tipo: 'lectura',
      fechaLimite: IN_SEVEN_DAYS,
      fechaInicio: IN_TWO_DAYS,
      hora: null,
      estado: 'pendiente',
      prioridad: 'alta',
      obligatorio: true,
      items: [],
      link_vc: null,
    },
    {
      id: 'tar_al_1',
      titulo: 'Estudiar matrices',
      descripcion: 'Revisar ejemplos de operaciones con matrices lineales.',
      materiaId: 'mat_al',
      tipo: 'lectura',
      fechaLimite: IN_TWO_DAYS,
      fechaInicio: TOMORROW,
      hora: null,
      estado: 'pendiente',
      prioridad: 'media',
      obligatorio: false,
      items: [],
      link_vc: null,
    },
    {
      id: 'tar_quim_1',
      titulo: 'Resolver informe de laboratorio',
      descripcion: 'Completar el informe de práctica de reacciones ácido-base.',
      materiaId: 'mat_quim',
      tipo: 'entregable',
      fechaLimite: IN_FIVE_DAYS,
      fechaInicio: TODAY,
      hora: '18:30',
      estado: 'pendiente',
      prioridad: 'alta',
      obligatorio: true,
      items: [{ id: 'quim-1', label: 'Revisar datos del experimento', done: false }],
      link_vc: null,
    },
    {
      id: 'tar_est_1',
      titulo: 'Preparar práctica de probabilidad',
      descripcion: 'Calcular distribuciones y repasar ejemplos.',
      materiaId: 'mat_est',
      tipo: 'practica',
      fechaLimite: IN_EIGHT_DAYS,
      fechaInicio: IN_TWO_DAYS,
      hora: null,
      estado: 'pendiente',
      prioridad: 'media',
      obligatorio: false,
      items: [],
      link_vc: null,
    },
    {
      id: 'tar_inf_1',
      titulo: 'Diseñar prototipo del proyecto',
      descripcion: 'Esbozar la estructura y funciones del proyecto final.',
      materiaId: 'mat_inf',
      tipo: 'entregable',
      fechaLimite: IN_SIX_DAYS,
      fechaInicio: TOMORROW,
      hora: '22:00',
      estado: 'pendiente',
      prioridad: 'alta',
      obligatorio: true,
      items: [],
      link_vc: null,
    },
    {
      id: 'tar_am2_2',
      titulo: 'Resolver parciales de series',
      descripcion: 'Practicar con ejercicios de límites y convergencia.',
      materiaId: 'mat_am2',
      tipo: 'practica',
      fechaLimite: IN_TEN_DAYS,
      fechaInicio: IN_FIVE_DAYS,
      hora: null,
      estado: 'pendiente',
      prioridad: 'media',
      obligatorio: false,
      items: [],
      link_vc: null,
    },
    {
      id: 'tar_prog_2',
      titulo: 'Ensayar demo de algoritmo',
      descripcion: 'Probar la solución con casos borde antes de presentarla.',
      materiaId: 'mat_prog',
      tipo: 'parcial',
      fechaLimite: IN_TWELVE_DAYS,
      fechaInicio: IN_FIVE_DAYS,
      hora: null,
      estado: 'pendiente',
      prioridad: 'baja',
      obligatorio: false,
      items: [],
      link_vc: null,
    },
    {
      id: 'tar_fis_2',
      titulo: 'Leer capítulo de termodinámica',
      descripcion: 'Repasar propiedades termodinámicas para clase.',
      materiaId: 'mat_fis',
      tipo: 'lectura',
      fechaLimite: IN_THREE_DAYS,
      fechaInicio: TODAY,
      hora: null,
      estado: 'en_progreso',
      prioridad: 'media',
      obligatorio: false,
      items: [],
      link_vc: null,
    },
    {
      id: 'tar_al_2',
      titulo: 'Revisar ejercicios de transformaciones',
      descripcion: 'Hacer los ejercicios de cambio de base y determinantes.',
      materiaId: 'mat_al',
      tipo: 'lectura',
      fechaLimite: IN_FOUR_DAYS,
      fechaInicio: TOMORROW,
      hora: null,
      estado: 'pendiente',
      prioridad: 'media',
      obligatorio: false,
      items: [],
      link_vc: null,
    },
    {
      id: 'tar_quim_2',
      titulo: 'Revisar formulario de laboratorio',
      descripcion: 'Asegurarse de tener cálculos y conclusiones listos.',
      materiaId: 'mat_quim',
      tipo: 'entregable',
      fechaLimite: IN_FIVE_DAYS,
      fechaInicio: TODAY,
      hora: null,
      estado: 'pendiente',
      prioridad: 'alta',
      obligatorio: true,
      items: [],
      link_vc: null,
    },
    {
      id: 'tar_est_2',
      titulo: 'Ejercicio de regresión',
      descripcion: 'Resolver el ejercicio de regresión lineal del cuadernillo.',
      materiaId: 'mat_est',
      tipo: 'parcial',
      fechaLimite: IN_EIGHT_DAYS,
      fechaInicio: IN_THREE_DAYS,
      hora: null,
      estado: 'pendiente',
      prioridad: 'media',
      obligatorio: false,
      items: [],
      link_vc: null,
    },
    {
      id: 'tar_inf_2',
      titulo: 'Crear prototipo del dashboard',
      descripcion: 'Definir la estructura visual del proyecto final.',
      materiaId: 'mat_inf',
      tipo: 'practica',
      fechaLimite: IN_SEVEN_DAYS,
      fechaInicio: IN_THREE_DAYS,
      hora: null,
      estado: 'pendiente',
      prioridad: 'media',
      obligatorio: false,
      items: [],
      link_vc: null,
    },
    {
      id: 'tar_prog_3',
      titulo: 'Práctica libre de debugging',
      descripcion: 'Corregir bugs menores en el código del proyecto.',
      materiaId: 'mat_prog',
      tipo: 'practica',
      fechaLimite: IN_FIFTEEN_DAYS,
      fechaInicio: IN_SEVEN_DAYS,
      hora: null,
      estado: 'pendiente',
      prioridad: 'baja',
      obligatorio: false,
      items: [],
      link_vc: null,
    },
  ],
  sesiones: [
    {
      id: 'ses_1',
      materiaId: 'mat_am2',
      tareaId: 'tar_am2_1',
      inicio: formatDateTime(addHours(addDays(now, -2), 19)),
      minutos: 90,
      origen: 'manual',
      titulo: 'Repaso de integración',
      nota: 'Trabajé sobre los problemas de la guía.',
    },
    {
      id: 'ses_2',
      materiaId: 'mat_prog',
      tareaId: 'tar_prog_1',
      inicio: formatDateTime(addHours(addDays(now, -1), 20)),
      minutos: 75,
      origen: 'manual',
      titulo: 'Implementar listas',
    },
    {
      id: 'ses_3',
      materiaId: 'mat_fis',
      tareaId: 'tar_fis_1',
      inicio: formatDateTime(addHours(addDays(now, -3), 18)),
      minutos: 60,
      origen: 'manual',
      titulo: 'Resolver ejercicios de dinámica',
    },
    {
      id: 'ses_4',
      materiaId: 'mat_al',
      tareaId: 'tar_al_1',
      inicio: formatDateTime(addHours(addDays(now, -4), 17)),
      minutos: 80,
      origen: 'manual',
      titulo: 'Matrices y determinantes',
    },
    {
      id: 'ses_5',
      materiaId: 'mat_quim',
      tareaId: 'tar_quim_1',
      inicio: formatDateTime(addHours(addDays(now, -1), 16)),
      minutos: 90,
      origen: 'manual',
      titulo: 'Informe de laboratorio',
    },
    {
      id: 'ses_6',
      materiaId: 'mat_est',
      tareaId: 'tar_est_1',
      inicio: formatDateTime(addHours(addDays(now, -3), 14)),
      minutos: 60,
      origen: 'manual',
      titulo: 'Ejercicios de probabilidad',
    },
    {
      id: 'ses_7',
      materiaId: 'mat_inf',
      tareaId: 'tar_inf_1',
      inicio: formatDateTime(addHours(addDays(now, -2), 22)),
      minutos: 105,
      origen: 'manual',
      titulo: 'Boceto de prototipo',
    },
    {
      id: 'ses_8',
      materiaId: 'mat_prog',
      tareaId: 'tar_prog_2',
      inicio: formatDateTime(addHours(addDays(now, -5), 21)),
      minutos: 50,
      origen: 'manual',
      titulo: 'Ensayo de demo',
    },
    {
      id: 'ses_9',
      materiaId: 'mat_am2',
      tareaId: 'tar_am2_2',
      inicio: formatDateTime(addHours(addDays(now, -3), 18)),
      minutos: 70,
      origen: 'manual',
      titulo: 'Series y límites',
    },
    {
      id: 'ses_10',
      materiaId: 'mat_fis',
      tareaId: 'tar_fis_2',
      inicio: formatDateTime(addHours(addDays(now, -1), 19)),
      minutos: 45,
      origen: 'manual',
      titulo: 'Repasar termodinámica',
    },
    {
      id: 'ses_11',
      materiaId: 'mat_al',
      tareaId: 'tar_al_2',
      inicio: formatDateTime(addHours(addDays(now, -2), 16)),
      minutos: 55,
      origen: 'manual',
      titulo: 'Transformaciones lineales',
    },
    {
      id: 'ses_12',
      materiaId: 'mat_quim',
      tareaId: 'tar_quim_2',
      inicio: formatDateTime(addHours(addDays(now, -4), 17)),
      minutos: 65,
      origen: 'manual',
      titulo: 'Revisión de formulario',
    },
    {
      id: 'ses_13',
      materiaId: 'mat_est',
      tareaId: 'tar_est_2',
      inicio: formatDateTime(addHours(addDays(now, -2), 13)),
      minutos: 80,
      origen: 'manual',
      titulo: 'Regresión lineal',
    },
    {
      id: 'ses_14',
      materiaId: 'mat_inf',
      tareaId: 'tar_inf_2',
      inicio: formatDateTime(addHours(addDays(now, -1), 20)),
      minutos: 95,
      origen: 'manual',
      titulo: 'Mockup de dashboard',
    },
    {
      id: 'ses_15',
      materiaId: 'mat_prog',
      tareaId: 'tar_prog_3',
      inicio: formatDateTime(addHours(addDays(now, -3), 21)),
      minutos: 60,
      origen: 'manual',
      titulo: 'Debugging',
    },
    {
      id: 'ses_16',
      materiaId: 'mat_am2',
      tareaId: 'tar_am2_1',
      inicio: formatDateTime(addHours(addDays(now, -6), 18)),
      minutos: 120,
      origen: 'manual',
      titulo: 'Ejercicios extra de integración',
    },
    {
      id: 'ses_17',
      materiaId: 'mat_fis',
      tareaId: 'tar_fis_1',
      inicio: formatDateTime(addHours(addDays(now, -7), 17)),
      minutos: 90,
      origen: 'manual',
      titulo: 'Simulacro de parcial',
    },
  ],
  alertas: DEFAULT_ALERTAS,
  temaId: 'theme-1',
  createdAt: now.toISOString(),
  updatedAt: now.toISOString(),
}

export function isEmptyPlannerData(data: PlannerData): boolean {
  return data.materias.length === 0 && data.tareas.length === 0 && data.sesiones.length === 0
}

export function createEmptyPlannerData(): PlannerData {
  return {
    version: '1',
    materias: [],
    tipos: [],
    tareas: [],
    sesiones: [],
    alertas: DEFAULT_ALERTAS,
  }
}

export function normalizePlannerData(raw: unknown): PlannerData {
  if (!raw || typeof raw !== 'object') {
    return createEmptyPlannerData()
  }

  const candidate = raw as Partial<PlannerData>
  const temaId = typeof candidate.temaId === 'string' ? (candidate.temaId as PlannerData['temaId']) : undefined
  const createdAt = typeof candidate.createdAt === 'string' ? candidate.createdAt : undefined
  const updatedAt = typeof candidate.updatedAt === 'string' ? candidate.updatedAt : undefined

  return {
    version: candidate.version ?? '1',
    materias: Array.isArray(candidate.materias) ? candidate.materias : [],
    tipos: Array.isArray(candidate.tipos) ? candidate.tipos : [],
    tareas: Array.isArray(candidate.tareas) ? candidate.tareas : [],
    sesiones: Array.isArray(candidate.sesiones) ? candidate.sesiones : [],
    alertas: candidate.alertas ?? DEFAULT_ALERTAS,
    ...(temaId ? { temaId } : {}),
    ...(createdAt ? { createdAt } : {}),
    ...(updatedAt ? { updatedAt } : {}),
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function parseImportPayload(text: string, defaults: Partial<Tarea> = {}): Tarea[] {
  try {
    const parsed = JSON.parse(text) as unknown
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed
      .filter((item): item is Record<string, unknown> => isPlainObject(item) && 'id' in item)
      .map((item) => {
        const estado =
          typeof item.estado === 'string' && ['pendiente', 'en_progreso', 'completado'].includes(item.estado)
            ? (item.estado as Tarea['estado'])
            : 'pendiente'

        const prioridad =
          typeof item.prioridad === 'string' && ['alta', 'media', 'baja'].includes(item.prioridad)
            ? (item.prioridad as Tarea['prioridad'])
            : 'media'

        return {
          id: String(item.id),
          titulo: typeof item.titulo === 'string' ? item.titulo : 'Tarea importada',
          descripcion: typeof item.descripcion === 'string' ? item.descripcion : '',
          materiaId: typeof item.materiaId === 'string' ? item.materiaId : String(defaults.materiaId ?? ''),
          tipo: typeof item.tipo === 'string' ? item.tipo : String(defaults.tipo ?? 'tp'),
          fechaLimite: typeof item.fechaLimite === 'string' ? item.fechaLimite : null,
          fechaInicio: typeof item.fechaInicio === 'string' ? item.fechaInicio : null,
          hora: typeof item.hora === 'string' ? item.hora : null,
          estado,
          prioridad,
          obligatorio: Boolean(item.obligatorio ?? false),
          items: Array.isArray(item.items) ? cloneChecklist(item.items as ChecklistItem[]) : [],
          link_vc: typeof item.link_vc === 'string' ? item.link_vc : null,
        }
      })
  } catch {
    return []
  }
}

export function cloneChecklist(items: ChecklistItem[]): ChecklistItem[] {
  return items.map((item) => ({
    id: item.id,
    label: item.label,
    done: item.done,
  }))
}

export function hashData(data: unknown): string {
  const text = JSON.stringify(data)
  let hash = 0
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash << 5) - hash + text.charCodeAt(i)
    hash |= 0
  }
  return hash.toString(36)
}
