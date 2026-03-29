import { useState } from 'react'
import styles from './SchemaHint.module.css'

const SCHEMA_SAMPLE = `[
  {
    "id": "tmp_1",
    "titulo": "Resolver guia 4",
    "descripcion": "Opcional",
    "materiaId": "mat_am2",
    "tipo": "tp",
    "fechaLimite": "2026-04-05",
    "fechaInicio": "2026-04-01",
    "hora": "19:30",
    "estado": "pendiente",
    "prioridad": "media",
    "obligatorio": false,
    "items": [
      { "id": "i1", "label": "Punto 1", "done": false }
    ],
    "link_vc": "https://meet.google.com/..."
  }
]`

export function SchemaHint() {
  const [open, setOpen] = useState(false)

  return (
    <div className={styles.hint}>
      <button type="button" className={styles.toggle} onClick={() => setOpen((prev) => !prev)}>
        {open ? '▲ Formato JSON del importador' : '▼ Formato JSON del importador'}
      </button>
      {open && <pre className={styles.pre}>{SCHEMA_SAMPLE}</pre>}
    </div>
  )
}
