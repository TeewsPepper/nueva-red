import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { DashboardHeader } from '../components/dashboard/DashboardHeader'
import { Profile } from '../components/profile/Profile'
import { User } from '../types'
import './ProfilePage.css'

export const ProfilePage: React.FC = () => {
  const { user, logout, setUser } = useAuth()

  const handleUserUpdate = (updatedUser: User) => {
    console.log('🔄 Actualizando usuario en ProfilePage:', updatedUser)
    console.log('📸 profilePicture:', updatedUser.profilePicture)
    
    // ✅ ACTUALIZAR CONTEXTO
    setUser(updatedUser)
    
    // ✅ GUARDAR EN LOCALSTORAGE CON LA FOTO
    const userToSave = {
      ...updatedUser,
      profilePicture: updatedUser.profilePicture || null
    }
    localStorage.setItem('user', JSON.stringify(userToSave))
    
    // ✅ VERIFICAR QUE SE GUARDÓ
    const saved = localStorage.getItem('user')
    console.log('💾 Guardado en localStorage:', saved)
  }

  return (
    <div className="profile-page">
      <DashboardHeader 
        userEmail={user?.email || ''} 
        userRole={user?.role || 'miembro'}
        onLogout={logout}
      />
      
      <div className="profile-page-content">
        <Profile user={user} onUserUpdate={handleUserUpdate} />
      </div>
    </div>
  )
}