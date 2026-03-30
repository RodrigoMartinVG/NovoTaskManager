# UAI Planner — Comparación Funcional y Estética (Consolidada)

Fecha de cierre de auditoría: 2026-03-29
Base de referencia (estable): `doc_proj/uai_planner_estable_.html`
Versión objetivo (nueva): app React + TypeScript (Vite + Zustand + CSS Modules)

---

## 1. Resumen ejecutivo

### Diagnóstico en una línea
La nueva versión ya cubre la funcionalidad completa del planner, pero la versión estable la supera en identidad visual, jerarquía de foco, densidad eficiente e inmersión en las experiencias clave (Pomodoro, Hoy, onboarding).

### Fortalezas confirmadas de la nueva versión
- Cobertura funcional alta y consistente en las 6 vistas principales.
- Código limpio, tipado, modular (React + TS + Zustand + CSS Modules).
- Accesibilidad técnica sólida (WCAG 2 A/AA, axe-playwright sin violaciones).
- Sistema de temas funcional con 5 opciones y aplicación inmediata.
- TaskModal completo (12 campos, checklist, sesiones relacionadas, validaciones).
- Drag & drop en Semana, ciclo de estado en Kanban por teclado.
- Flujo de import/export robusto con normalización defensiva.

### Debilidades principales vs. estable
1. **Toolbar/header sobreocupa el viewport** — en desktop pinned, consume ~60% de la pantalla antes de llegar al contenido.
2. **Pomodoro activo es un widget mínimo** — sin modo foco, sin pausa, sin métricas contextuales, sin feedback emocional.
3. **Onboarding** — mejoró pero no iguala la narrativa, teatralidad ni sensación de producto terminado de la estable.
4. **Hoy** — más funcional pero más denso; incluye grilla semanal completa embebida que difumina el foco.
5. **Identidad visual** — correcta pero genérica; la estable tiene personalidad más marcada y memorable.

---

## 2. Método de comparación

### Escalas utilizadas

**Severidad de brechas**
| Nivel | Significado |
|-------|-------------|
| S0 | Crítico: rompe flujo principal o dato |
| S1 | Alto: experiencia degradada fuerte o feature clave incompleta |
| S2 | Medio: inconsistencia visible/frecuente con workaround |
| S3 | Bajo: detalle estético o de copy sin impacto funcional fuerte |

**Paridad por ítem (0-3)**
| Score | Significado |
|-------|-------------|
| 0 | Ausente |
| 1 | Parcial/inestable |
| 2 | Equivalente |
| 3 | Mejora sobre estable |

