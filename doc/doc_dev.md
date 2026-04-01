# Oda Planner v3.0 — Manifiesto de Desarrollo

> Este documento es la fuente de verdad sobre la arquitectura, patrones y convenciones del proyecto.
> **Todo nuevo desarrollo debe respetar lo aquí establecido.** Si algo se quiere cambiar,
> primero se actualiza este documento y después el código.

---

## 1. Stack tecnológico

| Capa | Tecnología | Versión | Rol |
|------|-----------|---------|-----|
| UI | **Lit** (LitElement + lit-html) | 3.2 | Web Components nativos |
| Reactividad | **@preact/signals-core** | 1.8 | Signals fine-grained sin VDOM |
| Animaciones | **GSAP** | 3.12 | Micro-interacciones premium |
| CSS | **CSS puro** (custom properties) | — | Tokens + temas + densidad |
| Build | **Vite** | 6.x | Dev server + bundler |
| Types | **TypeScript** | 5.6 strict | Decoradores experimentales (`experimentalDecorators`) |
| Lint/Format | **Biome** | 1.9 | Reemplaza ESLint + Prettier |

**No se usan**: React, Preact (solo su motor de signals), frameworks CSS, preprocesadores, virtual DOM, Redux.

### Presupuesto de bundle

| Métrica | Target | Actual |
|---------|--------|--------|
| JS gzip | < 120 KB | ~97 KB |
| CSS gzip | < 2 KB | ~1.5 KB |
| Dependencias runtime | 3 | lit, @preact/signals-core, gsap |

Cada nueva dependencia debe justificarse contra este presupuesto. Si existe una solución en < 50 líneas de código, se prefiere código propio.

---

## 2. Estructura de directorios

```
src/
├── app.ts                          # Entry point — monta <app-shell>
├── vite-env.d.ts                   # Tipos de Vite
│
├── components/
│   ├── shell/                      # Cáscara global (siempre visible)
│   │   ├── app-shell.ts            # Router + layout + view transitions
│   │   ├── nav-bar.ts              # Header con pills + acciones
│   │   └── global-filter.ts        # Chip filtro año/período
│   │
│   ├── shared/                     # Componentes reutilizables
│   │   ├── preact-signal-watcher.ts # Mixin Lit ↔ Preact Signals
│   │   └── view-placeholder.ts     # Placeholder genérico
│   │
│   ├── onboarding/
│   │   └── onboarding-flow.ts      # Wizard de bienvenida (3 pasos)
│   │
│   ├── pomodoro/
│   │   ├── pomo-widget.ts          # Widget flotante mini-timer
│   │   └── pomo-focus-view.ts      # Overlay inmersivo full-screen
│   │
│   └── views/                      # Vistas (una por ruta)
│       ├── hoy-view.ts
│       ├── semana-view.ts
│       ├── materias-view.ts
│       ├── materia-edit-view.ts
│       ├── materia-stats-view.ts
│       ├── backlog-view.ts
│       ├── kanban-view.ts
│       ├── calendario-view.ts
│       ├── sesiones-view.ts
│       ├── sesion-edit-view.ts
│       ├── task-view.ts
│       ├── datos-view.ts
│       ├── ayuda-view.ts
│       └── config/
│           ├── config-view.ts       # Tabs container
│           ├── config-tab-materias.ts
│           ├── config-tab-tipos.ts
│           ├── config-tab-franjas.ts
│           ├── config-tab-alertas.ts
│           └── config-tab-tema.ts
│
├── state/                          # Todo el estado de la app
│   ├── types.ts                    # Interfaces del dominio
│   ├── store.ts                    # Signal store central + CRUD
│   ├── navigation.ts               # Signals de navegación/edición
│   ├── pomo.ts                     # Pomodoro timer controller
│   ├── defaults.ts                 # Valores por defecto (franjas, tipos, alertas)
│   ├── demo-data.ts                # Generador de datos demo
│   └── gdrive.ts                   # Google Drive OAuth2 + sync
│
├── domain/                         # Lógica pura (sin UI ni signals)
│   ├── alert-engine.ts             # Cálculo de niveles de alerta
│   └── slot-migration.ts           # Migración de horarios al cambiar franjas
│
├── styles/                         # CSS global
│   ├── tokens.css                  # Design tokens (spacing, font, z-index, etc.)
│   ├── themes.css                  # 5 temas via [data-theme]
│   └── reset.css                   # CSS reset + densidad
│
└── types/                          # Type declarations adicionales
    ├── google-identity.d.ts
    └── view-transitions.d.ts
```

