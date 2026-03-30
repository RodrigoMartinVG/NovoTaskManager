# UAI Planner v3.0 — Fase 0: Setup + Cáscara Global

Fecha inicio: 2026-03-30  
Prerequisito: `UAI_PLANNER_V3_STACK_DEFINITIVO.md`

---

## Objetivo

La app se abre y ya se siente como producto terminado. Sin funcionalidad. Solo estética.

---

## Entregables

### E1. Tooling
- `package.json` con Lit, TypeScript, Vite, Biome, GSAP, @preact/signals-core
- `tsconfig.json` con strict mode, decorators
- `vite.config.ts` configurado para Lit
- `biome.json` con reglas de linting/formatting
- `index.html` con carga de tema inicial y entry point

### E2. Design tokens (`src/styles/tokens.css`)
- Spacing: escala de 4px (space-1 a space-10)
- Typography: font-sans, font-mono, text-xs a text-5xl
- Z-index: escala definida (base, dropdown, sticky, modal, toast, tooltip)
- Transitions: easing curves + duraciones
- Layout budgets: header 56px, modal max 560px

### E3. Temas (`src/styles/themes.css`)
- 5 temas de la v1.0: hueso, claro, noche, pizarrón, café
- Variables exactas de la v1.0 (bg0-bg3, border, border2, text0-text3, accent, info/warn/ok/err, overlay, dark)
- Cambio instantáneo via `data-theme` en `<html>`

### E4. Reset + global (`src/styles/reset.css`, `src/styles/global.css`)
- Box-sizing, margin/padding reset
- Scrollbar custom (5px, --border2)
- Body con transitions de tema

### E5. Shell components
- `<chrome-shell>` — frame exterior
- `<nav-bar>` — barra 56px con logo ◈ UAI Planner, 6 nav pills, acciones
- `<app-shell>` — layout grid (nav + content), orquesta vista activa

### E6. Vistas placeholder
- 6 vistas: `<hoy-view>`, `<semana-view>`, `<materias-view>`, `<backlog-view>`, `<kanban-view>`, `<calendar-view>`
- Cada una con mensaje placeholder con personalidad

### E7. View Transitions
- Cambio de vista con View Transitions API
- Fallback a CSS transition si no soportado

---

## Criterios de cierre

- [ ] `npm run dev` levanta la app sin errores
- [ ] `npm run build` produce bundle válido
- [ ] `npx biome check src/` pasa sin errores
- [ ] Nav funcional: click cambia de vista
- [ ] Los 5 temas cambian instantáneamente
- [ ] Header mide exactamente 56px
- [ ] Comparar visualmente con v1.0: se ve profesional

---

## North star de referencia

El header de la v1.0 tiene:
- Logo: `◈ UAI Planner` (font-weight 700, letter-spacing .05em)
- Nav pills centrados: Hoy, Semana, Materias, Backlog, Kanban, Calendario
- Pill activa: bg1, text0, shadow
- Pill inactiva: transparent, text2
- Acciones derecha: tema, pomo, alertas, drive, settings, help
- Height: ~56px con padding 11px 22px
- Background: bg1, border-bottom 1px solid border
