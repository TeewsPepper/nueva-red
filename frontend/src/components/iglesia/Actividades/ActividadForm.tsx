import React, { useState, useEffect } from 'react'
import { X, Target, Calendar as CalendarIcon, Clock, MapPin, Users, Plus } from 'lucide-react'
import { useBreak } from '../../../hooks/useBreak'
import { BreakActivity } from '../../../types'
import './ActividadForm.css'

interface ActividadFormProps {
  onSuccess?: () => void
  onCancel?: () => void
  editData?: BreakActivity | null  // 👈 AÑADIR
}

export const ActividadForm: React.FC<ActividadFormProps> = ({ 
  onSuccess, 
  onCancel,
  editData  // 👈 RECIBIR
}) => {
  const { crearActividad, actualizarActividad } = useBreak()
  const isEditing = !!editData  // 👈 AÑADIR
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    fecha: '',
    horaInicio: '',
    horaFin: '',
    ubicacion: '',
    maxParticipantes: ''
  })

  // 👇 Cargar datos para editar
  useEffect(() => {
    if (editData) {
      setFormData({
        titulo: editData.titulo || '',
        descripcion: editData.descripcion || '',
        fecha: editData.fecha || '',
        horaInicio: editData.horaInicio || '',
        horaFin: editData.horaFin || '',
        ubicacion: editData.ubicacion || '',
        maxParticipantes: editData.maxParticipantes ? String(editData.maxParticipantes) : ''
      })
    }
  }, [editData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setError('')
  
  if (!formData.titulo.trim()) {
    setError('El título es requerido')
    return
  }

  if (!formData.fecha) {
    setError('La fecha es requerida')
    return
  }

  setLoading(true)
  try {
    // 👇 Procesar maxParticipantes
    const maxParticipantes = formData.maxParticipantes 
      ? parseInt(formData.maxParticipantes) 
      : 0

    const data = {
      titulo: formData.titulo.trim(),
      descripcion: formData.descripcion.trim() || 'Sin descripción',
      fecha: formData.fecha,
      horaInicio: formData.horaInicio || '18:00',
      horaFin: formData.horaFin || '20:00',
      ubicacion: formData.ubicacion.trim() || 'Salón Principal',
      maxParticipantes: maxParticipantes > 0 ? maxParticipantes : undefined
    }

    if (isEditing && editData) {
      await actualizarActividad(editData._id, data)
    } else {
      await crearActividad(data)
    }
    
    // Limpiar formulario
    setFormData({
      titulo: '',
      descripcion: '',
      fecha: '',
      horaInicio: '',
      horaFin: '',
      ubicacion: '',
      maxParticipantes: ''
    })
    
    if (onSuccess) onSuccess()
  } catch (err) {
    setError(err instanceof Error ? err.message : `Error al ${isEditing ? 'actualizar' : 'crear'} la actividad`)
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
    <div className="actividad-form">
      <div className="actividad-form-header">
        <h3>
          <Target size={20} className="header-icon" />
          {isEditing ? 'Editar Actividad' : 'Nueva Actividad'}
        </h3>
        <button className="btn-close-form" onClick={handleCancel}>
          <X size={20} />
        </button>
      </div>

      {error && <div className="form-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="titulo">Título *</label>
          <input
            id="titulo"
            name="titulo"
            type="text"
            placeholder="Ej: Tarde de Juegos"
            value={formData.titulo}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="descripcion">Descripción</label>
          <textarea
            id="descripcion"
            name="descripcion"
            placeholder="Describe la actividad"
            value={formData.descripcion}
            onChange={handleChange}
            rows={3}
            disabled={loading}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="fecha">
              <CalendarIcon size={14} className="field-icon" />
              Fecha *
            </label>
            <input
              id="fecha"
              name="fecha"
              type="date"
              value={formData.fecha}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="maxParticipantes">
              <Users size={14} className="field-icon" />
              Máx. participantes
            </label>
            <input
              id="maxParticipantes"
              name="maxParticipantes"
              type="number"
              placeholder="20"
              min="1"
              value={formData.maxParticipantes}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="horaInicio">
              <Clock size={14} className="field-icon" />
              Hora inicio
            </label>
            <input
              id="horaInicio"
              name="horaInicio"
              type="time"
              value={formData.horaInicio}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="horaFin">
              <Clock size={14} className="field-icon" />
              Hora fin
            </label>
            <input
              id="horaFin"
              name="horaFin"
              type="time"
              value={formData.horaFin}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="ubicacion">
            <MapPin size={14} className="field-icon" />
            Ubicación
          </label>
          <input
            id="ubicacion"
            name="ubicacion"
            type="text"
            placeholder="Ej: Salón Principal"
            value={formData.ubicacion}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={handleCancel} disabled={loading}>
            Cancelar
          </button>
          <button type="submit" className="btn-submit" disabled={loading}>
            <Plus size={18} />
            {loading ? 'Guardando...' : isEditing ? 'Actualizar Actividad' : 'Crear Actividad'}
          </button>
        </div>
      </form>
    </div>
  )
}