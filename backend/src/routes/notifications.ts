import express, { Response } from 'express'
import { protect } from '../middleware/auth.js'
import Notification from '../models/Notification.js'
import { AuthRequest } from '../types/index.js'

const router = express.Router()

// ========================================
// GET /api/notifications - Obtener notificaciones
// ========================================
router.get('/', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user
    if (!user) {
      res.status(401).json({ success: false, message: 'Usuario no autenticado' })
      return
    }

    const notifications = await Notification.find({
      user: user._id,
      isActive: true
    })
      .sort({ createdAt: -1 })
      .limit(50)

    const unreadCount = notifications.filter(n => !n.isRead).length

    res.json({
      success: true,
      data: notifications,
      unreadCount
    })
  } catch (error) {
    console.error('Error al obtener notificaciones:', error)
    res.status(500).json({ success: false, message: 'Error al obtener notificaciones' })
  }
})

// ========================================
// PUT /api/notifications/:id/read - Marcar como leída
// ========================================
router.put('/:id/read', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user
    if (!user) {
      res.status(401).json({ success: false, message: 'Usuario no autenticado' })
      return
    }

    const notification = await Notification.findOne({
      _id: req.params.id,
      user: user._id
    })

    if (!notification) {
      res.status(404).json({ success: false, message: 'Notificación no encontrada' })
      return
    }

    notification.isRead = true
    await notification.save()

    res.json({ success: true, data: notification })
  } catch (error) {
    console.error('Error al marcar notificación:', error)
    res.status(500).json({ success: false, message: 'Error al marcar notificación' })
  }
})

// ========================================
// PUT /api/notifications/read-all - Marcar todas como leídas
// ========================================
router.put('/read-all', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user
    if (!user) {
      res.status(401).json({ success: false, message: 'Usuario no autenticado' })
      return
    }

    await Notification.updateMany(
      { user: user._id, isRead: false },
      { isRead: true }
    )

    res.json({ success: true, message: 'Todas las notificaciones marcadas como leídas' })
  } catch (error) {
    console.error('Error al marcar todas:', error)
    res.status(500).json({ success: false, message: 'Error al marcar notificaciones' })
  }
})

// ========================================
// DELETE /api/notifications/:id - Eliminar notificación
// ========================================
router.delete('/:id', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user
    if (!user) {
      res.status(401).json({ success: false, message: 'Usuario no autenticado' })
      return
    }

    const notification = await Notification.findOne({
      _id: req.params.id,
      user: user._id
    })

    if (!notification) {
      res.status(404).json({ success: false, message: 'Notificación no encontrada' })
      return
    }

    notification.isActive = false
    await notification.save()

    res.json({ success: true, message: 'Notificación eliminada' })
  } catch (error) {
    console.error('Error al eliminar notificación:', error)
    res.status(500).json({ success: false, message: 'Error al eliminar notificación' })
  }
})

export default router