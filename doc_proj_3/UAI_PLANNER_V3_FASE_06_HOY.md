# Fase 6 — Vista Hoy

Fecha: 2026-03-30
Referencia: `UAI_PLANNER_V3_PLAN_GLOBAL.md` (sección Fase 6)
Estado: **pendiente** (reordenada — antes era Fase 2, requiere materias/tareas/franjas previas)

---

## Filosofía

> Es la primera vista que ve el usuario cada día. Debe transmitir **claridad y foco**.
> Un protagonista claro: el reloj + "qué tengo hoy". Lo demás es contexto de soporte.

Principio rector: Vista Hoy no es un dashboard saturado — es una **superficie emocional**
que responde la pregunta "¿qué necesito hacer ahora?" en 3 segundos.

---

## 1. HeroClock

### 1.1 Objetivo
Componente hero visual que muestra la hora actual, la fecha del día, y la franja horaria activa con emoji. Actualización en tiempo real (cada minuto).

### 1.2 Anatomía visual

```
┌────────────────────────────────────┐
│                                    │
│           14:35                    │  ← hora grande (text-5xl, tabular-nums)
│  🌤 Tarde · Domingo 30 de marzo   │  ← franja emoji + nombre + fecha formateada
│                                    │
└────────────────────────────────────┘
```

### 1.3 Requisitos técnicos

| Req | Descripción |
|-----|-------------|
| **Reloj vivo** | `setInterval(60_000)` — actualiza hora y fecha cada minuto. Cleanup en `disconnectedCallback()` |
| **Timezone** | `America/Argentina/Buenos_Aires` — consistente con todo el sistema |
| **Franja** | Detecta la franja activa según la hora actual y las franjas definidas en `plannerData.franjas` (o defaults 3-franjas si no hay) |
| **Formato fecha** | `Intl.DateTimeFormat("es-AR")` — "Domingo 30 de marzo" (weekday long, day numeric, month long) |
| **Responsive** | Hora: `text-5xl` en desktop, `text-4xl` en mobile. Fecha: `text-sm`. Centrado. |

### 1.4 Componente
- Tag: `<hero-clock>`
- Archivo: `src/components/views/hoy/hero-clock.ts`
- Señales que consume: `plannerData` (para leer `franjas`)

---

## 2. Franjas horarias (utilidad)

### 2.1 Objetivo
Módulo utilitario que resuelve franjas horarias: defaults, franja actual, nombre/emoji.

### 2.2 Archivo
`src/utils/franjas.ts`

### 2.3 API

```typescript
// Franjas default (modo 3)
const DEFAULT_FRANJAS: FranjaDef[] = [
  { id: "manana", nombre: "Mañana",  emoji: "🌅", horaInicio: 6,  horaFin: 13 },
  { id: "tarde",  nombre: "Tarde",   emoji: "🌤", horaInicio: 13, horaFin: 19 },
  { id: "noche",  nombre: "Noche",   emoji: "🌙", horaInicio: 19, horaFin: 24 },
];

// Obtener lista de franjas (custom o default)
function getFranjas(data: PlannerData): FranjaDef[]

// Obtener franja activa para una hora dada (0-23)
function getFranjaActual(franjas: FranjaDef[], hora: number): FranjaDef | null

// Obtener el nombre formateado con emoji: "🌤 Tarde"
function franjaLabel(franja: FranjaDef): string
```

### 2.4 Notas
- Si la hora es < 6 (madrugada), no hay franja activa → devolver null
- Las franjas custom vienen de `plannerData.franjas` (si el usuario las configuró)
- Este módulo se reutilizará en Vista Semana (Fase futura)

---

## 3. Selectores derivados (store)

### 3.1 Objetivo
Agregar computed signals al store para datos que Vista Hoy necesita.

### 3.2 Nuevos computed en `src/state/store.ts`

```typescript
// Fecha de hoy en formato YYYY-MM-DD (timezone Argentina)
export const todayISO: Signal<string>

// Tareas de hoy: tienen fechaLimite === hoy, o fechaInicio === hoy
export const tareasHoy: Signal<Tarea[]>

// Tareas urgentes: vencidas (fechaLimite < hoy) y no completadas,
// o que vencen hoy y son de prioridad alta
export const tareasUrgentes: Signal<Tarea[]>

// Tareas atrasadas: fechaLimite < hoy y estado !== "completada"
export const tareasAtrasadas: Signal<Tarea[]>

// Nombre del día actual en español: "lun" | "mar" | ...
export const diaActual: Signal<string>
```

### 3.3 Lógica de filtrado

