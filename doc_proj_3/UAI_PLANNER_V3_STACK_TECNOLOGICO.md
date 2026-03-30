# UAI Planner v3.0 — Evaluación de Stack Tecnológico

Fecha: 2026-03-30  
Prerequisito: Leer `UAI_PLANNER_V3_GUIA_DE_EXPERIENCIA.md` para contexto de lecciones aprendidas.

---

## Índice

1. [Requisitos del stack](#1-requisitos-del-stack)
2. [Candidatos evaluados](#2-candidatos-evaluados)
3. [UI Framework — análisis detallado](#3-ui-framework--análisis-detallado)
4. [El enfoque sin framework — análisis profundo](#4-el-enfoque-sin-framework--análisis-profundo)
5. [Sistema de estilos — análisis detallado](#5-sistema-de-estilos--análisis-detallado)
6. [Animaciones — análisis detallado](#6-animaciones--análisis-detallado)
7. [Estado — análisis detallado](#7-estado--análisis-detallado)
8. [Toolchain — análisis detallado](#8-toolchain--análisis-detallado)
9. [Componentes UI prefabricados](#9-componentes-ui-prefabricados)
10. [Testing](#10-testing)
11. [Escalabilidad futura (backend, colaboración)](#11-escalabilidad-futura-backend-colaboración)
12. [Tabla comparativa final](#12-tabla-comparativa-final)
13. [Recomendación del autor](#13-recomendación-del-autor)
14. [Lo que NO se recomienda](#14-lo-que-no-se-recomienda)

---

## 1. Requisitos del stack

Derivados de la guía de experiencia y del contexto del proyecto:

### Requisitos duros (no negociables)

| # | Requisito | Justificación |
|---|-----------|---------------|
| R1 | **Estética premium desde el primer componente** | Lección #1 de v2.0: la estética no es una fase, es una restricción de diseño permanente |
| R2 | **100% frontend hoy** | Sin backend propio; datos en localStorage + Google Drive |
| R3 | **TypeScript** | v2.0 demostró que los tipos eliminan bugs silenciosos; no negociable |
| R4 | **CSS/HTML/Lógica: co-locación natural** | Lección central: la vieja app tenía estética coherente porque HTML/CSS/JS se escribían juntos |
| R5 | **Sistema de temas robusto** | 5+ temas via CSS custom properties, cambio instantáneo, personalidad por tema |
| R6 | **Animaciones de nivel profesional** | Onboarding teatral, Pomodoro inmersivo, transiciones entre vistas — no son opcionales |
| R7 | **Accesibilidad (WCAG 2.1 AA mínimo)** | Ventaja real de v2.0 que se debe preservar |
| R8 | **Bundle liviano** | App de estudiante universitario; debe cargar rápido en conexiones modestas |

### Requisitos blandos (deseables, influyen en la decisión)

| # | Requisito | Justificación |
|---|-----------|---------------|
| R9 | Escalable a backend (API REST/GraphQL) sin reescritura | "Quizás algún día se expanda" |
| R10 | Compatible con real-time / colaboración multi-usuario | Futuro lejano pero no debe cerrarse la puerta |
| R11 | Ecosistema maduro (libraries, componentes, documentación) | Menos tiempo inventando, más tiempo puliendo |
| R12 | Buena experiencia de desarrollo (HMR rápido, error messages claros) | Productividad directa |
| R13 | Familiaridad (menor curva de aprendizaje) | Ya tenemos experiencia con React + TS |
| R14 | Compatible con IA (Copilot, Claude) para asistencia de código | Ecosistema grande = mejores sugerencias de IA |

---

## 2. Candidatos evaluados

### UI Frameworks

| Framework | Versión actual | State of JS 2024: Uso laboral | Satisfacción/Retención | Bundle size (core) |
|-----------|---------------|-------------------------------|------------------------|--------------------|
| **React** | 19.x | 67% (#1) | Bajando (pain points: complejidad, breaking changes) | ~42KB gzip |
| **Svelte** | 5.x | 11% (#4) | #1 en positivity y retención | ~2KB gzip (compiled) |
| **Vue** | 3.5 | No top 3 laboral, pero #2 en uso general | Subiendo, superó Angular en retención | ~33KB gzip |
| **Solid** | 1.9 | 3% (#8) | Alta satisfacción, ecosistema chico | ~7KB gzip |

### Sistemas de estilos

| Opción | Adopción (State of CSS 2024) | Modelo |
|--------|------------------------------|--------|
| **Tailwind CSS** | 75% de frameworks CSS | Utility-first, clases en HTML |
| **CSS Modules** | 61% de CSS-in-JS | Clases scoped, archivos separados |
| **UnoCSS** | ~6% emergente | Utility-first, configurable, presets |
| **Vanilla CSS + custom properties** | N/A (nativo) | Sin dependencia, máximo control |
| **Sass/SCSS** | 67% pre-processors | Nesting, mixins, variables (CSS ya tiene mucho) |

### Animaciones

| Library | Modelo | Tamaño | Ecosistema |
|---------|--------|--------|------------|
| **Motion** (ex-Framer Motion) | Declarativo, React/Vue/Vanilla | ~50KB | Layout animations, gestures, spring physics |
| **GSAP** | Imperativo, framework-agnostic | ~25KB core | ScrollTrigger, SplitText, MorphSVG, Flip, Draggable |
| **CSS Animations/Transitions** | Nativo | 0KB | Limitado pero performante |
| **AutoAnimate** | Drop-in, automático | ~2KB | Mínimo, solo transiciones de lista |

### Estado

| Library | Modelo | v2.0 experiencia |
|---------|--------|------------------|
| **Zustand** | Store simple, sin boilerplate | ✅ Funcionó perfecto en v2.0 |
| **Svelte stores** (built-in) | Stores reactivos nativos | Solo si se usa Svelte |
| **Jotai** | Atómico, bottom-up | Interesante para estados granulares |
| **TanStack Store** | Framework-agnostic | Permite migrar de framework sin reescribir estado |
| **Pinia** | Store opinado de Vue | Solo si se usa Vue |

---

## 3. UI Framework — análisis detallado

### Opción A: React 19

**A favor:**
- Lo usamos en v2.0, hay experiencia directa y código reutilizable (reducer, normalizer, alertEngine, selectores, tipos).
- Ecosistema más grande del mundo: shadcn/ui, Radix UI, React Aria, miles de componentes.
- Copilot/Claude producen código React excelente (dataset de entrenamiento masivo).
- 67% de uso profesional — si algún día se busca colaboradores, todos saben React.
- Server Components y Suspense preparan el camino para un posible backend futuro.

**En contra:**
- Los "pain points" reportados en State of JS 2024 son exactamente los problemas que tuvimos: complejidad excesiva, re-renders, elección difícil entre muchas opciones de state management.
- **CSS y JSX están naturalmente separados** — hay que hacer esfuerzo extra para lograr la co-locación que queremos (R4). CSS Modules son archivos separados; styled-components tienen overhead de runtime.
- Los componentes React son funciones que se re-ejecutan en cada render; esto fuerza patrones como `useMemo`, `useCallback`, `React.memo` que agregan ruido al código.
- El Virtual DOM es una abstracción que agrega peso y complejidad que no necesitamos.

**Veredicto React**: Sólido, seguro, probado. Pero no resuelve naturalmente el problema central que identificamos (co-locación estética) y agrega complejidad que no aporta.

---

### Opción B: Svelte 5 + SvelteKit

**A favor:**
- **Co-locación nativa**: Un archivo `.svelte` contiene `<script>`, HTML y `<style>` — los tres juntos, como la app vieja. Esto resuelve directamente R4 y el error fundamental de v2.0.
- **Compilador, no runtime**: Svelte compila a JavaScript vanilla optimizado. Sin Virtual DOM, sin runtime framework. El bundle más chico posible (~2KB de overhead vs ~42KB de React).
- **CSS scoped por defecto**: Sin CSS Modules, sin BEM, sin styled-components. Escribís CSS dentro del componente y está automáticamente scoped. Los temas siguen funcionando via CSS custom properties.
- **Reactividad sin boilerplate**: `$state()`, `$derived()`, `$effect()` — reactividad granular sin `useState`/`useEffect`/`useMemo`/`useCallback`. Código más limpio y legible.
- **#1 en satisfacción y retención** (State of JS 2024) — los que lo usan, no quieren dejarlo.
- **SvelteKit** tiene modo SPA (sin SSR) perfecto para nuestro caso, pero se puede activar SSR si algún día hay backend. Adaptador estático para deploy como HTML puro.
- **Transiciones built-in**: `transition:fade`, `transition:slide`, `animate:flip` — animaciones declarativas sin dependencia extra.
- **Stores built-in**: Reactivos, suscribibles, simples. No necesitamos Zustand.

**En contra:**
- Ecosistema más chico: 11% uso laboral vs 67% React. Menos componentes prefabricados, menos libraries de terceros.
- **No hay shadcn/ui nativo** — existe `shadcn-svelte` (port comunitario) pero es menos maduro.
- Curva de aprendizaje: no conocemos Svelte, hay que aprenderlo.
- Código de dominio de v2.0 (reducer, normalizer, tipos) es TypeScript puro — se copia sin cambios. Pero los componentes React se reescriben desde cero.
- Las IAs (Copilot, Claude) generan buen código Svelte, pero no al nivel de React.

**Veredicto Svelte**: Resuelve directamente el problema central de v2.0 (co-locación), produce bundles mínimos, tiene transiciones built-in, y es el framework con mayor satisfacción. El ecosistema es más chico pero ha crecido mucho con Svelte 5.

---

### Opción C: Vue 3.5 + Nuxt

**A favor:**
- SFC (Single-File Components) con `<script>`, `<template>`, `<style>` — misma co-locación que Svelte.
- Ecosistema maduro: PrimeVue, Vuetify, Quasar, Naive UI — libraries de componentes con estética premium.
- Composition API es similar a React hooks pero más limpia.
- Vue supera a Angular en retención, ecosistema creciente.
- Pinia como state manager es excelente.

**En contra:**
- Template syntax (`v-if`, `v-for`, `v-bind`) requiere aprender un DSL propio.
- Más pesado que Svelte (~33KB vs ~2KB).
- Nuxt agrega complejidad de SSR que no necesitamos (aunque tiene modo SPA).
- Las IAs generan buen código Vue pero menos natural que React.

**Veredicto Vue**: Opción sólida con buena co-locación, pero no ofrece ventajas decisivas sobre Svelte y es más pesado.

---

### Opción D: Solid 1.9 + SolidStart

**A favor:**
- Performance #1 en todos los benchmarks (más rápido que Svelte, Vue, React).
- Sintaxis JSX como React — la curva de aprendizaje más baja si venís de React.
- Reactividad granular sin Virtual DOM.
- Bundle muy chico (~7KB).

**En contra:**
- **Ecosistema mínimo**: 3% uso profesional. Pocas libraries de componentes.
- Sin sistema de componentes UI premium establecido.
- CSS sigue siendo separado (como React) — no resuelve R4.
- Comunidad chica, menos documentación, menos soporte de IA.

**Veredicto Solid**: Performance impresionante pero ecosistema insuficiente para nuestros requisitos de estética premium. Y no resuelve el problema de co-locación.

---

## 4. El enfoque sin framework — análisis profundo

### La pregunta incómoda

> ¿Y si no usamos ningún framework pesado? ¿CSS + TypeScript + libraries robustas + estándares web — sin depender de versiones de framework?

Esta pregunta merece un análisis serio porque:
1. **La v1.0 (la app vieja) ES exactamente esto** — HTML/CSS/JS vanilla, sin framework, y tiene la mejor estética de las tres versiones.
2. **Es un movimiento creciente en la industria** — no estamos solos en preguntárnoslo.
3. **Las APIs nativas del navegador en 2026 cubren el 90%+ de lo que los frameworks resolvían.**

### 4.1 El estado del arte en 2026: el navegador ya creció

Las APIs nativas que ANTES requerían un framework, hoy están en el navegador con soporte >90%:

| API nativa | Soporte global | Qué reemplaza |
|-----------|---------------|---------------|
| **Custom Elements v1** | 97% | Modelo de componentes (reemplaza React components) |
| **Shadow DOM v1** | 97% | Estilos scoped (reemplaza CSS Modules, styled-components) |
| **`<dialog>` element** | 97% | Libraries de modales, focus trap |
| **`:has()` selector** | 95% | Selectores padre, JS condicional para styling |
| **Popover API** | 89% | Tooltips, dropdowns, popovers JS (tippy.js, etc.) |
| **CSS `@scope`** | 89% | CSS-in-JS, scoping de estilos |
| **View Transitions API** | 91% | Libraries de transición entre páginas/vistas |
| **Template Literals** | 97% | JSX, template engines |
| **CSS Nesting** | 95% | Sass/SCSS nesting |
| **CSS Custom Properties** | 98% | Temas via JS, CSS-in-JS runtime |

**En 2020 necesitabas React para tener componentes reutilizables, estilos scoped, y modales accesibles. En 2026 el navegador ya lo tiene.**

### 4.2 Las piezas del enfoque "estándares + TypeScript"

#### Componentes: Web Components (Custom Elements)
```typescript
// Un componente vanilla con TypeScript — sin framework
class HeroClock extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="hero-clock">
        <time class="clock">${new Date().toLocaleTimeString()}</time>
        <p class="franja">🌙 Noche</p>
      </div>
    `;
    // CSS está en un archivo separado o en <style> scoped
  }
}
customElements.define('hero-clock', HeroClock);
```

**Ventaja**: Es un estándar W3C. No cambia con versiones de framework. Un componente escrito hoy funciona en 10 años.

**Desventaja**: Sin reactividad. Actualizar el DOM requiere hacerlo manualmente. Sin template declarativo — es `innerHTML` o `createElement`.

#### Reactividad: @preact/signals-core (1.9KB, standalone)
```typescript
import { signal, computed, effect } from '@preact/signals-core';

const count = signal(0);
const doubled = computed(() => count.value * 2);

effect(() => {
  document.querySelector('.count').textContent = String(doubled.value);
});

count.value = 5; // El DOM se actualiza automáticamente
```

- **1.9KB gzip** — zero dependencias, no necesita Preact.
- API mínima: `signal()`, `computed()`, `effect()`, `batch()`.
- 2.6M descargas semanales — battle-tested.
- **TC39 tiene un proposal de Signals (Stage 1)** — las señales van camino a ser nativas del lenguaje.

#### Templates: Lit-html (sin Lit completo, solo templates)
```typescript
import { html, render } from 'lit-html';

const template = (name: string) => html`
  <h1>Hola ${name}</h1>
  <button @click=${() => alert('click')}>Click</button>
`;

render(template('Rodrigo'), document.body);
```

- Solo la parte de templates de Lit: **3.2KB gzip**.
- Templates declarativos con tagged template literals (nativo de JS).
- Bindings eficientes: solo actualiza lo que cambió.
- **Sin Virtual DOM** — actualiza el DOM real directamente.

### 4.3 Opción E: Lit completo (~5.8KB) — el "barely-a-framework"

Lit no es realmente un framework — es una capa delgada sobre Web Components que agrega:
- Templates declarativos (lit-html)
- Propiedades reactivas (`@property`, `@state`)
- Estilos scoped (via `static styles`)
- Lifecycle hooks (`connectedCallback`, `updated`, etc.)

```typescript
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('hero-clock')
class HeroClock extends LitElement {
  @state() private time = new Date();

  static styles = css`
    .clock { font-size: 4rem; font-family: monospace; }
    .franja { color: var(--text2); }
  `;

  connectedCallback() {
    super.connectedCallback();
    setInterval(() => this.time = new Date(), 60000);
  }

  render() {
    return html`
      <div class="hero-clock">
        <time class="clock">${this.time.toLocaleTimeString()}</time>
        <p class="franja">🌙 Noche</p>
      </div>
    `;
  }
}
```

**Co-locación natural**: HTML + CSS + TS en un solo archivo — como la app vieja, pero con tipos.

**Quién usa Lit en producción:**
| Empresa/Proyecto | Uso |
|------------------|-----|
| **Home Assistant** | Dashboard completo de domótica. Una de las apps web más complejas del mundo open-source. Miles de componentes Lit. |
| **Adobe** | Spectrum Web Components — design system usado en Photoshop Web, Acrobat Web |
| **GitHub** | Custom Elements vanilla para componentes interactivos (`<details-dialog>`, `<auto-complete>`, etc.) |
| **YouTube** | Construido sobre Polymer (predecesor de Lit) — una de las apps con más tráfico del mundo |
| **Google Search** | Web Components en producción |
| **SAP** | UI5 Web Components — sistema de UI enterprise |
| **ING Bank** | Lion Web Components — UI completa de banca online |

**Tamaño total del stack sin framework:**
| Pieza | Tamaño gzip |
|-------|-------------|
| Lit | 5.8 KB |
| @preact/signals-core (si queremos reactividad extra a los stores) | 1.9 KB |
| GSAP core (animaciones premium) | 25 KB |
| date-fns (fechas tree-shaked) | ~5 KB usado |
| **Total de "framework"** | **~38 KB** |

**Comparar con:**
| Stack con framework | Tamaño gzip |
|----|-----|
| React + ReactDOM + Zustand + Framer Motion | ~100 KB |
| Svelte runtime + SvelteKit | ~15 KB |
| Vue + Pinia | ~45 KB |

### 4.4 Qué ganamos con el enfoque sin framework

#### Performance: imbatible
- Sin Virtual DOM, sin runtime de framework, sin diffing.
- Los Web Components usan el DOM real directamente.
- Lit actualiza solo los bindings que cambiaron (no re-renderiza el componente entero como React).
- First Contentful Paint más rápido. Time to Interactive más rápido. Memory footprint mínimo.

#### Elasticidad y longevidad
- **Los Web Components son un estándar W3C desde 2020.** No van a deprecarse, no cambian de versión major cada 2 años.
- React tuvo: class components → hooks → server components → ¿? Cada cambio rompe patrones.
- Svelte tuvo: Svelte 3 → 4 → 5 con cambios significativos (runes reemplazaron stores).
- **Un Web Component escrito hoy funciona idéntico en 2036.** La plataforma web es backwards-compatible por diseño.
- Si algún día queremos integrar con React, Vue, o cualquier framework — **los Web Components funcionan en todos** (son elementos HTML estándar).

#### Control estético total
- Sin opiniones de framework sobre cómo estructurar el CSS.
- Sin `className` vs `class`, sin `style={{ camelCase }}`, sin limitaciones de JSX.
- CSS puro con custom properties — el approach que ya sabemos que funciona para temas.
- Shadow DOM para scoping O CSS `@scope` sin shadow (ambos viables).
- **Cero abstracciones entre vos y el CSS.** Eso es exactamente lo que hizo que la v1.0 tuviera mejor estética.

#### No dependency hell
- No hay React 18 → 19 → 20 con breaking changes.
- No hay `useEffect` cleanup bugs, `useMemo` dependency arrays, `StrictMode` doble render.
- No hay incompatibilidades de library X con la versión Y del framework.
- Las únicas dependencias son libraries que elegimos: GSAP, date-fns, signals — todas framework-agnostic.

### 4.5 Qué perdemos con el enfoque sin framework

Hay que ser honestos:

#### Ecosistema de componentes prefabricados
- No hay shadcn/ui (React only).
- **Pero hay Shoelace / Web Awesome**: 50+ componentes Web Components con estética premium, temas configurables, 104K descargas semanales. Compatible con Lit o vanilla.
- Hay Spectrum Web Components (Adobe).
- El ecosistema es menor que React, pero existe y es sólido.

#### Productividad inicial
- Más boilerplate para cosas que React/Svelte hacen en una línea (renderizado condicional, listas, etc.).
- Lit reduce esto significativamente con sus templates y directivas (`repeat`, `when`, `classMap`, etc.).
- **Estimación: la primera semana es más lenta. Después se normaliza** porque hay menos "magic" que debuggear.

#### Soporte de IA
- Copilot y Claude generan menos código de Lit/Web Components que de React.
- Pero sí generan buen código TypeScript vanilla — es JavaScript estándar.
- A medida que Web Components crecen en uso, el soporte de IA mejora.

#### SSR si algún día lo necesitamos
- Lit tiene SSR experimental (`@lit-labs/ssr`).
- No tan maduro como Next.js o SvelteKit.
- Pero para una app que hoy es 100% frontend con localStorage, **SSR es un problema del futuro, no del presente**.

#### Testing
- `@open-wc/testing` es el estándar para testear Web Components — funciona con Vitest.
- Playwright sigue funcionando idéntico para E2E.
- Menos maduro que `@testing-library/react` pero funcional.

### 4.6 La conexión con la v1.0 — por qué esto tiene sentido para NOSOTROS

La v1.0 demostró algo que ningún benchmark puede:

> **Cuando HTML, CSS y lógica se escriben juntos sin abstracciones intermedias, la estética surge naturalmente.**

La v1.0 era 10.578 líneas de HTML/CSS/JS en un archivo. Desordenada por dentro, pero la experiencia visual era coherente porque no había capas entre el desarrollador y el resultado. No había JSX convirtiendo `class` en `className`. No había CSS Modules convirtiendo `.button` en `.button_abc123`. No había Virtual DOM entre la intención y el DOM real.

El enfoque Lit + TypeScript es esencialmente **la v1.0 con módulos, tipos y estructura** — las tres cosas que le faltaban al monolito.

### 4.7 Veredicto del enfoque sin framework

| Criterio | Veredicto |
|----------|-----------|
| ¿Es viable? | **Sí, absolutamente.** Home Assistant, Adobe, GitHub, YouTube lo prueban en producción. |
| ¿Es una locura? | **No.** Es el futuro de la plataforma web. Los frameworks convergen hacia los estándares, no al revés. |
| ¿Cómo nos deja con la estética? | **Es potencialmente el MEJOR camino** — control total sin opiniones de framework, CSS puro, co-locación natural. |
| ¿Performance? | **Imbatible.** ~38KB de stack total vs ~100KB+ con React. |
| ¿Longevidad? | **10+ años sin breaking changes** — es un estándar W3C. |
| ¿Riesgo? | **Medio.** Menos ecosistema prefabricado, curva de aprendizaje de Web Components, testing menos maduro. |

---

## 5. Sistema de estilos — análisis detallado

### 4.1 Tailwind CSS (reconsideración)

En v2.0 lo descartamos porque "no se lleva bien con CSS custom properties". Eso cambió:
- **Tailwind v4** soporta CSS custom properties nativamente.
- Se puede hacer `bg-[var(--surface1)]` sin hacks.
- Permite definir temas enteros con variables CSS y usarlos con utilities.
- 75% de adopción — es el estándar de facto.

**A favor:**
- Velocidad de prototipado: estilos inline sin cambiar de archivo.
- Consistency forzada: escala de spacing/color/tipografía predefinida.
- Responsive utilities (`md:`, `lg:`) eliminan @media queries manuales.
- Modo oscuro trivial: `dark:bg-surface1`.
- Purge automático: solo se envía el CSS que se usa.

**En contra:**
- Las clases en el HTML pueden ser verbose y difíciles de leer: `flex items-center justify-between gap-4 rounded-xl bg-surface1 p-4 shadow-card`.
- **En Svelte**, el `<style>` scoped es tan conveniente que Tailwind pierde ventaja.
- Requiere configuración para que los temas con personality por tema funcionen.
- La estética que produce Tailwind "out of the box" es reconocible — muchas apps se ven igual.

**Recomendación**: Si usamos React → Tailwind es casi obligatorio para velocidad. Si usamos Svelte → es opcional (el `<style>` scoped ya resuelve el scoping y la co-locación).

### 4.2 CSS Modules (lo que usamos en v2.0)

- Funciona con cualquier framework.
- Scoping automático.
- Archivos separados (`.module.css`) — requiere cambiar de archivo para ajustar estilos.
- En v2.0 funcionó bien técnicamente. El problema no fue CSS Modules, fue no diseñar los estilos al mismo tiempo que los componentes.

### 4.3 Vanilla CSS scoped (Svelte built-in)

- Zero dependencias, zero config.
- `<style>` dentro del `.svelte` = scoped automáticamente.
- Temas con CSS custom properties `:root` / `[data-theme]` — idéntico a lo que tenemos.
- Nesting nativo de CSS (ahora soportado en todos los navegadores).
- **Este es el approach más limpio si usamos Svelte.**

### 4.4 UnoCSS

- Como Tailwind pero más configurable y liviano.
- Presets para diferentes convenciones (Tailwind-compatible, Windi, Bootstrap-like).
- Menos ecosistema que Tailwind.
- Interesante como alternativa si queremos utilities sin el lock-in de Tailwind.

---

## 6. Animaciones — análisis detallado

Las animaciones son CRÍTICAS para v3.0 (onboarding teatral, pomodoro inmersivo, transiciones de vista).

### 5.1 Motion (ex-Framer Motion)

- **Declarativo**: `<motion.div animate={{ opacity: 1 }}>`
- Layout animations (AnimatePresence, layoutId) — magic para listas, modales, transiciones.
- Spring physics, gestures, drag.
- React y Vue (y vanilla). **No soporta Svelte nativamente.**
- ~50KB gzip — el más pesado.
- Versión gratuita + Motion+ de pago para features premium.

### 5.2 GSAP

- **Imperativo**: `gsap.to(element, { opacity: 1, duration: 0.5 })`.
- Framework-agnostic — funciona con React, Svelte, Vue, vanilla.
- Ecosystem masivo: ScrollTrigger, SplitText, MorphSVG, Flip (para layout transitions), Draggable.
- ~25KB core, plugins adicionales a demanda.
- `useGSAP()` hook para React. Para Svelte se usa `onMount` + `gsap.to()`.
- **Es el estándar de la industria para animaciones web premium** — lo usan Apple, Nike, Airbnb.
- Licencia libre para uso público (incluyendo SplitText desde 2024).

### 5.3 Svelte transitions (built-in)

- `transition:fade`, `transition:slide`, `transition:scale`, `transition:fly`, `transition:blur`.
- `animate:flip` para reordenamiento de listas.
- `in:` / `out:` para entrada/salida diferenciadas.
- 0KB de overhead — compilado a CSS animations.
- Custom transitions posibles con la API `tick`.
- **Suficiente para el 80% de las animaciones de la app** (transiciones de vista, colapsables, modales).
- Para el 20% premium (onboarding teatral, timer dramático) se complementa con GSAP.

### 5.4 Recomendación de animaciones

| Si el framework es... | Recomendación |
|-----------------------|---------------|
| React | Motion (Framer Motion) como base + GSAP para lo premium |
| Svelte | Svelte transitions para lo cotidiano + GSAP para lo premium |
| Vue | Motion (ya soporta Vue) como base + GSAP para lo premium |

**GSAP es el denominador común** — funciona con cualquier framework y es el más potente para las animaciones "teatrales" que necesitamos.

---

## 7. Estado — análisis detallado

### 7.1 Si usamos React: Zustand

- Probado en v2.0: funcionó perfecto.
- Mínimo boilerplate, sin providers, fácil de testear.
- Stores separados por dominio (planner, UI, pomo, drive).
- **Se copia tal cual de v2.0** (solo cambian los componentes que consumen, no los stores).

### 7.2 Si usamos Svelte: Svelte stores (runes en v5)

- `$state()` para estado reactivo dentro de componentes.
- `$derived()` para valores computados (reemplaza selectores).
- Para estado global compartido entre componentes: stores con `$state` exportado desde un módulo.
- **La lógica del reducer de v2.0 se adapta fácilmente** — el reducer es TypeScript puro, solo cambia cómo se conecta a la UI.

### 7.3 Si usamos Lit: @preact/signals-core

- Standalone, no necesita Preact: 1.9KB gzip, zero deps.
- API mínima: `signal()`, `computed()`, `effect()`, `batch()`.
- 2.6M descargas semanales — battle-tested.
- TC39 tiene un proposal de Signals (Stage 1) — va camino a ser nativo del lenguaje.
- Se complementa con las reactive properties de Lit (`@state()`, `@property()`) para estado local de componente.

### 7.4 TanStack Store (framework-agnostic)

- Si queremos poder cambiar de framework sin tocar la capa de estado.
- Compatible con React, Svelte, Vue, Solid.
- Más boilerplate que Zustand o Svelte stores.
- **Solo vale la pena si hay incertidumbre real sobre el framework.**

### 7.5 Recomendación de estado

Usar el mecanismo nativo del framework elegido:
- React → Zustand (probado)
- Svelte → Runes + stores (nativo, zero deps)
- Lit → @preact/signals-core + Lit @state (nativo + 1.9KB)
- Vue → Pinia (nativo, opinado)

La lógica de dominio (reducer.ts, normalizer.ts, selectors.ts, alertEngine.ts) es **TypeScript puro sin dependencia de framework** — se copia tal cual en cualquier caso.

---

## 8. Toolchain — análisis detallado

### 8.1 Bundler: Vite (mantener)

- Usado en v2.0, funciona perfecto.
- Soporta React, Svelte, Vue, Solid.
- HMR instantáneo.
- SvelteKit usa Vite por debajo.
- **No hay razón para cambiar.**

### 8.2 Lenguaje: TypeScript 5.x (mantener)

- Non-negotiable. Soportado por todos los frameworks.
- Svelte 5 tiene soporte first-class de TypeScript en archivos `.svelte`.

### 8.3 Linting / Formatting

| Herramienta | v2.0 | v3.0 recomendación |
|-------------|------|--------------------|
| Prettier | No explícito | ✅ Agregar (78% uso en State of CSS) |
| ESLint | No explícito | ✅ Agregar (svelte-eslint-parser si Svelte) |
| Biome | No existía | ⚠️ Considerar como reemplazo unificado de Prettier+ESLint (más rápido, un solo tool) |

### 8.4 Package manager

npm (ya lo usamos, funciona, no es un bottleneck).

---

## 9. Componentes UI prefabricados

Este punto es CRÍTICO para la estética premium. No queremos reinventar botones, modales, dropdowns desde cero.

### 9.1 Si React: shadcn/ui

- **Componentes hermosos out of the box** con estética minimalista y premium.
- Open code: copiás el componente, lo modificás como querés. No es una dependencia.
- Usa Radix UI por debajo (accesibilidad resuelta).
- Tailwind CSS como sistema de estilos.
- AI-ready: los modelos pueden leer y generar componentes compatibles.
- 111K+ stars en GitHub.
- **Es la mejor opción de componentes premium en el ecosistema React.**

### 9.2 Si Svelte: shadcn-svelte + Bits UI

- `shadcn-svelte`: Port comunitario de shadcn/ui para Svelte. Usa Bits UI (primitivos accesibles).
- Calidad alta pero menos mantenedores que la versión React.
- También open code — se copia y modifica.
- Usa Tailwind CSS (requiere Tailwind si se elige esta ruta).
- Alternativa: Skeleton UI, Melt UI (más maduros en Svelte puro).

### 9.3 Si Vue: Radix Vue + shadcn-vue

- Puerto de shadcn para Vue.
- También de calidad pero limitado vs el original React.

### 9.4 Si Lit / Web Components: Shoelace (Web Awesome)

- **50+ componentes con estética premium**, temas configurables, light/dark mode.
- Construido sobre Lit — son Web Components estándar.
- 104K descargas semanales npm.
- A11y integrada.
- **Renombrado a "Web Awesome"** por Font Awesome — 11 temas prediseñados, theme builder, Figma kit.
- Open source core.
- Alternativas: Adobe Spectrum Web Components, SAP UI5 Web Components.

### 9.5 Alternativa agnóstica: Build from scratch sobre primitivos accesibles

- Usar Radix Primitives o Bits UI como base (solo accessibility/behavior).
- Estilar todo desde cero para máxima personalidad.
- **Más trabajo, pero resultado más único.** Si la estética premium y la personalidad son el objetivo #1, esto da máximo control.

### 9.6 Veredicto de componentes

| Si el framework es... | Recomendación |
|-----------------------|---------------|
| React | shadcn/ui + personalización de visual tokens |
| Svelte | shadcn-svelte O primitivos de Bits UI + CSS propio |
| Lit / Web Components | Shoelace / Web Awesome O primitivos accesibles + CSS propio |
| Vue | shadcn-vue O headless UI propia |

---

## 10. Testing

### 10.1 Mantener de v2.0

| Tool | Uso | v3.0 |
|------|-----|------|
| Vitest | Unit + integration | ✅ Mantener (funciona con Svelte y Vue también) |
| Playwright | E2E + visual | ✅ Mantener |
| @testing-library | Component tests | Cambiar a `@testing-library/svelte` si Svelte |

### 10.2 Agregar en v3.0

| Tool | Uso | Justificación |
|------|-----|---------------|
| Storybook (o Histoire si Svelte) | Desarrollo visual aislado de componentes | Fuerza diseño visual ANTES de integración — alineado con principio #1 |
| axe-playwright | Accesibilidad automatizada | Ya lo usamos, mantener |
| Visual regression (Playwright screenshots) | Comparación visual | Ya lo configuramos, mantener |

**Storybook / Histoire es especialmente importante para v3.0**: Permite desarrollar cada componente de forma aislada, verificar su estética, y solo después integrarlo. Esto fuerza el principio de "si no se ve bien, no está terminado".

---

## 11. Escalabilidad futura (backend, colaboración)

### 11.1 Preparar sin construir

No vamos a construir un backend ahora, pero el stack debe permitirlo sin reescritura:

| Capacidad futura | Cómo la preparamos hoy |
|------------------|------------------------|
| API REST | La lógica de dominio (reducer, normalizer) es pura — se puede mover a un server sin cambios |
| GraphQL | Misma lógica; el adaptador de transporte es una capa delgada |
| WebSocket (real-time) | No afecta el stack elegido; cualquier framework soporta WebSocket/SSE |
| Base de datos | La estructura de `PlannerData` ya es persistible como JSON; migrar a Postgres/SQLite es directo |
| Auth multi-usuario | Google OAuth ya lo tenemos; agregar sessions/tokens es una capa aparte |
| Colaboración multi-user | Requiere CRDTs o OT (Operational Transform); libraries como Yjs o Automerge son framework-agnostic |

### 11.2 SvelteKit / Lit como preparación

Si usamos SvelteKit:
- Hoy: `adapter-static` → genera HTML/CSS/JS sin servidor.
- Mañana: `adapter-node` o `adapter-vercel` → agrega server routes para API endpoints.
- SvelteKit tiene `+server.ts` files para API routes que conviven con las páginas.
- **El mismo proyecto puede pasar de SPA estática a full-stack sin cambiar de framework.**

Si usamos Lit:
- Hoy: Vite genera un SPA estática.
- Mañana: Agregar un server (Hono, Express, Fastify) que sirva la SPA + API routes.
- Los Web Components son 100% reutilizables — incluso podrían consumirse desde una app React/Vue si hubiera un frontend diferente en el futuro.

Si usamos React:
- Hoy: Vite genera un SPA puro.
- Mañana: Migrar a Next.js o Remix para API routes, SSR, etc.
- **Requiere migración de bundler y routing** — más fricción que SvelteKit.

---

## 12. Tabla comparativa final

Se evalúa cada stack contra los requisitos (R1-R14):

| Requisito | React + Tailwind + shadcn/ui | Svelte 5 + SvelteKit + CSS scoped | Lit + TS + CSS puro + GSAP | Vue 3 + Nuxt + PrimeVue |
|-----------|------------------------------|-------------------------------------|----------------------------|--------------------------|
| **R1** Estética premium | ⭐⭐⭐⭐⭐ shadcn/ui es world-class | ⭐⭐⭐⭐ shadcn-svelte + CSS propio | ⭐⭐⭐⭐⭐ Control total, CSS puro, Shoelace/Web Awesome | ⭐⭐⭐⭐ PrimeVue/Vuetify son buenos |
| **R2** 100% frontend | ⭐⭐⭐⭐⭐ Vite SPA | ⭐⭐⭐⭐⭐ adapter-static | ⭐⭐⭐⭐⭐ Vite SPA (el más natural) | ⭐⭐⭐⭐⭐ Vite SPA |
| **R3** TypeScript | ⭐⭐⭐⭐⭐ Nativo | ⭐⭐⭐⭐⭐ Nativo desde Svelte 5 | ⭐⭐⭐⭐⭐ Nativo (Lit es TS-first) | ⭐⭐⭐⭐⭐ Nativo |
| **R4** Co-locación CSS/HTML/JS | ⭐⭐⭐ Requiere esfuerzo (CSS Modules separados o Tailwind inline) | ⭐⭐⭐⭐⭐ `<style>` scoped en cada .svelte | ⭐⭐⭐⭐⭐ `static styles` + `render()` en un archivo | ⭐⭐⭐⭐⭐ `<style scoped>` en cada .vue |
| **R5** Sistema de temas | ⭐⭐⭐⭐⭐ Tailwind v4 + CSS vars | ⭐⭐⭐⭐⭐ CSS vars + :root | ⭐⭐⭐⭐⭐ CSS vars puro — cero abstracción | ⭐⭐⭐⭐⭐ CSS vars + :root |
| **R6** Animaciones pro | ⭐⭐⭐⭐⭐ Motion + GSAP | ⭐⭐⭐⭐⭐ Built-in transitions + GSAP | ⭐⭐⭐⭐⭐ GSAP directo (sin adapter) + View Transitions API | ⭐⭐⭐⭐ Motion (Vue) + GSAP |
| **R7** Accesibilidad | ⭐⭐⭐⭐⭐ Radix UI / React Aria | ⭐⭐⭐⭐ Bits UI / Melt UI | ⭐⭐⭐⭐ Shoelace/Web Awesome tienen a11y, `<dialog>` nativo | ⭐⭐⭐⭐ PrimeVue tiene a11y |
| **R8** Bundle liviano | ⭐⭐⭐ ~100KB (React + Motion + deps) | ⭐⭐⭐⭐⭐ ~27KB (Svelte + GSAP) | ⭐⭐⭐⭐⭐ ~38KB (Lit + signals + GSAP) = el más liviano | ⭐⭐⭐⭐ ~45KB (Vue + deps) |
| **R9** Escalable a backend | ⭐⭐⭐⭐ Migrar a Next.js/Remix | ⭐⭐⭐⭐⭐ SvelteKit ya está preparado | ⭐⭐⭐⭐ Agregar API routes manualmente o con Hono/Express | ⭐⭐⭐⭐⭐ Nuxt ya está preparado |
| **R10** Real-time futuro | ⭐⭐⭐⭐⭐ Yjs + React | ⭐⭐⭐⭐⭐ Yjs + Svelte | ⭐⭐⭐⭐⭐ Yjs + vanilla (Yjs ES framework-agnostic) | ⭐⭐⭐⭐⭐ Yjs + Vue |
| **R11** Ecosistema maduro | ⭐⭐⭐⭐⭐ El más grande | ⭐⭐⭐ Creciendo rápido | ⭐⭐⭐ Shoelace + Adobe + open-wc (menor que React/Vue) | ⭐⭐⭐⭐ Maduro pero menor que React |
| **R12** DX (developer experience) | ⭐⭐⭐⭐ Buena (hooks complejidad) | ⭐⭐⭐⭐⭐ Excelente (compilador, menos boilerplate) | ⭐⭐⭐⭐ Buena (más manual, menos magic) | ⭐⭐⭐⭐ Buena |
| **R13** Familiaridad | ⭐⭐⭐⭐⭐ Ya lo usamos | ⭐⭐⭐ Aprender Svelte (1-2 semanas) | ⭐⭐⭐ Aprender Lit + Web Components (1-2 semanas) | ⭐⭐⭐ Aprender Vue |
| **R14** Compatibilidad IA | ⭐⭐⭐⭐⭐ Mejor soporte | ⭐⭐⭐⭐ Bueno, mejorando | ⭐⭐⭐ TS vanilla es bueno, Lit específico es limitado | ⭐⭐⭐⭐ Bueno |

### Scoring ponderado

Pesos: R1-R8 (duros) = 10 puntos cada uno. R9-R14 (blandos) = 5 puntos cada uno.

| Stack | R1-R8 (×10) | R9-R14 (×5) | **Total** |
|-------|-------------|-------------|-----------|
| **React + Tailwind + shadcn/ui** | 36/40 | 27/30 | **63/70** |
| **Lit + TS + CSS puro + GSAP** | 38/40 | 22/30 | **60/70** |
| **Svelte 5 + SvelteKit + CSS scoped** | 38/40 | 24/30 | **62/70** |
| **Vue 3 + Nuxt + PrimeVue** | 37/40 | 24/30 | **61/70** |

**Los cuatro stacks son viables.** Observar: **Lit empata con Svelte en requisitos duros (38/40)** — es donde más importa para v3.0. Pierde solo en los blandos (ecosistema, familiaridad, IA) que son desafíos temporales, no estructurales.

---

## 13. Recomendación del autor (actualizada)

Después de analizar el enfoque sin framework, la evaluación se reorganiza. Los stacks quedan en 3 tiers:

### Tier 1 — Los dos candidatos más fuertes

#### Opción A: React 19 + Vite + Tailwind v4 + shadcn/ui + GSAP + Zustand

**El floor más alto.** Ecosistema inigualable, shadcn/ui es world-class para estética premium, continuidad con v2.0, mejor soporte de IA. La debilidad: co-locación CSS/JS no es natural (Tailwind la mitiga), Virtual DOM innecesario, dependencia de versiones de framework.

**Elegir si**: Queremos la ruta segura, rápida, con el ecosistema de componentes más rico del mundo.

#### Opción B: Lit + TypeScript + CSS puro + GSAP + Signals

**El ceiling más alto.** Control total sobre la estética (cero abstractiones entre nosotros y el CSS). Performance imbatible (~38KB total). Longevidad de 10+ años (estándares W3C). Co-locación perfecta. Sin dependency hell de frameworks. Todo el dominio de v2.0 (reducer, normalizer, alertEngine, tipos) se copia sin cambios.

**Elegir si**: Queremos máximo control estético, máxima performance, mínima dependencia de terceros, y estamos dispuestos a aprender Web Components / Lit (~1-2 semanas). La v1.0 demostró que este enfoque produce la mejor estética.

### Tier 2 — Alternativas válidas

#### Opción C: Svelte 5 + SvelteKit + CSS scoped + GSAP

Co-locación excelente, DX limpia, SvelteKit prepara para backend. Pero: ecosistema menor que React, Svelte 5 cambió mucho vs Svelte 4 (runes), y si Svelte 6 cambia otra vez, volvemos al problema de versiones.

#### Opción D: Vue 3 + Nuxt + PrimeVue

Sólido pero sin ventajas decisivas sobre las opciones anteriores.

### El dilema real: ¿seguridad o libertad?

| | React (Opción A) | Lit + estándares (Opción B) |
|---|---|---|
| **Filosofía** | Dependo del ecosistema; el framework me da mucho a cambio de control | Dependo de estándares; yo construyo lo que necesito, nadie me lo quita |
| **Estética** | shadcn/ui me da un excelente punto de partida a personalizar | CSS puro me da total libertad pero empiezo de cero (o con Shoelace) |
| **Performance** | Buena (React 19 mejoró mucho) | Imbatible (~38KB vs ~100KB) |
| **Longevidad** | React 19 hoy, ¿React 22 en 3 años? | Web Components son W3C — igual en 10 años |
| **Productividad** | Alta desde el día 1 | Media la primera semana, después se normaliza |
| **Riesgo** | Bajo (todo el mundo usa React) | Medio (menos ecosistema prefabricado) |

### La pregunta final (actualizada)

Ahora son dos preguntas:

> **1. ¿Queremos depender de un framework (React/Svelte/Vue) o queremos depender solo de estándares web?**
>
> Si estándares → Lit + TS + CSS + GSAP.
> Si framework → React + shadcn + Tailwind.
>
> **2. ¿Qué pesa más: el ecosistema de componentes prefabricados (shadcn/ui) o el control total sobre la estética (CSS puro)?**
>
> Si prefabricados → React.
> Si control total → Lit.

La respuesta a estas dos preguntas define el stack.

---

## 14. Lo que NO se recomienda

### Tecnologías explícitamente descartadas para v3.0

| Tecnología | Motivo |
|------------|--------|
| **Angular** | Demasiado pesado, demasiado opinado, en declive en satisfacción |
| **Solid** | Ecosistema insuficiente para estética premium |
| **Styled Components / Emotion** | Runtime overhead innecesario en 2026; Tailwind o CSS scoped son mejores |
| **Redux / RTK** | Over-engineering para esta app. Zustand o stores nativos son suficientes |
| **Next.js como starter** | Agrega SSR/ISR/Server Components que no necesitamos y complican el setup. Si necesitamos SSR a futuro, migrar es posible |
| **Material UI / MUI** | Estética recognizable ("Google vibes"); queremos personalidad propia |
| **Bootstrap** | Estética de 2015; contrario al objetivo premium |
| **jQuery** | No |

### Patrones a evitar

| Patrón | Por qué |
|--------|---------|
| CSS-in-JS con runtime (styled-components, emotion) | Overhead innecesario, Tailwind/CSS scoped son superiores |
| Mono-repo con multiple packages | Una sola app, no necesitamos la complejidad |
| Micro-frontends | Un solo equipo, un solo producto |
| GraphQL client-side (Apollo, Relay) | No hay backend; si lo hay algún día, evaluar entonces |
| PWA desde el día 1 | Agregar después si hay demanda; el service worker de SvelteKit lo hace trivial |

---

## Nota final

Este documento presenta opciones evaluadas honestamente. **No estamos casados con nadie.** Los cuatro caminos son viables, pero dos se destacan:

1. **React + shadcn/ui** — La ruta segura. Ecosistema premium masivo. El floor más alto.
2. **Lit + TypeScript + CSS puro** — La ruta libre. Estándares web, sin dependency hell, control total. El ceiling más alto.

El enfoque sin framework no es una locura — es lo que hacen GitHub, Adobe, Google y Home Assistant en producción. Y es exactamente lo que hizo que la v1.0 tuviera la mejor estética.

La decisión la toma el equipo. Lo que importa es que:
1. El stack elegido se respeta durante todo el proyecto (no patchear a mitad de camino).
2. La estética se diseña JUNTO con la funcionalidad desde el primer componente.
3. Se usa GSAP para las animaciones premium independientemente del stack.
4. La lógica de dominio de v2.0 (reducer, normalizer, alertEngine, tipos) se reutiliza — es TypeScript puro.

> "La v3.0 debe sentirse producto desde el primer commit."
> — El stack es el medio. La experiencia es el fin.
