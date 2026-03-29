import { useMemo, useState } from 'react'
import { PlannerService } from '../../domains/planner/service'
import { createEmptyPlannerData, isEmptyPlannerData, SAMPLE_DATA } from '../../domains/import-export/normalizer'
import { usePlannerStore } from '../../store/usePlannerStore'
import { useUIStore } from '../../store/useUIStore'
import type { ThemeId } from '../../domains/planner/types'
import styles from './OnboardingFlow.module.css'

const themeOptions: ThemeId[] = ['theme-1', 'theme-2', 'theme-3', 'theme-4', 'theme-5']

const stepLabels = ['Inicio', 'Estilo', 'Arranque']

const themeLabels: Record<ThemeId, string> = {
  'theme-1': 'Noche',
  'theme-2': 'Pizarrón',
  'theme-3': 'Claro',
  'theme-4': 'Hueso',
  'theme-5': 'Bosque',
}

export function OnboardingFlow() {
  const [step, setStep] = useState(1)
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>(PlannerService.getTheme())
  const dataLoaded = usePlannerStore((state) => state.dataLoaded)
  const modeChanged = usePlannerStore((state) => state.modeChanged)
  const viewChanged = useUIStore((state) => state.viewChanged)

  const existingData = useMemo(() => !isEmptyPlannerData(PlannerService.loadData()), [])

  const selectTheme = (theme: ThemeId) => {
    PlannerService.setTheme(theme)
    setSelectedTheme(theme)
  }

  const enterApp = (data: ReturnType<typeof createEmptyPlannerData>) => {
    modeChanged('local')
    dataLoaded(data)
    viewChanged('hoy')
  }

  const handleQuickStart = () => {
    if (existingData && !window.confirm('Hay datos existentes en el navegador. Reemplazarlos eliminará el contenido actual. ¿Querés continuar?')) {
      return
    }
    enterApp(createEmptyPlannerData())
  }

  const handleSampleData = () => {
    if (existingData && !window.confirm('Hay datos existentes en el navegador. Reemplazarlos eliminará el contenido actual. ¿Querés continuar con los datos de ejemplo?')) {
      return
    }
    enterApp(SAMPLE_DATA)
  }

  const handleExitApp = () => {
    modeChanged('local')
    viewChanged('hoy')
  }

  return (
    <div className={styles.container}>
      <div className={styles.background} />
      <div className={styles.card}>
        <div className={styles.stepChips}>
          {stepLabels.map((label, index) => (
            <span key={label} className={`${styles.stepChip} ${step === index + 1 ? styles.stepChipActive : ''}`}>
              {index + 1}. {label}
            </span>
          ))}
        </div>

        {step === 1 && (
          <div className={styles.stepContent}>
            <div className={styles.hero}>
              <div className={styles.logo}>◈</div>
              <div>
                <h1>UAI Planner</h1>
                <p>Convertí tu cursada en un plan que se mueve con vos</p>
              </div>
            </div>
            <div className={styles.heroPanel}>
              <div className={styles.description}>
                <h2>Organizá tu semana sin caos</h2>
                <p>
                  Pasá de materias, fechas límite, sesiones y horarios sueltos a un planner claro que te diga qué toca hoy,
                  cuánto ya estudiaste y qué conviene atacar antes de llegar tarde.
                </p>
              </div>

              <div className={styles.previewCard}>
                <div className={styles.previewHeader}>
                  <div>
                    <strong>Vista rápida de una semana viva</strong>
                    <span>Hoy, urgencias y progreso real en segundos</span>
                  </div>
                  <span className={styles.previewMetric}>62% de la meta</span>
                </div>
                <div className={styles.previewList}>
                  <div className={styles.previewItem}>
                    <strong>TP de Matemática</strong>
                    <span>Arrancar hoy · vence mañana</span>
                  </div>
                  <div className={styles.previewItem}>
                    <strong>Bloque de estudio</strong>
                    <span>Bases de Datos · 19:00 · Noche</span>
                  </div>
                  <div className={styles.previewItem}>
                    <strong>Resumen de Historia</strong>
                    <span>2 sesiones registradas</span>
                  </div>
                </div>
                <div className={styles.previewFooter}>Horas de la semana · 8.5h / 13h</div>
              </div>
            </div>

            <div className={styles.featureGrid}>
              <div className={styles.featureCard}>📚<span>Convertí materias en un plan real</span></div>
              <div className={styles.featureCard}>⏱<span>Registrá estudio sin fricción</span></div>
              <div className={styles.featureCard}>🚨<span>Anticipate antes del desastre</span></div>
              <div className={styles.featureCard}>📊<span>Horas y progreso con contexto</span></div>
            </div>
            <p className={styles.highlightNote}>
              La gracia de la app no es solo guardar cosas: es mostrarte qué conviene hacer ahora y cuánto tiempo real ya
              invertiste.
            </p>
            <button type="button" className={styles.primaryButton} onClick={() => setStep(2)}>
              Empezar →
            </button>
            <p className={styles.footerNote}>
              Inicio recomendado: arrancá en local y, cuando tu planner ya esté armado, conectá Drive desde Datos para
              sincronizar entre dispositivos.
            </p>
          </div>
        )}

        {step === 2 && (
          <div className={styles.stepContent}>
            <h2>Elegí tu tema</h2>
            <p>
              Elegí el look con el que querés arrancar. Es solo estética: podés cambiarlo en cualquier momento desde la
              barra superior o desde Configuración.
            </p>
            <div className={styles.themeGrid}>
              {themeOptions.map((theme) => (
                <button
                  key={theme}
                  type="button"
                  className={`${styles.themeOption} ${selectedTheme === theme ? styles.themeOptionActive : ''}`}
                  onClick={() => selectTheme(theme)}
                >
                  <div className={styles.themeSwatch} data-theme={theme} />
                  <span>{themeLabels[theme]}</span>
                </button>
              ))}
            </div>
            <p className={styles.footerNote}>No te bloquees acá: lo importante viene en el siguiente paso.</p>
            <div className={styles.controls}>
              <button type="button" className={styles.secondaryButton} onClick={() => setStep(1)}>
                ← Atrás
              </button>
              <button type="button" className={styles.primaryButton} onClick={() => setStep(3)}>
                Continuar →
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className={styles.stepContent}>
            <h2>Elegí cómo empezar</h2>
            {existingData ? (
              <p className={styles.warning}>
                Se detectaron datos existentes en tu navegador. Si elegís un modo nuevo, el contenido actual se reemplazará.
              </p>
            ) : (
              <p>
                Elegí si querés entrar ya con un planner vacío o explorar con datos de ejemplo para entender rápido cómo se
                conectan materias, tareas, calendario, sesiones y alertas.
              </p>
            )}
            <div className={styles.datasetGrid}>
              <button type="button" className={`${styles.datasetCard} ${styles.datasetCardRecommended}`} onClick={handleQuickStart}>
                <div className={styles.datasetHeader}>
                  <strong>⚡ Empezar rápido en modo local</strong>
                  <span className={styles.datasetTag}>recomendado</span>
                </div>
                <span>Entrás ya mismo a la app con tu planner vacío para cargar materias, horarios y tareas.</span>
                <small>Tus datos quedan en este navegador. Después podés exportar, importar o sincronizar con Drive.</small>
              </button>
              <button type="button" className={styles.datasetCard} onClick={handleSampleData}>
                <div className={styles.datasetHeader}>
                  <strong>🎲 Explorar con datos de ejemplo</strong>
                  <span className={styles.datasetTagMuted}>demo</span>
                </div>
                <span>Ideal para entender cómo se conectan backlog, calendario, materias, sesiones y alertas.</span>
                <small>Se cargan materias, tareas y sesiones ficticias para recorrer la app con valor inmediato.</small>
              </button>
            </div>
            <div className={styles.recommendationBox}>
              <strong>Al entrar se abre la guía completa:</strong>
              <span>vas a tener a mano el recorrido inicial, cómo cargar materias, cómo usar Semana y cómo cuidar tus datos.</span>
            </div>
            <p className={styles.footerNote}>
              Siguiente paso recomendado al entrar: crear tus materias, definir objetivos semanales y marcar tus slots en la
              Vista Semana.
            </p>
            <div className={styles.controls}>
              <button type="button" className={styles.secondaryButton} onClick={() => setStep(2)}>
                ← Atrás
              </button>
              {existingData && (
                <button type="button" className={styles.tertiaryButton} onClick={handleExitApp}>
                  Salir a la app
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
