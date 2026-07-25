import { Request, Response, NextFunction } from 'express';
import { IUser } from '../models/User.js'; 

// Middleware para requerir roles específicos
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const user = req.user as IUser;

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'No autenticado'
        });
        return;
      }

      if (!allowedRoles.includes(user.role)) {
        res.status(403).json({
          success: false,
          message: `Acceso denegado. Se requiere uno de los siguientes roles: ${allowedRoles.join(', ')}`
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Error en middleware de roles:', error);
      res.status(500).json({
        success: false,
        message: 'Error al verificar permisos'
      });
    }
  };
};

// Versión para múltiples roles con mensaje personalizado
export const requireAnyRole = (roles: string[], customMessage?: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const user = req.user as IUser;

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'No autenticado'
        });
        return;
      }

      if (!roles.includes(user.role)) {
        res.status(403).json({
          success: false,
          message: customMessage || `Acceso denegado. Se requiere uno de los siguientes roles: ${roles.join(', ')}`
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Error en middleware de roles:', error);
      res.status(500).json({
        success: false,
        message: 'Error al verificar permisos'
      });
    }
  };
};

// Helper para verificar si un usuario tiene un rol específico
export const hasRole = (user: IUser | undefined, roles: string[]): boolean => {
  if (!user) return false;
  return roles.includes(user.role);
};