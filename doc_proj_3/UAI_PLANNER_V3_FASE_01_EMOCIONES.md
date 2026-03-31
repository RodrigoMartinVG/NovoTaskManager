# Fase 1 — Experiencias emocionales

Fecha: 2026-03-30
Referencia: `UAI_PLANNER_V3_PLAN_GLOBAL.md` (sección Fase 1)
Estado: **en progreso** (primera iteración implementada, refinamiento pendiente)

---

## Filosofía

> Las experiencias emocionales definen la primera impresión y el hábito de uso.
> Si el onboarding y el pomodoro son impecables, el usuario perdona imperfecciones en el resto.

Principio rector: **Shell → Vista → Funcionalidad** y **la v1.0 es el piso, no el techo**.

---

## 1. Onboarding

### 1.1 Objetivo
Guiar al usuario nuevo desde "no sé qué es esto" hasta "ya estoy adentro con mi planner listo", en la menor cantidad de pasos posible, sin scroll, con todo el impacto visual concentrado en 100vh.

### 1.2 Flujo (3 pasos)

#### Paso 1: Estilo visual (tema + densidad)
- **Es lo primero que se elige** porque define cómo se va a ver todo lo demás
- 5 temas en chips con vista previa (color de fondo + barra de accent)
- 3 densidades: Compacto (A) / Normal (A) / Cómodo (A) — con preview tipográfico
- Aplicación inmediata: el usuario ve el cambio en vivo
- Nota: "Esto lo podés cambiar cuando quieras"
- Layout: tema y densidad deben caber en una pantalla sin scroll

#### Paso 2: Bienvenida + propuesta de valor
- Logo ◈ Oda Planner + título motivacional
- Mini preview de una semana viva (datos mock)
- 3 feature values compactos (📚 plan real, ⏱ tracking, 🚨 alertas)
- CTA "Continuar →"

#### Paso 3: Forma de arranque (dataset)
- Dos opciones claras:
  - ⚡ Empezar en modo local (recomendado) — planner vacío
  - 🎲 Explorar con datos de ejemplo (demo) — materias/tareas/sesiones ficticias
- Hints sobre siguientes pasos
- Al elegir: animación de salida → transición al shell principal

### 1.3 Requisitos técnicos

| Req | Descripción |
|-----|-------------|
| **No scroll** | Cada paso debe caber en 100vh. Contenido optimizado para viewport mínimo ~600px alto |
| **Responsive** | 3 breakpoints: mobile (<30em), tablet (30-60em), desktop (>60em) |
| **GSAP** | Transiciones entre pasos (fade+slide), entrance animation, exit celebration |
| **Grid bg** | Patrón de grilla sutil + viñeta radial (como v1.0 mejorado) |
| **Temas** | Debe funcionar en los 5 temas. El paso 1 los cambia en vivo |
| **Persistencia** | Tema → `oda-theme` en localStorage. Densidad → `oda-density`. App mode → `oda-mode` |
| **Evento salida** | Dispatch `onboarding-done` (bubbles + composed) para que app-shell re-renderice |

### 1.4 Anatomía visual (cada paso)

```
┌──────────────────────────────────────┐
│ [grid bg + vignette overlay]         │
│                                      │
│          ◈ Oda Planner               │  ← hero (solo paso 2)
│                                      │
│     (1) ── (2) ── (3)               │  ← progress indicator
│                                      │
│  ┌─────────────────────────────┐     │
│  │ Título                      │     │  ← card con border + shadow
│  │ Contenido del paso          │     │
│  │ ...                         │     │
│  │ [Botones]                   │     │
│  └─────────────────────────────┘     │
│                                      │
│    footnote sutil                    │
│                                      │
└──────────────────────────────────────┘
```

### 1.5 Cambios respecto a la implementación actual

| Antes | Después | Motivo |
|-------|---------|--------|
| Paso 1 = Welcome (mucho texto), Paso 2 = Tema | Paso 1 = Estilo (tema+densidad), Paso 2 = Welcome | El usuario ve la app con su estilo elegido desde el primer contenido real |
| Paso Welcome requiere scroll largo | Todo cabe en viewport | Es onboarding, no un artículo |
| Sin selector de densidad | Densidad integrada al paso de Estilo | El tamaño de letra es parte de la identidad visual |
| Solo un breakpoint @40em | 3 breakpoints (30em, 60em) | Responsive real |
| Hero grande + 3 cards + preview + hint + footnote | Contenido más compacto y editado | Sin scroll = hay que priorizar |

