import React, { useState, useEffect } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { useUsuarios } from '../../../hooks/useUsuarios'
import { User } from '../../../types'
import { Shield, User as UserIcon, Search, AlertCircle } from 'lucide-react'
import './RolesPanel.css'

export const RolesPanel: React.FC = () => {
  const { user: currentUser } = useAuth()
  const { usuarios, loading, error, cargarUsuarios, actualizarRol } = useUsuarios()
  const [searchTerm, setSearchTerm] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState<{ userId: string; newRole: User['role'] } | null>(null)

  useEffect(() => {
    cargarUsuarios()
  }, [])

  // Filtrar usuarios (excluir al usuario actual)
  const usuariosFiltrados = usuarios
    .filter(u => u._id !== currentUser?._id)
    .filter(u => 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

  const rolesDisponibles: User['role'][] = ['pastor', 'lider', 'miembro', 'visitante']

  const getRoleColor = (role: string): string => {
    const colors = {
      pastor: 'role-pastor',
      lider: 'role-lider',
      miembro: 'role-miembro',
      visitante: 'role-visitante'
    }
    return colors[role as keyof typeof colors] || 'role-default'
  }

  const getRoleLabel = (role: string): string => {
    const labels = {
      pastor: 'Pastor',
      lider: 'Líder',
      miembro: 'Miembro',
      visitante: 'Visitante'
    }
    return labels[role as keyof typeof labels] || role
  }

  const handleRoleChange = async (userId: string, newRole: User['role']) => {
    setShowConfirm({ userId, newRole })
  }

  const confirmRoleChange = async () => {
    if (!showConfirm) return
    
    try {
      setUpdatingId(showConfirm.userId)
      await actualizarRol(showConfirm.userId, showConfirm.newRole)
      // Recargar usuarios para asegurar consistencia
      await cargarUsuarios()
    } catch (err) {
      console.error('Error al cambiar rol:', err)
    } finally {
      setUpdatingId(null)
      setShowConfirm(null)
    }
  }

  if (!currentUser?.role || currentUser.role !== 'pastor') {
    return (
      <div className="roles-panel">
        <div className="roles-access-denied">
          <Shield size={48} />
          <h3>Acceso Restringido</h3>
          <p>Solo los pastores pueden gestionar roles de usuarios.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="roles-panel">
      {/* Confirmación Modal */}
      {showConfirm && (
        <div className="roles-confirm-overlay">
          <div className="roles-confirm-modal">
            <h3>Confirmar Cambio de Rol</h3>
            <p>
              ¿Estás seguro de cambiar el rol de <strong>
                {usuarios.find(u => u._id === showConfirm.userId)?.name}
              </strong> a <strong>{getRoleLabel(showConfirm.newRole)}</strong>?
            </p>
            <div className="roles-confirm-actions">
              <button 
                className="btn-cancel"
                onClick={() => setShowConfirm(null)}
              >
                Cancelar
              </button>
              <button 
                className="btn-confirm"
                onClick={confirmRoleChange}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="roles-header">
        <div className="roles-title">
          <Shield size={24} />
          <h2>Gestión de Roles</h2>
        </div>
        <p className="roles-subtitle">
          Asigna roles a los miembros de la iglesia para controlar sus permisos
        </p>
      </div>

      {/* Buscador */}
      <div className="roles-search">
        <Search size={20} className="search-icon" />
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Lista de Usuarios */}
      {loading ? (
        <div className="roles-loading">
          <div className="spinner"></div>
          <p>Cargando usuarios...</p>
        </div>
      ) : error ? (
        <div className="roles-error">
          <AlertCircle size={24} />
          <p>{error}</p>
        </div>
      ) : usuariosFiltrados.length === 0 ? (
        <div className="roles-empty">
          <UserIcon size={48} />
          <p>No hay usuarios disponibles</p>
        </div>
      ) : (
        <div className="roles-list">
          {usuariosFiltrados.map((usuario) => (
            <div key={usuario._id} className="roles-item">
              <div className="roles-user-info">
                <div className="roles-user-avatar">
                  {usuario.profilePicture ? (
                    <img src={usuario.profilePicture} alt={usuario.name} />
                  ) : (
                    <div className="roles-avatar-placeholder">
                      {usuario.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="roles-user-details">
                  <span className="roles-user-name">{usuario.name}</span>
                  <span className="roles-user-email">{usuario.email}</span>
                </div>
              </div>

              <div className="roles-user-role">
                <span className={`roles-role-badge ${getRoleColor(usuario.role)}`}>
                  {getRoleLabel(usuario.role)}
                </span>
                
                {updatingId === usuario._id ? (
                  <div className="roles-updating">
                    <div className="spinner-small"></div>
                  </div>
                ) : (
                  <select
                    className="roles-select"
                    value={usuario.role}
                    onChange={(e) => handleRoleChange(usuario._id, e.target.value as User['role'])}
                    disabled={usuario._id === currentUser._id}
                  >
                    {rolesDisponibles.map((rol) => (
                      <option key={rol} value={rol}>
                        {getRoleLabel(rol)}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}