### Reglas de ubicación

- **`domain/`** = funciones puras. No importan signals, no importan Lit, no tienen side effects. Reciben datos, devuelven datos. Si necesitás lógica de negocio compleja, va acá.
- **`state/`** = signals + persistencia. Única capa que escribe en `localStorage`. Los componentes **nunca** escriben directamente a `localStorage`.
- **`components/`** = UI. Cada archivo = un custom element. Los componentes leen signals y despachan eventos; **no** tienen lógica de negocio.
- **`styles/`** = CSS global para tokens, temas y reset. Los estilos de cada componente van **dentro** del componente (`static styles = css\`...\``), no aquí.

---

## 3. Sistema de reactividad: PreactSignalWatcher

**Este es el corazón de la arquitectura.** Conecta `@preact/signals-core` con el ciclo de actualización de Lit.

### Cómo funciona

```typescript
// src/components/shared/preact-signal-watcher.ts
export function PreactSignalWatcher<T extends Constructor>(Base: T) {
  class SignalLit extends Base {
    private _psDispose?: () => void;

    override performUpdate() {
      this._psDispose?.();           // Limpia tracking anterior
      let isFirst = true;
      this._psDispose = effect(() => {
        if (isFirst) {
          isFirst = false;
          super.performUpdate();     // render() corre dentro del effect → signals quedan tracked
        } else {
          this.requestUpdate();      // Signal cambió → agendá re-render
        }
      });
    }

    override disconnectedCallback() {
      super.disconnectedCallback();
      this._psDispose?.();           // Limpia suscripciones al desmontar
      this._psDispose = undefined;
    }
  }
  return SignalLit as unknown as T;
}
```

**Ciclo:**
1. Lit llama `performUpdate()` → se envuelve en `effect()` de Preact
2. `render()` se ejecuta → cada `signal.value` que se lee queda suscripto
3. Cuando un signal cambia → el `effect` se re-dispara → `requestUpdate()` → nuevo render
4. Al desmontar → `disconnectedCallback()` limpia el effect → cero memory leaks

### Reglas fundamentales

1. **Todo componente que lea signals DEBE extender `PreactSignalWatcher(LitElement)`**.
2. **Leer signals dentro de `render()`**, no en `connectedCallback`. El tracking automático depende de que `.value` se acceda durante el render.
3. **No usar `effect()` manual** en componentes. Para eso existe el mixin. La única razón para un `effect()` manual sería un side effect no-UI (logging, analytics), y debería documentarse.
4. **`@state()` está reservado para estado local** del componente (posición del mouse, estado de un dropdown abierto, filtros de búsqueda local, campos de formulario). Nunca para copiar un signal a `@state` — eso anula el propósito del mixin.
5. **`disconnectedCallback`** es solo para cleanup de recursos propios (intervals, event listeners en `document`). El mixin ya limpia las suscripciones a signals automáticamente.

### Patrón correcto vs incorrecto

```typescript
// ✅ CORRECTO — signal se lee en render(), tracking automático
render() {
  const mats = filteredMaterias.value;
  const data = plannerData.value;
  return html`${mats.map(m => html`<div>${m.nombre}</div>`)}`;
}

// ❌ INCORRECTO — copiar signal a @state (duplica estado, pierde tracking)
@state() private _materias: Materia[] = [];
connectedCallback() {
  super.connectedCallback();
  this._dispose = effect(() => {
    this._materias = filteredMaterias.value;  // NUNCA hacer esto
  });
}
```

