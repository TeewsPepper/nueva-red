import express, { Response } from 'express'
import { protect } from '../middleware/auth.js'
import PrayerRequest from '../models/PrayerRequest.js'
import { IUser } from '../models/User.js'
import { AuthRequest } from '../types/index.js'

const router = express.Router()

// ========================================
// GET /api/prayers - Obtener pedidos de oración
// ========================================
router.get('/', protect, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const prayers = await PrayerRequest.find({ isActive: true })
      .populate('author', 'name email role')
      .sort({ createdAt: -1 })
      .limit(50)

    res.json({ success: true, data: prayers })
  } catch (error) {
    console.error('Error al obtener oraciones:', error)
    res.status(500).json({ success: false, message: 'Error al obtener pedidos de oración' })
  }
})

// ========================================
// POST /api/prayers - Crear pedido de oración
// ========================================
router.post('/', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user as IUser
    const { title, description, isAnonymous } = req.body

    if (!title || !title.trim()) {
      res.status(400).json({ success: false, message: 'El título es requerido' })
      return
    }
    if (!description || !description.trim()) {
      res.status(400).json({ success: false, message: 'La descripción es requerida' })
      return
    }

    const prayer = await PrayerRequest.create({
      author: user._id,
      title: title.trim(),
      description: description.trim(),
      isAnonymous: isAnonymous ?? false
    })

    await prayer.populate('author', 'name email role')

    res.status(201).json({ success: true, data: prayer })
  } catch (error) {
    console.error('Error al crear oración:', error)
    res.status(500).json({ success: false, message: 'Error al crear pedido de oración' })
  }
})

// ========================================
// GET /api/prayers/:id - Obtener pedido de oración
// ========================================
router.get('/:id', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const prayer = await PrayerRequest.findById(req.params.id)
      .populate('author', 'name email role')
      .populate('prayers', 'name email')

    if (!prayer) {
      res.status(404).json({ success: false, message: 'Pedido no encontrado' })
      return
    }

    res.json({ success: true, data: prayer })
  } catch (error) {
    console.error('Error al obtener oración:', error)
    res.status(500).json({ success: false, message: 'Error al obtener pedido de oración' })
  }
})

// ========================================
// POST /api/prayers/:id/pray - Unirse a oración
// ========================================
router.post('/:id/pray', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user as IUser
    const prayer = await PrayerRequest.findById(req.params.id)

    if (!prayer) {
      res.status(404).json({ success: false, message: 'Pedido no encontrado' })
      return
    }

    const hasPrayed = prayer.prayers.some(id => id.toString() === user._id.toString())

    if (hasPrayed) {
      prayer.prayers = prayer.prayers.filter(id => id.toString() !== user._id.toString())
    } else {
      prayer.prayers.push(user._id)
    }

    await prayer.save()

    res.json({ success: true, data: prayer, prayed: !hasPrayed })
  } catch (error) {
    console.error('Error al unirse a oración:', error)
    res.status(500).json({ success: false, message: 'Error al unirse a la oración' })
  }
})

// ========================================
// PUT /api/prayers/:id/answer - Marcar como respondida
// ========================================
router.put('/:id/answer', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user as IUser
    const prayer = await PrayerRequest.findById(req.params.id)

    if (!prayer) {
      res.status(404).json({ success: false, message: 'Pedido no encontrado' })
      return
    }

    if (prayer.author.toString() !== user._id.toString() && user.role !== 'pastor') {
      res.status(403).json({ success: false, message: 'No autorizado' })
      return
    }

    prayer.isAnswered = !prayer.isAnswered
    prayer.answeredAt = prayer.isAnswered ? new Date() : undefined
    await prayer.save()

    res.json({ success: true, data: prayer })
  } catch (error) {
    console.error('Error al marcar oración:', error)
    res.status(500).json({ success: false, message: 'Error al marcar oración' })
  }
})

// ========================================
// DELETE /api/prayers/:id - Eliminar pedido de oración
// ========================================
router.delete('/:id', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user as IUser
    const prayer = await PrayerRequest.findById(req.params.id)

    if (!prayer) {
      res.status(404).json({ success: false, message: 'Pedido no encontrado' })
      return
    }

    if (prayer.author.toString() !== user._id.toString() && user.role !== 'pastor') {
      res.status(403).json({ success: false, message: 'No autorizado' })
      return
    }

    prayer.isActive = false
    await prayer.save()

    res.json({ success: true, message: 'Pedido de oración eliminado' })
  } catch (error) {
    console.error('Error al eliminar oración:', error)
    res.status(500).json({ success: false, message: 'Error al eliminar pedido de oración' })
  }
})

export default router