import { useMemo, useState } from 'react'
import { Modal } from '../../shared/components/Modal'
import { usePlannerStore } from '../../store/usePlannerStore'
import { useUIStore } from '../../store/useUIStore'
import { PlannerService } from '../../domains/planner/service'
import type { AlertasConfig, Materia, ThemeId, TipoTarea } from '../../domains/planner/types'
import { MateriaForm } from './MateriaForm'
import { TipoForm } from './TipoForm'
import { FranjasEditor } from './FranjasEditor'
import { AlertasEditor } from './AlertasEditor'
import { ThemeSettings } from './ThemeSettings'
import styles from './SettingsModal.module.css'

type SettingsTab = 'materias' | 'tipos' | 'horarios' | 'alertas' | 'tema'

interface SettingsModalProps {
  initialTab?: string | undefined
}

const tabList: Array<{ id: SettingsTab; label: string }> = [
  { id: 'materias', label: 'Materias' },
  { id: 'tipos', label: 'Tipos' },
  { id: 'horarios', label: 'Horarios' },
  { id: 'alertas', label: 'Alertas' },
  { id: 'tema', label: 'Tema' },
]

function normalizeTab(input?: string): SettingsTab {
  if (input === 'materias' || input === 'tipos' || input === 'horarios' || input === 'alertas' || input === 'tema') {
    return input
  }
  return 'materias'
}

