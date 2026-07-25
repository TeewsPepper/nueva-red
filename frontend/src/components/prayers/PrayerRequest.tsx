import React from 'react'
import { User, Heart, Lock, CheckCircle } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { usePrayers } from '../../hooks/usePrayers'
import './PrayerRequest.css'

interface PrayerRequestProps {
  prayer: {
    _id: string
    author: { _id: string; name: string }
    title: string
    description: string
    isAnonymous: boolean
    prayers: string[]
    isAnswered: boolean
    createdAt: string
  }
}

export const PrayerRequest: React.FC<PrayerRequestProps> = ({ prayer }) => {
  const { user } = useAuth()
  const { unirsePrayer } = usePrayers()
  const hasPrayed = prayer.prayers.includes(user?._id || '')
  const displayName = prayer.isAnonymous ? 'Anónimo' : prayer.author.name

  const handlePray = () => {
    unirsePrayer(prayer._id)
  }

  return (
    <div className={`prayer-request ${prayer.isAnswered ? 'answered' : ''}`}>
      <div className="prayer-header">
        <div className="prayer-author">
          <div className="prayer-avatar">
            {prayer.isAnonymous ? <Lock size={18} /> : <User size={18} />}
          </div>
          <div>
            <div className="prayer-name">{displayName}</div>
            <div className="prayer-date">
              {new Date(prayer.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
        {prayer.isAnswered && (
          <span className="prayer-answered-badge">
            <CheckCircle size={14} /> Contestada
          </span>
        )}
      </div>

      <h4 className="prayer-title">{prayer.title}</h4>
      <p className="prayer-description">{prayer.description}</p>

      <div className="prayer-footer">
        <button 
          className={`btn-pray ${hasPrayed ? 'prayed' : ''}`}
          onClick={handlePray}
        >
          <Heart size={16} fill={hasPrayed ? '#ef4444' : 'none'} />
          {hasPrayed ? 'Oraste' : 'Orar'} ({prayer.prayers.length})
        </button>
      </div>
    </div>
  )
}