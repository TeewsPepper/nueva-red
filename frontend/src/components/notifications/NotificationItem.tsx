// components/notifications/NotificationItem.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Notification } from "../../types";
import "./NotificationItem.css";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onClose: () => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onClose,
}) => {
  const navigate = useNavigate();

  // 👇 HACER LA FUNCIÓN ASYNC
  const handleClick =  () => {
    console.log(
      "🔔 [NotificationItem] Click en notificación:",
      notification._id,
    );

    // Marcar como leída
    if (!notification.isRead) {
      console.log("🔔 [NotificationItem] Marcando como leída...");
       onMarkAsRead(notification._id);
    }

    // Cerrar dropdown
    onClose();

    // Redirigir al link
    if (notification.link) {
      console.log("🔔 [NotificationItem] Redirigiendo a:", notification.link);
      // 👇 USAR NAVIGATE EN LUGAR DE window.location.href
      navigate(notification.link, { replace: true });
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case "like":
        return "❤️";
      case "like_comment": // 👈 NUEVO
        return "❤️";
      case "comment":
        return "💬";
      case "prayer":
        return "🙏";
      case "event":
        return "📅";
      default:
        return "🔔";
    }
  };

  return (
    <div
      className={`notification-item ${!notification.isRead ? "unread" : ""}`}
      onClick={handleClick}
    >
      <div className="notification-icon">
        <span className="notification-emoji">{getIcon()}</span>
      </div>
      <div className="notification-content">
        <div className="notification-title">{notification.title}</div>
        <div className="notification-message">{notification.message}</div>
        <div className="notification-time">
          {new Date(notification.createdAt).toLocaleString("es-ES", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
      {!notification.isRead && <div className="notification-unread-dot" />}
    </div>
  );
};