export function SettingsModal({ initialTab }: SettingsModalProps) {
  const settingsClosed = useUIStore((state) => state.settingsClosed)
  const resetModalOpened = useUIStore((state) => state.resetModalOpened)
  const data = usePlannerStore((state) => state.data)
  const materiasActualizadas = usePlannerStore((state) => state.materiasActualizadas)
  const tiposActualizados = usePlannerStore((state) => state.tiposActualizados)
  const dataLoaded = usePlannerStore((state) => state.dataLoaded)

  const [activeTab, setActiveTab] = useState<SettingsTab>(() => normalizeTab(initialTab))
  const [editingMateriaId, setEditingMateriaId] = useState<string | 'new' | null>(null)
  const [editingTipoId, setEditingTipoId] = useState<string | 'new' | null>(null)
  const [activeTheme, setActiveTheme] = useState<ThemeId>(PlannerService.getTheme())

  const usedMateriaIds = useMemo(() => new Set(data.tareas.map((task) => task.materiaId)), [data.tareas])
  const usedTipoIds = useMemo(() => new Set(data.tareas.map((task) => task.tipo)), [data.tareas])

  const materiaTaskCount = useMemo(() => {
    return data.tareas.reduce<Record<string, number>>((acc, task) => {
      acc[task.materiaId] = (acc[task.materiaId] ?? 0) + 1
      return acc
    }, {})
  }, [data.tareas])

  const tipoTaskCount = useMemo(() => {
    return data.tareas.reduce<Record<string, number>>((acc, task) => {
      acc[task.tipo] = (acc[task.tipo] ?? 0) + 1
      return acc
    }, {})
  }, [data.tareas])

  const editingMateria = useMemo(() => {
    if (!editingMateriaId || editingMateriaId === 'new') {
      return undefined
    }
    return data.materias.find((item) => item.id === editingMateriaId)
  }, [editingMateriaId, data.materias])

  const editingTipo = useMemo(() => {
    if (!editingTipoId || editingTipoId === 'new') {
      return undefined
    }
    return data.tipos.find((item) => item.id === editingTipoId)
  }, [editingTipoId, data.tipos])

  function saveMateria(nextMateria: Materia) {
    const exists = data.materias.some((item) => item.id === nextMateria.id)
    const next = exists
      ? data.materias.map((item) => (item.id === nextMateria.id ? nextMateria : item))
      : [...data.materias, nextMateria]

    materiasActualizadas(next)
    setEditingMateriaId(null)
  }

  function deleteMateria(materiaId: string) {
    const next = data.materias.filter((item) => item.id !== materiaId)
    materiasActualizadas(next)
    if (editingMateriaId === materiaId) {
      setEditingMateriaId(null)
    }
  }

  function saveTipo(nextTipo: TipoTarea) {
    const exists = data.tipos.some((item) => item.id === nextTipo.id)
    const next = exists
      ? data.tipos.map((item) => (item.id === nextTipo.id ? nextTipo : item))
      : [...data.tipos, nextTipo]

    tiposActualizados(next)
    setEditingTipoId(null)
  }

  function deleteTipo(tipoId: string) {
    const next = data.tipos.filter((item) => item.id !== tipoId)
    tiposActualizados(next)
    if (editingTipoId === tipoId) {
      setEditingTipoId(null)
    }
  }

  function renderMateriasTab() {
    return (
      <section className={styles.panel}>
        <div className={styles.list}>
          {data.materias.map((materia) => {
            const taskCount = materiaTaskCount[materia.id] ?? 0
            const disableDelete = usedMateriaIds.has(materia.id)
            const isEditing = editingMateriaId === materia.id

            return (
              <article key={materia.id} className={styles.rowCard}>
                <div className={styles.rowMain}>
                  <span className={styles.dot} style={{ backgroundColor: materia.color }} />
                  <div>
                    <p className={styles.rowTitle}>{materia.nombre}</p>
                    <p className={styles.rowMeta}>{`${materia.codigo} · ${materia.periodo.toUpperCase()} ${materia.anio} · ${taskCount}t`}</p>
                  </div>
                </div>
                <div className={styles.rowActions}>
                  <button
                    type="button"
                    className={styles.actionButton}
                    onClick={() => setEditingMateriaId(materia.id)}
                    aria-label={`Editar materia ${materia.nombre}`}
                  >
                    ✎
                  </button>
                  <button
                    type="button"
                    className={styles.actionButton}
                    onClick={() => deleteMateria(materia.id)}
                    disabled={disableDelete}
                    aria-label={`Eliminar materia ${materia.nombre}`}
                    title={disableDelete ? 'Tiene tareas asociadas' : 'Eliminar materia'}
                  >
                    ✕
                  </button>
                </div>
                {isEditing && (
                  <MateriaForm
                    initial={editingMateria}
                    onCancel={() => setEditingMateriaId(null)}
                    onSave={saveMateria}
                  />
                )}
              </article>
            )
          })}
        </div>

        {editingMateriaId !== 'new' && (
          <button type="button" className={styles.addButton} onClick={() => setEditingMateriaId('new')}>
            + Agregar materia
          </button>
        )}

        {editingMateriaId === 'new' && (
          <MateriaForm onCancel={() => setEditingMateriaId(null)} onSave={saveMateria} />
        )}
      </section>
    )
  }

  function renderTiposTab() {
    return (
      <section className={styles.panel}>
        <div className={styles.list}>
          {data.tipos.map((tipo) => {
            const taskCount = tipoTaskCount[tipo.id] ?? 0
            const disableDelete = usedTipoIds.has(tipo.id)
            const isEditing = editingTipoId === tipo.id

            return (
              <article key={tipo.id} className={styles.rowCard}>
                <div className={styles.rowMain}>
                  <span className={styles.tipoPreview} style={{ backgroundColor: tipo.bg, borderColor: tipo.accent, color: tipo.accent }}>
                    {`${tipo.icon} ${tipo.label}`}
                  </span>
                  <p className={styles.rowMeta}>{`${taskCount}t`}</p>
                </div>
                <div className={styles.rowActions}>
                  <button
                    type="button"
                    className={styles.actionButton}
                    onClick={() => setEditingTipoId(tipo.id)}
                    aria-label={`Editar tipo ${tipo.label}`}
                  >
                    ✎
                  </button>
                  <button
                    type="button"
                    className={styles.actionButton}
                    onClick={() => deleteTipo(tipo.id)}
                    disabled={disableDelete}
                    aria-label={`Eliminar tipo ${tipo.label}`}
                    title={disableDelete ? 'Tiene tareas asociadas' : 'Eliminar tipo'}
                  >
                    ✕
                  </button>
                </div>
                {isEditing && (
                  <TipoForm
                    initial={editingTipo}
                    onCancel={() => setEditingTipoId(null)}
                    onSave={saveTipo}
                  />
                )}
              </article>
            )
          })}
        </div>

        {editingTipoId !== 'new' && (
          <button type="button" className={styles.addButton} onClick={() => setEditingTipoId('new')}>
            + Agregar tipo
          </button>
        )}

        {editingTipoId === 'new' && (
          <TipoForm onCancel={() => setEditingTipoId(null)} onSave={saveTipo} />
        )}
      </section>
    )
  }

  function renderDeferredTab() {
    if (activeTab === 'horarios') {
      return (
        <section className={styles.panel}>
          <FranjasEditor materias={data.materias} onMateriasUpdated={materiasActualizadas} />
        </section>
      )
    }

    if (activeTab === 'alertas') {
      const alertas: AlertasConfig = data.alertas ?? PlannerService.getAlertas()
      return (
        <section className={styles.panel}>
          <AlertasEditor
            value={alertas}
            onSave={(next) => {
              PlannerService.setAlertas(next)
              dataLoaded({ ...data, alertas: next })
            }}
          />
        </section>
      )
    }

    if (activeTab === 'tema') {
      return (
        <section className={styles.panel}>
          <ThemeSettings activeTheme={activeTheme} onThemeChange={setActiveTheme} />
        </section>
      )
    }

    return (
      <section className={styles.deferredPanel}>
        <p>Esta seccion se completa en la siguiente fase.</p>
      </section>
    )
  }

  return (
    <Modal title="Configuracion" onClose={settingsClosed} maxWidth={980}>
      <div className={styles.wrapper}>
        <nav className={styles.tabBar} aria-label="Tabs de configuracion">
          {tabList.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`${styles.tabButton} ${activeTab === tab.id ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {activeTab === 'materias' && renderMateriasTab()}
        {activeTab === 'tipos' && renderTiposTab()}
        {(activeTab === 'horarios' || activeTab === 'alertas' || activeTab === 'tema') && renderDeferredTab()}

        <div className={styles.footerActions}>
          <button
            type="button"
            className={styles.resetButton}
            onClick={() => {
              settingsClosed()
              resetModalOpened()
            }}
          >
            Reset de datos
          </button>
        </div>
      </div>
    </Modal>
  )
}
