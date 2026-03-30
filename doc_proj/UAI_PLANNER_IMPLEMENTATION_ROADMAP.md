# UAI Planner — Plan de Implementación: Paridad Estética + Funcional

Fecha: 2026-03-29
Prerequisito: Leer `UAI_PLANNER_COMPARACION_CONSOLIDADA.md` para contexto completo de hallazgos.

---

## Principio guía

> Usar la base de código limpia de la nueva versión (React + TS + Zustand + CSS Modules)
> para alcanzar y superar el nivel estético y funcional de la old-version.
> Cada cambio se mide contra la old-version como north star visual.

---

## Fase 1 — Header compacto y capas estables

**Objetivo**: Reducir la huella del header de ~350px a ~56-70px y resolver conflictos de z-index.
**Severidad cerrada**: S1 (header), S2 (capas), S1 (bug Semana popover z-index)
**Impacto**: Más alto que cualquier otro cambio — afecta TODAS las vistas.

### 1.1 Rediseño del ChromeShell compacto

**Archivos a modificar**:
- `src/features/shell/ChromeShell.tsx`
- `src/features/shell/ChromeShell.module.css`
- `src/features/shell/NavBar.tsx`
- `src/features/shell/NavBar.module.css`

**Cambios concretos**:

1. **Modo pinned = barra single-line** (como la estable):
   - Logo/nombre a la izquierda
   - Botones de vista como iconos con letra (H, S, K, B, C, M) + tooltip
   - Acciones globales compactas a la derecha (?, ⚙, 💾, período)
   - Altura fija: 56px

2. **Modo hover/expandido = panel completo** (como hoy pero solo en hover):
   - Se despliega el contenido actual (subtítulo, botones con texto, acciones extendidas)
   - Solo se activa en modo no-pinned al pasar mouse sobre la peek bar

3. **Mover acciones contextuales fuera del header**:
   - `+ Nueva tarea` e `Importar tareas` → FAB o barra de acciones dentro de las vistas que lo necesitan (Backlog, Kanban)
   - `Período` y `Theme` → solo visible en header expandido o en Settings
   - `Drive desconectado` → icono compacto con estado (●/○) como en la estable

**Referencia visual**: La estable usa `📌 ◈ UAI | ◈H ◈S ◉M | ≡B ⬡K ◷C | ? ⚙ 💾●` en una sola línea.

### 1.2 Z-index centralizado

**Archivo a crear**: `src/styles/layers.css` (custom properties)

```css
:root {
  --z-base: 0;
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-popover: 300;
  --z-shell: 400;
  --z-modal-backdrop: 500;
  --z-modal: 600;
  --z-pomo-widget: 700;
  --z-toast: 800;
}
```

**Archivos a actualizar** (reemplazar z-index hardcoded):
- `ChromeShell.module.css` (1200 → `var(--z-shell)`)
- `NavBar.module.css` (1300 → `var(--z-popover)` para popovers)
- `PomoWidget.module.css` (1600 → `var(--z-pomo-widget)`)
- `Modal.module.css` (verificar que use `var(--z-modal)`)
- `SlotEditPopover.module.css` (40 → `var(--z-popover)`)

### 1.3 Keyboard expand para shell

**Archivo**: `src/features/shell/ChromeShell.tsx`

Agregar `onFocus` handler en el contenedor que contenga la navegación, para que Tab expanda el shell automáticamente cuando un control interno recibe foco.

### Exit criteria Fase 1
- [ ] Header pinned ≤ 70px de altura en desktop
- [ ] Contenido de la vista visible sin scroll desde el primer viewport
- [ ] Navigación por teclado funcional (Tab expande shell)
- [ ] z-index centralizado, sin hardcoded, sin clips de popovers
- [ ] SlotEditPopover de Semana funcional sin interceptación de clicks
- [ ] Screenshot A/B: nueva ≥ estable en "espacio útil para contenido"

---

## Fase 2 — Pomodoro: experiencia inmersiva de sesión

**Objetivo**: Transformar el widget mínimo en una experiencia de sesión que iguale/supere la estable.
**Severidad cerrada**: S1 (Pomodoro activo)
**Impacto**: Feature más diferenciada del planner.

### 2.1 Modo foco de sesión activa

