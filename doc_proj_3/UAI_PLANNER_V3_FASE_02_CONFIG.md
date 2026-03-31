# UAI Planner v3.0 — Fase 2: Config (Vista Dedicada)

Fecha: 2025-07-21  
Depende de: Fase 0 (shell, nav, temas), Fase 1 (store + types existentes)  
Referencia: `UAI_PLANNER_V3_PLAN_GLOBAL.md` § Fase 2

---

## Premisa

Sin materias no hay tareas. Sin tipos no hay categorías. Sin franjas no hay grilla semanal. Config es la base de todo — se construye como **vista propia** accesible desde ⚙ en el NavBar.

El enfoque es **Shell → Vista → Funcionalidad**: primero la cáscara estética con tabs y estados vacíos, luego CRUD real con persistencia.

---

## Alcance

### Config como 7ª vista

- `ViewId` se extiende: `"hoy" | "semana" | "materias" | "backlog" | "kanban" | "calendario" | "config"`
- El botón ⚙ existente en `nav-bar.ts` → al hacer click dispara `view-change` con `detail: "config"`
- En `app-shell.ts` → nuevo case `"config"` renderiza `<config-view>`
- Visualmente, ⚙ se mantiene en la zona `actions` (derecha) — separado del grupo principal de pills

### 4 tabs en config-view

| Tab | Contenido | Store actions |
|-----|-----------|---------------|
| **Materias** | CRUD: nombre, color (picker), horasSemanales, activa | `addMateria`, `updateMateria`, `deleteMateria` |
| **Tipos** | CRUD: nombre, ícono (emoji picker simple), activo | `addTipo`, `updateTipo`, `deleteTipo` |
| **Franjas** | Modo 3/6 franjas, horarios editables | `setFranjas` |
| **Tema** | Selector de tema + densidad (reutiliza lógica onboarding) | Ya existe (data-theme, data-density en <html>) |

---

## Árbol de componentes

```
config-view.ts
├── Tab bar (Materias | Tipos | Franjas | Tema)
├── config-tab-materias.ts
│   ├── Lista de materias existentes (edición inline)
│   ├── Formulario agregar materia (nombre, color, horas)
│   └── Empty state: "Creá tu primera materia"
├── config-tab-tipos.ts
│   ├── Lista de tipos existentes (edición inline)
│   ├── Formulario agregar tipo (nombre, emoji)
│   └── Empty state: "Creá tu primer tipo de tarea"
├── config-tab-franjas.ts
│   ├── Toggle modo 3/6 franjas
│   ├── Lista editable de franjas (nombre, emoji, horaInicio, horaFin)
│   └── Preset buttons: "Mañana/Tarde/Noche" o "6 franjas personalizadas"
└── config-tab-tema.ts
    ├── Theme selector (5 temas, reutiliza chips del onboarding)
    └── Density selector (3 niveles)
```

---

## Store: nuevas acciones (en `store.ts`)

```ts
// ── Materia CRUD ──
function addMateria(m: Materia): void
function updateMateria(id: string, patch: Partial<Materia>): void
function deleteMateria(id: string): void

// ── TipoTarea CRUD ──
function addTipo(t: TipoTarea): void
function updateTipo(id: string, patch: Partial<TipoTarea>): void
function deleteTipo(id: string): void

// ── Franjas ──
function setFranjas(franjas: FranjaDef[]): void
```

Cada acción muta `plannerData.value` produciendo un nuevo objeto (inmutable from the outside) y persiste a localStorage via `setPlannerData()`.

### ID generation

Usar `crypto.randomUUID()` (disponible en todos los browsers modernos). Si se necesita compatibilidad con test environments, fallback a `Date.now().toString(36) + Math.random().toString(36).slice(2, 8)`.

---

## Detalle por tab

### Tab Materias

- **Lista**: cada materia → row con: dot de color, nombre (editable inline), horas/sem, toggle activa, botón eliminar
- **Color picker**: input[type=color] nativo + 8 presets de colores (#6366f1, #f59e0b, #10b981, #ef4444, #8b5cf6, #ec4899, #14b8a6, #f97316)
- **Agregar**: formulario compact inline al final de la lista (nombre + color + horas + botón "Agregar")
- **Eliminar**: si hay tareas asociadas, mostrar warning "Esta materia tiene X tareas asociadas"
- **Vacío**: ilustración + "Creá tu primera materia para empezar a organizar tus estudios"

### Tab Tipos

- **Lista**: cada tipo → row con: emoji, nombre (editable inline), toggle activo, botón eliminar
- **Emoji picker**: grid de ~30 emojis comunes académicos (📝 📋 📖 🔬 💻 📊 🎨 ✏️ 📐 🧪 📎 🎯 📌 🗂 📓 📕 💡 🔔 ⏰ 📅 etc.)
- **Agregar**: formulario compact inline (nombre + emoji + botón "Agregar")
- **Vacío**: "Creá tu primer tipo de tarea (ej: TP, Parcial, Lectura...)"

### Tab Franjas

- **Toggle modo**: 3 franjas (Mañana/Tarde/Noche) ↔ 6 franjas (personalizado)
- **Modo 3**: presets fijos con horarios editables (Mañana 8-12, Tarde 13-18, Noche 19-23)
- **Modo 6**: lista libre de hasta 6 franjas con nombre, emoji, hora inicio, hora fin
- **Validación**: franjas no se superponen, hora inicio < hora fin
- **Default**: 3 franjas estándar si no hay ninguna configurada

### Tab Tema

- **Theme chips**: 5 botones de tema con dot de color + nombre (igual que en onboarding step 1)
- **Density chips**: 3 opciones (Compacto / Normal / Cómodo)
- **Aplicación inmediata**: al click se aplica data-theme y data-density en `<html>`
- **Persistencia**: ya existe en localStorage (`oda-theme`, `oda-density`)

---

## Navegación

- Los 6 pills principales (H, S, M, B, K, C) se mantienen en `<nav class="nav">`
- El botón ⚙ existente en `.actions` se convierte en nav funcional: click → dispara `view-change` detail `"config"`
- Cuando `activeView === "config"`, el botón ⚙ se marca visualmente (highlight como pill activa)
- Para volver: click en cualquier pill principal → sale de config naturalmente

---

## Criterio de cierre

- [ ] ⚙ navega a config-view
- [ ] 4 tabs funcionales con transición visual
- [ ] CRUD materias: crear, editar inline, eliminar con warning
- [ ] CRUD tipos: crear, editar inline, eliminar
- [ ] Franjas: modo 3/6 con horarios editables
- [ ] Tema + densidad funcional
- [ ] Datos persisten en localStorage tras cada operación
- [ ] Estados vacíos con CTA
- [ ] Se ve profesional en los 5 temas
- [ ] Build limpio (tsc + biome)

---

## Notas de implementación

- **SignalWatcher**: todos los componentes de config usan `SignalWatcher(LitElement)` para reactividad con signals
- **Estilo**: CSS in JS via Lit `css` tagged template — consistente con el resto del proyecto
- **Responsive**: tabs horizontales, stack vertical en <768px si se necesita
- **Onboarding bridge**: el onboarding ya crea datos demo o vacíos. Config permite al usuario real crear sus propios datos post-onboarding
