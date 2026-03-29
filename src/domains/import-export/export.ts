import type { PlannerData } from '../planner/types'

export function downloadPlannerJSON(data: PlannerData, prefix = 'uai-planner'): void {
  const fileName = `${prefix}-${new Date().toISOString().slice(0, 10)}.json`
  const payload = JSON.stringify(data, null, 2)
  const blob = new Blob([payload], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}
