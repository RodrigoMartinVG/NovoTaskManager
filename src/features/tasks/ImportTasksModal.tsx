import { useMemo, useState } from 'react'
import { parseImportPayload } from '../../domains/import-export/normalizer'
import { Modal } from '../../shared/components/Modal'
import { usePlannerStore } from '../../store/usePlannerStore'
import { useUIStore } from '../../store/useUIStore'
import type { Tarea } from '../../domains/planner/types'
import styles from './ImportTasksModal.module.css'

function stripTaskId(task: Tarea): Omit<Tarea, 'id'> {
  const { id, ...rest } = task
  void id
  return rest
}

export function ImportTasksModal() {
  const materias = usePlannerStore((state) => state.data.materias)
  const tipos = usePlannerStore((state) => state.data.tipos)
  const tareasImportadas = usePlannerStore((state) => state.tareasImportadas)
  const importTasksClosed = useUIStore((state) => state.importTasksClosed)

  const [rawPayload, setRawPayload] = useState('')
  const [defaultMateriaId, setDefaultMateriaId] = useState(materias[0]?.id ?? '')
  const [defaultTipo, setDefaultTipo] = useState(tipos[0]?.id ?? 'tp')
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<Tarea[] | null>(null)

  const previewTitle = useMemo(() => {
    if (!preview) {
      return null
    }
    if (preview.length === 0) {
      return 'No se encontraron tareas válidas para importar.'
    }
    return `Se van a importar ${preview.length} tareas.`
  }, [preview])

  function handlePreview() {
    setPreview(null)
    setError(null)

    if (!rawPayload.trim()) {
      setError('Pegá un JSON para previsualizar.')
      return
    }

    let parsedRaw: unknown
    try {
      parsedRaw = JSON.parse(rawPayload)
    } catch {
      setError('JSON inválido. Revisá el formato.')
      return
    }

    if (!Array.isArray(parsedRaw)) {
      setError('El JSON debe ser un array de tareas.')
      return
    }

    const parsed = parseImportPayload(rawPayload, {
      materiaId: defaultMateriaId,
      tipo: defaultTipo,
    })

    setPreview(parsed)
  }

  function handleImport() {
    if (!preview || preview.length === 0) {
      return
    }

    const toImport = preview.map(stripTaskId)
    tareasImportadas(toImport)
    importTasksClosed()
  }

  return (
    <Modal title="Importar tareas" onClose={importTasksClosed} maxWidth={720}>
      <div className={styles.wrapper}>
        <label htmlFor="import-json" className={styles.label}>
          JSON de tareas
        </label>
        <textarea
          id="import-json"
          className={styles.textarea}
          value={rawPayload}
          onChange={(event) => setRawPayload(event.target.value)}
          placeholder='[\n  { "id": "tmp_1", "titulo": "Resolver guia", "materiaId": "mat_am2", "tipo": "tp" }\n]'
          rows={10}
        />

        <div className={styles.defaultsGrid}>
          <div className={styles.field}>
            <label htmlFor="default-materia" className={styles.label}>
              Materia por defecto
            </label>
            <select
              id="default-materia"
              className={styles.select}
              value={defaultMateriaId}
              onChange={(event) => setDefaultMateriaId(event.target.value)}
            >
              {materias.map((materia) => (
                <option key={materia.id} value={materia.id}>
                  {materia.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="default-tipo" className={styles.label}>
              Tipo por defecto
            </label>
            <select
              id="default-tipo"
              className={styles.select}
              value={defaultTipo}
              onChange={(event) => setDefaultTipo(event.target.value)}
            >
              {tipos.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>
                  {`${tipo.icon} ${tipo.label}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        {preview && (
          <section className={styles.preview}>
            {previewTitle && <p className={styles.previewTitle}>{previewTitle}</p>}
            {preview.length > 0 && (
              <ul className={styles.previewList} role="list">
                {preview.map((task, idx) => (
                  <li key={`${task.id}-${idx}`} className={styles.previewItem}>
                    {task.titulo}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        <footer className={styles.actions}>
          <button type="button" className={styles.buttonGhost} onClick={importTasksClosed}>
            Cancelar
          </button>
          <button type="button" className={styles.buttonPrimary} onClick={handlePreview}>
            Previsualizar
          </button>
          <button
            type="button"
            className={styles.buttonPrimary}
            onClick={handleImport}
            disabled={!preview || preview.length === 0}
          >
            Importar
          </button>
        </footer>
      </div>
    </Modal>
  )
}
