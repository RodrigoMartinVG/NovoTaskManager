import { useMemo, useState } from 'react'
import { PlannerService } from '../../domains/planner/service'
import { createEmptyPlannerData, isEmptyPlannerData, SAMPLE_DATA } from '../../domains/import-export/normalizer'
import { usePlannerStore } from '../../store/usePlannerStore'
import { useUIStore } from '../../store/useUIStore'
import type { ThemeId } from '../../domains/planner/types'
import styles from './OnboardingFlow.module.css'

const themeOptions: ThemeId[] = ['theme-1', 'theme-2', 'theme-3', 'theme-4', 'theme-5']

const stepLabels = ['Bienvenida', 'Tema', 'Dataset']

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
                <p>PLANIFICADOR ACADÉMICO</p>
              </div>
            </div>
            <div className={styles.description}>
              <p>Organizá tus materias, proyectos y sesiones con una experiencia ágil y enfocada en el estudio.</p>
            </div>
            <div className={styles.featureGrid}>
              <div className={styles.featureCard}>📅<span>Agenda clara</span></div>
              <div className={styles.featureCard}>✓<span>Seguimiento fácil</span></div>
              <div className={styles.featureCard}>🍅<span>Ritmo Pomodoro</span></div>
              <div className={styles.featureCard}>📊<span>Datos útiles</span></div>
            </div>
            <button type="button" className={styles.primaryButton} onClick={() => setStep(2)}>
              Empezar →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className={styles.stepContent}>
            <h2>Elegí tu tema</h2>
            <p>El tema se aplica al instante y puede cambiarse después desde la app.</p>
            <div className={styles.themeGrid}>
              {themeOptions.map((theme) => (
                <button
                  key={theme}
                  type="button"
                  className={`${styles.themeOption} ${selectedTheme === theme ? styles.themeOptionActive : ''}`}
                  onClick={() => selectTheme(theme)}
                >
                  <div className={styles.themeSwatch} data-theme={theme} />
                  <span>{theme.replace('theme-', 'Tema ')}</span>
                </button>
              ))}
            </div>
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
              <p>Empezá con un planner vacío o con datos de ejemplo para explorar todas las funciones.</p>
            )}
            <div className={styles.datasetGrid}>
              <button type="button" className={styles.datasetCard} onClick={handleQuickStart}>
                <strong>⚡ Empezar rápido</strong>
                <span>Planner vacío listo para tu organización.</span>
              </button>
              <button type="button" className={styles.datasetCard} onClick={handleSampleData}>
                <strong>🎲 Explorar con datos</strong>
                <span>Cargá una agenda académica de ejemplo.</span>
              </button>
            </div>
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
