import { useState, useCallback } from 'react'
import type { Evento } from '../types'

const API_URL = import.meta.env.VITE_API_URL || '/api'

export const useEventos = () => {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cargarEventos = useCallback(async (ministerioId?: string) => {
    setLoading(true)
    setError(null)
    try {
      const url = ministerioId ? `${API_URL}/eventos?ministerioId=${ministerioId}` : `${API_URL}/eventos`
      const res = await fetch(url, { 
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (!res.ok) throw new Error('Error al cargar eventos')
      
      const response = await res.json()
      console.log('📅 Respuesta eventos:', response)
      
      if (response.success && Array.isArray(response.data)) {
        setEventos(response.data)
      } else if (Array.isArray(response)) {
        setEventos(response)
      } else {
        console.warn('⚠️ Formato de respuesta inesperado:', response)
        setEventos([])
      }
    } catch (err) {
      console.error('❌ Error al cargar eventos:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
      setEventos([])
    } finally {
      setLoading(false)
    }
  }, [])

  const crearEvento = useCallback(async (data: Partial<Evento>) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/eventos`, {
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
        throw new Error(errorData.message || 'Error al crear evento')
      }
      
      const response = await res.json()
      const nuevoEvento = response.data || response
      setEventos(prev => [...prev, nuevoEvento])
      return nuevoEvento
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // 👇 AGREGAR actualizarEvento
  const actualizarEvento = useCallback(async (id: string, data: Partial<Evento>) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/eventos/${id}`, {
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
        throw new Error(errorData.message || 'Error al actualizar evento')
      }
      
      const response = await res.json()
      const actualizado = response.data || response
      setEventos(prev => prev.map(e => e._id === id ? actualizado : e))
      return actualizado
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const eliminarEvento = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/eventos/${id}`, { 
        method: 'DELETE', 
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Error al eliminar evento')
      }
      
      setEventos(prev => prev.filter(e => e._id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const confirmarAsistencia = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/eventos/${id}/asistir`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Error al confirmar asistencia')
      }
      
      const response = await res.json()
      const actualizado = response.data || response
      setEventos(prev => prev.map(e => e._id === id ? actualizado : e))
      return actualizado
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { 
    eventos, 
    loading, 
    error,
    cargarEventos, 
    crearEvento,
    actualizarEvento,  // 👈 EXPORTAR
    eliminarEvento, 
    confirmarAsistencia 
  }
}