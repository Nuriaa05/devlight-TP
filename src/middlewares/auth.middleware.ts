import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import type { UserRole } from '../components/users/user.model';
import { getJwtConfig } from '../config/jwt';
import { AppError } from '../utils/AppError';

export interface AuthUser {
  id: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const authMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  const [scheme, token] = req.headers.authorization?.split(' ') ?? [];

  if (scheme !== 'Bearer' || !token) {
    next(new AppError(401, 'Falta el token de autenticación'));
    return;
  }

  const { secret } = getJwtConfig();

  try {
    const payload = jwt.verify(token, secret, { algorithms: ['HS256'] }) as jwt.JwtPayload;
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch {
    next(new AppError(401, 'El token es inválido o está vencido'));
  }
};
