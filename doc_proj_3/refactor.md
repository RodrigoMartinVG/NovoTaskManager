Hay patrones que se repiten y que vale la pena atacar. Te los organizo por impacto:

---

**1. `store.ts` es un módulo dios — hace demasiado**

Es el problema más serio. En un solo archivo conviven: inicialización de localStorage, señales de dominio, señales de UI de navegación, CRUD de todas las entidades, lógica de migración de datos, y datos de demo hardcodeados. Eso viola SRP a nivel de módulo.

Los signals de navegación (`editingTaskId`, `taskReturnView`, `editingMateriaId`, `sesionReturnView`, etc.) no son estado de dominio — son estado de UI. Deberían vivir en un `router.ts` o `navigation.ts` separado, o incluso en los propios componentes que los usan.

La función `buildDemoData()` tiene 80+ líneas y no tiene nada que ver con la lógica del store. Merece su propio archivo `demo-data.ts`.

`migrateSlots()` es lógica de dominio pura — debería estar en `domain/`, no en `state/`.

```ts
// Ahora: todo en store.ts
export const editingTaskId = signal<string | null>(null);
export const taskReturnView = signal<string>("backlog");
export const editingMateriaId = signal<string | null>(null);
// ... 6 signals más de navegación mezclados con datos

// Mejor: separar en navigation.ts
// Y buildDemoData() → demo-data.ts
// Y migrateSlots() → domain/slot-migration.ts
```

---

**2. La inicialización del store es un IIFE opaco con lógica de migración embebida**

```ts
// Ahora: magia dentro de signal(...)
export const plannerData = signal<PlannerData>(
  (() => {
    try {
      const raw = localStorage.getItem(KEY_DATA);
      if (!raw) return emptyData();
      const data = JSON.parse(raw) as PlannerData;
      if (!data.franjas || data.franjas.length === 0) { ... }  // backfill
      if (!data.alertas) { ... }                               // backfill
      return data;
    } catch { return emptyData(); }
  })(),
);
```

El problema es que hay lógica de migración (backfill de `franjas` y `alertas`) dentro de una expresión que inicializa una señal. Eso es muy difícil de testear y de razonar. Mejor extraerlo:

```ts
// Mejor: función nombrada y testeable
function loadStoredData(): PlannerData {
  try {
    const raw = localStorage.getItem(KEY_DATA);
    if (!raw) return emptyData();
    return migrateData(JSON.parse(raw) as Partial<PlannerData>);
  } catch {
    return emptyData();
  }
}

function migrateData(data: Partial<PlannerData>): PlannerData {
  return {
    ...emptyData(),
    ...data,
    franjas: data.franjas?.length ? data.franjas : DEFAULT_FRANJAS.map(f => ({ ...f })),
    alertas: data.alertas ?? { ...DEFAULT_ALERTAS },
  };
}

export const plannerData = signal<PlannerData>(loadStoredData());
```

---

**3. `types.ts` tiene campos opcionales que en realidad son requeridos**

```ts
// Ahora: franjas y alertas son opcionales en PlannerData
export interface PlannerData {
  materias: Materia[];
  tareas: Tarea[];
  franjas?: FranjaDef[];   // ← siempre existe post-migración
  alertas?: AlertConfig;  // ← siempre existe post-migración
}
```

El resultado es que hay `?? DEFAULT_ALERTAS` y `?? []` dispersos por todo el código — en el store, en las vistas. Si la migración garantiza que siempre existen, el tipo debería reflejarlo:

```ts
export interface PlannerData {
  materias: Materia[];
  tareas: Tarea[];
  sesiones: Sesion[];
  tipos: TipoTarea[];
  franjas: FranjaDef[];   // requerido
  alertas: AlertConfig;  // requerido
}
```

---

**4. `gdrive.ts` tiene estado mutable de módulo oculto**

```ts
// Variables de módulo que son estado global mutable
let tokenClient: TokenClient | null = null;
let accessToken: string | null = null;
let tokenExpiry = 0;
let fileId: string | null = localStorage.getItem(LS_FILE_ID);
let saveTimer: ReturnType<typeof setTimeout> | null = null;
```

Estas variables son una dependencia oculta — no podés testear `driveSave()` sin que tenga el `accessToken` ya cargado. Un patrón más limpio es encapsularlas en una clase o en un objeto de sesión explícito:

