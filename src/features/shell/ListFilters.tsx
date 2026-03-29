import { useMemo } from 'react'
import { usePlannerStore } from '../../store/usePlannerStore'
import { useUIStore } from '../../store/useUIStore'
import styles from './ListFilters.module.css'

export function ListFilters() {
  const materias = usePlannerStore((state) => state.data.materias)
  const tipos = usePlannerStore((state) => state.data.tipos)
  const listFilters = useUIStore((state) => state.listFilters)
  const listMateriaChanged = useUIStore((state) => state.listMateriaChanged)
  const listTipoChanged = useUIStore((state) => state.listTipoChanged)
  const listAlertaChanged = useUIStore((state) => state.listAlertaChanged)

  const materiaOptions = useMemo(
    () => [{ id: '__all__', nombre: 'Todas las materias' }, ...materias.map((m) => ({ id: m.id, nombre: m.nombre }))],
    [materias],
  )

  const tipoOptions = useMemo(
    () => [{ id: '__all__', label: 'Todos los tipos' }, ...tipos.map((t) => ({ id: t.id, label: t.label }))],
    [tipos],
  )

  return (
    <div className={styles.filters}>
      <label className={styles.control}>
        <span>Materia</span>
        <select
          value={listFilters.materiaId ?? '__all__'}
          onChange={(event) => listMateriaChanged(event.target.value === '__all__' ? undefined : event.target.value)}
        >
          {materiaOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.nombre}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.control}>
        <span>Tipo</span>
        <select
          value={listFilters.tipoId ?? '__all__'}
          onChange={(event) => listTipoChanged(event.target.value === '__all__' ? undefined : event.target.value)}
        >
          {tipoOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.control}>
        <span>Alerta</span>
        <select
          value={listFilters.alerta ?? '__all__'}
          onChange={(event) => listAlertaChanged(event.target.value === '__all__' ? undefined : event.target.value)}
        >
          <option value="__all__">Todas</option>
          <option value="start_overdue">Vencidas</option>
          <option value="start_now">Hoy</option>
          <option value="start_soon">Próximas</option>
          <option value="yellow">Advertencia</option>
          <option value="green">Normal</option>
        </select>
      </label>
    </div>
  )
}
