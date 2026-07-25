import React, { useState, useEffect } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { SolicitarMinisterioModal } from './SolicitarMinisterioModal'
import api from '../../../services/api'
import { SolicitudMinisterio } from '../../../types'
import { useToast } from '../../../hooks/useToast'
import { Check, X, Clock, User, Calendar } from 'lucide-react'
import './SolicitudesPanel.css'

interface SolicitudesPanelProps {
  onSolicitudCreada?: () => void
}

export const SolicitudesPanel: React.FC<SolicitudesPanelProps> = ({  
  onSolicitudCreada 
}) => {
  const { user, isAdmin, isLider } = useAuth()
  const { success, error: toastError } = useToast()
  const [solicitudes, setSolicitudes] = useState<SolicitudMinisterio[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState('')
  const [filtro, setFiltro] = useState<'todas' | 'pendiente' | 'aprobada' | 'rechazada'>('todas')

  const puedeCrearSolicitud = () => {
    return ['pastor', 'lider', 'miembro'].includes(user?.role || '')
  }

  const puedeGestionarSolicitudes = () => {
    return isAdmin() || isLider()
  }

  useEffect(() => {
    if (puedeGestionarSolicitudes()) {
      fetchSolicitudes()
    }
  }, [])

  const fetchSolicitudes = async () => {
    try {
      const response = await api.get('/solicitudes')
      if (response.data.success) {
        setSolicitudes(response.data.data)
      }
    } catch (error) {
      const message = 'Error al cargar solicitudes'
      setError(message)
      toastError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleAprobar = async (id: string) => {
    if (!confirm('¿Estás seguro de aprobar esta solicitud?')) return
    
    try {
      await api.put(`/solicitudes/${id}/aprobar`)
      await fetchSolicitudes()
      
      // Notificar para actualizar ministerios
      if (onSolicitudCreada) {
        onSolicitudCreada()
      }
      
      success('✅ Solicitud aprobada y ministerio creado')
    } catch (error) {
      const message = 'Error al aprobar solicitud'
      setError(message)
      toastError(message)
    }
  }

  const handleRechazar = async (id: string) => {
    const motivo = prompt('Motivo del rechazo:')
    if (motivo === null) return
    
    try {
      await api.put(`/solicitudes/${id}/rechazar`, { motivo })
      await fetchSolicitudes()
      success('✅ Solicitud rechazada')
    } catch (error) {
      const message = 'Error al rechazar solicitud'
      setError(message)
      toastError(message)
    }
  }

  const getEstadoBadge = (estado: string) => {
    const config = {
      pendiente: { className: 'badge-pendiente', icon: Clock },
      aprobada: { className: 'badge-aprobada', icon: Check },
      rechazada: { className: 'badge-rechazada', icon: X },
    }
    const { className, icon: Icon } = config[estado as keyof typeof config]
    return (
      <span className={`solicitud-badge ${className}`}>
        <Icon size={14} />
        {estado.charAt(0).toUpperCase() + estado.slice(1)}
      </span>
    )
  }

  // Miembros: solo ven el botón para solicitar
  if (!puedeGestionarSolicitudes()) {
    return (
      <div className="solicitudes-panel">
        <div className="solicitudes-header">
          <h3>Solicitar Nuevo Ministerio</h3>
          {puedeCrearSolicitud() && (
            <button 
              className="btn-solicitar"
              onClick={() => setShowModal(true)}
            >
              + Solicitar Ministerio
            </button>
          )}
        </div>
        <div className="solicitudes-info">
          <p>Como miembro puedes solicitar la creación de nuevos ministerios.</p>
          <p>Tu solicitud será revisada por los pastores y líderes.</p>
          <p className="text-sm">
            <Clock size={14} className="inline" />
            El proceso de aprobación puede tomar algunos días.
          </p>
        </div>

        {showModal && (
          <SolicitarMinisterioModal
            onClose={() => setShowModal(false)}
            onSuccess={() => {
              setShowModal(false)
              if (onSolicitudCreada) onSolicitudCreada()
            }}
          />
        )}
      </div>
    )
  }

  // Pastores y líderes: ven el panel completo
  return (
    <div className="solicitudes-panel">
      <div className="solicitudes-header">
        <h3>Solicitudes de Ministerios</h3>
        <div className="solicitudes-actions">
          {puedeCrearSolicitud() && (
            <button 
              className="btn-solicitar"
              onClick={() => setShowModal(true)}
            >
              + Solicitar Ministerio
            </button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="solicitudes-filtros">
        <button 
          className={`filtro-btn ${filtro === 'todas' ? 'active' : ''}`}
          onClick={() => setFiltro('todas')}
        >
          Todas ({solicitudes.length})
        </button>
        <button 
          className={`filtro-btn ${filtro === 'pendiente' ? 'active' : ''}`}
          onClick={() => setFiltro('pendiente')}
        >
          Pendientes ({solicitudes.filter(s => s.estado === 'pendiente').length})
        </button>
        <button 
          className={`filtro-btn ${filtro === 'aprobada' ? 'active' : ''}`}
          onClick={() => setFiltro('aprobada')}
        >
          Aprobadas ({solicitudes.filter(s => s.estado === 'aprobada').length})
        </button>
        <button 
          className={`filtro-btn ${filtro === 'rechazada' ? 'active' : ''}`}
          onClick={() => setFiltro('rechazada')}
        >
          Rechazadas ({solicitudes.filter(s => s.estado === 'rechazada').length})
        </button>
      </div>

      {error && (
        <div className="solicitudes-error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="solicitudes-loading">
          <div className="spinner"></div>
          <p>Cargando solicitudes...</p>
        </div>
      ) : solicitudes.length === 0 ? (
        <div className="solicitudes-empty">
          <p>No hay solicitudes</p>
          <p className="text-sm">Las solicitudes de nuevos ministerios aparecerán aquí</p>
        </div>
      ) : (
        <div className="solicitudes-list">
          {solicitudes
            .filter(s => filtro === 'todas' || s.estado === filtro)
            .map((solicitud) => (
              <div key={solicitud._id} className="solicitud-card">
                <div className="solicitud-header">
                  <h4>{solicitud.nombre}</h4>
                  {getEstadoBadge(solicitud.estado)}
                </div>
                
                <p className="solicitud-descripcion">{solicitud.descripcion}</p>
                
                <div className="solicitud-info">
                  <div className="info-item">
                    <span className="info-label">
                      <User size={14} className="icon" />
                      Líder propuesto
                    </span>
                    <span className="info-value">
                      {typeof solicitud.liderPropuesto === 'object' 
                        ? solicitud.liderPropuesto.name 
                        : 'Cargando...'}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">
                      <User size={14} className="icon" />
                      Solicitante
                    </span>
                    <span className="info-value">
                      {typeof solicitud.creadorId === 'object' 
                        ? solicitud.creadorId.name 
                        : 'Cargando...'}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">
                      <Calendar size={14} className="icon" />
                      Fecha
                    </span>
                    <span className="info-value">
                      {new Date(solicitud.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {solicitud.rechazoMotivo && (
                    <div className="info-item">
                      <span className="info-label">Motivo de rechazo</span>
                      <span className="info-value text-red-600">{solicitud.rechazoMotivo}</span>
                    </div>
                  )}
                </div>

                {/* Botones de acción - solo pastores pueden aprobar/rechazar */}
                {isAdmin() && solicitud.estado === 'pendiente' && (
                  <div className="solicitud-actions">
                    <button 
                      className="btn-aprobar"
                      onClick={() => handleAprobar(solicitud._id)}
                    >
                      Aprobar
                    </button>
                    <button 
                      className="btn-rechazar"
                      onClick={() => handleRechazar(solicitud._id)}
                    >
                      Rechazar
                    </button>
                  </div>
                )}
              </div>
            ))
          }
        </div>
      )}

      {showModal && (
        <SolicitarMinisterioModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false)
            fetchSolicitudes()
            if (onSolicitudCreada) onSolicitudCreada()
          }}
        />
      )}
    </div>
  )
}