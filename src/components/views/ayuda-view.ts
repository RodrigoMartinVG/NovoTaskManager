/* ═══ Oda v3.0 — Vista Ayuda (Guía de uso) ═══ */
import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";

/* ── Guide sections data ── */
interface GuideItem {
  title: string;
  text: string;
}
interface GuideSection {
  id: string;
  label: string;
  icon: string;
  group: string;
  lead: string;
  content: GuideItem[];
}

const SECTIONS: GuideSection[] = [
  {
    id: "inicio",
    label: "Primeros pasos",
    icon: "🚀",
    group: "Empezar",
    lead: "La mejor forma de sacarle jugo a Oda Planner es pensarla como una cadena simple: primero definís tu mapa semanal, después cargás lo que tenés que hacer y finalmente registrás lo que realmente estudiás. La app hace el resto: ordenar, priorizar y mostrarte dónde estás parado.",
    content: [
      { title: "1. Elegí cómo querés arrancar", text: "Podés entrar con el planner vacío para configurarlo vos o cargar los datos de ejemplo para recorrer las vistas sin fricción. El modo local guarda todo en este navegador; después, si querés, podés exportar un respaldo o conectar Google Drive para sincronizar." },
      { title: "2. Creá tus materias primero", text: "Abrí ⚙ Config → Materias y cargá nombre, código, color y período. No es un detalle cosmético: cada materia se usa luego para agrupar tareas, registrar sesiones, colorear tarjetas y calcular el progreso semanal." },
      { title: "3. Definí objetivos y slots", text: "En ✎ Objetivos configurás horas mínimas y máximas por semana y marcás en qué días/franjas estudiás cada materia. Esa grilla es la base de la Vista Hoy y la Vista Semana. Sin eso, la app no sabe cuándo debería aparecerte cada materia." },
      { title: "4. Ajustá tus franjas horarias", text: "Desde ⚙ Config → Horarios decidís si trabajás con 3 o 6 franjas y a qué hora empieza cada una. Esto le da realismo a la planificación: no es lo mismo una mañana temprana que una noche de repaso." },
      { title: "5. Cargá tus primeras tareas con fechas reales", text: "En Backlog o Kanban usá + Nueva tarea y definí título, materia, prioridad, fecha de inicio, fecha límite y checklist si corresponde. La fecha de inicio sirve para que la app te diga cuándo deberías haber empezado; la fecha límite marca la urgencia de verdad." },
      { title: "6. Empezá a registrar sesiones", text: "Desde la Vista Hoy o desde el detalle de una tarea podés iniciar una sesión y dejar que el timer mida tiempo activo real. Es el paso que convierte la app en algo más que una lista bonita." },
    ],
  },
  {
    id: "flujo",
    label: "Flujo recomendado",
    icon: "🧭",
    group: "Empezar",
    lead: "Si no sabés por dónde empezar, seguí este recorrido. En menos de diez minutos podés pasar de cero a tener un planner que ya te diga qué estudiar hoy y qué se viene encima esta semana.",
    content: [
      { title: "Paso 1 — armá la estructura", text: "Cargá materias, definí colores y completá objetivos de horas. Esto crea la estructura base sobre la que se calculan progreso, recomendaciones y resumen semanal." },
      { title: "Paso 2 — dibujá tu semana", text: "Usá la Vista Semana para marcar en qué días y franjas aparece cada materia. Pensalo como una grilla de intención realista, no como un ideal imposible." },
      { title: "Paso 3 — volcá entregas, parciales y lecturas", text: "Cargá tareas con fechas de inicio y vencimiento. Si una tarea es importante, marcala como obligatoria para que entre en el sistema de alertas." },
      { title: "Paso 4 — usá la Vista Hoy para ejecutar", text: "Cuando ya está todo cargado, la Vista Hoy se vuelve el centro de operaciones: muestra qué materias tocan según tu franja actual, qué viene después y cómo va tu progreso semanal." },
      { title: "Paso 5 — registrá y corregí", text: "Después de cada bloque, guardá la sesión. Si te olvidaste o te equivocaste, podés editarla luego desde Materias." },
      { title: "Paso 6 — revisá una vez por semana", text: "Dedicale unos minutos a revisar tareas urgentes, mover slots y ver si alguna materia viene muy por debajo del mínimo." },
    ],
  },
  {
    id: "hoy",
    label: "Vista Hoy",
    icon: "◈",
    group: "Empezar",
    lead: "La Vista Hoy es donde el planner deja de ser configuración y se convierte en acción. Está hecha para contestar tres preguntas rápido: qué me toca ahora, qué me falta esta semana y con qué tarea conviene avanzar primero.",
    content: [
      { title: "Franja activa y materias del momento", text: "La vista destaca la franja horaria actual y muestra las materias asignadas a ese bloque según tu configuración semanal." },
      { title: "Más tarde hoy", text: "Cuando tenés materias cargadas en franjas posteriores, aparece una sección que anticipa lo que viene después." },
      { title: "Arrancar una sesión desde contexto", text: "Cada tarjeta te deja iniciar sesión directamente y, si querés, asociarla a una tarea específica." },
      { title: "Resumen semanal al pie", text: "La parte inferior muestra cuántas horas llevás acumuladas por materia contra tus objetivos mínimo y máximo." },
      { title: "Qué hacer si la vista está vacía", text: "Si Hoy no muestra materias, normalmente faltan slots o la materia no está asignada a este día/franja. Revisá la grilla semanal." },
    ],
  },
  {
    id: "semana",
    label: "Vista Semana",
    icon: "📅",
    group: "Empezar",
    lead: "La Vista Semana es el tablero donde diseñás tu mapa de estudio. No te muestra fechas límite: te muestra tiempo disponible y distribución por materia.",
    content: [
      { title: "Grilla 7 × franjas", text: "La tabla cruza días con franjas y te deja ver de un vistazo dónde aparece cada materia. Si activaste 6 franjas, la grilla se vuelve más detallada." },
      { title: "Editar un slot puntual", text: "En cada celda podés agregar o quitar materias con el botón ＋ y la ✕ de cada chip." },
      { title: "Drag & drop para reorganizar rápido", text: "Podés arrastrar chips entre celdas. Es la forma más cómoda de rearmar una semana cuando cambian tus tiempos." },
      { title: "Relación directa con Vista Hoy", text: "Todo lo que ves en Hoy sale de esta grilla. Si algo no aparece donde esperabas, casi siempre el origen está acá." },
    ],
  },
  {
    id: "materias",
    label: "Materias",
    icon: "◉",
    group: "Empezar",
    lead: "La vista Materias funciona como panel de control: mezcla objetivos, horas acumuladas, historial de sesiones y tareas pendientes.",
    content: [
      { title: "Lectura rápida del progreso", text: "Cada fila muestra horas de la semana actual contra tu mínimo y máximo. Si una materia aparece roja, está por debajo de lo que vos mismo definiste como objetivo." },
      { title: "Expandir para ver profundidad", text: "Al abrir una materia accedés a sesiones registradas, métricas del período, tareas vinculadas e historial editable." },
      { title: "Editar o borrar sesiones", text: "Si registraste mal una duración o la asociaste a la tarea equivocada, podés hacerlo desde acá." },
      { title: "Cargar horas manuales", text: "No todo estudio pasa por el timer. Si estudiaste sin abrir la app, podés agregar horas manuales." },
      { title: "Objetivos como herramienta, no castigo", text: "Los mínimos y máximos sirven para orientar, no para generar culpa. Ajustalos con frecuencia." },
    ],
  },
  {
    id: "sesiones",
    label: "Sesiones y Pomodoro",
    icon: "⏱",
    group: "Funciones",
    lead: "Las sesiones son el corazón operativo de la app. Ahí deja de importar lo que planeabas hacer y empieza a importar lo que efectivamente hiciste.",
    content: [
      { title: "Sesión libre o vinculada a tarea", text: "Podés estudiar una materia sin asociarla a nada específico o enganchar la sesión a una tarea concreta." },
      { title: "Tiempo activo real", text: "El contador principal registra solo tiempo de trabajo. Si pausás, la pausa se mide aparte y no se guarda en la sesión final." },
      { title: "Progreso dentro del slot", text: "La barra del timer te deja ver si en ese bloque ya cumpliste lo esperable o si todavía conviene sostener un poco más." },
      { title: "Terminar, pausar o cancelar", text: "Terminar guarda, pausar congela sin perder y cancelar descarta la sesión." },
      { title: "Corregir después también es parte del sistema", text: "Si se te fue una sesión o la cerraste mal, la editás desde Materias y el historial vuelve a quedar coherente." },
    ],
  },
  {
    id: "tareas",
    label: "Tareas y vistas",
    icon: "≡",
    group: "Funciones",
    lead: "Las tareas son la capa que conecta calendario, urgencia y ejecución. El mismo trabajo puede mirarse como lista, tablero, calendario o detalle profundo.",
    content: [
      { title: "Crear tareas con intención", text: "Además de título y materia, conviene completar fecha de inicio, fecha límite, prioridad y checklist." },
      { title: "Backlog para priorizar", text: "La vista de lista sirve cuando necesitás decidir qué atacar primero. Ordena por urgencia y te deja cambiar de estado rápido." },
      { title: "Kanban para ver flujo", text: "El tablero Pendiente / En progreso / Completado ayuda a pensar en volumen y cuello de botella." },
      { title: "Calendario para mirar fechas", text: "La vista mensual te da contexto temporal: cuándo conviene empezar algo, cuándo vence y cómo se encadenan tareas. Podés filtrar por fecha de inicio, límite o ambas y arrastrar cards entre días." },
      { title: "Checklists para volver atacable lo grande", text: "Los trabajos grandes se vuelven más manejables cuando los partís en subtareas concretas. El porcentaje aparece en varias vistas." },
    ],
  },
  {
    id: "alertas",
    label: "Alertas de urgencia",
    icon: "🔔",
    group: "Funciones",
    lead: "Las alertas existen para que la app no sea solo un registro del desastre, sino también un sistema de anticipación.",
    content: [
      { title: "Qué tareas entran al sistema", text: "Solo las tareas marcadas como obligatorias participan en las alertas de vencimiento." },
      { title: "Lectura de colores", text: "Rojo señala urgencia alta, amarillo indica proximidad importante y verde funciona como aviso temprano." },
      { title: "Fecha de inicio como empujón", text: "Cuando una tarea ya debería haber empezado y sigue pendiente, la app lo marca. Esa alerta suele ser más valiosa que la del vencimiento." },
      { title: "Umbrales configurables", text: "Desde Configuración ajustás cuántos días anticipados corresponden a cada color." },
      { title: "Usá Solo alertas cuando estés saturado", text: "En momentos de mucha carga, el filtro Solo alertas del Backlog ayuda a bajar ruido." },
    ],
  },
  {
    id: "config",
    label: "Configuración",
    icon: "⚙",
    group: "Funciones",
    lead: "Configuración es el taller del planner. Ahí definís las reglas con las que la app interpreta tu semana, tus metas y la estética.",
    content: [
      { title: "Materias", text: "Podés crear, editar o eliminar materias, ajustar colores, código y período, y entrar a objetivos." },
      { title: "Tipos de tarea", text: "Además de los tipos estándar, podés crear categorías propias con nombre, emoji y colores." },
      { title: "Horarios y modo 3/6 franjas", text: "La definición de franjas cambia cómo se lee toda la app. Tres franjas simplifican; seis franjas dan granularidad." },
      { title: "Alertas", text: "Acá calibrás el sistema de urgencia. Vale la pena revisarlo al principio." },
      { title: "Tema visual", text: "Hueso, Claro, Noche, Pizarrón y Café no cambian funcionalidad, pero sí comodidad." },
    ],
  },
  {
    id: "datos",
    label: "Datos y sincronización",
    icon: "☁",
    group: "Datos",
    lead: "La app funciona perfecto en modo local, pero también te da herramientas para respaldar, mover o sincronizar tu información.",
    content: [
      { title: "Modo local", text: "Por defecto, todo se guarda en el localStorage de este navegador. Si borrás datos del navegador, necesitás un respaldo o Drive para recuperar tu planner." },
      { title: "Conectar Google Drive", text: "Desde 💾 Datos podés iniciar el flujo de Google y hacer que la app sincronice automáticamente un archivo JSON en tu Drive." },
      { title: "Exportar e importar", text: "Exportar crea un respaldo manual completo. Importar permite restaurarlo en otro navegador o dispositivo." },
      { title: "Resetear datos sin sorpresas", text: "Podés dejar la app vacía o volver a cargar el modo demo. Exportá un JSON antes de resetear si tenés la menor duda." },
    ],
  },
  {
    id: "tips",
    label: "Consejos y dudas comunes",
    icon: "💡",
    group: "Datos",
    lead: "Estas son las confusiones más normales cuando recién arrancás o cuando sentís que el planner no te está mostrando lo que esperabas.",
    content: [
      { title: "\u201CNo veo materias en Hoy\u201D", text: "Revisá slots, día de la semana y franja actual. La app muestra lo que configuraste en la grilla semanal para este día y este horario." },
      { title: "\u201CCargué tareas pero no aparecen alertas\u201D", text: "Verificá que tengan fecha relevante y que estén marcadas como obligatorias." },
      { title: "\u201CEstudié pero el progreso quedó corto\u201D", text: "Puede faltar registrar esa sesión, o quizá la registraste en otra materia/tarea. Las pausas no se cuentan como tiempo activo." },
      { title: "\u201CTengo demasiadas cosas en progreso\u201D", text: "Usá Kanban para detectar dispersión y Backlog con Solo alertas para recuperar foco." },
      { title: "\u201CLa app me gusta, pero se siente vacía\u201D", text: "Eso suele pasar cuando faltan fechas, objetivos o checklists. Cuanto más contexto real cargás, más valor devuelve el planner." },
      { title: "\u201C¿Qué conviene revisar cada semana?\u201D", text: "Tareas obligatorias próximas, materias por debajo del mínimo, slots que ya no representan tu rutina y sesiones olvidadas de registrar." },
    ],
  },
];

