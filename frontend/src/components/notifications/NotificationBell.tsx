import React, { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { useSocket } from '../../context/SocketContext'
import { useNotifications } from '../../hooks/useNotifications'
import { NotificationList } from './NotificationList'
import './NotificationBell.css'

interface NotificacionData {
  userId: string
  type: string
  message: string
  link: string
}

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { unreadCount, cargarNotificaciones } = useNotifications()
  const { socket, isConnected } = useSocket()

  useEffect(() => {
    cargarNotificaciones()
  }, [])

  useEffect(() => {
    if (!socket) return

    console.log('🔔 Escuchando notificaciones en tiempo real...')

    const handleNuevaNotificacion = (data: NotificacionData) => {
      console.log('🔔 Notificación en tiempo real recibida:', data)
      cargarNotificaciones()
    }

    socket.on('nueva_notificacion', handleNuevaNotificacion)

    return () => {
      socket.off('nueva_notificacion', handleNuevaNotificacion)
    }
  }, [socket, cargarNotificaciones])

  return (
    <div className="notification-bell-container">
      <button 
        className="notification-bell"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
        {!isConnected && (
          <span className="connection-dot offline" title="Sin conexión en tiempo real" />
        )}
      </button>
      
      {isOpen && (
        <div className="notification-dropdown">
          <NotificationList onClose={() => setIsOpen(false)} />
        </div>
      )}
    </div>
  )
}