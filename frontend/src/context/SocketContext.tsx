// context/SocketContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { SocketEventCallback } from '../types'

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  on: (event: string, callback: SocketEventCallback) => void
  off: (event: string, callback?: SocketEventCallback) => void
  emit: <T = any>(event: string, data?: T) => void
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

interface SocketProviderProps {
  children: ReactNode
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false)
  const socketRef = useRef<Socket | null>(null)  // 👈 Solo usar ref, no state
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token')
  })

  // Escuchar cambios en el token
  useEffect(() => {
    const checkToken = () => {
      const newToken = localStorage.getItem('token')
      if (newToken !== token) {
        console.log('🔄 [SocketProvider] Token cambiado:', newToken ? '✅ Presente' : '❌ No presente')
        setToken(newToken)
      }
    }

    checkToken()

    const handleAuthChange = () => {
      checkToken()
    }

    window.addEventListener('authChange', handleAuthChange)

    return () => {
      window.removeEventListener('authChange', handleAuthChange)
    }
  }, [token])

  // Conectar/Desconectar cuando el token cambia
  useEffect(() => {
    // Si no hay token, desconectar
    if (!token) {
      console.log('🔌 [SocketProvider] No hay token, socket no conectado')
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
        setIsConnected(false)
        ;(window as any).socket = null
      }
      return
    }

    // Si ya hay un socket conectado, no hacer nada
    if (socketRef.current && socketRef.current.connected) {
      console.log('✅ [SocketProvider] Socket ya conectado')
      return
    }

    console.log('🔌 [SocketProvider] Conectando a Socket.io con token...')

    const socketInstance = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      auth: { token }
    })

    socketRef.current = socketInstance
    ;(window as any).socket = socketInstance

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

    socketInstance.on('authenticated', () => {
      console.log('✅ Socket autenticado correctamente')
    })

    socketInstance.on('unauthorized', (data: any) => {
      console.error('❌ Socket no autorizado:', data)
      setIsConnected(false)
    })

    socketInstance.connect()

    return () => {
      console.log('🧹 [SocketProvider] Limpiando socket...')
      if (socketInstance) {
        socketInstance.off('connect')
        socketInstance.off('disconnect')
        socketInstance.off('connect_error')
        socketInstance.off('authenticated')
        socketInstance.off('unauthorized')
        socketInstance.disconnect()
      }
      socketRef.current = null
      setIsConnected(false)
      ;(window as any).socket = null
    }
  }, [token])

  const on = (event: string, callback: SocketEventCallback): void => {
    if (socketRef.current) {
      socketRef.current.on(event, callback)
    }
  }

  const off = (event: string, callback?: SocketEventCallback): void => {
    if (socketRef.current) {
      if (callback) {
        socketRef.current.off(event, callback)
      } else {
        socketRef.current.off(event)
      }
    }
  }

  const emit = <T = any>(event: string, data?: T): void => {
    if (socketRef.current) {
      socketRef.current.emit(event, data)
    }
  }

  return (
    <SocketContext.Provider value={{ 
      socket: socketRef.current, 
      isConnected, 
      on, 
      off, 
      emit 
    }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider')
  }
  return context
}