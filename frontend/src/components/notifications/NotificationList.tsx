import React, { useEffect } from 'react'
import { Bell, Check } from 'lucide-react'
import { useNotifications } from '../../hooks/useNotifications'
import { Notification } from '../../types'
import './NotificationList.css'

interface NotificationListProps {
  onClose?: () => void
}

export const NotificationList: React.FC<NotificationListProps> = ({ onClose }) => {
  const { notifications, loading, cargarNotificaciones, marcarComoLeida, marcarTodasComoLeidas } = useNotifications()

  useEffect(() => {
    cargarNotificaciones()
  }, [])

  const handleClick = (id: string): void => {
    marcarComoLeida(id)
    if (onClose) onClose()
  }

  const getIcon = (type: string): string => {
    switch (type) {
      case 'like': return '❤️'
      case 'comment': return '💬'
      case 'prayer': return '🙏'
      case 'event': return '📅'
      default: return '🔔'
    }
  }

  if (loading) {
    return <div className="notification-loading">Cargando...</div>
  }

  return (
    <div className="notification-list">
      <div className="notification-header">
        <h3>Notificaciones</h3>
        {notifications.some((n: Notification) => !n.isRead) && (
          <button className="btn-mark-all" onClick={marcarTodasComoLeidas}>
            <Check size={14} /> Marcar todas
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="notification-empty">
          <Bell size={32} />
          <p>No tienes notificaciones</p>
        </div>
      ) : (
        <div className="notification-items">
          {notifications.map((n: Notification) => (
            <div 
              key={n._id} 
              className={`notification-item ${!n.isRead ? 'unread' : ''}`}
              onClick={() => handleClick(n._id)}
            >
              <div className="notification-icon">{getIcon(n.type)}</div>
              <div className="notification-content">
                <div className="notification-title">{n.title}</div>
                <div className="notification-message">{n.message}</div>
                <div className="notification-date">
                  {new Date(n.createdAt).toLocaleDateString()}
                </div>
              </div>
              {!n.isRead && <div className="notification-dot" />}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}