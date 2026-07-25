import React, { useState } from 'react'
import { Send, Lock, Heart} from 'lucide-react'  // 👈 AGREGAR Heart
import { usePrayers } from '../../hooks/usePrayers'
import './PrayerForm.css'

interface PrayerFormProps {
  onPrayerCreated?: () => void
}

export const PrayerForm: React.FC<PrayerFormProps> = ({ onPrayerCreated }) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [loading, setLoading] = useState(false)
  const { crearPrayer } = usePrayers()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !description.trim() || loading) return

    setLoading(true)
    try {
      await crearPrayer(title.trim(), description.trim(), isAnonymous)
      setTitle('')
      setDescription('')
      setIsAnonymous(false)
      if (onPrayerCreated) onPrayerCreated()
    } catch (error) {
      console.error('Error al crear oración:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="prayer-form" onSubmit={handleSubmit}>
      <div className="prayer-form-header">
        <h4>
          <Heart className="h-5 w-5 inline-block mr-2 text-red-500" />  {/* 👈 ICONO EN VEZ DE EMOJI */}
          Compartir Pedido de Oración
        </h4>
      </div>

      <input
        type="text"
        placeholder="Título (ej: Oración por salud)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={100}
        disabled={loading}
        required
      />

      <textarea
        placeholder="Describe tu petición..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        maxLength={500}
        rows={3}
        disabled={loading}
        required
      />

      <div className="prayer-form-options">
        <label className="prayer-anonymous">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            disabled={loading}
          />
          <Lock size={14} />
          Publicar anónimamente
        </label>
      </div>

      <button type="submit" className="btn-prayer-submit" disabled={!title.trim() || !description.trim() || loading}>
        <Send size={18} />
        {loading ? 'Compartiendo...' : 'Compartir Oración'}
      </button>
    </form>
  )
}