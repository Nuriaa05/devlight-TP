import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError';

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({ message: `No existe la ruta ${req.method} ${req.originalUrl}` });
};

// Express reconoce un manejador de errores por sus 4 parámetros, aunque no se use next.
export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }

  // express.json() lanza un SyntaxError con la propiedad body si el JSON está mal formado.
  if (error instanceof SyntaxError && 'body' in error) {
    res.status(400).json({ message: 'El cuerpo de la petición no es un JSON válido' });
    return;
  }

  console.error(error);
  res.status(500).json({ message: 'Error interno del servidor' });
};