```ts
// Mejor: estado explícito y reemplazable
interface DriveSession {
  accessToken: string;
  tokenExpiry: number;
  fileId: string | null;
}
let session: DriveSession | null = null;
```

Además, el `CLIENT_ID` de OAuth está hardcodeado en el fuente. En producción debería venir de una variable de entorno o configuración externa.

---

**5. `gdrive.ts` — resolución de conflictos por heurística frágil**

```ts
// driveBoot compara longitudes de arrays para detectar diferencias
if (rMats !== lMats || rTasks !== lTasks) {
  applyData(remote); // "last writer wins"
}
```

Si tenés 3 materias locales y 3 remotas pero distintas, esto no detecta el conflicto. La señal `driveConflictData` existe en el código pero nunca se usa desde `driveBoot`. La solución correcta es usar un timestamp de última modificación en `PlannerData`, o un hash del contenido.

---

**6. `hoy-view.ts` — el componente accede a signals globales desde funciones module-level**

```ts
// Esta función es impura — tiene una dependencia oculta en el signal global
function sesMinsSemana(materiaId: string): number {
  const ws = getWeekStart();
  let total = 0;
  for (const s of sesiones.value) { // ← accede al signal directamente
    if (s.materiaId === materiaId && new Date(s.inicio) >= ws) total += s.minutos;
  }
  return total;
}
```

Funciones puras son más fáciles de testear y razonar. Mejor pasarle los datos como argumento:

```ts
function sesMinsSemana(materiaId: string, sesiones: Sesion[]): number {
  const ws = getWeekStart();
  return sesiones
    .filter(s => s.materiaId === materiaId && new Date(s.inicio) >= ws)
    .reduce((acc, s) => acc + s.minutos, 0);
}
```

---

**7. `hoy-view.ts` usa `effect()` para forzar re-renders manualmente**

```ts
this._dispose = effect(() => {
  tareas.value;      // solo para suscribirse
  materias.value;
  sesiones.value;
  plannerData.value;
  pomoActive.value;
  this.requestUpdate(); // fuerza el re-render
});
```

Esto es un workaround. `SignalWatcher` de `@lit-labs/signals` debería manejar esto automáticamente si los signals se leen dentro de `render()`. El efecto manual sugiere que algo no está conectado correctamente, o que se está leyendo desde fuera del ciclo de renderizado.

---

**8. `pomo.ts` — generación de IDs con `Date.now()`**

```ts
id: `s${Date.now()}`,
```

No es collision-safe (dos sesiones que terminen en el mismo milisegundo tendrían el mismo ID). TypeScript/navegadores modernos tienen `crypto.randomUUID()` exactamente para esto:

```ts
id: crypto.randomUUID(),
```

---

**9. `alert-engine.ts` exporta CSS desde el dominio**

```ts
// Un módulo de dominio no debería saber nada de CSS
export const ALERT_CSS = /* css */ `
  .alert-overdue { --alert-bg: var(--err-bg); ... }
  ...
`;
```

Este CSS debería vivir en el componente que lo usa, no en el motor de alertas. El dominio no debería tener conocimiento de la presentación.

---

**10. `app-shell.ts` importa todas las vistas de forma eager**

```ts
import "../views/hoy-view.js";
import "../views/semana-view.js";
import "../views/materias-view.js";
// ... 12 imports más
```

Con Vite, se puede hacer lazy loading trivialmente:

```ts
// En _renderView(), antes del switch:
// case "semana": await import('../views/semana-view.js'); ...
```

O usar dynamic imports en el switch directamente. Para un planner académico puede no ser crítico, pero es una práctica que escala mejor.

---

Acá hay un mapa de las dependencias actuales versus como deberían quedar:---

**Resumen de prioridades:**

El refactor de mayor impacto, de lejos, es **partir `store.ts`**. Extraer las señales de navegación a `navigation.ts` y `buildDemoData()` a `demo-data.ts` ya te da un archivo 40% más chico y con responsabilidades claras. Después, **hacer `franjas` y `alertas` requeridos en el tipo** y reemplazar todos los `?? DEFAULT` dispersos.

