import express from 'express';
import { protect } from '../middleware/auth';
import { requireRole } from '../middleware/role';
import Evento from '../models/Evento';
import { IUser } from '../models/User';

const router = express.Router();

// GET /api/eventos - Todos pueden ver
router.get('/', async (req, res) => {
  try {
    const eventos = await Evento.find()
      .populate('creadoPor', 'name email')
      .populate('ministerioId', 'nombre');
    
    res.json({ success: true, data: eventos });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener eventos' });
  }
});

// POST /api/eventos - Solo pastor y líder
router.post(
  '/',
  protect,
  requireRole(['pastor', 'lider']),
  async (req, res) => {
    try {
      const user = req.user as IUser;
      const evento = await Evento.create({
        ...req.body,
        creadoPor: user._id
      });

      res.status(201).json({ success: true, data: evento });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al crear evento' });
    }
  }
);

// PUT /api/eventos/:id - Pastor o líder (solo el suyo)
router.put(
  '/:id',
  protect,
  requireRole(['pastor', 'lider']),
  async (req, res) => {
    try {
      const user = req.user as IUser;
      const evento = await Evento.findById(req.params.id);

      if (!evento) {
        return res.status(404).json({ success: false, message: 'Evento no encontrado' });
      }

      // Si es líder, verificar que creó este evento
      if (user.role === 'lider' && evento.creadoPor.toString() !== user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para editar este evento'
        });
      }

      const eventoActualizado = await Evento.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      res.json({ success: true, data: eventoActualizado });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al actualizar evento' });
    }
  }
);

// DELETE /api/eventos/:id - Solo pastor
router.delete(
  '/:id',
  protect,
  requireRole(['pastor']),
  async (req, res) => {
    try {
      const evento = await Evento.findByIdAndDelete(req.params.id);
      
      if (!evento) {
        return res.status(404).json({ success: false, message: 'Evento no encontrado' });
      }

      res.json({ success: true, message: 'Evento eliminado' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al eliminar evento' });
    }
  }
);

export default router;