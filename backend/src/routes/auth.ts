import express, { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import User, { IUser } from '../models/User.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// Registrar usuario
router.post('/register', async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, email, password, role, churchName, phone } = req.body

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      })
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'miembro',
      churchName,
      phone
    })

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    )

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax'
    })

    return res.status(201).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          churchName: user.churchName,
          phone: user.phone
        },
        token
      }
    })
  } catch (error) {
    console.error('❌ Error en registro:', error)
    return res.status(500).json({
      success: false,
      message: 'Error al registrar usuario'
    })
  }
})

// Login
router.post('/login', async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      })
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    )

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax'
    })

    return res.json({
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          churchName: user.churchName,
          phone: user.phone
        },
        token
      }
    })
  } catch (error) {
    console.error('❌ Error en login:', error)
    return res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión'
    })
  }
})

// ✅ Logout - CORREGIDO
router.post('/logout', async (req: Request, res: Response): Promise<any> => {
  try {
    console.log('🚪 Logout solicitado')
    
    // Limpiar la cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })
    
    console.log('✅ Cookie limpiada')
    
    return res.json({
      success: true,
      message: 'Sesión cerrada exitosamente'
    })
  } catch (error) {
    console.error('❌ Error en logout:', error)
    return res.status(500).json({
      success: false,
      message: 'Error al cerrar sesión'
    })
  }
})

// Obtener perfil del usuario autenticado
router.get('/me', protect, async (req: Request, res: Response): Promise<any> => {
  try {
    const user = req.user as IUser
    console.log('📡 GET /me - Usuario:', user.email)
    
    return res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        churchName: user.churchName,
        phone: user.phone,
        createdAt: user.createdAt
      }
    })
  } catch (error) {
    console.error('❌ Error en /me:', error)
    return res.status(500).json({
      success: false,
      message: 'Error al obtener perfil'
    })
  }
})

// Verificar token (para frontend)
router.get('/verify', protect, async (req: Request, res: Response): Promise<any> => {
  try {
    const user = req.user as IUser
    console.log('📡 GET /verify - Usuario:', user.email)
    
    return res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        churchName: user.churchName,
        phone: user.phone
      }
    })
  } catch (error) {
    console.error('❌ Error en /verify:', error)
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    })
  }
})

export default router