El resto (IDs con `crypto.randomUUID`, funciones puras en las vistas, encapsular el estado de gdrive) son mejoras de calidad que convienen hacer incremental.

Lo que está bien y no tocaría: la estructura de carpetas `domain/state/components`, el uso de señales, el `alert-engine.ts` como función pura testeble, y el `pomo.ts` que está prolijo y bien separado.


--------------------------------------
--------------------------------------
--------------------------------------

PLAN DE IMPLEMENTACION DEL REFACTOR:


El plan completo, ya te lo adjunto. La lógica detrás del orden:
Por qué empezar por las fases internas (1-4): migrateSlots, buildDemoData, y el IIFE no tienen consumidores externos. Podés moverlos, correr typecheck, y el compilador confirma que no rompiste nada. Son victorias rápidas que achican store.ts antes de tocar lo sensible.
Por qué la Fase 5 (tipos) va antes que la 6 (navigation): si hacés franjas y alertas requeridos después de extraer navigation, TypeScript te va a dar errores mezclados de dos causas distintas y es más difícil razonar qué rompió qué. Separados, cada fase tiene un único tipo de error posible.
Por qué la Fase 6 no toca los 11 archivos consumidores: la re-exportación en store.ts es el escudo. Podés hacer el commit de navigation.ts y verificar que todo funciona igual que antes, con cero cambios en las vistas. El paso 6b de actualizar imports es cosmético y puede ir después, o nunca, sin consecuencias.
Por qué la Fase 10 va última: es la única que toca un flujo con estado externo (OAuth + Drive API). Si algo sale mal, querés que sea en el último paso con todo lo demás ya limpio y commiteado.



# Plan de Refactor — NovoTaskManager (Oda v3.0)

> **Principio rector:** TypeScript con `strict: true` + `noUnusedLocals` + `noUnusedParameters`
> es la red de seguridad. Cada fase termina con `npm run typecheck` en 0 errores.
> Sin tests unitarios, el compilador es el árbitro. No se avanza si hay errores.

---

## Contexto del grafo de dependencias

| Archivo | Importa de store.ts | Riesgo al mover exports |
|---|---|---|
| `app.ts` | appMode, plannerData, setAppMode, setPlannerData | Bajo |
| `pomo.ts` | addSesion, pomoFocusMode, pomoSession | Bajo |
| `onboarding-flow.ts` | appMode, enterDemo, enterLocal | Bajo |
| `global-filter.ts` | globalFilterAnio, globalFilterPeriodos, plannerData | Bajo |
| `app-shell.ts` | isWelcome | Bajo |
| `backlog-view.ts` | alertConfig, editingTaskId, filteredMaterias, filteredTareas, plannerData, taskReturnView | Medio |
| `hoy-view.ts` | editingTaskId, filteredMaterias, plannerData, filteredSesiones, filteredTareas, statsMateriaId, statsReturnView, taskReturnView | Medio |
| `8 vistas más` | variados | Medio |

**Estrategia clave:** al extraer módulos, re-exportar desde `store.ts` durante la transición.
Los 23 consumidores nunca ven un import roto.

---

## Estructura objetivo

```
src/
├── state/
│   ├── types.ts          ← franjas y alertas pasan a required
│   ├── defaults.ts       ← NUEVO: DEFAULT_*, emptyData()
│   ├── store.ts          ← signals de dominio + CRUD + filtros (sin nav, sin demo, sin migración)
│   ├── navigation.ts     ← NUEVO: 9 signals de UI de navegación
│   ├── demo-data.ts      ← NUEVO: buildDemoData()
│   ├── gdrive.ts         ← DriveSession encapsulada, sin vars sueltas de módulo
│   └── pomo.ts           ← crypto.randomUUID() en lugar de Date.now()
└── domain/
    ├── alert-engine.ts   ← sin ALERT_CSS
    └── slot-migration.ts ← NUEVO: migrateSlots()
```

---

## Fase 0 — Checkpoint inicial

**Objetivo:** documentar la línea de base antes de tocar una sola línea.

```bash
cd NovoTaskManager
npm run typecheck    # debe dar 0 errores
npm run build        # debe compilar sin warnings
git add -A && git commit -m "chore: checkpoint pre-refactor"
```

