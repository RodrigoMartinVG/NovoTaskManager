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
| **2** | Config (vista dedicada) | CRUD de tipos, franjas y tema — la base de todo | Vista Config con tabs + datos reales post-onboarding |
| **3** | Vista Backlog + TaskView | La lista maestra de tareas con CRUD completo | Tabla con filtros + crear/editar/eliminar tarea |
| **4** | Vista Materias | CRUD de materias + config por materia + progreso slot-aware | Cards con objetivos, slots día×franja, progreso semanal |
| **5** | Vista Sesiones | CRUD de sesiones de estudio + historial filtrable | Lista/tabla de sesiones manual/pomo + stats |
| **6** | Vista Semana + Franjas | La planificación semanal visual (lectura de slots) | Grilla 7×franjas mostrando materias asignadas |
| **7** | Vista Hoy | El dashboard diario — lectura, todo ya existe | HeroClock + tareas de hoy + urgentes + pomo launcher |
| **8** | Kanban + Calendario | Las dos vistas alternativas | Kanban con columnas + Calendario mensual |
| **9** | Import/Export + Drive | Persistencia externa | export/import JSON + Google Drive sync |
| **10** | Pulido y cierre | Accesibilidad, performance, edge cases | WCAG AA, Lighthouse, visual regression suite |

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

## Fase 2 — Config (vista dedicada)

**Premisa**: Sin materias no hay tareas. Sin tipos no hay categorías. Sin franjas no hay grilla semanal. Config es la base — se construye primero como una vista propia accesible desde ⚙.

### Objetivos
- **Vista Config** como 7ª ruta en el nav (ícono ⚙, separado del grupo principal)
- **Tab Materias**: CRUD completo (nombre, color, horasSemanales, activa). Color picker, lista con edición inline o expandible
- **Tab Tipos de tarea**: CRUD (nombre, ícono, activo). Selector de emoji
- **Tab Franjas**: modo 3/6 franjas, horarios editables, conversión automática entre modos
- **Tab Tema**: selector de tema + densidad (reutilizar lógica del onboarding)
- Botón "Volver" o navegación natural al pulsar otra vista en el nav
- Store actions: addMateria, updateMateria, deleteMateria, addTipo, updateTipo, deleteTipo, setFranjas

### Criterio de cierre
- [ ] CRUD materias funcional con color picker y persistencia
- [ ] CRUD tipos funcional con ícono emoji
- [ ] Config franjas (modo 3/6, horarios editables)
- [ ] Selector de tema + densidad
- [ ] Datos persisten en localStorage tras crear/editar/eliminar
- [ ] Estados vacíos con CTA ("Creá tu primera materia")
- [ ] Se ve profesional en los 5 temas
- [ ] Build limpio (tsc + biome)

### Dependencias
- Fase 0 (shell, nav-bar, temas)
- Fase 1 (store con types ya existe, extender con CRUD actions)

### Documento detallado
`UAI_PLANNER_V3_FASE_02_CONFIG.md`

---

## Fase 3 — Backlog + TaskModal

**Premisa**: La lista maestra de todas las tareas. Creación, edición y eliminación de tareas con todos los campos. Depende de materias y tipos (Fase 2).

### Objetivos
- Lista/tabla de tareas con tipo + materia + estado + prioridad + fecha
- Filtros por tipo, materia, estado
- TaskModal: crear y editar tarea completa (título, materia, tipo, estado, prioridad, fechas, checklist, descripción)
- Botón "+ Nueva tarea" funcional
- Confirmación antes de eliminar

### Criterio de cierre
- [ ] Cada fila comunica la información táctica de un vistazo
- [ ] Filtros funcionan
- [ ] TaskModal crea y edita tareas
- [ ] Confirmación antes de eliminar
- [ ] Se ve como la v1.0 o mejor

### Dependencias
- Fase 0 (shell), Fase 2 (materias y tipos existen para asignar a tareas)

### Documento detallado
`UAI_PLANNER_V3_FASE_03_BACKLOG.md`

---

## Fase 4 — Vista Materias (CRUD + Config + Progreso)

