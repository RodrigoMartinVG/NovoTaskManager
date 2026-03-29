import { PlannerService } from '../../domains/planner/service'
import type { ThemeId } from '../../domains/planner/types'
import styles from './ThemeSettings.module.css'

interface ThemeSettingsProps {
  activeTheme: ThemeId
  onThemeChange: (theme: ThemeId) => void
}

const options: Array<{ id: ThemeId; label: string; dot: string }> = [
  { id: 'theme-1', label: 'Theme 1', dot: '#4e47b8' },
  { id: 'theme-2', label: 'Theme 2', dot: '#0f6e56' },
  { id: 'theme-3', label: 'Theme 3', dot: '#8c2018' },
  { id: 'theme-4', label: 'Theme 4', dot: '#1f2937' },
  { id: 'theme-5', label: 'Theme 5', dot: '#855d36' },
]

export function ThemeSettings({ activeTheme, onThemeChange }: ThemeSettingsProps) {
  function applyTheme(theme: ThemeId) {
    PlannerService.setTheme(theme)
    onThemeChange(theme)
  }

  return (
    <section className={styles.wrapper}>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          className={`${styles.themeButton} ${activeTheme === option.id ? styles.active : ''}`}
          onClick={() => applyTheme(option.id)}
        >
          <span className={styles.dot} style={{ backgroundColor: option.dot }} />
          <span>{option.label}</span>
          {activeTheme === option.id && <span className={styles.check}>✓</span>}
        </button>
      ))}
    </section>
  )
}
