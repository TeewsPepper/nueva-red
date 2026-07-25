import { useState, useCallback } from 'react'
import api from '../services/api'
import { Notification, ApiError, NotificationsResponse } from '../types'

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const cargarNotificaciones = useCallback(async () => {
    setLoading(true)
    try {
      // 👇 USAR NotificationsResponse en lugar de ApiResponse
      const response = await api.get<NotificationsResponse>('/notifications')
      if (response.data.success) {
        setNotifications(response.data.data || [])
        setUnreadCount(response.data.unreadCount || 0)
      }
    } catch (err) {
      const apiError = err as ApiError
      console.error('Error al cargar notificaciones:', apiError.response?.data?.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const marcarComoLeida = useCallback(async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`)
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      const apiError = err as ApiError
      console.error('Error al marcar notificación:', apiError.response?.data?.message)
    }
  }, [])

  const marcarTodasComoLeidas = useCallback(async () => {
    try {
      await api.put('/notifications/read-all')
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      )
      setUnreadCount(0)
    } catch (err) {
      const apiError = err as ApiError
      console.error('Error al marcar todas:', apiError.response?.data?.message)
    }
  }, [])

  return {
    notifications,
    loading,
    unreadCount,
    cargarNotificaciones,
    marcarComoLeida,
    marcarTodasComoLeidas
  }
}