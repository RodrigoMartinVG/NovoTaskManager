import { useMemo, useState } from 'react'
import { usePlannerStore } from '../../store/usePlannerStore'
import { useUIStore } from '../../store/useUIStore'
import { TimeInputField } from '../../shared/components/TimeInputField'
import { Modal } from '../../shared/components/Modal'
import styles from './ManualSessionModal.module.css'

function toDateInputValue(date: Date): string {
  const y = date.getFullYear()
  const m = `${date.getMonth() + 1}`.padStart(2, '0')
  const d = `${date.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${d}`
}

function toQuarterTime(date: Date): string {
  const hh = `${date.getHours()}`.padStart(2, '0')
  const quarter = Math.floor(date.getMinutes() / 15) * 15
  const mm = `${quarter}`.padStart(2, '0')
  return `${hh}:${mm}`
}

export function ManualSessionModal() {
  const data = usePlannerStore((state) => state.data)
  const sesionAgregada = usePlannerStore((state) => state.sesionAgregada)
  const sesionAgregadaConTarea = usePlannerStore((state) => state.sesionAgregadaConTarea)

  const manualSessionMateriaId = useUIStore((state) => state.manualSessionMateriaId)
  const manualSessionClosed = useUIStore((state) => state.manualSessionClosed)

  const [materiaId, setMateriaId] = useState(manualSessionMateriaId ?? data.materias[0]?.id ?? '')
  const [tareaId, setTareaId] = useState<string>('')
  const [fecha, setFecha] = useState(toDateInputValue(new Date()))
  const [hora, setHora] = useState<string | null>(toQuarterTime(new Date()))
  const [duracion, setDuracion] = useState(45)
  const [titulo, setTitulo] = useState('')
  const [crearTareaRapida, setCrearTareaRapida] = useState(false)
  const [tituloTareaRapida, setTituloTareaRapida] = useState('')
  const [error, setError] = useState<string | null>(null)

  const materia = useMemo(
    () => data.materias.find((item) => item.id === materiaId) ?? null,
    [data.materias, materiaId],
  )

  const tareasDisponibles = useMemo(() => {
    if (!materiaId) {
      return []
    }
    return data.tareas.filter((task) => task.materiaId === materiaId && task.estado !== 'completado')
  }, [data.tareas, materiaId])

  if (!manualSessionMateriaId) {
    return null
  }

  function handleSave() {
    if (!materiaId) {
      setError('Elegi una materia.')
      return
    }

    if (!hora) {
      setError('Elegi hora de inicio.')
      return
    }

    if (duracion < 1) {
      setError('La duracion debe ser de al menos 1 minuto.')
      return
    }

    const inicio = `${fecha}T${hora}:00`
    const sessionTitle = titulo.trim() || `Sesion manual · ${materia?.nombre ?? 'Materia'}`

    if (crearTareaRapida) {
      if (!tituloTareaRapida.trim()) {
        setError('Escribi un titulo para la tarea rapida.')
        return
      }

      const defaultTipo = data.tipos[0]?.id ?? 'tp'
      sesionAgregadaConTarea(
        {
          materiaId,
          tareaId: null,
          inicio,
          minutos: duracion,
          origen: 'manual',
          titulo: sessionTitle,
          nota: '',
        },
        {
          titulo: tituloTareaRapida.trim(),
          descripcion: '',
          materiaId,
          tipo: defaultTipo,
          fechaLimite: null,
          fechaInicio: null,
          hora: null,
          estado: 'pendiente',
          prioridad: 'media',
          obligatorio: false,
          items: [],
          link_vc: null,
        },
      )
      manualSessionClosed()
      return
    }

    sesionAgregada({
      materiaId,
      tareaId: tareaId || null,
      inicio,
      minutos: duracion,
      origen: 'manual',
      titulo: sessionTitle,
      nota: '',
    })
    manualSessionClosed()
  }

  return (
    <Modal title="Cargar sesion manual" onClose={manualSessionClosed} maxWidth={700}>
      <div className={styles.wrapper}>
        <div className={styles.grid}>
          <label className={styles.field}>
            <span>Materia</span>
            <select value={materiaId} onChange={(event) => setMateriaId(event.target.value)}>
              {data.materias.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nombre}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span>Tarea asociada (opcional)</span>
            <select
              value={tareaId}
              onChange={(event) => setTareaId(event.target.value)}
              disabled={crearTareaRapida}
            >
              <option value="">Sesion libre</option>
              {tareasDisponibles.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.titulo}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span>Fecha</span>
            <input type="date" value={fecha} onChange={(event) => setFecha(event.target.value)} />
          </label>

          <label className={styles.field}>
            <span>Hora de inicio</span>
            <TimeInputField value={hora} onChange={setHora} />
          </label>

          <label className={styles.field}>
            <span>Duracion (minutos)</span>
            <input
              type="number"
              min={1}
              value={duracion}
              onChange={(event) => setDuracion(Math.max(1, Number(event.target.value || 1)))}
            />
          </label>

          <label className={styles.field}>
            <span>Titulo/nota (opcional)</span>
            <input
              type="text"
              value={titulo}
              onChange={(event) => setTitulo(event.target.value)}
              placeholder="Ej: repaso de ejercicios"
            />
          </label>
        </div>

        <label className={styles.toggleRow}>
          <input
            type="checkbox"
            checked={crearTareaRapida}
            onChange={(event) => setCrearTareaRapida(event.target.checked)}
          />
          <span>Crear tarea rapida al guardar</span>
        </label>

        {crearTareaRapida && (
          <label className={styles.field}>
            <span>Titulo de tarea rapida</span>
            <input
              type="text"
              value={tituloTareaRapida}
              onChange={(event) => setTituloTareaRapida(event.target.value)}
              placeholder="Ej: completar ejercicios de guia"
            />
          </label>
        )}

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <button type="button" className={styles.cancel} onClick={manualSessionClosed}>
            Cancelar
          </button>
          <button type="button" className={styles.save} onClick={handleSave}>
            Guardar sesion
          </button>
        </div>
      </div>
    </Modal>
  )
}
