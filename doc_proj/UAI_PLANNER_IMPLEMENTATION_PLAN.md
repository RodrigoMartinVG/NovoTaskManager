# UAI Planner — Plan de Implementación por Fases
## De cero a producción: entregables, criterios y dependencias

> **Cómo leer este documento**
> Cada fase tiene un **objetivo** (una sola oración), **prerequisitos** (qué debe estar completo antes),
> **entregables** (qué archivos y funcionalidad quedan listos), y **criterios de aceptación**
> (cómo verificar que la fase está realmente terminada, no solo "más o menos lista").
>
> Las estimaciones de complejidad son relativas entre fases: S = sesión corta (~1h),
> M = media jornada (~3h), L = jornada completa (~6h), XL = más de una jornada.
>
> **Documentos de referencia:**
> - `UAI_PLANNER_FUNCTIONAL_SPEC.md` — qué hace la app
> - `UAI_PLANNER_TECH_ARCHITECTURE.md` — cómo está construida

---

## MAPA DE FASES

```
BLOQUE 1 — FUNDACIONES (Fases 1–4)
  Fase 1 → Proyecto y toolchain
  Fase 2 → Sistema de tipos
  Fase 3 → Lógica de dominio pura
  Fase 4 → Capa de persistencia

BLOQUE 2 — ESTADO Y SHELL (Fases 5–7)
  Fase 5 → Stores de Zustand
  Fase 6 → Estilos base y sistema de temas
  Fase 7 → App shell y navegación

BLOQUE 3 — ONBOARDING (Fase 8)
  Fase 8 → Flujo de bienvenida completo

BLOQUE 4 — VISTAS PRINCIPALES (Fases 9–14)
  Fase 9  → Vista Backlog (la más simple como primer render)
  Fase 10 → Vista Kanban
  Fase 11 → Vista Materias
  Fase 12 → Vista Calendario
  Fase 13 → Vista Semana
  Fase 14 → Vista Hoy

BLOQUE 5 — SISTEMA DE TAREAS (Fases 15–17)
  Fase 15 → TaskModal (detalle)
  Fase 16 → FormModal (crear/editar)
  Fase 17 → ImportTasksModal

BLOQUE 6 — POMODORO (Fase 18)
  Fase 18 → Timer Pomodoro completo

BLOQUE 7 — CONFIGURACIÓN (Fases 19–21)
  Fase 19 → SettingsModal — Materias y Tipos
  Fase 20 → SettingsModal — Horarios, Alertas y Tema
  Fase 21 → ResetModal y ManualSessionModal

BLOQUE 8 — GOOGLE DRIVE (Fases 22–23)
  Fase 22 → Servicio Drive y autenticación OAuth
  Fase 23 → Sincronización, conflictos y auto-save

BLOQUE 9 — IMPORT/EXPORT (Fase 24)
  Fase 24 → Backup JSON, importación completa e importación incremental

BLOQUE 10 — POLISH Y CIERRE (Fases 25–27)
  Fase 25 → Guía de ayuda (HelpGuide)
  Fase 26 → Accesibilidad y pulido visual
  Fase 27 → Testing integral y validación final
```

**Dependencias críticas entre bloques:**
- Bloque 2 depende de Bloque 1
- Bloque 3 depende de Bloque 2
- Bloque 4 depende de Bloques 2 y 3
- Bloques 5, 6, 7 dependen de Bloque 4
- Bloque 8 depende de Bloques 3 y 5
- Bloque 9 depende de Bloque 3
- Bloque 10 depende de todos los anteriores

---

## BLOQUE 1 — FUNDACIONES

---

### FASE 1 — Proyecto y Toolchain

**Objetivo:** tener un repositorio git con Vite + React + TypeScript corriendo, linters configurados y la estructura de carpetas vacía pero nombrada.

**Prerequisitos:** ninguno — es el punto de partida.

**Complejidad:** S

#### Entregables

**Archivos creados:**
```
uai-planner/
├── src/
│   ├── domains/      (vacío)
│   ├── store/        (vacío)
│   ├── features/     (vacío)
│   ├── shared/       (vacío)
│   ├── styles/       (vacío)
│   ├── App.tsx       (placeholder: <div>UAI Planner</div>)
│   └── main.tsx      (ReactDOM.createRoot)
├── tests/
│   ├── unit/         (vacío)
│   ├── integration/  (vacío)
│   └── visual/       (vacío)
├── archive/
│   └── uai_planner_estable_.html  (copia del monolito — solo lectura)
├── index.html
├── vite.config.ts
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
├── .eslintrc.cjs
└── package.json
```

**Configuraciones implementadas:**
- Vite con alias `@/`, `@domains/`, `@store/`, `@features/`, `@shared/`
- TypeScript strict con `noUncheckedIndexedAccess: true`
- ESLint con reglas de `@typescript-eslint` y `react-hooks`
- Vitest con setup de `localStorage` mock
- Playwright apuntando a `http://localhost:4173`
- Scripts: `dev`, `build`, `preview`, `test`, `test:watch`, `test:visual`, `lint`, `typecheck`, `validate`
- Git inicializado con `.gitignore` apropiado

#### Criterios de aceptación
```bash
npm run dev          # levanta en localhost:5173, muestra "UAI Planner"
npm run build        # compila sin errores ni warnings
npm run typecheck    # 0 errores de TypeScript
npm run lint         # 0 errores de ESLint
npm run test         # 0 tests (pero el runner funciona)
```

---

### FASE 2 — Sistema de Tipos

**Objetivo:** definir el contrato completo de tipos TypeScript que describe todos los datos y estados de la aplicación, sin ninguna lógica asociada.

**Prerequisitos:** Fase 1 completa.

**Complejidad:** S

#### Entregables

**Archivo principal:** `src/domains/planner/types.ts`

Tipos de dominio completos:
- `Materia`, `MateriaSlot`
- `TipoTarea`
- `Tarea`, `ChecklistItem`
- `Sesion`
- `PlannerData`
- `FranjaHoraria`, `FranjaMap`
- `AlertasConfig`

Tipos de estado de aplicación:
- `AppMode` (`'welcome' | 'local' | 'drive'`)
- `ViewMode` (`'hoy' | 'semana' | 'kanban' | 'backlog' | 'calendar' | 'materias'`)
- `SyncStatus` (`'idle' | 'saving' | 'saved' | 'error'`)
- `ThemeId` (los 5 temas)
- `TareaEstado`, `Prioridad`, `Periodo`, `SesionOrigen`
- `DiaId`, `FranjaId`, `FranjaMode`
- `GridLayout`, `AlertColor`

Tipos de UI (en sus respectivos archivos de store — declarados pero sin implementación):
- `ConfirmConfig`
- `DriveConflict`
- `PomoSession`
- `GlobalFilters`, `ListFilters`, `StoredFilters`

**Archivo de declaraciones Google Identity Services:**
`src/types/google-identity.d.ts` — tipos para `google.accounts.oauth2`

#### Criterios de aceptación
```bash
npm run typecheck    # 0 errores — todos los tipos son válidos
```

Verificación manual: abrir `types.ts` y confirmar que `PlannerData` contiene todos los campos documentados en la Spec Funcional §2.

---

### FASE 3 — Lógica de Dominio Pura

**Objetivo:** implementar todas las funciones de negocio de la app como funciones TypeScript puras sin dependencias de React, testeable en aislamiento total.

**Prerequisitos:** Fase 2 completa.

**Complejidad:** L

#### Entregables

**`src/domains/planner/reducer.ts`** — mutaciones de PlannerData
Acciones implementadas:
- `LOAD_DATA` — reemplaza todo el dataset
- `ADD_TAREA`, `UPDATE_TAREA`, `DELETE_TAREA`
- `MOVE_TAREA` — cambia `estado`
- `MOVE_TASK_TO_DATE` — cambia `fechaInicio` o `fechaLimite`
- `TOGGLE_CHECKLIST_ITEM`
- `IMPORT_TAREAS` — agrega múltiples tareas con IDs nuevos
- `UPDATE_MATERIA_HORAS` — actualiza min/max/slots de una materia
- `MOVE_MATERIA_SLOT` — mueve un slot de día+franja
- `UPDATE_MATERIAS`, `UPDATE_TIPOS`
- `ADD_SESION`, `ADD_SESION_WITH_TASK`, `UPDATE_SESION`, `DELETE_SESION`

**`src/domains/planner/selectors.ts`** — derivaciones puras
- `selectMateriasFiltradas(data, filters)`
- `selectMatIdsActivos(materias)` → `Set<string>`
- `selectTareasFiltradas(data, matIds, listFilters)`
- `selectSubjectsById(materias)` → `Record<string, Materia>`
- `selectTaskTypesById(tipos)` → `Record<string, TipoTarea>`
- `selectUrgentTasks(tareas, alertas)`
- `selectHorasSemanaPorMateria(sesiones, materiaId)` → horas en últimos 7 días
- `selectSesionesPorTarea(sesiones, tareaId)`

**`src/domains/alerts/alertEngine.ts`** — sistema de alertas
- `getAlertColor(tarea, config)` → `AlertColor | null`
- Los 6 estados: `red`, `yellow`, `green`, `start_overdue`, `start_now`, `start_soon`
- `getUrgentTaskSummary(tareas, alertas)` → conteo por color

