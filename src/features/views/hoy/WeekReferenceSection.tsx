import type { DiaId, FranjaHoraria, FranjaId, GridLayout, Materia } from '../../../domains/planner/types'
import { HorizontalGrid } from '../semana/HorizontalGrid'
import { VerticalGrid } from '../semana/VerticalGrid'
import styles from './WeekReferenceSection.module.css'

interface WeekReferenceSectionProps {
  title: string
  subtitle: string
  weekLayout: GridLayout
  onChangeLayout: (layout: GridLayout) => void
  dias: readonly DiaId[]
  franjas: FranjaHoraria[]
  currentDia: DiaId
  currentFranja: FranjaId
  materiasByCell: Record<string, Materia[]>
  materiasFiltradas: Materia[]
  openCell: { dia: DiaId; franjaId: FranjaId } | null
  dayLabels: Record<DiaId, string>
  onToggleCell: (dia: DiaId, franjaId: FranjaId) => void
  onClosePopover: () => void
  onDragStart: (materiaId: string, fromDia: DiaId, fromFranjaId: FranjaId) => void
  onDragEnd: () => void
  onDropMateria: (dia: DiaId, franjaId: FranjaId) => void
  onAddMateria: (materiaId: string, dia: DiaId, franjaId: FranjaId) => void
  onRemoveMateria: (materiaId: string, dia: DiaId, franjaId: FranjaId) => void
}

export function WeekReferenceSection({
  title,
  subtitle,
  weekLayout,
  onChangeLayout,
  dias,
  franjas,
  currentDia,
  currentFranja,
  materiasByCell,
  materiasFiltradas,
  openCell,
  dayLabels,
  onToggleCell,
  onClosePopover,
  onDragStart,
  onDragEnd,
  onDropMateria,
  onAddMateria,
  onRemoveMateria,
}: WeekReferenceSectionProps) {
  const sharedProps = {
    dias,
    franjas,
    currentDia,
    currentFranja,
    materiasByCell,
    materiasFiltradas,
    openCell,
    dayLabels,
    onToggleCell,
    onClosePopover,
    onDragStart,
    onDragEnd,
    onDropMateria,
    onAddMateria,
    onRemoveMateria,
    compact: true,
  }

  return (
    <section className={styles.section}>
      <header className={styles.header}>
        <div>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>

        <div className={styles.layoutSwitch}>
          <button
            type="button"
            className={`${styles.layoutButton} ${weekLayout === 'horizontal' ? styles.layoutButtonActive : ''}`}
            onClick={() => onChangeLayout('horizontal')}
          >
            ⇆ Horizontal
          </button>
          <button
            type="button"
            className={`${styles.layoutButton} ${weekLayout === 'vertical' ? styles.layoutButtonActive : ''}`}
            onClick={() => onChangeLayout('vertical')}
          >
            ⇅ Vertical
          </button>
        </div>
      </header>

      {weekLayout === 'horizontal' ? <HorizontalGrid {...sharedProps} /> : <VerticalGrid {...sharedProps} />}
    </section>
  )
}