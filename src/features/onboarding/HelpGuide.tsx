import { useMemo, useState } from 'react'
import { Modal } from '../../shared/components/Modal'
import { useUIStore } from '../../store/useUIStore'
import { usePlannerStore } from '../../store/usePlannerStore'
import styles from './HelpGuide.module.css'

type GuideSectionId =
  | 'inicio'
  | 'hoy'
  | 'semana'
  | 'tareas'
  | 'pomodoro'
  | 'materias'
  | 'datos'
  | 'configuracion'
  | 'alertas'

interface GuideSection {
  id: GuideSectionId
  title: string
  icon: string
  content: Array<{ heading: string; text: string }>
}

const sections: GuideSection[] = [
  {
    id: 'inicio',
    icon: '🚀',
    title: 'Inicio rapido',
    content: [
      {
        heading: 'Paso 1: Configura tus materias',
        text: 'Creá primero tus materias desde Configuración con nombre, color, código, período y objetivos semanales. Todo lo demás depende de esta base.',
      },
      {
        heading: 'Paso 2: Asigna horarios',
        text: 'En Vista Semana ubicá cada materia por día y franja. Sin slots definidos, la app no puede decirte qué tocaría estudiar hoy.',
      },
      {
        heading: 'Paso 3: Carga tus tareas',
        text: 'Usá + Nueva tarea para crear entregas y exámenes con fecha de inicio y fecha límite. Después seguí esas tareas desde Backlog, Kanban o Calendario.',
      },
      {
        heading: 'Paso 4: Empezá a registrar sesiones',
        text: 'Cuando empieces a estudiar, usá el Pomodoro o la carga manual. Ahí la app deja de ser una lista linda y pasa a mostrar esfuerzo real.',
      },
    ],
  },
  {
    id: 'hoy',
    icon: '◈',
    title: 'Vista Hoy',
    content: [
      {
        heading: 'Qué deberías ver acá',
        text: 'Hoy condensa tu momento actual: franja activa, materias esperadas según la semana y tareas urgentes que merecen foco inmediato.',
      },
      {
        heading: 'Si aparece vacío',
        text: 'Eso suele significar que todavía no definiste slots en Semana o que no hay tareas relevantes para este tramo del día.',
      },
      {
        heading: 'Uso recomendado',
        text: 'Tomala como pantalla de arranque: entrá, mirá qué urge, arrancá sesión o saltá a la tarea que conviene atacar ahora.',
      },
    ],
  },
  {
    id: 'semana',
    icon: '📅',
    title: 'Vista Semana',
    content: [
      {
        heading: 'Grilla editable',
        text: 'Cada celda representa un día y una franja. Esa grilla es la base operativa de la Vista Hoy y del ritmo semanal que te muestra la app.',
      },
      {
        heading: 'Layouts horizontal y vertical',
        text: 'Podés alternar el layout para leer mejor la semana según dispositivo o preferencia, sin perder estructura.',
      },
      {
        heading: 'Arrastrar y soltar',
        text: 'Mové chips entre celdas para rearmar la semana rápido, o entrá al editor del slot cuando necesites ajustar con más precisión.',
      },
    ],
  },
  {
    id: 'tareas',
    icon: '✓',
    title: 'Tareas y backlog',
    content: [
      {
        heading: 'Estados y prioridad',
        text: 'Clasificá tareas como pendiente, en progreso o completada. Eso ordena Kanban y también simplifica qué merece atención ahora.',
      },
      {
        heading: 'Fecha inicio vs fecha limite',
        text: 'La fecha de inicio te dice cuándo deberías haber empezado. La fecha límite marca el vencimiento real. Separarlas mejora mucho la priorización.',
      },
      {
        heading: 'Checklist y detalle',
        text: 'Dentro de cada tarea podés usar checklist, descripción, hora, link y notas para convertir una entrega grande en pasos chicos y medibles.',
      },
    ],
  },
  {
    id: 'pomodoro',
    icon: '🍅',
    title: 'Pomodoro',
    content: [
      {
        heading: 'Iniciar una sesion',
        text: 'Podés iniciar desde Materias, Hoy o desde el detalle de una tarea para estudiar con contexto y dejar registro del esfuerzo real.',
      },
      {
        heading: 'Timer persistente',
        text: 'El widget sigue contando aunque cambies de vista, para que no pierdas continuidad mientras navegás por la app.',
      },
      {
        heading: 'Guardado de sesiones',
        text: 'Al detener la sesión, los minutos quedan registrados en la materia y opcionalmente asociados a una tarea. Eso alimenta progreso y horas semanales.',
      },
    ],
  },
  {
    id: 'materias',
    icon: '📊',
    title: 'Materias',
    content: [
      {
        heading: 'Objetivos semanales',
        text: 'Definí horas mínimas y máximas por materia para monitorear carga, equilibrio y avance semanal.',
      },
      {
        heading: 'Sesiones manuales',
        text: 'Si estudiaste fuera del timer, podés cargar la sesión manualmente sin perder historial ni distorsionar tus métricas.',
      },
      {
        heading: 'Barra de progreso',
        text: 'La barra compara horas registradas contra tu objetivo y muestra si vas corto, en rango o ya te pasaste del máximo esperado.',
      },
    ],
  },
  {
    id: 'datos',
    icon: '💾',
    title: 'Datos y Drive',
    content: [
      {
        heading: 'Backup local',
        text: 'Exportá un JSON para guardar una copia completa del planner y reimportarla si necesitás recuperar trabajo o moverte de equipo.',
      },
      {
        heading: 'Modo local y modo Drive',
        text: 'En modo local todo vive en este navegador. En modo Drive además podés sincronizar en la nube y continuar desde otro dispositivo.',
      },
      {
        heading: 'Sincronizacion',
        text: 'Podés guardar y cargar manualmente, o activar auto-save para que los cambios se suban con debounce sin interrumpir el flujo.',
      },
    ],
  },
  {
    id: 'configuracion',
    icon: '⚙',
    title: 'Configuracion',
    content: [
      {
        heading: 'Materias y tipos',
        text: 'Gestioná catálogos base para que formularios, badges y vistas usen etiquetas consistentes y útiles.',
      },
      {
        heading: 'Horarios y alertas',
        text: 'Ajustá franjas y umbrales para que la app se adapte a tu ritmo real de cursada y no a una semana idealizada.',
      },
      {
        heading: 'Tema visual',
        text: 'Cambiá tema desde la barra o desde Configuración. El estilo se aplica al instante y no altera tus datos.',
      },
    ],
  },
  {
    id: 'alertas',
    icon: '🔔',
    title: 'Alertas',
    content: [
      {
        heading: 'Colores de prioridad temporal',
        text: 'Las alertas resaltan tareas por cercanía de inicio o vencimiento para decidir más rápido qué atacar primero.',
      },
      {
        heading: 'Umbrales personalizables',
        text: 'En Configuración podés definir cuántos días antes se activa cada nivel de alerta según tu forma de estudiar.',
      },
      {
        heading: 'Uso recomendado',
        text: 'Revisá urgencias en Hoy y Backlog al empezar el día para decidir qué tarea conviene atacar primero y qué puede esperar.',
      },
    ],
  },
]

