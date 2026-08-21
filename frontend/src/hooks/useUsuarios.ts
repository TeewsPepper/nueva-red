import { useState, useCallback } from 'react'
import api from '../services/api'
import { User, ApiError } from '../types'

export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cargarUsuarios = useCallback(async (): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get('/usuarios')
      if (response.data.success) {
        setUsuarios(response.data.data)
      } else {
        setUsuarios([])
      }
    } catch (err) {
      const apiError = err as ApiError
      console.error('Error al cargar usuarios:', err)
      setError(apiError.response?.data?.message || 'Error al cargar usuarios')
      setUsuarios([])
    } finally {
      setLoading(false)
    }
  }, [])

  const actualizarRol = useCallback(async (userId: string, nuevoRol: User['role']): Promise<void> => {
    try {
      const response = await api.patch(`/usuarios/${userId}/rol`, { rol: nuevoRol })
      if (response.data.success) {
        // Actualizar la lista local
        setUsuarios(prev => 
          prev.map(user => 
            user._id === userId 
              ? { ...user, role: nuevoRol }
              : user
          )
        )
      } else {
        throw new Error(response.data.message || 'Error al actualizar rol')
      }
    } catch (err) {
      const apiError = err as ApiError
      console.error('Error al actualizar rol:', err)
      throw new Error(apiError.response?.data?.message || 'Error al actualizar rol')
    }
  }, [])

  return { 
    usuarios, 
    setUsuarios,
    loading, 
    error, 
    cargarUsuarios, 
    actualizarRol
  }
}