**tareasHoy**: `tareas` donde:
- `fechaLimite === todayISO` (vencen hoy)
- O `fechaInicio === todayISO` (empiezan hoy)
- Excluye completadas si se quiere (decisión: **incluir completadas** con estilo tachado)

**tareasUrgentes**: `tareas` donde:
- `estado !== "completada"`
- `fechaLimite !== undefined`
- `fechaLimite <= todayISO` (ya venció o vence hoy)
- O `fechaLimite` es mañana y `prioridad === "alta"`

**tareasAtrasadas**: subconjunto de urgentes donde:
- `fechaLimite < todayISO` (ya pasó)

---

## 4. Secciones de Vista Hoy

### 4.1 Layout general

```
┌───────────────────────────────────────┐
│          HeroClock                    │  ← hero
├───────────────────────────────────────┤
│  ⚠ Atrasadas (N)           [colaps.] │  ← si hay, borde izq rojo
│    • Tarea X — Materia — hace 2 días │
├───────────────────────────────────────┤
│  📋 Para hoy (N)                     │  ← tareas del día
│    • Tarea A — Materia — alta ★      │
│    • Tarea B — [completada] ✓        │
├───────────────────────────────────────┤
│  🕐 Más tarde                        │  ← tareas futuras cercanas
│    • Tarea C — Materia — en 3 días   │
│    • Tarea D — Materia — en 5 días   │
├───────────────────────────────────────┤
│  ▶ Iniciar sesión de estudio         │  ← CTA pomodoro
└───────────────────────────────────────┘
```

### 4.2 Sección: Atrasadas

- **Condición de aparición**: hay tareas con `fechaLimite < hoy` y `estado !== "completada"`
- **Visual**: borde izquierdo `--err-text`, fondo sutil `--err-bg`
- **Cada fila**: emoji tipo + título + dot color materia + "hace N días"
- **Colapsable**: se puede cerrar (estado local, no persistido)
- **Si no hay**: sección no se renderiza

### 4.3 Sección: Para hoy

- **Condición**: hay tareas con fechaLimite o fechaInicio === hoy
- **Cada fila**:
  - Dot color materia + nombre materia (text-xs, color tenue)
  - Emoji tipo + título tarea
  - Badge prioridad (★ alta = err-text, media = warn-text, baja = text3)
  - Si completada: texto tachado + check verde
- **Si no hay**: mostrar empty state simpático

### 4.4 Sección: Más tarde (próximas)

- **Muestra**: próximas 5 tareas pendientes con fechaLimite en los próximos 7 días (excluyendo hoy)
- **Cada fila**: similar a "Para hoy" pero más compacta, con "en N días" en vez de prioridad
- **Si no hay**: sección no se renderiza

### 4.5 Sección: CTA Pomodoro

- **Botón**: "▶ Iniciar sesión de estudio"
- **Estilo**: botón accent, full-width, con icono
- **Acción**: abre selector de materia/tarea inline → lanza `pomoStart()`
- **Implementación del selector**:
  - Inline expandible (no modal), lista de materias activas con dot color
  - Al elegir materia, opcionalmente elegir tarea (o "sesión libre")
  - Confirmar → `pomoStart({ materiaId, tareaId, titulo })`
- Si ya hay sesión activa: no mostrar CTA (el widget está visible)

### 4.6 Empty state global

Si no hay tareas en el planner:
```
📚
Todo en orden
No hay tareas pendientes. ¿Querés crear una?
[+ Nueva tarea]
```

Si hay materias pero no tareas con fecha:
```
📅
Nada agendado para hoy
Configurá fechas en tus tareas para verlas acá.
```

---

## 5. Componentes

### 5.1 Árbol de componentes

```
<hoy-view>                           ← Orquestador
  <hero-clock>                        ← Reloj + fecha + franja
  <hoy-section title="Atrasadas">    ← Sección genérica con header
    <hoy-task-row>                    ← Fila de tarea reutilizable
  <hoy-section title="Para hoy">
    <hoy-task-row>
  <hoy-section title="Más tarde">
    <hoy-task-row>
  <pomo-launcher>                     ← CTA + selector inline
```

### 5.2 Detalle por componente

| Componente | Tag | Archivo | Responsabilidad |
|-----------|-----|---------|----------------|
| Vista Hoy (orquestador) | `<hoy-view>` | `src/components/views/hoy-view.ts` | Layout, computed signals, renderiza secciones |
| Reloj hero | `<hero-clock>` | `src/components/views/hoy/hero-clock.ts` | Hora viva, fecha, franja activa |
| Sección | `<hoy-section>` | `src/components/views/hoy/hoy-section.ts` | Card con título, colapsable, badge count |
| Fila de tarea | `<hoy-task-row>` | `src/components/views/hoy/hoy-task-row.ts` | Muestra una tarea con materia+tipo+prioridad+fecha |
| Launcher pomo | `<pomo-launcher>` | `src/components/views/hoy/pomo-launcher.ts` | Botón + selector inline de materia/tarea |

