import React, { useState } from 'react'
import { User, Mail, Phone, Church, Calendar, Edit, Crown, Star } from 'lucide-react'
import { ProfileEdit } from './ProfileEdit'
import './Profile.css'

interface ProfileProps {
  user: {
    _id: string
    name: string
    email: string
    role: 'pastor' | 'lider' | 'miembro' | 'visitante'
    churchName?: string
    phone?: string
    createdAt?: string
  } | null
}

export const Profile: React.FC<ProfileProps> = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false)

  if (!user) {
    return (
      <div className="profile-container">
        <div className="profile-error">Usuario no encontrado</div>
      </div>
    )
  }

  const getRoleIcon = () => {
    switch (user.role) {
      case 'pastor': return <Crown size={20} />
      case 'lider': return <Star size={20} />
      default: return <User size={20} />
    }
  }

  const getRoleColor = () => {
    switch (user.role) {
      case 'pastor': return 'role-pastor'
      case 'lider': return 'role-lider'
      case 'miembro': return 'role-miembro'
      case 'visitante': return 'role-visitante'
      default: return ''
    }
  }

  if (isEditing) {
    return <ProfileEdit user={user} onCancel={() => setIsEditing(false)} onSave={() => setIsEditing(false)} />
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-cover" />
        
        <div className="profile-body">
          <div className="profile-avatar-wrapper">
            <div className={`profile-avatar ${getRoleColor()}`}>
              {getRoleIcon()}
            </div>
          </div>

          <div className="profile-info">
            <h1 className="profile-name">{user.name}</h1>
            <span className={`profile-role-badge ${getRoleColor()}`}>
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </span>
          </div>

          <div className="profile-details">
            <div className="profile-detail">
              <Mail size={18} />
              <span>{user.email}</span>
            </div>
            
            {user.phone && (
              <div className="profile-detail">
                <Phone size={18} />
                <span>{user.phone}</span>
              </div>
            )}
            
            {user.churchName && (
              <div className="profile-detail">
                <Church size={18} />
                <span>{user.churchName}</span>
              </div>
            )}
            
            {user.createdAt && (
              <div className="profile-detail">
                <Calendar size={18} />
                <span>Miembro desde: {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          <button className="btn-edit-profile" onClick={() => setIsEditing(true)}>
            <Edit size={18} />
            Editar Perfil
          </button>
        </div>
      </div>
    </div>
  )
}