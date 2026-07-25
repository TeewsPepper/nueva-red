import express from 'express';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import User, { IUser } from '../models/User.js';  // 👈 IMPORTAR IUser

const router = express.Router();

// GET /api/usuarios - Solo pastor (ver todos los miembros)
router.get(
  '/',
  protect,
  requireRole(['pastor']),
  async (_req, res) => {  // 👈 _req en lugar de req
    try {
      const usuarios = await User.find()
        .select('-password')
        .sort({ createdAt: -1 });
      
      res.json({ success: true, data: usuarios });
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      res.status(500).json({ success: false, message: 'Error al obtener usuarios' });
    }
  }
);

// 👇 AGREGAR ENDPOINT PARA LÍDERES (solicitudes)
router.get(
  '/lideres',
  protect,
  async (_req, res) => {
    try {
      const lideres = await User.find({
        role: { $in: ['pastor', 'lider'] },
        isActive: true
      })
        .select('_id name email role')
        .sort({ name: 1 });
      
      res.json({ 
        success: true, 
        data: lideres 
      });
    } catch (error) {
      console.error('Error al obtener líderes:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error al obtener líderes' 
      });
    }
  }
);

// GET /api/usuarios/:id - Usuarios pueden ver su propio perfil
router.get(
  '/:id',
  protect,
  async (req, res) => {
    try {
      const user = req.user as IUser;
      
      // Solo puedes ver tu propio perfil o ser pastor
      if (user._id.toString() !== req.params.id && user.role !== 'pastor') {
        res.status(403).json({
          success: false,
          message: 'No tienes permiso para ver este perfil'
        });
        return;  
      }

      const usuario = await User.findById(req.params.id).select('-password');
      
      if (!usuario) {
        res.status(404).json({ 
          success: false, 
          message: 'Usuario no encontrado' 
        });
        return;  // 👈 AGREGAR RETURN
      }

      res.json({ success: true, data: usuario });
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error al obtener usuario' 
      });
    }
  }
);

// PUT /api/usuarios/:id - Actualizar perfil
router.put(
  '/:id',
  protect,
  async (req, res) => {
    try {
      const user = req.user as IUser;
      
      // Solo puedes editar tu propio perfil o ser pastor
      if (user._id.toString() !== req.params.id && user.role !== 'pastor') {
        res.status(403).json({
          success: false,
          message: 'No tienes permiso para editar este perfil'
        });
        return;
      }

      // No permitir cambiar el rol si no es pastor
      if (req.body.role && user.role !== 'pastor') {
        res.status(403).json({
          success: false,
          message: 'Solo los pastores pueden cambiar el rol de un usuario'
        });
        return;
      }

      const usuario = await User.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      ).select('-password');
      
      if (!usuario) {
        res.status(404).json({ 
          success: false, 
          message: 'Usuario no encontrado' 
        });
        return;
      }

      res.json({ success: true, data: usuario });
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error al actualizar usuario' 
      });
    }
  }
);

export default router;