**Archivos a crear**:
- `src/features/pomodoro/PomoFocusView.tsx`
- `src/features/pomodoro/PomoFocusView.module.css`

**Diseño** (siguiendo el modelo de la estable "EN SESION"):
- Ocupa el área de vista completa (reemplaza `<main>` temporalmente)
- Timer grande central (MM:SS o HH:MM:SS)
- Materia con color dot + nombre prominente
- Tarea (si aplica) debajo del timer
- **Métricas contextuales**:
  - Horas esta semana para la materia
  - Objetivo semanal (mín/máx) + barra de progreso
  - Slots asignados esta semana
- **Controles jerárquicos**:
  - `⏸ Pausar` / `▶ Reanudar` (primario)
  - `⏹ Terminar y guardar` (secundario)
  - `✕ Cancelar sin guardar` (terciario, con confirmación si >60s)

### 2.2 Toggle focus/compact

**Archivos a modificar**:
- `src/features/pomodoro/PomoWidget.tsx` — agregar botón "🔼 Expandir" que active focus mode
- `src/features/pomodoro/PomoFocusView.tsx` — botón "Minimizar a widget" que vuelva a compact

**Estado**: Agregar `focusMode: boolean` a `usePomoStore`.

### 2.3 Pausa en el store

**Archivo**: `src/store/usePomoStore.ts`

Agregar:
- `isPaused: boolean`
- `pomoPaused()` — setea `isPaused = true`
- `pomoResumed()` — setea `isPaused = false`

**Archivo**: `src/features/pomodoro/usePomoTimer.ts`

Modificar el `setInterval` para que no incremente `elapsedSeconds` cuando `isPaused === true`.

### 2.4 Métricas de sesión en tiempo real

**Archivo**: `src/features/pomodoro/PomoFocusView.tsx`

Usar selectores existentes del planner store:
- `data.materias[id].objetivoHoras` → objetivo semanal
- Calcular horas semanales sumando sesiones de la semana actual
- Mostrar barra de progreso: `horasEstaSemana / objetivoMax`

### Exit criteria Fase 2
- [ ] Modo foco ocupa viewport completo con timer protagonista
- [ ] Métricas contextuales visibles (horas semana, objetivo, progreso)
- [ ] Pausa/reanudación funcional
- [ ] 3 controles jerárquicos (Pausar, Terminar, Cancelar)
- [ ] Toggle compact ↔ focus sin pérdida de estado
- [ ] Persistencia: sesión sobrevive a reload (ya existe en store)
- [ ] Screenshot A/B: nueva ≥ estable en "experiencia de sesión activa"
- [ ] Rúbrica estética: identidad ≥ 4, foco ≥ 4, feedback ≥ 4

---

## Fase 3 — Hoy como dashboard focalizado

**Objetivo**: Reducir densidad de Hoy para que funcione como "reloj inteligente" del momento actual.
**Severidad cerrada**: S1 (sobre-densificación)

### 3.1 Simplificación de secciones

**Archivos a modificar**:
- `src/features/views/hoy/HoyView.tsx`
- `src/features/views/hoy/HoyView.module.css`

**Cambios concretos**:
1. **Quitar la grilla semanal embebida** (`WeekReferenceSection`) — esta información pertenece a la vista Semana.
2. **Hero del momento** — Reloj grande + fecha + emoji franja (como la estable con 21:38 prominente).
3. **Ahora** — Materias del slot actual con progreso semanal y CTA "Iniciar sesión".
4. **Más tarde hoy** — Colapsado por defecto, expandible.
5. **Urgencias** — Mantener (es mejora sobre estable), pero como sección secundaria con conteo solo.
6. Si no hay materias asignadas: **mensaje orientativo con CTA** "Configurá tu horario → Semana".

### 3.2 Componente HeroClock

**Archivo a crear**: `src/features/views/hoy/HeroClock.tsx`

Reloj en tiempo real (actualiza cada minuto), fecha completa, emoji de franja actual. Estilo monospace grande como en la estable.

### Exit criteria Fase 3
- [ ] Vista Hoy cabe en un viewport sin scroll (estado vacío y con 1-2 materias)
- [ ] Grilla semanal NO presente en Hoy
- [ ] Reloj grande visible como hero
- [ ] Screenshot A/B: nueva ≥ estable en "claridad del momento actual"
- [ ] Rúbrica: foco ≥ 4, densidad ≥ 4