---

## 4. Modelo de datos

### Entidades del dominio (`src/state/types.ts`)

```
PlannerData (raíz)
├── materias: Materia[]
│   └── slots: MateriaSlot[]  (día × franja)
├── tipos: TipoTarea[]
├── tareas: Tarea[]
│   └── items: ChecklistItem[]  (subtareas)
├── sesiones: Sesion[]
├── franjas: FranjaDef[]
├── alertas: AlertConfig
└── updatedAt?: string  (ISO 8601, para sync)
```

### Relaciones

```
Materia  ←1:N→  Tarea     (via materiaId)
Materia  ←1:N→  Sesion    (via materiaId)
Tarea    ←1:N→  Sesion    (via tareaId, nullable)
TipoTarea ←1:N→ Tarea     (via tipo = TipoTarea.id)
FranjaDef ←M:N→ Materia   (via MateriaSlot.franjaId)
```

### Convenciones de campos

| Campo | Formato | Ejemplo |
|-------|---------|---------|
| `id` | `crypto.randomUUID()` | `"a1b2c3d4-..."` |
| Fechas (sin hora) | ISO date string | `"2026-04-01"` |
| Fechas (con hora) | ISO datetime **sin Z** (hora local) | `"2026-04-01T14:30:00"` |
| Horas del día | Minutos desde medianoche (`number`) | `480` = 08:00, `1080` = 18:00 |
| Colores | Hex string | `"#4e47b8"` |
| Duración | Minutos enteros (`number`) | `45` |
| Días de la semana | 0=Lun, 1=Mar, ..., 6=Dom | `3` = Jueves |

**`updatedAt`** se estampa automáticamente en `setPlannerData()`. Nunca setear manualmente.

---

## 5. Signal store: la fuente única de verdad

### Anatomía (`src/state/store.ts`)

```typescript
// ── Signals primarios ──
export const appMode   = signal<AppMode>("welcome");
export const plannerData = signal<PlannerData>(loadStoredData());

// ── Computed (derivados) ──
export const materias    = computed(() => plannerData.value.materias);
export const tareas      = computed(() => plannerData.value.tareas);
export const sesiones    = computed(() => plannerData.value.sesiones);
export const alertConfig = computed(() => plannerData.value.alertas);

// ── Filtro global ──
export const globalFilterAnio     = signal<number | null>(null);
export const globalFilterPeriodos = signal<Periodo[]>([]);
export const filteredMaterias  = computed(() => { /* filtra por año/período */ });
export const filteredTareas    = computed(() => { /* solo tareas de materias filtradas */ });
export const filteredSesiones  = computed(() => { /* solo sesiones de materias filtradas */ });
```

### Patrón CRUD (inmutable)

Toda mutación pasa por `setPlannerData()`, que:
1. Estampa `updatedAt`
2. Actualiza el signal `plannerData`
3. Persiste en `localStorage`
4. Agenda auto-save a Drive si está conectado

```typescript
// Ejemplo: agregar tarea
export function addTarea(t: Tarea) {
  const d = plannerData.value;
  setPlannerData({ ...d, tareas: [...d.tareas, t] });
}

// Ejemplo: actualizar materia
export function updateMateria(id: string, patch: Partial<Materia>) {
  const d = plannerData.value;
  setPlannerData({
    ...d,
    materias: d.materias.map(m => m.id === id ? { ...m, ...patch } : m),
  });
}

// Ejemplo: eliminar sesión
export function deleteSesion(id: string) {
  const d = plannerData.value;
  setPlannerData({ ...d, sesiones: d.sesiones.filter(s => s.id !== id) });
}
```

### Regla de oro

> **Ningún componente modifica `plannerData` directamente.**
> Siempre debe usar una función exportada del store (`addTarea`, `updateMateria`, etc.).
> Esto garantiza persistencia automática y consistencia.

---

## 6. Navegación y routing

### Arquitectura

No hay router de URL. La app es SPA client-side con estado de vista en un `@state()` de `app-shell`:

