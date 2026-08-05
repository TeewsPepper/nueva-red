// components/notifications/NotificationBell.tsx
import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { useSocket } from '../../context/SocketContext'
import { useNotifications } from '../../hooks/useNotifications'
import { NotificationList } from './NotificationList'
import { NotificacionData } from '../../types'  // 👈 IMPORTAR DESDE TYPES
import './NotificationBell.css'

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { unreadCount, notifications, cargarNotificaciones } = useNotifications()
  const { socket, isConnected } = useSocket()
  const location = useLocation()

  // 👇 RECARGAR AL ABRIR EL DROPDOWN
  const handleToggle = () => {
    if (!isOpen) {
      console.log('🔔 [NotificationBell] Abriendo dropdown, recargando notificaciones...')
      cargarNotificaciones()
    }
    setIsOpen(!isOpen)
  }

  useEffect(() => {
    console.log('🔄 [NotificationBell] URL cambiada, recargando notificaciones...')
    cargarNotificaciones()
  }, [location.pathname, cargarNotificaciones])

  useEffect(() => {
    console.log('🔄 [NotificationBell] Montado, cargando notificaciones...')
    cargarNotificaciones()
  }, [cargarNotificaciones])

  useEffect(() => {
    if (!socket) {
      console.log('⚠️ [NotificationBell] Socket no disponible')
      return
    }

    console.log('🔔 [NotificationBell] Escuchando notificaciones en tiempo real...')

    const handleNuevaNotificacion = (data: NotificacionData) => {
      console.log('🔔 [NotificationBell] Notificación en tiempo real recibida:', data)
      cargarNotificaciones()
    }

    socket.on('nueva_notificacion', handleNuevaNotificacion)

    return () => {
      socket.off('nueva_notificacion', handleNuevaNotificacion)
    }
  }, [socket, cargarNotificaciones])

  console.log('🔔 [NotificationBell] Renderizando:', {
    unreadCount,
    notificationsLength: notifications.length,
    isOpen
  })

  return (
    <div className="notification-bell-container">
      <button 
        className="notification-bell"
        onClick={handleToggle}  // 👈 USAR handleToggle
        aria-label="Notificaciones"
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