import React from 'react'
import { LogOut, User, Crown, Star, Users, Eye, Church, ChevronDown } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import './DashboardHeader.css'

interface DashboardHeaderProps {
  userEmail: string
  userRole?: string
  onLogout: () => void
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  userEmail, 
  userRole = 'miembro',
  onLogout 
}) => {
  const { user } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false)
  
  const displayRole = userRole || user?.role || 'miembro'
  const displayEmail = userEmail || user?.email || ''
  const displayName = user?.name || 'Usuario'

  const getRoleIcon = () => {
    switch (displayRole) {
      case 'pastor': return <Crown className="h-5 w-5 text-yellow-400" />
      case 'lider': return <Star className="h-5 w-5 text-blue-400" />
      case 'miembro': return <Users className="h-5 w-5 text-green-400" />
      case 'visitante': return <Eye className="h-5 w-5 text-gray-400" />
      default: return <User className="h-5 w-5 text-gray-400" />
    }
  }

  const getRoleLabel = () => {
    switch (displayRole) {
      case 'pastor': return 'Pastor'
      case 'lider': return 'Líder'
      case 'miembro': return 'Miembro'
      case 'visitante': return 'Visitante'
      default: return 'Usuario'
    }
  }

  const getRoleColor = () => {
    switch (displayRole) {
      case 'pastor': return 'role-pastor'
      case 'lider': return 'role-lider'
      case 'miembro': return 'role-miembro'
      case 'visitante': return 'role-visitante'
      default: return 'role-default'
    }
  }

  const handleLogout = async () => {
    if (isLoggingOut) return
    
    setIsLoggingOut(true)
    setIsDropdownOpen(false)
    console.log('🚪 Click en logout desde DashboardHeader')
    
    try {
      await onLogout()
    } catch (error) {
      console.error('❌ Error en logout:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <header className="dashboard-header">
      <div className="header-container">
        {/* Logo y título */}
        <div className="header-left">
          <div className="logo-icon">
            <Church className="h-6 w-6 text-gold" />
          </div>
          <div className="header-title-wrapper">
            <h1 className="header-title">Iglesia La Buena Nueva</h1>
            <span className="header-subtitle">Administración</span>
          </div>
        </div>
        
        {/* Perfil y acciones */}
        <div className="header-right">
          <div className="user-profile">
            {/* Avatar */}
            <div className={`user-avatar ${getRoleColor()}`}>
              {getRoleIcon()}
            </div>
            
            {/* Información del usuario */}
            <div className="user-info">
              {/* <div className="user-name">{displayName}</div> */}
              <div className="user-email">{displayEmail}</div>
            </div>
            
            {/* Badge de rol */}
            <div className={`role-badge ${getRoleColor()}`}>
              {getRoleIcon()}
              <span>{getRoleLabel()}</span>
            </div>
            
            {/* Dropdown menu */}
            <div className="user-dropdown">
              <button 
                className="dropdown-toggle"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                aria-label="Opciones de usuario"
              >
                <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isDropdownOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <div className="dropdown-user-name">{displayName}</div>
                    <div className="dropdown-user-email">{displayEmail}</div>
                    <div className={`dropdown-role-badge ${getRoleColor()}`}>
                      {getRoleIcon()}
                      <span>{getRoleLabel()}</span>
                    </div>
                  </div>
                  
                  <div className="dropdown-divider"></div>
                  
                  <button 
                    className="dropdown-item logout-item"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{isLoggingOut ? 'Cerrando...' : 'Cerrar sesión'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}