import express, { Request, Response } from 'express'
import { getIO } from '../server.js'

const router = express.Router()

// ========================================
// POST /api/test/notificacion - Probar notificaciones en tiempo real
// ========================================
router.post('/notificacion', (_req: Request, res: Response) => {
  const io = getIO()
  
  io.emit('nueva_notificacion', {
    userId: 'test',
    type: 'test',
    message: '🧪 Notificación de prueba desde el backend',
    link: '/'
  })
  
  res.json({ 
    success: true, 
    message: 'Notificación de prueba enviada' 
  })
})

// ========================================
// POST /api/test/post - Probar nuevo post en tiempo real
// ========================================
router.post('/post', (_req: Request, res: Response) => {
  const io = getIO()
  
  io.emit('nuevo_post', {
    postId: 'test',
    author: 'Usuario Test',
    content: 'Este es un post de prueba desde el backend'
  })
  
  res.json({ 
    success: true, 
    message: 'Post de prueba enviado' 
  })
})

// ========================================
// POST /api/test/like - Probar like en tiempo real
// ========================================
router.post('/like', (_req: Request, res: Response) => {
  const io = getIO()
  
  io.emit('like_updated', {
    postId: 'test',
    likes: ['user1', 'user2', 'user3']
  })
  
  res.json({ 
    success: true, 
    message: 'Like de prueba enviado' 
  })
})

export default router