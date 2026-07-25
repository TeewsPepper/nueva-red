import express from 'express';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import BreakActivity from '../models/BreakActivity.js';
import { IUser } from '../models/User.js';

const router = express.Router();

// GET /api/break/actividades - Todas las actividades
router.get('/actividades', async (_req, res) => {  // 👈 _req
  try {
    const actividades = await BreakActivity.find()
      .populate('creadoPor', 'name email')
      .populate('participantes', 'name email')
      .sort({ fecha: 1 });
    
    res.json({ success: true, data: actividades });
  } catch (error) {
    console.error('Error al obtener actividades:', error);
    res.status(500).json({ success: false, message: 'Error al obtener actividades' });
  }
});

// POST /api/break/actividades - Crear actividad
router.post(
  '/actividades',
  protect,
  requireRole(['pastor', 'lider', 'miembro']),
  async (req, res) => {
    try {
      const user = req.user as IUser;
      const actividad = await BreakActivity.create({
        ...req.body,
        creadoPor: user._id,
        participantes: [user._id]
      });

      res.status(201).json({ success: true, data: actividad });
    } catch (error) {
      console.error('Error al crear actividad:', error);
      res.status(500).json({ success: false, message: 'Error al crear actividad' });
    }
  }
);

// POST /api/break/actividades/:id/unirse - Unirse a una actividad
router.post(
  '/actividades/:id/unirse',
  protect,
  requireRole(['pastor', 'lider', 'miembro', 'visitante']),
  async (req, res) => {
    try {
      const user = req.user as IUser;
      const actividad = await BreakActivity.findById(req.params.id);

      if (!actividad) {
        res.status(404).json({
          success: false,
          message: 'Actividad no encontrada'
        });
        return;  // 👈 AGREGAR RETURN
      }

      if (actividad.participantes.includes(user._id)) {
        res.status(400).json({
          success: false,
          message: 'Ya estás unido a esta actividad'
        });
        return;  // 👈 AGREGAR RETURN
      }

      if (actividad.maxParticipantes && 
          actividad.participantes.length >= actividad.maxParticipantes) {
        res.status(400).json({
          success: false,
          message: 'La actividad está completa'
        });
        return;  // 👈 AGREGAR RETURN
      }

      actividad.participantes.push(user._id);
      await actividad.save();

      await actividad.populate('participantes', 'name email');

      res.json({ success: true, data: actividad });
    } catch (error) {
      console.error('Error al unirse a actividad:', error);
      res.status(500).json({
        success: false,
        message: 'Error al unirse a la actividad'
      });
    }
  }
);

// POST /api/break/actividades/:id/salir - Salir de una actividad
router.post(
  '/actividades/:id/salir',
  protect,
  requireRole(['pastor', 'lider', 'miembro', 'visitante']),
  async (req, res) => {
    try {
      const user = req.user as IUser;
      const actividad = await BreakActivity.findById(req.params.id);

      if (!actividad) {
        res.status(404).json({
          success: false,
          message: 'Actividad no encontrada'
        });
        return;  // 👈 AGREGAR RETURN
      }

      // Verificar si el usuario está unido
      if (!actividad.participantes.includes(user._id)) {
        res.status(400).json({
          success: false,
          message: 'No estás unido a esta actividad'
        });
        return;  // 👈 AGREGAR RETURN
      }

      // No puedes salir si eres el creador
      if (actividad.creadoPor.toString() === user._id.toString()) {
        res.status(400).json({
          success: false,
          message: 'El creador no puede salir de la actividad'
        });
        return;  // 👈 AGREGAR RETURN
      }

      // Eliminar usuario de participantes
      actividad.participantes = actividad.participantes.filter(
        (id) => id.toString() !== user._id.toString()
      );
      await actividad.save();

      await actividad.populate('participantes', 'name email');

      res.json({ success: true, data: actividad });
    } catch (error) {
      console.error('Error al salir de actividad:', error);
      res.status(500).json({
        success: false,
        message: 'Error al salir de la actividad'
      });
    }
  }
);

// PUT /api/break/actividades/:id - Editar actividad
router.put(
  '/actividades/:id',
  protect,
  requireRole(['pastor', 'lider', 'miembro']),
  async (req, res) => {
    try {
      const user = req.user as IUser;
      const actividad = await BreakActivity.findById(req.params.id);

      if (!actividad) {
        res.status(404).json({
          success: false,
          message: 'Actividad no encontrada'
        });
        return;  // 👈 AGREGAR RETURN
      }

      if (actividad.creadoPor.toString() !== user._id.toString() && user.role !== 'pastor') {
        res.status(403).json({
          success: false,
          message: 'No tienes permiso para editar esta actividad'
        });
        return;  // 👈 AGREGAR RETURN
      }

      const actividadActualizada = await BreakActivity.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      ).populate('creadoPor', 'name email').populate('participantes', 'name email');

      res.json({ success: true, data: actividadActualizada });
    } catch (error) {
      console.error('Error al actualizar actividad:', error);
      res.status(500).json({ success: false, message: 'Error al actualizar actividad' });
    }
  }
);

// DELETE /api/break/actividades/:id - Eliminar actividad
router.delete(
  '/actividades/:id',
  protect,
  requireRole(['pastor', 'lider', 'miembro']),
  async (req, res) => {
    try {
      const user = req.user as IUser;
      const actividad = await BreakActivity.findById(req.params.id);

      if (!actividad) {
        res.status(404).json({
          success: false,
          message: 'Actividad no encontrada'
        });
        return;  // 👈 AGREGAR RETURN
      }

      if (actividad.creadoPor.toString() !== user._id.toString() && user.role !== 'pastor') {
        res.status(403).json({
          success: false,
          message: 'No tienes permiso para eliminar esta actividad'
        });
        return;  // 👈 AGREGAR RETURN
      }

      await actividad.deleteOne();

      res.json({ success: true, message: 'Actividad eliminada' });
    } catch (error) {
      console.error('Error al eliminar actividad:', error);
      res.status(500).json({ success: false, message: 'Error al eliminar actividad' });
    }
  }
);

export default router;