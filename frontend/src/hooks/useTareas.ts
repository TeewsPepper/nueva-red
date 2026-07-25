import { useState, useCallback } from 'react'
import type { Tarea } from '../types'

const API_URL = import.meta.env.VITE_API_URL || '/api'

export const useTareas = () => {
  const [tareas, setTareas] = useState<Tarea[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cargarTareas = useCallback(async (ministerioId?: string) => {
    setLoading(true)
    setError(null)
    try {
      const url = ministerioId ? `${API_URL}/tareas?ministerioId=${ministerioId}` : `${API_URL}/tareas`
      const res = await fetch(url, { 
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (!res.ok) throw new Error('Error al cargar tareas')
      
      const response = await res.json()
      console.log('✅ Respuesta tareas:', response)
      
      if (response.success && Array.isArray(response.data)) {
        setTareas(response.data)
      } else if (Array.isArray(response)) {
        setTareas(response)
      } else {
        console.warn('⚠️ Formato de respuesta inesperado:', response)
        setTareas([])
      }
    } catch (err) {
      console.error('❌ Error al cargar tareas:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
      setTareas([])
    } finally {
      setLoading(false)
    }
  }, [])

  const crearTarea = useCallback(async (data: Partial<Tarea>) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/tareas`, {
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
        throw new Error(errorData.message || 'Error al crear tarea')
      }
      
      const response = await res.json()
      const nuevaTarea = response.data || response
      setTareas(prev => [...prev, nuevaTarea])
      return nuevaTarea
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // 👇 AGREGAR actualizarTarea
  const actualizarTarea = useCallback(async (id: string, data: Partial<Tarea>) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/tareas/${id}`, {
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
        throw new Error(errorData.message || 'Error al actualizar tarea')
      }
      
      const response = await res.json()
      const actualizada = response.data || response
      setTareas(prev => prev.map(t => t._id === id ? actualizada : t))
      return actualizada
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const completarTarea = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/tareas/${id}/completar`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Error al completar tarea')
      }
      
      const response = await res.json()
      const actualizada = response.data || response
      setTareas(prev => prev.map(t => t._id === id ? actualizada : t))
      return actualizada
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const eliminarTarea = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/tareas/${id}`, { 
        method: 'DELETE', 
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Error al eliminar tarea')
      }
      
      setTareas(prev => prev.filter(t => t._id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { 
    tareas, 
    loading, 
    error,
    cargarTareas, 
    crearTarea,
    actualizarTarea,  // 👈 EXPORTAR
    completarTarea, 
    eliminarTarea 
  }
}