**Premisa**: Las materias son el eje central del planner. Esta vista concentra todo lo relativo a materias: crear/editar/eliminar, configurar objetivos semanales (horas min/max), asignar slots de estudio (día × franja), y ver el progreso semanal con un algoritmo slot-aware que evita falsos negativos.

> **Cambio de arquitectura (v3.1)**: El CRUD de materias se migra de Config a esta vista. Config queda solo con Tipos, Franjas y Tema. La asignación de slots (antes en Fase 5 Semana) ahora vive aquí como parte de la config por materia. Semana pasa a ser una vista de lectura.

### Objetivos
- **CRUD completo de materias** en esta vista (no en Config)
- **Config por materia**: nombre, color, activa, horasSemanalesMin, horasSemanalesMax
- **Slots día×franja**: grilla de checkboxes (7 días × franjas configuradas) por materia
- **Progreso slot-aware**: barra que solo cuenta como "esperado" las horas de slots ya transcurridos
- **Card layout**: compact (nombre + mini-stats + progress) / expanded (full config + slot grid)
- **Empty state**: CTA para crear primera materia

### Tipos nuevos
```ts
interface MateriaSlot { dia: number; franjaId: string; }
interface Materia {
  id: string; nombre: string; color: string;
  horasSemanalesMin?: number; horasSemanalesMax?: number;
  slots?: MateriaSlot[]; activa?: boolean;
}
```

### Algoritmo de progreso slot-aware
1. `totalSlotHours` = Σ duración de todos los slots de la materia
2. `elapsedSlotHours` = Σ duración de slots cuyo día ya pasó, o cuya franja ya terminó hoy
3. `expected` = horasSemanalesMin × (elapsedSlotHours / totalSlotHours) — o 0 si no hay slots definidos
4. `actual` = Σ minutos de sesiones de esta materia esta semana / 60
5. Si expected = 0 → "Al día"; si actual ≥ expected → "Al día"; si no → "Atrasado"

### Criterio de cierre
- [ ] CRUD materias funcional (crear, editar inline, eliminar con confirmación)
- [ ] Config por materia: min/max horas, slot grid funcional
- [ ] Progreso slot-aware correcto (no muestra "atrasado" antes de que pasen los slots)
- [ ] Se ve profesional en los 5 temas
- [ ] Config ya no tiene tab Materias (solo Tipos, Franjas, Tema)
- [ ] Build limpio (tsc + biome)

### Dependencias
- Fase 0 (shell), Fase 2 (franjas configuradas, tipos), Fase 3 (tareas)

### Documento detallado
`UAI_PLANNER_V3_FASE_04_MATERIAS.md`

---

## Fase 5 — Vista Sesiones

**Premisa**: Las sesiones de estudio necesitan su propio espacio. CRUD completo: crear sesiones manuales o que vengan del Pomodoro, con o sin materia/tarea asociada. Historial filtrable y estadísticas.

### Objetivos
- **CRUD sesiones**: crear manual (fecha, duración, materia, tarea, título), editar, eliminar
- **Integración Pomodoro**: las sesiones timer se registran automáticamente
- **Filtros**: por materia, por semana/rango, por origen (manual/timer)
- **Stats**: horas totales, promedio diario, distribución por materia

### Criterio de cierre
- [ ] Crear sesión manual con todos los campos
- [ ] Listar sesiones con filtros funcionales
- [ ] Stats de resumen visibles
- [ ] Se ve profesional en los 5 temas

### Dependencias
- Fase 0 (shell), Fase 4 (materias con CRUD propio)

### Documento detallado
`UAI_PLANNER_V3_FASE_05_SESIONES.md`

---

## Fase 6 — Vista Semana + Franjas

**Premisa**: La planificación visual de la semana. Los slots ya se asignan en Materias (Fase 4), esta vista los consume en modo lectura para mostrar la grilla semanal con colores de materia.

### Objetivos
- Grilla 7 días × franjas horarias (usa config de Fase 2)
- Muestra materias asignadas a cada slot (colores, nombres)
- Indicadores de horas planificadas vs objetivo por materia
- Vista responsive