**`src/domains/schedule/timezone.ts`** — manejo de horario
- `getPlannerNowParts(date?)` → `{ weekdayId, year, month, day, hour, minute }`
- `getDiaActual(date?)` → `DiaId`
- `getMomentoActual(date?)` → `FranjaId`
- Timezone hardcodeado: `America/Argentina/Ushuaia`

**`src/domains/schedule/franjas.ts`** — franjas horarias
- `DEFAULT_FRANJAS_3`, `DEFAULT_FRANJAS_6` — objetos de configuración por defecto
- `DIAS` — array de 7 días con `id` y `label`
- `franjasTo6(franjas3)` — expande 3 franjas a 6
- `franjasTo3(franjas6)` — colapsa 6 franjas a 3
- `slotsTo6(slots, franjas3)` — convierte slots de materias al pasar a 6 franjas
- `slotsTo3(slots, franjas6)` — convierte slots al pasar a 3 franjas
- `getMateriasParaHoy(materias, franjas)` — materias activas ahora
- `getMateriasMasTarde(materias, franjas)` — materias con slots en franjas futuras del día

**`src/domains/import-export/normalizer.ts`** — normalización de datos
- `normalizePlannerData(raw: unknown)` → `PlannerData`
- `parseImportPayload(text, defaults)` → `Tarea[]`
- `cloneChecklist(items)` → `ChecklistItem[]`
- `createEmptyPlannerData()` → `PlannerData`
- `SAMPLE_DATA` — los datos de demo (7 materias, ~15 tareas, ~17 sesiones)
- `DEFAULT_TIPOS` — los 6 tipos de tarea por defecto
- `hashData(data)` → `string` — para dirty tracking

**`src/domains/import-export/export.ts`** — exportación
- `downloadPlannerJSON(data, prefix?)` — descarga el JSON del planner

**`src/utils/cn.ts`** — utilidad de classNames
- `cn(...classes)` → string

**`src/utils/dateUtils.ts`** — utilidades de fechas
- `daysUntil(dateStr)` → `number | null`
- `formatDate(dateStr)` → string local (`"24 Mar"`)
- `localISONow()` → string (`"YYYY-MM-DDTHH:MM:00"`)

**Tests unitarios en `tests/unit/`:**
- `reducer.test.ts` — cada acción con casos normales y edge cases
- `alertEngine.test.ts` — los 6 colores con sus condiciones límite
- `franjas.test.ts` — conversión 3↔6, getMomentoActual con fechas mock
- `normalizer.test.ts` — datos válidos, parciales y corruptos
- `selectors.test.ts` — selectMateriasFiltradas, selectTareasFiltradas

#### Criterios de aceptación
```bash
npm run test         # todos los tests pasan
npm run typecheck    # 0 errores
npm run lint         # 0 errores
```

Cobertura mínima en `domains/`: 85% de líneas. Los casos de borde más importantes:
- `getAlertColor` con tarea completada y fecha vencida → `null`
- `normalizePlannerData` con `null` → devuelve planner vacío sin tirar error
- `franjasTo6` y `franjasTo3` son operaciones inversas (ida y vuelta consistente)

---

### FASE 4 — Capa de Persistencia

**Objetivo:** implementar `PlannerService` como única puerta de entrada a `localStorage`, con todas las claves tipadas y normalización defensiva.

**Prerequisitos:** Fase 3 completa.

**Complejidad:** M

#### Entregables

**`src/domains/planner/service.ts`** — implementación completa de `PlannerService`

Todos los métodos de lectura/escritura documentados en la arquitectura técnica §6, incluyendo:
- `loadData(email?)` con normalización defensiva
- `saveData(data, email?)` con try/catch y `console.error`
- La key de datos incluye el email: `uai-planner-data-v1-{email}` o `uai-planner-data-v1`
- `getTheme()` con fallback a `'noche'`
- `getLastView()` con fallback a `'hoy'`
- `getFranjas()` con fallback a `DEFAULT_FRANJAS_3`
- Todas las constantes de keys de localStorage como objeto `LS` inmutable

**`src/shared/hooks/useLocalStorage.ts`** — hook genérico

```typescript
function useLocalStorage<T>(
  key: string,
  defaultValue: T,
  options?: { serialize?; deserialize? }
): [T, (value: T | ((prev: T) => T)) => void]
```

**Tests de integración en `tests/integration/`:**
- `plannerService.test.ts` — load/save ciclo completo con localStorage mock
- `plannerService.test.ts` — load con datos corruptos devuelve estado vacío
- `plannerService.test.ts` — keys distintas para email distinto

#### Criterios de aceptación
```bash
npm run test         # todos los tests pasan incluyendo los de integración
```

Verificación manual:
- Abrir la app en dev → consola sin errores
- Cambiar datos en devtools → `PlannerService.loadData()` los retorna normalizados
- Insertar JSON corrupto en localStorage → la app no revienta

---

## BLOQUE 2 — ESTADO Y SHELL

---

### FASE 5 — Stores de Zustand

**Objetivo:** implementar los cuatro stores de Zustand que gestionan todo el estado reactivo de la app, conectados a la capa de persistencia.

**Prerequisitos:** Fases 3 y 4 completas.

**Complejidad:** M

#### Entregables

**`src/store/usePlannerStore.ts`**
- Estado: `data`, `dirty`, `lastSavedHash`
- Acciones nombradas en pasado (ver arquitectura §4.2)
- Internamente usa `plannerReducer` de `domains/planner/reducer.ts`
- `dirty` se calcula comparando `hashData(data)` con `lastSavedHash`
- Al inicializar: carga desde `PlannerService.loadData()`
- Cada acción que modifica `data` dispara `PlannerService.saveData(data)` automáticamente

**`src/store/useUIStore.ts`**
- Estado: `activeView`, `filters`, `listFilters`, todos los modales (campos nominados, no array)
- Acciones nominadas para cada modal y filtro
- `viewChanged()` persiste en `PlannerService.setLastView()`
- `anioChanged()`, `periodoToggled()` persisten en `PlannerService.setFilters()`

**`src/store/useDriveStore.ts`**
- Estado: `connected`, `status`, `message`, `autoSave`, `conflict`, `userEmail`, `showSyncPanel`
- Solo estado de UI de Drive — la lógica OAuth va en Fase 22
- Las acciones son receptores de eventos: `driveConnected()`, `syncSucceeded()`, etc.

**`src/store/usePomoStore.ts`**
- Estado: `session`, `contextMateria`, `elapsedSeconds`
- `tickOccurred()` — incrementa `elapsedSeconds` en 1
- `pomoStopped()` — calcula y retorna `Sesion | null`, resetea el store
- **No incluye el `setInterval`** — eso va en un hook en Fase 18

**Tests de integración:**
- `usePlannerStore.test.ts` — `tareaAdded` genera ID único, actualiza `dirty`
- `usePlannerStore.test.ts` — `tareaElim` reduce el array en 1
- `useUIStore.test.ts` — `taskSelected(id)` setea `selectedTaskId`

#### Criterios de aceptación
```bash
npm run test         # todos los tests pasan
npm run typecheck    # 0 errores
```

Verificación manual:
- En devtools React, los 4 stores están visibles con su estado inicial
- `usePlannerStore.getState().data` retorna el planner cargado de localStorage

---

### FASE 6 — Estilos Base y Sistema de Temas

**Objetivo:** tener el sistema de estilos completamente funcional: los 5 temas aplicándose con `data-theme`, los tokens rem y las clases base de la app.

**Prerequisitos:** Fase 1 completa (puede correr en paralelo con Fases 2–5).

**Complejidad:** S

#### Entregables

**`src/styles/themes.css`** — copia exacta de los 5 bloques `[data-theme="..."]` del monolito
- Sin ninguna modificación a los valores
- Los 5 temas: `hueso`, `claro`, `noche`, `pizarron`, `cafe`
- Todos los tokens: `--bg0..3`, `--border`, `--border2`, `--text0..3`, `--accent`, `--info-*`, `--warn-*`, `--ok-*`, `--err-*`, `--overlay`, `--dark`

**`src/styles/tokens.css`** — escala rem y variables de spacing
- Tipografía: `--t-xxs` (0.5625rem) hasta `--t-3xl` (1.125rem)
- Espaciado: `--sp-1` (0.25rem) hasta `--sp-16` (2rem)
- Border radius: `--r-xs` hasta `--r-full`

**`src/styles/reset.css`** — reset minimal
```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
```

**`src/styles/base.css`** — base global
```css
html, body { min-height: 100vh; font-family: 'DM Mono', 'Fira Code', 'Courier New', monospace; font-size: 0.8125rem; }
body { background: var(--bg0); color: var(--text0); transition: background .25s, color .25s; }
/* scrollbar custom, input:focus, select option */
```

**`src/main.tsx`** — aplica el tema antes del primer render
```typescript
const savedTheme = localStorage.getItem('uai-theme') || 'noche'
document.documentElement.setAttribute('data-theme', savedTheme)
```

**`src/shared/components/Badge.tsx`** — componente Badge reutilizable
- Props: `bg`, `accent`, `isDark`, `label`, `icon?`
- Implementa `badgeStyle(bg, accent, isDark)`:
  - Dark mode: fondo `accent + "22"`, texto `accent`, borde `accent + "44"`
  - Light mode: fondo `bg`, texto `accent`

