# UAI Planner v3.0 — Guía de Experiencia y Lecciones Aprendidas

Fecha: 2025-07-21
Contexto: Este documento NO es una spec funcional, ni un plan de implementación, ni una arquitectura técnica. Es una **guía de experiencia** — un destilado de todo lo aprendido construyendo la v2.0 del UAI Planner (34 fases, ~3 semanas de trabajo intensivo) para que la v3.0 arranque con ventaja y no repita errores.

Referencia: `uai_planner_estable_.html` (copiado en esta misma carpeta como north star visual).

---

## Índice

1. [La historia en 3 párrafos](#1-la-historia-en-3-párrafos)
2. [El error fundamental de enfoque](#2-el-error-fundamental-de-enfoque)
3. [Qué salió bien en v2.0](#3-qué-salió-bien-en-v20)
4. [Qué salió mal en v2.0](#4-qué-salió-mal-en-v20)
5. [Por qué la app vieja "funciona" estéticamente](#5-por-qué-la-app-vieja-funciona-estéticamente)
6. [Lecciones módulo por módulo](#6-lecciones-módulo-por-módulo)
7. [Patrones que funcionan vs. antipatrones](#7-patrones-que-funcionan-vs-antipatrones)
8. [Principios para v3.0](#8-principios-para-v30)
9. [Lo que hay que recuperar de la vieja](#9-lo-que-hay-que-recuperar-de-la-vieja)
10. [Lo que hay que preservar de v2.0](#10-lo-que-hay-que-preservar-de-v20)
11. [Errores que no repetir](#11-errores-que-no-repetir)
12. [Preguntas abiertas para v3.0](#12-preguntas-abiertas-para-v30)

---

## 1. La historia en 3 párrafos

Existía una app monolítica (`uai_planner_estable_.html`) — 10.578 líneas de HTML/CSS/JS en un solo archivo. Desordenada por dentro pero con una estética consolidada y una personalidad fuerte. Se sentía como **producto**, no como herramienta. Era la referencia de lo que queríamos lograr con una base de código moderna.

Construimos la v2.0 con React 18 + TypeScript 5 + Vite + Zustand + CSS Modules, siguiendo buenas prácticas de ingeniería: dominio separado, feature-based structure, stores tipados, tests unitarios e integración. 27 fases funcionales + 7 fases estéticas. Código limpio, testeable, mantenible. La funcionalidad quedó completa y en algunos casos superior a la original (accesibilidad, normalización de datos, drag & drop robusto).

Pero la estética nunca convergió. Después de las 7 fases estéticas dedicadas, el scoring contra la versión vieja seguía en 1.72/3 de paridad promedio. El diagnóstico fue claro: **construir funcionalidad primero y estética después creó deudas de layout y de identidad visual que son extremadamente difíciles de pagar retroactivamente**. La v3.0 nace de esa lección.

---

## 2. El error fundamental de enfoque

### "Funcionalidad primero, estética después" no funciona para productos de usuario final

Este fue el error más caro del proyecto. En un backend, una API, o una library, tiene todo el sentido implementar la lógica primero y pulir después. Pero en una aplicación de usuario donde la experiencia visual ES el producto, esta separación es artificial y destructiva.

**Lo que pasó en concreto:**

- Se construyeron los componentes React pensando en su función (mostrar datos, manejar estado, validar input) sin considerar cuánto espacio deberían ocupar en la pantalla ni cómo se sentirían visualmente.
- Los layouts se definieron por lo que era lógico estructuralmente (header arriba, nav adentro, contenido abajo) no por lo que era correcto perceptualmente (¿qué quiero que vea primero el usuario?).
- Al agregar features (filtros, acciones, indicadores), cada una demandó su espacio en la UI, y ninguna "sabía" cuánto espacio le correspondía. El resultado: un header que creció a 350px, vistas sobrecargadas, y una experiencia donde todo compite por atención.
- Cuando llegó la fase de pulido estético, los componentes ya estaban conectados, testeados y servían como base para otros componentes. Moverlos, cambiar su jerarquía visual, o reconsiderar su tamaño significaba romper cosas.

### Por qué la vieja no tuvo este problema

La vieja app se escribió como HTML/CSS/JS entrelazados. Cuando se creaba un componente, el HTML, el CSS y la lógica se escribían juntos, en el mismo momento. La estética no era una capa posterior — era parte del acto de creación. El autor veía el resultado visual inmediatamente y ajustaba. **La apariencia co-evolucionó con la función.**

### La lección central

> En una app de usuario, la estética no es decoración que se aplica al final.
> Es una restricción de diseño que debe informar cada decisión desde el primer componente.
> Si un componente no se ve bien, no está terminado — independientemente de que funcione.

---

## 3. Qué salió bien en v2.0

No todo fue error. La v2.0 produjo mucho valor que hay que preservar en v3.0:

### Arquitectura y código
- **Stack**: React 18 + TypeScript 5 + Vite 5 + Zustand 4 + CSS Modules es un stack probado y liviano. Sin over-engineering.
- **Decisiones descartadas**: Redux (excesivo), Tailwind (utility classes dificultan lectura), React Router (no hay navegación por URL), Next.js (innecesario), Styled Components (CSS Modules es más liviano).
- **Feature-based structure**: `features/`, `domains/`, `shared/`, `store/` — la organización escala y es fácil de navegar.
- **Zustand stores**: Simple, tipado, sin boilerplate. `usePlannerStore`, `useUIStore`, `usePomoStore`, `useDriveStore` — cada uno con responsabilidad clara.

### Lógica de dominio
- **Reducer del planner**: Toda la mutación de datos centralizada en un reducer puro (`reducer.ts`). Esto es oro — predecible, testeable, debuggeable.
- **Service layer**: `service.ts` como fachada del store. Expone acciones semánticas, no operaciones de estado.
- **Selectores**: `selectors.ts` para derivar datos. Evita duplicación de lógica en componentes.
- **Normalización de import**: `normalizer.ts` maneja JSON malformado, campos faltantes, migración de formato. Robusto y defensivo.

### Funcionalidad
- **TaskModal con 12 campos**: Checklist, sesiones relacionadas, fechas, prioridad, confirmación de eliminación. Superior a la vieja.
- **Accesibilidad**: axe-playwright sin violaciones, keyboard navigation en Kanban (Enter/Espacio cicla estado), aria-labels en todo, roles semánticos. Ventaja real sobre la vieja.
- **Drag & drop en Semana**: Chips arrastrables con stopPropagation correcto.
- **Sistema de alertas**: `alertEngine.ts` evalúa reglas y genera alertas urgentes. No existía en la vieja.
- **Franjas horarias y timezone**: `franjas.ts` + `timezone.ts` — lógica robusta de franjas (mañana/tarde/noche) con zona.

### Testing
- 12 tests (unit + integration) que cubren el store, el reducer, el service y el TaskModal.
- `vitest` + `@testing-library/react` — setup limpio.
- Siempre pasaron durante las 34 fases.

### Temas y CSS
- 5 temas funcionales con custom properties.
- 15 variables semánticas por tema (Phase 5).
- Personalidad por tema via `--radius-card` y `--shadow-card` diferenciados.
- Dark mode funcional.

---

## 4. Qué salió mal en v2.0

### 4.1 — Layouts que no cuajan

El header creció a 350px porque cada feature pedía su lugar ahí: logo, nombre, subtítulo, navegación con texto completo, acciones (nueva tarea, importar, período, tema, drive, datos, ayuda, settings). En la vieja, todo eso cabe en **una línea de 56px** usando iconos compactos.

**Lección**: Todo componente de UI debe tener un **budget visual** — cuántos píxeles le corresponden, cuánto puede crecer, y qué pasa cuando se queda sin espacio.

### 4.2 — Densidad sin control

Las vistas (especialmente Hoy y Materias) acumularon secciones sin un criterio de "cuánta información es demasiada". Hoy terminó con: urgencias + ahora + más tarde + grilla semanal completa embebida. Es más funcional que la vieja, pero el usuario se pierde.

**Lección**: Menos es más. Cada vista necesita UNA función primaria y todo lo demás es secundario o colapsado. La vieja versión de Hoy era un "reloj inteligente" — mostraba el momento actual y nada más. Eso funcionaba.

### 4.3 — Identidad visual genérica

Los componentes se ven "correctos" pero no "memorables". La estable tiene un carácter reconocible — el glifo ◈, los emojis usados con intención, el tono rioplatense, las frases con personalidad. La nueva se siente como un admin panel con colores bonitos.

**Lección**: La identidad visual no sale de las variables CSS. Sale de decisiones de diseño consistentes: tipografía con carácter, iconografía propia, microcopy con voz, ritmo visual reconocible.

### 4.4 — Herramienta vs. producto

La frase más contundente de la auditoría fue:

> "La nueva se siente herramienta; la estable se siente producto."

¿Por qué? Porque la vieja fue construida pensando en la experiencia completa — qué siente el usuario al abrirla, cuál es la primera impresión, qué narrativa cuenta el onboarding, cómo se siente una sesión de pomodoro. La nueva fue construida pensando en features: ¿funciona el timer? ✅ ¿Guarda los datos? ✅ ¿Se ve bien? ... más o menos.

**Lección**: Un producto de usuario se diseña desde la experiencia, no desde las features. Los features son medios, la experiencia es el fin.

### 4.5 — Patching estético no converge

Las 7 fases estéticas hicieron mejoras reales (header más compacto, pomodoro immersivo, HeroClock, temas con personalidad, empty states, a11y). Pero cada fix revelaba otra carencia, porque el esqueleto de layout no había sido pensado para esa estética. Era como intentar convertir un departamento de oficina en un loft — podés pintar las paredes, pero la estructura no acompaña.

**Lección**: La estética tiene que estar en el blueprint, no en la pintura.

---

## 5. Por qué la app vieja "funciona" estéticamente

Entender qué hace que la vieja se sienta bien es clave para v3.0. No es nostalgia — es diseño (intuitivo, no formal, pero efectivo):

### 5.1 — Cada vista tiene UN protagonista

- **Hoy**: El reloj es gigante. No hay duda de qué es lo más importante.
- **Pomodoro activo**: El timer domina la pantalla. "EN SESIÓN" es literal.
- **Semana**: La grilla es la protagonista, sin adornos.
- **Materias**: Un tablero de cards compactas, escaneables.

En la v2.0, las vistas tienen 3-4 secciones compitiendo por atención. Ninguna es claramente la protagonista.

### 5.2 — Densidad equilibrada

La vieja muestra menos información por pantalla, pero la información que muestra es la correcta para el contexto. No hay secciones que digan "mirá cuánto puedo hacer" — solo "esto es lo que necesitás ahora".

### 5.3 — La navegación es invisible

Una línea de iconos compactos. No impone. No ocupa espacio. Está ahí cuando la necesitás y desaparece visualmente cuando no. En la v2.0, la navegación ES la protagonista de cada pantalla (350px de header).

### 5.4 — Los estados vacíos orientan

Cuando no hay datos, la vieja te dice qué hacer. Con personalidad. No es un "No hay tareas" genérico — es una guía contextual.

### 5.5 — El tono es consistente

Rioplatense, cercano, con humor sutil. Desde el onboarding hasta la ayuda. No es formal ni técnico. La v2.0 es funcional pero fría.

---

## 6. Lecciones módulo por módulo

### Header / Shell
- **v2.0 problema**: 350px, 4-5 filas de contenido, compite con la vista.
- **Vieja solución**: 56px, una sola línea, iconos con letra.
- **Lección para v3.0**: El header debe ser invisible — máximo 56-64px. Navegación con iconos, no texto. Acciones infrecuentes (importar, período, tema) NO van en el header — van en un panel de settings o un menú contextual. El header tiene solo: logo, nav, indicador de estado (drive), y nada más.

### Pomodoro
- **v2.0 problema**: Widget flotante mínimo, sin pausa, sin métricas, sin inmersión.
- **Vieja solución**: Panel inmersivo "EN SESIÓN" que domina la pantalla.
- **Lección para v3.0**: El Pomodoro es la feature más diferenciada del planner. Debe ser la experiencia más pulida. Desde el inicio diseñar dos modos: widget compacto (cuando no es foco) y vista inmersiva (cuando hay sesión activa). La vista inmersiva debe tener: timer grande, materia + tarea, métricas de la semana, pausa, y controles jerárquicos (3 niveles). Diseñar primero el modo inmersivo, después el compacto.

### Hoy
- **v2.0 problema**: Sobre-densificada, grilla semanal embebida, pierde foco.
- **Vieja solución**: Reloj inteligente — hora grande, franja, qué materia toca ahora.
- **Lección para v3.0**: Hoy = dashboard del momento. UN hero (reloj), UNA sección primaria (qué toca ahora), y el resto colapsado o removido. La grilla semanal pertenece a la vista Semana, no a Hoy. Si hay algo urgente, mostrarlo como badge o notificación, no como sección.

### Onboarding
- **v2.0 problema**: Funcional pero sin teatralidad ni cierre dramático.
- **Vieja solución**: Narrativa fuerte, propuesta de valor clara, cierre celebratorio.
- **Lección para v3.0**: El onboarding es la primera impresión del producto. Debe ser diseñado como si fuera un landing page — cada palabra importa, cada transición importa, la entrada a la app debe sentirse como un momento. No es un wizard de configuración, es una bienvenida.

### Semana
- **v2.0 acierto**: Drag & drop funcional, orientación H/V, popover de edición.
- **v2.0 problema**: z-index bajo en popover (40 vs shell 1200), posible bug de navegación inesperada.
- **Lección para v3.0**: La grilla de Semana estaba bien. Mantener la lógica, pero: (a) z-index centralizado desde el día 1, (b) celdas más compactas visualmente, (c) no duplicar esta vista dentro de Hoy.

### Kanban
- **v2.0 acierto**: Accesibilidad (keyboard navigation para ciclar estado).
- **v2.0 carencia**: Tarjetas con menos metadata visible que la vieja.
- **Lección para v3.0**: Kanban está bien. Agregar más señal por tarjeta (tipo, alerta, progreso de checklist) sin perder la limpieza.

### Backlog
- **v2.0 carencia**: Menos señal táctica por fila que la vieja.
- **Lección para v3.0**: Cada fila de backlog debe mostrar: título, tipo (icono), materia (color dot), prioridad, alerta si aplica, progreso de checklist si aplica. Todo inline, sin expandir.

### Calendario
- **v2.0 estado**: Funcional, paridad con la vieja.
- **Lección para v3.0**: Mantener. No overcomplicar.

### Materias
- **v2.0 problema**: Cards expandidas pueden saturar, falta escaneo rápido.
- **Vieja solución**: Tablero compacto con expansión progresiva.
- **Lección para v3.0**: Default = compacto (nombre, horas semana, estado objetivo). Click = expandir para ver sesiones, tareas, acciones. Patrón de progressive disclosure.

### Configuración
- **v2.0 estado**: Funcional, buena cobertura.
- **Lección para v3.0**: Mantener. Mover aquí las acciones que no pertenecen al header (período, importar, reset).

### Ayuda
- **v2.0 carencia**: Útil pero resumida, falta profundidad narrativa.
- **Vieja solución**: Guía paso a paso, orden de adopción, tono de producto.
- **Lección para v3.0**: La ayuda debe escribirse con tono de producto (rioplatense, cercano), no como documentación técnica. Debe explicar el "por qué" antes del "cómo". Debe tener un orden lógico de adopción (primero materias, después horario, después sesiones).

### Datos (Import/Export/Drive)
- **v2.0 acierto**: Normalización defensiva, manejo de conflictos Drive.
- **Lección para v3.0**: Preservar la lógica tal cual. Es sólida.

---

## 7. Patrones que funcionan vs. antipatrones

### ✅ Patrones que funcionan

| Patrón | Ejemplo en v2.0 | Por qué funciona |
|--------|------------------|-------------------|
| Reducer puro para mutación | `reducer.ts` con 25+ acciones | Predecible, testeable, un solo punto de verdad |
| Service layer como fachada | `service.ts` expone `addTask()`, `editTask()` | Componentes no saben de estado interno |
| Selectores derivados | `selectors.ts` → objetivos, alertas, filtros | Evita duplicación, componentes más simples |
| CSS Modules con tokens | `tokens.css` + `*.module.css` | Scoped por default, temas via custom properties |
| Store separados por dominio | Planner / UI / Pomo / Drive | Responsabilidad clara, sin store gigante |
| Tests en capa de dominio | `plannerService.test.ts`, `usePlannerStore.test.ts` | Testean lógica de negocio, no UI internals |
| Normalización defensiva | `normalizer.ts` en import | Maneja JSON de cualquier versión anterior |
| ConfirmModal compartido | Reemplazó `window.confirm` | UX consistente para acciones destructivas |
| Custom properties centralizadas | `tokens.css`, `themes.css` | Cambio de tema = cambio de variables, nothing else |

### ❌ Antipatrones que evitar

| Antipatrón | Ejemplo en v2.0 | Qué hacer en v3.0 |
|------------|------------------|---------------------|
| z-index hardcoded | Shell 1200, Nav 1300, Pomo 1600, Popover 40 | `layers.css` con escala de z-index centralizada desde el día 1 |
| Header como cajón de sastre | Logo + nav + subtítulo + acciones + período + tema + drive + datos + ayuda + settings | Header = logo + nav + 1-2 indicadores. Todo lo demás, a otro lugar |
| Vistas maximalistas | Hoy con urgencias + ahora + más tarde + grilla semanal embebida | 1 protagonista por vista, progressive disclosure para el resto |
| Estética como fase final | 7 fases "de estética" después de 27 funcionales | Cada componente se ve bien ANTES de pasar al siguiente |
| Componentes sin budget visual | Header creció a 350px sin que nadie lo bloqueara | Definir cuántos px puede ocupar cada sección antes de codear |
| Priorizar cantidad de features sobre calidad de experiencia | 12 campos en TaskModal desde el inicio | Empezar con los 5 campos esenciales, el resto entra después |
| Empty states genéricos | "No hay tareas" sin CTA | Siempre: mensaje contextual + CTA + tono de producto |
| Test de screenshot ausente | Sin comparación visual automatizada | Protocolo A/B contra la vieja después de cada módulo |

---

## 8. Principios para v3.0

### Principio 1: Estética y función van juntas, siempre

Cada componente se diseña visualmente al mismo tiempo que se programa. No existe un componente "funcional pero feo temporalmente". Si no se ve bien, no se mergea. El criterio de "terminado" incluye obligatoriamente la apariencia.

### Principio 2: La vieja es el north star visual

La versión estable define el piso estético. Cada módulo se compara contra ella antes de considerarse cerrado. Se puede ser diferente, se puede ser mejor, pero no se puede ser peor.

### Principio 3: Un protagonista por vista

Antes de codear una vista, definir: ¿cuál es el elemento protagonista? Todo lo demás se subordina. Si una vista tiene 3 cosas que compiten por atención, hay que elegir una.

### Principio 4: Budgets visuales por zona

Definir de entrada cuánto espacio ocupa cada zona:
- Header: máx 64px
- Sidebar (si aplica): máx 240px
- Vista principal: todo el resto
- Overlays/modales: centrados, máx 560px de ancho

Estos números son restricciones de diseño, no sugerencias.

### Principio 5: Progressive disclosure

Mostrar poco por defecto, expandir a demanda. Aplica a:
- Materias (compact → detailed)
- Hoy (ahora → más tarde)
- Backlog (row → modal)
- Settings (categorías colapsadas)

### Principio 6: El onboarding y el pomodoro se diseñan primero

Son las dos experiencias con más impacto emocional. Si estas dos están impecables, el usuario perdona imperfecciones menores en el resto. Diseñarlas antes que cualquier otra vista.

### Principio 7: Personalidad en todo

Cada texto visible al usuario debe tener voz de producto (rioplatense, motivador, con personalidad). No hay textos genéricos. Hasta un "No hay tareas" debe tener carácter.

### Principio 8: Menos features, más experiencia

v3.0 no necesita más features que v2.0. Necesita las mismas (o menos) features, pero cada una hecha con cariño visual. Si hay que elegir entre agregar un campo nuevo y pulir la experiencia de un campo existente, siempre pulir.

---

## 9. Lo que hay que recuperar de la vieja

Estas son las cualidades de la versión estable que la v3.0 debe capturar:

1. **Header de 56px** — Toda la navegación en una línea. Iconos con letra (H, S, M, B, K, C). Compacto, invisible, funcional.
2. **Reloj inteligente en Hoy** — Hora grande, fecha, franja. Focalizado. Sin grilla semanal.
3. **Pomodoro inmersivo** — Panel "EN SESIÓN" que domina la pantalla. Timer grande, métricas, pausa, 3 controles jerárquicos.
4. **Onboarding teatral** — Propuesta de valor fuerte, transiciones entre pasos, cierre celebratorio.
5. **Identidad visual con carácter** — El glifo ◈, los emojis con intención, la tipografía expresiva, la personalidad por tema.
6. **Tono rioplatense** — "Configurá", "Agregá", no "Configure", "Agregue". Cercano, no formal.
7. **Escaneo rápido en Materias** — Cards compactas con info esencial visible de un vistazo.
8. **Señal táctica en Backlog** — Tipo + alerta + estado + progreso, todo visible por fila.
9. **Ayuda profunda y secuencial** — Guía de adopción, no referencia técnica.
10. **Estados vacíos que guían** — Nunca un vacío sin contexto. Siempre CTA con personalidad.

---

## 10. Lo que hay que preservar de v2.0

Estas son las decisiones de v2.0 que fueron acertadas y deben mantenerse:

### Stack & tooling
- React 18 + TypeScript 5 + Vite 5 + Zustand 4 + CSS Modules
- vitest + @testing-library/react para tests
- Feature-based project structure
- Sin React Router (no hay navegación por URL, todo es estado)
- Sin Tailwind (CSS Modules + tokens = más legible, más controlable)

### Arquitectura de estado
- `usePlannerStore` con reducer puro
- `useUIStore` para estado de UI
- `usePomoStore` para pomodoro
- `useDriveStore` para Google Drive
- Service layer (`service.ts`) como fachada
- Selectores puros (`selectors.ts`) para datos derivados

### Lógica de dominio
- `reducer.ts` — Todas las mutaciones del planner centralizadas
- `normalizer.ts` — Import defensivo que soporta cualquier formato previo
- `alertEngine.ts` — Evaluación de reglas para alertas/urgencias
- `franjas.ts` + `timezone.ts` — Lógica de franjas horarias
- `export.ts` — Exportación de datos

### Componentes compartidos
- `Modal.tsx` — Base reutilizable para modales
- `ConfirmModal.tsx` — Para acciones destructivas (nunca más `window.confirm`)
- `SlotGrid.tsx` — Grilla de slots reutilizable
- `HorasEditor.tsx` — Editor de horas reutilizable

### Hooks compartidos
- `useClickOutside`, `useFocusTrap`, `useKeyDown`, `useLocalStorage`

### Accesibilidad
- aria-labels, roles semánticos, aria-expanded
- Keyboard navigation funcional
- axe-playwright como gate de calidad

### Tests existentes
- `plannerService.test.ts` — Tests de integración del service layer
- `usePlannerStore.test.ts` — Tests del store
- `useUIStore.test.ts` — Tests del UI store
- `TaskModal.test.tsx` — Tests del componente modal

---

## 11. Errores que no repetir

### Error #1: Separar fases "funcionales" de fases "estéticas"
**Qué pasó**: 27 fases funcionales, luego 7 estéticas. Las estéticas fueron siempre un parche.
**En v3.0**: No hay fases estéticas separadas. Cada componente se entrega con su estética final.

### Error #2: No tener budgets visuales
**Qué pasó**: El header creció sin límite. Hoy acumuló secciones sin criterio. Materias mostró todo expandido.
**En v3.0**: Definir budgets en px para cada zona ANTES de codear. El header no puede superar 64px. Punto.

### Error #3: No comparar contra la vieja durante el desarrollo
**Qué pasó**: La comparación se hizo al final, cuando ya era tarde para cambios estructurales.
**En v3.0**: Protocolo A/B después de cada módulo. Abrir la vieja, abrir la nueva, comparar. Si la nueva pierde en la rúbrica estética, no se avanza.

### Error #4: Priorizar completitud funcional sobre calidad de experiencia
**Qué pasó**: TaskModal con 12 campos desde el inicio. Todas las vistas con todas las features. Exhaustivo pero abrumador.
**En v3.0**: Empezar con lo esencial. Un campo más se agrega solo cuando los existentes ya se ven perfectos.

### Error #5: z-index sin sistema
**Qué pasó**: Shell 1200, Nav 1300, Pomo 1600, Popover 40. Conflictos de capas constantes.
**En v3.0**: `layers.css` con escala centralizada (base → dropdown → sticky → popover → shell → modal → toast). Hardcoded = error de build.

### Error #6: Header como contenedor de todo
**Qué pasó**: Logo, navegación, subtítulo, período, tema, acciones de tarea, drive, datos, ayuda, settings — todo en el header.
**En v3.0**: El header tiene: logo + iconos de navegación + 1-2 indicadores de estado. Nada más. Las acciones infrecuentes van en un panel de settings o menú overflow.

### Error #7: Vistas que hacen demasiado
**Qué pasó**: Hoy mostraba urgencias + ahora + más tarde + grilla semanal. Materias mostraba sesiones + tareas + acciones expandidas por defecto.
**En v3.0**: Una vista = una función primaria. Todo lo demás es secundario y progresivo.

### Error #8: Onboarding y Pomodoro como "una feature más"
**Qué pasó**: Se implementaron con la misma prioridad y ritual que configuración o backlog. Resultado: funcionales pero sin alma.
**En v3.0**: Son los dos momentos que más impactan la percepción del producto. Se diseñan primero, con más detalle, y con más escrutinio visual.

### Error #9: Empty states genéricos
**Qué pasó**: "No hay tareas", "No hay materias" — sin CTA, sin contexto, sin personalidad.
**En v3.0**: Cada empty state tiene: mensaje contextual + qué hacer + CTA + tono de producto. Se diseñan junto con el estado lleno, no como caso edge.

### Error #10: No tener un criterio de calidad estética explícito
**Qué pasó**: "Se ve bien" era subjetivo. No había un estándar escrito hasta la auditoría comparativa final.
**En v3.0**: Usar la rúbrica estética (6 criterios, 0-5) desde el primer módulo:
1. Identidad visual y personalidad (≥4 en módulos clave)
2. Jerarquía y foco primario (≥4 en módulos clave)
3. Densidad y respiración
4. Expresividad tipográfica
5. Estado activo y feedback
6. Coherencia transversal

---

## 12. Preguntas abiertas para v3.0

Estas son decisiones que la v3.0 debe tomar antes de empezar a codear:

1. **¿Se parte del código de v2.0 o se escribe de cero?**
   - Opción A: Fork de v2.0, refactorizar layouts y componentes de presentación manteniendo la lógica de dominio.
   - Opción B: Proyecto nuevo, copiar selectivamente modules de dominio (`reducer.ts`, `normalizer.ts`, `alertEngine.ts`, tipos, selectores) y reescribir toda la UI.
   - Recomendación del autor: Opción B. La lógica de dominio es sólida y simplemente se copia. La UI necesita replantearse desde la raíz, no parcharse.

2. **¿Se mantiene CSS Modules o se cambia?**
   - CSS Modules funcionó bien para scoping. El problema no fue CSS Modules — fue no tener un sistema visual antes de escribir CSS.
   - Una alternativa a considerar: CSS Modules + un design system pequeño (componentes base: Button, Card, Stack, Grid) que fuerze consistencia.

3. **¿Cómo se garantiza la comparación continua con la vieja?**
   - Sugerencia: Screenshot tests con playwright contra la versión estable (ya tenemos playwright configurado).
   - Alternativa manual: Abrir ambas side-by-side después de cada módulo.

4. **¿Cuál es el orden de módulos para v3.0?**
   - Propuesta basada en experiencia: Shell → Onboarding → Hoy → Pomodoro → Semana → Kanban → Backlog → Materias → Calendario → Config → Datos → Ayuda
   - Shell primero porque define el espacio para todo lo demás.
   - Onboarding segundo porque es la primera impresión.
   - Hoy y Pomodoro tercero/cuarto porque son los de mayor impacto emocional.

5. **¿Se diseña primero en Figma/boceto o se diseña en código?**
   - La vieja se diseñó en código y funcionó. Pero era un solo archivo.
   - Para v3.0 con componentes React, un boceto rápido (aunque sea papel) de cada vista antes de codear podría evitar el problema de "componente funcional sin visión de layout".

6. **¿Se simplifica el modelo de datos?**
   - El modelo actual (PlannerData) es comprensivo y funcional. No hay razón evidente para cambiarlo.
   - Pero considerar: ¿los 12 campos de tarea son todos necesarios desde el inicio? ¿Se puede empezar con 5-6 y expandir?

---

## Nota final

La v2.0 no fue un fracaso — fue un aprendizaje masivo. Produjo un codebase limpio, una lógica de dominio robusta, y una comprensión profunda de qué hace que la versión vieja se sienta bien. Todo ese conocimiento está ahora destilado aquí.

La v3.0 tiene la oportunidad de combinar lo mejor de ambos mundos: la arquitectura moderna de v2.0 con la experiencia visual de la vieja. Para lograrlo, **la estética no puede ser la última capa — tiene que ser la primera restricción**.

> "La nueva se siente herramienta; la estable se siente producto."
> La v3.0 debe sentirse producto desde el primer commit.