---

## 2. Pomodoro

### 2.1 Objetivo
Timer de estudio inmersivo que registra sesiones reales asociadas a materias y tareas.

### 2.2 Componentes implementados

| Componente | Tag | Archivo | Estado |
|-----------|-----|---------|--------|
| Timer controller | (module) | `src/state/pomo.ts` | ✅ Implementado |
| Focus overlay | `<pomo-focus-view>` | `src/components/pomodoro/pomo-focus-view.ts` | ✅ Implementado |
| Mini widget | `<pomo-widget>` | `src/components/pomodoro/pomo-widget.ts` | ✅ Implementado |
| Trigger (iniciar sesión) | — | — | ❌ Pendiente |

### 2.3 Arquitectura del timer

- **Timestamp-based**: usa `Date.now()` diffs con `setInterval(500ms)` — inmune a tab throttling del navegador
- **Señales**: `pomoSession`, `pomoFocusMode`, `pomoPaused`, `pomoStudySecs`, `pomoPauseSecs`, `pomoActive`
- **Acciones**: `pomoStart(session)`, `pomoPause()`, `pomoResume()`, `pomoStop()`, `pomoCancel()`, `pomoToggleFocus()`
- **Al terminar**: si ≥ 1 minuto, crea `Sesion` con timestamp local ISO y la agrega al store via `addSesion()`

### 2.4 Problema: no hay trigger

El pomodoro está 100% implementado pero **no hay forma de iniciarlo desde la UI**. Las vistas son placeholders.
Soluciones posibles:
- Agregar un botón temporal "▶ Iniciar sesión" en el nav-bar o en la vista Hoy
- Esperar a Fase 2 (Vista Hoy) que incluirá el launcher natural del pomodoro
- **Decisión**: agregar botón temporal discreto en nav-bar que abre un mini selector de materia

### 2.5 Focus view

- Overlay full-screen con backdrop-blur(6px)
- Badge de estado: "EN SESIÓN" (verde, pulse dot) / "EN PAUSA" (amarillo)
- Materia (color dot + nombre) + tarea
- Timer 4rem con tabular-nums
- Sección de pausa (3.75rem height, warn-colored timer)
- Acciones: Pausar/Retomar, Terminar y guardar, Minimizar, Cancelar

### 2.6 Mini widget

- Posición fixed bottom-right (1.25rem)
- Pulse dot + timer 1rem + botones pause/expand
- Click en widget → expand a focus view

---

## 3. Domain types y Signal store

### 3.1 Tipos (`src/state/types.ts`)

| Tipo | Propiedades clave |
|------|-------------------|
| `Materia` | id, nombre, color, horasSemanales, activa |
| `TipoTarea` | id, nombre, icono, activo |
| `Tarea` | id, titulo, materiaId, tipo, estado, prioridad, fechas, items (checklist) |
| `Sesion` | id, materiaId, tareaId?, inicio (ISO), minutos, origen, titulo? |
| `PlannerData` | materias[], tipos[], tareas[], sesiones[] |
| `AppMode` | "welcome" \| "local" \| "drive" |

### 3.2 Store (`src/state/store.ts`)

- Señales: `appMode`, `plannerData`, `pomoSession`, `pomoFocusMode`
- Computed: `materias`, `tareas`, `sesiones`, `isWelcome`
- Acciones: `setAppMode()`, `setPlannerData()`, `addSesion()`, `enterLocal()`, `enterDemo()`
- Persistencia: `oda-mode`, `oda-data-v1` en localStorage

---

## 4. Criterio de cierre

- [x] Domain types portados
- [x] Signal store funcional con persistencia
- [x] Onboarding: 3 pasos con transiciones GSAP
- [ ] Onboarding: sin scroll en ningún paso (viewport ≥ 600px)
- [ ] Onboarding: paso 1 = estilo (tema + densidad)
- [ ] Onboarding: responsive (mobile / tablet / desktop)
- [x] Pomodoro: timer controller con lógica timestamp-based
- [x] Pomodoro: focus overlay inmersivo
- [x] Pomodoro: mini widget flotante
- [ ] Pomodoro: forma de iniciarlo desde la UI
- [x] Build limpio (tsc + biome)
- [x] Funciona en los 5 temas
