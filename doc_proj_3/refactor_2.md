El documento cubre las cinco áreas con código concreto para cada corrección. Un par de cosas que vale resaltar del plan:
La Fase 3 (updatedAt) es la única que requiere prueba manual obligatoria en el navegador — el compilador no puede verificar que la sincronización de Drive se comporta correctamente bajo condiciones reales de red. El resto se verifica solo con typecheck.
La Fase 4 del mixin es la más larga pero también la más segura si se hace de a un componente por commit: en cualquier momento podés hacer git revert del último commit y volvés al estado anterior sin afectar nada más. El orden propuesto empieza por los más simples (pomo-widget, app-shell) para validar que el mixin funciona antes de tocar los componentes más complejos como hoy-view y materia-stats-view.


# Oda Planner — Mejoras pendientes post-refactor

> **Estado del proyecto:** el refactor estructural está completo y el build compila sin
> errores con `strict: true`. Este documento cubre lo que resta para alcanzar calidad
> de producción genuina: tres correcciones de corrección funcional, un problema
> arquitectural de fondo, y limpieza cosmética de imports.
>
> **Red de seguridad:** `npm run typecheck` (TypeScript strict) + `npm run build` son
> los árbitros. Cada fase de este plan termina con ambos en verde antes de hacer commit.

---

## Índice