**`src/shared/components/ProgressBar.tsx`**
- Props: `pct: number | null`, `isDark`, `size?: 'sm' | 'md'`, `showPct?`, `showFrac?`
- Si `pct === null` → retorna `null`
- Color de la barra según `progressColor(pct, isDark)`

#### Criterios de aceptación

Abrir `localhost:5173` y ejecutar en consola:
```javascript
document.documentElement.setAttribute('data-theme', 'noche')    // fondo negro
document.documentElement.setAttribute('data-theme', 'claro')    // fondo blanco
document.documentElement.setAttribute('data-theme', 'hueso')    // fondo cálido claro
document.documentElement.setAttribute('data-theme', 'pizarron') // fondo azul marino
document.documentElement.setAttribute('data-theme', 'cafe')     // fondo marrón oscuro
```
Cada cambio aplica inmediatamente sin flash ni parpadeo.

---

### FASE 7 — App Shell y Navegación

**Objetivo:** tener la estructura base de la app funcionando: header colapsable con pin, navegación entre las 6 vistas (con contenido placeholder), y el cambio de tema funcionando desde la UI.

**Prerequisitos:** Fases 5 y 6 completas.

**Complejidad:** L

#### Entregables

**`src/App.tsx`** — árbol principal
- Condición `appMode === 'welcome'` → muestra placeholder "Onboarding (Fase 8)"
- Para `local` y `drive` → muestra `AppShell`
- Las 6 vistas lazy-loaded, cada una con un placeholder `<div>Vista X</div>`
- `Suspense` con skeleton mínimo

**`src/features/shell/AppShell.tsx`** — contenedor principal
- Monta `ChromeShell` + área de contenido con padding-top dinámico
- `useDriveAutoSave` hook — debounce de 2.5s para auto-save (conecta `data` con `driveStore`)

**`src/features/shell/ChromeShell.tsx`** — header colapsable
- Estado `chromePinned` persistido en `PlannerService`
- Comportamiento peek/pin completo:
  - Colapsado: solo asoma la lengüeta con el nombre de la vista activa
  - Hover o clic en lengüeta → expande
  - Botón pin → mantiene expandido permanentemente
- `ResizeObserver` + `MutationObserver` para calcular el offset del contenido
  - Múltiples `requestAnimationFrame` para manejar timing en distintos navegadores
  - `useLayoutEffect` para aplicar el offset antes de que el navegador pinte

**`src/features/shell/NavBar.tsx`** — barra de navegación (dentro del header expandido)
Componentes implementados en esta fase:
- Botones de las 6 vistas (activo resaltado con `--accent`)
- `ThemeSwitcher` — popover con los 5 temas, aplica inmediatamente
- Filtro de período (popover con año + C1/C2/Anual)
  - Año "Todos" o cualquier año disponible en las materias
  - Períodos: multiselect, nunca puede quedar vacío
- Botón `?` (Ayuda) — placeholder para Fase 25
- Botón `⚙` (Configuración) — placeholder para Fase 19

Componentes diferidos (mostrar como placeholder):
- `UrgentBanner` — Fase 16 (después de implementar alertas)
- Botones de Drive — Fase 22
- Botón exportar/importar — Fase 24

**`src/features/shell/UnsavedToast.tsx`**
- Aparece cuando `dirty === true && !driveConnected && !isDemo`
- Mensaje: "Cambios sin guardar — exportá tu backup para no perder nada"
- Posición: fija en la parte inferior