### 5.3 Decisiones de diseño

- **No modales**: todo inline. El selector de materia para pomo se expande en el mismo lugar.
- **hoy-section colapsable**: click en header toggle, con transición de altura (GSAP o CSS `max-height`).
- **hoy-task-row click**: dispara evento `task-clicked` (detail: tareaId) para futuro TaskModal.
- **Responsive**:
  - Mobile (<40em): stack vertical, hero-clock más compacto, secciones full-width
  - Desktop (≥40em): max-width 40rem centrado, hero-clock prominente
- **Scroll**: Vista Hoy **sí puede scrollear** (a diferencia del onboarding). Es contenido dinámico.

---

## 6. Estilos y tokens

### 6.1 Paleta semántica usada

| Token | Uso en Vista Hoy |
|-------|-------------------|
| `--bg1` | Fondo de cards/secciones |
| `--border` | Bordes de secciones |
| `--text0` | Títulos, hora del reloj |
| `--text2` | Texto secundario (fecha, counts) |
| `--accent` | CTA pomo, badges activos |
| `--err-bg`, `--err-text` | Sección atrasadas |
| `--warn-text` | Prioridad media |
| `--ok-text` | Tareas completadas (check) |

### 6.2 Animaciones

| Animación | Técnica | Trigger |
|-----------|---------|---------|
| Entrada de vista | View Transition API (ya en app-shell) | Cambio de pestaña |
| Secciones colapsables | `max-height` transition o GSAP | Click en header |
| Empty state | Fade-in suave | Primer render |

---

## 7. Dependencias

| Dependencia | Estado | Nota |
|------------|--------|------|
| Store signals (`plannerData`, `tareas`) | ✅ Existe | Extender con `tareasHoy`, `tareasUrgentes` |
| Tipos (`Tarea`, `Materia`, etc.) | ✅ Existe | En `src/state/types.ts` |
| Franjas horarias | ❌ Crear | `src/utils/franjas.ts` |
| App shell routing | ✅ Existe | `activeView === "hoy"` ya renderiza `<hoy-view>` |
| Pomodoro timer | ✅ Existe | `src/state/pomo.ts` con `pomoStart()` |
| View Transitions | ✅ Existe | En `app-shell.ts` |
| Temas (5) | ✅ Existe | Tokens semánticos ya definidos |

---

## 8. Plan de implementación (orden)

| # | Paso | Archivos | Estimación |
|---|------|----------|-----------|
| 1 | Crear `franjas.ts` (utilidad) | `src/utils/franjas.ts` | Pequeño |
| 2 | Extender store con selectores derivados | `src/state/store.ts` | Pequeño |
| 3 | Crear `hero-clock.ts` | `src/components/views/hoy/hero-clock.ts` | Mediano |
| 4 | Crear `hoy-section.ts` (sección genérica) | `src/components/views/hoy/hoy-section.ts` | Pequeño |
| 5 | Crear `hoy-task-row.ts` (fila de tarea) | `src/components/views/hoy/hoy-task-row.ts` | Mediano |
| 6 | Crear `pomo-launcher.ts` (CTA + selector) | `src/components/views/hoy/pomo-launcher.ts` | Mediano |
| 7 | Reescribir `hoy-view.ts` (orquestador con todas las secciones) | `src/components/views/hoy-view.ts` | Grande |
| 8 | Verificar: tsc + biome + build + visual en los 5 temas | — | QA |

---

## 9. Criterio de cierre

- [ ] HeroClock muestra hora viva + fecha + franja con emoji
- [ ] Franjas: módulo utilitario con defaults 3-franjas y detección de franja actual
- [ ] Store: selectores derivados (`tareasHoy`, `tareasUrgentes`, `tareasAtrasadas`)
- [ ] Sección atrasadas con borde rojo y "hace N días"
- [ ] Sección "Para hoy" con dot materia + tipo + prioridad
- [ ] Sección "Más tarde" con próximas 5 tareas (7 días)
- [ ] Tareas completadas visibles con estilo tachado
- [ ] Pomo launcher: selector inline de materia/tarea → inicia sesión
- [ ] Empty states con personalidad (sin tareas / sin tareas hoy)
- [ ] Responsive: mobile (<40em) y desktop
- [ ] Funciona en los 5 temas
- [ ] Build limpio (tsc + biome)
- [ ] Con datos demo: se ve completa y funcional
