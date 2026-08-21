import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useMinisterios } from "../hooks/useMinisterios";
import { useEventos } from "../hooks/useEventos";
import { useTareas } from "../hooks/useTareas";
import { useBreak } from "../hooks/useBreak";
import { DashboardHeader } from "../components/dashboard/DashboardHeader";
import { MinisterioList } from "../components/iglesia/Ministerios/MinisterioList";
import { EventoList } from "../components/iglesia/Eventos/EventoList";
import { TareaList } from "../components/iglesia/Tareas/TareaList";
import { ActividadList } from "../components/iglesia/Actividades/ActividadList";
import { SolicitudesPanel } from "../components/dashboard/Solicitudes/SolicitudesPanel";
import { useToast } from "../hooks/useToast";
import { Toast } from "../components/common/Toast";
import { Ministerio, Evento, Tarea, BreakActivity, ApiError } from "../types";
import { Feed } from "../components/feed/Feed";
import { RolesPanel } from "../components/dashboard/Roles/RolesPanel";
import { Home, Shield } from "lucide-react";
import api from "../services/api";
import "./IglesiaDashboard.css";

import { Users, Calendar, CheckSquare, Target, Mail, Lock } from "lucide-react";

type TabType =
  | "ministerios"
  | "eventos"
  | "tareas"
  | "actividades"
  | "solicitudes"
  | "muro"
  | "roles";

type TabConfig = {
  id: TabType;
  label: string;
  icon: React.ElementType; // 👈 TIPO CORRECTO PARA ICONOS DE LUCIDE
};