### Protocolo de evidencia
Cada hallazgo fue verificado por observación directa en ambas versiones ejecutándose simultáneamente (estable vía file://, nueva vía localhost:5173). Se capturaron screenshots, se inspeccionó código fuente y se probaron interacciones reales.

---

## 3. Scoring comparativo consolidado

| Área | Ítem | Score | Lectura |
|------|------|------:|---------|
| **Estética** | Identidad visual general | 1 | La estable comunica personalidad contundente; la nueva es correcta pero intercambiable. |
| **Estética** | Jerarquía visual | 1 | La estable ordena foco primario con claridad; en la nueva el header compite con el contenido. |
| **Estética** | Coherencia entre vistas | 2 | Ambas son consistentes internamente. |
| **Estética** | Densidad y respiración | 1 | La nueva satura header/filtros/acciones; la estable separa bloques con mejor ritmo. |
| **Estética** | Sistema de color/tema | 2 | Ambas tienen temas viables; la estable más narrativos. |
| **Estética** | Animaciones y transiciones | 2 | La nueva cumple; la estable usa motion con más intención escénica en onboarding. |
| **Estética** | Estados visuales | 2 | La nueva cubre estados operativos; faltan contrastes de prioridad y vacío guiado. |
| **Contenido** | Claridad del onboarding | 1 | La estable gana: propuesta de valor, teatralidad, hilo narrativo más fuerte. |
| **Contenido** | Calidad de ayuda/guías | 1 | La nueva tiene ayuda útil pero resumida; la estable explica mejor el orden de adopción. |
| **Contenido** | Mensajes de error/validación | 2 | Ambas cubren validaciones clave. |
| **Contenido** | Microcopy accionable | 2 | La nueva es entendible, aunque menos persuasiva y didáctica. |
| **Contenido** | Consistencia de tono | 2 | Razonable en ambas; la estable más afinada y con más voz de producto. |
| **Funcional** | Navegación y descubribilidad | 2 | La nueva expone mejor las operaciones; la estable orienta mejor usuarios nuevos. |
| **Funcional** | Crear/editar/eliminar tareas | 2 | Flujo completo y validado en la nueva. |
| **Funcional** | Filtros y vistas derivadas | 2 | Buena cobertura. |
| **Funcional** | Semana | 2 | Implementación robusta con orientación y edición por slot. |
| **Funcional** | Materias | 2 | Cubre objetivos, sesiones, tareas. |
| **Funcional** | Calendario | 2 | Eventos inicio/fin, navegación mensual funcional. |
| **Funcional** | Pomodoro y sesiones | 1 | Funcional pero UX de sesión activa muy por debajo de la estable. |
| **Funcional** | Configuración | 2 | Alta cobertura funcional. |
| **Funcional** | Datos (import/export) | 2 | Cobertura fuerte. |
| **Funcional** | Persistencia y reload | 2 | Validado. |
| **Funcional** | Ayuda y re-onboarding | 1 | Existe pero no iguala la riqueza narrativa. |
| **Funcional** | Accesibilidad práctica | 3 | Ventaja técnica real de la nueva (axe-playwright, teclado en Kanban, aria-labels). |

**Promedio ponderado: 1.72 / 3** — La nueva necesita trabajo significativo en estética y experiencias clave para igualar a la estable.

---

## 4. Hallazgos por módulo

### 4.1 Header / Shell / Toolbar

**Problema central**: La toolbar pinned de la nueva versión ocupa ~60% del viewport en desktop. La estable resuelve toda la navegación en una sola línea compacta con iconos.

| Aspecto | Estable | Nueva | Gap |
|---------|---------|-------|-----|
| Altura toolbar | ~56px (1 línea) | ~350px (peek + título + subtítulo + 2 filas de botones + 1 fila acciones) | **S1** |
| Navegación | Iconos compactos (H, S, M, B, K, C) | Botones con texto completo (Hoy, Semana, Kanban...) | S2 |
| Acciones globales | ?, ⚙, 💾 compactos | Período, Theme, + Nueva tarea, Importar, Drive, Datos, ?, ⚙ todos visibles | S2 |
| Pin/unpin | Funcional | Funcional pero con fricción de puntero al interactuar con área colapsada | S2 |
| Colapso/expansión | Colapsada compacta | `grid-template-rows` animación, pero `overflow: hidden` puede clipear popovers | S2 |

**Evidencia de código**: `ChromeShell` usa z-index 1200, popovers z-index 1300. No hay keyboard-only expand (solo `mouseEnter`/click). Peek bar tiene `pointer-events: auto` explícito, sugiriendo problemas previos de eventos.

**Veredicto**: La nueva necesita reducir drásticamente la huella vertical del header y compactar la navegación.

### 4.2 Pomodoro activo (sesión corriendo)

**Problema central**: La brecha más grande de la auditoría. La estable ofrece experiencia inmersiva de sesión; la nueva un widget flotante mínimo.

| Aspecto | Estable | Nueva | Gap |
|---------|---------|-------|-----|
| Presentación | Panel completo "EN SESION" con timer grande | Widget flotante bottom-right (z-index 1600) | **S1** |
| Timer | Countdown/countup grande, visible como protagonista | MM:SS compacto en widget | S1 |
| Métricas contextuales | Semana cursada, objetivo, slots | Ninguna | S1 |
| Controles | Pausar, Terminar y guardar, Cancelar sin guardar | Detener (=guardar), Cancelar | S1 |
| Pausa | ✅ | ❌ No existe | S1 |
| Feedback emocional | Alto (panel inmersivo, progreso visible) | Bajo (widget puede pasar desapercibido) | S1 |
| Convivencia | Domina la pantalla, focus mode natural | Puede quedar debajo de modales si z-index no es correcto | S2 |

**Evidencia de código**:
- `PomoWidget` = `aside` fijo con z-index 1600. Solo muestra: materia dot + nombre, tarea título, MM:SS, 2 botones.
- `usePomoStore` no tiene concepto de pausa, breaks ni countdown.
- `usePomoTimer` es un `setInterval` de 1s que incrementa `elapsedSeconds`.
- No existe componente de "focus mode" o vista de sesión dedicada.

**Veredicto**: Requiere una vista/modo dedicado de sesión activa con métricas contextuales, pausa, y experiencia inmersiva.

### 4.3 Onboarding

| Aspecto | Estable | Nueva | Gap |
|---------|---------|-------|-----|
| Paso 1 (Bienvenida) | Propuesta de valor fuerte, preview creíble, beneficios bien redactados | Logo pulsante, tagline, preview fake, 4 feature cards — bueno pero un escalón abajo en teatralidad | S1 |
| Paso 2 (Tema) | Claro, simple | Prácticamente equivalente | S3 |
| Paso 3 (Arranque) | Excelente claridad sobre modo local, demo, ayuda posterior | Cerca pero usa `window.confirm()` en acción destructiva (rompe diseño) | S2 |
| Transiciones entre pasos | Suaves | Sin animación (renderizado condicional abrupto) | S2 |
| Entrada a la app | Con contexto y orientación | Abrupta (`modeChanged` → `viewChanged('hoy')`) | S2 |

**Evidencia de código**: `OnboardingFlow.tsx` tiene 3 pasos con renderizado condicional. Background con radial gradient + grid. Logo es glifo de texto (◈) no SVG. En paso 3, acción destructiva usa `window.confirm()` nativo.

### 4.4 Vista Hoy

| Aspecto | Estable | Nueva | Gap |
|---------|---------|-------|-----|
| Hero / momento | Reloj grande (21:38), fecha, emoji franja | Título "Hoy", subtítulo "Domingo · 🌙 Noche" | S2 (estable más expresivo) |
| Bloques de franja | Mañana / Tarde / Noche con separación clara | "Ahora" como sección + "Más tarde hoy" colapsable | S3 |
| Urgencias | No visibles en viewport inicial | Lista de tareas urgentes con conteo y coloreo por alerta | **Mejora nueva** |
| Preview Semana | No existe | Grilla semanal completa embebida con drag-drop | **Riesgo: sobrecarga** |
| CTA Semana | No explícito | "Ir a Vista Semana" — mejora funcional | **Mejora nueva** |
| Densidad | Bajo, focalizado | Alto — 4 secciones densas + grilla completa | S1 |

**Veredicto**: La nueva gana en funcionalidad (urgencias, CTA) pero pierde foco. La grilla semanal embebida es excesiva para "Hoy". La estable se siente más como dashboard de momento actual.

### 4.5 Vista Semana

| Aspecto | Estable | Nueva | Gap |
|---------|---------|-------|-----|
| Estructura | Tabla compacta, lectura inmediata | Grilla con texto de apoyo y conteos | S3 |
| Celdas | Materia o icono ✎ | Conteo + Editar + mensaje en slots libres | Mejora nueva en descubribilidad |
| Orientación | H/V disponible | H/V disponible | Paridad |
| Drag & drop | Sí | Sí (chips draggable con stopPropagation) | Paridad |
| Bug detectado | — | Al probar flujo Semana→cambiar orientación→Editar slot, navegó a Calendario | **S1 (no reproducido consistentemente)** |

**Análisis del bug**: El código de `SemanaCell` y `SlotEditPopover` no contiene navegación a Calendario. El popover usa z-index 40 (muy bajo vs. shell 1200). Hipótesis: click interceptado por capa superior o evento sin stopPropagation en un path específico.

### 4.6 Vista Kanban

| Aspecto | Estable | Nueva | Gap |
|---------|---------|-------|-----|
| Tarjetas | Densas con metadata inline y control de estado ○◑● | Más limpias, menos metadata visible | S3 |
| Accesibilidad | N/A | Enter/Espacio cicla estado, tarjetas como botones | **Mejora nueva** |
| Columnas | Nombres y conteos | Nombres y conteos claros | Paridad |

### 4.7 Vista Backlog

| Aspecto | Estable | Nueva | Gap |
|---------|---------|-------|-----|
| Metadata visible | Tipo, alertas, fecha, progreso, estado inline | Lista limpia con apertura a detalle | S2 (estable muestra más señal táctica por fila) |
| Filtros | Sí | Sí | Paridad |

### 4.8 Vista Calendario

| Aspecto | Estable | Nueva | Gap |
|---------|---------|-------|-----|
| Navegación | Mensual | Mensual | Paridad |
| Eventos | Inicio/fin | Inicio/fin con marcadores I/F | Paridad |
| Densidad | Pendiente comparación fina | Funcional y comprensible pero cargado | Pendiente |

### 4.9 Vista Materias

| Aspecto | Estable | Nueva | Gap |
|---------|---------|-------|-----|
| Presentación | Tablero compacto: horas semanales, objetivo, entrada a detalle | Cards expandidas: sesiones, tareas, acciones, objetivos | S2 |
| Potencia funcional | Menor | Mayor (todo visible de entrada) | **Mejora nueva** |
| Foco | Escaneo rápido | Puede saturar | S2 (mismo patrón que Hoy) |

### 4.10 Configuración

| Aspecto | Estable | Nueva | Gap |
|---------|---------|-------|-----|
| Tabs | Materias, Tipos, Horarios, Alertas, Tema | Ídem + Reset visible | Paridad |
| CRUD | Editar/eliminar por fila | Editar/eliminar + validaciones inline | Paridad |
| Overlay | Sin conflictos | Puede convivir con TaskModal/PomoWidget = ruido | S2 |

### 4.11 Datos

| Aspecto | Estable | Nueva | Gap |
|---------|---------|-------|-----|
| Export/Import | Funcionales | Funcionales + normalización defensiva | Paridad/Mejora |
| Drive | Conectar/desconectar/auto-save/conflicto | Ídem con hook architecture | Paridad |

### 4.12 Ayuda

| Aspecto | Estable | Nueva | Gap |
|---------|---------|-------|-----|
| Profundidad | Alta, secuencial, documentación de producto | Útil pero resumida | S1 |
| Presentación | Guía paso a paso | Modal con sidebar 8 secciones | Paridad estructural |
| Utilidad primer uso | Alta | Media | S2 |

### 4.13 Responsive

| Aspecto | Estable | Nueva | Gap |
|---------|---------|-------|-----|
| Desktop | Fuerte | Funcional pero header oversized | S1 |
| Tablet | Aceptable | Funcional | Paridad |
| Mobile | Panel Pomodoro pesado | Widget compacto mejor adaptado + riesgo overlap capas | SS3 / S2 |

---

## 5. Matriz de brechas priorizadas

| # | Módulo | Brecha | Sev | Esfuerzo | Tipo |
|---|--------|--------|-----|----------|------|
| 1 | Shell/Header | Toolbar ocupa ~60% del viewport; navegación y acciones ocupan 4-5 líneas vs. 1 en estable | S1 | L | Estética + UX |
| 2 | Pomodoro | Widget mínimo sin focus mode, sin pausa, sin métricas contextuales, sin feedback emocional | S1 | L | Funcional + Estética |
| 3 | Onboarding | Paso 1 inferior en teatralidad; paso 3 usa `window.confirm`; sin transiciones entre pasos; entrada abrupta | S1 | M | Contenido + Estética |
| 4 | Hoy | Sobre-densificada con grilla semanal embebida; pierde foco de "dashboard del momento" | S1 | M | UX + Estética |
| 5 | Ayuda | Menos profunda y secuencial que la estable | S1 | M | Contenido |
| 6 | Identidad visual | Temas correctos pero genéricos; falta personalidad memorable | S2 | M | Estética |
| 7 | Materias | Cards expandidas pueden saturar; falta escaneo rápido | S2 | M | UX |
| 8 | Backlog | Menos señal táctica por fila que la estable | S2 | S | UX |
| 9 | Semana | Bug de navegación inesperada; z-index bajo en popover (40 vs. 1200 del shell) | S1 | S | Funcional |
| 10 | Capas/z-index | PomoWidget (1600) puede competir con modales; popovers (1300) pueden clipearse | S2 | M | Funcional |
| 11 | Microcopy | Falta texto orientativo "qué hago ahora" en estados vacíos | S2 | S | Contenido |
| 12 | Keyboard a11y | Shell no tiene keyboard-only expand; depende de mouse | S2 | S | Accesibilidad |

---

## 6. Referencia estética (old-version como north star)

### 6.1 Principio rector
La old-version es baseline estética y de identidad, no solo funcional. Ningún módulo se considera cerrado si pierde carácter visual respecto de la estable, aunque funcione.

### 6.2 Ponderación de cierre por módulo

**Módulos de alto impacto** (Hoy, Semana, Materias, Pomodoro activo, Header):
- Funcional: 50% / Estética + UX perceptual: 50%

**Módulos de soporte** (Configuración, Datos, Ayuda):
- Funcional: 60% / Estética + UX perceptual: 40%

### 6.3 Rúbrica estética (0-5 por criterio)

| Criterio | Peso | 0-1 | 2-3 | 4-5 |
|----------|------|-----|-----|-----|
| Identidad visual y personalidad | 20% | Genérico/intercambiable | Correcto sin sello | Reconocible, con carácter alineado a old |
| Jerarquía y foco primario | 20% | Múltiples focos compiten | Foco aceptable con ruido | Foco principal evidente en 3 seg |
| Densidad y respiración | 15% | Saturado o vacío sin criterio | Balance irregular | Ritmo visual consistente |
| Expresividad tipográfica | 15% | Texto plano o confuso | Legible pero poco expresivo | Tipografía y contraste con tono y claridad |
| Estado activo y feedback | 15% | Sin sensación de progreso | Feedback básico | Vivo, motivador, fácil de interpretar |
| Coherencia transversal | 15% | Cada vista parece otro producto | Parcial | Lenguaje visual consistente |

**Umbral mínimo**: 3.8/5 ponderado por módulo. Criterios 1 y 2 no pueden estar bajo 4.0 en módulos de alto impacto.

### 6.4 Protocolo A/B obligatorio
Para cerrar cada módulo de alto impacto:
1. Capturar misma tarea, mismo estado, mismo viewport en old y new.
2. Puntuar ambos con la rúbrica.
3. Registrar qué conserva la old y debe recuperarse, qué mejora la new y se mantiene, qué se elimina por ruido.
4. Aprobar solo si new ≥ old en score total o con trade-off explicitado.

---

## 7. Conclusión de la auditoría

La nueva versión tiene una base de código sólida, modular y testeable — una mejora estructural radical sobre el monolito HTML de la estable. Sin embargo, esa misma limpieza técnica no se tradujo todavía en una experiencia visual y emocional equivalente.

Las 5 brechas que más impactan la percepción de "producto terminado":
1. **Header gigante** que empuja el contenido fuera del viewport.
2. **Pomodoro sin inmersión** — la experiencia más diferenciada del planner degradada a widget.
3. **Onboarding sin cierre dramático** — entra al app sin celebración.
4. **Hoy sobrecargado** — pierde la función de "reloj inteligente" de la estable.
5. **Identidad visual diluida** — la estable se siente producto; la nueva se siente herramienta.

El plan de implementación que acompaña este documento (`UAI_PLANNER_IMPLEMENTATION_ROADMAP.md`) define cómo cerrar estas brechas manteniendo la ventaja técnica de la nueva base de código.
