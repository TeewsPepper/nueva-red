// components/notifications/NotificationList.tsx
import React from 'react'
import { useNotifications } from '../../hooks/useNotifications'
import { NotificationItem } from './NotificationItem'
import './NotificationList.css'

interface NotificationListProps {
  onClose: () => void
}

export const NotificationList: React.FC<NotificationListProps> = ({ onClose }) => {
  const { notifications, loading, marcarComoLeida, marcarTodasComoLeidas } = useNotifications()

  const hasUnread = notifications.some(n => !n.isRead)

  if (loading) {
    return <div className="notification-loading">Cargando notificaciones...</div>
  }

  return (
    <div className="notification-list">
      <div className="notification-header">
        <h3>🔔 Notificaciones</h3>
        {hasUnread && (
          <button 
            className="mark-all-read-btn" 
            onClick={marcarTodasComoLeidas}
          >
            Marcar todas como leídas
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="notification-empty">No hay notificaciones</p>
      ) : (
        <div className="notification-items">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification._id}
              notification={notification}
              onMarkAsRead={marcarComoLeida}
              onClose={onClose}
            />
          ))}
        </div>
      )}
    </div>
  )
}