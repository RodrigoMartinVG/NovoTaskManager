# UAI Planner v3.0 — Plan Global de Implementación

Fecha: 2026-03-30  
Referencia: `UAI_PLANNER_V3_STACK_DEFINITIVO.md` (stack y filosofía)  
Referencia: `UAI_PLANNER_V3_GUIA_DE_EXPERIENCIA.md` (lecciones aprendidas)  
North star visual: `uai_planner_estable_.html`

---

## Cómo se usa este documento

Este es el **mapa general** — define qué se construye, en qué orden, y por qué.

Cada fase tiene su propio documento detallado (`FASE_XX_nombre.md`) que se crea **al momento de iniciar la fase**, no antes. Así el detalle fino se beneficia de todo lo aprendido en las fases anteriores.

### Estructura por fase

```
doc_proj_3/
├── UAI_PLANNER_V3_PLAN_GLOBAL.md          ← este documento
├── UAI_PLANNER_V3_FASE_00_SETUP.md        ← detalle al iniciar Fase 0
├── UAI_PLANNER_V3_FASE_01_EMOCIONES.md    ← detalle al iniciar Fase 1
├── ...
```

### Metodología: Shell → Vista → Funcionalidad

Recordar siempre: cada componente pasa por **A** (cáscara estética con datos mock) → **B** (interactividad visual) → **C** (conectar funcionalidad). Si A no se ve bien, no se avanza a B. Si B no se siente bien, no se avanza a C.

---

## Resumen de fases

| Fase | Nombre | Foco | Entregable clave |
|------|--------|------|------------------|
| **0** | Setup + Cáscara global | Infraestructura + la app se abre y ya se ve como producto | Shell navegable con temas, sin funcionalidad |
| **1** | Experiencias emocionales | Onboarding + Pomodoro — las dos experiencias con más impacto | Flujo de bienvenida teatral + timer inmersivo |
| **2** | Vista Hoy | El dashboard diario — lo primero que ve el usuario cada día | HeroClock + tareas de hoy + urgentes + estado vacío |
| **3** | Vista Materias | El catálogo de materias con stats | Cards de materia + detalle expandible |
| **4** | Vista Backlog | La lista maestra de tareas | Tabla con filtros + TaskModal (crear/editar) |
| **5** | Vista Semana | La planificación semanal visual | Grilla 7×franjas + drag & drop |
| **6** | Kanban + Calendario | Las dos vistas alternativas | Kanban con columnas + Calendario mensual |
| **7** | Settings + Import/Export + Drive | Configuración y persistencia externa | Settings modal + export/import JSON + Google Drive |
| **8** | Pulido y cierre | Accesibilidad, performance, edge cases | WCAG AA, Lighthouse, visual regression suite |

---

## Fase 0 — Setup + Cáscara global

**Premisa**: La app se abre y ya se siente como producto terminado. Sin funcionalidad alguna.

### Objetivos
- Configurar todo el tooling (Vite, TypeScript, Lit, Biome, Storybook)
- Definir los design tokens (spacing, typography, z-index, transitions)
- Implementar los 5 temas completos con CSS custom properties
- Construir el shell visual: `<chrome-shell>`, `<nav-bar>`, `<app-shell>`
- NavBar funcional: iconos con letra (H, S, M, B, K, C), glifo ◈, selector de tema
- Vistas placeholder: 6 vistas vacías con mensaje de construcción
- View Transitions entre vistas

### Criterio de cierre
- [ ] `npm run dev` levanta la app
- [ ] `npm run build` produce un bundle válido
- [ ] `npm run lint` pasa sin errores
- [ ] Nav funcional: click cambia de vista con transición
- [ ] Los 5 temas cambian instantáneamente
- [ ] Header mide exactamente 56px
- [ ] Se ve profesional — comparar con la v1.0

### Dependencias
Ninguna. Es la primera fase.

### Documento detallado
`UAI_PLANNER_V3_FASE_00_SETUP.md` — se crea al iniciar esta fase.

---

## Fase 1 — Experiencias emocionales

**Premisa**: Onboarding y Pomodoro son las dos experiencias con mayor impacto emocional. Si estas dos están impecables, el usuario perdona imperfecciones menores en el resto (Principio 6).

### Objetivos
- **Onboarding**: flujo de bienvenida teatral con propuesta de valor, transiciones GSAP (SplitText, staggers), cierre celebratorio, tono rioplatense
- **Pomodoro**: panel "EN SESIÓN" inmersivo, timer grande animado (GSAP ring), estados (idle → enfoque → pausa → completado), métricas, minimizable a widget

### Criterio de cierre
- [ ] Onboarding: 3-4 pasos con animaciones fluidas, se completa, no se vuelve a mostrar
- [ ] Pomodoro: iniciar sesión → pantalla inmersiva → timer corre → pausar → terminar
- [ ] Se ve espectacular en los 5 temas
- [ ] Animaciones fluidas a 60fps