**`src/shared/components/Modal.tsx`** — shell base de modal
```typescript
interface ModalProps {
  title: string
  icon?: ReactNode
  onClose: () => void
  maxWidth?: number
  children: ReactNode
}
```
- Overlay con `onClick: onClose` y bloqueo de propagación en el card
- `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- `onKeyDown: e.key === 'Escape' → onClose`

**`src/shared/hooks/useClickOutside.ts`**
**`src/shared/hooks/useKeyDown.ts`**
**`src/shared/hooks/useFocusTrap.ts`**

#### Criterios de aceptación

Verificación visual:
- El header colapsa y se expande con hover/clic
- El botón pin funciona y persiste al recargar
- Los 6 botones de navegación cambian la vista activa
- El ThemeSwitcher cambia el tema inmediatamente
- El filtro de período funciona (el estado cambia pero no hay tareas aún)
- `UnsavedToast` aparece si se modifica `data` manualmente vía devtools

```bash
npm run typecheck && npm run lint   # 0 errores
```

---

## BLOQUE 3 — ONBOARDING

---

### FASE 8 — Flujo de Bienvenida

**Objetivo:** implementar el onboarding completo: los 3 pasos (bienvenida, tema, dataset), el flujo de entrada a la app, y los datos de demo.

**Prerequisitos:** Fases 5, 6, y 7 completas.

**Complejidad:** M

#### Entregables

**`src/features/onboarding/OnboardingFlow.tsx`**

Paso 1 — `welcome`:
- Fondo: grilla de puntos CSS (linear-gradient en pseudo-elemento) + degradado radial
- Logo `◈` con animación `pulse` de glow en `--accent`
- Título "UAI Planner" + subtítulo "PLANIFICADOR ACADÉMICO"
- Card con descripción y grid 2×2 de features (📅 ✓ 🍅 📊)
- Botón "Empezar →" → avanza a `tema`

Paso 2 — `tema`:
- Grid de 5 chips de tema con miniatura de 2 barras de colores representativos
- Seleccionar un tema → `PlannerService.setTheme()` + aplica a `<html>` inmediatamente
- El chip activo tiene borde `--accent` y fondo `--info-bg`
- Botón "← Atrás" + "Continuar →"

Paso 3 — `dataset`:
- Detecta si hay datos existentes (`!isEmptyData(PlannerService.loadData())`)
- Opción resaltada "⚡ Empezar rápido" → planner vacío → entra a la app
- Opción "🎲 Explorar con datos de ejemplo" → carga `SAMPLE_DATA` → entra a la app
- Si hay datos existentes: botón extra "Salir a la app" (sin cambiar nada)
- Si hay datos existentes: aviso de que se pedirá confirmación antes de reemplazar

Indicador de pasos: chips pill numerados en la parte superior del card.

**Transición al entrar a la app:**
- `PlannerService.setMode('local')`
- `usePlannerStore.dataLoaded(data)`
- `useUIStore.viewChanged('hoy')`
- Al entrar por primera vez: `useUIStore.helpOpened()` (la guía se abre automáticamente — el componente de guía está en Fase 25, pero la señal existe)

**`src/domains/import-export/normalizer.ts`** — completar `SAMPLE_DATA`
El objeto debe incluir los 7 materias, ~15 tareas y ~17 sesiones documentadas en la Spec Funcional Apéndice A, con fechas relativas a `Date.now()` para que siempre sean "actuales".

#### Criterios de aceptación

Flujo completo verificado manualmente:
1. Limpiar localStorage → recargar → aparece el onboarding en paso 1
2. "Empezar →" → paso 2 con 5 temas
3. Seleccionar un tema → se aplica inmediatamente a la pantalla
4. "Continuar →" → paso 3
5. "Empezar rápido" → app con planner vacío, vista Hoy (placeholder)
6. Limpiar localStorage → repitir → "Explorar con datos de ejemplo" → app con datos de demo
7. Tener datos, ir a onboarding (desde `?` → "Reiniciar la bienvenida") → se muestra aviso de datos existentes, se muestra botón "Salir a la app"

---

## BLOQUE 4 — VISTAS PRINCIPALES

> **Nota sobre el orden de implementación:**
> Las vistas se implementan de menor a mayor complejidad de estado interno. El Backlog es el más simple
> (solo lista + filtros) y la Vista Hoy es el más compleja (franjas horarias + tiempo real + urgencias).
> Cada vista puede desarrollarse y probarse de forma independiente.

---

### FASE 9 — Vista Backlog

**Objetivo:** implementar la lista completa de tareas con ordenamiento, indicadores de urgencia, y clic para abrir el detalle.

**Prerequisitos:** Fases 5 y 7 completas.

**Complejidad:** M

#### Entregables

**`src/features/views/backlog/BacklogView.tsx`** — contenedor
- Lee `data`, `listFilters`, `alertas` del store
- Calcula `tareasFiltradas` con `selectTareasFiltradas`
- Pasa datos al componente presentacional

**`src/features/views/backlog/BacklogList.tsx`** — presentacional
- Ordena las tareas: completadas al fondo (opacidad 0.5), el resto por `fechaLimite` ascendente, sin fecha al final
- Renderiza `BacklogRow` por cada tarea

**`src/features/views/backlog/BacklogRow.tsx`**
Anatomía de fila (izquierda a derecha):
- Borde izquierdo 3px con `materia.color`
- Ícono del tipo (emoji, ~15px)
- Nombre de materia (9px, gris)
- Título con `text-decoration: line-through` si completada
- Chip de hora (`task.hora`) si presente
- Badge del tipo (con `badgeStyle`)
- Barra de progreso del checklist (si `items.length > 0`) + fracción "X/Y"
- Fecha límite formateada "24 Mar" (o fecha inicio si la alerta es `start_*`)
- Días restantes con color según alerta (`urgColor`)
- Ícono 📹 si tiene `link_vc`

Clic en fila → `useUIStore.taskSelected(task.id)`

**Filtros de lista** (ya declarados en `useUIStore`, ahora con UI):
- `src/features/shell/ListFilters.tsx` — componentes de filtro (materia/tipo/alerta)
- Integrar en `NavBar` para que aparezcan en las vistas de lista

**Estado vacío:** si no hay tareas → mensaje "Todavía no hay tareas cargadas. Creá tu primera tarea desde el botón +" con call-to-action.

#### Criterios de aceptación

Con datos de demo cargados:
- La lista muestra ~15 tareas con el orden correcto
- Las completadas están al fondo con opacidad reducida
- Los filtros de materia y tipo funcionan
- Clic en una tarea → `selectedTaskId` se setea (el modal viene en Fase 15)

---

### FASE 10 — Vista Kanban

**Objetivo:** tablero Kanban de 3 columnas con drag-and-drop nativo para mover tareas entre estados.

**Prerequisitos:** Fase 9 completa.

**Complejidad:** M

#### Entregables

**`src/features/views/kanban/KanbanView.tsx`** — contenedor

**`src/features/views/kanban/KanbanBoard.tsx`** — presentacional
- 3 columnas: `pendiente`, `en_progreso`, `completado`
- Cada columna muestra el conteo en el título
- Layout: flex row en desktop, scroll horizontal en mobile

**`src/features/views/kanban/KanbanColumn.tsx`**
- Header con nombre + conteo
- Área de drop: `onDragOver` (con `preventDefault`), `onDrop`
- Fondo resaltado (`--info-bg`) mientras hay un drag encima
- `onDragLeave` resetea el highlight

**`src/features/views/kanban/KanbanCard.tsx`**
Misma información que `BacklogRow` pero en formato card vertical:
- Borde izquierdo de color de materia
- Materia en gris, título, badge de tipo
- Chip de hora + ícono 📹 si aplican
- Fecha + días con color de urgencia
- Barra de progreso del checklist
- `draggable={true}`, `onDragStart` → guarda en un `useState` local qué card se arrastra

**Estado de drag:** local al `KanbanBoard` con `useState`, no al store global.

**Al soltar:** `usePlannerStore.tareaEstadoCambiado(id, columna)` 

**Orden dentro de columna:** igual que Backlog (fecha ascendente, sin fecha al fondo).

#### Criterios de aceptación

- Arrastrar una tarea de "Pendiente" a "En progreso" → se mueve
- Al soltar, el estado persiste al recargar
- El conteo de cada columna se actualiza inmediatamente
- Clic en card → `selectedTaskId` se setea

---

### FASE 11 — Vista Materias

**Objetivo:** vista de seguimiento por materia con horas de estudio acumuladas, objetivos configurables y listado de sesiones.

**Prerequisitos:** Fase 9 completa.

**Complejidad:** M

#### Entregables

**`src/features/views/materias/MateriasView.tsx`** — contenedor

**`src/features/views/materias/MateriaCard.tsx`**
- Dot de color + nombre + código + tag de período ("C1 2026")
- Barra de progreso de horas semanales: "Xh esta semana / min–max objetivo"
  - Calcula horas con `selectHorasSemanaPorMateria(sesiones, materiaId)`
  - Color de barra: gris (sin objetivo), verde (dentro del rango), amarillo (bajo el min), azul (sobre el max)
  - Si `horasMin === 0 && horasMax === 0` → no muestra la barra
- Botón "▶ Iniciar sesión" → `usePomoStore.contextOpened(materia)` (modal viene en Fase 18)
- Botón "✎ Objetivos" → `useUIStore.objetivoEditOpened(materia.id)` (modal viene en Fase 21)
- Botón "＋ Cargar sesión manual" → `useUIStore.manualSessionOpened(materia.id)` (modal viene en Fase 21)

**`src/features/views/materias/MateriaSessionList.tsx`**
- Lista cronológica de sesiones de una materia
- Cada sesión: fecha formateada, duración en minutos, tarea asociada (si la hay), título
- Botón editar → inline form para cambiar duración/título/tarea (pequeño, dentro del card)
- Botón eliminar → `ConfirmModal` → `usePlannerStore.sesionEliminada(id)`

**`src/features/views/materias/MateriaTaskList.tsx`**
- Lista simple de tareas de la materia con estado y fecha

**`src/shared/components/HorasEditor.tsx`** — editor de objetivos horarios
- Inputs `min` y `max` de horas semanales
- `SlotGrid` para asignar franjas (componente siguiente)
- Validación: `min` ≤ `max`
- Botones Cancelar / Guardar

**`src/shared/components/SlotGrid.tsx`** — grilla de slots día × franja
- Lee las franjas actuales de `PlannerService.getFranjas()`
- Toggle de cada celda (●/○)
- Actualiza el array de `slots` del formulario padre

#### Criterios de aceptación

- Las materias muestran correctamente las horas de la semana calculadas de las sesiones
- El color de la barra de progreso es correcto según los objetivos
- Las sesiones se listan y pueden eliminarse con confirmación

---

### FASE 12 — Vista Calendario

**Objetivo:** calendário mensual con eventos de fechas de inicio y límite de tareas, navegación por mes y drag para mover fechas.

**Prerequisitos:** Fase 9 completa.

**Complejidad:** L

#### Entregables

**`src/features/views/calendar/CalendarView.tsx`** — contenedor
- Estado local: `currentMonth: Date` (persiste en `useUIStore`)
- Lee `tareasFiltradas`, `showInicio`, `showFin` del store

**`src/features/views/calendar/CalendarHeader.tsx`**
- Título "Marzo 2026" con flechas `<` `>`
- `CalendarFilterSelector` — popover para togglear inicio/fin
  - Dos opciones: "Fecha inicio" y "Fecha fin" — ambas pueden estar activas
  - Nunca pueden estar ambas desactivadas simultáneamente
  - El botón muestra "Inicio y fin", "Inicio", "Fin" o "Sin eventos" según el estado

**`src/features/views/calendar/CalendarGrid.tsx`**
- Grid 7 columnas (Dom–Sáb)
- Headers de día en la primera fila
- Celdas del mes: algunos días del mes anterior/siguiente rellenando el grid
- El día de hoy: número resaltado con `--accent`

**`src/features/views/calendar/CalendarCell.tsx`**
- Lista de eventos del día (inicio y/o fin según filtro)
- Cada evento: punto de color de materia + título truncado
- Si hay más de N eventos: "+X más" colapsable
- `onDrop` — actualiza `fechaLimite` o `fechaInicio` de la tarea

**`src/features/views/calendar/CalendarEvent.tsx`**
- Draggable
- Clic → `useUIStore.taskSelected(task.id)`

**Lógica de "qué día muestra cada tarea":**
- Si `showInicio && task.fechaInicio` → aparece en esa celda
- Si `showFin && task.fechaLimite` → aparece en esa celda
- Una tarea puede aparecer dos veces si tiene ambas fechas y ambos filtros están activos

#### Criterios de aceptación

- El mes navega correctamente con las flechas
- Las tareas con demo data aparecen en sus fechas correspondientes
- El filtro de inicio/fin funciona (toggle activa/desactiva eventos)
- Drag de un evento a otra celda → `fechaLimite` se actualiza y persiste

---

### FASE 13 — Vista Semana

**Objetivo:** grilla semanal con los dos layouts (horizontal/vertical), drag-and-drop de slots de materias, y edición de slots por clic.

**Prerequisitos:** Fases 9 y 11 completas (necesita `SlotGrid` y lógica de slots).

**Complejidad:** XL

#### Entregables

**`src/features/views/semana/SemanaView.tsx`** — contenedor
- Lee materias filtradas, franjas, layout activo del store
- Selector de layout: botones "⇆ Horizontal" / "⇅ Vertical"
- El layout persiste en `PlannerService.setGridLayout()`

**`src/features/views/semana/HorizontalGrid.tsx`**
- Filas: franjas | Columnas: días
- Header row con los 7 días (día activo resaltado con `--accent` + borde inferior)
- Column header row con los ids de franja + emoji + label
- Celdas: `SemanaCell` (ver abajo)

**`src/features/views/semana/VerticalGrid.tsx`**
- Filas: días | Columnas: franjas (layout transpuesto)
- Misma lógica pero con ejes intercambiados

**`src/features/views/semana/SemanaCell.tsx`**
- Props: `dia`, `franjaId`, `materias: Materia[]` (las que tienen ese slot)
- Estilo especial si es el slot actual (día+franja actuales)
- `onDragOver` + `onDrop` → drag receptor
- `onClick` → abre `SlotEditPopover`
- Chips de materia: cada chip es draggable, tiene `onDragStart`

**`src/features/views/semana/SlotEditPopover.tsx`**
- Lista de materias asignadas a esa celda con botón × para quitar
- Select "AGREGAR MATERIA" → agrega materia a ese slot
- `usePlannerStore.materiaHorasCambiadas()` o acción específica de slots

**Drag-and-drop de chips:**
- Estado local en `SemanaView`: `dragInfo: { materiaId, fromDia, fromFranjaId } | null`
- Al soltar en otra celda: `usePlannerStore.materiaSlotMovido(materiaId, from, to)`

**Indicador del slot actual:**
- `getMomentoActual()` y `getDiaActual()` de `domains/schedule/timezone.ts`
- La celda actual tiene borde `--accent` y fondo `--info-bg`

#### Criterios de aceptación

- El grid horizontal muestra las franjas en filas y los 7 días en columnas
- El grid vertical muestra los días en filas y las franjas en columnas
- El botón de layout alterna entre los dos y persiste al recargar
- Arrastrar un chip de materia a otra celda → el slot cambia
- La celda del slot actual tiene estilo diferente
- Clic en celda vacía → abre el popover para agregar materia

---

### FASE 14 — Vista Hoy

**Objetivo:** vista principal del día con las materias del slot actual, materias de franjas futuras, tareas urgentes y accesos directos al Pomodoro.

**Prerequisitos:** Fase 13 completa (comparte lógica de franjas y slots).

**Complejidad:** L

#### Entregables

**`src/features/views/hoy/HoyView.tsx`** — contenedor
- Calcula el estado actual: `getDiaActual()`, `getMomentoActual()`
- `getMateriasParaHoy(materias, franjas)` → materias del slot actual
- `getMateriasMasTarde(materias, franjas)` → materias de franjas futuras del día
- `selectUrgentTasks(tareas, alertas)` → tareas urgentes

**`src/features/views/hoy/CurrentSlotSection.tsx`**
- Título "Ahora — 🌅 Mañana" (franja actual con emoji)
- Si hay materias: tarjetas expandidas de cada materia (ver `HoyMateriaCard`)
- Si no hay materias: "No hay materias asignadas a este horario. Configurá tu horario semanal →"

**`src/features/views/hoy/HoyMateriaCard.tsx`**
- Dot de color + nombre de materia
- Barra de horas semanales (como en MateriasView)
- Botón "▶ Iniciar sesión de estudio" → `usePomoStore.contextOpened(materia)`

**`src/features/views/hoy/LaterSection.tsx`**
- Título "Más tarde hoy"
- Cards compactos (solo nombre + mini barra de horas)
- Si no hay materias más tarde: ocultar la sección

**`src/features/views/hoy/UrgentTasksSection.tsx`**
- Título "Tareas urgentes" + conteo
- Lista de tarjetas de tareas urgentes (misma info que `BacklogRow` pero más compacta)
- Color del borde izquierdo según el `alertColor`
- Clic → `useUIStore.taskSelected(task.id)`
- Si no hay urgentes: ocultar la sección

**Grilla semanal de referencia** (al final de HoyView):
- Versión compacta del `HorizontalGrid` o `VerticalGrid` de SemanaView
- Mismo comportamiento de edición de slots
- Título "📅 Semana" con selector de layout

#### Criterios de aceptación

- Con datos de demo: la sección "Ahora" muestra las materias del slot actual
- "Más tarde hoy" muestra las materias de franjas posteriores
- Las tareas urgentes se listan con sus colores de urgencia
- Los botones de Pomodoro setean `contextMateria` en el store (el widget viene en Fase 18)

---

## BLOQUE 5 — SISTEMA DE TAREAS

---

### FASE 15 — TaskModal (Detalle de Tarea)

**Objetivo:** modal de detalle completo de una tarea con toda su información, acceso al checklist toggleable y acciones (editar, eliminar, iniciar Pomodoro).

**Prerequisitos:** Fase 7 (Modal base) y Fase 9 (Backlog — se activa desde ahí).

**Complejidad:** M

#### Entregables

**`src/features/tasks/TaskModal.tsx`**

Se monta cuando `useUIStore.selectedTaskId !== null`.

Cabecera:
- Dot de color de materia (10×10px, redondo), nombre de materia (gris pequeño), título (h2)
- Badge del tipo con colores propios
- Botón ✕

Cuerpo:
- Descripción (si la hay), gris
- Grid de metadatos 2 columnas:
  - Estado (selector inline — cambia sin cerrar el modal: `tareaEstadoCambiado`)
  - Prioridad
  - Fecha inicio (si existe)
  - Fecha límite (si existe)
  - Hora (si existe)
  - Obligatorio (sí/no)
- Si tiene `link_vc`: botón "📹 Abrir videollamada" → `window.open(url, '_blank')` con validación `isSafeUrl`
- Si tiene `items`:
  - Barra de progreso del checklist
  - Lista de items: checkbox togglable (`checklistItemToggled`), texto
- Sección de sesiones relacionadas: lista de sesiones cuyo `tareaId === task.id`, formato compacto

Pie:
- "✎ Editar" → `taskEditOpened(task)` (abre FormModal, Fase 16)
- "🗑 Eliminar" → `confirmOpened({ ... onConfirm: () => tareaDeleted(id) })`
- "▶ Iniciar Pomodoro" → `usePomoStore.contextOpened(materia)` con tarea preseleccionada

#### Criterios de aceptación

- Clic en tarea en Backlog/Kanban → el modal se abre con todos los datos correctos
- Toggle de un ítem del checklist → se actualiza inmediatamente sin cerrar el modal y persiste
- "Eliminar" → aparece ConfirmModal → confirmar → la tarea desaparece y el modal cierra

---

### FASE 16 — FormModal (Crear y Editar Tarea)

**Objetivo:** formulario completo para crear tareas nuevas y editar existentes, con todos los campos de la Spec Funcional §11.2.

**Prerequisitos:** Fase 15 completa.

**Complejidad:** M

#### Entregables

**`src/features/tasks/FormModal.tsx`**

Se monta cuando `useUIStore.editingTask !== null` (incluyendo `{}` para tarea nueva).

Campos implementados:
- Título (required, input text, autoFocus)
- Materia (select — materias del planner actual)
- Tipo (select — tipos del planner)
- Estado (select: pendiente/en_progreso/completado)
- Prioridad (select: alta/media/baja)
- Fecha límite (date input)
- Fecha inicio (date input)
- Hora (TimeInputField — select de HH + MM con incrementos de 15min)
- Obligatorio (checkbox)
- Descripción (textarea)
- Link de videollamada (input text)
- Checklist dinámica:
  - Lista de items existentes con texto editable y botón × para eliminar
  - Botón "+ Agregar ítem" → agrega input vacío al final
  - Los items vacíos se filtran al guardar

Validaciones:
- Título no vacío
- Si ambas fechas: `fechaInicio <= fechaLimite`
- Mensaje de error inline bajo el campo con problema

Al guardar:
- Nuevo: `tareaAdded(formData)` → cierra FormModal
- Edición: `tareaUpdated(formData)` → cierra FormModal, re-abre TaskModal

**`src/shared/components/TimeInputField.tsx`** — input de hora
- Select de hora (00–23) + separador ":" + select de minutos (00/15/30/45)
- Props: `value: "HH:MM"`, `onChange: (value: string) => void`

Botón "Nueva tarea" en el header (botón `+`):
- `useUIStore.taskEditOpened(null)` → abre FormModal vacío

#### Criterios de aceptación

- Crear tarea con todos los campos → aparece en Backlog y Kanban
- Editar tarea → los cambios se reflejan en TaskModal
- Validación: intentar guardar sin título → mensaje de error visible
- Checklist: agregar 3 items, eliminar el del medio → quedan 2 en orden correcto

---

### FASE 17 — ImportTasksModal

**Objetivo:** modal para importar tareas desde JSON, con preview y validación del payload.

**Prerequisitos:** Fase 7 (Modal base).

**Complejidad:** S

#### Entregables

**`src/features/tasks/ImportTasksModal.tsx`**

- Área de texto para pegar el JSON
- Select de materia por defecto (para tareas sin `materiaId`)
- Select de tipo por defecto (para tareas sin `tipo`)
- Botón "Previsualizar" → parsea con `parseImportPayload`, muestra conteo y lista
- Preview: "Se van a importar X tareas" + lista de títulos
- Botón "Importar" (habilitado solo con preview válido) → `tareasImportadas(parsed)`
- Si el JSON es inválido: mensaje de error inline

**`src/features/shell/SchemaHint.tsx`**
- Botón desplegable "▼ Formato JSON del importador" en la parte inferior de la app
- Muestra el schema completo en `<pre>` cuando está expandido

Botón "Importar tareas" en el header → `useUIStore.importTasksOpened()`

#### Criterios de aceptación

- Pegar JSON válido de tareas → preview muestra el conteo correcto
- Importar → las tareas aparecen en Backlog con IDs únicos
- JSON inválido → error claro, sin romper la app

---

## BLOQUE 6 — POMODORO

---

### FASE 18 — Timer Pomodoro Completo

**Objetivo:** implementar el flujo completo del Pomodoro: selección de contexto, widget flotante con timer real, y guardado de la sesión al terminar.

**Prerequisitos:** Fases 5 (store) y 11 (MateriasView).

**Complejidad:** L

#### Entregables

**`src/features/pomodoro/usePomoTimer.ts`** — hook del timer
```typescript
function usePomoTimer(): void
// Monta el setInterval cuando hay sesión activa
// Llama tickOccurred() cada segundo
// Limpia el interval con cleanup del useEffect
// El interval sobrevive al cambio de vista (vive en AppShell)
```

**`src/features/pomodoro/PomoContextPopup.tsx`**

Se monta cuando `usePomoStore.contextMateria !== null`.

Opciones de contexto:
1. Trabajar en tarea existente → select con tareas no completadas de esa materia
2. Crear tarea rápida → input de título (crea la tarea al iniciar)
3. Solo sesión libre → sin tarea

Campo "Título de la sesión" (opcional).

Botón "Iniciar" →
- Si modo "nueva tarea": `usePlannerStore.tareaAdded(quickTask)` → obtener id → `usePomoStore.pomoStarted({ materiaId, tareaId: newId, titulo })`
- Otros modos: `usePomoStore.pomoStarted({ materiaId, tareaId, titulo })`

**`src/features/pomodoro/PomoWidget.tsx`**

Se monta cuando `usePomoStore.session !== null`. Posición: fija, esquina inferior derecha.

Contenido:
- Dot de color de materia + nombre de materia
- Nombre de la tarea (si la hay) en gris
- Contador MM:SS — lee `elapsedSeconds` del store, formatea
- Botón "⏹ Detener" → `usePomoStore.pomoStopped()` → si devuelve sesión, `usePlannerStore.sesionAgregada(sesion)`
- Botón "✕ Cancelar" → si `elapsedSeconds < 60`: `pomoCancelled()` directo; si ≥ 60: `confirmOpened` → `pomoCancelled()`

**Cálculo del `inicio` al detener:**
```typescript
const inicioDate = new Date(Date.now() - elapsedSeconds * 1000)
const inicio = localISONow(inicioDate)
```

**Integración en AppShell:**
```typescript
// src/features/shell/AppShell.tsx
usePomoTimer()  // activa el tick cuando hay sesión
```

#### Criterios de aceptación

- Iniciar desde materia (HoyView o MateriasView) → popup aparece
- Seleccionar "Solo sesión libre" → Iniciar → widget aparece con el timer contando
- Cambiar de vista → el timer sigue corriendo
- Detener con 5 minutos → la sesión aparece en MateriasView y en el historial de Drive
- Cancelar con > 1 minuto → aparece confirmación
- El timer muestra "00:00" al iniciar y avanza segundo a segundo

---

## BLOQUE 7 — CONFIGURACIÓN

---

### FASE 19 — SettingsModal: Materias y Tipos

**Objetivo:** implementar el modal de configuración con las dos primeras tabs: ABM de materias y ABM de tipos de tarea.

**Prerequisitos:** Fase 7 (Modal base) y Fase 11 (componente SlotGrid ya existe).

**Complejidad:** L

#### Entregables

**`src/features/settings/SettingsModal.tsx`** — modal con 5 tabs

Estructura del modal:
- Tab bar: Materias / Tipos / Horarios / Alertas / Tema
- El tab activo persiste en `useState` local (no en el store)
- Se puede abrir con un tab específico via `useUIStore.settingsOpened('materias')`

**Tab: Materias**

Lista de materias:
- Dot de color + nombre + código + tag de período
- Conteo de tareas ("3t") si tiene tareas
- Botón ✎ → abre `MateriaForm` inline dentro del modal (reemplaza el botón "+ Agregar")
- Botón ✕ → solo habilitado si `!usedMateriaIds.has(m.id)`, deshabilita con tooltip "Tiene tareas"

**`src/features/settings/MateriaForm.tsx`**
- Nombre (required), Código (required), Color (color picker nativo)
- Año (select: año anterior/actual/siguiente), Período (select: C1/C2/Anual)
- Horas/semana min y max (inputs number, 0–40)
- `SlotGrid` para horarios
- Validación: nombre y código no vacíos, min ≤ max
- Guardar: si tiene `id` → `materiasActualizadas([...updated])`, si no → agrega con `id: "mat_" + Date.now()`

**Tab: Tipos de tarea**

Lista de tipos:
- Ícono (emoji) + badge con colores propios + nombre + conteo de tareas
- Botón ✎ → `TipoForm` inline
- Botón ✕ → solo si no tiene tareas asociadas

**`src/features/settings/TipoForm.tsx`**
- Input de emoji (1–2 chars, con preview grande)
- Input de nombre (required)
- Color picker para fondo del badge
- Color picker para texto/borde del badge
- Preview en tiempo real del badge con los valores actuales
- Guardar: genera `id` del label si es nuevo (`label.toLowerCase().replace(/\s+/g, '_')`)

#### Criterios de aceptación

- Abrir Configuración → tab de Materias activo
- Crear una materia nueva → aparece en la lista y en los selects de FormModal
- Editar materia → los cambios se reflejan en todas las vistas
- Intentar eliminar materia con tareas → botón deshabilitado con tooltip
- Crear tipo nuevo → aparece en FormModal
- El badge preview del tipo refleja los colores elegidos en tiempo real

---

### FASE 20 — SettingsModal: Horarios, Alertas y Tema

**Objetivo:** completar las tabs restantes del SettingsModal: editor de franjas horarias, configuración de alertas y selector de tema.

**Prerequisitos:** Fase 19 completa.

**Complejidad:** M

#### Entregables

**Tab: Horarios** (`src/features/settings/FranjasEditor.tsx`)

Selector de modo:
- Select "3 franjas (Mañana/Tarde/Noche)" vs "6 franjas (Mañana1/2, Tarde1/2, Noche1/2)"
- Cambiar de modo → convierte los franjas (`franjasTo6` o `franjasTo3`) y los slots de materias

Editor de horarios:
- Para cada franja: emoji + nombre + TimeInputField (inicio y fin)
- Preview en tiempo real: "🌅 Mañana: 07:00 – 13:00"
- Validación: las franjas deben estar en orden cronológico, no deben solaparse
- Fin de la última franja debe ser ≤ 24:00
- Error inline si las horas no son válidas
- Botón "Guardar horarios" → `PlannerService.setFranjas(new)` + actualiza `useUIStore`

Al cambiar el modo de franjas, actualizar todos los `materia.slots` automáticamente con `slotsTo6` o `slotsTo3`.

**Tab: Alertas** (`src/features/settings/AlertasEditor.tsx`)

Sliders o inputs para:
- "Días para alerta 🔴 urgente": default 2
- "Días para alerta 🟡 próxima": default 7
- "Días para alerta 🟢 en radar": default 14
- "Días para alerta ⚡ por empezar (fecha inicio)": default 3

Preview: lista de ejemplos con los colores resultantes según los umbrales.
Guardar → `PlannerService.setAlertas(config)`.

**Tab: Tema**
- Lista de los 5 temas con dot de color y nombre
- El activo tiene ✓
- Clic → `PlannerService.setTheme(id)` + aplica al `<html>`

#### Criterios de aceptación

- Cambiar los horarios de las franjas → Vista Semana refleja los nuevos rangos
- Cambiar de 3 a 6 franjas → los slots de materias se redistribuyen sin perder ninguno
- Cambiar umbrales de alertas → el UrgentBanner se actualiza
- Cambiar tema desde Settings → se aplica inmediatamente

---

### FASE 21 — ResetModal y ManualSessionModal

**Objetivo:** implementar el modal de reset de datos y el modal para registrar sesiones de estudio manuales.

**Prerequisitos:** Fases 19 y 8 (OnboardingFlow — para reutilizar la lógica de cambio de dataset).

**Complejidad:** M

#### Entregables

**`src/features/settings/ResetModal.tsx`**

Opciones:
- "🧹 Empezar con planner vacío"
- "🧪 Cargar datos de ejemplo"

Lógica de confirmación:
- Evalúa el estado actual: `getPlannerDataKind(data)` → `'empty'|'demo'|'real'`
- Si hay datos reales → `confirmOpened` con mensaje específico
- Si Drive está conectado → el mensaje incluye aviso del impacto en Drive
- Las 6 combinaciones de estado actual × opción elegida tienen su propio mensaje (ver Spec Funcional §13.2)

**`src/features/settings/HorasEditorModal.tsx`**

Wrapper modal para `HorasEditor` (componente ya existente de Fase 11):
- Se monta cuando `useUIStore.editObjetivoMateriaId !== null`
- Carga la materia del store por ID
- Al guardar: `materiaHorasCambiadas(materiaId, min, max, slots)`

**`src/features/settings/ManualSessionModal.tsx`**

Se monta cuando `useUIStore.manualSessionMateriaId !== null`.

Campos:
- Materia (preseleccionada, puede cambiarse)
- Tarea asociada (select opcional con tareas no completadas de esa materia)
- Fecha de la sesión (date input, default: hoy)
- Hora de inicio (TimeInputField)
- Duración en minutos (number input, min: 1, default: 45)
- Título/nota (text input, opcional)
- Opción "Crear tarea rápida al guardar" → si está marcado, un segundo campo para el título de la tarea

Al guardar:
- Sin tarea rápida: `sesionAgregada(sesion)`
- Con tarea rápida: `sesionAgregadaConTarea(sesion, tarea)` → agrega ambas en una sola acción del reducer

**`src/store/useUIStore.ts`** — agregar `ConfirmModal`

**`src/shared/components/ConfirmModal.tsx`**
- Se monta cuando `useUIStore.confirm !== null`
- `ModalShell` + mensaje + dos botones (cancelar/confirmar)
- El botón de confirmación tiene color según `tone` (danger → rojo, warn → amarillo, info → azul)

#### Criterios de aceptación

- Reset a vacío con datos reales → aparece confirmación, confirmar → planner queda vacío
- Cargar demo con datos reales → confirmación → se cargan los datos de ejemplo
- Registrar sesión manual de 30 minutos → aparece en MateriasView en las horas de esa semana
- Registrar sesión manual con tarea rápida → la tarea aparece en Backlog y la sesión en MateriasView

---

## BLOQUE 8 — GOOGLE DRIVE

---

### FASE 22 — Servicio Drive y Autenticación OAuth

**Objetivo:** implementar la autenticación con Google OAuth y el servicio de bajo nivel para leer y escribir el archivo en Drive.

**Prerequisitos:** Fases 3 y 5 completas.

**Complejidad:** L

#### Entregables

**`index.html`** — agregar script de Google Identity Services
```html
<script async defer src="https://accounts.google.com/gsi/client"></script>
```

**`src/types/google-identity.d.ts`** — ya creado en Fase 2, verificar que está completo

**`src/domains/drive/driveState.ts`** — singleton mutable fuera de React
- `DriveInternalState`: `tokenClient`, `accessToken`, `tokenExpiry`, `fileId`
- `isTokenValid()` función pura
- El `fileId` se inicializa desde `localStorage.getItem(LS.DRIVE_FILE_ID)`

**`src/domains/drive/driveApi.ts`** — llamadas HTTP a Google Drive
- `driveConnect(prompt)` → resuelve con token y expiración
- `driveConnectSilent()` → igual pero sin `prompt: 'consent'`
- `driveLoad()` → lee `uai-planner.json` del Drive del usuario (busca por nombre si no hay `fileId`)
- `driveSave(data)` → PATCH si hay `fileId`, POST si es primera vez; retorna `fileId`
- `driveDisconnect()` → revoca el token OAuth, limpia el estado
- `getUserInfo(token)` → fetch a `googleapis.com/oauth2/v2/userinfo`, retorna email

**`src/features/shell/DriveDropdown.tsx`** — UI de Drive en el header

Botón "💾 Datos":
- Sin Drive: muestra opciones de backup local + "Conectar Google Drive"
- Con Drive: email del usuario, estado de sync, "Guardar ahora", "Cargar desde Drive", "Desconectar"

**`src/features/drive/useDriveConnect.ts`** — hook de conexión
Orquesta el flujo completo de `driveConnect`:
1. Llamar a `driveApi.driveConnect`
2. Obtener email via `driveApi.getUserInfo`
3. `PlannerService.setEmail(email)` + `setMode('drive')`
4. `useDriveStore.driveConnected(email)`
5. `driveApi.driveLoad()` → detectar conflicto o aplicar datos
6. Manejar el `DriveConflictModal`

**`src/features/drive/DriveConflictModal.tsx`**

Se monta cuando `useDriveStore.conflict !== null`.

Dos opciones:
- "Usar versión de Drive" → `usePlannerStore.dataLoaded(driveData)` + `driveStore.conflictResolved()`
- "Mantener mis datos locales" → `driveStore.conflictResolved()` + el local queda como activo

Mensaje explicativo de qué hace cada opción.

#### Criterios de aceptación

- Clic en "Conectar Google Drive" → se abre el popup de OAuth de Google
- Autorizar → la app muestra el email del usuario en el header
- La primera conexión sube los datos locales a Drive (si los hay) o baja los de Drive (si los hay)
- Con datos en local y datos distintos en Drive → aparece `DriveConflictModal`
- Elegir "Usar Drive" → los datos de Drive reemplazan los locales

---

### FASE 23 — Sincronización, Conflictos y Auto-save

**Objetivo:** implementar el auto-save con debounce, el guardado/carga manual, y los indicadores de estado de sincronización.

**Prerequisitos:** Fase 22 completa.

**Complejidad:** M

#### Entregables

**`src/features/drive/useDriveAutoSave.ts`** — hook del auto-save

```typescript
function useDriveAutoSave(): void
// useEffect que observa data, connected, autoSave
// debounce de 2500ms
// llama a driveApi.driveSave(data) si connected && autoSave
// actualiza driveStore.syncSucceeded() o syncFailed(message)
// se monta en AppShell
```

**`src/features/drive/useDriveSave.ts`** — guardado manual

```typescript
function useDriveSave(): { saveNow: () => Promise<void> }
// driveStore.syncStarted()
// driveApi.driveSave(data)
// driveStore.syncSucceeded()
// driveApi.driveMarkSaved()
```

**`src/features/drive/useDriveLoad.ts`** — carga desde Drive

```typescript
function useDriveLoad(): { loadNow: () => Promise<void> }
// driveStore.syncStarted()
// driveApi.driveLoad()
// usePlannerStore.dataLoaded(loaded)
// driveStore.syncSucceeded()
```

**`src/features/shell/SyncStatusIndicator.tsx`** — indicador visual en el header
- `●` verde = `saved`, `●` amarillo = `saving`, `●` rojo = `error`, `○` gris = `idle`
- Tooltip: "Guardado hace 3min" (usa `driveApi.getLastSavedLabel()`)
- Clic → toggle `showSyncPanel`

**`src/features/drive/useDriveDisconnect.ts`** — desconexión segura

Contrato crítico:
- Preserva los datos actuales localmente
- Cambia `mode` a `'local'`
- Nunca vuelve al onboarding
- Muestra mensaje de confirmación en el `syncMessage`

#### Criterios de aceptación

- Crear una tarea → esperar 2.5 segundos → el indicador muestra "Guardado hace Xs"
- "Guardar ahora" → el indicador muestra "●" amarillo brevemente → "●" verde
- "Cargar desde Drive" → los datos del Drive reemplazan los locales
- Desconectar → el email desaparece del header, los datos locales se preservan
- Desconectar → recargar la app → la app está en modo local con los datos correctos
- Auto-save con error de red → el indicador muestra "●" rojo con mensaje

---

## BLOQUE 9 — IMPORT/EXPORT

---

### FASE 24 — Backup JSON e Importación Incremental

**Objetivo:** implementar el ciclo completo de export/import del planner y la importación incremental por URL hash.

**Prerequisitos:** Fase 5 (stores).

**Complejidad:** M

#### Entregables

**`src/features/shell/ExportButton.tsx`** — botón de exportación en el header
- Estado `clean`: "↓ Exportar"
- Estado `dirty` (hay cambios no exportados): "↓ Exportar •"
- Estado `flash` (2s post-export): "✓ Exportado"
- Clic → `downloadPlannerJSON(data)` + `usePlannerStore.lastSavedHash = hashData(data)` (marca como exportado)

**`src/features/shell/ImportBackupButton.tsx`** — botón de importar backup completo
- Abre file picker nativo (`.json`)
- Parsea y normaliza con `normalizePlannerData`
- Si hay datos actuales → `confirmOpened` antes de reemplazar
- Éxito → `usePlannerStore.dataLoaded(normalized)`

**`src/features/drive/DriveDropdown.tsx`** — completar (iniciado en Fase 22)
Agregar los botones de export/import al dropdown "💾 Datos":
- "↓ Exportar backup" → `ExportButton`
- "↑ Importar backup" → `ImportBackupButton`

**`src/main.tsx`** — importación incremental por hash

```typescript
function processHashImport(): void {
  const hash = window.location.hash
  if (!hash.startsWith('#import=')) return
  try {
    const raw = JSON.parse(atob(hash.slice('#import='.length)))
    const normalized = normalizePlannerData(raw)
    const history = JSON.parse(localStorage.getItem('importaciones_uai') || '[]')
    // Reemplaza si ya existe la misma materia
    const filtered = history.filter((h: unknown) => (h as {materia?: string}).materia !== (normalized as {materia?: string}).materia)
    filtered.push(normalized)
    localStorage.setItem('importaciones_uai', JSON.stringify(filtered))
  } catch {
    console.error('[Import] Hash import failed')
  } finally {
    window.location.hash = ''
  }
}
window.addEventListener('load', processHashImport)
```

#### Criterios de aceptación

- Exportar → archivo `uai-planner_2026-03-28_14-30.json` descargado con estructura válida
- Importar ese mismo archivo → los datos se recargan
- Importar con datos actuales → aparece confirmación antes de reemplazar
- URL con `#import=BASE64` → se procesa al cargar, el hash se limpia de la URL

