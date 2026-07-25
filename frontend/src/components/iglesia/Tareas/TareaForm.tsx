import React, { useState, useEffect } from 'react'
import { X, Calendar, User, Plus, ListTodo } from 'lucide-react'
import { useTareas } from '../../../hooks/useTareas'
import { useAuth } from '../../../hooks/useAuth'
import api from '../../../services/api'
import { Tarea } from '../../../types'
import './TareaForm.css'

interface TareaFormProps {
  onSuccess?: () => void
  onCancel?: () => void
  editData?: Tarea | null  // 👈 AÑADIR
}

export const TareaForm: React.FC<TareaFormProps> = ({ 
  onSuccess, 
  onCancel,
  editData  // 👈 RECIBIR
}) => {
  const { user } = useAuth()
  const { crearTarea, actualizarTarea } = useTareas()  // 👈 AÑADIR actualizarTarea
  const isEditing = !!editData  // 👈 AÑADIR
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [usuarios, setUsuarios] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    prioridad: 'media' as 'baja' | 'media' | 'alta',
    fechaEntrega: '',
    asignadoA: ''
  })

  // Cargar usuarios para asignar tareas
  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        const response = await api.get('/usuarios')
        if (response.data.success) {
          setUsuarios(response.data.data)
        }
      } catch (error) {
        console.error('Error al cargar usuarios:', error)
      }
    }
    cargarUsuarios()
  }, [])

  // 👇 Cargar datos para editar
  useEffect(() => {
    if (editData) {
      setFormData({
        titulo: editData.titulo || '',
        descripcion: editData.descripcion || '',
        prioridad: editData.prioridad || 'media',
        fechaEntrega: editData.fechaEntrega || '',
        asignadoA: typeof editData.asignadoA === 'string' ? editData.asignadoA : editData.asignadoA?._id || ''
      })
    }
  }, [editData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

    // 👇 LOGS PARA DEPURAR FECHA
    console.log('📤 [TareaForm] Enviando tarea - fechaEntrega:', formData.fechaEntrega)
    console.log('📤 [TareaForm] Tipo de fechaEntrega:', typeof formData.fechaEntrega)
    console.log('📤 [TareaForm] formData completo:', formData)

    setLoading(true)
    try {
      const data = {
        titulo: formData.titulo.trim(),
        descripcion: formData.descripcion.trim() || 'Sin descripción',
        prioridad: formData.prioridad,
        fechaEntrega: formData.fechaEntrega,
        asignadoA: formData.asignadoA || user?._id,
        estado: 'pendiente' as const,
        completada: false
      }

      console.log('📤 [TareaForm] Data a enviar al backend:', data)

      if (isEditing && editData) {
        await actualizarTarea(editData._id, data)
        console.log('✅ [TareaForm] Tarea actualizada')
      } else {
        await crearTarea(data)
        console.log('✅ [TareaForm] Tarea creada')
      }
      
      setFormData({
        titulo: '',
        descripcion: '',
        prioridad: 'media',
        fechaEntrega: '',
        asignadoA: ''
      })
      
      if (onSuccess) onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : `Error al ${isEditing ? 'actualizar' : 'crear'} la tarea`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="tarea-form">
      <div className="tarea-form-header">
        <h3>
          <ListTodo size={20} className="header-icon" />
          {isEditing ? 'Editar Tarea' : 'Nueva Tarea'}  {/* 👈 TÍTULO DINÁMICO */}
        </h3>
        <button className="btn-close-form" onClick={onCancel}>
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
            placeholder="Ej: Preparar presentación"
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
            placeholder="Describe la tarea"
            value={formData.descripcion}
            onChange={handleChange}
            rows={3}
            disabled={loading}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="prioridad">Prioridad</label>
            <select
              id="prioridad"
              name="prioridad"
              value={formData.prioridad}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="baja">🟢 Baja</option>
              <option value="media">🟡 Media</option>
              <option value="alta">🔴 Alta</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="fechaEntrega">
              <Calendar size={14} className="field-icon" />
              Fecha de la tarea
            </label>
            <input
              id="fechaEntrega"
              name="fechaEntrega"
              type="date"
              value={formData.fechaEntrega}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="asignadoA">
            <User size={14} className="field-icon" />
            Asignar a
          </label>
          <select
            id="asignadoA"
            name="asignadoA"
            value={formData.asignadoA}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="">Seleccionar usuario</option>
            <option value={user?._id}>👤 {user?.name} (yo)</option>
            {usuarios
              .filter(u => u._id !== user?._id)
              .map(u => (
                <option key={u._id} value={u._id}>
                  {u.name} - {u.role}
                </option>
              ))}
          </select>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={onCancel} disabled={loading}>
            Cancelar
          </button>
          <button type="submit" className="btn-submit" disabled={loading}>
            <Plus size={18} />
            {loading ? 'Guardando...' : isEditing ? 'Actualizar Tarea' : 'Crear Tarea'}
          </button>
        </div>
      </form>
    </div>
  )
}