### Dependencias
- Fase 0 (shell, temas, nav)

### Documento detallado
`UAI_PLANNER_V3_FASE_01_EMOCIONES.md`

---

## Fase 2 — Vista Hoy

**Premisa**: Es la primera vista que ve el usuario cada día. Debe transmitir claridad y foco.

### Objetivos
- HeroClock: hora grande + fecha + franja horaria con emoji
- Sección de tareas de hoy (filtradas por fecha)
- Sección urgente: tareas atrasadas/próximas a vencer
- Later section: lo que sigue después
- Estados vacíos con personalidad y CTA
- Conectar al signal store del planner

### Criterio de cierre
- [ ] Con datos mock: se ve como la v1.0 o mejor
- [ ] Con datos reales (signal store): muestra tareas del día
- [ ] Estado vacío tiene personalidad y guía
- [ ] Un protagonista claro: el reloj + "qué tengo hoy"

### Dependencias
- Fase 0 (shell)
- Domain: `planner/types.ts`, `planner/selectors.ts`, `schedule/franjas.ts` (portados de v2.0)
- State: `planner.state.ts` (signal store — probablemente se crea entre Fase 1 y 2)

### Documento detallado
`UAI_PLANNER_V3_FASE_02_HOY.md`

---

## Fase 3 — Vista Materias

**Premisa**: Escaneo rápido del catálogo de materias. Progressive disclosure: compact → detailed.

### Objetivos
- Cards de materia con color, nombre, stats compactas (tareas, horas, progreso)
- Vista expandida con lista de tareas y sesiones de la materia
- Indicadores visuales de progreso por materia
- Estado vacío: "Todavía no hay materias configuradas"

### Criterio de cierre
- [ ] Cards compactas escaneables de un vistazo
- [ ] Expand/collapse fluido
- [ ] Colores de materia visibles y distinguibles
- [ ] Funciona con datos reales del store

### Dependencias
- Fase 0 (shell), Fase 2 (signal store ya existente)

### Documento detallado
`UAI_PLANNER_V3_FASE_03_MATERIAS.md`

---

## Fase 4 — Vista Backlog

**Premisa**: La lista maestra de todas las tareas. Señal táctica visible por fila.

### Objetivos
- Lista/tabla de tareas con tipo + materia + estado + prioridad + fecha + alerta
- Filtros por tipo, materia, estado
- TaskModal: crear y editar tarea completa (título, materia, tipo, estado, prioridad, fechas, checklist, descripción)
- Botón "+ Nueva tarea" funcional
- Búsqueda/filtrado rápido

### Criterio de cierre
- [ ] Cada fila comunica la información táctica de un vistazo
- [ ] Filtros funcionan
- [ ] TaskModal crea y edita tareas
- [ ] Confirmación antes de eliminar

### Dependencias
- Fase 0 (shell), Fase 2-3 (store, materias como referencia en tareas)

### Documento detallado
`UAI_PLANNER_V3_FASE_04_BACKLOG.md`

---

## Fase 5 — Vista Semana

**Premisa**: La planificación visual de la semana. Grilla + drag & drop.

### Objetivos
- Grilla 7 días × franjas horarias (configurable)
- Chips de tarea/sesión arrastrables (GSAP Draggable o nativo)
- Slot editing (asignar tarea a franja)
- Indicadores de horas planificadas vs objetivo por materia
- Vista responsive

### Criterio de cierre
- [ ] Grilla se ve clara y proporcional
- [ ] Drag & drop fluido
- [ ] Se pueden asignar/mover tareas entre slots
- [ ] Progreso visual de horas por materia

### Dependencias
- Fase 0, Fase 4 (tareas existen), domain: `schedule/franjas.ts`

### Documento detallado
`UAI_PLANNER_V3_FASE_05_SEMANA.md`

---

## Fase 6 — Kanban + Calendario

**Premisa**: Dos vistas alternativas para usuarios con diferentes preferencias.

### Objetivos
- **Kanban**: columnas por estado (pendiente, en progreso, completada), cards arrastrables entre columnas
- **Calendario**: vista mensual con eventos/tareas, navegación entre meses, mini-resumen al click

### Criterio de cierre
- [ ] Kanban: drag entre columnas cambia estado
- [ ] Calendario: navegar meses, ver tareas por día
- [ ] Ambas se ven bien en los 5 temas

### Dependencias
- Fase 0, Fase 4 (tareas), Fase 5 (drag patterns ya definidos)

### Documento detallado
`UAI_PLANNER_V3_FASE_06_KANBAN_CALENDARIO.md`

---

## Fase 7 — Settings + Import/Export + Drive

**Premisa**: Configuración del sistema y persistencia externa.

