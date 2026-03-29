# UAI Planner — Lineamientos Técnicos y Arquitectónicos
## Guía para la construcción desde cero

> **Propósito**
> Este documento define las decisiones técnicas y arquitectónicas para construir UAI Planner.
> Está pensado como la fuente de verdad técnica que complementa la Especificación Funcional.
> Cada decisión incluye el **por qué**, no solo el qué — para que el agente pueda adaptarse
> a situaciones no previstas manteniendo el espíritu de las elecciones originales.

---

## ÍNDICE

1. [Stack tecnológico](#1-stack-tecnológico)
2. [Estructura del proyecto](#2-estructura-del-proyecto)
3. [Sistema de tipos](#3-sistema-de-tipos)
4. [Gestión de estado](#4-gestión-de-estado)
5. [Arquitectura de componentes](#5-arquitectura-de-componentes)
6. [Capa de persistencia](#6-capa-de-persistencia)
7. [Integración con Google Drive](#7-integración-con-google-drive)
8. [Sistema de routing y navegación](#8-sistema-de-routing-y-navegación)
9. [Sistema de estilos](#9-sistema-de-estilos)
10. [Testing](#10-testing)
11. [Toolchain y build](#11-toolchain-y-build)
12. [Calidad de código](#12-calidad-de-código)
13. [Performance](#13-performance)
14. [Seguridad](#14-seguridad)
15. [Convenciones de código](#15-convenciones-de-código)

---

## 1. STACK TECNOLÓGICO

### 1.1 Decisiones principales

| Rol | Tecnología | Versión mínima | Motivo de elección |
|---|---|---|---|
| UI Framework | React | 18.x | La app ya vive en React; el modelo de hooks y el árbol de componentes se mapea directamente al análisis funcional |
| Lenguaje | TypeScript | 5.x | El monolito tenía bugs silenciosos por falta de tipos; TypeScript los elimina en tiempo de compilación |
| Bundler | Vite | 5.x | HMR instantáneo, ESM nativo, configuración mínima; zero-config para proyectos React+TS |
| Testing unitario | Vitest | 1.x | Mismo config que Vite; compatible con Jest API; sin overhead de Babel |
| Testing E2E / visual | Playwright | 1.x | Snapshots visuales multiplataforma; API robusta para apps SPA |
| Estilos | CSS Modules + CSS custom properties | — | Sin overhead de runtime; compatible con el sistema de temas del monolito; tree-shakeable |
| Estado global ligero | Zustand | 4.x | Mínimo boilerplate; sin providers; fácil de testear; escala bien para dominios aislados |
| Fechas | date-fns | 3.x | Tree-shakeable; sin mutación; API funcional; soporte a timezone via date-fns-tz |

### 1.2 Tecnologías explícitamente descartadas

| Tecnología | Motivo de descarte |
|---|---|
| Redux / RTK | Overhead innecesario; la app no tiene flujos de datos lo suficientemente complejos como para justificar el boilerplate |
| React Query / TanStack Query | La app no tiene una API propia; los datos vienen de localStorage y Drive (que es fetch directo); no hay cache de servidor que gestionar |
| Tailwind CSS | El sistema de temas del monolito usa CSS custom properties que cambian con `data-theme`; Tailwind no se lleva bien con ese patrón sin configuración compleja |
| React Router | La app no tiene URLs con rutas distintas; la navegación es estado en memoria; un router completo agrega complejidad sin beneficio funcional |
| Next.js | La app es 100% client-side sin necesidad de SSR/SSG; el overhead de Next.js no está justificado |
| Styled Components / Emotion | CSS-in-JS tiene overhead de runtime; los temas del monolito son más simples con CSS variables puras |

### 1.3 Dependencias opcionales con criterio de adopción

Adoptar una dependencia adicional solo si:
1. El costo de implementarlo desde cero supera 2 horas de desarrollo
2. La librería tiene menos de 50KB gzipped
3. Tiene mantenimiento activo (commit en los últimos 6 meses)
4. No introduce conflictos con el patrón de CSS variables del sistema de temas

---

## 2. ESTRUCTURA DEL PROYECTO

### 2.1 Organización por dominio (feature-based)

```
uai-planner/
├── src/
│   ├── domains/               ← lógica de negocio pura, sin React
│   │   ├── planner/
│   │   │   ├── types.ts       ← tipos del dominio (no mezclar con tipos UI)
│   │   │   ├── reducer.ts     ← mutaciones de PlannerData
│   │   │   ├── selectors.ts   ← derivaciones memoizables
│   │   │   └── service.ts     ← persistencia local
│   │   ├── drive/
│   │   │   ├── driveApi.ts    ← llamadas a Google Drive REST API
│   │   │   └── driveState.ts  ← singleton del token OAuth
│   │   ├── alerts/
│   │   │   └── alertEngine.ts ← cálculo de urgencia por tarea
│   │   ├── schedule/
│   │   │   ├── franjas.ts     ← conversión 3↔6 franjas, getMomentoActual
│   │   │   └── timezone.ts    ← getPlannerNowParts (America/Argentina/Ushuaia)
│   │   └── import-export/
│   │       └── normalizer.ts  ← normalizePlannerData, parseImportPayload
│   │
│   ├── store/                 ← estado global React (Zustand stores)
│   │   ├── usePlannerStore.ts ← datos del planner + dispatch
│   │   ├── useDriveStore.ts   ← estado de sincronización Drive
│   │   ├── useUIStore.ts      ← modales abiertos, vista activa, filtros
│   │   └── usePomoStore.ts    ← estado del timer Pomodoro
│   │
│   ├── features/              ← componentes organizados por pantalla/dominio
│   │   ├── onboarding/
│   │   │   ├── OnboardingFlow.tsx
│   │   │   └── OnboardingFlow.module.css
│   │   ├── shell/
│   │   │   ├── AppShell.tsx
│   │   │   ├── ChromePeek.tsx
│   │   │   ├── NavBar.tsx
│   │   │   └── shell.module.css
│   │   ├── views/
│   │   │   ├── hoy/
│   │   │   ├── semana/
│   │   │   ├── kanban/
│   │   │   ├── backlog/
│   │   │   ├── calendar/
│   │   │   └── materias/
│   │   ├── tasks/
│   │   │   ├── TaskModal.tsx
│   │   │   ├── FormModal.tsx
│   │   │   └── ImportModal.tsx
│   │   ├── pomodoro/
│   │   │   ├── PomoWidget.tsx
│   │   │   └── PomoContextPopup.tsx
│   │   ├── drive/
│   │   │   └── DriveConflictModal.tsx
│   │   └── settings/
│   │       ├── SettingsModal.tsx
│   │       ├── MateriaForm.tsx
│   │       ├── TipoForm.tsx
│   │       ├── FranjasEditor.tsx
│   │       └── AlertasEditor.tsx
│   │
│   ├── shared/                ← componentes y hooks verdaderamente genéricos
│   │   ├── components/
│   │   │   ├── Modal.tsx          ← shell base de modal (overlay + card + header)
│   │   │   ├── ConfirmModal.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── TimeInputField.tsx
│   │   │   └── SlotGrid.tsx
│   │   └── hooks/
│   │       ├── useLocalStorage.ts
│   │       ├── useClickOutside.ts
│   │       ├── useKeyDown.ts
│   │       └── useFocusTrap.ts
│   │
│   ├── styles/
│   │   ├── themes.css         ← los 5 temas con tokens CSS (COPIA EXACTA del monolito)
│   │   ├── tokens.css         ← escala rem, variables de spacing/tipografía
│   │   ├── reset.css          ← box-sizing, margin/padding reset
│   │   └── base.css           ← fuente base, scrollbar, body
│   │
│   ├── App.tsx                ← punto de entrada React, monta el árbol principal
│   └── main.tsx               ← ReactDOM.createRoot, aplica tema inicial
│
├── tests/
│   ├── unit/                  ← tests de dominios puros
│   ├── integration/           ← tests de stores y hooks compuestos
│   └── visual/                ← snapshots Playwright
│
├── public/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── vitest.config.ts
└── playwright.config.ts
```

### 2.2 Reglas de imports entre capas

Las dependencias solo fluyen **hacia abajo**:

```
features/  →  store/  →  domains/  →  (no imports)
shared/    →  domains/ únicamente
```

**Prohibido:**
- `domains/` importar desde `store/`, `features/` o `shared/`
- `store/` importar desde `features/`
- `shared/` importar desde `store/` o `features/`

**Razón:** los dominios son la lógica de negocio pura. Si un dominio necesita algo de la UI, ese "algo" debería pasarse como parámetro, no importarse.

### 2.3 Convención de nombres de archivo

| Tipo | Convención | Ejemplo |
|---|---|---|
| Componente React | PascalCase.tsx | `TaskModal.tsx` |
| CSS Module de componente | `Componente.module.css` | `TaskModal.module.css` |
| Hook | camelCase con prefijo `use` | `useClickOutside.ts` |
| Servicio/lógica pura | camelCase | `alertEngine.ts` |
| Store Zustand | camelCase con prefijo `use` | `usePlannerStore.ts` |
| Tipos de dominio | camelCase | `types.ts` (dentro de su carpeta de dominio) |
| Tests | `nombre.test.ts/tsx` | `alertEngine.test.ts` |

---

## 3. SISTEMA DE TIPOS

### 3.1 Principio: los tipos viven en su dominio

No hay un único `types.ts` global. Cada dominio define los tipos que le corresponden:

```
domains/planner/types.ts     → Tarea, Materia, Sesion, TipoTarea, PlannerData
domains/alerts/alertEngine.ts → AlertColor (inline, no es un archivo separado)
domains/schedule/franjas.ts  → FranjaHoraria, FranjaMap, FranjaMode
store/useUIStore.ts          → UIState, ModalType (inline en el store)
```

Los tipos compartidos entre múltiples dominios se colocan en `domains/planner/types.ts` (porque son el modelo central de la app).

### 3.2 Tipos estrictos

```typescript
// tsconfig.json — opciones obligatorias
{
  "strict": true,          // habilita todos los checks estrictos
  "noUncheckedIndexedAccess": true,  // array[i] → T | undefined, no T
  "noImplicitReturns": true,
  "exactOptionalPropertyTypes": true  // {a?: string} != {a: string | undefined}
}
```

**`noUncheckedIndexedAccess` es importante** para la app porque hay muchos accesos a `materias.find()`, `tipos.find()`, y lookups por ID. Con este flag, TypeScript te fuerza a manejar el caso `undefined`.

### 3.3 Nunca usar `any`

Las únicas excepciones permitidas son:
- Al parsear JSON de localStorage (usar `unknown` → validar → tipar)
- Al interactuar con la API de Google Identity Services (declarar los tipos necesarios en un archivo `.d.ts`)

```typescript
// Correcto: unknown + type guard
function parseStoredData(raw: string): PlannerData | null {
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!isPlannerData(parsed)) return null
    return parsed
  } catch {
    return null
  }
}

// Correcto: declaration file para Google APIs
// src/types/google-identity.d.ts
declare namespace google {
  namespace accounts {
    namespace oauth2 {
      function initTokenClient(config: TokenClientConfig): TokenClient
      function revoke(token: string): void
    }
  }
}
```

### 3.4 Tipos discriminados para uniones

Preferir uniones discriminadas sobre booleanos para estados complejos:

```typescript
// Evitar
interface SyncState {
  isLoading: boolean
  isError: boolean
  error?: string
  data?: PlannerData
}

// Preferir
type SyncState =
  | { status: 'idle' }
  | { status: 'saving' }
  | { status: 'saved'; lastSaved: Date }
  | { status: 'error'; message: string }
```

### 3.5 Tipos de IDs son strings, no branded types

Los IDs en esta app son strings simples (`"mat_1234"`, `"t1"`, etc.). No usar branded types (`type MateriaId = string & { readonly _brand: 'MateriaId' }`) — el costo de ergonomía no justifica el beneficio en esta escala.

---

## 4. GESTIÓN DE ESTADO

### 4.1 Taxonomía del estado

El estado de la app se divide en cuatro categorías, cada una con su propia estrategia:

| Categoría | Ejemplos | Estrategia |
|---|---|---|
| **Datos del planner** | `tareas`, `materias`, `sesiones`, `tipos` | Zustand store + `useReducer` interno |
| **Sincronización** | `driveConnected`, `syncStatus`, `conflict` | Zustand store separado |
| **UI efímero** | modal abierto, vista activa, filtros | Zustand store separado |
| **Timer Pomodoro** | `session`, `contextMateria`, `elapsed` | Zustand store separado |

**Por qué Zustand y no Context API:**
Context provoca re-renders en todos los consumidores cuando el contexto cambia. Zustand tiene subscripciones selectivas: un componente que solo usa `data.tareas` no re-renderiza cuando cambia `syncStatus`. Para una app con 6 vistas activas simultáneamente en memoria, esto importa.

### 4.2 Store de datos del planner

```typescript
// src/store/usePlannerStore.ts

interface PlannerStore {
  data: PlannerData
  dirty: boolean
  lastSavedHash: string

  // Acciones — nombradas como verbos en pasado (lo que pasó, no la intención)
  dataLoaded(data: PlannerData): void
  tareaAdded(tarea: Omit<Tarea, 'id'>): void
  tareaUpdated(tarea: Tarea): void
  tareaDeleted(id: string): void
  tareaEstadoCambiado(id: string, estado: TareaEstado): void
  tareaFechaCambiada(id: string, field: 'fechaInicio' | 'fechaLimite', fecha: string): void
  checklistItemToggled(taskId: string, itemId: string): void
  tareasImportadas(tareas: Omit<Tarea, 'id'>[]): void
  materiaHorasCambiadas(materiaId: string, min: number, max: number, slots: MateriaSlot[]): void
  materiaSlotMovido(materiaId: string, from: MateriaSlot, to: MateriaSlot): void
  materiasActualizadas(materias: Materia[]): void
  tiposActualizados(tipos: TipoTarea[]): void
  sesionAgregada(sesion: Omit<Sesion, 'id'>): void
  sesionActualizada(id: string, patch: Partial<Sesion>): void
  sesionEliminada(id: string): void
}
```

**Convención de nombres de acciones:** verbos en **pasado** (evento ocurrido), no imperativo ni `setX`. Esto refleja que el store reacciona a eventos del mundo, no que "hace" cosas.

**Relación con el reducer:**
El store de Zustand internamente usa el `plannerReducer` de `domains/planner/reducer.ts`. Esto permite testear la lógica de mutaciones en aislamiento total sin montar el store.

```typescript
// Implementación del store
export const usePlannerStore = create<PlannerStore>((set, get) => ({
  data: PlannerService.loadData(),
  dirty: false,
  lastSavedHash: '',

  tareaAdded: (tarea) => set(state => ({
    data: plannerReducer(state.data, { type: 'ADD_TAREA', payload: tarea }),
    dirty: true
  })),
  // ... resto de acciones
}))
```

### 4.3 Store de UI

```typescript
// src/store/useUIStore.ts

interface UIStore {
  // Navegación
  activeView: ViewMode
  viewChanged(view: ViewMode): void

  // Filtros globales
  filters: GlobalFilters
  anioChanged(anio: number | 'all'): void
  periodoToggled(periodo: Periodo): void

  // Filtros de listas (Kanban/Backlog/Calendar)
  listFilters: ListFilters
  listMateriaChanged(id: string): void
  listTipoChanged(id: string): void
  listAlertaChanged(v: string): void

  // Modales — nunca arrays, siempre campos nominados
  selectedTaskId: string | null
  editingTask: Tarea | null        // null = nueva tarea
  settingsOpen: false | string     // false | nombre del tab inicial
  importTasksOpen: boolean
  resetModalOpen: boolean
  confirm: ConfirmConfig | null
  helpOpen: boolean
  editObjetivoMateriaId: string | null
  manualSessionMateriaId: string | null

  // Acciones de modales
  taskSelected(id: string | null): void
  taskEditOpened(task: Tarea | null): void
  taskEditClosed(): void
  settingsOpened(tab?: string): void
  settingsClosed(): void
  importTasksOpened(): void
  importTasksClosed(): void
  resetModalOpened(): void
  resetModalClosed(): void
  confirmOpened(config: ConfirmConfig): void
  confirmClosed(): void
  helpOpened(): void
  helpClosed(): void
  objetivoEditOpened(materiaId: string): void
  objetivoEditClosed(): void
  manualSessionOpened(materiaId: string): void
  manualSessionClosed(): void
}
```

**Por qué los modales son campos nominados y no un array/stack:**
La app no tiene modales apilados (modal sobre modal). Siempre hay como máximo uno activo de cada tipo. Usar campos nominados hace que TypeScript garantice que solo hay un modal abierto de cada tipo a la vez.

### 4.4 Store de Drive

```typescript
// src/store/useDriveStore.ts
interface DriveStore {
  connected: boolean
  status: SyncStatus
  message: string
  autoSave: boolean
  conflict: DriveConflict | null
  userEmail: string | null
  showSyncPanel: boolean

  // Acciones
  driveConnected(email: string): void
  driveDisconnected(): void
  syncStarted(): void
  syncSucceeded(): void
  syncFailed(message: string): void
  autoSaveToggled(enabled: boolean): void
  conflictDetected(conflict: DriveConflict): void
  conflictResolved(): void
  syncPanelToggled(): void
}
```

### 4.5 Store del Pomodoro

```typescript
// src/store/usePomoStore.ts
interface PomoStore {
  session: PomoSession | null       // sesión activa
  contextMateria: MateriaContext | null  // popup de contexto abierto
  elapsedSeconds: number            // contador del timer

  pomoStarted(session: PomoSession): void
  pomoStopped(): Sesion | null      // retorna la sesión a guardar
  pomoCancelled(): void
  contextOpened(materia: MateriaContext): void
  contextClosed(): void
  tickOccurred(): void              // incrementa elapsedSeconds en 1
}
```

**El timer (`setInterval`) vive en un hook `usePomoTimer`**, no en el store. El store solo sabe cuántos segundos han pasado — el mecanismo de contar es responsabilidad del hook.

### 4.6 Estado local de componentes

Usar `useState` local para:
- Estado de formulario (los valores de los inputs antes de guardar)
- Abrir/cerrar un dropdown dentro de un componente (ej: ThemeSwitcher)
- Flash temporal de confirmación ("✓ Guardado" que desaparece en 2 segundos)
- El tab activo dentro de un modal (ej: las tabs del SettingsModal)

**Regla:** si el estado solo lo necesita un componente y sus hijos directos, queda local.

### 4.7 Datos derivados con selectores

Los valores calculados del store se derivan con funciones puras en `domains/planner/selectors.ts`:

```typescript
// src/domains/planner/selectors.ts

export function selectMateriasFiltradas(
  data: PlannerData,
  filters: GlobalFilters
): Materia[] {
  return data.materias.filter(m => {
    if (filters.anio !== 'all' && m.anio !== filters.anio) return false
    if (!filters.periodos.includes(m.periodo)) return false
    return true
  })
}

export function selectTareasFiltradas(
  data: PlannerData,
  materiaIds: Set<string>,
  listFilters: ListFilters
): Tarea[] {
  return data.tareas.filter(t =>
    materiaIds.has(t.materiaId) &&
    (listFilters.materiaId === 'all' || t.materiaId === listFilters.materiaId) &&
    (listFilters.tipoId    === 'all' || t.tipo       === listFilters.tipoId)
  )
}

export function selectSubjectsById(materias: Materia[]): Record<string, Materia> {
  return Object.fromEntries(materias.map(m => [m.id, m]))
}

export function selectUrgentTasks(
  tareas: Tarea[],
  alertas: AlertasConfig
): Tarea[] {
  return tareas.filter(t => getAlertColor(t, alertas) !== null)
}
```

Estos selectores se usan con `useMemo` en los componentes que los necesitan, o con los selectores de Zustand (`useStore(state => selectX(state.data, ...))`).

---

## 5. ARQUITECTURA DE COMPONENTES

### 5.1 Cuatro niveles de componentes

```
1. Páginas/Vistas    → features/views/*      (conocen el store)
2. Contenedores      → features/*/index.tsx  (conectan store con presentacionales)
3. Presentacionales  → features/*/*.tsx      (solo props, sin store)
4. Primitivos        → shared/components/*   (sin lógica de negocio)
```

**Regla de oro:** un componente que accede al store no debería tener más de 50 líneas de JSX. Si tiene más, es probable que parte del JSX debería ser un componente presentacional.

### 5.2 Interfaz de props siempre tipada

```typescript
// Correcto
interface TaskCardProps {
  task:        Tarea
  materia:     Materia | undefined
  tipo:        TipoTarea | undefined
  isDark:      boolean
  alertColor:  string | null
  onSelect:    (id: string) => void
}

export function TaskCard({ task, materia, tipo, isDark, alertColor, onSelect }: TaskCardProps) {
  // ...
}

// Incorrecto
export function TaskCard(props: any) { ... }
export function TaskCard({ task, materia, tipo, isDark, alertColor, onSelect }: {
  task: any, materia: any, // etc — inline sin nombre
}) { ... }
```

### 5.3 Componentes sin efectos secundarios directos

Los componentes presentacionales **no llaman directamente** al store ni a localStorage. Reciben datos como props y emiten eventos como callbacks.

```typescript
// Correcto
function BacklogRow({ task, onSelect, onMove }: BacklogRowProps) {
  return (
    <div onClick={() => onSelect(task.id)}>
      {task.titulo}
    </div>
  )
}

// Incorrecto: el componente sabe del store
function BacklogRow({ task }: { task: Tarea }) {
  const { taskSelected } = useUIStore()  // ← dependencia oculta
  return <div onClick={() => taskSelected(task.id)}>{task.titulo}</div>
}
```

**Excepción:** los componentes de nivel "Contenedor" sí acceden al store. Su responsabilidad es exactamente esa — hacer el puente.

### 5.4 Composición sobre herencia

La app usa composición de componentes para compartir estructura visual:

```typescript
// Modal como shell reutilizable
function Modal({ title, icon, onClose, maxWidth = 420, children }: ModalProps) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.card}
        style={{ maxWidth }}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className={styles.header}>
          {icon}
          <span id="modal-title" className={styles.title}>{title}</span>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">✕</button>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  )
}

// Uso: los modales específicos solo definen su contenido
function ConfirmModal({ config, onClose }: ConfirmModalProps) {
  return (
    <Modal title={config.title} icon={config.icon} onClose={onClose}>
      <p>{config.message}</p>
      <div className={styles.actions}>
        <button onClick={onClose}>{config.cancelLabel ?? 'Cancelar'}</button>
        <button onClick={config.onConfirm}>{config.confirmLabel}</button>
      </div>
    </Modal>
  )
}
```

### 5.5 Lazy loading de vistas

Las 6 vistas se cargan bajo demanda:

```typescript
// src/App.tsx
const HoyView      = lazy(() => import('./features/views/hoy/HoyView'))
const SemanaView   = lazy(() => import('./features/views/semana/SemanaView'))
const KanbanView   = lazy(() => import('./features/views/kanban/KanbanView'))
const BacklogView  = lazy(() => import('./features/views/backlog/BacklogView'))
const CalendarView = lazy(() => import('./features/views/calendar/CalendarView'))
const MateriasView = lazy(() => import('./features/views/materias/MateriasView'))
```

El `Suspense` envuelve el área de contenido con un fallback mínimo (skeleton de la misma altura que el contenido esperado, no un spinner a pantalla completa).

### 5.6 Regla de tamaño de componentes

| Tipo | Máximo de líneas |
|---|---|
| Primitivo (shared/components) | 80 líneas |
| Presentacional | 150 líneas |
| Contenedor | 100 líneas (la mayoría debería ser hooks + JSX mínimo) |
| Vista completa | 200 líneas (si supera, extraer sub-componentes) |
| Modal complejo (Settings) | 300 líneas |

Si un componente supera el límite, es una señal de que tiene más de una responsabilidad.

---

## 6. CAPA DE PERSISTENCIA

### 6.1 PlannerService — única puerta de entrada a localStorage

```typescript
// src/domains/planner/service.ts

export const PlannerService = {
  // Lee el modo de la app
  getMode(): AppMode,
  setMode(mode: AppMode): void,

  // Lee/escribe los datos del planner
  // La key incluye el email para aislar datos por cuenta Drive
  loadData(email?: string | null): PlannerData,
  saveData(data: PlannerData, email?: string | null): void,

  // Email del usuario autenticado
  getEmail(): string | null,
  setEmail(email: string | null): void,

  // Configuraciones persistidas
  getTheme(): ThemeId,
  setTheme(id: ThemeId): void,
  getLastView(): ViewMode,
  setLastView(view: ViewMode): void,
  getFranjas(): FranjaMap,
  setFranjas(franjas: FranjaMap): void,
  getFranjaMode(): FranjaMode,
  setFranjaMode(mode: FranjaMode): void,
  getAlertas(): AlertasConfig,
  setAlertas(config: AlertasConfig): void,
  getAutoSave(): boolean,
  setAutoSave(v: boolean): void,
  getChromePinned(): boolean,
  setChromePinned(v: boolean): void,
  getFilters(): StoredFilters,
  setFilters(f: StoredFilters): void,
  getGridLayout(): GridLayout,
  setGridLayout(v: GridLayout): void,
}
```

**Por qué un objeto con métodos y no funciones sueltas:**
Un objeto `PlannerService` es mockeable como unidad en tests. Con funciones sueltas habría que mockear cada import individualmente.

### 6.2 Keys de localStorage como constantes tipadas

```typescript
// src/domains/planner/service.ts
const LS = {
  THEME:           'uai-theme',
  MODE:            'uai-planner-mode',
  DATA:            (email?: string | null) =>
                     email ? `uai-planner-data-v1-${email}` : 'uai-planner-data-v1',
  EMAIL:           'uai-planner-email',
  LAST_VIEW:       'uai-last-view',
  AUTO_SAVE:       'uai-autosave',
  CHROME_PINNED:   'uai-chrome-pinned',
  FILTERS:         'uai-filters',
  FRANJAS:         'uai-franjas',
  FRANJA_MODE:     'uai-franjas-mode',
  ALERTAS:         'uai-alertas',
  DRIVE_FILE_ID:   'uai-planner-drive-fileid',
  LAST_SAVED:      'uai-planner-last-saved',
  GRID_LAYOUT:     'uai-grid-layout',
} as const
```

### 6.3 Normalización defensiva al leer

Todo dato que venga de localStorage pasa por un normalizador antes de usarse:

```typescript
function loadData(email?: string | null): PlannerData {
  try {
    const raw = localStorage.getItem(LS.DATA(email))
    if (!raw) return createEmptyPlannerData()
    const parsed: unknown = JSON.parse(raw)
    return normalizePlannerData(parsed)   // ← en domains/import-export/normalizer.ts
  } catch {
    console.error('[PlannerService] Failed to load data, returning empty')
    return createEmptyPlannerData()
  }
}
```

**El normalizador** garantiza que cualquier dato con estructura defectuosa (por importación manual, cambio de versión, etc.) se transforma en una estructura válida en lugar de tirar un error.

### 6.4 Dirty tracking

El "dirty" se calcula comparando el hash actual con el hash del último estado guardado:

```typescript
// En usePlannerStore:
const currentHash = hashData(get().data)
const dirty = currentHash !== get().lastSavedHash
```

Donde `hashData` es `JSON.stringify(data)`. No es un hash criptográfico — es solo para detectar cambios.

---

## 7. INTEGRACIÓN CON GOOGLE DRIVE

### 7.1 DriveState como singleton mutable fuera de React

El token OAuth no vive en el store de React. Vive en un módulo singleton:

```typescript
// src/domains/drive/driveState.ts

interface DriveInternalState {
  tokenClient:  { requestAccessToken(opts: { prompt: string }): void } | null
  accessToken:  string | null
  tokenExpiry:  number | null
  fileId:       string | null
}

// Estado mutable — explícitamente fuera de React
// Motivo: el token no debe causar re-renders, y no necesita ser reactivo
export const driveState: DriveInternalState = {
  tokenClient:  null,
  accessToken:  null,
  tokenExpiry:  null,
  fileId:       localStorage.getItem(LS.DRIVE_FILE_ID),
}

export function isTokenValid(): boolean {
  return !!driveState.accessToken && Date.now() < (driveState.tokenExpiry ?? 0)
}
```

**Por qué no en el store de Zustand:** el token cambia constantemente (expira, se renueva) y hacerlo reactivo causaría re-renders innecesarios en toda la app. Lo que sí va al store es el estado de UI derivado: `connected`, `status`, `userEmail`.

### 7.2 DriveApi — solo llamadas HTTP

```typescript
// src/domains/drive/driveApi.ts

// Toda la lógica de OAuth, autenticación y manejo de errores
// Las funciones son async y tiran errores tipados

export async function driveConnect(
  prompt: '' | 'consent'
): Promise<{ token: string; expiresAt: number }>

export async function driveLoad(): Promise<unknown>

export async function driveSave(data: PlannerData): Promise<string>  // retorna fileId

export function driveDisconnect(): void
```

### 7.3 useDriveSync — hook que orquesta la sincronización

```typescript
// src/features/drive/useDriveSync.ts
// Hook que usa DriveApi + DriveStore + PlannerStore

export function useDriveSync() {
  const driveStore = useDriveStore()
  const { dataLoaded } = usePlannerStore()

  const connect = useCallback(async () => {
    // 1. Llamar a driveConnect
    // 2. Actualizar driveStore
    // 3. Cargar datos de Drive
    // 4. Detectar conflicto o aplicar directamente
    // 5. Obtener email via userinfo API
  }, [...])

  // ...
  return { connect, disconnect, saveNow, loadNow, toggleAutoSave }
}
```

### 7.4 Auto-save con debounce

```typescript
// En el componente raíz o en un hook dedicado
function useDriveAutoSave() {
  const { data } = usePlannerStore()
  const { connected, autoSave, saveNow } = useDriveStore()

  useEffect(() => {
    if (!connected || !autoSave) return

    const timeout = setTimeout(() => {
      saveNow(data)
    }, 2500)  // 2.5 segundos de debounce

    return () => clearTimeout(timeout)
  }, [data, connected, autoSave, saveNow])
}
```

**El debounce de 2.5 segundos** previene guardar en cada keystroke cuando el usuario está editando un formulario.

---

## 8. SISTEMA DE ROUTING Y NAVEGACIÓN

### 8.1 Sin React Router — navegación por estado

La app no tiene URLs con rutas distintas. El estado activo se determina por:
1. `appMode`: `'welcome'` | `'local'` | `'drive'`
2. `activeView`: la vista actualmente visible

```typescript
// src/App.tsx — lógica de routing por estado
function App() {
  const { appMode } = usePlannerStore()
  const { activeView } = useUIStore()

  if (appMode === 'welcome') return <OnboardingFlow />

  return (
    <AppShell>
      <Suspense fallback={<ViewSkeleton />}>
        {activeView === 'hoy'      && <HoyView />}
        {activeView === 'semana'   && <SemanaView />}
        {activeView === 'kanban'   && <KanbanView />}
        {activeView === 'backlog'  && <BacklogView />}
        {activeView === 'calendar' && <CalendarView />}
        {activeView === 'materias' && <MateriasView />}
      </Suspense>
    </AppShell>
  )
}
```

### 8.2 Persistencia de la vista activa

Cuando el usuario cambia de vista, se persiste en localStorage:

```typescript
// En useUIStore
viewChanged: (view: ViewMode) => {
  PlannerService.setLastView(view)
  set({ activeView: view })
}
```

### 8.3 Estado que persiste entre vistas vs estado que se resetea

| Estado | Comportamiento al cambiar de vista |
|---|---|
| Filtros globales (año/período) | Persisten |
| Filtros de lista (materia/tipo) | Persisten mientras no se recargue la app |
| Mes del calendario | Persiste en `useUIStore` (no en localStorage) |
| Modal abierto | Se cierra |
| Tab activo en Settings | Se resetea al abrir Settings nuevamente |

---

## 9. SISTEMA DE ESTILOS

### 9.1 CSS Modules + CSS custom properties

Cada componente tiene su propio archivo `.module.css`. Las variables de tema (`--bg1`, `--accent`, etc.) se usan directamente en los módulos CSS — no se pasan como props.

```css
/* TaskCard.module.css */
.card {
  background: var(--bg1);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background 0.15s;
}

.card:hover {
  background: var(--bg2);
}

.subjectDot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  flex-shrink: 0;
  /* El color se pasa como style inline porque es dinámico */
}

.title {
  font-size: var(--t-md);  /* 0.8125rem = 13px */
  color: var(--text0);
}
```

### 9.2 Estilos dinámicos — solo inline cuando es realmente dinámico

```typescript
// Correcto: el color viene de datos, debe ser inline
<div
  className={styles.subjectDot}
  style={{ background: materia.color }}
/>

// Correcto: clases condicionales para estados conocidos
<div className={cn(styles.card, task.estado === 'completado' && styles.completed)} />

// Incorrecto: hardcodear valores que deberían ser variables
<div style={{ fontSize: '13px', color: '#888' }} />  // ← usar var(--t-md) y var(--text3)
```

### 9.3 Escala de tokens rem

Definida en `src/styles/tokens.css`, usada en todos los módulos CSS nuevos:

```css
/* src/styles/tokens.css */
:root {
  /* Tipografía — basada en la escala del monolito */
  --t-xxs:  0.5625rem;   /* 9px  — labels muy pequeños */
  --t-xs:   0.625rem;    /* 10px — hints, metadatos */
  --t-sm:   0.6875rem;   /* 11px — labels secundarios */
  --t-base: 0.75rem;     /* 12px — texto de apoyo */
  --t-md:   0.8125rem;   /* 13px — texto principal */
  --t-lg:   0.875rem;    /* 14px — texto ligeramente destacado */
  --t-xl:   1rem;        /* 16px — headings menores */
  --t-2xl:  1.0625rem;   /* 17px — headings medios */
  --t-3xl:  1.125rem;    /* 18px — headings */

  /* Espaciado */
  --sp-1:  0.25rem;      /* 4px  */
  --sp-2:  0.5rem;       /* 8px  */
  --sp-3:  0.625rem;     /* 10px */
  --sp-4:  0.75rem;      /* 12px */
  --sp-6:  1rem;         /* 16px */
  --sp-8:  1.25rem;      /* 20px */
  --sp-10: 1.375rem;     /* 22px */
  --sp-12: 1.5rem;       /* 24px */
  --sp-16: 2rem;         /* 32px */

  /* Border radius */
  --r-xs:   0.25rem;     /* 4px  */
  --r-sm:   0.3125rem;   /* 5px  */
  --r-md:   0.5rem;      /* 8px  */
  --r-lg:   0.75rem;     /* 12px */
  --r-xl:   1rem;        /* 16px */
  --r-full: 624.9375rem; /* 9999px = pill */
}
```

### 9.4 Temas — el archivo `themes.css` es inmutable

El archivo `src/styles/themes.css` contiene los 5 temas con sus variables exactas (documentadas en la Especificación Funcional §18). **No se modifica nunca.** Si se necesita agregar un token nuevo, se hace en `tokens.css`, no en `themes.css`.

El cambio de tema se aplica al atributo `data-theme` del elemento `<html>`:

```typescript
// src/domains/planner/service.ts
setTheme(id: ThemeId): void {
  document.documentElement.setAttribute('data-theme', id)
  localStorage.setItem(LS.THEME, id)
}
```

### 9.5 La fuente monospace es parte de la identidad visual

```css
/* src/styles/base.css */
html, body {
  font-family: 'DM Mono', 'Fira Code', 'Courier New', monospace;
  font-size: 0.8125rem;   /* 13px */
}
```

No usar fuentes sans-serif en ningún parte de la app excepto en textos que explícitamente lo requieran (y en esa app no hay ninguno).

### 9.6 Clase utilitaria `cn` para classNames condicionales

```typescript
// src/shared/utils/cn.ts — implementación mínima sin dependencias externas
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}
```

No instalar `clsx` ni `classnames` — con esta implementación alcanza para los casos de la app.

---

## 10. TESTING

### 10.1 Tres niveles de testing

| Nivel | Herramienta | Qué testea | Cobertura objetivo |
|---|---|---|---|
| Unitario | Vitest | Funciones puras de `domains/` | 90% de los dominios |
| Integración | Vitest + Testing Library | Stores + hooks compuestos | Flujos críticos |
| Visual/E2E | Playwright | Regresión visual de las 6 vistas | 100% de vistas × 3 temas |

### 10.2 Qué testear primero (orden de prioridad)

1. **`domains/planner/reducer.ts`** — cada acción del reducer
2. **`domains/alerts/alertEngine.ts`** — los 6 colores de alerta con sus condiciones de borde
3. **`domains/schedule/franjas.ts`** — conversión 3↔6, `getMomentoActual` con fechas mockeadas
4. **`domains/import-export/normalizer.ts`** — datos válidos, datos parciales, datos corruptos
5. **`store/usePlannerStore.ts`** — integraciones entre store y PlannerService
6. **`features/drive/useDriveSync.ts`** — lógica de conflictos Drive vs local

### 10.3 Estructura de un test unitario

```typescript
// tests/unit/alertEngine.test.ts

describe('getAlertColor', () => {
  const config: AlertasConfig = {
    diasUrgente: 2, diasMuyUrgente: 7, diasInicio: 3
  }

  it('returns null for completed tasks regardless of date', () => {
    const tarea = makeTarea({ estado: 'completado', fechaLimite: yesterday() })
    expect(getAlertColor(tarea, config)).toBeNull()
  })

  it('returns "red" when deadline is overdue', () => {
    const tarea = makeTarea({ fechaLimite: yesterday() })
    expect(getAlertColor(tarea, config)).toBe('red')
  })

  it('returns "red" when days until deadline <= diasUrgente', () => {
    const tarea = makeTarea({ fechaLimite: daysFromNow(1) })
    expect(getAlertColor(tarea, config)).toBe('red')
  })

  it('returns "yellow" within diasMuyUrgente', () => {
    const tarea = makeTarea({ fechaLimite: daysFromNow(5) })
    expect(getAlertColor(tarea, config)).toBe('yellow')
  })

  it('returns "start_overdue" when fechaInicio is in the past and task is not done', () => {
    const tarea = makeTarea({ fechaInicio: yesterday(), estado: 'pendiente' })
    expect(getAlertColor(tarea, config)).toBe('start_overdue')
  })
})
```

### 10.4 Tests de regresión visual

```typescript
// tests/visual/regression.spec.ts

const VIEWS: ViewMode[] = ['hoy', 'semana', 'kanban', 'backlog', 'calendar', 'materias']
const THEMES: ThemeId[] = ['noche', 'claro', 'hueso']

for (const theme of THEMES) {
  for (const view of VIEWS) {
    test(`${theme}/${view} matches snapshot`, async ({ page }) => {
      await page.goto('/')
      await loadDemoData(page)
      await setTheme(page, theme)
      await setView(page, view)
      await page.waitForLoadState('networkidle')
      await expect(page).toHaveScreenshot(`${theme}-${view}.png`, {
        maxDiffPixelRatio: 0.02  // 2% de tolerancia para anti-aliasing
      })
    })
  }
}
```

### 10.5 Mocking

No usar mocks de módulos completos (`vi.mock('./service')`) salvo para `localStorage` y las APIs de Google:

```typescript
// tests/helpers/setupTests.ts
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} }
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })
```

---

## 11. TOOLCHAIN Y BUILD

### 11.1 vite.config.ts

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@':         path.resolve(__dirname, './src'),
      '@domains':  path.resolve(__dirname, './src/domains'),
      '@store':    path.resolve(__dirname, './src/store'),
      '@features': path.resolve(__dirname, './src/features'),
      '@shared':   path.resolve(__dirname, './src/shared'),
    }
  },

  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          // React y sus dependencias — cambian raramente, buen candidato a chunk separado
          'vendor': ['react', 'react-dom'],
          // Zustand — pequeño pero siempre presente
          'state': ['zustand'],
          // date-fns — puede ser grande; tree-shakeable pero mejor separado
          'dates': ['date-fns', 'date-fns-tz'],
        }
      }
    },
    // El monolito era un solo archivo; la meta es estar por debajo de eso
    chunkSizeWarningLimit: 300  // KB — aviso si un chunk supera esto
  },

  preview: {
    port: 4173
  }
})
```

### 11.2 tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noEmit": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "paths": {
      "@/*":         ["./src/*"],
      "@domains/*":  ["./src/domains/*"],
      "@store/*":    ["./src/store/*"],
      "@features/*": ["./src/features/*"],
      "@shared/*":   ["./src/shared/*"]
    }
  },
  "include": ["src", "tests"],
  "exclude": ["node_modules", "archive"]
}
```

### 11.3 Scripts de package.json

```json
{
  "scripts": {
    "dev":              "vite",
    "build":            "tsc --noEmit && vite build",
    "preview":          "vite preview",
    "test":             "vitest run",
    "test:watch":       "vitest",
    "test:ui":          "vitest --ui",
    "test:visual":      "playwright test tests/visual/",
    "test:visual:update":"playwright test tests/visual/ --update-snapshots",
    "lint":             "eslint src/ tests/ --ext .ts,.tsx",
    "lint:fix":         "eslint src/ tests/ --ext .ts,.tsx --fix",
    "typecheck":        "tsc --noEmit",
    "validate":         "npm run typecheck && npm run lint && npm run test"
  }
}
```

`validate` es el comando que corre el CI. Debe pasar limpio antes de cualquier merge.

### 11.4 .eslintrc.cjs

```javascript
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: { project: './tsconfig.json' },
  plugins: ['@typescript-eslint', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:react-hooks/recommended',
  ],
  rules: {
    // Tipos
    '@typescript-eslint/no-explicit-any':           'error',
    '@typescript-eslint/no-unsafe-assignment':       'warn',
    '@typescript-eslint/no-unsafe-member-access':    'warn',
    '@typescript-eslint/no-floating-promises':       'error',

    // React hooks
    'react-hooks/exhaustive-deps':                  'error',

    // Limpieza general
    'no-console':       ['warn', { allow: ['warn', 'error'] }],
    'no-debugger':      'error',
    'prefer-const':     'error',
    'no-var':           'error',

    // Prohibir estilos inline con px (fuera del caso dinámico)
    // Nota: este rule no existe nativamente; usar eslint-plugin-no-restricted-syntax
    'no-restricted-syntax': [
      'warn',
      {
        selector: 'JSXAttribute[name.name="style"] > JSXExpressionContainer > ObjectExpression > Property[key.name="fontSize"][value.type="Literal"]',
        message: 'Usar variables CSS (var(--t-md)) en vez de px literales en fontSize'
      }
    ]
  },
  ignorePatterns: ['dist/', 'node_modules/', 'archive/']
}
```

---

## 12. CALIDAD DE CÓDIGO

### 12.1 Principios aplicados a esta app específicamente

**Single Responsibility en componentes:**
Un componente que renderiza una lista de tareas no debería también calcular el color de urgencia. El cálculo ocurre en `selectores.ts`, el componente solo renderiza lo que recibe.

**Open/Closed en el reducer:**
Agregar un nuevo tipo de acción (`ADD_SESION_CON_TAREA`) no requiere modificar acciones existentes. Solo se agrega el nuevo `case`.

**Dependency Inversion en servicios:**
Los componentes no llaman directamente a `localStorage`. Llaman a `PlannerService`, que internamente puede cambiar su implementación sin afectar a los componentes.

### 12.2 Code smells a evitar activamente

| Code smell | Señal de alerta | Solución |
|---|---|---|
| God component | Componente con > 15 props o > 200 líneas | Dividir en sub-componentes |
| Prop drilling | Una prop pasa por más de 2 niveles sin ser usada en el medio | Mover al store |
| Estado derivado en useState | `useState` cuyo valor se calcula de otro estado | Usar `useMemo` o selector |
| Efectos con muchas deps | `useEffect` con más de 4 dependencias | Extraer a un custom hook |
| String mágico | `if (status === 'saving')` sin constante | Usar tipos literales TypeScript |
| Comentario que explica el QUÉ | `// incrementar el contador` antes de `count++` | Nombrar mejor la variable |

### 12.3 Política de comentarios

Un comentario solo tiene valor cuando explica el **por qué** de una decisión no obvia:

```typescript
// Correcto: explica por qué, no qué
// El token vive fuera de React para no causar re-renders en toda la app
// cuando caduca (cada ~55 minutos). Ver §7.1 de los lineamientos técnicos.
export const driveState: DriveInternalState = { ... }

// Correcto: advierte sobre un edge case
// El timestamp se guarda en hora local, no UTC, para que el cálculo de
// "días restantes" sea correcto sin importar la zona horaria del navegador
function localISONow(): string { ... }

// Incorrecto: explica el qué (es evidente en el código)
// Filtrar materias por año
const materiasFiltradas = materias.filter(m => m.anio === anio)
```

### 12.4 Regla de los imports circulares

Configurar el linter para detectar imports circulares entre `domains/`:

```json
// eslint config adicional
"import/no-cycle": ["error", { "maxDepth": 2 }]
```

---

## 13. PERFORMANCE

### 13.1 Puntos de atención específicos de esta app

**El re-render de las 6 vistas:** Solo la vista activa está montada en el DOM. Las otras están en estado "suspendido" por lazy loading. No usar `display: none` para ocultarlas — desmontar y volver a montar es más eficiente para esta app porque las vistas son relativamente pesadas.

**Las operaciones de filtrado:** Las listas de tareas se filtran en cada render. Los selectores en `useMemo` previenen que el filtrado ocurra cuando el store cambia por razones no relacionadas (ej: abrir un modal).

**El ResizeObserver del Chrome Shell:** Mantener la lógica exacta del monolito. No intentar "simplificar" — tiene múltiples `requestAnimationFrame` y timeouts que resuelven timing bugs reales en distintos navegadores.

**El hash de datos para dirty tracking:** `JSON.stringify(data)` en cada cambio puede ser costoso para datos grandes. Si el planner tiene > 500 tareas, considerar un hash incremental o limitar el `hashData` a solo los campos que afectan el dirty tracking.

### 13.2 useMemo — cuándo sí y cuándo no

**Sí usar useMemo para:**
- Resultados de filtros sobre arrays grandes (`selectTareasFiltradas`, `selectMateriasFiltradas`)
- Lookups por ID que se calculan una vez y se usan en múltiples lugares (`subjectsById`, `taskTypesById`)
- Cálculos de urgencia sobre toda la lista de tareas (`selectUrgentTasks`)

**No usar useMemo para:**
- Concatenar strings simples
- Condiciones booleanas simples (`isDark`, `hasFilters`)
- Arrays de menos de 20 items sin filtros complejos

### 13.3 Métricas objetivo

| Métrica | Objetivo |
|---|---|
| Bundle inicial (sin lazy chunks) | < 150KB gzipped |
| Chunks de vistas individuales | < 50KB cada uno |
| Tiempo hasta interactivo (localhost) | < 1 segundo |
| Re-renders al cambiar una tarea | Solo el componente de esa tarea + los contadores del kanban |
| Lighthouse Performance (build) | > 90 |

---

## 14. SEGURIDAD

### 14.1 Scope de Google OAuth

La app solicita solo `https://www.googleapis.com/auth/drive.file`. Este scope limita el acceso a archivos creados por la propia app — no puede leer ni modificar otros archivos del Drive del usuario. Este scope es el menos invasivo posible y debe mantenerse así.

### 14.2 El Client ID de Google está expuesto en el frontend

Esto es correcto e intencional para aplicaciones OAuth de tipo "public client". El Client ID no es un secreto (a diferencia del Client Secret, que no existe en flujos de type implicit/PKCE). La seguridad la provee el dominio autorizado en la configuración de Google Cloud Console.

### 14.3 No evaluar JSON de localStorage sin validación

```typescript
// Correcto
const parsed: unknown = JSON.parse(raw)
if (!isPlannerData(parsed)) throw new Error('Invalid data')

// Incorrecto
const data = JSON.parse(raw) as PlannerData  // ← confiar ciegamente en el tipo
```

### 14.4 El campo `link_vc` de las tareas

Permite ingresar URLs de videollamadas. Se debe sanitizar antes de renderizar en un `<a href>`:

```typescript
function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return ['https:', 'http:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

// En el componente
{task.link_vc && isSafeUrl(task.link_vc) && (
  <a href={task.link_vc} target="_blank" rel="noopener noreferrer">📹</a>
)}
```

### 14.5 Importación de JSON por URL hash

La importación vía `#import=BASE64` (§15.4 de la Spec Funcional) debe sanitizar el contenido parseado igual que cualquier otro import:

```typescript
function processHashImport(): void {
  const hash = window.location.hash
  if (!hash.startsWith('#import=')) return

  try {
    const base64 = hash.slice('#import='.length)
    const decoded = atob(base64)
    const parsed: unknown = JSON.parse(decoded)
    // Validar antes de usar
    const normalized = normalizePlannerData(parsed)
    // Guardar en historial
    saveIncrementalImport(normalized)
  } catch {
    console.error('[Import] Hash import failed')
  } finally {
    window.location.hash = ''
  }
}
```

---

## 15. CONVENCIONES DE CÓDIGO

### 15.1 Naming en español vs inglés

| Qué | Idioma | Ejemplo |
|---|---|---|
| Variables/funciones de dominio (datos del planner) | Español | `materias`, `tareas`, `fechaLimite`, `getMateriasFiltradas` |
| Variables/funciones técnicas (infra, UI, utilities) | Inglés | `isDark`, `isLoading`, `handleClick`, `useLocalStorage` |
| Nombres de componentes | Inglés | `TaskCard`, `BacklogRow`, `ConfirmModal` |
| Tipos TypeScript | Inglés | `ViewMode`, `SyncStatus`, `DriveConflict` |
| Mensajes de error en `console.error` | Inglés | `'[PlannerService] Failed to load'` |
| Textos visibles en la UI | Español rioplatense | `'Cambios sin guardar'`, `'¿Querés continuar?'` |

**Razón:** el dominio de la app (materias, tareas, sesiones) está en español porque así lo entiende el usuario y así está en la Spec Funcional. La infraestructura técnica está en inglés porque es el idioma estándar del ecosistema de desarrollo.

### 15.2 Orden de elementos en un componente React

```typescript
function MiComponente({ prop1, prop2 }: MiComponenteProps) {
  // 1. Hooks del store (Zustand)
  const { data } = usePlannerStore()

  // 2. State local
  const [isOpen, setIsOpen] = useState(false)

  // 3. Efectos
  useEffect(() => { ... }, [])

  // 4. Valores derivados (useMemo, useCallback)
  const filtradas = useMemo(() => ..., [])

  // 5. Handlers de eventos
  function handleClick() { ... }

  // 6. Early returns (guards)
  if (!data) return null

  // 7. JSX
  return (
    <div>...</div>
  )
}
```

### 15.3 Convención de commits (Conventional Commits simplificado)

```
feat(views): add HoyView with schedule and urgent tasks
feat(store): add useDriveStore with conflict resolution
fix(alerts): handle null fechaLimite in getAlertColor
fix(franjas): preserve slots when converting 3→6 mode
test(reducer): add tests for MOVE_MATERIA_SLOT action
chore: update Vite to 5.2
```

Prefijos: `feat`, `fix`, `test`, `chore`, `docs`, `refactor`, `perf`

### 15.4 Manejo de errores

No dejar errores silenciosos:

```typescript
// Correcto
try {
  const data = PlannerService.loadData()
  // ...
} catch (err) {
  console.error('[App] Failed to load initial data:', err)
  // Continuar con estado vacío — nunca dejar la app rota
  return createEmptyPlannerData()
}

// Incorrecto
try {
  const data = PlannerService.loadData()
} catch {
  // silencio
}
```

Los errores de Drive que el usuario necesita saber se escriben en el store (`driveStore.syncFailed(message)`) y se muestran en el indicador de sincronización del header.

---

## RESUMEN EJECUTIVO

Una sola tabla con las decisiones más importantes para tener a mano:

| Decisión | Elección | El no-negociable |
|---|---|---|
| Framework | React 18 | Hooks modernos, no class components |
| Lenguaje | TypeScript strict | `noUncheckedIndexedAccess: true` |
| Estado global | Zustand (4 stores separados) | Sin un store God que lo mezcle todo |
| Estilos | CSS Modules + custom properties | Los temas via `data-theme`, jamás JS-in-CSS |
| Persistencia | `PlannerService` como única puerta | Nunca `localStorage` directo en componentes |
| Drive | Singleton mutable fuera de React | El token no es estado reactivo |
| Routing | Estado en memoria (sin React Router) | Las vistas son `lazy()` |
| Testing | Vitest + Playwright | Los snapshots visuales son la red de seguridad |
| Arquitectura | Capas: domains → store → features | Los dominios son independientes de React |
| Nombres | Dominio en español, infra en inglés | Los textos de UI en español rioplatense |

---

*Versión 1.0 — Complementa UAI_PLANNER_FUNCTIONAL_SPEC.md*
*Cada decisión técnica fue tomada en función de la escala y características específicas de UAI Planner.*
*No aplicar estas decisiones a otros proyectos sin evaluar si el contexto es el mismo.*
