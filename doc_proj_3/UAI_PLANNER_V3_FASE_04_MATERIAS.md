# Fase 4 — Vista Materias (CRUD + Config + Progreso Slot-Aware)

Fecha: 2026-04-01
Referencia: `UAI_PLANNER_V3_PLAN_GLOBAL.md` (plan general)

---

## Contexto y decisión de arquitectura

En la primera iteración, Materias era una vista de lectura (cards con stats expandibles) y el CRUD vivía en Config. Tras revisión, se decidió:

| Vista | Responsabilidad |
|-------|----------------|
| **Materias** | CRUD + config por materia (min/max horas, slots día×franja) + progreso slot-aware |
| **Sesiones** (fase futura) | CRUD sesiones (manual/pomo, ±materia, ±tarea) + historial + stats |
| **Backlog/Kanban/Cal** | Tareas (filtrables por materia) |
| **Config** | Solo Tipos, Franjas y Tema (ya NO tiene tab Materias) |

---

## Tipos de datos

### MateriaSlot (nuevo)
```ts
interface MateriaSlot {
  dia: number;     // 0=lun, 1=mar, 2=mié, 3=jue, 4=vie, 5=sáb, 6=dom
  franjaId: string; // referencia a FranjaDef.id
}
```

### Materia (actualizado)
```ts
interface Materia {
  id: string;
  nombre: string;
  color: string;
  horasSemanalesMin?: number;  // objetivo mínimo horas/semana
  horasSemanalesMax?: number;  // objetivo máximo horas/semana
  slots?: MateriaSlot[];       // cuándo planea estudiar
  activa?: boolean;
}
```

> **Migración**: el campo `horasSemanales` se elimina. Si existía, se mapea a `horasSemanalesMin`.

### FranjaDef (sin cambios)
```ts
interface FranjaDef {
  id: string;
  nombre: string;
  emoji: string;
  horaInicio: number; // minutos desde medianoche
  horaFin: number;    // minutos desde medianoche
}
```

---

## Componente: `<materias-view>`

### Layout general

```
┌──────────────────────────────────────────────┐
│ Materias (3)                    [+ Nueva]    │
├──────────────────────────────────────────────┤
│ ┌─ Card compact ──────────────────────────┐  │
│ │ 🟣 Análisis Matemático    ▸ Al día      │  │
│ │ 3/6h sem · 5 tareas · ████████░░ 60%   │  │
│ └─────────────────────────────────────────┘  │
│ ┌─ Card expanded ─────────────────────────┐  │
│ │ 🟡 Bases de Datos            [Editar]   │  │
│ │ ─────────────────────────────────────── │  │
│ │ Nombre: [___________]  Color: [●]       │  │
│ │ Objetivo: [2]h min  [4]h max            │  │
│ │ ─────────────────────────────────────── │  │
│ │ Horarios de estudio:                     │  │
│ │       Lun Mar Mié Jue Vie Sáb Dom       │  │
│ │ 🌅 M  [x] [ ] [x] [ ] [ ] [ ] [ ]      │  │
│ │ ☀️ T  [ ] [x] [ ] [x] [ ] [ ] [ ]      │  │
│ │ 🌙 N  [ ] [ ] [ ] [ ] [ ] [x] [ ]      │  │
│ │ ─────────────────────────────────────── │  │
│ │ Progreso: 2.5h / 3h esperadas   Al día  │  │
│ │ ████████████████░░░░░░░░░░░░     83%    │  │
│ │ ─────────────────────────────────────── │  │
│ │            [Eliminar materia]            │  │
│ └─────────────────────────────────────────┘  │
│ ┌─ Card compact ──────────────────────────┐  │
│ │ 🟢 Historia               ▸ Sin slots   │  │
│ │ 1/3h sem · 2 tareas · ███░░░░░░░ 33%   │  │
│ └─────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

### Card compact (collapsed)
- Barra de color izquierda (4px) + nombre bold
- Mini-stats: `{actual}h / {min}h sem` · `{n} tareas` · estado badge
- Progress bar (coloreada con color de materia)
- Click → expand

### Card expanded
- **Sección datos**: nombre (input), color (picker + presets), activa (toggle)
- **Sección objetivos**: horasSemanalesMin (input number), horasSemanalesMax (input number)
- **Sección slots**: grilla de checkboxes (filas = franjas, columnas = Lun..Dom)
  - Si no hay franjas configuradas: mensaje "Configurá franjas en ⚙ primero"
  - Cada checkbox togglea un MateriaSlot en el array
- **Sección progreso**: barra slot-aware + texto "{actual}h / {expected}h esperadas" + badge
- **Acciones**: botón "Eliminar materia" (con confirmación si tiene tareas)

### Estado vacío
```
📚 No hay materias todavía
Creá tu primera materia para empezar a organizar el estudio.
[+ Crear materia]
```

### Crear nueva materia
Botón "+ Nueva materia" en el header → agrega card expandida con campos vacíos al final.

---

## Algoritmo de progreso slot-aware

### Problema
Si Análisis tiene slots Viernes y Sábado, y hoy es Miércoles, un cálculo lineal diría que debería llevar ~43% del objetivo → "atrasado". Pero ningún slot pasó aún, así que debería decir "al día".

### Solución

```
Para cada materia, cada semana:

