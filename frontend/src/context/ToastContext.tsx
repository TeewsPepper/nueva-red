import React, { createContext, useState, useCallback, ReactNode } from 'react'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  showToast: (message: string, type: Toast['type'], duration?: number) => void
  removeToast: (id: string) => void
  success: (message: string, duration?: number) => void
  error: (message: string, duration?: number) => void
  info: (message: string, duration?: number) => void
  warning: (message: string, duration?: number) => void
}

// ✅ EXPORTAR EL CONTEXTO
export const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((
    message: string,
    type: Toast['type'] = 'info',
    duration: number = 3000
  ) => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, message, type, duration }])

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const success = useCallback((message: string, duration?: number) => {
    showToast(message, 'success', duration)
  }, [showToast])

  const error = useCallback((message: string, duration?: number) => {
    showToast(message, 'error', duration)
  }, [showToast])

  const info = useCallback((message: string, duration?: number) => {
    showToast(message, 'info', duration)
  }, [showToast])

  const warning = useCallback((message: string, duration?: number) => {
    showToast(message, 'warning', duration)
  }, [showToast])

  return (
    <ToastContext.Provider value={{
      toasts,
      showToast,
      removeToast,
      success,
      error,
      info,
      warning
    }}>
      {children}
    </ToastContext.Provider>
  )
}