---

## Fase 4 — Onboarding con cierre dramático

**Objetivo**: Igualar la teatralidad y narrativa de la estable en los 3 pasos + entrada a la app.
**Severidad cerrada**: S1 (onboarding), S2 (window.confirm, transiciones)

### 4.1 Transiciones entre pasos

**Archivo**: `src/features/onboarding/OnboardingFlow.tsx`

Agregar `CSS transition` o `@keyframes` para fade/slide entre pasos (no renderizado condicional abrupto).

### 4.2 Eliminar window.confirm

**Archivo**: `src/features/onboarding/OnboardingFlow.tsx`

Reemplazar `window.confirm()` en paso 3 (datos demo con data existente) por `ConfirmModal` compartido (ya existe en `src/shared/components/ConfirmModal.tsx`).

### 4.3 Refinar copy del paso 1

Acercar el copy al nivel narrativo de la estable:
- Propuesta de valor más fuerte y específica
- Preview que se sienta más "real" (no cartón)
- Feature cards con copy más concreto y motivador

### 4.4 Entrada celebratoria a la app

En vez de `modeChanged('planner') + viewChanged('hoy')` directo:
1. Brief flash/animation de confirmación ("¡Listo! Tu planner está configurado")
2. Fade-out del onboarding
3. Fade-in de la app en vista Hoy

### Exit criteria Fase 4
- [ ] Transición animada entre los 3 pasos
- [ ] Sin `window.confirm` — usa ConfirmModal
- [ ] Copy paso 1 revisado y más narrativo
- [ ] Entrada a la app con micro-animación de cierre
- [ ] Screenshot A/B: nueva ≥ estable en "impresión del primer minuto"

---

## Fase 5 — Identidad visual y personalidad

**Objetivo**: Que cada tema tenga carácter propio y que el sistema visual sea reconocible.
**Severidad cerrada**: S2 (identidad visual), S2 (microcopy)

### 5.1 Refuerzo de temas

**Archivo**: `src/styles/themes.css`

Para cada uno de los 5 temas (Noche, Pizarrón, Claro, Hueso, Bosque):
- Revisar que tengan personalidad diferenciada más allá de cambiar colores base
- Agregar variaciones en: border-radius, shadow intensity, accent saturation
- Verificar contraste WCAG en cada tema

### 5.2 Tipografía expresiva

**Archivo**: `src/styles/tokens.css`

- Verificar escala tipográfica: el hero de Hoy debería usar un size muy diferente al body
- Asegurar que títulos de vista se sientan "de producto" no "de admin panel"
- Monospace para timer y datos numéricos (ya presente pero verificar consistencia)

### 5.3 Empty states guiados

**Archivos a modificar** (cada vista principal):
- `src/features/views/hoy/HoyView.tsx`
- `src/features/views/semana/SemanaView.tsx`
- `src/features/views/materias/MateriasView.tsx`
- `src/features/views/backlog/BacklogView.tsx`

Agregar mensajes con CTA cuando la vista está vacía:
- Hoy sin materias: "Configurá tu horario semanal → Ir a Semana"
- Semana vacía: "Agregá tus materias en Configuración → ⚙"
- Backlog vacío: "Creá tu primera tarea → + Nueva tarea"
- Materias vacía: "Configurá tus materias → ⚙"

### 5.4 Microcopy del header

Revisar cada label/tooltip para que sea accionable y no solo descriptivo.

### Exit criteria Fase 5
- [ ] Cada tema tiene personalidad reconocible (no solo cambia color base)
- [ ] Contraste WCAG verificado en todos los temas
- [ ] Escala tipográfica clara: hero > título > subtítulo > body > caption
- [ ] Empty states con CTA en las 4 vistas principales
- [ ] Rúbrica: identidad ≥ 4, expresividad tipográfica ≥ 4

---

## Fase 6 — Ayuda profunda y vistas de detalle

**Objetivo**: Llevar la ayuda al nivel de la estable y refinar vistas secundarias.
**Severidad cerrada**: S1 (ayuda), S2 (Materias densidad, Backlog señal táctica)

### 6.1 Expansión de HelpGuide

**Archivo**: Componentes bajo la HelpGuide existente

