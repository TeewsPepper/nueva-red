import React from 'react'
import { CheckCircle, PlusCircle } from 'lucide-react'
import { TareaForm } from './TareaForm'
import { TareaItem } from './TareaItem'
import { Tarea } from '../../../types'
import { useAuth } from '../../../hooks/useAuth'

interface TareaListProps {
  tareas: Tarea[]
  loading: boolean
  canCreate: boolean
  showForm: boolean
  editData: Tarea | null
  onNew: () => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onCompletar: (id: string) => void
  onFormSuccess: () => void
  onFormCancel: () => void
}

export const TareaList: React.FC<TareaListProps> = ({
  tareas,
  loading,
  canCreate,
  showForm,
  editData,
  onNew,
  onEdit,
  onDelete,
  onCompletar,
  onFormSuccess,
  onFormCancel
}) => {
  const { user } = useAuth()
  const pendientes = tareas.filter((t) => !t.completada)

  // 👇 PERMISOS CALCULADOS POR TAREA
  const puedeEditar = (tarea: Tarea): boolean => {
    if (!user) return false
    if (user.role === 'pastor') return true
    const creadorId = typeof tarea.creadoPor === 'string' 
      ? tarea.creadoPor 
      : tarea.creadoPor?._id
    return creadorId === user._id
  }

  const puedeCompletar = (tarea: Tarea): boolean => {
    if (!user) return false
    if (user.role === 'pastor') return true
    const creadorId = typeof tarea.creadoPor === 'string' 
      ? tarea.creadoPor 
      : tarea.creadoPor?._id
    const asignadoId = typeof tarea.asignadoA === 'string' 
      ? tarea.asignadoA 
      : tarea.asignadoA?._id
    return creadorId === user._id || asignadoId === user._id
  }

  const puedeEliminar = (_tarea: Tarea): boolean => {
    if (!user) return false
    return user.role === 'pastor'
  }

  if (loading) {
    return <div className="loading-spinner">Cargando...</div>
  }

  return (
    <div>
      <div className="section-header">
        <h2>Tareas pendientes</h2>
        {canCreate && (
          <button className="btn-iglesia btn-primary-iglesia" onClick={onNew}>
            <PlusCircle size={18} />
            Nueva Tarea
          </button>
        )}
      </div>

      {showForm && (
        <TareaForm
          onSuccess={onFormSuccess}
          onCancel={onFormCancel}
          editData={editData}
        />
      )}

      {pendientes.length === 0 ? (
        <div className="empty-state">
          <CheckCircle size={48} className="empty-icon" />
          <p>No hay tareas pendientes</p>
          <p className="empty-sub">¡Todo completado!</p>
        </div>
      ) : (
        <div className="tareas-list">
          {pendientes.map((t) => (
            <TareaItem
              key={t._id}
              tarea={t}
              canCompletar={puedeCompletar(t)}
              canEdit={puedeEditar(t)}
              canDelete={puedeEliminar(t)}
              onCompletar={onCompletar}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}