1. totalSlotMinutes = Σ (franja.horaFin - franja.horaInicio) para cada slot de la materia
2. elapsedSlotMinutes = Σ duración de slots donde:
   - slot.dia < díaActual (lun=0), O
   - slot.dia == díaActual Y franja.horaFin <= minutosActualesDelDía
3. Si totalSlotMinutes == 0 → estado = "sin_slots", no hay barra
4. proportionElapsed = elapsedSlotMinutes / totalSlotMinutes
5. expected = horasSemanalesMin × proportionElapsed
6. actual = Σ sesiones de esta materia esta semana / 60
7. Si expected == 0 → "al_dia" (no hay nada que esperar aún)
   Si actual >= expected → "al_dia"
   Si actual >= expected × 0.8 → "casi" (warning suave)
   Si actual < expected × 0.8 → "atrasado"
```

### Badge visual
| Estado | Color | Texto |
|--------|-------|-------|
| `al_dia` | verde | Al día |
| `casi` | amarillo | Casi al día |
| `atrasado` | rojo | Atrasado |
| `sin_slots` | gris | Sin horarios |
| `sin_objetivo` | gris | Sin objetivo |

---

## Cambios en Config

### config-view.ts
- Eliminar tab "Materias" → quedan 3 tabs: Tipos, Franjas, Tema
- Default tab: "tipos" (antes era "materias")

### config-tab-materias.ts
- Se puede eliminar o dejar como archivo muerto (no se importa más)

---

## Cambios en store.ts

### Demo data
Actualizar `buildDemoData()` para incluir los nuevos campos:
```ts
materias: [
  {
    id: "m1", nombre: "Análisis Matemático", color: "#6366f1",
    horasSemanalesMin: 6, horasSemanalesMax: 8,
    slots: [
      { dia: 0, franjaId: "f1" }, // lun mañana
      { dia: 2, franjaId: "f1" }, // mié mañana
      { dia: 4, franjaId: "f2" }, // vie tarde
    ],
    activa: true,
  },
  // ...
]
```

---

## Criterio de aceptación

- [ ] CRUD materias funciona desde la vista Materias (no desde Config)
- [ ] Editar nombre, color, min/max horas funciona con persistencia
- [ ] Slot grid muestra franjas × días, toggle funciona
- [ ] Progreso slot-aware: no reporta "atrasado" si no pasaron slots
- [ ] Config tiene 3 tabs (sin Materias)
- [ ] Tipos actualizados (MateriaSlot, Materia con min/max/slots)
- [ ] Demo data actualizada con slots
- [ ] Build limpio (tsc + biome)
- [ ] Se ve profesional en los 5 temas
- [ ] Empty state funcional con CTA
