import React, { useState } from 'react'
import { Users, User, Calendar, Edit2, Trash2, Clock, MapPin } from 'lucide-react'
import { Ministerio } from '../../../types'
import './MinisterioCard.css'

interface Props {
  ministerio: Ministerio
  canEdit?: boolean
  canDelete?: boolean
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export const MinisterioCard: React.FC<Props> = ({ 
  ministerio, 
  canEdit = false, 
  canDelete = false,
  onEdit,
  onDelete
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const getLiderName = () => {
    if (typeof ministerio.liderId === 'object') {
      return ministerio.liderId.name
    }
    return 'Cargando...'
  }

  const getMiembrosCount = () => {
    if (Array.isArray(ministerio.miembros)) {
      return ministerio.miembros.length
    }
    return 0
  }

  const getHorarioDisplay = () => {
    if (ministerio.horarios && ministerio.horarios.length > 0) {
      const h = ministerio.horarios[0]
      return `${h.dia} ${h.horaInicio} - ${h.horaFin}`
    }
    return 'Horario no definido'
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit(ministerio._id)
    }
  }

  const handleDelete = () => {
    if (onDelete && confirm(`¿Estás seguro de eliminar el ministerio "${ministerio.nombre}"?`)) {
      onDelete(ministerio._id)
    }
  }

  return (
    <div className="ministerio-card" onClick={() => setIsExpanded(!isExpanded)}>
      <div className="ministerio-header">
        <h3 className="ministerio-nombre">{ministerio.nombre}</h3>
        <div className="ministerio-badge">
          <span className="badge">
            <Users size={12} />
            Ministerio
          </span>
        </div>
      </div>

      <p className="ministerio-descripcion">
        {isExpanded ? ministerio.descripcion : `${ministerio.descripcion.substring(0, 100)}...`}
      </p>

      <div className="ministerio-info">
        <div className="info-item">
          <span className="info-label">
            <User size={12} className="icon" />
            Líder
          </span>
          <span className="info-value">{getLiderName()}</span>
        </div>
        <div className="info-item">
          <span className="info-label">
            <Users size={12} className="icon" />
            Miembros
          </span>
          <span className="info-value">{getMiembrosCount()}</span>
        </div>
        <div className="info-item">
          <span className="info-label">
            <Clock size={12} className="icon" />
            Horario
          </span>
          <span className="info-value">{getHorarioDisplay()}</span>
        </div>
        {ministerio.ubicacion && (
          <div className="info-item">
            <span className="info-label">
              <MapPin size={12} className="icon" />
              Ubicación
            </span>
            <span className="info-value">{ministerio.ubicacion}</span>
          </div>
        )}
        <div className="info-item">
          <span className="info-label">
            <Calendar size={12} className="icon" />
            Creado
          </span>
          <span className="info-value">
            {new Date(ministerio.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {(canEdit || canDelete) && (
        <div className="ministerio-actions">
          {canEdit && (
            <button 
              className="btn-edit" 
              onClick={(e) => {
                e.stopPropagation()
                handleEdit()
              }}
            >
              <Edit2 size={14} />
              Editar
            </button>
          )}
          {canDelete && (
            <button 
              className="btn-delete" 
              onClick={(e) => {
                e.stopPropagation()
                handleDelete()
              }}
            >
              <Trash2 size={14} />
              Eliminar
            </button>
          )}
        </div>
      )}
    </div>
  )
}