- Expandir cada sección con más profundidad narrativa (orden de adopción, qué configurar primero)
- Agregar capturas/ilustraciones inline si es viable
- Tono: amigable, rioplatense, como manual de usuario no como docs técnicos

### 6.2 Materias: información progresiva

**Archivos**:
- `src/features/views/materias/MateriasView.tsx`
- `src/features/views/materias/MateriaCard.tsx` (o equivalente)

Implementar patrón colapsable:
- Por defecto: nombre + horas semana + estado objetivo (como la estable)
- Expandido: sesiones, tareas, acciones (como está hoy)

### 6.3 Backlog: más señal por fila

**Archivos**:
- `src/features/views/backlog/BacklogRow.tsx`
- `src/features/views/backlog/BacklogRow.module.css`

Agregar inline: tipo icon, alerta/urgencia icon, progreso de checklist si aplica.

### Exit criteria Fase 6
- [ ] Ayuda con profundidad equivalente a la estable
- [ ] Materias colapsable, escaneo rápido por defecto
- [ ] Backlog con más señal táctica visible por fila
- [ ] Screenshot A/B: nueva ≥ estable en ayuda y vistas de detalle

---

## Fase 7 — Responsive, a11y y QA final

**Objetivo**: Cierre de calidad transversal.
**Severidad cerrada**: S2 (responsive), S2 (keyboard a11y shell)

### 7.1 Responsive con header compacto

Re-ejecutar smoke tests en desktop/tablet/mobile con el nuevo header compacto.

### 7.2 Audit a11y final

- Teclado: Tab → focus shell expand → navegar → accionar (con cambio de Fase 1.3)
- axe-playwright: re-ejecutar suite existente
- Roles y labels en nuevos componentes (PomoFocusView, HeroClock)

### 7.3 Segunda ronda de scoring

Re-ejecutar el scoring del §3 de la comparación consolidada. Meta: promedio ≥ 2.5/3.

### Exit criteria Fase 7
- [ ] axe-playwright sin violaciones
- [ ] Smoke responsive estable en 3 viewports
- [ ] Score de paridad promedio ≥ 2.5/3
- [ ] Rúbrica estética ≥ 3.8/5 en módulos de alto impacto

---

## Orden de ejecución recomendado

```
Fase 1 (Header)  ─── impacto máximo, desbloquea todas las vistas
   │
   ├── Fase 2 (Pomodoro)  ─── feature más diferenciada
   │
   ├── Fase 3 (Hoy)  ─── se beneficia directamente del header compacto
   │
   └── Fase 4 (Onboarding)  ─── primera impresión del producto
          │
          ├── Fase 5 (Identidad visual)  ─── transversal
          │
          ├── Fase 6 (Ayuda + vistas detalle)  ─── contenido
          │
          └── Fase 7 (QA final)  ─── cierre
```

Fases 2, 3 y 4 pueden ejecutarse en paralelo una vez completada la Fase 1.
Fases 5 y 6 pueden ejecutarse en paralelo.
Fase 7 es secuencial al final.

---

## KPIs de seguimiento

| KPI | Meta | Cómo medir |
|-----|------|------------|
| Altura del header pinned | ≤ 70px | Screenshot + DevTools |
| Score paridad promedio | ≥ 2.5/3 | Re-scoring contra estable |
| Rúbrica estética (alto impacto) | ≥ 3.8/5 | Rúbrica de §6.3 del doc de comparación |
| Violaciones axe-playwright | 0 | `npm run test:a11y` |
| Pomodoro: controles en focus mode | 3 (Pausar, Terminar, Cancelar) | Conteo funcional |
| Hoy: scroll necesario | 0 (todo en 1 viewport) | Screenshot 1280×800 |
| Regresiones responsive | 0 nuevas por fase | Smoke test 3 viewports |

---

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|------------|
| Rediseño del header rompe flujos existentes | Feature branch + smoke tests antes de merge |
| z-index centralizado genera regresiones | Migración uno por uno con diff visual |
| Pomodoro focus mode añade complejidad de estado | Estado minimal (focusMode + isPaused) en store existente |
| Cambios estéticos subjetivos sin criterio claro | Protocolo A/B obligatorio contra estable |
| Grilla semanal quitada de Hoy molesta a usuarios acostumbrados | Considerar mantener como link "Ver semana completa →" sin embed |
