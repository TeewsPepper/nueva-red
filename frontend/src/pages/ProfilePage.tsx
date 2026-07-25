import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { DashboardHeader } from '../components/dashboard/DashboardHeader'
import { Profile } from '../components/profile/Profile'
import './ProfilePage.css' 

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth()

  return (
    <div className="profile-page">
      <DashboardHeader 
        userEmail={user?.email || ''} 
        userRole={user?.role || 'miembro'}
        onLogout={logout}
      />
      
      <div className="profile-page-content">
        <Profile user={user} />
      </div>
    </div>
  )
}