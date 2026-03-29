import { useMemo, useState } from 'react'
import { Modal } from '../../shared/components/Modal'
import { useUIStore } from '../../store/useUIStore'
import { usePlannerStore } from '../../store/usePlannerStore'
import styles from './HelpGuide.module.css'

type GuideSectionId =
  | 'inicio'
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
        text: 'Crea o edita materias desde Configuracion para definir nombre, color y objetivos semanales.',
      },
      {
        heading: 'Paso 2: Asigna horarios',
        text: 'En Vista Semana puedes ubicar cada materia por dia y franja para organizar una rutina clara.',
      },
      {
        heading: 'Paso 3: Carga tus tareas',
        text: 'Usa + Nueva tarea para crear entregas y examenes, luego revisalas en Backlog, Kanban o Calendario.',
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
        text: 'Cada celda representa un dia y una franja horaria, y muestra las materias activas en ese bloque.',
      },
      {
        heading: 'Layouts horizontal y vertical',
        text: 'Puedes alternar el layout para ver mejor tus bloques segun tu dispositivo o preferencia.',
      },
      {
        heading: 'Arrastrar y soltar',
        text: 'Mueve chips de materias entre celdas para rearmar tu semana sin abrir formularios largos.',
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
        text: 'Clasifica tareas como pendiente, en progreso o completada, y usa prioridad para ordenar enfoque.',
      },
      {
        heading: 'Fecha inicio vs fecha limite',
        text: 'La fecha de inicio te avisa cuando deberias comenzar; la fecha limite marca el vencimiento real.',
      },
      {
        heading: 'Checklist y detalle',
        text: 'Dentro de cada tarea puedes usar checklist para dividir trabajo en pasos chicos y medibles.',
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
        text: 'Puedes iniciar desde Materias, Hoy o desde el detalle de una tarea para estudiar con contexto.',
      },
      {
        heading: 'Timer persistente',
        text: 'El widget sigue contando aunque cambies de vista, para evitar perder continuidad.',
      },
      {
        heading: 'Guardado de sesiones',
        text: 'Al detener la sesion, los minutos quedan registrados en la materia y pueden asociarse a una tarea.',
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
        text: 'Define horas minimas y maximas por materia para monitorear carga y equilibrio.',
      },
      {
        heading: 'Sesiones manuales',
        text: 'Si estudiaste fuera del timer, puedes cargar la sesion manualmente sin perder historial.',
      },
      {
        heading: 'Barra de progreso',
        text: 'La barra compara horas registradas contra tu objetivo para mostrar si vas corto, en rango o excedido.',
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
        text: 'Exporta un JSON para guardar una copia local y reimportarla cuando la necesites.',
      },
      {
        heading: 'Modo local y modo Drive',
        text: 'En modo local todo se guarda en tu navegador; en modo Drive ademas sincronizas en la nube.',
      },
      {
        heading: 'Sincronizacion',
        text: 'Puedes guardar y cargar manualmente, o activar auto-save para enviar cambios con debounce.',
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
        text: 'Gestiona catalogos base para que formularios y vistas usen etiquetas consistentes.',
      },
      {
        heading: 'Horarios y alertas',
        text: 'Ajusta franjas y umbrales para que la app se adapte a tu ritmo real de cursada.',
      },
      {
        heading: 'Tema visual',
        text: 'Cambia tema desde NavBar o Configuracion y el estilo se aplica de inmediato.',
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
        text: 'Las alertas resaltan tareas por cercania de inicio o vencimiento para priorizar rapido.',
      },
      {
        heading: 'Umbrales personalizables',
        text: 'En Configuracion puedes definir cuantos dias antes se activa cada nivel de alerta.',
      },
      {
        heading: 'Uso recomendado',
        text: 'Revisa urgencias en Hoy y Backlog para decidir cada jornada que tarea atacar primero.',
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
            <p>Guia practica para usar UAI Planner de forma mas clara y consistente.</p>
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
            <span>UAI Planner · v2.0</span>
            <button type="button" className={styles.restartButton} onClick={handleRestartOnboarding}>
              Reiniciar la bienvenida
            </button>
          </footer>
        </section>
      </div>
    </Modal>
  )
}
