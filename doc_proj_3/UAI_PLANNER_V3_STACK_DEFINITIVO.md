# UAI Planner v3.0 — Stack Definitivo y Enfoque de Desarrollo

Fecha: 2025-07-21  
Decisión: **Libertad con estándares** — Lit + TypeScript + CSS puro + GSAP + Signals  
Prerequisitos: `UAI_PLANNER_V3_GUIA_DE_EXPERIENCIA.md` y `UAI_PLANNER_V3_STACK_TECNOLOGICO.md`

---

## Índice

1. [La decisión y por qué](#1-la-decisión-y-por-qué)
2. [Stack técnico definitivo](#2-stack-técnico-definitivo)
3. [Filosofía: estética primero, cáscara vacía](#3-filosofía-estética-primero-cáscara-vacía)
4. [Estructura del proyecto](#4-estructura-del-proyecto)
5. [Anatomía de un componente](#5-anatomía-de-un-componente)
6. [Sistema de estilos](#6-sistema-de-estilos)
7. [Sistema de temas](#7-sistema-de-temas)
8. [Animaciones y transiciones](#8-animaciones-y-transiciones)
9. [Estado y reactividad](#9-estado-y-reactividad)
10. [Metodología de desarrollo](#10-metodología-de-desarrollo)
11. [Fases de construcción](#11-fases-de-construcción)
12. [Testing](#12-testing)
13. [Reglas inquebrantables](#13-reglas-inquebrantables)

---

## 1. La decisión y por qué

### Lo que elegimos

**Lit + TypeScript + CSS puro + GSAP + @preact/signals-core + Vite**

Esencialmente: la v1.0 con módulos, tipos y estructura.

### Por qué esta combinación

La v1.0 (10.578 líneas de HTML/CSS/JS en un archivo) tenía la mejor estética de las tres versiones del proyecto. No por accidente — sino porque no había abstracciones entre el desarrollador y el CSS. No había `className` vs `class`. No había CSS Modules convirtiendo `.button` en `.button_abc123`. No había Virtual DOM entre la intención y el DOM real.

La v2.0 (React + TypeScript + Zustand + CSS Modules) demostró que construir funcionalidad primero y estética después no funciona para productos de usuario. 34 fases de desarrollo, 7 fases estéticas dedicadas, y la paridad visual contra la v1.0 se estancó en 1.72/3.

La conclusión es clara: **necesitamos la cercanía al CSS de la v1.0 con la estructura de la v2.0.** Lit nos da exactamente eso.

### Lo que descartamos y por qué

| Descartado | Motivo |
|-----------|--------|
| React 19 | El Virtual DOM, la separación CSS/JSX y la complejidad de hooks (`useMemo`, `useCallback`, `useEffect`) agregan capas entre nosotros y el resultado visual. shadcn/ui es excelente pero es estética prestada, no propia. |
| Svelte 5 | Excelente co-locación, pero es un framework que cambia entre majors (stores → runes). Si Svelte 6 cambia otra vez, volvemos al mismo problema. Web Components son W3C — no cambian. |
| Vue 3 | Buena co-locación, sin ventajas decisivas sobre Lit. Más pesado (~33KB vs ~5.8KB). |
| Tailwind CSS | Utility classes producen HTML verboso y una estética reconocible "Tailwind look". Queremos personalidad propia. |

### Los números

| Pieza | Tamaño gzip | Rol |
|-------|-------------|-----|
| **Lit** | 5.8 KB | Componentes, templates, styles scoped, reactividad local |
| **@preact/signals-core** | 1.9 KB | Estado global reactivo (stores) |
| **GSAP core** | 25 KB | Animaciones premium (onboarding, pomodoro, transiciones) |
| **date-fns** (tree-shaked) | ~5 KB | Manejo de fechas |
| **Total de "framework"** | **~38 KB** | vs ~100KB de React + Motion + deps |

---

## 2. Stack técnico definitivo

### Core

| Capa | Tecnología | Versión | Justificación |
|------|-----------|---------|---------------|
| **Componentes** | Lit | 3.x | Web Components estándar W3C + templates declarativos + estilos scoped. ~5.8KB. Co-locación natural de HTML/CSS/TS. |
| **Lenguaje** | TypeScript | 5.x | Tipos eliminan bugs silenciosos. Decoradores nativos para Lit (`@customElement`, `@property`, `@state`). No negociable. |
| **Estilos** | CSS puro | Nativo | Custom Properties para temas. Nesting nativo. `@scope` para scoping sin Shadow DOM cuando convenga. Cero abstracciones. |
| **Animaciones** | GSAP | 3.x | Imperativo, framework-agnostic. ScrollTrigger, SplitText, Flip, Draggable. El estándar de la industria para animaciones web premium. |
| **Estado global** | @preact/signals-core | 1.x | signal(), computed(), effect(), batch(). 1.9KB, standalone, zero deps. TC39 Stage 1 — camino a ser nativo. |
| **Estado local** | Lit reactive properties | built-in | `@state()` para estado interno del componente. `@property()` para atributos públicos. |
| **Bundler** | Vite | 5.x | HMR instantáneo, tree-shaking, build optimizado. Probado en v2.0. |
| **Fechas** | date-fns | 3.x | Tree-shakeable, inmutable, funcional. Solo importamos lo que usamos. |

### APIs nativas del navegador (sin polyfills)

| API | Soporte | Reemplaza |
|-----|---------|-----------|
| Custom Elements v1 | 97% | React components, Angular directives |
| Shadow DOM v1 | 97% | CSS Modules, styled-components (scoping) |
| `<dialog>` element | 97% | Libraries de modales, focus trap manual |
| Popover API | 89% | Tippy.js, tooltips libraries |
| View Transitions API | 91% | Framer Motion AnimatePresence, page transitions |
| CSS Nesting | 95% | Sass/SCSS |
| CSS `:has()` | 95% | JS condicional para estilos padre |
| CSS `@scope` | 89% | CSS-in-JS scoping |

### Tooling

| Herramienta | Uso |
|-------------|-----|
| **Biome** | Linting + formatting unificado (reemplaza ESLint + Prettier). Más rápido, un solo tool. |
| **Vitest** | Unit testing + integration testing |
| **@open-wc/testing** | Testing de Web Components (compatible con Vitest) |
| **Playwright** | E2E + visual regression + accesibilidad (axe-playwright) |
| **Storybook** | Desarrollo visual aislado de componentes (Storybook 8 soporta Web Components) |

### Componentes UI de terceros (si necesitamos)

| Library | Uso |
|---------|-----|
| **Shoelace / Web Awesome** | 50+ componentes Web Components con a11y. Para los que no queramos construir desde cero (ej: date picker, color picker). |
| **@open-wc** | Patterns y herramientas para Web Components. |

---

## 3. Filosofía: estética primero, cáscara vacía

### El concepto central

> Empezar por una cáscara vacía estética nos da desde el primer commit la sensación de ir por el camino correcto.

En v2.0 empezamos por la función: stores, reducers, lógica de dominio, y después le pusimos cara. Cada componente era funcional-pero-feo durante semanas. Cuando llegó la fase estética, ya era demasiado tarde — los layouts estaban cristalizados.

En v3.0 invertimos el orden:

1. **Primero la cáscara**: un shell vacío que se ve como producto terminado. NavBar, layout, temas, tipografía, spacing. Sin funcionalidad. Solo estética.
2. **Después las vistas vacías**: cada vista se diseña y estiliza con datos mock. Si la vista no se ve bien con datos fake, no se ve bien con datos reales.
3. **Después la funcionalidad**: la lógica de dominio se conecta a componentes que ya se ven bien. El store, el reducer, las señales — todo se inyecta en una UI que ya tiene personalidad.

### Por qué funciona

- **Feedback visual inmediato**: desde el día 1 la app se ve como producto. Esto motiva y guía las decisiones.
- **Los layouts se definen antes de la complejidad**: cuando hay datos reales, los layouts ya están definidos y probados.
- **La estética no es una fase separada**: cada componente nace estéticamente completo. No hay deuda visual.
- **Los budgets visuales se respetan**: el header mide 56px desde el primer commit. No crece a 350px porque "necesitamos poner más cosas".

### Lo que NO significa

- **No significa** que no haya código limpio. La cáscara vacía tiene tipos, estructura, y buenas prácticas.
- **No significa** que la funcionalidad sea un ciudadano de segunda. Significa que la UI dicta las restricciones, y la funcionalidad las respeta.
- **No significa** que no se pueda iterar. Significa que cada iteración mantiene el estándar estético.

---

## 4. Estructura del proyecto

```
UAI-Planner/
├── doc_proj/                    # Documentación v2.0 (referencia histórica)
├── doc_proj_3/                  # Documentación v3.0 (guías, specs, este doc)
├── public/                      # Assets estáticos (favicon, manifest)
├── src/
│   ├── app.ts                   # Entry point, registro de componentes
│   ├── components/
│   │   ├── shell/               # Layout principal
│   │   │   ├── app-shell.ts     # <app-shell> — layout grid principal
│   │   │   ├── nav-bar.ts       # <nav-bar> — navegación 56px
│   │   │   └── chrome-shell.ts  # <chrome-shell> — frame exterior
│   │   ├── views/               # Vistas principales
│   │   │   ├── hoy-view.ts      # <hoy-view>
│   │   │   ├── semana-view.ts   # <semana-view>
│   │   │   ├── materias-view.ts # <materias-view>
│   │   │   ├── backlog-view.ts  # <backlog-view>
│   │   │   ├── kanban-view.ts   # <kanban-view>
│   │   │   └── calendar-view.ts # <calendar-view>
│   │   ├── tasks/               # Modales y forms de tareas
│   │   ├── settings/            # Configuración
│   │   ├── pomodoro/            # Módulo pomodoro
│   │   ├── onboarding/          # Flujo de bienvenida
│   │   └── shared/              # Componentes reutilizables
│   ├── state/                   # Estado global con signals
│   │   ├── planner.state.ts     # Signal store del planner
│   │   ├── ui.state.ts          # Signal store de UI
│   │   ├── pomo.state.ts        # Signal store de pomodoro
│   │   └── drive.state.ts       # Signal store de Drive
│   ├── domain/                  # Lógica de dominio pura (TS puro, sin UI)
│   │   ├── planner/
│   │   │   ├── reducer.ts       # Mutaciones de datos (portado de v2.0)
│   │   │   ├── selectors.ts     # Datos derivados (portado de v2.0)
│   │   │   ├── service.ts       # Fachada de acciones (portado de v2.0)
│   │   │   └── types.ts         # Tipos del dominio (portado de v2.0)
│   │   ├── schedule/
│   │   │   ├── franjas.ts       # Franjas horarias (portado de v2.0)
│   │   │   └── timezone.ts      # Timezone (portado de v2.0)
│   │   ├── alerts/
│   │   │   └── alertEngine.ts   # Motor de alertas (portado de v2.0)
│   │   └── import-export/
│   │       ├── export.ts        # Export JSON (portado de v2.0)
│   │       └── normalizer.ts    # Normalización de import (portado de v2.0)
│   ├── styles/
│   │   ├── reset.css            # Reset base
│   │   ├── tokens.css           # Design tokens (spacing, typography, colors)
│   │   ├── themes.css           # Definiciones de temas (5+ temas)
│   │   └── global.css           # Estilos globales mínimos
│   └── utils/
│       ├── dateUtils.ts         # Utilidades de fechas (portado de v2.0)
│       └── cn.ts                # Class name helper
├── stories/                     # Storybook stories (desarrollo visual aislado)
├── tests/
│   ├── unit/                    # Tests unitarios (domain, state)
│   ├── integration/             # Tests de integración
│   ├── visual/                  # Visual regression (Playwright screenshots)
│   └── a11y/                    # Tests de accesibilidad
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── biome.json
└── .gitignore
```

### Convenciones de archivos

| Tipo | Nombre | Ejemplo |
|------|--------|---------|
| Componente Lit | `kebab-case.ts` | `nav-bar.ts`, `hoy-view.ts` |
| Custom element tag | `kebab-case` con prefijo `uai-` para ambiguos | `<nav-bar>`, `<hoy-view>`, `<uai-task-card>` |
| State store | `kebab-case.state.ts` | `planner.state.ts` |
| Domain logic | `camelCase.ts` (herencia v2.0) | `reducer.ts`, `selectors.ts` |
| Tests | `nombre.test.ts` | `planner.state.test.ts` |
| Storybook | `nombre.stories.ts` | `nav-bar.stories.ts` |

---

## 5. Anatomía de un componente

### Componente típico de v3.0

```typescript
import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { gsap } from 'gsap';

@customElement('hero-clock')
export class HeroClock extends LitElement {
  // --- Estado local ---
  @state() private time = new Date();
  @state() private franja = 'noche';
  private timer?: ReturnType<typeof setInterval>;

  // --- Estilos co-locados ---
  // CSS puro, custom properties para temas, scoped automáticamente
  static styles = css`
    :host {
      display: block;
      text-align: center;
      padding: var(--space-6) var(--space-4);
    }

    .clock {
      font-size: var(--text-5xl);
      font-family: var(--font-mono);
      font-weight: 700;
      color: var(--text1);
      letter-spacing: -0.02em;
    }

    .franja {
      font-size: var(--text-sm);
      color: var(--text2);
      margin-top: var(--space-2);
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .franja-emoji {
      font-size: var(--text-lg);
    }
  `;

  // --- Lifecycle ---
  connectedCallback() {
    super.connectedCallback();
    this.timer = setInterval(() => {
      this.time = new Date();
    }, 60_000);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.timer) clearInterval(this.timer);
  }

  firstUpdated() {
    // Animación de entrada con GSAP
    const clock = this.renderRoot.querySelector('.clock');
    if (clock) {
      gsap.from(clock, {
        opacity: 0,
        y: -20,
        duration: 0.6,
        ease: 'power2.out'
      });
    }
  }

  // --- Template declarativo ---
  render() {
    return html`
      <time class="clock">${this.time.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit'
      })}</time>
      <p class="franja">
        <span class="franja-emoji">🌙</span>
        ${this.franja}
      </p>
    `;
  }
}
```

### Lo que hay que notar

1. **Un archivo = un componente**: HTML (template), CSS (static styles) y TypeScript (lógica) — todo junto. Como la v1.0, pero tipado y modular.
2. **CSS puro**: No hay `className`, no hay CSS Modules hash, no hay Tailwind classes. Es CSS real con custom properties para temas.
3. **Estilos scoped automáticamente**: Shadow DOM de Lit aisla los estilos. `.clock` en este componente no colisiona con `.clock` en otro.
4. **GSAP directo**: Sin wrappers, sin hooks, sin adapters. `gsap.from(element, {...})` — imperativo, predecible, potente.
5. **Custom properties**: `var(--text1)`, `var(--space-6)`, `var(--font-mono)` — los temas se aplican automáticamente. Cambiar el tema cambia todo.
6. **Limpieza de recursos**: `disconnectedCallback` limpia el interval. Web Components lifecycle es explícito.

---

## 6. Sistema de estilos

### Principio fundamental

> Cero abstracciones entre nosotros y el CSS. El CSS moderno (2025+) no necesita preprocesadores ni tooling extra.

### CSS Nativo que usamos

```css
/* Nesting nativo — no necesitamos Sass */
.card {
  background: var(--surface2);
  border-radius: var(--radius-card);

  & .title {
    font-weight: 600;
    color: var(--text1);
  }

  &:hover {
    box-shadow: var(--shadow-card-hover);
  }

  &[data-urgent] {
    border-left: 3px solid var(--danger);
  }
}

/* :has() — padre reacciona al hijo sin JS */
.task-row:has(input:checked) {
  opacity: 0.6;
  text-decoration: line-through;
}

/* @scope — scoping sin Shadow DOM cuando convenga */
@scope (.settings-panel) {
  .label { font-size: var(--text-sm); }
  .input { border: 1px solid var(--border); }
}
```

### Design tokens (tokens.css)

```css
:root {
  /* Spacing — escala consistente */
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.5rem;    /* 24px */
  --space-6: 2rem;      /* 32px */
  --space-8: 3rem;      /* 48px */
  --space-10: 4rem;     /* 64px */

  /* Typography */
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  --text-4xl: 2.25rem;
  --text-5xl: 3rem;

  /* Radius */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-full: 9999px;

  /* Shadows — definidas por tema */
  /* Z-index scale */
  --z-base: 0;
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-modal-backdrop: 300;
  --z-modal: 400;
  --z-toast: 500;
  --z-tooltip: 600;

  /* Transitions */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 400ms;

  /* Layout budgets — restricciones no sugerencias */
  --header-height: 56px;
  --sidebar-width: 240px;
  --modal-max-width: 560px;
  --content-max-width: 1200px;
}
```

### Cómo entran los estilos al componente

Los estilos del componente van en `static styles` (scoped por Shadow DOM). Los tokens globales (`--space-4`, `--text1`, etc.) se definen en `:root` y se heredan a través del Shadow DOM — **las custom properties SÍ cruzan el Shadow DOM**.

Esto significa:
- Tokens y temas → CSS global (`:root`, `[data-theme]`)
- Estilos del componente → `static styles` en Lit (scoped)
- El componente usa tokens globales via `var(--token)` pero sus clases no colisionan con nada externo.

---

## 7. Sistema de temas

### Herencia de v2.0 (funcional)

La v2.0 ya tenía 5 temas con custom properties. Eso se preserva y se mejora:

```css
/* themes.css */
[data-theme="oscuro"] {
  --bg1: #0f0f0f;
  --bg2: #1a1a1a;
  --surface1: #1e1e1e;
  --surface2: #252525;
  --surface3: #2e2e2e;
  --text1: #f5f5f5;
  --text2: #a0a0a0;
  --text3: #666;
  --border: #333;
  --accent: #7c5cfc;
  --accent-hover: #9178ff;
  --danger: #ff4d4d;
  --success: #4caf50;
  --warning: #ffa726;
  --shadow-card: 0 2px 8px rgba(0, 0, 0, 0.3);
  --shadow-card-hover: 0 4px 16px rgba(0, 0, 0, 0.4);
  --radius-card: 12px;
}

[data-theme="claro"] {
  --bg1: #f8f8f8;
  --bg2: #ffffff;
  --surface1: #ffffff;
  --surface2: #f3f3f3;
  --surface3: #e8e8e8;
  --text1: #1a1a1a;
  --text2: #666;
  --text3: #999;
  --border: #e0e0e0;
  --accent: #6c47ff;
  --accent-hover: #5a35e0;
  --danger: #e53935;
  --success: #43a047;
  --warning: #fb8c00;
  --shadow-card: 0 1px 4px rgba(0, 0, 0, 0.08);
  --shadow-card-hover: 0 2px 8px rgba(0, 0, 0, 0.12);
  --radius-card: 12px;
}

/* Más temas: neón, pastel, alto-contraste... */
```

### Personalidad por tema

Cada tema no solo cambia colores — cambia personalidad:
- **Oscuro**: Profesional, developer-vibe. Sombras profundas.
- **Claro**: Limpio, paper-like. Sombras sutiles.
- **Neón**: Cyberpunk. Glows, borders vibrantes, radius más agresivos.
- **Pastel**: Suave, relajado. Radius más grandes, sombras mínimas.
- **Alto contraste**: Accesibilidad máxima. Borders nítidos, sin sombras.

### Cambio de tema

```typescript
// Cambiar tema — un solo atributo en el <html>
document.documentElement.dataset.theme = 'neon';
// Eso es todo. Todas las custom properties cambian instantáneamente.
// Los componentes Lit se actualizan automáticamente porque usan var().
```

---

## 8. Animaciones y transiciones

### Estrategia de dos capas

| Capa | Herramienta | Uso |
|------|-------------|-----|
| **Cotidiana** | CSS Transitions + View Transitions API | Hovers, transiciones de vista, micro-interacciones. 0KB de overhead. |
| **Premium** | GSAP | Onboarding teatral, timer pomodoro dramático, transiciones complejas, SplitText, morphing. |

### CSS para lo cotidiano

```css
/* Hover en card — CSS puro */
.materia-card {
  transition: transform var(--duration-fast) var(--ease-out),
              box-shadow var(--duration-fast) var(--ease-out);

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-card-hover);
  }
}

/* View Transitions API para cambiar de vista */
::view-transition-old(main-content) {
  animation: fade-out 200ms ease-out;
}
::view-transition-new(main-content) {
  animation: fade-in 200ms ease-in;
}
```

### GSAP para lo premium

```typescript
// Onboarding teatral — entrada escalonada
const tl = gsap.timeline();
tl.from('.onboarding-title', { opacity: 0, y: 40, duration: 0.8, ease: 'power3.out' })
  .from('.onboarding-subtitle', { opacity: 0, y: 20, duration: 0.5 }, '-=0.3')
  .from('.onboarding-cards', { opacity: 0, scale: 0.95, stagger: 0.1, duration: 0.4 }, '-=0.2')
  .from('.onboarding-cta', { opacity: 0, y: 10, duration: 0.3 });

// Pomodoro — timer dramático
gsap.to('.pomo-ring', {
  strokeDashoffset: 0,
  duration: pomoDuration,
  ease: 'none',
  onComplete: () => {
    gsap.to('.pomo-ring', { stroke: 'var(--success)', duration: 0.3 });
    gsap.from('.pomo-done', { scale: 0, duration: 0.5, ease: 'back.out(2)' });
  }
});
```

### Plugins GSAP que usaremos

| Plugin | Uso | Costo |
|--------|-----|-------|
| **ScrollTrigger** | Animaciones ligadas al scroll (si hay listas largas) | Gratis |
| **SplitText** | Animación letra por letra en onboarding | Gratis (desde 2024) |
| **Flip** | Transiciones de layout (reordenar Kanban, mover tareas) | Gratis |
| **Draggable** | Drag & drop en Semana, Kanban | Gratis |

---

## 9. Estado y reactividad

### Dos niveles de estado

| Nivel | Herramienta | Ejemplo |
|-------|-------------|---------|
| **Local** (dentro del componente) | Lit `@state()` | Timer del reloj, toggle de un dropdown, input temporal |
| **Global** (compartido entre componentes) | @preact/signals-core | Lista de tareas, usuario actual, tema activo, estado del pomodoro |

### Signal stores (portando la filosofía de v2.0)

```typescript
// planner.state.ts
import { signal, computed, batch } from '@preact/signals-core';
import type { PlannerData, Task, Materia } from '../domain/planner/types';
import { plannerReducer, type PlannerAction } from '../domain/planner/reducer';

// Estado raíz — un solo signal con toda la data del planner
const plannerData = signal<PlannerData>(loadInitialData());

// Selectores — computed derivados (portados de selectors.ts de v2.0)
export const tareas = computed(() => plannerData.value.tareas);
export const materias = computed(() => plannerData.value.materias);
export const tareasHoy = computed(() =>
  plannerData.value.tareas.filter(t => isToday(t.fechaVencimiento))
);
export const tareasUrgentes = computed(() =>
  plannerData.value.tareas.filter(t => t.prioridad === 'alta' && !t.completada)
);

// Dispatch — usa el reducer puro de v2.0 (sin cambios)
export function dispatch(action: PlannerAction) {
  plannerData.value = plannerReducer(plannerData.value, action);
  persistToLocalStorage(plannerData.value);
}

// Service layer — fachada semántica (portada de service.ts de v2.0)
export function agregarTarea(tarea: Omit<Task, 'id'>) {
  dispatch({ type: 'ADD_TASK', payload: tarea });
}

export function completarTarea(id: string) {
  dispatch({ type: 'TOGGLE_TASK', payload: id });
}
```

### Conectar signals con Lit

```typescript
import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { SignalWatcher } from '@lit-labs/signals'; // adaptador oficial Lit ↔ signals
import { tareasHoy } from '../state/planner.state';

@customElement('tareas-hoy')
export class TareasHoy extends SignalWatcher(LitElement) {
  render() {
    // El componente se re-renderiza automáticamente cuando tareasHoy cambia
    return html`
      <ul>
        ${tareasHoy.value.map(t => html`
          <li class="tarea">${t.titulo}</li>
        `)}
      </ul>
    `;
  }
}
```

### Lo que se porta directamente de v2.0

La lógica de dominio es TypeScript puro — se copia sin ningún cambio:

| Archivo v2.0 | Destino v3.0 | Cambios |
|---------------|-------------|---------|
| `domains/planner/reducer.ts` | `domain/planner/reducer.ts` | Ninguno |
| `domains/planner/selectors.ts` | `domain/planner/selectors.ts` | Ninguno |
| `domains/planner/service.ts` | Integrado en `state/planner.state.ts` | Adaptar de Zustand a signals |
| `domains/planner/types.ts` | `domain/planner/types.ts` | Ninguno |
| `domains/schedule/franjas.ts` | `domain/schedule/franjas.ts` | Ninguno |
| `domains/schedule/timezone.ts` | `domain/schedule/timezone.ts` | Ninguno |
| `domains/alerts/alertEngine.ts` | `domain/alerts/alertEngine.ts` | Ninguno |
| `domains/import-export/*.ts` | `domain/import-export/*.ts` | Ninguno |

---

## 10. Metodología de desarrollo

### El ciclo: Shell → Vista → Funcionalidad

Cada módulo se construye en 3 fases:

#### Fase A: Shell estético (cáscara vacía)
- Crear el componente Lit con template y estilos.
- Usar datos mock hardcodeados.
- Verificar: ¿se ve como producto? ¿El spacing es correcto? ¿Los temas funcionan?
- Verificar contra la v1.0 (north star).
- **Criterio para pasar**: se ve bien en los 5 temas con datos mock.

#### Fase B: Interactividad visual
- Agregar animaciones (GSAP / CSS transitions).
- Agregar hover states, focus states, active states.
- Agregar responsive behavior.
- **Criterio para pasar**: la interacción se siente premium. Las animaciones son fluidas.

#### Fase C: Conectar funcionalidad
- Conectar al signal store.
- Reemplazar datos mock con datos reales.
- Agregar lógica de dominio.
- **Criterio para pasar**: funciona correctamente Y mantiene la estética de las fases A y B.

### Storybook como gate

Cada componente se desarrolla PRIMERO en Storybook:
- Story con datos vacíos (estado vacío con CTA).
- Story con datos mínimos (1-2 items).
- Story con datos completos (10+ items).
- Story en cada tema (oscuro, claro, neón, pastel, alto contraste).

Si el componente no se ve bien en Storybook con datos mock, NO se integra en la app.

### Revisión visual continua

Cada PR / cada commit de componente se evalúa contra:
1. ¿Se ve bien en los 5 temas?
2. ¿Cumple con los budgets visuales (header 56px, etc.)?
3. ¿Un protagonista por vista?
4. ¿La animación es fluida y con propósito?
5. ¿Comparado con la v1.0, es igual o mejor?

---

## 11. Fases de construcción

### Fase 0: Setup y cáscara global (el gran momento)

**Objetivo**: La app se abre y ya se siente como producto. Sin funcionalidad.

1. **Setup técnico**: package.json, Vite, TypeScript, Lit, Biome, Storybook.
2. **tokens.css**: Todos los design tokens (spacing, typography, colors base, z-index).
3. **themes.css**: Los 5 temas completos con todas las custom properties.
4. **reset.css + global.css**: Reset base y estilos globales.
5. **`<chrome-shell>`**: Frame exterior de la app. Background, min-height, contenedor.
6. **`<nav-bar>`**: Barra de navegación de 56px. Iconos con letra (H, S, M, B, K, C), nombre de la app con glifo ◈, selector de tema. Todo clickeable pero sin routing real.
7. **`<app-shell>`**: Layout grid principal (nav + content area). Transiciones entre vistas (View Transitions API).
8. **Vistas placeholder**: 6 vistas vacías (`<hoy-view>`, `<semana-view>`, etc.) con un mensaje centrado "Vista en construcción 🔨". Clickear en el nav cambia de vista.

**Resultado**: Una app que se abre, tiene nav funcional, temas que cambian, y se ve profesional. Cero lógica de dominio.

### Fase 1: Las dos experiencias emocionales (Principio 6)

**Onboarding** — El primer contacto con la app:
- Pantallas de propuesta de valor con animaciones GSAP (SplitText, staggers).
- Transiciones entre pasos (View Transitions).
- Cierre celebratorio.
- Tono rioplatense.

**Pomodoro** — La experiencia inmersiva:
- Panel "EN SESIÓN" que domina la pantalla.
- Timer animado (GSAP ring animation).
- Estados: idle → enfoque → pausa → completado.
- Métricas de sesión.

### Fase 2: Vista Hoy (el protagonista diario)

- HeroClock: Hora grande + franja horaria.
- Tareas de hoy: lista filtrada con estado visual.
- Sección urgente: tareas atrasadas destacadas.
- Estado vacío con personalidad.
- Sin grilla semanal (la grilla es de la vista Semana).

### Fase 3: Vista Materias

- Cards de materia con color, nombre, stats compactas.
- Vista expandida con tareas y sesiones.
- Progressive disclosure: compact → detailed.

### Fase 4: Vista Backlog

- Tabla/lista con tipo + alerta + estado + progreso.
- Filtros (tipo, materia, estado).
- TaskModal para crear/editar tareas.
- Señal táctica visible por fila.

### Fase 5: Vista Semana

- Grilla 7 días × franjas horarias.
- Chips arrastrables (GSAP Draggable).
- Slot editing.
- Visión semanal del plan.

### Fase 6: Vista Kanban + Calendario

- Kanban: columnas por estado, cards arrastrables.
- Calendario: vista mensual con eventos.

### Fase 7: Settings + Import/Export + Drive

- Modal de configuración (materias, tipos, franjas, alertas, temas).
- Export JSON.
- Import con normalización.
- Google Drive sync.

### Fase 8: Pulido final

- Accesibilidad (axe-playwright, keyboard nav completa).
- Performance audit (Lighthouse).
- Visual regression suite.
- Edge cases y estados de error.

---

## 12. Testing

### Estrategia

| Nivel | Herramienta | Qué testea |
|-------|-------------|------------|
| **Unit** | Vitest | Domain logic (reducer, selectors, alertEngine, normalizer). TypeScript puro, sin UI. |
| **Component** | Vitest + @open-wc/testing | Componentes Lit individuales. Renderizado, propiedades, eventos. |
| **Integration** | Vitest | Signal stores + domain. Flujos de datos entre state y lógica. |
| **Visual** | Playwright screenshots | Comparación visual de vistas completas. Cada tema. |
| **E2E** | Playwright | Flujos completos del usuario (crear tarea, iniciar pomodoro, etc.). |
| **A11y** | axe-playwright | WCAG 2.1 AA sin violaciones. |
| **Dev visual** | Storybook | Desarrollo y revisión de componentes aislados. |

### Test visual como gate

```typescript
// Cada vista se captura en cada tema
for (const theme of ['oscuro', 'claro', 'neon', 'pastel', 'alto-contraste']) {
  test(`hoy-view matches snapshot in ${theme}`, async ({ page }) => {
    await page.evaluate(t => document.documentElement.dataset.theme = t, theme);
    await expect(page).toHaveScreenshot(`hoy-${theme}.png`);
  });
}
```

---

## 13. Reglas inquebrantables

### Estética

1. **Si no se ve bien, no está terminado.** No importa que funcione. La estética es condición de "done".
2. **Header = 56px. Siempre.** Si no cabe algo, no va en el header.
3. **Un protagonista por vista.** Si hay duda, elegir uno y subordinar el resto.
4. **La v1.0 es el piso.** Se puede ser diferente, se puede ser mejor, pero no peor.
5. **Cada componente se prueba en los 5 temas** antes de considerarse terminado.

### Código

6. **Un archivo, un componente.** HTML + CSS + TS co-locados en el mismo `.ts`.
7. **La lógica de dominio no importa nada de Lit.** Es TypeScript puro. Se puede testear sin browser.
8. **Los signals no importan nada de Lit.** La capa de estado es independiente de la UI.
9. **Sin dependencias innecesarias.** Cada dependencia se justifica. Si el navegador lo hace, no se agrega una library.
10. **TypeScript estricto.** `"strict": true` en tsconfig. Sin `any` excepto en bordes de terceros.

### Proceso

11. **Shell → Vista → Funcionalidad.** Siempre en ese orden.
12. **Storybook primero.** El componente nace en Storybook con datos mock.
13. **Personalidad en todo.** Cada texto visible al usuario tiene voz de producto rioplatense.
14. **Menos features, más experiencia.** Ante la duda: pulir antes que agregar.

---

> *"La idea de empezar por una cáscara vacía estética nos da ya de entrada la buena sensación de ir por el camino correcto."*
>
> Este documento es la hoja de ruta. La v1.0 es el north star. Lit + TypeScript + CSS puro nos dan las herramientas.
> 
> Ahora a construir.
