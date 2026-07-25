import React, { useEffect } from 'react'
import { usePrayers } from '../../hooks/usePrayers'
import { PrayerForm } from './PrayerForm'
import { PrayerRequest } from './PrayerRequest'
import './PrayerList.css'

export const PrayerList: React.FC = () => {
  const { prayers, loading, cargarPrayers } = usePrayers()

  useEffect(() => {
    cargarPrayers()
  }, [])

  if (loading && prayers.length === 0) {
    return (
      <div className="prayer-loading">
        <div className="spinner"></div>
        <p>Cargando pedidos de oración...</p>
      </div>
    )
  }

  return (
    <div className="prayer-list">
      <PrayerForm onPrayerCreated={cargarPrayers} />
      
      {prayers.length === 0 ? (
        <div className="prayer-empty">
          <p>🙏 No hay pedidos de oración</p>
          <p className="prayer-empty-sub">Comparte tu primera petición</p>
        </div>
      ) : (
        <div className="prayer-items">
          {prayers.map(p => (
            <PrayerRequest key={p._id} prayer={p} />
          ))}
        </div>
      )}
    </div>
  )
}