import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import api from '../../../services/api'
import { User } from '../../../types'
import { useToast } from '../../../hooks/useToast'  // 👈 VERIFICAR IMPORT
import './SolicitarMinisterioModal.css'

interface SolicitarMinisterioModalProps {
  onClose: () => void
  onSuccess: () => void
}

export const SolicitarMinisterioModal: React.FC<SolicitarMinisterioModalProps> = ({
  onClose,
  onSuccess
}) => {
  const { success, error: toastError } = useToast()  // 👈 VERIFICAR
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    liderPropuesto: '',
  })
  const [usuarios, setUsuarios] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 👈 LOG PARA VERIFICAR
  console.log('🔍 useToast en modal:', { success, toastError })

  useEffect(() => {
    fetchLideres()
  }, [])

  const fetchLideres = async () => {
    try {
      const response = await api.get('/usuarios/lideres')
      if (response.data.success) {
        setUsuarios(response.data.data)
      }
    } catch (error) {
      console.error('Error al cargar líderes:', error)
      setError('No se pudieron cargar los líderes disponibles')
      if (toastError) toastError('No se pudieron cargar los líderes disponibles')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // 👈 LOG PARA VERIFICAR
    console.log('📝 Enviando solicitud...')

    try {
      const response = await api.post('/solicitudes', formData)
      console.log('📡 Respuesta:', response.data)  // 👈 LOG

      if (response.data.success) {
        console.log('✅ Solicitud creada, mostrando toast...')  // 👈 LOG
        if (success) {
          success('✅ Solicitud creada correctamente')
        } else {
          console.log('⚠️ success no está disponible')
        }
        onSuccess()
        onClose()
      }
    } catch (err: any) {
      console.error('❌ Error:', err)  // 👈 LOG
      const message = err.response?.data?.message || 'Error al crear solicitud'
      setError(message)
      if (toastError) {
        toastError(message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3>Solicitar Nuevo Ministerio</h3>
          <button
            onClick={onClose}
            className="modal-close"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="modal-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="nombre">Nombre del Ministerio *</label>
            <input
              id="nombre"
              type="text"
              required
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Ej: Ministerio de Alabanza"
            />
          </div>

          <div className="form-group">
            <label htmlFor="descripcion">Descripción *</label>
            <textarea
              id="descripcion"
              required
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              rows={3}
              placeholder="Describe el propósito y actividades del ministerio"
            />
          </div>

          <div className="form-group">
            <label htmlFor="liderPropuesto">Líder Propuesto *</label>
            <select
              id="liderPropuesto"
              required
              value={formData.liderPropuesto}
              onChange={(e) => setFormData({ ...formData, liderPropuesto: e.target.value })}
            >
              <option value="">Selecciona un líder</option>
              {usuarios.map((usuario) => (
                <option key={usuario._id} value={usuario._id}>
                  {usuario.name} - {usuario.role}
                </option>
              ))}
            </select>
            <span className="helper-text">
              Solo se pueden seleccionar usuarios con rol de líder o pastor
            </span>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-cancel"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-submit"
            >
              {loading ? 'Enviando...' : 'Enviar Solicitud'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}