---

## BLOQUE 10 — POLISH Y CIERRE

---

### FASE 25 — Guía de Ayuda

**Objetivo:** implementar el modal de ayuda con sidebar navegable y contenido explicativo de todas las funcionalidades.

**Prerequisitos:** Fase 7 (Modal) y toda la app funcionando.

**Complejidad:** M

#### Entregables

**`src/features/onboarding/HelpGuide.tsx`**

Modal amplio (max-width: 1100px, height: 88vh):
- Header: ícono `?` + "Guía de inicio · UAI Planner" + ✕
- Body flex row:
  - Sidebar izquierdo (230px, borde derecho): secciones y ítems de navegación
  - Panel derecho (flex: 1): contenido de la sección activa

Secciones con contenido:
1. **🚀 Inicio rápido** — pasos para arrancar: crear materias, asignar horarios, agregar tareas
2. **📅 Vista Semana** — cómo usar la grilla, asignar slots, cambiar el layout
3. **✓ Tareas y backlog** — crear tareas, estados, prioridades, fechas de inicio vs fin
4. **🍅 Pomodoro** — cómo iniciar una sesión, cómo funciona el timer, cómo quedan guardadas las sesiones
5. **📊 Materias** — objetivos de horas, sesiones manuales, cómo interpretar la barra de progreso
6. **💾 Datos y Drive** — backup local, Google Drive, diferencias entre los modos
7. **⚙ Configuración** — materias, tipos, horarios, alertas, temas
8. **🔔 Alertas** — cómo funcionan los colores, cómo configurar los umbrales

