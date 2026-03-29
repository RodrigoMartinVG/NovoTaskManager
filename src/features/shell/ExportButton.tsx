import { useEffect, useState } from 'react'
import { downloadPlannerJSON } from '../../domains/import-export/export'
import { hashData } from '../../domains/import-export/normalizer'
import { usePlannerStore } from '../../store/usePlannerStore'
import styles from './ExportButton.module.css'

export function ExportButton() {
  const data = usePlannerStore((state) => state.data)
  const dirty = usePlannerStore((state) => state.dirty)
  const exportMarked = usePlannerStore((state) => state.exportMarked)
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    if (!flash) {
      return
    }

    const timer = window.setTimeout(() => {
      setFlash(false)
    }, 2000)

    return () => window.clearTimeout(timer)
  }, [flash])

  const label = flash ? '✓ Exportado' : dirty ? '↓ Exportar •' : '↓ Exportar'

  function handleExport() {
    downloadPlannerJSON(data)
    exportMarked(hashData(data))
    setFlash(true)
  }

  return (
    <button type="button" className={styles.button} onClick={handleExport}>
      {label}
    </button>
  )
}
