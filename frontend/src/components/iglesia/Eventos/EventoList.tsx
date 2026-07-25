import React from 'react'
import { Calendar, PlusCircle } from 'lucide-react'
import { EventoCard } from './EventoCard'
import { EventoForm } from './EventoForm'
import { Evento } from '../../../types'

interface EventoListProps {
  eventos: Evento[]
  loading: boolean
  canCreate: boolean
  canEdit: (evento: Evento) => boolean
  canDelete: boolean
  showForm: boolean
  editData: Evento | null
  onNew: () => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onFormSuccess: () => void
  onFormCancel: () => void
}

export const EventoList: React.FC<EventoListProps> = ({
  eventos,
  loading,
  canCreate,
  canEdit,
  canDelete,
  showForm,
  editData,
  onNew,
  onEdit,
  onDelete,
  onFormSuccess,
  onFormCancel
}) => {
  if (loading) {
    return <div className="loading-spinner">Cargando...</div>
  }

  return (
    <div>
      {canCreate && (
        <div className="section-header">
          <h2>Eventos</h2>
          <button className="btn-iglesia btn-primary-iglesia" onClick={onNew}>
            <PlusCircle size={18} />
            Nuevo Evento
          </button>
        </div>
      )}

      {showForm && (
        <EventoForm
          onSuccess={onFormSuccess}
          onCancel={onFormCancel}
          editData={editData}
        />
      )}

      {eventos.length === 0 ? (
        <div className="empty-state">
          <Calendar size={48} className="empty-icon" />
          <p>No hay eventos</p>
          {canCreate ? (
            <p className="empty-sub">Crea tu primer evento con el botón de arriba</p>
          ) : (
            <p className="empty-sub">Los eventos serán creados por pastores y líderes</p>
          )}
        </div>
      ) : (
        <div className="cards-grid">
          {eventos.map((e) => (
            <EventoCard
              key={e._id}
              evento={e}
              canEdit={canEdit(e)}
              canDelete={canDelete}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}