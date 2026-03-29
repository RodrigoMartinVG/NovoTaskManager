import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { PlannerService } from './domains/planner/service'
import './styles/reset.css'
import './styles/tokens.css'
import './styles/themes.css'
import './styles/base.css'

PlannerService.applyTheme(PlannerService.getTheme())

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
