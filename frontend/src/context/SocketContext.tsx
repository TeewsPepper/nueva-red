import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'
import { SocketEventCallback } from '../types'

// ========================================
// TIPOS DEL CONTEXTO
// ========================================

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  on: (event: string, callback: SocketEventCallback) => void
  off: (event: string, callback?: SocketEventCallback) => void
  emit: <T = any>(event: string, data?: T) => void  // 👈 TIPO GENÉRICO
}

// ========================================
// CONTEXTO
// ========================================

const SocketContext = createContext<SocketContextType | undefined>(undefined)

interface SocketProviderProps {
  children: ReactNode
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      console.log('⚠️ No hay token, socket no conectado')
      return
    }

    console.log('🔌 Conectando a Socket.io...')

    const socketInstance = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      auth: { token }
    })

    socketInstance.on('connect', () => {
      console.log('✅ Conectado al socket')
      setIsConnected(true)
    })

    socketInstance.on('disconnect', () => {
      console.log('🔌 Desconectado del socket')
      setIsConnected(false)
    })

    socketInstance.on('connect_error', (error: Error) => {
      console.error('❌ Error de conexión al socket:', error.message)
      setIsConnected(false)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [])

  // ========================================
  // FUNCIONES PARA MANEJAR EVENTOS
  // ========================================

  const on = (event: string, callback: SocketEventCallback): void => {
    if (socket) {
      socket.on(event, callback)
    }
  }

  const off = (event: string, callback?: SocketEventCallback): void => {
    if (socket) {
      if (callback) {
        socket.off(event, callback)
      } else {
        socket.off(event)
      }
    }
  }

  const emit = <T = any>(event: string, data?: T): void => {
    if (socket) {
      socket.emit(event, data)
    }
  }

  return (
    <SocketContext.Provider value={{ socket, isConnected, on, off, emit }}>
      {children}
    </SocketContext.Provider>
  )
}

// ========================================
// HOOK PERSONALIZADO
// ========================================

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider')
  }
  return context
}