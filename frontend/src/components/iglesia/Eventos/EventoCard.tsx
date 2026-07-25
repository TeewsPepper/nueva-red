import React, { useState } from 'react'
import { Calendar, Clock, MapPin, Edit2, Trash2, Tag } from 'lucide-react'
import { Evento } from '../../../types'
import './EventoCard.css'

interface Props {
  evento: Evento
  canEdit?: boolean
  canDelete?: boolean
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export const EventoCard: React.FC<Props> = ({ 
  evento, 
  canEdit = false, 
  canDelete = false,
  onEdit,
  onDelete
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const getMinisterioNombre = () => {
    if (evento.ministerioId && typeof evento.ministerioId === 'object') {
      return evento.ministerioId.nombre
    }
    return 'Sin ministerio'
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit(evento._id)
    }
  }

  const handleDelete = () => {
    if (onDelete && confirm(`¿Estás seguro de eliminar el evento "${evento.titulo}"?`)) {
      onDelete(evento._id)
    }
  }

  const getTipoClass = () => {
    return 'evento-otro'
  }

  // 👇 Formatear fecha sin problemas de zona horaria (solo formato visual)
  const formatFecha = (fecha: string) => {
    if (!fecha) return 'Sin fecha'
    // Si es "YYYY-MM-DD", convertir a "DD/MM/YYYY"
    if (fecha.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = fecha.split('-')
      return `${day}/${month}/${year}`
    }
    // Si ya está en otro formato, devolverlo tal cual
    return fecha
  }

  return (
    <div className={`evento-card ${getTipoClass()}`} onClick={() => setIsExpanded(!isExpanded)}>
      <div className="evento-header">
        <h3 className="evento-titulo">{evento.titulo}</h3>
        <div className="evento-badge">
          <span className="badge">
            <Calendar size={12} />
            Evento
          </span>
        </div>
      </div>

      <p className="evento-descripcion">
        {isExpanded ? evento.descripcion : `${evento.descripcion.substring(0, 100)}...`}
      </p>

      <div className="evento-info">
        <div className="info-item">
          <span className="info-label">
            <Calendar size={12} className="icon" />
            Fecha
          </span>
          <span className="info-value">
            {formatFecha(evento.fecha)}  {/* 👈 Mostrar fecha formateada */}
          </span>
        </div>
        <div className="info-item">
          <span className="info-label">
            <Clock size={12} className="icon" />
            Hora
          </span>
          <span className="info-value">{evento.horaInicio} - {evento.horaFin}</span>
        </div>
        <div className="info-item">
          <span className="info-label">
            <MapPin size={12} className="icon" />
            Ubicación
          </span>
          <span className="info-value">{evento.ubicacion}</span>
        </div>
        {evento.ministerioId && (
          <div className="info-item">
            <span className="info-label">
              <Tag size={12} className="icon" />
              Ministerio
            </span>
            <span className="info-value">{getMinisterioNombre()}</span>
          </div>
        )}
      </div>

      {(canEdit || canDelete) && (
        <div className="evento-actions">
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