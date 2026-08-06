import { Request } from 'express'
import { IUser } from '../models/User.js'

// ========================================
// TIPOS PARA RESPUESTAS DE API
// ========================================

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  errors?: string[]
  count?: number
}

// ========================================
// TIPOS PARA REQUEST CON USUARIO
// ========================================

export interface AuthRequest extends Request {
  user?: IUser  // 👈 HACER OPCIONAL
}

// ========================================
// TIPOS PARA ERRORES DE MONGODB
// ========================================

export interface MongoValidationError {
  name: 'ValidationError'
  errors: Record<string, { message: string }>
}

export interface MongoDuplicateError {
  code: 11000
  keyPattern: Record<string, number>
}

export type MongoError = MongoValidationError | MongoDuplicateError

// ========================================
// TIPOS PARA RUTAS
// ========================================

export type AsyncRequestHandler = (
  req: AuthRequest,
  res: Response
) => Promise<void>


// ========================================
// TIPOS PARA CLOUDINARY
// ========================================

export interface CloudinaryUploadResult {
  secure_url: string
  public_id: string
  version: number
  width: number
  height: number
  format: string
  resource_type: string
  created_at: string
  bytes: number
  url: string
}

export interface CloudinaryUploadOptions {
  folder: string
  resource_type: 'image' | 'video' | 'raw' | 'auto'
  transformation?: Array<{
    width?: number
    height?: number
    crop?: string
    quality?: string | number
  }>
}