export const IglesiaDashboard = () => {
  const {
    user,
    logout,
    canCreateMinisterio,
    canCreateEvento,
    canCreateTarea,
    hasRole,
  } = useAuth();

  const { ministerios, cargarMinisterios } = useMinisterios();
  const { eventos, cargarEventos } = useEventos();
  const { tareas, cargarTareas } = useTareas();
  const { actividades, cargarActividades } = useBreak();

  const [activeTab, setActiveTab] = useState<TabType>("ministerios");
  const [loading, setLoading] = useState(false);

  const { toasts, removeToast, success, error: toastError } = useToast();

  // Estados para formularios y edición
  const [showMinisterioForm, setShowMinisterioForm] = useState(false);
  const [showEventoForm, setShowEventoForm] = useState(false);
  const [showTareaForm, setShowTareaForm] = useState(false);
  const [showActividadForm, setShowActividadForm] = useState(false);

  const [editandoMinisterio, setEditandoMinisterio] =
    useState<Ministerio | null>(null);
  const [editandoEvento, setEditandoEvento] = useState<Evento | null>(null);
  const [editandoTarea, setEditandoTarea] = useState<Tarea | null>(null);
  const [editandoActividad, setEditandoActividad] =
    useState<BreakActivity | null>(null);

  // Determinar qué tabs mostrar
  const getAvailableTabs = (): TabConfig[] => {
    const tabs: TabConfig[] = [
      { id: "ministerios", label: "Ministerios", icon: Users },
      { id: "eventos", label: "Eventos", icon: Calendar },
      { id: "tareas", label: "Tareas", icon: CheckSquare },
      { id: "actividades", label: "Actividades", icon: Target },
      { id: "muro", label: "Muro", icon: Home }, // 👈 NUEVO
      { id: "solicitudes", label: "Solicitudes", icon: Mail },
    ];

    // 👇 SOLO PASTORES VEN LA PESTAÑA DE ROLES
    if (user?.role === "pastor") {
      tabs.push({ id: "roles", label: "Roles", icon: Shield });
    }

    return tabs;
  };

  // Cargar datos
  useEffect(() => {
    if (user) {
      cargarMinisterios();
      cargarEventos();
      cargarTareas();
      cargarActividades();
    }
  }, [user]);

  // Handlers
  const handleEditMinisterio = (id: string) => {
    const ministerio = ministerios.find((m) => m._id === id);
    if (ministerio) {
      setEditandoMinisterio(ministerio);
      setShowMinisterioForm(true);
    }
  };

  const handleEditEvento = (id: string) => {
    const evento = eventos.find((e) => e._id === id);
    if (evento) {
      setEditandoEvento(evento);
      setShowEventoForm(true);
    }
  };

  const handleDeleteMinisterio = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este ministerio?")) return;
    try {
      setLoading(true);
      await api.delete(`/ministerios/${id}`);
      await cargarMinisterios();
      success("✅ Ministerio eliminado correctamente");
    } catch (err) {
      const apiError = err as ApiError;
      console.error("Error al eliminar ministerio:", err);
      toastError(
        apiError.response?.data?.message ||
          "❌ Error al eliminar el ministerio",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvento = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este evento?")) return;
    try {
      setLoading(true);
      await api.delete(`/eventos/${id}`);
      await cargarEventos();
      success("✅ Evento eliminado correctamente");
    } catch (err) {
      const apiError = err as ApiError;
      console.error("Error al eliminar evento:", err);
      toastError(
        apiError.response?.data?.message || "❌ Error al eliminar el evento",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUnirseActividad = async (id: string) => {
    try {
      setLoading(true);
      const response = await api.post(`/break/actividades/${id}/unirse`);
      if (response.data.success) {
        success("✅ Te has unido a la actividad");
        await cargarActividades();
      }
    } catch (err) {
      const apiError = err as ApiError;
      console.error("Error al unirse a actividad:", err);
      const message =
        apiError.response?.data?.message || "Error al unirse a la actividad";
      toastError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSalirActividad = async (id: string) => {
    try {
      setLoading(true);
      const response = await api.post(`/break/actividades/${id}/salir`);
      if (response.data.success) {
        success("✅ Has salido de la actividad");
        await cargarActividades();
      }
    } catch (err) {
      const apiError = err as ApiError;
      console.error("Error al salir de actividad:", err);
      const message =
        apiError.response?.data?.message || "Error al salir de la actividad";
      toastError(message);
    } finally {
      setLoading(false);
    }
  };

  // Form success handlers
  const handleMinisterioCreado = () => {
    setShowMinisterioForm(false);
    setEditandoMinisterio(null);
    cargarMinisterios();
    success("✅ Ministerio creado correctamente");
  };

  const handleEventoCreado = () => {
    setShowEventoForm(false);
    setEditandoEvento(null);
    cargarEventos();
    success("✅ Evento creado correctamente");
  };

  const handleTareaCreada = () => {
    setShowTareaForm(false);
    setEditandoTarea(null);
    cargarTareas();
    success("✅ Tarea creada correctamente");
  };

  const handleActividadCreada = () => {
    setShowActividadForm(false);
    setEditandoActividad(null);
    cargarActividades();
    success("✅ Actividad creada correctamente");
  };

  // Helpers de permisos
  const canEditMinisterio = (ministerio: Ministerio): boolean => {
    if (!user) return false;
    if (user.role === "pastor") return true;
    const liderId =
      typeof ministerio.liderId === "string"
        ? ministerio.liderId
        : ministerio.liderId?._id;
    return liderId === user._id;
  };

  const canEditEvento = (evento: Evento): boolean => {
    if (!user) return false;
    if (user.role === "pastor") return true;
    const creadorId =
      typeof evento.creadoPor === "string"
        ? evento.creadoPor
        : evento.creadoPor?._id;
    return creadorId === user._id;
  };

  if (!user) {
    return (
      <div className="iglesia-dashboard">
        <DashboardHeader userEmail="" onLogout={logout} />
        <div className="dashboard-content">
          <div className="empty-state">
            <Lock className="empty-icon" size={48} />
            <p>Por favor, inicia sesión para acceder al dashboard</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="iglesia-dashboard">
      {/* Toasts */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}

      <DashboardHeader
        userEmail={user?.email || ""}
        userRole={user?.role || "miembro"}
        onLogout={logout}
      />

      <div className="dashboard-content">
        {/* Tabs */}
        <div className="tabs">
          {getAvailableTabs().map((tab) => (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenido de cada tab */}
        <div className="tab-content">
          {activeTab === "ministerios" && (
            <MinisterioList
              ministerios={ministerios}
              loading={loading}
              canCreate={canCreateMinisterio()}
              canEdit={canEditMinisterio}
              canDelete={user.role === "pastor"}
              showForm={showMinisterioForm}
              editData={editandoMinisterio}
              onNew={() => {
                setEditandoMinisterio(null);
                setShowMinisterioForm(true);
              }}
              onEdit={handleEditMinisterio}
              onDelete={handleDeleteMinisterio}
              onFormSuccess={handleMinisterioCreado}
              onFormCancel={() => {
                setShowMinisterioForm(false);
                setEditandoMinisterio(null);
              }}
            />
          )}

          {activeTab === "eventos" && (
            <EventoList
              eventos={eventos}
              loading={loading}
              canCreate={canCreateEvento()}
              canEdit={canEditEvento}
              canDelete={user.role === "pastor"}
              showForm={showEventoForm}
              editData={editandoEvento}
              onNew={() => {
                setEditandoEvento(null);
                setShowEventoForm(true);
              }}
              onEdit={handleEditEvento}
              onDelete={handleDeleteEvento}
              onFormSuccess={handleEventoCreado}
              onFormCancel={() => {
                setShowEventoForm(false);
                setEditandoEvento(null);
              }}
            />
          )}

          {activeTab === "tareas" && (
            <TareaList
              tareas={tareas}
              loading={loading}
              canCreate={canCreateTarea()}
              showForm={showTareaForm}
              editData={editandoTarea}
              onNew={() => {
                setEditandoTarea(null);
                setShowTareaForm(true);
              }}
              onEdit={(id) => {
                const tarea = tareas.find((t) => t._id === id);
                if (tarea) {
                  setEditandoTarea(tarea);
                  setShowTareaForm(true);
                }
              }}
              onDelete={async (id) => {
                if (!confirm("¿Estás seguro de eliminar esta tarea?")) return;
                try {
                  setLoading(true);
                  await api.delete(`/tareas/${id}`);
                  await cargarTareas();
                  success("✅ Tarea eliminada correctamente");
                } catch (err) {
                  const apiError = err as ApiError;
                  console.error("Error al eliminar tarea:", err);
                  toastError(
                    apiError.response?.data?.message ||
                      "❌ Error al eliminar la tarea",
                  );
                } finally {
                  setLoading(false);
                }
              }}
              onCompletar={async (id) => {
                try {
                  setLoading(true);
                  await api.patch(`/tareas/${id}/completar`);
                  await cargarTareas();
                  success("✅ Tarea completada");
                } catch (err) {
                  const apiError = err as ApiError;
                  console.error("Error al completar tarea:", err);
                  toastError(
                    apiError.response?.data?.message ||
                      "❌ Error al completar la tarea",
                  );
                } finally {
                  setLoading(false);
                }
              }}
              onFormSuccess={handleTareaCreada}
              onFormCancel={() => {
                setShowTareaForm(false);
                setEditandoTarea(null);
              }}
            />
          )}

          {activeTab === "actividades" && (
            <ActividadList
              actividades={actividades}
              loading={loading}
              canCreate={hasRole(["pastor", "lider", "miembro"])}
              canJoin={hasRole(["pastor", "lider", "miembro", "visitante"])}
              showForm={showActividadForm}
              editData={editandoActividad}
              onNew={() => {
                setEditandoActividad(null);
                setShowActividadForm(true);
              }}
              onEdit={(id) => {
                const actividad = actividades.find((a) => a._id === id);
                if (actividad) {
                  setEditandoActividad(actividad);
                  setShowActividadForm(true);
                }
              }}
              onDelete={async (id) => {
                if (!confirm("¿Estás seguro de eliminar esta actividad?"))
                  return;
                try {
                  setLoading(true);
                  await api.delete(`/break/actividades/${id}`);
                  await cargarActividades();
                  success("✅ Actividad eliminada correctamente");
                } catch (err) {
                  const apiError = err as ApiError;
                  console.error("Error al eliminar actividad:", err);
                  toastError(
                    apiError.response?.data?.message ||
                      "❌ Error al eliminar la actividad",
                  );
                } finally {
                  setLoading(false);
                }
              }}
              onJoin={handleUnirseActividad}
              onSalir={handleSalirActividad}
              onFormSuccess={handleActividadCreada}
              onFormCancel={() => {
                setShowActividadForm(false);
                setEditandoActividad(null);
              }}
            />
          )}

          {activeTab === "solicitudes" && (
            <SolicitudesPanel
              onSolicitudCreada={() => {
                cargarMinisterios();
                console.log("Solicitud creada, recargando...");
              }}
            />
          )}

          
          {activeTab === "muro" && (
            <div className="tab-muro">
              <Feed />
            </div>
          )}

          
          {activeTab === "roles" && user?.role === "pastor" && (
            <div className="tab-roles">
              <RolesPanel />
            </div>
          )}
        </div>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}
    </div>
  );
};