> Si `typecheck` o `build` tienen errores existentes, resolverlos primero
> y commitear por separado antes de empezar el refactor.

---

## Fase 1 — Extraer `migrateSlots` a `domain/`

**Riesgo:** Muy bajo. Función solo usada internamente en `store.ts`.
**Archivos tocados:** 2 (`store.ts`, nuevo `domain/slot-migration.ts`)

### 1.1 Crear `src/domain/slot-migration.ts`

Mover la función tal cual, cambiando solo el import de tipos:

```typescript
// src/domain/slot-migration.ts
import type { FranjaDef, Materia, MateriaSlot } from "../state/types.js";

/** Migrate materia slots when franja IDs change — maps by time-range overlap */
export function migrateSlots(
  oldFranjas: FranjaDef[],
  newFranjas: FranjaDef[],
  mats: Materia[],
): Materia[] {
  if (newFranjas.length === 0) return mats;

  const mapping = new Map<string, string[]>();

  for (const oldF of oldFranjas) {
    const targets: string[] = [];
    for (const newF of newFranjas) {
      if (oldF.horaInicio < newF.horaFin && newF.horaInicio < oldF.horaFin) {
        targets.push(newF.id);
      }
    }
    if (targets.length === 0) {
      const oldMid = (oldF.horaInicio + oldF.horaFin) / 2;
      let bestId = newFranjas[0].id;
      let bestDist = Infinity;
      for (const newF of newFranjas) {
        const dist = Math.abs((newF.horaInicio + newF.horaFin) / 2 - oldMid);
        if (dist < bestDist) { bestDist = dist; bestId = newF.id; }
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
        if (!seen.has(key)) { seen.add(key); migrated.push({ dia: slot.dia, franjaId: fid }); }
      }
    }
    return { ...mat, slots: migrated.length > 0 ? migrated : undefined };
  });
}
```

### 1.2 Actualizar `store.ts`

Reemplazar la función local por el import:

```typescript
// Agregar al bloque de imports de store.ts:
import { migrateSlots } from "../domain/slot-migration.js";

// Eliminar la función migrateSlots() completa de store.ts
```

### ✅ Verificación

```bash
npm run typecheck    # 0 errores
git commit -m "refactor: extraer migrateSlots a domain/slot-migration.ts"
```

---

## Fase 2 — Extraer constantes y `emptyData` a `defaults.ts`

**Riesgo:** Muy bajo. `DEFAULT_FRANJAS` y `DEFAULT_TIPOS` no son exportados actualmente.
`DEFAULT_ALERTAS` sí es exportado — se re-exporta desde `store.ts` sin cambiar los consumidores.
**Archivos tocados:** 2 (`store.ts`, nuevo `state/defaults.ts`)

### 2.1 Crear `src/state/defaults.ts`

```typescript
// src/state/defaults.ts
import type { AlertConfig, FranjaDef, PlannerData, TipoTarea } from "./types.js";

export const DEFAULT_FRANJAS: FranjaDef[] = [
  { id: "f-am", nombre: "Matutino",   emoji: "☀️",  horaInicio: 480,  horaFin: 720  },
  { id: "f-pm", nombre: "Vespertino", emoji: "🌤",  horaInicio: 780,  horaFin: 1080 },
  { id: "f-nt", nombre: "Nocturno",   emoji: "🌙",  horaInicio: 1140, horaFin: 1380 },
];

export const DEFAULT_TIPOS: TipoTarea[] = [
  { id: "t-tp",       nombre: "TP",                icono: "📝", activo: true },
  { id: "t-parcial",  nombre: "Parcial",            icono: "📝", activo: true },
  { id: "t-final",    nombre: "Final",              icono: "🎯", activo: true },
  { id: "t-lectura",  nombre: "Lectura",            icono: "📖", activo: true },
  { id: "t-guia",     nombre: "Guía de ejercicios", icono: "📊", activo: true },
  { id: "t-video",    nombre: "Video / Clase",      icono: "🎥", activo: true },
  { id: "t-resumen",  nombre: "Resumen",            icono: "🗒️", activo: true },
  { id: "t-proyecto", nombre: "Proyecto",           icono: "🛠️", activo: true },
  { id: "t-otro",     nombre: "Otro",               icono: "📌", activo: true },
];

export const DEFAULT_ALERTAS: AlertConfig = {
  rojo: 2, amarillo: 7, verde: 14, inicio: 2,
};

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
```

