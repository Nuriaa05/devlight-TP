import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError';

// Va después de authMiddleware, que es quien define req.user.
export const adminMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'admin') {
    next(new AppError(403, 'Solo un administrador puede realizar esta acción'));
    return;
  }

  next();
};