```
app-shell.activeView: ViewId → switch → renderiza el componente correspondiente
```

**ViewIds** (14 rutas):
- **Primarias** (visibles en nav): `hoy`, `semana`, `materias`, `sesiones`, `backlog`, `kanban`, `calendario`
- **Acciones** (botones en header): `config`, `datos`, `ayuda`
- **Internas** (navegación desde otra vista): `task`, `materia-edit`, `materia-stats`, `sesion-edit`

### Patrón de navegación

Los componentes despachan un `CustomEvent<ViewId>` que burbujea hasta `app-shell`:

```typescript
// Desde cualquier vista
this.dispatchEvent(
  new CustomEvent<ViewId>("view-change", {
    detail: "materia-edit",
    bubbles: true,
    composed: true,  // Cruza Shadow DOM
  }),
);
```

`app-shell` escucha con `@view-change` en `<main>` y cambia `activeView`.

### Vistas internas: señales de contexto

Las vistas de edición/detalle necesitan saber *qué* están editando. Se usa signals de navegación:

```typescript
// Abrir edición de materia desde materias-view
editingMateriaId.value = materia.id;
materiaReturnView.value = "materias";  // Adónde volver
this.dispatchEvent(new CustomEvent<ViewId>("view-change", { detail: "materia-edit", ... }));

// Desde materia-edit-view, al finalizar:
editingMateriaId.value = null;
this.dispatchEvent(new CustomEvent<ViewId>("view-change", {
  detail: materiaReturnView.value as ViewId, ...
}));
```

### View Transitions

Si el browser soporta `document.startViewTransition`, se usa. Si no, fallback con CSS `@keyframes viewFadeIn`.

---

## 7. CSS: tokens, temas y densidad

### Tema

Se aplica via `html[data-theme="nombre"]`. Los 5 temas son: **hueso** (default), **claro**, **noche**, **pizarron**, **cafe**.

Cada tema define las mismas custom properties:
- `--bg0` a `--bg3` — 4 niveles de fondo para nesting visual
- `--border`, `--border2` — bordes
- `--text0` a `--text3` — jerarquía tipográfica (0 = más prominente)
- `--accent` — color de marca
- Semánticos: `--{ok|warn|err|info}-{bg|text|border}`
- `--overlay` — backdrop de modales
- `--dark` — flag (0 o 1) para lógica condicional

### Densidad

Se aplica via `html[data-density]`:
- `compacto` → 14px base
- (sin atributo) → 16px base
- `comodo` → 18px base
- `grande` → 20px base

**Todo el sizing usa `rem`**, así que cambiar la densidad escala toda la interfaz proporcionalmente.

### Tokens

```css
/* Espacios (4px base) */
--space-1: 0.25rem    /* 4px  */
--space-4: 1rem       /* 16px */
--space-8: 3rem       /* 48px */

/* Tipografía */
--text-xs: 0.75rem    /* 12px */
--text-sm: 0.8125rem  /* 13px */
--text-base: 0.875rem /* 14px */
--text-xl: 1.25rem    /* 20px */

/* Z-index (nunca usar valores hardcoded) */
--z-dropdown: 100
--z-header: 300
--z-modal: 500
--z-toast: 600
--z-pomo-focus: 900
```

### Reglas de estilo en componentes

