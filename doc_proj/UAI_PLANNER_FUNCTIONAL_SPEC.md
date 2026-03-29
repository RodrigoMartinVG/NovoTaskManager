# UAI Planner — Especificación Funcional Completa
## Para reconstrucción desde cero con arquitectura limpia

> **Propósito de este documento**
> Captura el 100% del comportamiento observable del monolito `uai_planner_estable_.html` (10.578 líneas).
> Está redactado para que una AI en VSCode pueda reconstruir la aplicación desde cero con React + TypeScript + Vite, sin consultar el código fuente original, logrando paridad funcional completa.
>
> **Lo que este documento NO especifica**
> La implementación técnica interna (reducers, hooks, estructura de archivos). Eso queda a criterio del agente, que debe aplicar las mejores prácticas de arquitectura limpia.
>
> **Nota sobre la estética**
> El sistema de diseño está totalmente definido en la sección §10. La app usa una estética monospaced/terminal con 5 temas intercambiables. La fidelidad visual es "buena aproximación", no pixel-perfect.

---

## ÍNDICE

1. [Visión General](#1-vision-general)
2. [Modelo de Datos](#2-modelo-de-datos)
3. [Onboarding](#3-onboarding)
4. [Shell y Navegación](#4-shell-y-navegación)
5. [Vista Hoy](#5-vista-hoy)
6. [Vista Semana](#6-vista-semana)
7. [Vista Kanban](#7-vista-kanban)
8. [Vista Backlog](#8-vista-backlog)
9. [Vista Calendario](#9-vista-calendario)
10. [Vista Materias](#10-vista-materias)
11. [Sistema de Tareas — Modales](#11-sistema-de-tareas--modales)
12. [Timer Pomodoro](#12-timer-pomodoro)
13. [Configuración](#13-configuración)
14. [Sincronización con Google Drive](#14-sincronización-con-google-drive)
15. [Import / Export de datos](#15-import--export-de-datos)
16. [Sistema de Alertas](#16-sistema-de-alertas)
17. [Sistema de Franjas Horarias](#17-sistema-de-franjas-horarias)
18. [Sistema de Diseño](#18-sistema-de-diseño)
19. [Persistencia y Estado Global](#19-persistencia-y-estado-global)
20. [Guía de Ayuda](#20-guía-de-ayuda)

---

## 1. VISIÓN GENERAL

### Qué es la app
UAI Planner es un planificador académico personal para estudiantes universitarios. Permite gestionar materias, tareas, sesiones de estudio y horarios semanales en una sola aplicación web. Funciona completamente offline (datos en localStorage) con sincronización opcional a Google Drive.

### Usuario objetivo
Estudiante universitario argentino que cursa múltiples materias simultáneamente, necesita trackear fechas de entrega, registrar horas de estudio, y visualizar su carga de trabajo semanal.

### Idioma
Toda la interfaz está en **español rioplatense** (vos/ustedes, "materia" no "asignatura", "rendir" no "examinarse").

### Tecnología de referencia
React 18, sin framework de componentes externo. Fuente monospace. El monolito original no tiene router — la navegación entre vistas es estado en memoria. La reconstrucción puede usar React Router v6 o mantener el mismo patrón de estado.

---

## 2. MODELO DE DATOS

### 2.1 Estructura raíz (PlannerData)

```typescript
interface PlannerData {
  version?: string          // "1" — para migración futura
  materias:  Materia[]
  tipos:     TipoTarea[]
  tareas:    Tarea[]
  sesiones:  Sesion[]
}
```

El planner se guarda completo en una sola entrada de localStorage. No hay base de datos, no hay API propia.

### 2.2 Materia

```typescript
interface Materia {
  id:       string          // "mat_1234567890" o cualquier string único
  nombre:   string          // "Análisis Matemático II"
  codigo:   string          // "AM2" — identificador corto, ej para badges
  color:    string          // hex "#4e47b8" — color de identificación visual
  anio:     number          // 2026
  periodo:  "c1"|"c2"|"anual"
  horasMin: number          // objetivo mínimo de horas semanales (puede ser 0)
  horasMax: number          // objetivo máximo de horas semanales (puede ser 0)
  slots:    MateriaSlot[]   // horarios asignados en la semana
}

interface MateriaSlot {
  dia:     "lun"|"mar"|"mie"|"jue"|"vie"|"sab"|"dom"
  momento: string           // id de franja: "manana"|"tarde"|"noche" o "manana1"..."noche2"
}
```

**Reglas de negocio:**
- Una materia puede no tener slots asignados (sin horario definido)
- `horasMin === 0` y `horasMax === 0` significa que no hay objetivo horario configurado
- El color es el identificador visual principal — aparece en todas las vistas
- No se puede eliminar una materia que tiene tareas asociadas

### 2.3 Tarea

```typescript
interface Tarea {
  id:          string
  titulo:      string
  descripcion: string           // puede estar vacío
  materiaId:   string           // referencia a Materia.id
  tipo:        string           // referencia a TipoTarea.id
  fechaLimite: string | null    // "YYYY-MM-DD" o null
  fechaInicio: string | null    // "YYYY-MM-DD" o null — fecha de inicio programada
  hora:        string | null    // "HH:MM" — hora específica dentro del día (opcional)
  estado:      "pendiente"|"en_progreso"|"completado"
  prioridad:   "alta"|"media"|"baja"
  obligatorio: boolean          // si es de entrega obligatoria
  items:       ChecklistItem[]  // checklist interna
  link_vc:     string | null    // URL de videollamada (zoom, meet, etc)
}

interface ChecklistItem {
  id:    string
  label: string
  done:  boolean
}
```

**Reglas de negocio:**
- Una tarea sin `fechaLimite` no tiene deadline (válido)
- `fechaInicio` es distinto de `fechaLimite` — permite definir cuándo *empezar* a trabajar
- El progreso de una tarea se calcula solo si tiene `items`: `Math.round(hechos/total * 100)`
- Una tarea completada pierde su alerta de urgencia independientemente de la fecha
- El `link_vc` muestra un ícono 📹 en las vistas si está presente

### 2.4 TipoTarea

```typescript
interface TipoTarea {
  id:     string    // generado del label: "tp", "parcial", "entregable", etc.
  label:  string    // "TP", "Parcial", "Entregable"
  icon:   string    // emoji: "📝", "📋", "🎯"
  bg:     string    // color de fondo del badge (hex)
  accent: string    // color de texto/borde del badge (hex)
}
```

**Tipos por defecto (DEFAULT_TIPOS):**
```
{ id: "entregable", label: "Entregable", icon: "📦", bg: "#eae8f6", accent: "#4e47b8" }
{ id: "parcial",    label: "Parcial",    icon: "📋", bg: "#f5e8cc", accent: "#7a4808" }
{ id: "tp",         label: "TP",         icon: "📝", bg: "#daeee3", accent: "#146035" }
{ id: "final",      label: "Final",      icon: "🎓", bg: "#f2dcda", accent: "#8c2018" }
{ id: "lectura",    label: "Lectura",    icon: "📖", bg: "#e8e3d8", accent: "#524c44" }
{ id: "practica",   label: "Práctica",  icon: "🔧", bg: "#e1f5ee", accent: "#0f6e56" }
```

### 2.5 Sesion

```typescript
interface Sesion {
  id:        string
  materiaId: string             // referencia a Materia.id
  tareaId:   string | null      // referencia a Tarea.id (puede ser null)
  inicio:    string             // "YYYY-MM-DDTHH:MM:00" — hora local, no UTC
  minutos:   number             // duración en minutos
  origen:    "timer" | "manual" // si fue por el Pomodoro o cargada a mano
  titulo:    string             // descripción libre de la sesión (puede estar vacío)
}
```

**Reglas de negocio:**
- Las sesiones se acumulan — nunca se reemplazan
- Una sesión puede no tener tarea asociada (estudio libre de una materia)
- El `inicio` usa hora local de Argentina (timezone: `America/Argentina/Ushuaia`)
- Las horas de la semana se calculan sumando minutos de sesiones de los últimos 7 días

---

## 3. ONBOARDING

### 3.1 Cuándo aparece
El onboarding aparece cuando:
- Es el primer uso (no hay `uai-mode` en localStorage)
- El usuario hace clic en "Guía de inicio" desde la app

### 3.2 Pasos del onboarding

**Paso 1: Bienvenida (`welcome`)**
- Pantalla centrada con logo `◈` animado (pulse de glow)
- Título: "UAI Planner"
- Subtítulo: "PLANIFICADOR ACADÉMICO"
- Card con descripción de la app y grid 2×2 de features:
  - 📅 Vista Semana — horarios visuales
  - ✓ Backlog — tareas organizadas
  - 🍅 Pomodoro — timer de estudio
  - 📊 Materias — seguimiento de horas
- Botón principal "Empezar →" avanza al paso de tema
- Fondo: grilla de puntos sutil + degradado radial desde el centro

**Paso 2: Elección de tema (`tema`)**
- Grid de 5 chips de tema (uno por cada tema disponible)
- Cada chip muestra una miniatura de 2 barras de colores representativos
- El tema seleccionado tiene borde de `--accent` y fondo de `--info-bg`
- Seleccionar un tema lo aplica inmediatamente a `document.documentElement`
- Botón "← Atrás" y "Continuar →"
- Nota: "No te bloquees acá: es solo estética."

**Paso 3: Elección de dataset (`dataset`)**
- Dos opciones:
  - **⚡ Empezar rápido en modo local** (resaltado como "recomendado") — planner vacío
  - **🎲 Explorar con datos de ejemplo** (tag "demo") — carga datos ficticios
- Si ya hay datos existentes: aviso de que se pedirá confirmación antes de reemplazar
- Si ya hay datos existentes: botón extra "Salir a la app" (sin cambiar nada)
- Clic en "Empezar rápido" → abre app en modo local con planner vacío + activa guía de ayuda automáticamente
- Clic en "Explorar con datos de ejemplo" → carga SAMPLE_DATA y abre app + guía

### 3.3 Comportamiento de los datos de ejemplo (SAMPLE_DATA)
Son datos hardcodeados en el código que incluyen:
- 7 materias (Análisis Matemático, Programación, etc.) con colores, códigos y slots asignados
- ~15 tareas en distintos estados (pendiente, en_progreso, completado) con fechas variadas
- ~17 sesiones de estudio de las últimas semanas
- Los tipos de tarea por defecto

### 3.4 Progreso visual
Indicador de pasos en la parte superior del card: chips pill con número y nombre del paso. El activo está resaltado con `--info-bg`. Los completados tienen el número en `--accent`.

---

## 4. SHELL Y NAVEGACIÓN

### 4.1 Chrome Shell (header)
El header es un componente sticky de comportamiento especial:

**Comportamiento peek/pin:**
- Por defecto está **colapsado** — solo asoma una "lengüeta" (pill) en la parte superior con el nombre de la vista activa
- Al hacer hover sobre la lengüeta o hacer clic → se **expande** mostrando el header completo
- Botón de **pin** (📌) en el header: si está pineado, el header permanece visible siempre; si no, se colapsa al salir del hover
- El estado de pin persiste en `localStorage` con key `uai-chrome-pinned`
- Cuando está colapsado, la app ocupa toda la altura disponible y el main tiene padding-top reducido

**Contenido del header expandido (de izquierda a derecha):**
1. Logo `◈` + título "UAI Planner"
2. Navegación principal: botones de vista (`Hoy` `Semana` `Kanban` `Backlog` `Cal` `Materias`)
3. Separador `|`
4. Filtro de período (año + C1/C2/Anual)
5. Banner de urgencias (si hay tareas urgentes)
6. Separador
7. Botón exportar JSON
8. Botón importar tareas (solo tareas, no reemplaza todo el planner)
9. Botón "💾 Datos" → dropdown con: estado Drive, botones de backup completo, importar backup, conectar/desconectar Drive
10. Theme switcher
11. Botón `⚙` (Configuración)
12. Botón `?` (Ayuda)
13. Botón pin

### 4.2 Vistas disponibles
| ID | Label | Ícono |
|---|---|---|
| `hoy` | Hoy | — |
| `semana` | Semana | — |
| `kanban` | Kanban | — |
| `backlog` | Backlog | — |
| `calendar` | Cal | — |
| `materias` | Materias | — |

La vista activa persiste en `localStorage` con key `uai-last-view`.

### 4.3 Filtro global de período
- Selector combinado de **año** y **período** (C1 / C2 / Anual)
- Funciona como popover al hacer clic sobre el botón
- Filtro año: puede ser "Todos los años" o un año específico (los disponibles se extraen de las materias existentes)
- Filtro período: checkbox múltiple — se pueden seleccionar uno o varios simultáneamente; nunca puede quedar vacío
- Afecta qué materias aparecen en **todas las vistas**. Las tareas se filtran en cascada por las materias visibles.
- Filtro activo → el label del botón muestra "2026 · C1, C2" etc.

### 4.4 UnsavedToast
Pequeño toast en la parte inferior que aparece cuando:
- Hay cambios sin guardar (`dirty === true`)
- No está conectado a Drive
- No es modo demo

Mensaje: "Cambios sin guardar — exportá tu backup para no perder nada"

### 4.5 Filtros de lista (Backlog/Kanban/Calendario)
En las vistas de lista existe un segundo nivel de filtros:
- **Materia**: dropdown "Todas las materias" o una específica
- **Tipo**: dropdown "Todos los tipos" o uno específico  
- **Alerta**: dropdown "Todas" o "Con alerta activa"

Estos filtros son locales a las vistas de lista, no al header global.

---

## 5. VISTA HOY

### 5.1 Propósito
Muestra qué hay para hacer **hoy específicamente**: materias asignadas a la franja horaria actual, tareas urgentes, y acceso rápido al Pomodoro.

### 5.2 Sección principal: materias de hoy
- Detecta el **día actual** y la **franja horaria actual** (según la hora del sistema en timezone Argentina)
- Muestra las materias que tienen un slot asignado para ese día+franja
- Cada materia aparece como card expandida con:
  - Dot de color + nombre
  - Barra de progreso de horas de la semana (si tiene objetivos configurados): "Xh / Min–Maxh"
  - Color de la barra: verde si dentro del objetivo, amarillo/rojo si debajo, azul si excede
  - Botón "▶ Iniciar sesión de estudio" → abre el PomoContextPopup
- Si no hay materias ahora: mensaje vacío con sugerencia de configurar horarios

### 5.3 Sección "más tarde hoy"
- Lista compacta de materias con slots en franjas posteriores del mismo día
- Cards más pequeños (solo nombre + mini barra de horas)

### 5.4 Sección de tareas urgentes
- Lista de tareas que tienen alerta activa (cualquier color de alerta)
- Cards con: color de urgencia en borde izquierdo, título, materia, tipo, días hasta el deadline
- Clic en la tarjeta → abre TaskModal

### 5.5 Grilla semanal en Vista Hoy
La Vista Hoy también muestra la grilla completa de la semana (igual que Vista Semana) como referencia del horario semanal. Ver §6 para el comportamiento de la grilla.

---

## 6. VISTA SEMANA

### 6.1 Propósito
Grilla visual del horario semanal. Muestra qué materias están asignadas a cada día × franja. Permite reasignar slots por drag-and-drop.

### 6.2 Layouts disponibles
El usuario puede alternar entre dos layouts con botones en la parte superior:

**Layout Horizontal (default):** franjas en filas, días en columnas
```
         Lun    Mar    Mié    Jue    Vie    Sáb    Dom
🌅 Mañana [ AM2 ] [     ] [ PGM ] ...
☀️ Tarde  [     ] [ AM2 ] [     ] ...
🌙 Noche  [     ] [     ] [     ] ...
```

**Layout Vertical:** días en filas, franjas en columnas
```
         🌅 Mañana   ☀️ Tarde   🌙 Noche
Lun      [ AM2 ]     [      ]   [      ]
Mar      [      ]    [ AM2 ]    [      ]
```

El layout elegido persiste en `localStorage` con key `uai-grid-layout`.

### 6.3 Celdas de la grilla
Cada celda puede contener cero o más materias. Cada materia se muestra como un chip pequeño con:
- Color de fondo semitransparente del color de la materia
- Texto del código (ej: "AM2"), truncado si no entra
- Draggable

La celda del día+franja **actuales** tiene borde de `--accent` y fondo `--info-bg`.

### 6.4 Drag-and-drop de slots
- Arrastrar un chip de materia a otra celda → mueve ese slot
- Si la celda destino ya tiene el mismo slot de esa materia → no hace nada
- Evento `onDrop`: actualiza `materia.slots` removiendo el origen y agregando el destino

### 6.5 Edición de slot al hacer clic
- Clic en una celda vacía o en el chip → abre un pequeño popover inline con:
  - Lista de materias ya asignadas a esa celda (con opción de quitar)
  - Selector "AGREGAR MATERIA" con dropdown de materias disponibles
- Al agregar una materia al slot → se actualiza `materia.slots`

### 6.6 Indicador "Ahora"
La celda correspondiente al día y franja actuales tiene estilo especial aunque esté vacía.

---

## 7. VISTA KANBAN

### 7.1 Propósito
Tablero Kanban de tres columnas para gestionar el estado de las tareas.

### 7.2 Columnas
| ID | Label | Color del header |
|---|---|---|
| `pendiente` | Pendiente | neutro |
| `en_progreso` | En progreso | azul/accent |
| `completado` | Completado | verde/ok |

Cada columna muestra el conteo de tareas entre paréntesis en el título.

### 7.3 Cards de tarea
Cada tarjeta muestra:
- Borde izquierdo con el color de la materia
- Ícono del tipo + badge del tipo (con colores propios del tipo)
- Nombre de la materia (en gris pequeño arriba del título)
- Título de la tarea (con line-through si está completada)
- Si tiene `hora`: chip de hora
- Si tiene `link_vc`: ícono 📹
- Fecha límite + días restantes (con color de urgencia: rojo/amarillo/gris)
- Barra de progreso del checklist (si tiene items)
- Fracción "X/Y" si tiene checklist

Clic en la tarjeta → abre TaskModal.

### 7.4 Drag-and-drop entre columnas
- Drag de una tarjeta → mueve a la columna donde se suelta
- Cambiar columna = cambiar `tarea.estado`
- Animación de hover en la columna destino: fondo ligeramente iluminado

### 7.5 Orden de las tarjetas
Dentro de cada columna, las tareas se ordenan:
1. Primero por presencia de `fechaLimite` (las que tienen fecha van primero)
2. Luego por fecha límite ascendente (las más próximas arriba)
3. Las sin fecha al final

---

## 8. VISTA BACKLOG

### 8.1 Propósito
Lista completa de todas las tareas en formato de tabla densa. Más información por fila que en Kanban.

### 8.2 Orden de la lista
1. Las completadas van al fondo (con opacidad 0.5)
2. Entre las no completadas: por fecha límite ascendente
3. Sin fecha: al final de las no completadas

### 8.3 Anatomía de cada fila
```
[borde-color-materia] [ícono-tipo] [materia en gris] [título] [hora?] [badge-tipo] [barra-progreso] [fecha] [días]
```

- Borde izquierdo de 3px con color de materia
- Ícono del tipo (emoji grande, ~15px)
- Nombre de materia en gris muy pequeño (9px)
- Título con line-through si completado
- Chip de hora si está presente
- Badge del tipo (con colores propios)
- Barra de progreso del checklist (si tiene items), con fracción "X/Y"
- Fecha límite formateada: "24 Mar" (día + mes abreviado)
- Días restantes con color según urgencia (rojo/amarillo/neutro)
- Las tareas con alerta de tipo `start_*` muestran la fecha de inicio en lugar de la fecha límite

Clic en la fila → abre TaskModal.

---

## 9. VISTA CALENDARIO

### 9.1 Propósito
Calendário mensual que muestra las fechas de inicio y/o límite de las tareas como eventos.

### 9.2 Navegación
- Flechas `<` `>` para ir al mes anterior/siguiente
- Título muestra "Mes Año" (ej: "Marzo 2026")
- El mes actual se puede configurar desde los filtros del header

### 9.3 Grid del calendario
- 7 columnas (Dom → Sáb)
- Cada celda = un día del mes
- El día de hoy tiene el número resaltado con `--accent`

### 9.4 Eventos en el calendario
Cada tarea puede aparecer en hasta dos días:
- **Fecha de inicio** (`fechaInicio`): marcador de color de la materia + título truncado
- **Fecha límite** (`fechaLimite`): marcador de color de la materia + título truncado

El usuario puede togglear cuáles mostrar con el filtro de eventos (inicio, fin, o ambos).

Si hay muchos eventos en un día → se muestran los primeros N y aparece "+X más".

Clic en un evento → abre TaskModal.

### 9.5 Mover tarea a una fecha (drag o doble clic)
Clic en un evento y arrastrarlo a otra celda → actualiza `fechaLimite` o `fechaInicio` de la tarea según corresponda.

---

## 10. VISTA MATERIAS

### 10.1 Propósito
Vista de seguimiento por materia: horas de estudio acumuladas, sesiones registradas, tareas asociadas.

### 10.2 Lista de materias
Cada materia se muestra como un card con:
- Dot de color + nombre + código + tag de período (ej: "C1 2026")
- Barra de progreso de horas: "Xh esta semana / Min–Max objetivo"
- Color de la barra: gris (sin objetivo), verde (dentro del objetivo), amarillo (por debajo del mín), azul (sobre el máx)
- Botón "▶ Iniciar sesión" → abre PomoContextPopup
- Botón "✎ Objetivos" → abre HorasEditor
- Botón "＋ Cargar sesión manual" → abre ManualSessionModal

### 10.3 Sesiones de una materia
Al expandir una materia (o en el card de MateriasView):
- Lista cronológica de sesiones con: fecha formateada, duración en minutos, tarea asociada (si la hay), título
- Botón editar sesión → abre un pequeño inline form (cambiar duración/título/tarea)
- Botón eliminar sesión (con confirmación)

### 10.4 Tareas de una materia
Lista de tareas asociadas con su estado y fecha límite.

### 10.5 HorasEditor
Modal/inline para editar los objetivos horarios de una materia:
- Slider o inputs numéricos para `horasMin` y `horasMax`
- `horasMin` no puede ser mayor que `horasMax`
- Grilla de slots para asignar/desasignar franjas horarias
- Botones Cancelar / Guardar

---

## 11. SISTEMA DE TAREAS — MODALES

### 11.1 TaskModal (detalle de tarea)

Abre cuando se hace clic en una tarea desde cualquier vista.

**Cabecera:**
- Dot de color de materia (10×10, redondo)
- Nombre de la materia (en gris pequeño)
- Título de la tarea (h2)
- Badge del tipo de tarea (con colores propios)
- Botón ✕ cerrar

**Cuerpo:**
- Descripción (si la hay), en gris
- Grid de metadatos:
  - Estado (con selector inline para cambiarlo)
  - Prioridad
  - Fecha inicio (si la hay)
  - Fecha límite (si la hay)
  - Hora (si la hay)
  - Obligatorio (sí/no)
- Barra de progreso del checklist (si tiene items)
- Checklist: lista de items con checkbox togglable. Clic en el checkbox → toggle inmediato sin cerrar modal
- Si tiene `link_vc`: botón que abre el link en nueva pestaña
- Sección de sesiones de estudio relacionadas con esta tarea (listado simple)

**Pie:**
- Botón "✎ Editar" → cierra TaskModal, abre FormModal con los datos de la tarea
- Botón "🗑 Eliminar" → confirma (usando ConfirmModal) y borra la tarea
- Botón "▶ Iniciar Pomodoro" → abre PomoContextPopup con esta tarea preseleccionada

### 11.2 FormModal (crear / editar tarea)

**Cabecera:** "Nueva tarea" o "Editar tarea"

**Campos:**
| Campo | Tipo | Requerido |
|---|---|---|
| Título | text input | Sí |
| Materia | select (materias del planner) | Sí |
| Tipo | select (tipos del planner) | Sí |
| Estado | select (pendiente/en_progreso/completado) | Sí |
| Prioridad | select (alta/media/baja) | Sí |
| Fecha límite | date input | No |
| Fecha inicio | date input | No |
| Hora | select HH:MM con horas 00–23 y minutos 00/15/30/45 | No |
| Obligatorio | checkbox | No (default: true) |
| Descripción | textarea | No |
| Link VC | text input URL | No |
| Checklist | lista dinámica de items con botón "+ Agregar ítem" | No |

**Validaciones:**
- Título no puede estar vacío
- Si se especifican ambas fechas, `fechaInicio` no puede ser posterior a `fechaLimite`

**Checklist:**
- Cada ítem tiene un texto y un botón × para eliminar
- Botón "+ Agregar ítem" agrega un input vacío al final
- Los ítems vacíos se filtran al guardar

**Guardar:**
- Si es tarea nueva → genera ID y la agrega a `data.tareas`
- Si es edición → reemplaza en `data.tareas` por `id`
- Después de guardar: si es edición, vuelve a mostrar TaskModal de la tarea editada

### 11.3 ImportTasksModal

Permite importar tareas desde un JSON sin reemplazar todo el planner.

**Formato aceptado:**
```json
{ "tareas": [ { ... } ] }
```
O directamente un array `[ { ... } ]`

**Interfaz:**
- Área de texto para pegar el JSON
- Botón "Importar" → valida el JSON y agrega las tareas (con IDs nuevos generados)
- Muestra preview de cuántas tareas se van a importar
- Muestra la materia y tipo por defecto a usar si los items no los especifican

**Schint:** hint desplegable al final de la app (esquina inferior) que muestra el formato JSON esperado:
```json
{
  "tareas": [{
    "id", "titulo", "descripcion",
    "materiaId", "tipo", "fechaLimite": "YYYY-MM-DD",
    "estado": "pendiente|en_progreso|completado",
    "prioridad": "alta|media|baja",
    "items": [{ "id", "label", "done": true|false }]
  }]
}
```

### 11.4 ConfirmModal

Modal genérico de confirmación reutilizado en toda la app.

```typescript
interface ConfirmConfig {
  title:        string
  message:      string        // puede tener saltos de línea
  confirmLabel: string        // "Sí, continuar" / "Eliminar" etc
  cancelLabel:  string        // default: "Cancelar"
  tone:         "danger" | "warn" | "info"
  icon:         string        // emoji decorativo
  onConfirm:    () => void
}
```

El botón de confirmación toma el color correspondiente al `tone` (rojo, amarillo, azul).

### 11.5 ManualSessionModal

Permite registrar una sesión de estudio sin usar el timer.

**Campos:**
- Materia (preseleccionada si se abre desde MateriasView)
- Tarea asociada (opcional, select de tareas de esa materia)
- Fecha de la sesión (date input, default: hoy)
- Hora de inicio (TimeInputField)
- Duración en minutos (number input, min: 1)
- Título/nota (text, opcional)

**Al guardar:** agrega la sesión a `data.sesiones` con `origen: "manual"`.
Opción adicional: "Crear tarea rápida" (si se quiere asociar la sesión a una tarea nueva)

---

## 12. TIMER POMODORO

### 12.1 PomoContextPopup

Aparece antes de iniciar el timer para seleccionar el contexto de la sesión.

**Contexto de apertura:**
- Desde una tarea (TaskModal) → la tarea ya está preseleccionada
- Desde una materia (HoyView/MateriasView) → la materia está preseleccionada

**Opciones:**
1. **Trabajar en una tarea existente** → select con las tareas de esa materia no completadas
2. **Crear tarea nueva rápida** → text input para el título de la tarea nueva
3. **Solo sesión libre** → sin tarea asociada

**Campo adicional:** "Título de la sesión" (texto libre, opcional)

**Botón "Iniciar"** → cierra el popup, abre PomoWidget

### 12.2 PomoWidget

Timer Pomodoro flotante que se muestra superpuesto sobre toda la app.

**Posición:** esquina inferior derecha, fixed, z-index alto

**Estado del timer:**
- Muestra la materia (dot de color + nombre)
- Muestra la tarea asociada (si la hay)
- Contador de tiempo en formato MM:SS (cuenta hacia arriba — no es un countdown)
- El timer comienza desde 00:00 y avanza segundo a segundo

**Controles:**
- Botón "⏹ Detener" → guarda la sesión con los minutos transcurridos
- Botón "✕ Cancelar" → descarta sin guardar (con confirmación si hay > 1 minuto transcurrido)

**Al detener:**
- Si los minutos transcurridos < 1 → no guarda, solo cierra
- Si los minutos >= 1 → crea una `Sesion` con:
  - `materiaId`, `tareaId` del contexto
  - `inicio`: hora en que se inició (reconstruida a partir de `Date.now() - minutos * 60000`)
  - `minutos`: los transcurridos
  - `origen: "timer"`
  - `titulo`: el título de sesión ingresado en el popup

**Comportamiento en background:** el timer continúa aunque se navegue entre vistas.

---

## 13. CONFIGURACIÓN

### 13.1 SettingsModal

Modal amplio con 5 tabs.

**Tab 1: Materias**
- Lista de materias: dot de color, nombre, código, tag de período, conteo de tareas
- Botón ✎ para editar → abre MateriaForm inline dentro del modal
- Botón ✕ para eliminar → solo habilitado si la materia NO tiene tareas asociadas
- Botón "+ Agregar materia" al final → abre MateriaForm vacío

**MateriaForm (inline):**
- Nombre (required)
- Código (required, ej: "AM2")
- Color (color picker nativo)
- Año (select: año anterior, actual, siguiente)
- Período (select: C1, C2, Anual)
- Horas/semana mínimas (number, 0–40)
- Horas/semana máximas (number, 0–40)
- SlotGrid para asignar horarios (ver §17)
- Validación: min no puede ser > max

**Tab 2: Tipos de tarea**
- Lista de tipos: ícono, badge con colores propios, conteo de tareas
- Botón ✎ para editar → abre TipoForm inline
- Botón ✕ para eliminar → solo si no tiene tareas asociadas
- Botón "+ Agregar tipo"

**TipoForm (inline):**
- Ícono (emoji, input de texto de 1–2 chars con preview)
- Nombre/Label (required)
- Color de fondo del badge (color picker)
- Color de texto/borde del badge (color picker)
- Preview en tiempo real del badge con los colores elegidos

**Tab 3: Horarios**
- Selector de modo de franjas: 3 franjas (Mañana/Tarde/Noche) o 6 franjas
- Conversión automática al cambiar: 3→6 expande cada franja en dos sub-franjas; 6→3 las colapsa
- FranjasEditor: para cada franja, campos de hora de inicio y fin (TimeInputField)
- Preview en tiempo real de los rangos horarios
- Validación: las franjas deben estar en orden cronológico
- Botón "Guardar horarios"

**Tab 4: Alertas**
- Configuración de umbrales de urgencia (ver §16)
- Sliders o inputs para: días para "por empezar", "urgente", "muy urgente", etc.
- Preview de los colores de alerta

**Tab 5: Tema**
- Lista de los 5 temas con dot de color
- Clic en un tema → lo aplica inmediatamente
- El activo tiene ✓ al final

### 13.2 ResetModal

Modal para resetear los datos del planner.

**Opciones:**
1. **🧹 Empezar con planner vacío** — elimina todos los datos
2. **🧪 Cargar datos de ejemplo** — reemplaza por SAMPLE_DATA

**Comportamiento de confirmación:**
El sistema evalúa el estado actual del planner:
- Si hay datos reales → pide confirmación antes de cualquier opción
- Si está vacío y se elige vacío → pide confirmación (para descartar cambios de config)
- Si ya está en demo y se elige demo → pide confirmación (para resetear el demo)
- Si Drive está conectado → el mensaje de confirmación incluye aviso sobre el impacto en Drive

---

## 14. SINCRONIZACIÓN CON GOOGLE DRIVE

### 14.1 Flujo de conexión

1. Usuario hace clic en "Conectar Google Drive" (desde el dropdown "💾 Datos" o desde Settings)
2. Se abre el popup de OAuth de Google con scope `drive.file` (solo acceso al archivo propio de la app)
3. Al autorizar:
   - Se guarda el access token en memoria (no en localStorage)
   - Se obtiene el email del usuario via Google userinfo API
   - Se establece `appMode = "drive"` en localStorage
   - Se intenta cargar el archivo `uai-planner.json` de Drive

4. **Escenarios al conectar:**

   | Estado local | Estado Drive | Resultado |
   |---|---|---|
   | Vacío | Vacío | Nada. Drive queda listo para recibir datos. |
   | Vacío | Tiene datos | Carga los datos de Drive directamente |
   | Con datos | Vacío | Sube los datos locales a Drive |
   | Con datos | Tiene datos y son iguales | Usa los de Drive (sin conflicto) |
   | Con datos | Tiene datos y son distintos | Muestra DriveConflictModal |

### 14.2 DriveConflictModal

Aparece cuando hay diferencias entre los datos locales y los de Drive.

**Opciones:**
1. **"Usar versión de Drive"** — descarta los locales, carga los de Drive
2. **"Mantener mis datos locales"** — los locales quedan como activos; en la próxima sincronización sobrescribirán Drive

Mensaje explicativo de cada opción. Botón "Cancelar" que cierra sin resolver (pero la conexión Drive sigue activa).

### 14.3 Auto-save

Cuando Drive está conectado y `autoSave === true`:
- Cada vez que cambia `data` (después de un debounce de ~2–3 segundos), se guarda en Drive automáticamente
- `syncStatus` refleja el estado: `idle → saving → saved | error`
- El timestamp del último guardado se muestra como "hace Xs / hace Xmin / hace Xh"

### 14.4 Guardado manual

Botón "Guardar en Drive ahora" disponible cuando está conectado. Cambia `syncStatus` a `saving` mientras dura la operación.

### 14.5 Carga manual

Botón "Cargar desde Drive" — descarta cambios locales y carga la versión de Drive.

### 14.6 Desconexión

"Desconectar Drive":
- Revoca el token OAuth
- `appMode` vuelve a `"local"`
- **Los datos actuales se preservan localmente** — no se pierden al desconectar
- Nunca vuelve al onboarding

### 14.7 Indicadores de sincronización

En el header, cuando Drive está conectado:
- Ícono de Drive con estado: `●` verde (saved), `●` amarillo (saving), `●` rojo (error), `○` gris (idle)
- Tooltip con el último guardado hace X tiempo
- Botón de guardar manual

### 14.8 Almacenamiento por usuario

Los datos se guardan en localStorage en una key que incluye el email del usuario:
- `uai-planner-data-v1-usuario@gmail.com` — para usuarios con Drive
- `uai-planner-data-v1` — para modo local sin email

Esto permite que múltiples cuentas de Google compartan el mismo navegador sin pisar los datos.

---

## 15. IMPORT / EXPORT DE DATOS

### 15.1 Exportar backup completo (JSON)

Botón en el dropdown "💾 Datos" → descarga un archivo JSON con todo el planner:
```json
{
  "version": "1",
  "materias": [...],
  "tipos": [...],
  "tareas": [...],
  "sesiones": [...]
}
```
Nombre del archivo: `uai-planner_2026-03-28_14-30.json`

El botón tiene tres estados:
- `↓ Exportar` — sin cambios recientes
- `↓ Exportar •` — hay cambios no exportados (dirty)
- `✓ Exportado` — flash de 2 segundos después de exportar exitosamente

### 15.2 Importar backup completo

Botón en el dropdown "💾 Datos" → abre el selector de archivos del sistema.
Al seleccionar un `.json`:
- Lo parsea y normaliza
- Si tiene datos actuales → pide confirmación antes de reemplazar
- Si la estructura no es válida → muestra error inline

### 15.3 Importar solo tareas (ImportTasksModal)

Botón en el header → abre ImportTasksModal.
Importa solo tareas sin tocar materias, tipos, ni sesiones.
Las tareas nuevas se agregan con IDs únicos (no reemplaza).

### 15.4 Importación incremental por URL hash

La app procesa el hash de la URL al cargar: `#import=BASE64_JSON`
Si el hash empieza con `#import=`:
- Decodifica el Base64
- Parsea el JSON
- Lo guarda en `localStorage` con key `importaciones_uai` (historial de importaciones)
- Limpia el hash de la URL

---

## 16. SISTEMA DE ALERTAS

### 16.1 Qué son las alertas

Las alertas son indicadores visuales de urgencia basados en las fechas de las tareas. No son notificaciones del sistema — son colores aplicados en la UI.

### 16.2 Tipos de alerta

El sistema evalúa cada tarea y asigna uno de estos estados:

**Basado en `fechaLimite` (fecha de entrega):**

| Color | Condición |
|---|---|
| `"red"` | Días hasta la fecha límite ≤ umbral "muy urgente" (default: 2 días) |
| `"yellow"` | Días hasta la fecha límite ≤ umbral "urgente" (default: 7 días) |
| `"green"` | Días hasta la fecha límite ≤ umbral "en radar" (default: 14 días) |
| `null` | La tarea no entra en ningún umbral o ya está completada |

**Basado en `fechaInicio` (fecha de inicio programada):**

| Color | Condición |
|---|---|
| `"start_overdue"` | La fecha de inicio ya pasó y la tarea no está completada |
| `"start_now"` | La fecha de inicio es hoy |
| `"start_soon"` | La fecha de inicio es dentro de N días (configurable, default: 3) |

### 16.3 Configuración de umbrales

Los umbrales son configurables en Settings → Tab "Alertas". Se guardan en localStorage.

### 16.4 UrgentBanner

En el header, si hay tareas con alerta activa, aparece un chip con el resumen:
```
🔴 2 urgentes · 🟡 3 próximas · 🟢 1 en radar
```

Clic en el chip → abre popover con la lista de tareas urgentes agrupadas por color. Clic en una tarea → abre TaskModal.

### 16.5 Aplicación visual de los colores

- En **Backlog**: el número de días tiene color rojo/amarillo/gris
- En **Kanban**: igual
- En **Vista Hoy**: las tareas urgentes tienen borde izquierdo de color
- En **UrgentBanner**: chips de resumen en el header
- Las alertas de tipo `start_*` usan el ícono ⚡ en lugar de los círculos de colores

---

## 17. SISTEMA DE FRANJAS HORARIAS

### 17.1 Qué son las franjas

Las franjas dividen el día en bloques de tiempo. Se usan para:
- Asignar materias a horarios (slots de materia)
- Determinar la franja "actual" en la Vista Hoy
- Mostrar la grilla en Vista Semana

### 17.2 Modos disponibles

**Modo 3 franjas (default):**
| ID | Nombre | Default |
|---|---|---|
| `manana` | 🌅 Mañana | 06:00–13:00 |
| `tarde` | ☀️ Tarde | 13:00–19:00 |
| `noche` | 🌙 Noche | 19:00–24:00 |

**Modo 6 franjas:**
| ID | Nombre | Default |
|---|---|---|
| `manana1` | 🌅 Mañana 1 | 06:00–10:00 |
| `manana2` | ☀️ Mañana 2 | 10:00–13:00 |
| `tarde1` | 🌤 Tarde 1 | 13:00–16:00 |
| `tarde2` | ☀️ Tarde 2 | 16:00–19:00 |
| `noche1` | 🌙 Noche 1 | 19:00–22:00 |
| `noche2` | 🌌 Noche 2 | 22:00–24:00 |

### 17.3 Conversión al cambiar de modo

Al pasar de 3 a 6 franjas:
- `manana` → `manana1` + `manana2` (mitad y mitad)
- `tarde` → `tarde1` + `tarde2`
- `noche` → `noche1` + `noche2`
- Los slots de las materias se actualizan automáticamente

Al pasar de 6 a 3:
- `manana1` + `manana2` → `manana`
- etc.

### 17.4 Timezone
El "ahora" se calcula siempre en timezone `America/Argentina/Ushuaia`. Esto garantiza consistencia aunque el usuario esté en otro huso horario.

### 17.5 Días de la semana
```
lun, mar, mie, jue, vie, sab, dom
```
La grilla siempre muestra los 7 días.

---

## 18. SISTEMA DE DISEÑO

### 18.1 Tipografía
- Fuente principal: `'DM Mono', 'Fira Code', 'Courier New', monospace`
- Todos los textos en monospace — es parte de la identidad visual
- Font size base: `13px` en `html, body`
- La app tiene una estética de terminal/código intencionada

### 18.2 Temas
5 temas intercambiables, definidos como atributos `data-theme` en el `<html>`.

**Tokens disponibles por tema:**
```css
--bg0       /* fondo principal (más oscuro/claro) */
--bg1       /* fondo de cards y panels */
--bg2       /* fondo de inputs y elementos secundarios */
--bg3       /* hover states */
--border    /* bordes primarios */
--border2   /* bordes secundarios, más visibles */
--text0     /* texto principal */
--text1     /* texto secundario */
--text2     /* texto terciario */
--text3     /* texto muy sutil (labels, hints) */
--accent    /* color de acento principal (botones, selección activa) */
--info-bg   /* fondo de elementos informativos */
--info-text /* texto informativo */
--warn-bg   /* fondo de advertencias */
--warn-text /* texto de advertencias */
--warn-border
--ok-bg     /* fondo de estados correctos/completados */
--ok-text
--ok-border
--err-bg    /* fondo de errores */
--err-text
--err-border
--overlay   /* color del overlay de modales */
--dark      /* 0 o 1, para ajustes que dependen del modo claro/oscuro */
```

### 18.3 Definición exacta de los 5 temas

**Hueso** (`--dark: 0`, tonos cálidos claros):
```css
--bg0: #f0ece3; --bg1: #e8e3d8; --bg2: #dfd9cc; --bg3: #d5cec0;
--border: #c4bcaf; --border2: #ada596;
--text0: #28231c; --text1: #524c44; --text2: #6e665c; --text3: #8c8278;
--accent: #4e47b8;
--info-bg: #eae8f6; --info-text: #3930a0;
--warn-bg: #f5e8cc; --warn-text: #7a4808; --warn-border: #b87830;
--ok-bg: #daeee3; --ok-text: #146035; --ok-border: #4a9a68;
--err-bg: #f2dcda; --err-text: #8c2018; --err-border: #c06060;
--overlay: rgba(30,25,18,.55);
```

**Claro** (`--dark: 0`, neutro blanco):
```css
--bg0: #f5f5f5; --bg1: #ffffff; --bg2: #eeeeee; --bg3: #e4e4e4;
--border: #d8d8d8; --border2: #bbbbbb;
--text0: #111111; --text1: #3a3a3a; --text2: #636363; --text3: #888888;
--accent: #4040cc;
--info-bg: #ededfa; --info-text: #2e2ea8;
--warn-bg: #fff4d6; --warn-text: #704800; --warn-border: #c8900a;
--ok-bg: #d6f5e3; --ok-text: #0f5030; --ok-border: #3a9060;
--err-bg: #fce8e8; --err-text: #850000; --err-border: #cc4444;
--overlay: rgba(0,0,0,.45);
```

**Noche** (`--dark: 1`, oscuro profundo):
```css
--bg0: #0e0e10; --bg1: #151517; --bg2: #1c1c1f; --bg3: #242428;
--border: #2c2c30; --border2: #3a3a40;
--text0: #ececec; --text1: #a8a8b0; --text2: #7a7a84; --text3: #60606a;
--accent: #8880f0;
--info-bg: #1e1c38; --info-text: #a8a0f8;
--warn-bg: #281e08; --warn-text: #e0a030; --warn-border: #5a4010;
--ok-bg: #0c2018; --ok-text: #40c878; --ok-border: #206040;
--err-bg: #200c0c; --err-text: #f07070; --err-border: #602020;
--overlay: rgba(0,0,0,.75);
```

**Pizarrón** (`--dark: 1`, azul marino profundo):
```css
--bg0: #181c2e; --bg1: #1f2440; --bg2: #272c4c; --bg3: #303560;
--border: #363c5e; --border2: #464e7a;
--text0: #e8eaf8; --text1: #9ea8d0; --text2: #7a84b8; --text3: #7078a8;
--accent: #a09cf8;
--info-bg: #2a2858; --info-text: #c0bcff;
--warn-bg: #2a220a; --warn-text: #f0c050; --warn-border: #604808;
--ok-bg: #0e2820; --ok-text: #50e090; --ok-border: #1a6040;
--err-bg: #280c10; --err-text: #f08080; --err-border: #602020;
--overlay: rgba(5,8,24,.75);
```

**Café** (`--dark: 1`, marrón oscuro):
```css
--bg0: #1a1410; --bg1: #221a14; --bg2: #2c211a; --bg3: #362820;
--border: #3e2e24; --border2: #503c30;
--text0: #f0e8d8; --text1: #b09080; --text2: #8a7060; --text3: #907060;
--accent: #c0a8f0;
--info-bg: #2a1e38; --info-text: #d8c8ff;
--warn-bg: #2a1c08; --warn-text: #f0b840; --warn-border: #604808;
--ok-bg: #0c2010; --ok-text: #60d890; --ok-border: #1a5030;
--err-bg: #280c08; --err-text: #f08878; --err-border: #602818;
--overlay: rgba(10,6,4,.75);
```

### 18.4 Componentes de UI recurrentes

**Modal:**
- Overlay oscuro a pantalla completa (clic fuera → cierra)
- Card centrada, máx-width configurado por modal (~420–640px la mayoría, ~1100px la guía de ayuda)
- Header con ícono + título + botón ✕
- Body con scroll si el contenido es largo

**Botones principales:**
- `.savebtn` — fondo `--accent`, texto blanco, hover opacity 0.88
- `.cancbtn` — borde `--border2`, fondo transparente
- `.iconbtn` — pequeño, fondo `--bg2`, borde `--border`

**Inputs:**
- `.fi` — fondo `--bg2`, borde `--border`, border-radius 6px, focus: borde `--accent`
- Selects, textareas tienen el mismo look

**Badges:**
- Inline, border-radius 4–6px, `badgeStyle(bg, accent, isDark)`:
  - Dark mode: fondo `accent + "22"`, texto `accent`, borde `accent + "44"`
  - Light mode: fondo `bg`, texto `accent`

**Scrollbar custom:**
- Width: 5px
- Thumb: `--border2`, border-radius 3px
- Track: transparent

### 18.5 Clases CSS del layout principal

```css
.app    /* flex-column, min-height: 100vh */
.main   /* área de contenido, padding-top = chrome height */
.ov     /* overlay de modales (rgba semitransparente, flex centrado) */
.mod    /* card del modal (bg1, border, border-radius 12-18px, padding) */
.mhd    /* header del modal (flex, gap, padding) */
.mtit   /* título del modal (font-size ~15px, bold) */
.mclose /* botón cerrar modal (esquina derecha) */
.mbody  /* cuerpo del modal (padding) */
```

---

## 19. PERSISTENCIA Y ESTADO GLOBAL

### 19.1 localStorage — claves completas

| Clave | Tipo | Descripción |
|---|---|---|
| `uai-theme` | string | ThemeId activo |
| `uai-planner-mode` | string | "welcome"\|"local"\|"drive" |
| `uai-planner-data-v1` | JSON | PlannerData en modo local |
| `uai-planner-data-v1-{email}` | JSON | PlannerData por usuario Drive |
| `uai-planner-email` | string | Email de Google autenticado |
| `uai-last-view` | string | ViewMode persistido |
| `uai-autosave` | "true"\|"false" | Auto-save Drive activo |
| `uai-chrome-pinned` | "true"\|"false" | Estado de pin del header |
| `uai-filtro-anio` | string/number | Filtro de año activo |
| `uai-filtro-periodos` | JSON array | Períodos activos (["c1","c2","anual"]) |
| `uai-franjas` | JSON | Configuración de franjas horarias |
| `uai-franjas-mode` | "3"\|"6" | Modo de franjas |
| `uai-alertas` | JSON | Umbrales de alertas |
| `uai-planner-drive-fileid` | string | ID del archivo en Drive |
| `uai-planner-last-saved` | number | Timestamp del último guardado Drive |
| `uai-grid-layout` | "horizontal"\|"vertical" | Layout de Vista Semana |
| `importaciones_uai` | JSON array | Historial de importaciones por URL hash |

### 19.2 Estado de la app al iniciar

1. Leer `uai-planner-mode`:
   - Si es `"welcome"` → mostrar Onboarding
   - Si es `"local"` → cargar datos de `uai-planner-data-v1` y mostrar la app
   - Si es `"drive"` → cargar datos locales del email guardado y mostrar la app; intentar reconexión silenciosa a Drive en background

2. Leer `uai-theme` → aplicar tema al `<html>` inmediatamente (antes del primer render para evitar flash)

3. Leer `uai-last-view` → establecer la vista inicial

### 19.3 Dirty tracking

El sistema detecta cambios no guardados comparando un hash del estado actual con el hash del último estado exportado/sincronizado.

`dirty === true` cuando:
- `hashData(currentData) !== hashData(lastExported)`

El hash es un simple `JSON.stringify(data)` usado como checksum (no criptográfico).

---

## 20. GUÍA DE AYUDA

### 20.1 HelpGuide

Modal de ayuda con sidebar de navegación y contenido rico.

**Estructura:**
- Header: ícono `?` + título "Guía de inicio · UAI Planner" + ✕
- Body: sidebar izquierdo (navegación) + panel de contenido derecho
- Footer: nota + botón "Reiniciar la bienvenida"

**Secciones del sidebar:**
1. 🚀 Inicio rápido
2. 📅 Vista Semana
3. ✓ Tareas y backlog
4. 🍅 Pomodoro
5. 📊 Materias
6. 💾 Datos y Drive
7. ⚙ Configuración
8. 🔔 Alertas

**Contenido de cada sección:** texto explicativo + instrucciones paso a paso en formato lista. El estilo es similar a documentación, con badges para resaltar términos clave.

### 20.2 Activación automática

Al entrar a la app por primera vez (desde el Onboarding), la guía se abre automáticamente. El usuario puede cerrarla y luego reabrirla desde el botón `?` del header.

### 20.3 Botón "Reiniciar la bienvenida"

En el footer de la guía → vuelve al Onboarding (paso `welcome`). Los datos actuales del planner se preservan.

---

## APÉNDICE A — Datos de ejemplo (SAMPLE_DATA)

Los datos de ejemplo incluyen:
- **7 materias:** Análisis Matemático, Programación, Física, Inglés Técnico, Historia, Economía, Química
- **Colores distintos** para cada materia (azul, verde, naranja, rojo, violeta, amarillo, cyan)
- **Slots asignados** a distintas combinaciones de día+franja para demostrar el horario semanal
- **~15 tareas** en los tres estados (pendiente, en_progreso, completado) con fechas variadas alrededor de la semana actual
- **~17 sesiones** de las últimas 2–3 semanas con duraciones de 45–90 minutos

El propósito de los datos de ejemplo es que el usuario pueda ver **inmediatamente** todas las vistas con contenido real sin tener que configurar nada.

---

## APÉNDICE B — Comportamientos de Edge Cases

### Materia sin slots
- No aparece en Vista Hoy ni en Vista Semana
- Sí aparece en Vista Materias, Backlog, Kanban y Calendario

### Tarea sin materia válida (materia eliminada)
- El sistema no debería permitir esto (no se puede eliminar una materia con tareas)
- Si ocurre por import manual defectuoso: la tarea se muestra con estilo degradado

### Planner vacío
- Las vistas muestran estados vacíos con mensajes guía ("Todavía no hay materias configuradas...")
- El UrgentBanner no aparece
- La Vista Hoy muestra sugerencia de configurar horarios

### Drive sin conexión a internet
- El auto-save falla silenciosamente (syncStatus → "error") sin bloquear la app
- Los datos siguen guardándose en localStorage normalmente
- El error se muestra en el indicador del header

### Cambio de franja de 3 a 6 con slots existentes
- Los slots se redistribuyen automáticamente (ver §17.3)
- No se pierde ningún slot — todos los días+franjas asignados se preservan

### Dos pestañas del mismo navegador
- Cada pestaña tiene su propio estado React en memoria
- Los cambios en localStorage de una pestaña no se reflejan automáticamente en la otra (sin BroadcastChannel o storage events — comportamiento del monolito original)

---

*Documento generado a partir de la auditoría completa del monolito `uai_planner_estable_.html` (10.578 líneas).*
*Versión 1.0 — Marzo 2026*
