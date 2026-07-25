import React, { useState, useEffect } from 'react'
import { useEventos } from '../../../hooks/useEventos'
import { X, Plus } from 'lucide-react'
import { Evento } from '../../../types'
import './EventoForm.css'

interface EventoFormProps {
  onSuccess?: () => void
  onCancel?: () => void
  editData?: Evento | null  
}

export const EventoForm: React.FC<EventoFormProps> = ({ 
  onSuccess, 
  onCancel,
  editData  
}) => {
  const { crearEvento, actualizarEvento } = useEventos()
  const isEditing = !!editData
  
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [fecha, setFecha] = useState('')
  const [horaInicio, setHoraInicio] = useState('10:00')
  const [horaFin, setHoraFin] = useState('12:00')
  const [ubicacion, setUbicacion] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Cargar datos para editar
  useEffect(() => {
    if (editData) {
      setTitulo(editData.titulo || '')
      setDescripcion(editData.descripcion || '')
      // 👈 La fecha ya es string, usarla directamente
      setFecha(editData.fecha || '')
      setHoraInicio(editData.horaInicio || '10:00')
      setHoraFin(editData.horaFin || '12:00')
      setUbicacion(editData.ubicacion || '')
    }
  }, [editData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!titulo.trim()) {
      setError('El título del evento es requerido')
      return
    }
    
    if (!fecha) {
      setError('La fecha del evento es requerida')
      return
    }

    setLoading(true)

    try {
      const data = {
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || 'Sin descripción',
        fecha: fecha,  // 👈 Enviar "YYYY-MM-DD" directamente
        horaInicio,
        horaFin,
        ubicacion: ubicacion.trim() || 'Sin ubicación'
      }

      if (isEditing && editData) {
        await actualizarEvento(editData._id, data)
      } else {
        await crearEvento(data)
      }

      setTitulo('')
      setDescripcion('')
      setFecha('')
      setHoraInicio('10:00')
      setHoraFin('12:00')
      setUbicacion('')
      
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Error al ${isEditing ? 'actualizar' : 'crear'} evento`)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    }
  }

  return (
    <div className="evento-form-wrapper">
      {error && (
        <div className="evento-form-error">
          {error}
        </div>
      )}

      <form className="evento-form" onSubmit={handleSubmit}>
        <div className="evento-form-header">
          <h4>{isEditing ? 'Editar Evento' : 'Crear Nuevo Evento'}</h4>
          <button 
            type="button" 
            className="evento-form-close"
            onClick={handleCancel}
          >
            <X size={20} />
          </button>
        </div>

        <div className="evento-form-body">
          <div className="form-group">
            <label>Título del evento *</label>
            <input
              type="text"
              placeholder="Ej: Culto de Adoración"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Descripción</label>
            <input
              type="text"
              placeholder="Breve descripción del evento"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Fecha *</label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Hora Inicio</label>
              <input
                type="time"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Hora Fin</label>
              <input
                type="time"
                value={horaFin}
                onChange={(e) => setHoraFin(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Ubicación</label>
            <input
              type="text"
              placeholder="Ej: Templo Principal"
              value={ubicacion}
              onChange={(e) => setUbicacion(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <div className="evento-form-footer">
          <button 
            type="button" 
            className="btn-cancel"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="btn-submit"
            disabled={loading}
          >
            <Plus size={18} />
            {loading ? 'Guardando...' : isEditing ? 'Actualizar Evento' : 'Guardar Evento'}
          </button>
        </div>
      </form>
    </div>
  )
}