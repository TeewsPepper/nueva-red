// hooks/useNotifications.ts
import { useState, useCallback, useEffect } from "react";
import api from "../services/api";
import { Notification, ApiError, NotificationsResponse } from "../types";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const cargarNotificaciones = useCallback(async () => {
    console.log("📥 [useNotifications] Cargando notificaciones...");
    setLoading(true);
    try {
      const response = await api.get<NotificationsResponse>("/notifications");
      console.log("📥 [useNotifications] Respuesta:", response.data);

      if (response.data.success) {
        console.log(
          "📥 [useNotifications] Datos recibidos:",
          response.data.data?.length || 0,
        );
        setNotifications(response.data.data || []);
        setUnreadCount(response.data.unreadCount || 0);
        console.log("✅ [useNotifications] Estado actualizado:", {
          notifications: response.data.data?.length || 0,
          unreadCount: response.data.unreadCount || 0,
        });
      }
    } catch (err) {
      const apiError = err as ApiError;
      console.error(
        "❌ [useNotifications] Error:",
        apiError.response?.data?.message,
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // 👇 AGREGAR ESTO: Cargar notificaciones al montar el hook
  useEffect(() => {
    console.log("🔄 [useNotifications] Montado, cargando notificaciones...");
    cargarNotificaciones();
  }, [cargarNotificaciones]);

  const marcarComoLeida = useCallback(
    async (id: string) => {
      try {
        console.log(`🔔 [useNotifications] Marcando como leída: ${id}`);
        await api.put(`/notifications/${id}/read`);

        // 👇 ACTUALIZAR ESTADO LOCAL
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
        );

        // 👇 DECREMENTAR UNREAD COUNT
        setUnreadCount((prev) => {
          const newCount = Math.max(0, prev - 1);
          console.log(
            `🔔 [useNotifications] unreadCount: ${prev} → ${newCount}`,
          );
          return newCount;
        });

        // 👇 FORZAR RECARGA DESDE EL BACKEND (para sincronizar)
        await cargarNotificaciones();

        console.log("✅ [useNotifications] Notificación marcada como leída");
      } catch (err) {
        const apiError = err as ApiError;
        console.error(
          "Error al marcar notificación:",
          apiError.response?.data?.message,
        );
      }
    },
    [cargarNotificaciones],
  );

  const marcarTodasComoLeidas = useCallback(async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      const apiError = err as ApiError;
      console.error("Error al marcar todas:", apiError.response?.data?.message);
    }
  }, []);

  return {
    notifications,
    loading,
    unreadCount,
    cargarNotificaciones,
    marcarComoLeida,
    marcarTodasComoLeidas,
  };
};