Footer: "UAI Planner · v2.0" + botón "Reiniciar la bienvenida" → vuelve al onboarding sin tocar los datos

**Activación automática al entrar:**
- Si `PlannerService.getMode() === 'local'` y es la primera vez → `useUIStore.helpOpened()`
- "Primera vez" se detecta con una key adicional: `uai-help-shown: 'true'`

#### Criterios de aceptación

- Botón `?` en el header → abre la guía
- La navegación del sidebar muestra el contenido correcto por sección
- "Reiniciar la bienvenida" → vuelve al onboarding y los datos del planner se mantienen
- Al entrar por primera vez → la guía se abre automáticamente

---

### FASE 26 — Accesibilidad y Pulido Visual

**Objetivo:** asegurar que la app cumple WCAG 2 AA en las vistas principales y que el pulido visual está al nivel del monolito.

**Prerequisitos:** Todas las features implementadas (Fases 1–25).

**Complejidad:** M

#### Entregables

**Accesibilidad — checklist por tipo de elemento:**

Modales:
```typescript
// Todos los modales deben tener:
<div role="dialog" aria-modal="true" aria-labelledby="modal-title-id">
  <h2 id="modal-title-id">...</h2>
</div>
// + useFocusTrap activado al montar
// + onKeyDown Escape → onClose
```

