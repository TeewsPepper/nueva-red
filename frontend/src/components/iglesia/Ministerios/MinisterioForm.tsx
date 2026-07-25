import React, { useState, useEffect } from 'react'
import { useMinisterios } from '../../../hooks/useMinisterios'
import { X, Plus } from 'lucide-react'
import { Ministerio } from '../../../types'
import './MinisterioForm.css'

interface MinisterioFormProps {
  onSuccess?: () => void
  onCancel?: () => void
  editData?: Ministerio | null  // 👈 NUEVO
}

export const MinisterioForm: React.FC<MinisterioFormProps> = ({ 
  onSuccess, 
  onCancel,
  editData  // 👈 RECIBIR
}) => {
  const { crearMinisterio, actualizarMinisterio } = useMinisterios()
  const isEditing = !!editData
  
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [dia, setDia] = useState('Lunes')
  const [horaInicio, setHoraInicio] = useState('19:00')
  const [horaFin, setHoraFin] = useState('21:00')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 👇 Cargar datos para editar
  useEffect(() => {
    if (editData) {
      setNombre(editData.nombre || '')
      setDescripcion(editData.descripcion || '')
      if (editData.horarios && editData.horarios.length > 0) {
        setDia(editData.horarios[0].dia || 'Lunes')
        setHoraInicio(editData.horarios[0].horaInicio || '19:00')
        setHoraFin(editData.horarios[0].horaFin || '21:00')
      }
    }
  }, [editData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!nombre.trim()) {
      setError('El nombre del ministerio es requerido')
      return
    }

    setLoading(true)

    try {
      const data = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || 'Sin descripción',
        horarios: [{ dia, horaInicio, horaFin }],
        ubicacion: 'Salón'
      }

      if (isEditing && editData) {
        await actualizarMinisterio(editData._id, data)
      } else {
        await crearMinisterio(data)
      }

      setNombre('')
      setDescripcion('')
      setDia('Lunes')
      setHoraInicio('19:00')
      setHoraFin('21:00')
      
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Error al ${isEditing ? 'actualizar' : 'crear'} ministerio`)
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
    <div className="ministerio-form-wrapper">
      {error && (
        <div className="ministerio-form-error">
          {error}
        </div>
      )}

      <form className="ministerio-form" onSubmit={handleSubmit}>
        <div className="ministerio-form-header">
          <h4>{isEditing ? 'Editar Ministerio' : 'Crear Nuevo Ministerio'}</h4>
          <button 
            type="button" 
            className="ministerio-form-close"
            onClick={handleCancel}
          >
            <X size={20} />
          </button>
        </div>

        <div className="ministerio-form-body">
          <div className="form-group">
            <label>Nombre del ministerio *</label>
            <input
              type="text"
              placeholder="Ej: Ministerio de Alabanza"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Descripción</label>
            <input
              type="text"
              placeholder="Breve descripción del ministerio"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Día</label>
              <select 
                value={dia} 
                onChange={(e) => setDia(e.target.value)}
                disabled={loading}
              >
                <option value="Lunes">Lunes</option>
                <option value="Martes">Martes</option>
                <option value="Miércoles">Miércoles</option>
                <option value="Jueves">Jueves</option>
                <option value="Viernes">Viernes</option>
                <option value="Sábado">Sábado</option>
                <option value="Domingo">Domingo</option>
              </select>
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
        </div>

        <div className="ministerio-form-footer">
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
            {loading ? 'Guardando...' : isEditing ? 'Actualizar Ministerio' : 'Guardar Ministerio'}
          </button>
        </div>
      </form>
    </div>
  )
}