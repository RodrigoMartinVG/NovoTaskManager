import { useMemo, useState } from 'react'
import type { Sesion, Tarea } from '../../../domains/planner/types'
import styles from './MateriaSessionList.module.css'

interface MateriaSessionListProps {
  sesiones: Sesion[]
  tareas: Tarea[]
  onUpdateSesion: (id: string, patch: Partial<Sesion>) => void
  onDeleteSesion: (id: string, title: string) => void
}

interface EditState {
  titulo: string
  minutos: number
  tareaId: string
}

function formatSessionDate(inicio: string): string {
  const date = new Date(inicio)
  if (Number.isNaN(date.getTime())) {
    return inicio
  }
  return date.toLocaleString('es-AR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function MateriaSessionList({ sesiones, tareas, onUpdateSesion, onDeleteSesion }: MateriaSessionListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<EditState>({ titulo: '', minutos: 0, tareaId: '' })

  const ordered = useMemo(
    () => [...sesiones].sort((a, b) => new Date(b.inicio).getTime() - new Date(a.inicio).getTime()),
    [sesiones],
  )

  function startEdit(sesion: Sesion) {
    setEditingId(sesion.id)
    setDraft({
      titulo: sesion.titulo,
      minutos: sesion.minutos,
      tareaId: sesion.tareaId ?? '',
    })
  }

  function cancelEdit() {
    setEditingId(null)
  }

  function saveEdit(id: string) {
    onUpdateSesion(id, {
      titulo: draft.titulo.trim() || 'Sesion de estudio',
      minutos: Math.max(1, draft.minutos),
      tareaId: draft.tareaId || null,
    })
    setEditingId(null)
  }

  return (
    <div className={styles.wrap}>
      <h4 className={styles.title}>Sesiones</h4>
      {ordered.length === 0 ? (
        <p className={styles.empty}>Todavia no hay sesiones registradas.</p>
      ) : (
        <ul className={styles.list}>
          {ordered.map((sesion) => {
            const editing = editingId === sesion.id
            return (
              <li key={sesion.id} className={styles.item}>
                {editing ? (
                  <>
                    <input
                      className={styles.input}
                      value={draft.titulo}
                      onChange={(e) => setDraft((prev) => ({ ...prev, titulo: e.target.value }))}
                      placeholder="Titulo"
                    />
                    <div className={styles.inlineFields}>
                      <input
                        className={styles.input}
                        type="number"
                        min={1}
                        value={draft.minutos}
                        onChange={(e) => setDraft((prev) => ({ ...prev, minutos: Number(e.target.value || 1) }))}
                      />
                      <select
                        className={styles.select}
                        value={draft.tareaId}
                        onChange={(e) => setDraft((prev) => ({ ...prev, tareaId: e.target.value }))}
                      >
                        <option value="">Sin tarea</option>
                        {tareas.map((tarea) => (
                          <option key={tarea.id} value={tarea.id}>
                            {tarea.titulo}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.actions}>
                      <button type="button" className={styles.secondary} onClick={cancelEdit}>
                        Cancelar
                      </button>
                      <button type="button" className={styles.primary} onClick={() => saveEdit(sesion.id)}>
                        Guardar
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={styles.rowTop}>
                      <span className={styles.date}>{formatSessionDate(sesion.inicio)}</span>
                      <span className={styles.minutes}>{`${sesion.minutos} min`}</span>
                    </div>
                    <div className={styles.rowBody}>
                      <strong>{sesion.titulo}</strong>
                      {sesion.tareaId && <small>{tareas.find((t) => t.id === sesion.tareaId)?.titulo ?? 'Tarea eliminada'}</small>}
                    </div>
                    <div className={styles.actions}>
                      <button type="button" className={styles.secondary} onClick={() => startEdit(sesion)}>
                        Editar
                      </button>
                      <button
                        type="button"
                        className={styles.danger}
                        onClick={() => onDeleteSesion(sesion.id, sesion.titulo)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
