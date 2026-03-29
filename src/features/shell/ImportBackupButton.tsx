import { useRef } from 'react'
import type { ChangeEvent } from 'react'
import { isEmptyPlannerData, normalizePlannerData } from '../../domains/import-export/normalizer'
import { usePlannerStore } from '../../store/usePlannerStore'
import { useUIStore } from '../../store/useUIStore'
import styles from './ImportBackupButton.module.css'

export function ImportBackupButton() {
  const data = usePlannerStore((state) => state.data)
  const dataLoaded = usePlannerStore((state) => state.dataLoaded)
  const confirmOpened = useUIStore((state) => state.confirmOpened)
  const inputRef = useRef<HTMLInputElement | null>(null)

  function applyImport(raw: unknown) {
    const normalized = normalizePlannerData(raw)
    dataLoaded(normalized)
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    try {
      const text = await file.text()
      const raw = JSON.parse(text) as unknown

      if (!isEmptyPlannerData(data)) {
        confirmOpened({
          title: 'Importar backup',
          description: 'Tus datos actuales se reemplazaran por el backup seleccionado.',
          confirmLabel: 'Importar',
          cancelLabel: 'Cancelar',
          tone: 'warn',
          onConfirm: () => applyImport(raw),
        })
      } else {
        applyImport(raw)
      }
    } catch {
      confirmOpened({
        title: 'Backup invalido',
        description: 'No se pudo leer el archivo JSON seleccionado.',
        confirmLabel: 'Entendido',
        cancelLabel: 'Cerrar',
        tone: 'danger',
      })
    } finally {
      event.target.value = ''
    }
  }

  return (
    <>
      <button type="button" className={styles.button} onClick={() => inputRef.current?.click()}>
        ↑ Importar backup
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        className={styles.hiddenInput}
        onChange={handleFileChange}
      />
    </>
  )
}
