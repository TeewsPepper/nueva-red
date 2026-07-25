import React from 'react'
import { Check, Trash2, Edit2, User, Calendar } from 'lucide-react'
import { Tarea } from '../../../types'
import './TareaItem.css'

interface TareaItemProps {
  tarea: Tarea
  canCompletar?: boolean
  canEdit?: boolean
  canDelete?: boolean
  onCompletar?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export const TareaItem: React.FC<TareaItemProps> = ({
  tarea,
  canCompletar = false,
  canEdit = false,
  canDelete = false,
  onCompletar,
  onEdit,
  onDelete
}) => {
  const getPrioridadLabel = () => {
    switch (tarea.prioridad) {
      case 'alta': return '🔴 Alta'
      case 'media': return '🟡 Media'
      case 'baja': return '🟢 Baja'
      default: return tarea.prioridad
    }
  }

  const getAsignadoNombre = () => {
    if (typeof tarea.asignadoA === 'object') {
      return tarea.asignadoA.name
    }
    return 'Sin asignar'
  }

  const formatFecha = (fecha: string | Date) => {
  if (!fecha) return 'Sin fecha'
  
  // Si es un objeto Date, convertirlo
  if (fecha instanceof Date) {
    const year = fecha.getFullYear()
    const month = String(fecha.getMonth() + 1).padStart(2, '0')
    const day = String(fecha.getDate()).padStart(2, '0')
    return `${day}/${month}/${year}`
  }
  
  // Si es "YYYY-MM-DD", convertir a "DD/MM/YYYY"
  if (typeof fecha === 'string' && fecha.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = fecha.split('-')
    return `${day}/${month}/${year}`
  }
  
  // Si es un string ISO, convertirlo
  if (typeof fecha === 'string') {
    try {
      const date = new Date(fecha)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${day}/${month}/${year}`
    } catch {
      return fecha
    }
  }
  
  return String(fecha)
}

  return (
    <div className={`tarea-item ${tarea.completada ? 'completada' : ''}`}>
      <div className="tarea-main">
        <div className="tarea-info">
          <span className="tarea-titulo">{tarea.titulo}</span>
          <span className={`tarea-prioridad prioridad-${tarea.prioridad}`}>
            {getPrioridadLabel()}
          </span>
        </div>
        
        <div className="tarea-detalles">
          <span className="tarea-fecha">
            <Calendar size={14} className="icon" />
            {formatFecha(tarea.fechaEntrega)}
          </span>
          <span className="tarea-asignado">
            <User size={14} className="icon" />
            {getAsignadoNombre()}
          </span>
        </div>
      </div>

      <div className="tarea-actions">
        {canCompletar && !tarea.completada && (
          <button 
            className="btn-completar" 
            onClick={() => onCompletar?.(tarea._id)}
            title="Completar tarea"
          >
            <Check size={16} />
          </button>
        )}
        {canEdit && (
          <button 
            className="btn-edit" 
            onClick={() => onEdit?.(tarea._id)}
            title="Editar tarea"
          >
            <Edit2 size={16} />
          </button>
        )}
        {canDelete && (
          <button 
            className="btn-delete" 
            onClick={() => onDelete?.(tarea._id)}
            title="Eliminar tarea"
          >
            <Trash2 size={16} />
          </button>
        )}
        {tarea.completada && (
          <span className="tarea-completada-badge">
            <Check size={14} />
            Completada
          </span>
        )}
      </div>
    </div>
  )
}