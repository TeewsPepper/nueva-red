import { useState, useCallback } from 'react'
import type { BreakActivity } from '../types'
import { useToast } from './useToast'

const API_URL = import.meta.env.VITE_API_URL || '/api'

export const useBreak = () => {
  const [actividades, setActividades] = useState<BreakActivity[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { error: toastError, success: toastSuccess } = useToast()

  const cargarActividades = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/break/actividades`, { 
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (!res.ok) throw new Error('Error al cargar actividades')
      
      const response = await res.json()
      console.log('🎯 Respuesta actividades:', response)
      
      if (response.success && Array.isArray(response.data)) {
        setActividades(response.data)
      } else if (Array.isArray(response)) {
        setActividades(response)
      } else {
        setActividades([])
      }
    } catch (err) {
      console.error('❌ Error al cargar actividades:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
      setActividades([])
    } finally {
      setLoading(false)
    }
  }, [])

  const crearActividad = useCallback(async (data: Partial<BreakActivity>) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/break/actividades`, {
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
        throw new Error(errorData.message || 'Error al crear actividad')
      }
      
      const response = await res.json()
      const nuevaActividad = response.data || response
      setActividades(prev => [...prev, nuevaActividad])
      return nuevaActividad
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const actualizarActividad = useCallback(async (id: string, data: Partial<BreakActivity>) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/break/actividades/${id}`, {
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
        throw new Error(errorData.message || 'Error al actualizar actividad')
      }
      
      const response = await res.json()
      const actualizada = response.data || response
      setActividades(prev => prev.map(a => a._id === id ? actualizada : a))
      return actualizada
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // 👇 Función UNIRSE - con toast de error y éxito
  const unirse = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/break/actividades/${id}/unirse`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        // 👇 Mostrar error con toast
        toastError(errorData.message || 'Error al unirse a la actividad')
        throw new Error(errorData.message || 'Error al unirse a la actividad')
      }
      
      const response = await res.json()
      const actualizada = response.data || response
      setActividades(prev => prev.map(a => a._id === id ? actualizada : a))
      
      // 👇 Mostrar éxito con toast
      toastSuccess('✅ Te has unido a la actividad')
      
      return actualizada
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      throw err
    } finally {
      setLoading(false)
    }
  }, [toastError, toastSuccess])

  const salir = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/break/actividades/${id}/salir`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        toastError(errorData.message || 'Error al salir de la actividad')
        throw new Error(errorData.message || 'Error al salir de la actividad')
      }
      
      const response = await res.json()
      const actualizada = response.data || response
      setActividades(prev => prev.map(a => a._id === id ? actualizada : a))
      
      toastSuccess('✅ Has salido de la actividad')
      
      return actualizada
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      throw err
    } finally {
      setLoading(false)
    }
  }, [toastError, toastSuccess])

  const eliminarActividad = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/break/actividades/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        toastError(errorData.message || 'Error al eliminar actividad')
        throw new Error(errorData.message || 'Error al eliminar actividad')
      }
      
      setActividades(prev => prev.filter(a => a._id !== id))
      toastSuccess('✅ Actividad eliminada')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      throw err
    } finally {
      setLoading(false)
    }
  }, [toastError, toastSuccess])

  return { 
    actividades, 
    loading, 
    error,
    cargarActividades, 
    crearActividad,
    actualizarActividad,
    unirse,      // 👈 Esta es la que usas en ActividadCard
    salir, 
    eliminarActividad 
  }
}