### 2.2 Actualizar `store.ts`

```typescript
// Reemplazar las definiciones locales por un import:
import { DEFAULT_ALERTAS, DEFAULT_FRANJAS, DEFAULT_TIPOS, emptyData } from "./defaults.js";

// Mantener esta re-exportación para no romper config-tab-alertas.ts:
export { DEFAULT_ALERTAS } from "./defaults.js";

// Eliminar de store.ts:
// - const DEFAULT_FRANJAS = [...]
// - const DEFAULT_TIPOS = [...]
// - export const DEFAULT_ALERTAS = {...}
// - function emptyData() {...}
```

> **Nota:** `config-tab-alertas.ts` importa `DEFAULT_ALERTAS` desde `store.ts`.
> La re-exportación garantiza que ese import no se rompe.

### ✅ Verificación

```bash
npm run typecheck    # 0 errores
git commit -m "refactor: extraer DEFAULT_* y emptyData a state/defaults.ts"
```

---

## Fase 3 — Extraer `buildDemoData` a `demo-data.ts`

**Riesgo:** Muy bajo. Función solo usada internamente en `enterDemo()`.
**Archivos tocados:** 2 (`store.ts`, nuevo `state/demo-data.ts`)

### 3.1 Crear `src/state/demo-data.ts`

```typescript
// src/state/demo-data.ts
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
    materias: [ /* ... copia exacta del array actual ... */ ],
    tipos: DEFAULT_TIPOS.map((t) => ({ ...t })),
    tareas: [ /* ... copia exacta del array actual ... */ ],
    sesiones: [ /* ... copia exacta del array actual ... */ ],
    franjas: DEFAULT_FRANJAS.map((f) => ({ ...f })),
    alertas: { ...DEFAULT_ALERTAS },
  };
}
```

### 3.2 Actualizar `store.ts`

```typescript
import { buildDemoData } from "./demo-data.js";

// Eliminar la función buildDemoData() completa de store.ts
// La función enterDemo() queda igual — solo cambia de dónde viene buildDemoData
```

### ✅ Verificación

```bash
npm run typecheck    # 0 errores
git commit -m "refactor: extraer buildDemoData a state/demo-data.ts"
```

---

## Fase 4 — Hacer explícita la carga de datos del store

**Riesgo:** Muy bajo. Cambio puramente interno a `store.ts`, sin superficie pública.
**Archivos tocados:** 1 (`store.ts`)

Reemplazar el IIFE opaco por funciones nombradas y testeables:

```typescript
// ANTES (en store.ts):
export const plannerData = signal<PlannerData>(
  (() => {
    try {
      const raw = localStorage.getItem(KEY_DATA);
      if (!raw) return emptyData();
      const data = JSON.parse(raw) as PlannerData;
      if (!data.franjas || data.franjas.length === 0) {
        data.franjas = DEFAULT_FRANJAS.map((f) => ({ ...f }));
      }
      if (!data.alertas) {
        data.alertas = { ...DEFAULT_ALERTAS };
      }
      return data;
    } catch {
      return emptyData();
    }
  })(),
);

// DESPUÉS:
/** Aplica migraciones de compatibilidad a datos cargados de versiones anteriores. */
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
```

### ✅ Verificación

```bash
npm run typecheck    # 0 errores
git commit -m "refactor: reemplazar IIFE de plannerData por loadStoredData/migrateStoredData"
```

---

## Fase 5 — Hacer requeridos `franjas` y `alertas` en `types.ts`

**Riesgo:** Medio. TypeScript va a marcar todos los usos del patrón `?? DEFAULT`.
El compilador indica exactamente qué hay que cambiar — no hay que buscar nada a mano.
**Archivos probablemente afectados:** `store.ts`, `hoy-view.ts`, `semana-view.ts`, `datos-view.ts`,
y cualquier vista que lea `plannerData.value.franjas`.

### 5.1 Cambiar `types.ts`

