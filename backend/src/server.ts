import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import { createServer } from 'http'
import { Server as SocketServer } from 'socket.io'
import { connectDB } from './config/database.js'
import router from './routes/index.js'
import { MongoValidationError, MongoDuplicateError } from './types/index.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// 👇 CREAR SERVER HTTP
const server = createServer(app)

// 👇 DECLARAR IO PARA EXPORTAR
let io: SocketServer

// 👇 FUNCIÓN PARA INICIALIZAR SOCKET.IO
const initSocket = () => {
  io = new SocketServer(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
      methods: ['GET', 'POST'],
      allowedHeaders: ['Authorization']
    },
    path: '/socket.io/',
    transports: ['websocket', 'polling']
  })

  io.on('connection', (socket) => {
    console.log('🔌 Cliente conectado:', socket.id)

    // Autenticación del socket
    const token = socket.handshake.auth.token
    if (token) {
      console.log('🔑 Socket autenticado con token')
    }

    socket.on('disconnect', () => {
      console.log('🔌 Cliente desconectado:', socket.id)
    })

    // Evento para notificaciones desde el frontend
    socket.on('nueva_notificacion', (data) => {
      console.log('📨 Notificación recibida desde frontend:', data)
      io.emit('nueva_notificacion', data)
    })
  })

  return io
}

// 👇 FUNCIÓN PARA OBTENER IO DESDE LAS RUTAS
export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io no inicializado')
  }
  return io
}

// Middlewares
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())

// Configuración CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Header para UTF-8
app.use((_req: Request, res: Response, next: NextFunction): void => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  next()
})

// Conectar a la base de datos
await connectDB()

// Rutas
app.use('/api', router)

// Health check
app.get('/api/health', (_req: Request, res: Response): void => {
  res.json({ 
    status: 'OK', 
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  })
})

// Ruta de prueba para roles
app.get('/api/roles-test', (_req: Request, res: Response): void => {
  res.json({
    roles: ['pastor', 'lider', 'miembro', 'visitante'],
    descripcion: {
      pastor: 'Acceso total - Puede crear, editar y eliminar todo',
      lider: 'Puede crear y editar ministerios/eventos donde es líder',
      miembro: 'Puede crear tareas y actividades, unirse a actividades',
      visitante: 'Solo puede ver y unirse a actividades'
    }
  })
})

// Manejo de errores 404
app.use((req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.url}`
  })
})

// Middleware de manejo de errores global
app.use((err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  console.error('❌ Error:', err)

  // Errores de validación de MongoDB
  if (err.name === 'ValidationError') {
    const validationErr = err as unknown as MongoValidationError
    const messages = Object.values(validationErr.errors).map((e) => e.message)
    res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: messages
    })
    return
  }

  // Error de duplicado (email, etc.)
  const mongoErr = err as unknown as MongoDuplicateError
  if (mongoErr.code === 11000) {
    const field = Object.keys(mongoErr.keyPattern)[0]
    res.status(400).json({
      success: false,
      message: `El ${field} ya está en uso`
    })
    return
  }

  // Error general
  res.status(500).json({
    success: false,
    message: err.message || 'Error interno del servidor'
  })
})

// 👇 INICIALIZAR SOCKET.IO
initSocket()

// 👇 USAR SERVER EN VEZ DE APP
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`)
  console.log(`📋 Roles test: http://localhost:${PORT}/api/roles-test`)
  console.log(`🔌 Socket.io corriendo en ws://localhost:${PORT}`)
})

export default app