### Objetivos
- **Settings modal**: ABM de materias, tipos, franjas horarias, alertas, tema
- **Export**: JSON descargable con toda la data
- **Import**: carga de JSON con normalización defensiva (`normalizer.ts`)
- **Google Drive**: conectar, guardar, cargar, auto-save, resolución de conflictos

### Criterio de cierre
- [ ] Settings: crear/editar/eliminar materias, tipos, franjas
- [ ] Export: genera JSON válido y completo
- [ ] Import: carga JSON y normaliza campos faltantes/malformados
- [ ] Drive: conectar con Google, guardar/cargar, indicador de sync

### Dependencias
- Todas las fases anteriores (settings configura lo que las vistas muestran)
- Domain: `import-export/normalizer.ts`, `import-export/export.ts`, `alerts/alertEngine.ts`

### Documento detallado
`UAI_PLANNER_V3_FASE_07_SETTINGS_DRIVE.md`

---

## Fase 8 — Pulido y cierre

**Premisa**: Todo funciona y se ve bien. Ahora se busca la excelencia.

### Objetivos
- **Accesibilidad**: axe-playwright sin violaciones WCAG 2.1 AA, keyboard nav completa, aria-labels, roles semánticos
- **Performance**: Lighthouse 90+, bundle size audit, lazy loading si conviene
- **Visual regression**: suite completa de screenshots en los 5 temas
- **Edge cases**: estados de error, datos vacíos, datos corruptos, pérdida de conexión
- **Responsive**: verificar en móvil (aunque no es el target primario)
- **Comparación final vs v1.0**: scoring de paridad visual en cada vista

### Criterio de cierre
- [ ] axe-playwright: 0 violaciones WCAG 2 A/AA
- [ ] Lighthouse Performance 90+
- [ ] Visual regression suite pasa en los 5 temas
- [ ] Keyboard navigation completa en todas las vistas
- [ ] Scoring vs v1.0 ≥ 2.5/3 en todas las vistas

### Dependencias
- Todas las fases anteriores completadas

### Documento detallado
`UAI_PLANNER_V3_FASE_08_PULIDO.md`

---

## Lógica de dominio — cuándo se porta

La lógica de dominio de v2.0 es TypeScript puro y se copia sin cambios. No tiene fase propia — se integra cuando cada fase la necesita:

| Archivo de dominio | Se porta en |
|--------------------|-------------|
| `planner/types.ts` | Fase 0 o 1 (básico para que existan los tipos) |
| `planner/reducer.ts` | Fase 2 (cuando Hoy necesita datos reales) |
| `planner/selectors.ts` | Fase 2 (selectores de tareas de hoy) |
| `planner/service.ts` | Fase 2 (adaptado a signals) |
| `schedule/franjas.ts` | Fase 2 (HeroClock usa franja actual) |
| `schedule/timezone.ts` | Fase 2 |
| `alerts/alertEngine.ts` | Fase 4 (backlog muestra alertas) |
| `import-export/normalizer.ts` | Fase 7 |
| `import-export/export.ts` | Fase 7 |

---

## Principios que gobiernan todas las fases

1. **Si no se ve bien, no está terminado.** La estética es condición de "done".
2. **Shell → Vista → Funcionalidad.** Siempre en ese orden dentro de cada fase.
3. **La v1.0 es el piso.** Se puede ser diferente, mejor, pero no peor.
4. **Cada componente se prueba en los 5 temas.**
5. **Personalidad en todo.** Tono rioplatense, emojis con intención, estados vacíos que guían.
6. **Menos features, más experiencia.** Ante la duda: pulir antes que agregar.
7. **El documento de fase se escribe al iniciar la fase**, no antes — beneficiándose de lo aprendido.

---

## Riesgos y mitigaciones

| Riesgo | Probabilidad | Mitigación |
|--------|-------------|------------|
| Lit tiene menos ejemplos que React para Claude/Copilot | Alta | TypeScript vanilla es bien soportado. Lit es thin layer. Documentar patterns que funcionen. |
| Shadow DOM complica testing | Media | @open-wc/testing resuelve esto. Evaluar usar `createRenderRoot` sin Shadow DOM si hay fricción. |
| GSAP performance en animaciones complejas | Baja | GSAP está optimizado para 60fps. Testear early en Fase 1. |
| Storybook + Lit tiene menos ecosistema | Media | Storybook 8 soporta Web Components oficialmente. Si hay fricción, evaluar alternativas (Histoire, mdx manual). |
| El port de domain logic tiene edge cases | Baja | Los tipos y tests de v2.0 siguen siendo validables. Vitest corre igual. |

---

> *Cada fase nos acerca al producto. Cada documento de fase nos da la claridad para ejecutarla bien.*
> *El plan es el mapa. Los documentos de fase son el GPS.*