```typescript
// ANTES:
export interface PlannerData {
  materias: Materia[];
  tipos: TipoTarea[];
  tareas: Tarea[];
  sesiones: Sesion[];
  franjas?: FranjaDef[];   // ← opcional
  alertas?: AlertConfig;  // ← opcional
}

// DESPUÉS:
export interface PlannerData {
  materias: Materia[];
  tipos: TipoTarea[];
  tareas: Tarea[];
  sesiones: Sesion[];
  franjas: FranjaDef[];   // ← requerido (siempre provisto por emptyData/migrateStoredData)
  alertas: AlertConfig;  // ← requerido (siempre provisto por emptyData/migrateStoredData)
}
```

### 5.2 Ejecutar typecheck y corregir cada error

```bash
npm run typecheck 2>&1
```

TypeScript va a reportar cada lugar donde el código asumía que `franjas` o `alertas`
podían ser `undefined`. Corregir cada uno eliminando el operador `??` y su fallback:

```typescript
// Patrón a eliminar en las vistas:
const franjas = plannerData.value.franjas ?? [];
// Reemplazar por:
const franjas = plannerData.value.franjas;

// Patrón a eliminar:
plannerData.value.alertas ?? DEFAULT_ALERTAS
// Reemplazar por:
plannerData.value.alertas
```

> **Truco:** correr `npm run typecheck` después de cada archivo corregido para ver
> la lista reducirse. No mezclar correcciones de distintos archivos en un mismo commit.

### ✅ Verificación

```bash
npm run typecheck    # 0 errores
git commit -m "refactor: hacer franjas y alertas requeridos en PlannerData"
```

---

## Fase 6 — Extraer `navigation.ts` (la más impactante)

**Riesgo:** Medio, pero 100% controlable por re-exportación.
**Archivos con signals de navegación:** 11 vistas.
**Cambios necesarios en esas 11 vistas:** ninguno en esta fase.

### Estrategia: re-exportar desde store.ts

Al extraer los signals a `navigation.ts` y re-exportarlos desde `store.ts`,
los 11 archivos que hacen `import { editingTaskId } from '../../state/store.js'`
siguen funcionando sin tocar una sola línea.

### 6.1 Crear `src/state/navigation.ts`

```typescript
// src/state/navigation.ts
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
```

### 6.2 Actualizar `store.ts`

Reemplazar las 9 declaraciones por una re-exportación:

```typescript
// Eliminar de store.ts estas 9 declaraciones:
// export const editingTaskId = signal<string | null>(null);
// export const taskReturnView = signal<string>("backlog");
// ... etc.

// Agregar al bloque de imports de store.ts:
import {
  editingMateriaId,
  editingSesionId,
  editingTaskId,
  materiaReturnView,
  newTaskMateriaId,
  sesionReturnView,
  statsMateriaId,
  statsReturnView,
  taskReturnView,
} from "./navigation.js";

// Agregar re-exportaciones para los 11 consumidores actuales:
export {
  editingMateriaId,
  editingSesionId,
  editingTaskId,
  materiaReturnView,
  newTaskMateriaId,
  sesionReturnView,
  statsMateriaId,
  statsReturnView,
  taskReturnView,
} from "./navigation.js";
```

### ✅ Verificación

```bash
npm run typecheck    # 0 errores — los 11 archivos siguen funcionando sin cambios
git commit -m "refactor: extraer navigation signals a state/navigation.ts (store.ts re-exporta)"
```

### 6.3 (Opcional, fase posterior) Actualizar imports en las 11 vistas

Una vez que `navigation.ts` esté estable, actualizar los imports uno por uno
para que apunten directamente al módulo correcto. Esto es cosmético y no afecta
el comportamiento — hacerlo cuando haya tiempo, de a un archivo por commit.

```typescript
// ANTES (en cualquier vista):
import { editingTaskId, taskReturnView } from "../../state/store.js";

// DESPUÉS:
import { editingTaskId, taskReturnView } from "../../state/navigation.js";
```

---

## Fase 7 — Remover `ALERT_CSS` del módulo de dominio

**Riesgo:** Bajo. Un único consumidor: `backlog-view.ts`.
**Archivos tocados:** 2 (`alert-engine.ts`, `backlog-view.ts`)

### 7.1 Mover el CSS a `backlog-view.ts`

```typescript
// En backlog-view.ts, reemplazar:
import { computeAlertLevel, getAlertInfo, ALERT_CSS } from "../../domain/alert-engine.js";
// ...
static styles = css`
  ${unsafeCSS(ALERT_CSS)}
  /* resto de estilos */
