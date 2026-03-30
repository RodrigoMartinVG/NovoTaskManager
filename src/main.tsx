import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { normalizePlannerData } from './domains/import-export/normalizer'
import { PlannerService } from './domains/planner/service'
import './styles/reset.css'
import './styles/tokens.css'
import './styles/layers.css'
import './styles/themes.css'
import './styles/base.css'

function processHashImport(): void {
  const hash = window.location.hash
  if (!hash.startsWith('#import=')) {
    return
  }

  try {
    const encoded = hash.slice('#import='.length)
    const decoded = atob(encoded)
    const raw = JSON.parse(decoded) as unknown
    const normalized = normalizePlannerData(raw)

    const historyRaw = window.localStorage.getItem('importaciones_uai')
    const history = historyRaw ? (JSON.parse(historyRaw) as Array<Record<string, unknown>>) : []
    const materia = (normalized as { materia?: string }).materia
    const filtered = history.filter((item) => (item as { materia?: string }).materia !== materia)
    filtered.push(normalized as unknown as Record<string, unknown>)

    window.localStorage.setItem('importaciones_uai', JSON.stringify(filtered))
  } catch {
    console.error('[Import] Hash import failed')
  } finally {
    window.location.hash = ''
  }
}

PlannerService.applyTheme(PlannerService.getTheme())
window.addEventListener('load', processHashImport)

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
