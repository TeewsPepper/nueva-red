import React, { useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import './Toast.css'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastProps {
  message: string
  type?: ToastType
  duration?: number
  onClose: () => void
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 3000,
  onClose
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle size={20} />
      case 'error': return <AlertCircle size={20} />
      case 'warning': return <AlertTriangle size={20} />
      default: return <Info size={20} />
    }
  }

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-icon">{getIcon()}</div>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose}>
        <X size={16} />
      </button>
    </div>
  )
}