const GROUPS = ["Empezar", "Funciones", "Datos"];

@customElement("ayuda-view")
export class AyudaView extends LitElement {
  @state() private _tab = "inicio";

  static styles = css`
    :host {
      display: block;
      max-width: var(--content-max-width, 75rem);
      margin: 0 auto;
      padding: var(--space-5, 1.5rem) var(--space-4, 1rem);
    }

    /* ── Header ── */
    .hdr {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      margin-bottom: var(--space-4);
    }
    .hdr-icon {
      width: 2.125rem;
      height: 2.125rem;
      border-radius: 0.5625rem;
      background: var(--info-bg);
      color: var(--info-text);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.0625rem;
      font-weight: 700;
      flex-shrink: 0;
    }
    .hdr-title {
      font-size: var(--text-xl);
      font-weight: 700;
      color: var(--text0);
      margin: 0;
    }
    .hdr-sub {
      font-size: var(--text-xs);
      color: var(--text3);
      letter-spacing: 0.06em;
      text-transform: uppercase;
      margin-top: 0.0625rem;
    }

    /* ── Layout body ── */
    .body {
      display: flex;
      gap: var(--space-4);
      min-height: 60vh;
    }

    /* ── Sidebar ── */
    .sidebar {
      width: 14.375rem;
      flex-shrink: 0;
      border-right: 1px solid var(--border);
      padding-right: var(--space-3);
    }
    .sidebar-group {
      font-size: 0.5625rem;
      font-weight: 700;
      color: var(--text3);
      letter-spacing: 0.1em;
      text-transform: uppercase;
      padding: 0.75rem 0.625rem 0.3125rem;
    }
    .sidebar-btn {
      display: flex;
      align-items: center;
      gap: 0.5625rem;
      width: 100%;
      text-align: left;
      padding: 0.5rem 0.625rem;
      background: transparent;
      border: none;
      border-radius: 0.5rem;
      color: var(--text1);
      cursor: pointer;
      font-family: inherit;
      font-size: 0.75rem;
      transition: all 0.12s;
    }
    .sidebar-btn:hover {
      background: var(--bg2);
      color: var(--text0);
    }
    .sidebar-btn.active {
      background: var(--info-bg);
      color: var(--info-text);
      font-weight: 600;
    }
    .sidebar-icon {
      font-size: 0.9375rem;
      width: 1.25rem;
      text-align: center;
      flex-shrink: 0;
    }

    /* ── Content ── */
    .content {
      flex: 1;
      min-width: 0;
    }
    .sec-header {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      margin-bottom: 0.625rem;
    }
    .sec-header-icon {
      font-size: 1.375rem;
    }
    .sec-title {
      font-size: 1rem;
      font-weight: 700;
      color: var(--text0);
    }
    .sec-lead {
      font-size: 0.75rem;
      color: var(--text2);
      line-height: 1.7;
      margin-bottom: 1.375rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--border);
    }

    /* ── Items grid ── */
    .items-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }
    @media (max-width: 48rem) {
      .items-grid { grid-template-columns: 1fr; }
    }
    .item {
      display: flex;
      gap: 0.875rem;
      padding: 0.875rem 1rem;
      background: var(--bg1);
      border: 1px solid var(--border);
      border-radius: 0.75rem;
      transition: border-color 0.12s;
    }
    .item:hover {
      border-color: var(--border2);
    }
    .item-num {
      width: 1.5rem;
      height: 1.5rem;
      border-radius: 0.375rem;
      background: var(--info-bg);
      color: var(--info-text);
      font-size: 0.6875rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 0.0625rem;
    }
    .item-body {
      flex: 1;
      min-width: 0;
    }
    .item-title {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text0);
      margin-bottom: 0.3125rem;
    }
    .item-text {
      font-size: 0.6875rem;
      color: var(--text1);
      line-height: 1.75;
    }

    /* ── Tip ── */
    .tip {
      display: flex;
      align-items: flex-start;
      gap: 0.625rem;
      margin-top: 1.125rem;
      padding: 0.75rem 1rem;
      background: var(--warn-bg);
      border: 1px solid var(--warn-border);
      border-radius: 0.625rem;
      font-size: 0.6875rem;
      color: var(--warn-text);
      line-height: 1.7;
    }
    .tip-icon {
      font-size: 1rem;
      flex-shrink: 0;
      margin-top: 0.0625rem;
    }
    .tip-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.125rem 0.4375rem;
      border-radius: 0.3125rem;
      background: var(--info-bg);
      color: var(--info-text);
      font-size: 0.625rem;
      font-weight: 700;
      vertical-align: middle;
    }

    /* ── Responsive: sidebar collapses to top tabs ── */
    @media (max-width: 48rem) {
      .body {
        flex-direction: column;
      }
      .sidebar {
        width: 100%;
        border-right: none;
        border-bottom: 1px solid var(--border);
        padding-right: 0;
        padding-bottom: var(--space-2);
        display: flex;
        flex-wrap: wrap;
        gap: 0.25rem;
        align-items: center;
      }
      .sidebar-group {
        width: 100%;
        padding: 0.25rem 0.25rem 0.125rem;
      }
      .sidebar-btn {
        padding: 0.375rem 0.5rem;
        font-size: 0.6875rem;
      }
    }
  `;

