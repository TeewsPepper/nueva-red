import express from 'express';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import User, { IUser } from '../models/User.js';
import cloudinary from '../config/cloudinary.js';
import upload from '../middleware/upload.js';
import { Readable } from 'stream';
import { CloudinaryUploadResult } from '../types/index.js';  // ✅ IMPORTAR

const router = express.Router();

// GET /api/usuarios - Solo pastor (ver todos los miembros)
router.get(
  '/',
  protect,
  requireRole(['pastor']),
  async (_req, res) => {
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

// GET /api/usuarios/lideres - Líderes para solicitudes
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
        return;
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

// ========================================
// PUT /api/usuarios/:id - Actualizar perfil
// ========================================
router.put(
  '/:id',
  protect,
  async (req, res) => {
    try {
      const user = req.user as IUser;
      
      if (user._id.toString() !== req.params.id && user.role !== 'pastor') {
        res.status(403).json({
          success: false,
          message: 'No tienes permiso para editar este perfil'
        });
        return;
      }

      if (req.body.role && user.role !== 'pastor') {
        res.status(403).json({
          success: false,
          message: 'Solo los pastores pueden cambiar el rol de un usuario'
        });
        return;
      }

      // ✅ OBTENER EL USUARIO ACTUAL
      const usuarioActual = await User.findById(req.params.id);
      if (!usuarioActual) {
        res.status(404).json({ 
          success: false, 
          message: 'Usuario no encontrado' 
        });
        return;
      }

      // ✅ TIPADO EXPLÍCITO - SIN ANY
      interface UpdateUserData {
        name?: string;
        phone?: string;
        churchName?: string;
        profilePicture?: string | null;
        role?: 'pastor' | 'lider' | 'miembro' | 'visitante';
      }

      const updateData: UpdateUserData = {
        name: req.body.name || usuarioActual.name,
        phone: req.body.phone !== undefined ? req.body.phone : usuarioActual.phone,
        churchName: req.body.churchName !== undefined ? req.body.churchName : usuarioActual.churchName,
        profilePicture: usuarioActual.profilePicture,
      };

      if (req.body.role && user.role === 'pastor') {
        updateData.role = req.body.role;
      }

      const usuario = await User.findByIdAndUpdate(
        req.params.id,
        updateData,
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

// ========================================
// POST /api/usuarios/:id/profile-picture - Subir foto de perfil
// ========================================
router.post(
  '/:id/profile-picture',
  protect,
  upload.single('profilePicture'),
  async (req, res) => {
    try {
      const user = req.user as IUser;
      
      if (user._id.toString() !== req.params.id) {
        res.status(403).json({
          success: false,
          message: 'No tienes permiso para cambiar la foto de este perfil'
        });
        return;
      }

      if (!req.file) {
        res.status(400).json({ 
          success: false, 
          message: 'No se envió ninguna imagen' 
        });
        return;
      }

      
      const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'profile_pictures',
            resource_type: 'image',
            transformation: [
              { width: 300, height: 300, crop: 'fill' },
              { quality: 'auto:best' },
              { fetch_format: 'auto' },
              { gravity: 'face' }
            ]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result as CloudinaryUploadResult);
          }
        );

        const stream = Readable.from(req.file!.buffer);
        stream.pipe(uploadStream);
      });

      console.log('✅ Cloudinary result:', result.secure_url);  // ✅ DEBUG

      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        { profilePicture: result.secure_url },
        { new: true }
      ).select('-password');

      console.log('✅ Usuario actualizado:', updatedUser);  // ✅ DEBUG
      
      if (!updatedUser) {
        res.status(404).json({ 
          success: false, 
          message: 'Usuario no encontrado' 
        });
        return;
      }

      res.json({
        success: true,
        data: updatedUser,
        message: 'Foto de perfil actualizada'
      });

    } catch (error) {
      console.error('Error al subir foto de perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Error al subir la foto de perfil'
      });
    }
  }
);

// ========================================
// DELETE /api/usuarios/:id/profile-picture - Eliminar foto de perfil
// ========================================
router.delete(
  '/:id/profile-picture',
  protect,
  async (req, res) => {
    try {
      const user = req.user as IUser;
      
      if (user._id.toString() !== req.params.id) {
        res.status(403).json({
          success: false,
          message: 'No tienes permiso para eliminar la foto de este perfil'
        });
        return;
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        { profilePicture: null },
        { new: true }
      ).select('-password');

      if (!updatedUser) {
        res.status(404).json({ 
          success: false, 
          message: 'Usuario no encontrado' 
        });
        return;
      }

      res.json({
        success: true,
        data: updatedUser,
        message: 'Foto de perfil eliminada'
      });

    } catch (error) {
      console.error('Error al eliminar foto de perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar la foto de perfil'
      });
    }
  }
);

export default router;