// pages/FeedPage.tsx
import { useAuth } from '../hooks/useAuth'
import { useLocation } from 'react-router-dom'
import { DashboardHeader } from '../components/dashboard/DashboardHeader'
import { Feed } from '../components/feed/Feed'
import './FeedPage.css'

export const FeedPage: React.FC = () => {
  const { user, logout } = useAuth()
  const location = useLocation()

  return (
    <div className="feed-page">
      <DashboardHeader 
        userEmail={user?.email || ''} 
        userRole={user?.role || 'miembro'}
        onLogout={logout}
      />
      
      <div className="feed-page-content">
        <div className="feed-page-header">
          <h1>📱 Muro de la Iglesia</h1>
          <p>Comparte noticias, oraciones y testimonios con tu comunidad</p>
        </div>
        
        <Feed location={location} />
      </div>
    </div>
  )
}