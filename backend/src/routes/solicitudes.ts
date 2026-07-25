import express from 'express'
import { protect } from '../middleware/auth.js'
import { requireRole } from '../middleware/role.js'
import SolicitudMinisterio from '../models/SolicitudMinisterio.js'
import Ministerio from '../models/Ministerio.js'
import User from '../models/User.js'
import { IUser } from '../models/User.js'

const router = express.Router()

// POST /api/solicitudes - Miembros pueden crear solicitudes
router.post(
  '/',
  protect,
  requireRole(['pastor', 'lider', 'miembro']),
  async (req, res) => {
    try {
      const user = req.user as IUser
      const { nombre, descripcion, liderPropuesto } = req.body

      // Verificar que el líder propuesto existe
      const lider = await User.findById(liderPropuesto)
      if (!lider) {
        return res.status(404).json({
          success: false,
          message: 'El líder propuesto no existe'
        })
      }

      // Verificar que el líder propuesto tenga rol de líder o pastor
      if (!['pastor', 'lider'].includes(lider.role)) {
        return res.status(400).json({
          success: false,
          message: 'El usuario propuesto debe tener rol de líder o pastor'
        })
      }

      const solicitud = await SolicitudMinisterio.create({
        nombre,
        descripcion,
        liderPropuesto,
        creadorId: user._id,
      })

      // Populate para la respuesta
      await solicitud.populate('liderPropuesto', 'name email')
      await solicitud.populate('creadorId', 'name email')

      res.status(201).json({
        success: true,
        data: solicitud,
        message: 'Solicitud creada exitosamente'
      })
    } catch (error) {
      console.error('Error al crear solicitud:', error)
      res.status(500).json({
        success: false,
        message: 'Error al crear solicitud'
      })
    }
  }
)

// GET /api/solicitudes - Pastores y líderes pueden ver todas
router.get(
  '/',
  protect,
  requireRole(['pastor', 'lider']),
  async (req, res) => {
    try {
      const user = req.user as IUser
      let query: any = {}

      // Si es líder, solo ve solicitudes donde es el líder propuesto
      if (user.role === 'lider') {
        query = { liderPropuesto: user._id }
      }

      const solicitudes = await SolicitudMinisterio.find(query)
        .populate('liderPropuesto', 'name email')
        .populate('creadorId', 'name email')
        .sort({ createdAt: -1 })

      res.json({ success: true, data: solicitudes })
    } catch (error) {
      console.error('Error al obtener solicitudes:', error)
      res.status(500).json({
        success: false,
        message: 'Error al obtener solicitudes'
      })
    }
  }
)

// GET /api/solicitudes/:id - Ver una solicitud específica
router.get(
  '/:id',
  protect,
  requireRole(['pastor', 'lider']),
  async (req, res) => {
    try {
      const user = req.user as IUser
      const solicitud = await SolicitudMinisterio.findById(req.params.id)
        .populate('liderPropuesto', 'name email')
        .populate('creadorId', 'name email')

      if (!solicitud) {
        return res.status(404).json({
          success: false,
          message: 'Solicitud no encontrada'
        })
      }

      // Si es líder, verificar que sea el líder propuesto
      if (user.role === 'lider' && solicitud.liderPropuesto._id.toString() !== user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para ver esta solicitud'
        })
      }

      res.json({ success: true, data: solicitud })
    } catch (error) {
      console.error('Error al obtener solicitud:', error)
      res.status(500).json({
        success: false,
        message: 'Error al obtener solicitud'
      })
    }
  }
)

// PUT /api/solicitudes/:id/aprobar - Solo pastor
router.put(
  '/:id/aprobar',
  protect,
  requireRole(['pastor']),
  async (req, res) => {
    try {
      const solicitud = await SolicitudMinisterio.findById(req.params.id)

      if (!solicitud) {
        return res.status(404).json({
          success: false,
          message: 'Solicitud no encontrada'
        })
      }

      if (solicitud.estado !== 'pendiente') {
        return res.status(400).json({
          success: false,
          message: `La solicitud ya fue ${solicitud.estado}`
        })
      }

      // Verificar que el líder propuesto existe
      const lider = await User.findById(solicitud.liderPropuesto)
      if (!lider) {
        return res.status(404).json({
          success: false,
          message: 'El líder propuesto ya no existe'
        })
      }

      // Crear el ministerio
      const ministerio = await Ministerio.create({
        nombre: solicitud.nombre,
        descripcion: solicitud.descripcion,
        liderId: solicitud.liderPropuesto,
        creadoPor: solicitud.creadorId,
        miembros: [solicitud.liderPropuesto, solicitud.creadorId]
      })

      // Actualizar solicitud
      solicitud.estado = 'aprobada'
      await solicitud.save()

      // Populate para la respuesta
      await solicitud.populate('liderPropuesto', 'name email')
      await solicitud.populate('creadorId', 'name email')

      res.json({
        success: true,
        data: {
          solicitud,
          ministerio,
        },
        message: 'Solicitud aprobada y ministerio creado'
      })
    } catch (error) {
      console.error('Error al aprobar solicitud:', error)
      res.status(500).json({
        success: false,
        message: 'Error al aprobar solicitud'
      })
    }
  }
)

// PUT /api/solicitudes/:id/rechazar - Solo pastor
router.put(
  '/:id/rechazar',
  protect,
  requireRole(['pastor']),
  async (req, res) => {
    try {
      const { motivo } = req.body
      const solicitud = await SolicitudMinisterio.findById(req.params.id)

      if (!solicitud) {
        return res.status(404).json({
          success: false,
          message: 'Solicitud no encontrada'
        })
      }

      if (solicitud.estado !== 'pendiente') {
        return res.status(400).json({
          success: false,
          message: `La solicitud ya fue ${solicitud.estado}`
        })
      }

      solicitud.estado = 'rechazada'
      solicitud.rechazoMotivo = motivo || 'No se especificó motivo'
      await solicitud.save()

      await solicitud.populate('liderPropuesto', 'name email')
      await solicitud.populate('creadorId', 'name email')

      res.json({
        success: true,
        data: solicitud,
        message: 'Solicitud rechazada'
      })
    } catch (error) {
      console.error('Error al rechazar solicitud:', error)
      res.status(500).json({
        success: false,
        message: 'Error al rechazar solicitud'
      })
    }
  }
)

// DELETE /api/solicitudes/:id - Solo el creador o pastor pueden eliminar
router.delete(
  '/:id',
  protect,
  requireRole(['pastor', 'lider', 'miembro']),
  async (req, res) => {
    try {
      const user = req.user as IUser
      const solicitud = await SolicitudMinisterio.findById(req.params.id)

      if (!solicitud) {
        return res.status(404).json({
          success: false,
          message: 'Solicitud no encontrada'
        })
      }

      // Solo el creador o pastor pueden eliminar
      if (solicitud.creadorId.toString() !== user._id.toString() && user.role !== 'pastor') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para eliminar esta solicitud'
        })
      }

      // No se puede eliminar si está aprobada
      if (solicitud.estado === 'aprobada') {
        return res.status(400).json({
          success: false,
          message: 'No se puede eliminar una solicitud aprobada'
        })
      }

      await solicitud.deleteOne()

      res.json({
        success: true,
        message: 'Solicitud eliminada exitosamente'
      })
    } catch (error) {
      console.error('Error al eliminar solicitud:', error)
      res.status(500).json({
        success: false,
        message: 'Error al eliminar solicitud'
      })
    }
  }
)

export default router