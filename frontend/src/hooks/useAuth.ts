import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

export const useAuth = () => {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  // Helpers para verificar roles
  const hasRole = (roles: string | string[]) => {
    const user = context.user
    if (!user) return false

    const rolesArray = Array.isArray(roles) ? roles : [roles]
    return rolesArray.includes(user.role)
  }

  const canCreateMinisterio = () => {
    return hasRole(['pastor', 'lider'])
  }

  const canCreateEvento = () => {
    return hasRole(['pastor', 'lider'])
  }

  const canCreateTarea = () => {
    return hasRole(['pastor', 'lider', 'miembro'])
  }

  const canCreateActividad = () => {
    return hasRole(['pastor', 'lider', 'miembro'])
  }

  const canJoinActividad = () => {
    return hasRole(['pastor', 'lider', 'miembro', 'visitante'])
  }

  const isAdmin = () => {
    return hasRole('pastor')
  }

  const isLider = () => {
    return hasRole('lider')
  }

  const isMiembro = () => {
    return hasRole('miembro')
  }

  const isVisitante = () => {
    return hasRole('visitante')
  }

  return {
    ...context,
    hasRole,
    canCreateMinisterio,
    canCreateEvento,
    canCreateTarea,
    canCreateActividad,
    canJoinActividad,
    isAdmin,
    isLider,
    isMiembro,
    isVisitante,
  }
}