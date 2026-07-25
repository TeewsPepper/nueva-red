import express from 'express';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import Tarea from '../models/Tarea.js';
import { IUser } from '../models/User.js';

const router = express.Router();

// GET /api/tareas - Todos pueden ver
router.get('/', async (_req, res) => {  // 👈 _req en lugar de req
  try {
    const tareas = await Tarea.find()
      .populate('asignadoA', 'name email')
      .populate('creadoPor', 'name email');
    
    res.json({ success: true, data: tareas });
  } catch (error) {
    console.error('Error al obtener tareas:', error);
    res.status(500).json({ success: false, message: 'Error al obtener tareas' });
  }
});

// POST /api/tareas - Pastor, líder y miembro
// POST /api/tareas
router.post(
  '/',
  protect,
  requireRole(['pastor', 'lider', 'miembro']),
  async (req, res) => {
    try {
      const user = req.user as IUser;
      
      // 👇 LOG PARA VER QUÉ LLEGA
      console.log('📝 Creando tarea - fechaEntrega recibida:', req.body.fechaEntrega);
      console.log('📝 Tipo de fechaEntrega:', typeof req.body.fechaEntrega);
      
      const tareaData = {
        ...req.body,
        creadoPor: user._id,
        fechaEntrega: req.body.fechaEntrega || '',
      };

      const tarea = await Tarea.create(tareaData);
      
      // 👇 LOG PARA VER QUÉ SE GUARDA
      console.log('✅ Tarea creada - fechaEntrega guardada:', tarea.fechaEntrega);

      res.status(201).json({ success: true, data: tarea });
    } catch (error) {
      console.error('Error al crear tarea:', error);
      res.status(500).json({ success: false, message: 'Error al crear tarea' });
    }
  }
);
// PUT /api/tareas/:id - Actualizar tarea
router.put(
  '/:id',
  protect,
  requireRole(['pastor', 'lider', 'miembro']),
  async (req, res) => {
    try {
      const user = req.user as IUser;
      const tarea = await Tarea.findById(req.params.id);

      if (!tarea) {
        res.status(404).json({ success: false, message: 'Tarea no encontrada' });
        return;  // 👈 AÑADIR RETURN
      }

      // Solo el creador, asignado o pastor pueden editar
      if (
        tarea.creadoPor.toString() !== user._id.toString() &&
        tarea.asignadoA.toString() !== user._id.toString() &&
        user.role !== 'pastor'
      ) {
        res.status(403).json({
          success: false,
          message: 'No tienes permiso para editar esta tarea'
        });
        return;  // 👈 AÑADIR RETURN
      }

      const updateData = {
        ...req.body,
        fechaEntrega: req.body.fechaEntrega || tarea.fechaEntrega,
      };

      const tareaActualizada = await Tarea.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );

      res.json({ success: true, data: tareaActualizada });
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
      res.status(500).json({ success: false, message: 'Error al actualizar tarea' });
    }
  }
);

// PATCH /api/tareas/:id/completar - Pastor, líder y miembro
router.patch(
  '/:id/completar',
  protect,
  requireRole(['pastor', 'lider', 'miembro']),
  async (req, res) => {
    try {
      const user = req.user as IUser;
      const tarea = await Tarea.findById(req.params.id);

      if (!tarea) {
        res.status(404).json({ success: false, message: 'Tarea no encontrada' });
        return;  // 👈 AÑADIR RETURN
      }

      // Solo el asignado o el creador pueden completar
      if (
        tarea.asignadoA.toString() !== user._id.toString() &&
        tarea.creadoPor.toString() !== user._id.toString() &&
        user.role !== 'pastor'
      ) {
        res.status(403).json({
          success: false,
          message: 'No tienes permiso para completar esta tarea'
        });
        return;  // 👈 AÑADIR RETURN
      }

      tarea.completada = !tarea.completada;
      tarea.completadaEn = tarea.completada ? new Date() : undefined;
      tarea.estado = tarea.completada ? 'completada' : 'pendiente';
      await tarea.save();

      res.json({ success: true, data: tarea });
    } catch (error) {
      console.error('Error al completar tarea:', error);
      res.status(500).json({ success: false, message: 'Error al completar tarea' });
    }
  }
);

// DELETE /api/tareas/:id - Eliminar tarea
router.delete(
  '/:id',
  protect,
  requireRole(['pastor', 'lider', 'miembro']),
  async (req, res) => {
    try {
      const user = req.user as IUser;
      const tarea = await Tarea.findById(req.params.id);

      if (!tarea) {
        res.status(404).json({ success: false, message: 'Tarea no encontrada' });
        return;  // 👈 AÑADIR RETURN
      }

      // Solo el creador o pastor pueden eliminar
      if (
        tarea.creadoPor.toString() !== user._id.toString() &&
        user.role !== 'pastor'
      ) {
        res.status(403).json({
          success: false,
          message: 'No tienes permiso para eliminar esta tarea'
        });
        return;  // 👈 AÑADIR RETURN
      }

      await tarea.deleteOne();

      res.json({ success: true, message: 'Tarea eliminada' });
    } catch (error) {
      console.error('Error al eliminar tarea:', error);
      res.status(500).json({ success: false, message: 'Error al eliminar tarea' });
    }
  }
);

export default router;