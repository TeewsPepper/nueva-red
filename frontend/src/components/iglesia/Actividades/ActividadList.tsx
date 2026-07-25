import React from 'react'
import { Sparkles, PlusCircle } from 'lucide-react'
import { ActividadForm } from './ActividadForm'
import { ActividadCard } from './ActividadCard'
import { BreakActivity } from '../../../types'
import { useAuth } from '../../../hooks/useAuth'

interface ActividadListProps {
  actividades: BreakActivity[]
  loading: boolean
  canCreate: boolean
  canJoin: boolean
  showForm: boolean
  editData: BreakActivity | null
  onNew: () => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onJoin: (id: string) => void
  onSalir: (id: string) => void 
  onFormSuccess: () => void
  onFormCancel: () => void
}

export const ActividadList: React.FC<ActividadListProps> = ({
  actividades,
  loading,
  canCreate,
  canJoin,
  showForm,
  editData,
  onNew,
  onEdit,
  onDelete,
  onJoin,
  onSalir,  
  onFormSuccess,
  onFormCancel
}) => {
  const { user } = useAuth()

  const puedeEditar = (actividad: BreakActivity): boolean => {
    if (!user) return false
    if (user.role === 'pastor') return true
    const creadorId = typeof actividad.creadoPor === 'string' 
      ? actividad.creadoPor 
      : actividad.creadoPor?._id
    return creadorId === user._id && user.role === 'lider'
  }

  const puedeEliminar = (_actividad: BreakActivity): boolean => {
    if (!user) return false
    return user.role === 'pastor'
  }

  if (loading) {
    return <div className="loading-spinner">Cargando...</div>
  }

  return (
    <div>
      <div className="section-header">
        <h2>Recreación</h2>
        {canCreate && (
          <button className="btn-iglesia btn-primary-iglesia" onClick={onNew}>
            <PlusCircle size={18} />
            Nueva Actividad
          </button>
        )}
      </div>

      {showForm && (
        <ActividadForm
          onSuccess={onFormSuccess}
          onCancel={onFormCancel}
          editData={editData}
        />
      )}

      {actividades.length === 0 ? (
        <div className="empty-state">
          <Sparkles size={48} className="empty-icon" />
          <p>No hay actividades</p>
          <p className="empty-sub">Crea una actividad social para tu iglesia</p>
        </div>
      ) : (
        <div className="cards-grid">
          {actividades.map((a) => (
            <ActividadCard
              key={a._id}
              actividad={a}
              canEdit={puedeEditar(a)}
              canDelete={puedeEliminar(a)}
              canJoin={canJoin}
              onEdit={onEdit}
              onDelete={onDelete}
              onJoin={onJoin}
              onSalir={onSalir}  
            />
          ))}
        </div>
      )}
    </div>
  )
}