`;

// Por:
import { computeAlertLevel, getAlertInfo } from "../../domain/alert-engine.js";
// ...
static styles = css`
  .alert-overdue       { --alert-bg: var(--err-bg);  --alert-text: var(--err-text);  --alert-border: var(--err-border);  }
  .alert-red           { --alert-bg: var(--err-bg);  --alert-text: var(--err-text);  --alert-border: var(--err-border);  }
  .alert-yellow        { --alert-bg: var(--warn-bg); --alert-text: var(--warn-text); --alert-border: var(--warn-border); }
  .alert-green         { --alert-bg: var(--ok-bg);   --alert-text: var(--ok-text);   --alert-border: var(--ok-border);   }
  .alert-start-overdue { --alert-bg: var(--err-bg);  --alert-text: var(--err-text);  --alert-border: var(--err-border);  }
  .alert-start-now     { --alert-bg: var(--info-bg); --alert-text: var(--info-text); --alert-border: var(--accent);      }
  .alert-start-soon    { --alert-bg: var(--info-bg); --alert-text: var(--info-text); --alert-border: var(--accent);      }
  /* resto de estilos */
`;
```

### 7.2 Eliminar `ALERT_CSS` de `alert-engine.ts`

```typescript
// Eliminar de alert-engine.ts:
// export const ALERT_CSS = /* css */ `...`;
```

### ✅ Verificación

```bash
npm run typecheck    # 0 errores
git commit -m "refactor: mover ALERT_CSS de domain a backlog-view (domain no conoce presentación)"
```

---

## Fase 8 — Funciones puras en las vistas

**Riesgo:** Muy bajo. Cambios internos por componente, sin tocar la API pública.
**Archivos tocados:** `hoy-view.ts` (y cualquier vista con el mismo patrón).

### 8.1 Hacer `sesMinsSemana` una función pura en `hoy-view.ts`

```typescript
// ANTES:
function sesMinsSemana(materiaId: string): number {
  const ws = getWeekStart();
  let total = 0;
  for (const s of sesiones.value) {  // ← dependencia oculta en signal global
    if (s.materiaId === materiaId && new Date(s.inicio) >= ws) total += s.minutos;
  }
  return total;
}

// DESPUÉS:
function sesMinsSemana(materiaId: string, sesiones: Sesion[]): number {
  const ws = getWeekStart();
  return sesiones
    .filter((s) => s.materiaId === materiaId && new Date(s.inicio) >= ws)
    .reduce((acc, s) => acc + s.minutos, 0);
}

// En render(), pasarle el array explícitamente:
const sesMins = sesMinsSemana(mm.id, sesiones.value);
```

### 8.2 Evaluar el `effect()` manual

El patrón de `effect()` que llama `this.requestUpdate()` es un síntoma de que
`SignalWatcher` no está capturando las lecturas de signals que ocurren fuera
del ciclo `render()`. Verificar que todos los signals se lean dentro de `render()`
o de métodos llamados desde `render()`. Si es así, el `effect()` manual puede eliminarse.

```typescript
// Si todos los signals se leen en render(), eliminar:
override connectedCallback() {
  super.connectedCallback();
  // this._dispose = effect(() => { ... this.requestUpdate(); }); // ← eliminar
  this._tick = setInterval(() => { this._time = new Date(); }, 30_000);
}

override disconnectedCallback() {
  super.disconnectedCallback();
  // this._dispose?.(); // ← eliminar
  if (this._tick) clearInterval(this._tick);
}
```

> **Precaución:** verificar en el navegador que el componente sigue reactualizándose
> al cambiar datos antes de commitear esta parte.

### ✅ Verificación

```bash
npm run typecheck    # 0 errores
# + verificación manual en el navegador
git commit -m "refactor: hacer sesMinsSemana función pura, remover effect() manual en hoy-view"
```

---

## Fase 9 — IDs seguros en `pomo.ts`

**Riesgo:** Mínimo. Cambio de una sola línea, sin impacto en tipos.
**Archivos tocados:** 1 (`pomo.ts`)

