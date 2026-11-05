import type { SignOptions } from 'jsonwebtoken';

const EXPIRES_IN_FORMAT = /^\d+[smhd]$/;

export const getJwtConfig = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('Falta la variable de entorno JWT_SECRET');
  }

  const expiresIn = process.env.JWT_EXPIRES_IN || '1h';

  // Un número sin unidad, como "60", jsonwebtoken lo tomaría como milisegundos.
  if (!EXPIRES_IN_FORMAT.test(expiresIn)) {
    throw new Error('JWT_EXPIRES_IN debe tener un formato como 30m, 1h o 7d');
  }

  return { secret, expiresIn: expiresIn as NonNullable<SignOptions['expiresIn']> };
};
