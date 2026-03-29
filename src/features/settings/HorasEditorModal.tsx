import { useMemo } from 'react'
import { usePlannerStore } from '../../store/usePlannerStore'
import { useUIStore } from '../../store/useUIStore'
import { HorasEditor } from '../../shared/components/HorasEditor'
import { Modal } from '../../shared/components/Modal'

export function HorasEditorModal() {
  const data = usePlannerStore((state) => state.data)
  const materiaHorasCambiadas = usePlannerStore((state) => state.materiaHorasCambiadas)

  const editObjetivoMateriaId = useUIStore((state) => state.editObjetivoMateriaId)
  const objetivoEditClosed = useUIStore((state) => state.objetivoEditClosed)

  const materia = useMemo(() => {
    if (!editObjetivoMateriaId) {
      return null
    }
    return data.materias.find((item) => item.id === editObjetivoMateriaId) ?? null
  }, [data.materias, editObjetivoMateriaId])

  if (!editObjetivoMateriaId || !materia) {
    return null
  }

  return (
    <Modal title={`Objetivos de ${materia.nombre}`} onClose={objetivoEditClosed} maxWidth={760}>
      <HorasEditor
        horasMin={materia.horasMin}
        horasMax={materia.horasMax}
        slots={materia.slots}
        onCancel={objetivoEditClosed}
        onSave={({ horasMin, horasMax, slots }) => {
          materiaHorasCambiadas(materia.id, horasMin, horasMax, slots)
          objetivoEditClosed()
        }}
      />
    </Modal>
  )
}