1. [Corrección A — `uid()` incompleto en dos vistas](#corrección-a--uid-incompleto-en-dos-vistas)
2. [Corrección B — `CLIENT_ID` expuesto en el repositorio](#corrección-b--client_id-expuesto-en-el-repositorio)
3. [Corrección C — Detección de conflictos en Drive frágil](#corrección-c--detección-de-conflictos-en-drive-frágil)
4. [Arquitectural — Dos sistemas de signals incompatibles](#arquitectural--dos-sistemas-de-signals-incompatibles)
5. [Cosmético — Imports que apuntan a `store.ts` en lugar de `navigation.ts`](#cosmético--imports-que-apuntan-a-storets-en-lugar-de-navigationts)
6. [Plan de implementación](#plan-de-implementación)

---

## Corrección A — `uid()` incompleto en dos vistas

### Qué es

El refactor anterior reemplazó `Date.now()` por `crypto.randomUUID()` en `pomo.ts`
para generar IDs de sesión. Sin embargo, dos vistas tienen su propia función `uid()`
local que no fue actualizada:

```typescript
// src/components/views/sesion-edit-view.ts — línea 17
function uid(): string {
  return `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

// src/components/views/task-view.ts — línea 18
function uid(): string {
  return `t-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
```

### Por qué importa

`Date.now()` retorna milisegundos enteros. Si dos sesiones o tareas se crean en el
mismo milisegundo (perfectamente posible al importar datos en batch o en tests), los
IDs colisionan. El resultado es corrupción silenciosa: dos entidades distintas con el
mismo ID, donde la segunda sobreescribe a la primera en cualquier operación que filtre
por ID (`updateSesion`, `deleteTarea`, etc.).

`crypto.randomUUID()` genera un UUID v4 con 122 bits de entropía. La probabilidad de
colisión es astronómicamente baja y no depende del tiempo del sistema. Es nativo en
todos los targets ES2022+ que el proyecto ya requiere.

La inconsistencia también es un problema de mantenimiento: `pomo.ts` usa UUID pero
las vistas de edición usan `Date.now()`. Un colaborador nuevo no tiene forma de saber
cuál es el patrón correcto sin leer ambos archivos.

### La corrección

```typescript
// Reemplazar en ambas vistas:
function uid(): string {
  return `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

// Por:
const uid = () => crypto.randomUUID();
```

El prefijo `s-` y `t-` en el original era para distinguir visualmente sesiones de
tareas. Con UUID no hace falta — los IDs son opacos por diseño — pero si se quiere
conservar para debugging, se puede mantener:

```typescript
const uid = () => `s-${crypto.randomUUID()}`;
```

---

## Corrección B — `CLIENT_ID` expuesto en el repositorio

### Qué es

El Client ID de OAuth 2.0 de Google está hardcodeado directamente en el fuente:

```typescript
// src/state/gdrive.ts — línea 6
const CLIENT_ID = "666209409570-6rpat6b4j910acvp9kjgeemas3gnomm5.apps.googleusercontent.com";
```

El repositorio es público. Este valor está en el historial de git y es visible para
cualquiera.

### Por qué importa

Un OAuth Client ID no es un secret en el sentido estricto (no puede usarse para
autenticar sin el consentimiento del usuario), pero exponer configuración de
infraestructura en el código fuente tiene dos consecuencias concretas:

**Cambiar el Client ID requiere un commit.** Si Google revoca la clave, si el proyecto
migra a otra cuenta, o si se quiere usar un ID distinto para desarrollo y producción,
hoy eso requiere modificar el código fuente. Con variables de entorno, es cambiar un
archivo `.env.local`.

**Mezcla configuración con lógica.** El principio de separar configuración del código
(factor III del twelve-factor app) existe exactamente para esto: la misma base de
código debería poder apuntar a distintas configuraciones sin modificar una sola línea.

El `.gitignore` ya tiene `.env` listado, pero **no tiene `.env.local`**, que es el
archivo que Vite usa para overrides locales no commiteados.

### La corrección

**1. Agregar `.env.local` al `.gitignore`:**

```
# .gitignore — agregar esta línea
.env.local
```

**2. Crear `.env.local` (no commiteado, solo local):**

```bash
# .env.local
VITE_GOOGLE_CLIENT_ID=666209409570-6rpat6b4j910acvp9kjgeemas3gnomm5.apps.googleusercontent.com
```

**3. Crear `.env.example` (sí commiteado, como documentación):**

```bash
# .env.example — guía para nuevos colaboradores
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id-here
```

**4. Actualizar `gdrive.ts`:**

```typescript
// Reemplazar:
const CLIENT_ID = "666209409570-...";

// Por:
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;

// Agregar guard de desarrollo para detectar configuración faltante:
if (!CLIENT_ID) {
  console.warn("[GDrive] VITE_GOOGLE_CLIENT_ID no está configurado. La integración con Drive no funcionará.");
}
```

**Nota importante:** el historial de git ya tiene el Client ID commiteado. Si en algún
momento se decide rotar las credenciales de OAuth, el valor viejo seguirá en el
historial. Para proyectos de mayor criticidad se usaría `git filter-repo` para purgar
el historial, pero para un Client ID de OAuth público esto es generalmente innecesario.

---

## Corrección C — Detección de conflictos en Drive frágil

### Qué es

Cuando la app arranca en modo Drive, `driveBoot()` intenta decidir si los datos
remotos son más nuevos que los locales. La lógica actual lo hace comparando el número
de elementos en los arrays:

```typescript
// src/state/gdrive.ts — driveBoot()
const rMats = remote.materias?.length ?? 0;
const lMats = local.materias.length;
const rTasks = remote.tareas?.length ?? 0;
const lTasks = local.tareas.length;

if (rMats !== lMats || rTasks !== lTasks) {
  applyData(remote); // "last writer wins" — pero no sabe quién escribió último
}
```

### Por qué importa

Esta heurística tiene múltiples casos de fallo silencioso:

**Caso 1 — Edición sin agregar ni eliminar:** el usuario edita el título de una tarea
en el móvil. Los datos remotos tienen 5 tareas. Los datos locales también tienen 5
tareas. La condición es falsa, se usa local, la edición del móvil se pierde.

**Caso 2 — Coincidencia numérica accidental:** el usuario agrega una materia y elimina
una tarea en dispositivo A. Los datos remotos tienen 4 materias y 8 tareas; los locales
tienen 3 materias y 9 tareas. `rMats !== lMats` es verdadero, se usa remote, pero los
datos locales tenían los cambios más recientes.

**Caso 3 — La señal `driveConflictData` existe pero nunca se usa desde `driveBoot`.**
El sistema tiene infraestructura para mostrarle al usuario un diálogo de conflicto, pero
`driveBoot` nunca la activa — simplemente elige remote y sigue.

La solución es agregar un campo `updatedAt` a `PlannerData`. Con un timestamp, la
comparación es exacta y no ambigua.

### La corrección

**Paso 1 — Agregar `updatedAt` a `PlannerData` en `types.ts`:**

El campo se declara `opcional` para no romper datos existentes en localStorage (los
usuarios con datos previos no tienen este campo; caerán al fallback `"1970-01-01"` y
el comportamiento del boot será correcto: remoto gana porque sí tiene timestamp).

```typescript
// src/state/types.ts
export interface PlannerData {
  materias: Materia[];
  tipos: TipoTarea[];
  tareas: Tarea[];
  sesiones: Sesion[];
  franjas: FranjaDef[];
  alertas: AlertConfig;
  updatedAt?: string; // ISO 8601 — opcional para compatibilidad con datos anteriores
}
```

**Paso 2 — Escribir `updatedAt` en cada `setPlannerData`:**

```typescript
// src/state/store.ts
export function setPlannerData(data: PlannerData) {
  const stamped: PlannerData = { ...data, updatedAt: new Date().toISOString() };
  plannerData.value = stamped;
  localStorage.setItem(KEY_DATA, JSON.stringify(stamped));
  if (driveConnected.value) {
    scheduleAutoSave(() => plannerData.value);
  }
}
```

**Paso 3 — Reemplazar la heurística en `driveBoot`:**

```typescript
// src/state/gdrive.ts — driveBoot()
if (result.remoteData) {
  const remoteTs = result.remoteData.updatedAt ?? "1970-01-01T00:00:00.000Z";
  const localTs  = currentData.updatedAt       ?? "1970-01-01T00:00:00.000Z";

  if (remoteTs > localTs) {
    // Remote es más nuevo — aplicar sin conflicto
    applyData(result.remoteData);
  } else if (remoteTs === localTs) {
    // Idénticos — no hacer nada (mismo dato en ambos lados)
  } else {
    // Local es más nuevo — no aplicar remote, los datos locales ya están cargados
    // Opcionalmente: scheduleAutoSave para que remote se actualice
  }
}
```

**Por qué comparar strings ISO funciona:** las fechas en formato ISO 8601
(`"2025-04-01T14:32:00.000Z"`) se ordenan lexicográficamente igual que
cronológicamente. La comparación `remoteTs > localTs` es correcta sin parsear fechas.

---

## Arquitectural — Dos sistemas de signals incompatibles

### Qué es

El proyecto usa dos librerías de signals que son fundamentalmente distintas e
incompatibles entre sí a nivel de protocolo de rastreo:

| Librería | Tipo de signal | API |
|---|---|---|
| `@preact/signals-core` | Signals propias de Preact | `.value` (lectura/escritura) |
| `@lit-labs/signals` | TC39 Signals Proposal (vía `signal-polyfill`) | `.get()` / `.set()` |

`SignalWatcher` de `@lit-labs/signals` rastreo automático de lecturas de signals,
pero **solo de signals TC39** — no puede detectar cuando se lee `.value` de un signal
de Preact. Como consecuencia, `SignalWatcher` está inutilizado en la práctica: los
componentes lo extienden en la clase, pero el rastreo automático nunca se activa.

Para compensar, cada componente implementa manualmente el mismo boilerplate de
suscripción con `effect()` de `@preact/signals-core`. Hay **14 instancias** de este
patrón en el proyecto:

```typescript
// Patrón repetido en 14 componentes
private _dispose?: () => void;

override connectedCallback() {
  super.connectedCallback();
  this._dispose = effect(() => {
    signal1.value; signal2.value; // "tocar" para suscribirse
    this.requestUpdate();
  });
}

override disconnectedCallback() {
  super.disconnectedCallback();
  this._dispose?.();
}
```

Además, dentro de esas 14 instancias hay dos variantes que no son equivalentes:

**Patrón B (correcto):** el `effect` solo suscribe y dispara `requestUpdate()`. Las
lecturas reales del signal ocurren dentro de `render()`, que es el lugar correcto.

**Patrón C (con estado duplicado):** el `effect` deriva datos del signal y los copia
a propiedades `@state` privadas del componente. `render()` luego lee esas propiedades.
Esto crea una copia intermedia del dato que puede quedar desincronizada durante la
ventana entre que el signal cambia y el `effect` corre.

```typescript
// Patrón C — problemático (materia-stats-view.ts)
this._dispose = effect(() => {
  const id = statsMateriaId.value;
  const data = plannerData.value;
  this._mat = data.materias.find((m) => m.id === id) ?? null; // copia intermedia
  this._tareas = data.tareas.filter((t) => t.materiaId === id);
  this._sesiones = data.sesiones.filter((s) => s.materiaId === id);
  this.requestUpdate();
});
// render() usa this._mat, this._tareas — datos potencialmente stale
```

### Por qué importa

El problema del boilerplate repetido es mantenimiento: cualquier cambio al patrón
(agregar un cleanup, cambiar la estrategia de update) requiere editar 14 archivos. Es
exactamente el tipo de problema que un mixin resuelve.

La duplicación de `@lit-labs/signals` es deuda de dependencia: la librería está en
"Lit Labs" (explícitamente marcada como experimental y sujeta a breaking changes), pero
el proyecto la importa en cada componente. Si se depreca o cambia la API, hay que
actualizar 14 archivos. Como el rastreo automático de `SignalWatcher` no funciona de
todas formas con signals de Preact, la dependencia no agrega valor real.

El Patrón C crea estado duplicado innecesario. Los datos ya viven en los signals
globales; copiarlos a `@state` privado no agrega nada excepto una posible fuente de
inconsistencia.

### La corrección

**Opción A — Mixin `PreactSignalWatcher` (recomendada):**

Encapsular el patrón en un mixin reusable que reemplaza tanto a `SignalWatcher` como
al boilerplate manual:

```typescript
// src/components/shared/preact-signal-watcher.ts
import { LitElement } from "lit";
import { effect } from "@preact/signals-core";

type Constructor<T extends LitElement = LitElement> = new (...args: unknown[]) => T;

/**
 * Mixin que conecta @preact/signals-core con el ciclo de vida de Lit.
 * Cualquier signal de Preact leído en render() dispara automáticamente
 * un requestUpdate() cuando cambia.
 *
 * Uso: class MyElement extends PreactSignalWatcher(LitElement) { ... }
 */
export function PreactSignalWatcher<T extends Constructor>(Base: T) {
  return class extends Base {
    private _psDispose?: () => void;

    override connectedCallback() {
      super.connectedCallback();
      let initialized = false;
      this._psDispose = effect(() => {
        // Al correr el render la primera vez, el effect registra todos los signals
        // que se leen. Subsiguientes cambios disparan este callback.
        (this as unknown as LitElement).requestUpdate();
        if (!initialized) {
          initialized = true;
          // La primera ejecución ocurre sincrónicamente — no necesitamos update
          // porque el componente aún no ha hecho el render inicial.
        }
      });
    }

    override disconnectedCallback() {
      super.disconnectedCallback();
      this._psDispose?.();
      this._psDispose = undefined;
    }
  };
}
```

Con este mixin, cada componente se simplifica de:

```typescript
// ANTES: boilerplate en cada archivo
import { SignalWatcher } from "@lit-labs/signals";
import { effect } from "@preact/signals-core";

@customElement("backlog-view")
export class BacklogView extends SignalWatcher(LitElement) {
  private _dispose?: () => void;

  override connectedCallback() {
    super.connectedCallback();
    this._dispose = effect(() => {
      filteredTareas.value;
      materias.value;
      plannerData.value;
      this.requestUpdate();
    });
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this._dispose?.();
  }

  render() { /* lee signals directamente */ }
}
```

```typescript
// DESPUÉS: sin boilerplate
import { PreactSignalWatcher } from "../shared/preact-signal-watcher.js";

@customElement("backlog-view")
export class BacklogView extends PreactSignalWatcher(LitElement) {
  // connectedCallback y disconnectedCallback: no necesarios
  // El mixin los maneja. Si el componente necesita connectedCallback
  // para otra cosa (ej: setInterval), llamar super.connectedCallback() normalmente.

  render() {
    // Cualquier signal leído acá dispara re-render automáticamente
    const tareas = filteredTareas.value;
    const mats = materias.value;
    return html`...`;
  }
}
```

**Opción B — Eliminar `@lit-labs/signals` completamente:**

Si se prefiere no agregar el mixin, se puede eliminar `@lit-labs/signals` del proyecto
y reemplazar el boilerplate por el mixin directamente. Es un refactor más amplio pero
resulta en menos dependencias.

**Corrección del Patrón C (materia-stats-view):**

Independientemente de qué opción se elija para el mixin, el Patrón C debe corregirse
moviendo las derivaciones de datos a `render()`:

```typescript
// ANTES (materia-stats-view.ts) — estado duplicado
render() {
  return html`
    ${this._mat ? html`<h2>${this._mat.nombre}</h2>` : nothing}
    ${this._tareas.map(t => html`...`)}
  `;
}

// DESPUÉS — leer directamente de los signals en render()
render() {
  const id = statsMateriaId.value;
  const data = plannerData.value;
  const mat = id ? data.materias.find((m) => m.id === id) ?? null : null;
  const tareas = id ? data.tareas.filter((t) => t.materiaId === id) : [];
  const sesiones = id ? data.sesiones.filter((s) => s.materiaId === id) : [];

  return html`
    ${mat ? html`<h2>${mat.nombre}</h2>` : nothing}
    ${tareas.map(t => html`...`)}
  `;
}
```

---

## Cosmético — Imports que apuntan a `store.ts` en lugar de `navigation.ts`

### Qué es

Todas las vistas importan las señales de navegación desde `store.ts`, que las
re-exporta desde `navigation.ts`. Esto funciona correctamente, pero el grafo de
dependencias es opaco:

```typescript
// Lo que dicen los archivos hoy:
import { editingTaskId, taskReturnView } from "../../state/store.js";

// Lo que realmente son:
// editingTaskId y taskReturnView viven en navigation.ts,
// store.ts solo los re-exporta. Un lector nuevo no lo sabe.
```

### Por qué importa

Es un problema de legibilidad, no de corrección. Cuando alguien lee `backlog-view.ts`
y ve que importa `editingTaskId` de `store.ts`, podría asumir que `editingTaskId` es
estado de dominio (como `plannerData`). La distinción entre estado de dominio y estado
de navegación de UI es una decisión arquitectural que el refactor expresó creando
`navigation.ts` — pero los imports aún no la comunican.

Esto no afecta el comportamiento en ningún caso. Es una mejora de legibilidad pura.

### La corrección

Actualizar los imports de a un archivo por commit. Los 11 archivos afectados son:
`backlog-view`, `calendario-view`, `hoy-view`, `kanban-view`, `task-view`,
`materia-edit-view`, `materia-stats-view`, `materias-view`, `semana-view`,
`sesion-edit-view`, `sesiones-view`.

```typescript
// En cada archivo, cambiar:
import { editingTaskId, taskReturnView, /* ... */ } from "../../state/store.js";

// Por imports separados según origen real:
import { plannerData, filteredTareas, /* señales de dominio */ } from "../../state/store.js";
import { editingTaskId, taskReturnView, /* señales de navegación */ } from "../../state/navigation.js";
```

---

## Plan de implementación

### Principios del plan

**Criterio de avance:** cada fase termina con `npm run typecheck` y `npm run build`
en 0 errores/warnings antes de hacer commit. Si alguno falla, no se avanza.

**Granularidad de commits:** un commit por corrección funcional, un commit por archivo
en las correcciones cosméticas. Commits pequeños facilitan el `git revert` si algo
sale mal.

**Orden por riesgo:** de menor a mayor impacto en la base de código. Las correcciones
de una línea van primero; los cambios arquitecturales, al final.

---

### Fase 1 — `uid()` en `sesion-edit-view.ts` y `task-view.ts`

**Riesgo:** mínimo. Cambio de una función de una línea en cada archivo.  
**Archivos:** 2  
**Tiempo estimado:** 5 minutos

```typescript
// En ambos archivos, reemplazar la función uid() existente por:
const uid = () => crypto.randomUUID();
```

Verificar que `uid()` no se use con el prefijo en ningún otro lugar del archivo antes
de eliminar el prefijo `s-` / `t-`. Si el prefijo se quiere conservar por legibilidad
en debugging:

```typescript
const uid = () => `ses-${crypto.randomUUID()}`;  // sesion-edit-view
const uid = () => `tar-${crypto.randomUUID()}`;  // task-view
```

```bash
npm run typecheck && npm run build
git add src/components/views/sesion-edit-view.ts src/components/views/task-view.ts
git commit -m "fix: reemplazar Date.now() por crypto.randomUUID() en uid() de sesion y tarea"
```

---

### Fase 2 — `CLIENT_ID` y `.env.local`

**Riesgo:** bajo. No toca lógica de autenticación, solo de dónde se lee la constante.  
**Archivos:** 3 (`.gitignore`, nuevo `.env.local`, nuevo `.env.example`, `gdrive.ts`)  
**Tiempo estimado:** 10 minutos

**Paso 2.1 — Actualizar `.gitignore`:**

```bash
echo ".env.local" >> .gitignore
```

**Paso 2.2 — Crear `.env.local` (no se commitea):**

```bash
# .env.local
VITE_GOOGLE_CLIENT_ID=666209409570-6rpat6b4j910acvp9kjgeemas3gnomm5.apps.googleusercontent.com
```

**Paso 2.3 — Crear `.env.example` (sí se commitea):**

```bash
# .env.example — copiar a .env.local y completar con tu Client ID de Google OAuth
VITE_GOOGLE_CLIENT_ID=
```

**Paso 2.4 — Actualizar `gdrive.ts`:**

```typescript
// Eliminar:
const CLIENT_ID = "666209409570-...";

// Agregar:
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined ?? "";

if (import.meta.env.DEV && !CLIENT_ID) {
  console.warn("[GDrive] VITE_GOOGLE_CLIENT_ID no configurado. Creá un archivo .env.local con tu Client ID.");
}
```

**Verificación:** arrancar `npm run dev` y confirmar que la integración con Drive
sigue funcionando. El valor ahora viene de la variable de entorno, no del código.

```bash
npm run typecheck && npm run build
git add .gitignore .env.example src/state/gdrive.ts
git commit -m "fix: externalizar CLIENT_ID a variable de entorno VITE_GOOGLE_CLIENT_ID"
```

> ⚠️ **No agregar `.env.local` al commit.** Solo `.gitignore` y `.env.example`.

---

### Fase 3 — `updatedAt` en `PlannerData`

**Riesgo:** medio. Toca `types.ts`, `store.ts` y `gdrive.ts`. Requiere prueba manual
del flujo completo de Drive después del cambio.  
**Archivos:** 3  
**Tiempo estimado:** 20 minutos

**Paso 3.1 — Agregar el campo a `types.ts`:**

```typescript
// src/state/types.ts — agregar al final de PlannerData
export interface PlannerData {
  materias: Materia[];
  tipos: TipoTarea[];
  tareas: Tarea[];
  sesiones: Sesion[];
  franjas: FranjaDef[];
  alertas: AlertConfig;
  updatedAt?: string; // ISO 8601 — opcional para compatibilidad con versiones anteriores
}
```

**Paso 3.2 — Escribir el timestamp en `setPlannerData`:**

```typescript
// src/state/store.ts
export function setPlannerData(data: PlannerData) {
  const stamped: PlannerData = { ...data, updatedAt: new Date().toISOString() };
  plannerData.value = stamped;
  localStorage.setItem(KEY_DATA, JSON.stringify(stamped));
  if (driveConnected.value) {
    scheduleAutoSave(() => plannerData.value);
  }
}
```

**Paso 3.3 — Reemplazar la heurística en `driveBoot`:**

```typescript
// src/state/gdrive.ts — dentro de driveBoot()

// ELIMINAR esto:
const rMats = remote.materias?.length ?? 0;
const lMats = local.materias.length;
const rTasks = remote.tareas?.length ?? 0;
const lTasks = local.tareas.length;
if (rMats !== lMats || rTasks !== lTasks) {
  applyData(remote);
}

// REEMPLAZAR por:
const remoteTs = result.remoteData.updatedAt ?? "1970-01-01T00:00:00.000Z";
const localTs  = currentData.updatedAt       ?? "1970-01-01T00:00:00.000Z";

if (remoteTs > localTs) {
  // Remote es más reciente — aplicar
  applyData(result.remoteData);
}
// Si localTs >= remoteTs: los datos locales ya son los más nuevos, no hacer nada.
```

**Verificación manual obligatoria:**

1. Abrir la app en modo Drive, hacer un cambio, cerrar.
2. Abrir en otro dispositivo/tab, verificar que el cambio aparece.
3. Hacer un cambio en el segundo dispositivo, abrir el primero, verificar que se aplica remote.
4. Verificar que `updatedAt` aparece en el JSON guardado en Drive.

```bash
npm run typecheck && npm run build
git add src/state/types.ts src/state/store.ts src/state/gdrive.ts
git commit -m "fix: reemplazar heurística de conflicto Drive por comparación de updatedAt"
```

---

### Fase 4 — Mixin `PreactSignalWatcher`

**Riesgo:** medio-alto. Cambia la base de 14 componentes. Se hace de forma incremental:
un componente a la vez, verificando en el navegador después de cada uno.  
**Archivos:** 15 (1 nuevo + 14 actualizados)  
**Tiempo estimado:** 1-2 horas

**Paso 4.1 — Crear el mixin:**

```typescript
// src/components/shared/preact-signal-watcher.ts
import { LitElement } from "lit";
import { effect } from "@preact/signals-core";

type Constructor<T extends LitElement = LitElement> = new (...args: unknown[]) => T;

/**
 * Mixin que conecta @preact/signals-core con el ciclo de vida de Lit.
 *
 * Cualquier signal de Preact accedido con .value dentro de render()
 * dispara automáticamente un requestUpdate() cuando el signal cambia.
 *
 * Reemplaza el patrón manual de effect() + dispose en connectedCallback/
 * disconnectedCallback.
 *
 * Uso:
 *   class MiComponente extends PreactSignalWatcher(LitElement) {
 *     render() {
 *       return html`${miSignal.value}`; // se suscribe automáticamente
 *     }
 *   }
 */
export function PreactSignalWatcher<T extends Constructor>(Base: T) {
  return class extends Base {
    private _psDispose?: () => void;

    override connectedCallback() {
      super.connectedCallback();
      this._psDispose = effect(() => {
        (this as unknown as LitElement).requestUpdate();
      });
    }

    override disconnectedCallback() {
      super.disconnectedCallback();
      this._psDispose?.();
      this._psDispose = undefined;
    }
  };
}
```

```bash
npm run typecheck
git add src/components/shared/preact-signal-watcher.ts
git commit -m "feat: agregar mixin PreactSignalWatcher para unificar integración de signals"
```

**Paso 4.2 — Migrar componentes de a uno**

El orden recomendado es de menor a mayor complejidad. Para cada componente:

1. Reemplazar `SignalWatcher(LitElement)` por `PreactSignalWatcher(LitElement)`
2. Eliminar el import de `SignalWatcher` y de `effect`
3. Eliminar `private _dispose?: () => void`
4. Eliminar el bloque `connectedCallback` si su único contenido era el `effect`
   (si tenía otras cosas como `setInterval`, conservar esas y eliminar solo el `effect`)
5. Eliminar el bloque `disconnectedCallback` si su único contenido era `this._dispose?.()`
6. Si el componente usaba el Patrón C, mover las derivaciones a `render()`
7. Correr `npm run typecheck`
8. Verificar en el navegador que el componente reacciona a cambios de signals
9. Commit

**Orden de migración:**

```
1. pomo-widget.ts          — simple, solo ayuda con pomoFocusMode
2. app-shell.ts            — simple, solo isWelcome
3. kanban-view.ts          — Patrón B simple
4. materias-view.ts        — Patrón B simple
5. sesiones-view.ts        — Patrón B simple
6. backlog-view.ts         — Patrón B simple
7. calendario-view.ts      — Patrón B simple
8. semana-view.ts          — Patrón B simple
9. hoy-view.ts             — tiene setInterval además del effect (conservar)
10. pomo-focus-view.ts     — tiene lógica adicional
11. nav-bar.ts             — Patrón A (copia a @state)
12. global-filter.ts       — Patrón A (copia a @state)
13. datos-view.ts          — Patrón A (copia a @state)
14. materia-stats-view.ts  — Patrón C (requiere mover derivaciones a render)
    config-tab-alertas.ts  — Patrón A (copia a @state)
```

**Cuidado especial con `hoy-view.ts`:** tiene un `setInterval` en `connectedCallback`
además del `effect`. Al migrar, eliminar solo el bloque del `effect` y mantener el
`setInterval`:

```typescript
// DESPUÉS de migrar hoy-view.ts:
override connectedCallback() {
  super.connectedCallback(); // PreactSignalWatcher maneja el effect
  this._tick = setInterval(() => {    // esto se conserva
    this._time = new Date();
  }, 30_000);
}

override disconnectedCallback() {
  super.disconnectedCallback(); // PreactSignalWatcher maneja el dispose
  if (this._tick) clearInterval(this._tick); // esto se conserva
}
```

**Cuidado especial con `materia-stats-view.ts` (Patrón C):**

Al migrar este componente, hay que eliminar las propiedades `@state` derivadas
(`_mat`, `_tareas`, `_sesiones`, `_franjas`) y leer directamente de los signals
en `render()`. Ver la corrección detallada en la sección de arquitectura.

```bash
# Un commit por componente o por grupo de componentes simples:
git commit -m "refactor: migrar backlog-view a PreactSignalWatcher"
git commit -m "refactor: migrar hoy-view a PreactSignalWatcher"
# etc.
```

**Paso 4.3 — Verificar y limpiar (opcional)**

Una vez migrados todos los componentes, verificar que `@lit-labs/signals` ya no se
usa en ningún archivo:

```bash
grep -r "@lit-labs/signals" src/
```

Si no hay resultados, se puede eliminar del `package.json`:

```bash
npm uninstall @lit-labs/signals
npm run typecheck && npm run build
git commit -m "chore: eliminar dependencia @lit-labs/signals (reemplazada por PreactSignalWatcher)"
```

---

### Fase 5 — Actualizar imports a `navigation.ts` (cosmético)

**Riesgo:** mínimo. Los imports re-exportados siguen funcionando si algo sale mal.  
**Archivos:** hasta 11  
**Tiempo estimado:** 15 minutos

Hacer un commit por archivo para facilitar el tracking:

```bash
# Para cada vista con signals de navegación:
# 1. Separar el import de store.ts en dos imports
# 2. npm run typecheck
# 3. commit

git commit -m "refactor: actualizar imports de navigation en backlog-view"
git commit -m "refactor: actualizar imports de navigation en task-view"
# etc.
```

Una vez actualizados todos los archivos, verificar que la re-exportación en `store.ts`
sigue siendo necesaria (puede que algún archivo todavía la use) o eliminarla si ya no
hace falta.

---

### Resumen del orden de ejecución

| Fase | Descripción | Riesgo | Archivos tocados |
|------|-------------|--------|-----------------|
| 1 | `uid()` con `crypto.randomUUID()` | Mínimo | 2 |
| 2 | `CLIENT_ID` → variable de entorno | Bajo | 3 + `.env.local` local |
| 3 | `updatedAt` en `PlannerData` | Medio | 3 + prueba manual de Drive |
| 4a | Crear mixin `PreactSignalWatcher` | Bajo | 1 (nuevo) |
| 4b | Migrar 14 componentes al mixin | Medio-alto | 14 (uno por commit) |
| 4c | Eliminar `@lit-labs/signals` | Bajo | `package.json` |
| 5 | Actualizar imports a `navigation.ts` | Mínimo | hasta 11 |

**Regla de oro para todo el proceso:** si en cualquier momento `npm run typecheck`
da errores que no se entienden, hacer `git stash` y revisar antes de continuar.
El estado siempre es recuperable mientras no se haga push de errores.