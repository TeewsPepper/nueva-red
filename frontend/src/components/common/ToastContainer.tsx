import React from 'react'
import { Toast } from './Toast'
import { useToast } from '../../hooks/useToast'
import './Toast.css'

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast()

  return (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  )
}