export function HelpGuide() {
  const helpClosed = useUIStore((state) => state.helpClosed)
  const modeChanged = usePlannerStore((state) => state.modeChanged)
  const [activeSection, setActiveSection] = useState<GuideSectionId>('inicio')

  const section = useMemo<GuideSection>(() => {
    const found = sections.find((item) => item.id === activeSection)
    return found ?? sections[0]!
  }, [activeSection])

  const handleRestartOnboarding = () => {
    helpClosed()
    modeChanged('welcome')
  }

  return (
    <Modal title="Guia de inicio · UAI Planner" icon="?" onClose={helpClosed} maxWidth={1100}>
      <div className={styles.guideLayout}>
        <aside className={styles.sidebar} aria-label="Secciones de ayuda">
          {sections.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`${styles.navItem} ${item.id === activeSection ? styles.navItemActive : ''}`}
              onClick={() => setActiveSection(item.id)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span>{item.title}</span>
            </button>
          ))}
        </aside>

        <section className={styles.contentPanel}>
          <header className={styles.contentHeader}>
            <h3>{`${section.icon} ${section.title}`}</h3>
            <p>
              {section.id === 'inicio'
                ? 'El orden que más valor devuelve: Materias → Semana → Tareas → Pomodoro. Cada paso activa el siguiente.'
                : 'Guía práctica para usar UAI Planner en el orden que más valor devuelve desde el primer día.'}
            </p>
          </header>

          <div className={styles.contentBody}>
            {section.content.map((block) => (
              <article key={block.heading} className={styles.article}>
                <h4>{block.heading}</h4>
                <p>{block.text}</p>
              </article>
            ))}
          </div>

          <footer className={styles.footer}>
            <span>{`${section.content.length} temas en esta sección · ${sections.length} secciones en total`}</span>
            <button type="button" className={styles.restartButton} onClick={handleRestartOnboarding}>
              Reiniciar la bienvenida
            </button>
          </footer>
        </section>
      </div>
    </Modal>
  )
}