### Criterio de cierre
- [ ] Grilla se ve clara y proporcional
- [ ] Slots muestran las materias asignadas (lectura desde Materia.slots)
- [ ] Progreso visual de horas por materia
- [ ] Responsive funciona

### Dependencias
- Fase 0, Fase 2 (franjas configuradas), Fase 4 (materias con slots)

### Documento detallado
`UAI_PLANNER_V3_FASE_06_SEMANA.md`

---

## Fase 7 — Vista Hoy

**Premisa**: Es la primera vista que ve el usuario cada día. A esta altura ya existen materias (F2), tareas (F3), sesiones (F4) y franjas/slots (F5). Vista Hoy las consume todas en modo lectura.

### Objetivos
- HeroClock: hora grande + fecha + franja horaria con emoji
- Sección de tareas de hoy (filtradas por fecha)
- Sección urgente: tareas atrasadas/próximas a vencer
- Sección "más tarde" con próximas tareas
- Pomo launcher: iniciar sesión de estudio desde acá
- Estados vacíos con personalidad y CTA

### Criterio de cierre
- [ ] Con datos reales: muestra tareas del día
- [ ] Estado vacío tiene personalidad y guía
- [ ] Un protagonista claro: el reloj + "qué tengo hoy"
- [ ] Pomo launcher funciona

### Dependencias
- Fase 0, Fase 2 (materias, franjas), Fase 3 (tareas), Fase 6 (slots)

### Documento detallado
`UAI_PLANNER_V3_FASE_07_HOY.md`

---

## Fase 8 — Kanban + Calendario

**Premisa**: Dos vistas alternativas para usuarios con diferentes preferencias.

### Objetivos
- **Kanban**: columnas por estado (pendiente, en progreso, completada), cards arrastrables entre columnas
- **Calendario**: vista mensual con eventos/tareas, navegación entre meses, mini-resumen al click

### Criterio de cierre
- [ ] Kanban: drag entre columnas cambia estado
- [ ] Calendario: navegar meses, ver tareas por día
- [ ] Ambas se ven bien en los 5 temas

### Dependencias
- Fase 0, Fase 3 (tareas)

### Documento detallado
`UAI_PLANNER_V3_FASE_08_KANBAN_CALENDARIO.md`

---

## Fase 9 — Import/Export + Drive

**Premisa**: Persistencia externa y portabilidad de datos.

### Objetivos
- **Export**: JSON descargable con toda la data
- **Import**: carga de JSON con normalización defensiva
- **Google Drive**: conectar, guardar, cargar, auto-save, resolución de conflictos

### Criterio de cierre
- [ ] Export: genera JSON válido y completo
- [ ] Import: carga JSON y normaliza campos faltantes/malformados
- [ ] Drive: conectar con Google, guardar/cargar, indicador de sync

### Dependencias
- Todas las fases anteriores (hay datos que exportar/importar)

### Documento detallado
`UAI_PLANNER_V3_FASE_09_DRIVE.md`

---

## Fase 10 — Pulido y cierre

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
`UAI_PLANNER_V3_FASE_10_PULIDO.md`

---

## Lógica de dominio — cuándo se porta

La lógica de dominio de v2.0 es TypeScript puro y se copia sin cambios. No tiene fase propia — se integra cuando cada fase la necesita:

| Archivo de dominio | Se porta en |
|--------------------|-------------|
| `planner/types.ts` | Fase 1 (ya portado — tipos base para store) |
| `planner/reducer.ts` | Fase 2 (Config necesita CRUD actions) |
| `planner/selectors.ts` | Fase 3-6 (selectores para vistas) |
| `planner/service.ts` | Fase 2 (adaptado a signals) |
| `schedule/franjas.ts` | Fase 2 (Config de franjas) |
| `schedule/timezone.ts` | Fase 5-6 (Semana + Hoy usan timezone) |
| `alerts/alertEngine.ts` | Fase 6 (Vista Hoy muestra urgentes) |
| `import-export/normalizer.ts` | Fase 8 |
| `import-export/export.ts` | Fase 8 |

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
