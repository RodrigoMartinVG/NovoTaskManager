import { useState } from 'react'
import { Modal } from '../../shared/components/Modal'
import { TimeInputField } from '../../shared/components/TimeInputField'
import { usePlannerStore } from '../../store/usePlannerStore'
import { useUIStore } from '../../store/useUIStore'
import type { ChecklistItem, Prioridad, Tarea, TareaEstado } from '../../domains/planner/types'
import styles from './FormModal.module.css'

function generateItemId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `item_${crypto.randomUUID()}`
  }
  return `item_${Math.random().toString(36).slice(2, 10)}`
}

export function FormModal() {
  const data = usePlannerStore((state) => state.data)
  const tareaAdded = usePlannerStore((state) => state.tareaAdded)
  const tareaUpdated = usePlannerStore((state) => state.tareaUpdated)

  const editingTask = useUIStore((state) => state.editingTask)
  const taskEditClosed = useUIStore((state) => state.taskEditClosed)
  const taskSelected = useUIStore((state) => state.taskSelected)

  const isNew = !editingTask?.id

  // --- form state ---
  const [titulo, setTitulo] = useState(editingTask?.titulo ?? '')
  const [materiaId, setMateriaId] = useState(editingTask?.materiaId ?? (data.materias[0]?.id ?? ''))
  const [tipo, setTipo] = useState(editingTask?.tipo ?? (data.tipos[0]?.id ?? ''))
  const [estado, setEstado] = useState<TareaEstado>(editingTask?.estado ?? 'pendiente')
  const [prioridad, setPrioridad] = useState<Prioridad>(editingTask?.prioridad ?? 'media')
  const [fechaLimite, setFechaLimite] = useState(editingTask?.fechaLimite ?? '')
  const [fechaInicio, setFechaInicio] = useState(editingTask?.fechaInicio ?? '')
  const [hora, setHora] = useState<string | null>(editingTask?.hora ?? null)
  const [obligatorio, setObligatorio] = useState(editingTask?.obligatorio ?? false)
  const [descripcion, setDescripcion] = useState(editingTask?.descripcion ?? '')
  const [linkVc, setLinkVc] = useState(editingTask?.link_vc ?? '')
  const [items, setItems] = useState<ChecklistItem[]>(editingTask?.items ?? [])

  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate(): boolean {
    const next: Record<string, string> = {}
    if (!titulo.trim()) {
      next.titulo = 'El título es obligatorio.'
    }
    if (fechaInicio && fechaLimite && fechaInicio > fechaLimite) {
      next.fechaInicio = 'La fecha de inicio no puede ser posterior a la fecha límite.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSave() {
    if (!validate()) return

    const cleanItems = items.filter((item) => item.label.trim() !== '')
    const payload = {
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      materiaId,
      tipo,
      estado,
      prioridad,
      fechaLimite: fechaLimite || null,
      fechaInicio: fechaInicio || null,
      hora,
      obligatorio,
      items: cleanItems,
      link_vc: linkVc.trim() || null,
    }

    if (isNew) {
      tareaAdded(payload)
      taskEditClosed()
    } else {
        tareaUpdated({ ...(editingTask as Tarea), ...payload })
      taskEditClosed()
        taskSelected(editingTask!.id!)
    }
  }

  function addChecklistItem() {
    setItems((prev) => [...prev, { id: generateItemId(), label: '', done: false }])
  }

  function updateItemLabel(id: string, label: string) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, label } : item)))
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const title = isNew ? 'Nueva tarea' : 'Editar tarea'

  return (
    <Modal title={title} onClose={taskEditClosed} maxWidth={560}>
      <form
        className={styles.form}
        onSubmit={(event) => {
          event.preventDefault()
          handleSave()
        }}
      >
        {/* Título */}
        <div className={styles.field}>
          <label htmlFor="fm-titulo" className={styles.label}>Título *</label>
          <input
            id="fm-titulo"
            type="text"
            className={`${styles.input} ${errors.titulo ? styles.inputError : ''}`}
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            autoFocus
            placeholder="Ej: Entregar TP final"
          />
          {errors.titulo && <span className={styles.errorMsg}>{errors.titulo}</span>}
        </div>

        {/* Materia */}
        <div className={styles.field}>
          <label htmlFor="fm-materia" className={styles.label}>Materia</label>
          <select
            id="fm-materia"
            className={styles.select}
            value={materiaId}
            onChange={(e) => setMateriaId(e.target.value)}
          >
            {data.materias.map((m) => (
              <option key={m.id} value={m.id}>{m.nombre}</option>
            ))}
          </select>
        </div>

        {/* Tipo */}
        <div className={styles.field}>
          <label htmlFor="fm-tipo" className={styles.label}>Tipo</label>
          <select
            id="fm-tipo"
            className={styles.select}
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
          >
            {data.tipos.map((t) => (
              <option key={t.id} value={t.id}>{`${t.icon} ${t.label}`}</option>
            ))}
          </select>
        </div>

        {/* Estado + Prioridad */}
        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="fm-estado" className={styles.label}>Estado</label>
            <select
              id="fm-estado"
              className={styles.select}
              value={estado}
              onChange={(e) => setEstado(e.target.value as TareaEstado)}
            >
              <option value="pendiente">Pendiente</option>
              <option value="en_progreso">En progreso</option>
              <option value="completado">Completado</option>
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="fm-prioridad" className={styles.label}>Prioridad</label>
            <select
              id="fm-prioridad"
              className={styles.select}
              value={prioridad}
              onChange={(e) => setPrioridad(e.target.value as Prioridad)}
            >
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </div>
        </div>

        {/* Fechas */}
        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="fm-inicio" className={styles.label}>Fecha inicio</label>
            <input
              id="fm-inicio"
              type="date"
              className={`${styles.input} ${errors.fechaInicio ? styles.inputError : ''}`}
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
            {errors.fechaInicio && <span className={styles.errorMsg}>{errors.fechaInicio}</span>}
          </div>

          <div className={styles.field}>
            <label htmlFor="fm-limite" className={styles.label}>Fecha límite</label>
            <input
              id="fm-limite"
              type="date"
              className={styles.input}
              value={fechaLimite}
              onChange={(e) => setFechaLimite(e.target.value)}
            />
          </div>
        </div>

        {/* Hora */}
        <div className={styles.field}>
          <label htmlFor="fm-hora" className={styles.label}>Hora</label>
          <TimeInputField id="fm-hora" value={hora} onChange={setHora} />
        </div>

        {/* Obligatorio */}
        <div className={styles.checkboxField}>
          <input
            id="fm-obligatorio"
            type="checkbox"
            className={styles.checkbox}
            checked={obligatorio}
            onChange={(e) => setObligatorio(e.target.checked)}
          />
          <label htmlFor="fm-obligatorio" className={styles.checkboxLabel}>Obligatorio</label>
        </div>

        {/* Descripción */}
        <div className={styles.field}>
          <label htmlFor="fm-descripcion" className={styles.label}>Descripción</label>
          <textarea
            id="fm-descripcion"
            className={styles.textarea}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={3}
            placeholder="Descripción opcional..."
          />
        </div>

        {/* Link videollamada */}
        <div className={styles.field}>
          <label htmlFor="fm-link" className={styles.label}>Link videollamada</label>
          <input
            id="fm-link"
            type="url"
            className={styles.input}
            value={linkVc}
            onChange={(e) => setLinkVc(e.target.value)}
            placeholder="https://..."
          />
        </div>

        {/* Checklist */}
        <div className={styles.field}>
          <span className={styles.label}>Checklist</span>
          <ul className={styles.checklistList}>
            {items.map((item) => (
              <li key={item.id} className={styles.checklistItem}>
                <input
                  type="text"
                  className={styles.checklistInput}
                  value={item.label}
                  onChange={(e) => updateItemLabel(item.id, e.target.value)}
                  placeholder="Ítem..."
                />
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => removeItem(item.id)}
                  aria-label="Eliminar ítem"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
          <button type="button" className={styles.addItemBtn} onClick={addChecklistItem}>
            + Agregar ítem
          </button>
        </div>

        {/* Footer */}
        <footer className={styles.footer}>
          <button type="button" className={styles.cancelBtn} onClick={taskEditClosed}>
            Cancelar
          </button>
          <button type="submit" className={styles.saveBtn}>
            {isNew ? 'Crear tarea' : 'Guardar cambios'}
          </button>
        </footer>
      </form>
    </Modal>
  )
}
