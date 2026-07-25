import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User.js';

// Extender el tipo Request para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

// Middleware para proteger rutas - versión con cookies
export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  let token;

  // 1. Verificar si el token está en las cookies
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // 2. Si no está en cookies, verificar en el header Authorization
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 3. Si no hay token, denegar acceso
  if (!token) {
    res.status(401).json({
      success: false,
      message: 'No autorizado - Token no proporcionado'
    });
    return;
  }

  try {
    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: string };
    
    // Obtener el usuario (excluyendo la contraseña)
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
      return;
    }

    // Adjuntar el usuario al request
    req.user = user;
    next();
  } catch (error) {
    console.error('Error en autenticación:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
      return;
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Error al verificar autenticación'
    });
  }
};

// Middleware opcional para verificar si está autenticado (no bloquea)
export const optionalAuth = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  let token;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token && req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: string };
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        req.user = user;
      }
    } catch (error) {
      // Ignorar errores de token en autenticación opcional
      console.log('Token opcional inválido, continuando sin autenticación');
    }
  }

  next();
};

// Middleware para verificar que el usuario sea el propietario del recurso
export const isOwner = (getOwnerId: (req: Request) => string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'No autenticado'
        });
        return;
      }

      // Si es pastor, tiene acceso total
      if (user.role === 'pastor') {
        next();
        return;
      }

      const ownerId = getOwnerId(req);
      
      // Si no es pastor, verificar que sea el propietario
      if (user._id.toString() !== ownerId) {
        res.status(403).json({
          success: false,
          message: 'No tienes permiso para acceder a este recurso'
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Error en middleware isOwner:', error);
      res.status(500).json({
        success: false,
        message: 'Error al verificar propiedad'
      });
    }
  };
};