  render() {
    const sec = SECTIONS.find((s) => s.id === this._tab) ?? SECTIONS[0];

    return html`
      <div class="hdr">
        <div class="hdr-icon">?</div>
        <div>
          <h2 class="hdr-title">Guía de uso — Oda Planner</h2>
          <div class="hdr-sub">Documentación completa de todas las funciones</div>
        </div>
      </div>

      <div class="body">
        <!-- Sidebar -->
        <nav class="sidebar">
          ${GROUPS.map(
            (g) => html`
              <div class="sidebar-group">${g}</div>
              ${SECTIONS.filter((s) => s.group === g).map(
                (s) => html`
                  <button
                    class="sidebar-btn ${this._tab === s.id ? "active" : ""}"
                    @click=${() => {
                      this._tab = s.id;
                    }}
                  >
                    <span class="sidebar-icon">${s.icon}</span>
                    ${s.label}
                  </button>
                `,
              )}
            `,
          )}
        </nav>

        <!-- Content -->
        <div class="content">
          <div class="sec-header">
            <span class="sec-header-icon">${sec.icon}</span>
            <span class="sec-title">${sec.label}</span>
          </div>
          <div class="sec-lead">${sec.lead}</div>

          <div class="items-grid">
            ${sec.content.map(
              (item, i) => html`
                <div class="item">
                  <div class="item-num">${i + 1}</div>
                  <div class="item-body">
                    <div class="item-title">${item.title}</div>
                    <div class="item-text">${item.text}</div>
                  </div>
                </div>
              `,
            )}
          </div>

          <div class="tip">
            <span class="tip-icon">💡</span>
            <span>
              Podés volver a esta guía en cualquier momento con el botón
              <span class="tip-badge">?</span>
              del header.
            </span>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ayuda-view": AyudaView;
  }
}
