Antes de opinar con fundamento, déjame leer el código real de los archivos clave.Ya tengo suficiente contexto. Ahora sí puedo darte un análisis fundado en el código real.Perfecto. Leí todo el código. Ahora sí te doy un análisis real, con los problemas específicos que encontré en cada archivo.

---

Hay bastante código bien escrito acá — el `alert-engine.ts` es elegante, el `pomo.ts` es prolijo, y la elección de señales es correcta. Pero hay patrones que se repiten y que vale la pena atacar. Te los organizo por impacto:

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