1. **CSS va dentro del componente** (`static styles = css\`...\`), aprovechando Shadow DOM encapsulation.
2. **Usar tokens** (`var(--space-4)`, `var(--text-sm)`). Nunca hardcodear `16px`, `#333`, etc.
3. **Responsive con `@media` en `em`**, no en `px`. Breakpoints comunes: `32em`, `48em`, `60em`.
4. **Transiciones**: usar `var(--duration-fast)` y `var(--ease-out)`.
5. **Z-index**: solo variables de tokens. Si necesitás un nuevo layer, agregar al sistema.
6. **Colores semánticos** para estados: `--ok-*` (éxito/verde), `--warn-*` (precaución/amarillo), `--err-*` (error/rojo), `--info-*` (información/azul).

---

## 8. Patrones de componentes

### Anatomía de una vista

```typescript
import { LitElement, css, html, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import { filteredMaterias, plannerData } from "../../state/store.js";
import { PreactSignalWatcher } from "../shared/preact-signal-watcher.js";
import type { ViewId } from "../shell/nav-bar.js";

@customElement("ejemplo-view")
export class EjemploView extends PreactSignalWatcher(LitElement) {
  // Solo estado LOCAL del componente
  @state() private _filterText = "";

  static styles = css`
    :host { display: block; max-width: var(--content-max-width); margin: 0 auto; padding: var(--space-5) var(--space-4); }
    /* ... estilos scoped al componente ... */
  `;

  render() {
    // 1. Leer signals al inicio de render (activa tracking)
    const mats = filteredMaterias.value;
    const data = plannerData.value;

    // 2. Derivaciones locales
    const filtered = mats.filter(m => m.nombre.toLowerCase().includes(this._filterText.toLowerCase()));

    // 3. Template
    return html`
      <div class="hdr">
        <h1 class="hdr-title">Ejemplo</h1>
      </div>
      ${filtered.length === 0
        ? html`<div class="empty">No hay datos</div>`
        : filtered.map(m => html`<div>${m.nombre}</div>`)
      }
    `;
  }

  // Event handlers
  private _onAction(id: string) {
    someStoreAction(id);  // Delegar al store
  }

  private _navigate(view: ViewId) {
    this.dispatchEvent(new CustomEvent<ViewId>("view-change", {
      detail: view, bubbles: true, composed: true,
    }));
  }
}
```

### Vistas de formulario (task-view, materia-edit-view, sesion-edit-view)

Patrón especial con `_initialized` flag:

```typescript
render() {
  if (!this._initialized) {
    const id = editingTaskId.value;
    if (id === "new") {
      // Valores iniciales para creación
    } else if (id) {
      // Cargar datos existentes a @state locales
      const tarea = plannerData.value.tareas.find(t => t.id === id);
      if (tarea) { this.titulo = tarea.titulo; /* ... */ }
    }
    this._initialized = true;
  }
  return html`...formulario...`;
}
```

**Por qué:** El formulario necesita estado local editable (el usuario tipea). Se copia una vez desde el signal y luego el formulario es independiente hasta que el usuario guarda.

### Vistas de configuración tab-based (config-tab-alertas)

Patrón para tabs que se recrean al navegar:

```typescript
override connectedCallback() {
  super.connectedCallback();
  // Cargar valores del signal una vez al montar
  const cfg = alertConfig.value;
  this._rojo = cfg.rojo;
  this._amarillo = cfg.amarillo;
}
```

Sin `effect()`, sin `_dispose`. El tab se destruye y recrea al cambiar de tab.

---

## 9. Pomodoro: timer basado en timestamps

El timer **no** usa `setInterval` para contar segundos. Usa timestamps:

```
studyStart = Date.now()     ← momento de inicio/resume
studyAccum = 0              ← segundos acumulados de sesiones previas (pause/resume)
```

Cada tick (500ms) recalcula: `studyAccum + (Date.now() - studyStart) / 1000`

**Por qué timestamps:** los browsers throttlean `setInterval` en tabs inactivas. Con timestamps, al volver a la tab los segundos son correctos.

### Lifecycle del timer

```
pomoStart(session) → activa tick → pomoStudySecs se actualiza cada 500ms
  ↓
pomoPause()        → guarda acumulado, pausa tick, empieza pauseTimer
  ↓
pomoResume()       → nuevo timestamp, resume tick
  ↓
pomoStop()         → redondea minutos, crea Sesion, limpia todo
pomoCancel()       → limpia todo sin crear sesión
```

---

## 10. Google Drive: flujo de sincronización

### Conexión

1. GIS (Google Identity Services) se carga via `<script>` en `index.html`
2. `driveConnect()` → `initTokenClient()` → prompt OAuth2
3. Token se almacena en memoria (no localStorage por seguridad)
4. `driveConnected.value = true`

### Auto-save

Cada `setPlannerData()` agenda un debounce de 4 segundos. Si hay cambios pendientes:
1. `syncStatus.value = "saving"`
2. Upload via Drive API v3 (multipart: metadata + JSON body)
3. `syncStatus.value = "saved"` o `"error"`

### Conflictos

Si al cargar desde Drive, `updatedAt` remoto es más nuevo que local → `driveConflictData` signal se activa → UI muestra modal de conflicto (elegir local vs remoto).

### Normalización defensiva

Al importar datos (desde JSON, Drive, URL), se normaliza con `normalize()` que:
- Asigna `crypto.randomUUID()` a IDs faltantes
- Defaults para campos missing
- Valida enums (`estado`, `prioridad`, `origen`)
- Garantiza arrays (no `undefined`)

---

## 11. Lógica de dominio

### Alertas (`domain/alert-engine.ts`)

Funciones puras que calculan el nivel de alerta de una tarea:

```typescript
computeAlertLevel(tarea, config, today?) → AlertLevel | null
getAlertInfo(level) → { label, emoji, cssClass }
```

**Solo aplica a tareas `obligatorio: true` y no completadas.** Prioridad:
1. `overdue` — fecha límite pasada
2. `start_overdue` — fecha inicio pasada (solo pendientes)
3. `start_now` — fecha inicio = hoy
4. `red` — ≤ N días a fecha límite
5. `start_soon` — ≤ N días a fecha inicio
6. `yellow`, `green` — umbrales progresivos

### Migración de slots (`domain/slot-migration.ts`)

Cuando el usuario cambia la estructura de franjas horarias (de 3 a 6, o modifica horarios), las materias que tenían slots asignados necesitan re-mapearse:

```
oldFranja "Matutino" (8:00–12:00) → split en "Mañana temprano" (8:00–10:00) + "Mañana" (10:00–12:00)
→ Materia con slot Lunes/Matutino → ahora tiene Lunes/Mañana-temprano + Lunes/Mañana
```

El algoritmo busca overlap de intervalos. Si no hay overlap, busca la franja nueva más cercana por punto medio.

---

## 12. Scripts y workflow

```bash
npm run dev          # Vite dev server (auto-open browser)
npm run build        # tsc + vite build (producción)
npm run typecheck    # Solo verificar tipos (sin emitir)
npm run lint         # Biome check (errores)
npm run lint:fix     # Biome auto-fix
```

### Checklist antes de commit

1. `npm run typecheck` → sin errores
2. `npm run lint` → sin errores
3. `npm run build` → build exitoso
4. Test manual de la funcionalidad tocada

### Convenciones de código

- **Imports**: Lit primero, luego state, luego domain, luego componentes. `type` imports separados.
- **Nombres de archivo**: kebab-case, sufijo `-view.ts` para vistas, `-tab-` para tabs de config.
- **Custom elements**: `kebab-case` tag names, sin prefijo.
- **Indentación**: 2 espacios (Biome).
- **Line width**: 100 caracteres.
- **IDs**: `crypto.randomUUID()`. Nunca secuenciales, nunca timestamps.
- **Const por defecto**: `let` solo cuando se reasigna. Biome lo enforcea.
- **Template literals**: para interpolación. Single quotes para strings simples.

---

## 13. Reglas de nuevo desarrollo

### Agregar una vista nueva

1. Crear `src/components/views/nueva-view.ts`
2. Extender `PreactSignalWatcher(LitElement)`
3. Leer signals en `render()`, no en `connectedCallback()`
4. Agregar el `ViewId` al type en `nav-bar.ts`
5. Agregar el case en `app-shell._renderView()`
6. Si aparece en nav: agregar a `NAV_ITEMS` en `nav-bar.ts`
7. Agregar el import en `app-shell.ts`

### Agregar un campo al modelo

1. Agregar al interface en `types.ts` (con `?` si es opcional para backward compat)
2. Actualizar `emptyData()` en `defaults.ts` si tiene default
3. Actualizar `normalize()` en `datos-view.ts` si se importa/exporta
4. Actualizar `buildDemoData()` en `demo-data.ts`
5. Actualizar vistas que muestran el dato

### Agregar estado global

1. Agregar signal en `store.ts` o `navigation.ts`
2. Si es derivado → `computed()`
3. Si necesita persistencia → integrarlo en `setPlannerData()`
4. **Nunca** crear un signal en un componente a menos que sea realmente local a ese componente

### Agregar un tema

1. Agregar bloque `[data-theme="nombre"]` en `themes.css`
2. Definir **todas** las variables: `--bg0..3`, `--border`, `--border2`, `--text0..3`, `--accent`, `--overlay`, `--dark`, todos los semánticos (`--ok-*`, `--warn-*`, etc.)
3. Agregar opción en `config-tab-tema.ts`

---

## 14. Antipatrones: qué nunca hacer

| Antipatrón | Por qué es malo | Qué hacer en cambio |
|------------|-----------------|---------------------|
| Copiar signal a `@state` con `effect()` | Duplica estado, rompe tracking del mixin | Leer `.value` directo en `render()` |
| `effect()` manual en componentes | Memory leak si no se limpia, innecesario con el mixin | Confiar en `PreactSignalWatcher` |
| Escribir a `localStorage` desde componentes | Bypass de persistencia centralizada | Usar funciones del store |
| Hardcodear colores/px | Se rompe con temas/densidad | Usar `var(--token)` y `rem` |
| Import circular entre componentes | Build warnings, posible crash | Componentes → state/ → domain/ (DAG estricto) |
| Lógica de negocio en componentes | Imposible de reutilizar/testear | Mover a `domain/` como función pura |
| `document.querySelector` | Viola encapsulación Shadow DOM | Usar refs de Lit (`@query`) o eventos |
| `innerHTML` o `unsafeHTML` sin sanitizar | XSS | Usar solo `lit-html` templates |
| Nuevas dependencias sin justificación | Infla bundle, más superficie de ataque | Código propio si < 50 líneas |
| Z-index hardcoded | Conflictos de stacking | Usar `var(--z-*)` de tokens |

---

## 15. Diagrama de dependencias

```
index.html
  └── app.ts
        └── app-shell.ts
              ├── nav-bar.ts ← global-filter.ts
              ├── onboarding-flow.ts
              ├── pomo-widget.ts
              ├── pomo-focus-view.ts
              └── views/*-view.ts
                    ↓ (importan)
              state/store.ts ← state/navigation.ts
                    ↓              ↓
              state/types.ts   state/pomo.ts
              state/defaults.ts
              state/demo-data.ts
              state/gdrive.ts
                    ↓
              domain/alert-engine.ts
              domain/slot-migration.ts
```

**Flujo de dependencias (DAG):**
```
componentes → state → domain → (nada)
                ↓
            styles (CSS custom properties, no imports)
```

Los componentes **nunca** importan otros componentes de views (excepto `app-shell` que los renderiza). La comunicación entre vistas es siempre via signals + eventos.

---

## 16. Persistencia

| Key localStorage | Contenido | Quién lo escribe |
|-----------------|-----------|-----------------|
| `oda-data-v1` | `PlannerData` completo (JSON) | `setPlannerData()` en store.ts |
| `oda-mode` | `AppMode` (`"welcome"`, `"local"`, `"drive"`) | `setAppMode()` en store.ts |
| `oda-theme` | Nombre del tema (`"hueso"`, etc.) | config-tab-tema.ts |
| `oda-density` | Preset de densidad | config-tab-tema.ts |
| `oda-drive-fileid` | ID del archivo en Google Drive | gdrive.ts |

**Migración:** `loadStoredData()` y `migrateStoredData()` en store.ts se encargan de normalizar datos viejos. Si agregás campos nuevos, asegurate de que datos sin el campo no rompan.

---

*Última actualización: Abril 2026*
