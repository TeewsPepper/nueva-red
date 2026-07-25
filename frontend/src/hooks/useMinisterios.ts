import { useState, useCallback } from 'react'
import type { Ministerio } from '../types'

const API_URL = import.meta.env.VITE_API_URL || '/api'

export const useMinisterios = () => {
  const [ministerios, setMinisterios] = useState<Ministerio[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cargarMinisterios = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/ministerios`, { 
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (!res.ok) throw new Error('Error al cargar ministerios')
      
      const response = await res.json()
      console.log('📋 Respuesta del backend:', response)
      
      // ✅ Extraer el array de datos correctamente
      if (response.success && Array.isArray(response.data)) {
        setMinisterios(response.data)
      } else if (Array.isArray(response)) {
        setMinisterios(response)
      } else {
        console.warn('⚠️ Formato de respuesta inesperado:', response)
        setMinisterios([])
      }
    } catch (err) {
      console.error('❌ Error al cargar ministerios:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
      setMinisterios([])
    } finally {
      setLoading(false)
    }
  }, [])

  const crearMinisterio = useCallback(async (data: Partial<Ministerio>) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/ministerios`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data),
        credentials: 'include'
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Error al crear ministerio')
      }
      
      const response = await res.json()
      // ✅ Extraer el ministerio creado
      const nuevoMinisterio = response.data || response
      setMinisterios(prev => [...prev, nuevoMinisterio])
      return nuevoMinisterio
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const actualizarMinisterio = useCallback(async (id: string, data: Partial<Ministerio>) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/ministerios/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data),
        credentials: 'include'
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Error al actualizar ministerio')
      }
      
      const response = await res.json()
      const actualizado = response.data || response
      setMinisterios(prev => prev.map(m => m._id === id ? actualizado : m))
      return actualizado
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const eliminarMinisterio = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/ministerios/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Error al eliminar ministerio')
      }
      
      setMinisterios(prev => prev.filter(m => m._id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { 
    ministerios, 
    loading, 
    error, 
    cargarMinisterios, 
    crearMinisterio, 
    actualizarMinisterio, 
    eliminarMinisterio 
  }
}