Listas de tareas:
```tsx
<ul role="list">
  <li role="listitem" tabIndex={0} onKeyDown={handleKeyNav}>
    <TaskCard ... />
  </li>
</ul>
```

Botones sin texto visible:
```tsx
<button aria-label="Cerrar" className={styles.closeBtn}>✕</button>
<button aria-label="Eliminar tarea" className={styles.deleteBtn}>🗑</button>
```

Drag-and-drop (fallback de teclado en Kanban):
```tsx
// Al estar focalizado con Tab + Enter → togglear estado
onKeyDown={(e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    // Abrir selector de columna destino
  }
}}
```

**Pulido visual — items concretos a verificar:**

- El Chrome Shell collapse/expand: animación suave (`transition: transform .24s ease`)
- La lengüeta del Chrome Shell: animación de "bounce" sutil cuando está colapsada (`@keyframes chromePeekSlide`)
- Transiciones de tema: `body { transition: background .25s, color .25s }`
- Las barras de progreso: `transition: width .4s` en el elemento de fill
- Los chips de materia en la grilla semanal: `transition: all .1s`
- Scrollbar custom en todos los temas (5px, thumb con `--border2`)
- Color `input[type="range"]` con thumb de `--accent`
- `color-mix()` usado en gradientes del monolito donde aplique

