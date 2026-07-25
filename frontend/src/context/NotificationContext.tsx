import React, { createContext, useContext, useState, ReactNode } from 'react'
import api from '../services/api'

interface Notification {
  _id: string
  type: 'like' | 'comment' | 'prayer' | 'event' | 'system'
  title: string
  message: string
  link?: string
  isRead: boolean
  createdAt: string
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  cargarNotificaciones: () => Promise<void>
  marcarComoLeida: (id: string) => Promise<void>
  marcarTodasComoLeidas: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)

  const cargarNotificaciones = async () => {
    setLoading(true)
    try {
      const response = await api.get('/notifications')
      if (response.data.success) {
        setNotifications(response.data.data)
      }
    } catch (error) {
      console.error('Error al cargar notificaciones:', error)
    } finally {
      setLoading(false)
    }
  }

  const marcarComoLeida = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`)
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      )
    } catch (error) {
      console.error('Error al marcar notificación:', error)
    }
  }

  const marcarTodasComoLeidas = async () => {
    try {
      await api.put('/notifications/read-all')
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      )
    } catch (error) {
      console.error('Error al marcar todas las notificaciones:', error)
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        cargarNotificaciones,
        marcarComoLeida,
        marcarTodasComoLeidas
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider')
  }
  return context
}