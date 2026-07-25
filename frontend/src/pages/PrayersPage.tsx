import { useAuth } from '../hooks/useAuth'
import { DashboardHeader } from '../components/dashboard/DashboardHeader'
import { PrayerList } from '../components/prayers/PrayerList'
import { Heart } from 'lucide-react'  // 👈 IMPORTAR Heart
import './PrayersPage.css'

export const PrayersPage: React.FC = () => {
  const { user, logout } = useAuth()

  return (
    <div className="prayers-page">
      <DashboardHeader 
        userEmail={user?.email || ''} 
        userRole={user?.role || 'miembro'}
        onLogout={logout}
      />
      
      <div className="prayers-page-content">
        <div className="prayers-page-header">
          <h1>
            <Heart className="h-8 w-8 inline-block mr-2 text-red-500" />  {/* 👈 ICONO EN VEZ DE EMOJI */}
            Pedidos de Oración
          </h1>
          <p>Comparte tus peticiones y ora por otros</p>
        </div>
        
        <PrayerList />
      </div>
    </div>
  )
}