**`tests/visual/regression.spec.ts`** — actualizar snapshots finales

**`tests/a11y/accessibility.spec.ts`** — crear suite de a11y con axe-playwright

#### Criterios de aceptación

```bash
npm run test:a11y    # 0 violaciones WCAG 2 AA en las 6 vistas
```

Verificación manual:
- Navegar toda la app solo con Tab y Enter (sin mouse)
- Todos los modales atrapan el foco al abrirse
- Escape cierra todos los modales

---

### FASE 27 — Testing Integral y Validación Final

**Objetivo:** ejecutar la suite completa de testing, corregir lo que falta, y verificar paridad funcional con el monolito original.

**Prerequisitos:** Fases 1–26 completas.

**Complejidad:** L

#### Entregables

**Suite de tests unitarios — cobertura final:**
- `domains/` con cobertura ≥ 85%
- Los casos límite del sistema de alertas cubiertos al 100%
- El reducer con todos sus action types

**Suite de tests visuales — snapshots finales:**
- Los 3 temas × 6 vistas = 18 snapshots
- Onboarding: 3 pasos

**Suite de accesibilidad:**
- Las 6 vistas
- Los modales principales (TaskModal, FormModal, SettingsModal)

**Checklist de paridad funcional — verificación manual:**

*Datos y persistencia:*
- [ ] Crear tarea → persiste al recargar
- [ ] Editar tarea → persiste
- [ ] Eliminar tarea → desaparece definitivamente
- [ ] Importar JSON → las tareas aparecen con IDs únicos
- [ ] Exportar JSON → el archivo tiene la estructura esperada

*Vistas:*
- [ ] Backlog: orden correcto, filtros, opacidad en completadas
- [ ] Kanban: drag entre las 3 columnas
- [ ] Calendario: eventos en las fechas correctas, navegación por mes
- [ ] Vista Semana: grilla correcta, drag de slots, ambos layouts
- [ ] Vista Hoy: materias del slot actual, urgentes, sección "más tarde"
- [ ] Materias: horas calculadas correctamente, sesiones listadas

*Pomodoro:*
- [ ] Timer completo: iniciar → transcurrir → detener → sesión guardada
- [ ] Timer con tarea nueva → la tarea se crea y la sesión queda asociada
- [ ] Cancelar con > 1 minuto → confirmación

*Drive:*
- [ ] Conectar, sincronizar, desconectar
- [ ] Conflicto → resolver con cada opción
- [ ] Auto-save funciona (verificar en Drive después de 3 segundos)

*Configuración:*
- [ ] Crear/editar/eliminar materia
- [ ] Crear/editar/eliminar tipo
- [ ] Cambiar horarios de franjas
- [ ] Cambiar de 3 a 6 franjas → slots se redistribuyen
- [ ] Umbral de alertas → los colores del banner cambian
- [ ] Cambio de tema → inmediato y persiste

*Temas:*
- [ ] Los 5 temas se ven correctamente sin artefactos visuales
- [ ] El tema persiste al recargar
- [ ] El tema se aplica antes del primer render (sin flash)

*Edge cases:*
- [ ] Planner vacío: todas las vistas muestran estados vacíos amigables
- [ ] Eliminar materia con tareas → botón deshabilitado
- [ ] Materia sin slots → no aparece en Vista Hoy ni Vista Semana
- [ ] JSON corrupto en localStorage → la app arranca con planner vacío

#### Criterios de aceptación
```bash
npm run validate     # typecheck + lint + tests pasan
npm run test:visual  # todos los snapshots dentro del umbral (2% tolerancia)
npm run test:a11y    # 0 violaciones WCAG 2 AA
npm run build        # bundle inicial < 150KB gzipped
```

Checklist manual: todos los 35 ítems marcados como ✓.

---

## TABLA RESUMEN

| Fase | Nombre | Bloque | Complejidad | Prerequisitos |
|---|---|---|---|---|
| 1 | Proyecto y Toolchain | Fundaciones | S | — |
| 2 | Sistema de Tipos | Fundaciones | S | 1 |
| 3 | Lógica de Dominio Pura | Fundaciones | L | 2 |
| 4 | Capa de Persistencia | Fundaciones | M | 3 |
| 5 | Stores de Zustand | Estado | M | 3, 4 |
| 6 | Estilos Base y Temas | Estado | S | 1 |
| 7 | App Shell y Navegación | Estado | L | 5, 6 |
| 8 | Onboarding | Onboarding | M | 5, 6, 7 |
| 9 | Vista Backlog | Vistas | M | 5, 7 |
| 10 | Vista Kanban | Vistas | M | 9 |
| 11 | Vista Materias | Vistas | M | 9 |
| 12 | Vista Calendario | Vistas | L | 9 |
| 13 | Vista Semana | Vistas | XL | 9, 11 |
| 14 | Vista Hoy | Vistas | L | 13 |
| 15 | TaskModal | Tareas | M | 7, 9 |
| 16 | FormModal | Tareas | M | 15 |
| 17 | ImportTasksModal | Tareas | S | 7 |
| 18 | Timer Pomodoro | Pomodoro | L | 5, 11 |
| 19 | Settings: Materias y Tipos | Config | L | 7, 11 |
| 20 | Settings: Horarios y Alertas | Config | M | 19 |
| 21 | ResetModal y ManualSessionModal | Config | M | 19, 8 |
| 22 | Drive: OAuth y API | Drive | L | 3, 5 |
| 23 | Drive: Sync y Auto-save | Drive | M | 22 |
| 24 | Import/Export JSON | I/E | M | 5 |
| 25 | Guía de Ayuda | Polish | M | 7 + todo |
| 26 | Accesibilidad y Pulido | Polish | M | 25 |
| 27 | Testing y Validación Final | Polish | L | 26 |

**Total:** 27 fases — S×5 + M×13 + L×8 + XL×1

---

## CRITERIOS GLOBALES DE CALIDAD

Aplicables en cada fase, no solo al final:

**Cada commit debe pasar:**
```bash
npm run typecheck    # 0 errores de TypeScript
npm run lint         # 0 errores de ESLint
npm run test         # 0 tests fallidos
```

**Cada componente nuevo debe:**
- Tener su interface de props tipada (sin `any`)
- Usar variables CSS del sistema de temas (sin colores hardcodeados en CSS)
- Usar la escala de tokens rem (sin `px` en `fontSize`, `padding`, `margin`)
- Exportar con nombre nombrado (no `export default`)

**Cada feature nueva debe:**
- Tener al menos un test que verifique el comportamiento principal
- Manejar el estado vacío / de carga con gracia
- No romper los snapshots visuales de las vistas ya implementadas

---

*Versión 1.0 — Complementa UAI_PLANNER_FUNCTIONAL_SPEC.md y UAI_PLANNER_TECH_ARCHITECTURE.md*
