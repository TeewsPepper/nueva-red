import React, { useState } from 'react'
import { X, Save } from 'lucide-react'
import api from '../../services/api'
import './ProfileEdit.css'

interface ProfileEditProps {
  user: {
    _id: string
    name: string
    email: string
    phone?: string
    churchName?: string
  }
  onCancel: () => void
  onSave: () => void
}

export const ProfileEdit: React.FC<ProfileEditProps> = ({ user, onCancel, onSave }) => {
  const [name, setName] = useState(user.name)
  const [phone, setPhone] = useState(user.phone || '')
  const [churchName, setChurchName] = useState(user.churchName || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('El nombre es requerido')
      return
    }

    setLoading(true)
    setError('')
    try {
      await api.put(`/usuarios/${user._id}`, {
        name: name.trim(),
        phone: phone.trim() || undefined,
        churchName: churchName.trim() || undefined
      })
      onSave()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar perfil')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="profile-edit-container">
      <div className="profile-edit-card">
        <div className="profile-edit-header">
          <h3>Editar Perfil</h3>
          <button className="btn-close-edit" onClick={onCancel}>
            <X size={20} />
          </button>
        </div>

        {error && <div className="profile-edit-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre completo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" value={user.email} disabled />
            <small>El email no se puede cambiar</small>
          </div>

          <div className="form-group">
            <label>Teléfono</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
              placeholder="Tu número de teléfono"
            />
          </div>

          <div className="form-group">
            <label>Iglesia</label>
            <input
              type="text"
              value={churchName}
              onChange={(e) => setChurchName(e.target.value)}
              disabled={loading}
              placeholder="Nombre de tu iglesia"
            />
          </div>

          <div className="profile-edit-actions">
            <button type="button" className="btn-cancel" onClick={onCancel} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn-save" disabled={loading}>
              <Save size={18} />
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}