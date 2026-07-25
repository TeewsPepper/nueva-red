import { useState, useCallback } from 'react'
import api from '../services/api'
import { PrayerRequest, ApiError, ApiResponse } from '../types'

export const usePrayers = () => {
  const [prayers, setPrayers] = useState<PrayerRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cargarPrayers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get<ApiResponse<PrayerRequest[]>>('/prayers')
      if (response.data.success) {
        setPrayers(response.data.data || [])
      }
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.response?.data?.message || 'Error al cargar oraciones')
      setPrayers([])
    } finally {
      setLoading(false)
    }
  }, [])

  const crearPrayer = useCallback(async (title: string, description: string, isAnonymous: boolean = false) => {
    try {
      const response = await api.post<ApiResponse<PrayerRequest>>('/prayers', { 
        title, 
        description, 
        isAnonymous 
      })
      if (response.data.success && response.data.data) {
        setPrayers(prev => [response.data.data!, ...prev])
        return response.data.data
      }
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.response?.data?.message || 'Error al crear oración')
      throw err
    }
  }, [])

  const unirsePrayer = useCallback(async (id: string) => {
    try {
      const response = await api.post<ApiResponse<{ prayers: string[] }>>(`/prayers/${id}/pray`)
      if (response.data.success && response.data.data) {
        setPrayers(prev =>
          prev.map(p =>
            p._id === id ? { ...p, prayers: response.data.data!.prayers } : p
          )
        )
      }
    } catch (err) {
      const apiError = err as ApiError
      console.error('Error al unirse a oración:', apiError.response?.data?.message)
    }
  }, [])

  return {
    prayers,
    loading,
    error,
    cargarPrayers,
    crearPrayer,
    unirsePrayer
  }
}