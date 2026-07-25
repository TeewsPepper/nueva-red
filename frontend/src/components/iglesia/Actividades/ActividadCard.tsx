import React from 'react'
import { Calendar, Clock, MapPin, Users, Edit2, Trash2, UserPlus, UserMinus, Target } from 'lucide-react'
import { BreakActivity } from '../../../types'
import { useAuth } from '../../../hooks/useAuth'
import './ActividadCard.css'

interface ActividadCardProps {
  actividad: BreakActivity
  canEdit?: boolean
  canDelete?: boolean
  canJoin?: boolean
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onJoin?: (id: string) => void
  onSalir?: (id: string) => void  // 👈 AÑADIR
}

export const ActividadCard: React.FC<ActividadCardProps> = ({
  actividad,
  canEdit = false,
  canDelete = false,
  canJoin = true,
  onEdit,
  onDelete,
  onJoin,
  onSalir  // 👈 RECIBIR
}) => {
  const { user } = useAuth()
  
  const yaUnido = actividad.participantes?.some(
    (participante) => {
      if (!user) return false
      if (typeof participante === 'string') {
        return participante === user._id
      }
      if (typeof participante === 'object' && participante !== null && '_id' in participante) {
        return participante._id === user._id
      }
      return false
    }
  )

  const formatFecha = (fecha: string) => {
    if (!fecha) return 'Sin fecha'
    if (fecha.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = fecha.split('-')
      return `${day}/${month}/${year}`
    }
    return fecha
  }

  return (
    <div className="actividad-card">
      <div className="actividad-header">
        <h3 className="actividad-titulo">{actividad.titulo}</h3>
        <div className="actividad-badge">
          <span className="badge">
            <Target size={12} />
            Actividad
          </span>
        </div>
      </div>

      <p className="actividad-descripcion">{actividad.descripcion}</p>

      <div className="actividad-info">
        <div className="info-item">
          <span className="info-label">
            <Calendar size={14} className="icon" />
            Fecha
          </span>
          <span className="info-value">{formatFecha(actividad.fecha)}</span>
        </div>
        <div className="info-item">
          <span className="info-label">
            <Clock size={14} className="icon" />
            Hora
          </span>
          <span className="info-value">{actividad.horaInicio} - {actividad.horaFin}</span>
        </div>
        <div className="info-item">
          <span className="info-label">
            <MapPin size={14} className="icon" />
            Ubicación
          </span>
          <span className="info-value">{actividad.ubicacion}</span>
        </div>
        <div className="info-item">
          <span className="info-label">
            <Users size={14} className="icon" />
            Participantes
          </span>
          <span className="info-value">{actividad.participantes?.length || 0}</span>
        </div>
        {actividad.maxParticipantes && actividad.maxParticipantes > 0 && (
          <div className="info-item">
            <span className="info-label">Máx.</span>
            <span className="info-value">{actividad.maxParticipantes}</span>
          </div>
        )}
      </div>

      <div className="actividad-footer">
        {canJoin && (
          <div className="actividad-buttons">
            {yaUnido ? (
              <button
                className="btn-salir"
                onClick={() => onSalir?.(actividad._id)}
              >
                <UserMinus size={16} />
                Salir
              </button>
            ) : (
              <button
                className="btn-unirse"
                onClick={() => onJoin?.(actividad._id)}
              >
                <UserPlus size={16} />
                Unirse
              </button>
            )}
          </div>
        )}

        {(canEdit || canDelete) && (
          <div className="actividad-actions">
            {canEdit && (
              <button
                className="btn-edit"
                onClick={() => onEdit?.(actividad._id)}
                title="Editar actividad"
              >
                <Edit2 size={16} />
              </button>
            )}
            {canDelete && (
              <button
                className="btn-delete"
                onClick={() => onDelete?.(actividad._id)}
                title="Eliminar actividad"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}