```typescript
// ANTES:
const ses: Sesion = {
  id: `s${Date.now()}`,   // ← no es collision-safe
  // ...
};

// DESPUÉS:
const ses: Sesion = {
  id: crypto.randomUUID(),  // ← nativo en todos los targets ES2022+
  // ...
};
```

### ✅ Verificación

```bash
npm run typecheck    # 0 errores
git commit -m "fix: reemplazar Date.now() por crypto.randomUUID() para IDs de sesión"
```

---

## Fase 10 — Encapsular estado mutable de `gdrive.ts`

**Riesgo:** Medio-alto. Cambio interno significativo, sin impacto en la API pública.
**Archivos tocados:** 1 (`gdrive.ts`)

Esta fase es la única con riesgo real de regresión funcional porque toca el flujo
de autenticación OAuth. **Dejarla para último y hacer prueba manual completa del
flujo Drive después de aplicarla.**

### 10.1 Reemplazar variables sueltas por un objeto de sesión

```typescript
// ANTES: 5 variables de módulo independientes
let tokenClient: TokenClient | null = null;
let accessToken: string | null = null;
let tokenExpiry = 0;
let fileId: string | null = localStorage.getItem(LS_FILE_ID);
let saveTimer: ReturnType<typeof setTimeout> | null = null;

// DESPUÉS: estado encapsulado
interface DriveSession {
  tokenClient: TokenClient | null;
  accessToken: string | null;
  tokenExpiry: number;
  fileId: string | null;
  saveTimer: ReturnType<typeof setTimeout> | null;
}

const session: DriveSession = {
  tokenClient: null,
  accessToken: null,
  tokenExpiry: 0,
  fileId: localStorage.getItem(LS_FILE_ID),
  saveTimer: null,
};
```

Actualizar todas las referencias dentro de `gdrive.ts` de `accessToken` → `session.accessToken`, etc.
La API pública del módulo (todas las funciones exportadas) no cambia.

### 10.2 (Nota sobre CLIENT_ID)

El `CLIENT_ID` hardcodeado en el fuente es un problema de seguridad menor
(es una OAuth client ID, no un secret), pero lo correcto sería externalizarlo.
Con Vite se puede usar variables de entorno:

```typescript
// En lugar de:
const CLIENT_ID = "666209409570-...";

// Usar:
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
```

Y definir `VITE_GOOGLE_CLIENT_ID` en un archivo `.env.local` (no commiteado).
Esto requiere agregar `.env.local` al `.gitignore` si no está ya.

### ✅ Verificación

```bash
npm run typecheck    # 0 errores
# + flujo completo de Drive: conectar, guardar, desconectar, reconexión silenciosa
git commit -m "refactor: encapsular estado de sesión OAuth en gdrive.ts"
```

---

## Resumen de fases y su commit log esperado

| Fase | Commit | Riesgo | Archivos |
|------|--------|--------|----------|
| 0 | `chore: checkpoint pre-refactor` | — | 0 |
| 1 | `refactor: extraer migrateSlots a domain/` | Muy bajo | 2 |
| 2 | `refactor: extraer DEFAULT_* y emptyData a defaults.ts` | Muy bajo | 2 |
| 3 | `refactor: extraer buildDemoData a demo-data.ts` | Muy bajo | 2 |
| 4 | `refactor: reemplazar IIFE por loadStoredData/migrateStoredData` | Muy bajo | 1 |
| 5 | `refactor: hacer franjas y alertas requeridos en PlannerData` | Medio | 3-5 |
| 6a | `refactor: extraer navigation signals (store.ts re-exporta)` | Medio | 2 |
| 6b | `refactor: actualizar imports a navigation.ts en X vistas` | Bajo | 11 |
| 7 | `refactor: mover ALERT_CSS de domain a backlog-view` | Bajo | 2 |
| 8 | `refactor: funciones puras en hoy-view` | Bajo | 1 |
| 9 | `fix: crypto.randomUUID() para IDs de sesión` | Mínimo | 1 |
| 10 | `refactor: encapsular DriveSession en gdrive.ts` | Medio-alto | 1 |

**Regla de oro:** si en cualquier momento `npm run typecheck` da errores que
no sabés cómo resolver, hacer `git stash` y revisar el plan antes de continuar.
El estado siempre es recuperable mientras no se haga push de errores.