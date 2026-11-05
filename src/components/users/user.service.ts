import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getJwtConfig } from '../../config/jwt';
import { AppError } from '../../utils/AppError';
import * as userRepository from './user.repository';

const SALT_ROUNDS = 10;
const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_BYTES = 72; // Bcrypt ignora lo que supere los 72 bytes.
const DUPLICATE_KEY_ERROR = 11000;
const EMAIL_TAKEN = 'El email ya está registrado';

const parseBody = (body: unknown): Record<string, unknown> => {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    throw new AppError(400, 'El cuerpo de la petición debe ser un objeto JSON');
  }

  return body as Record<string, unknown>;
};

const parseEmail = (email: unknown): string => {
  if (typeof email !== 'string' || !EMAIL_FORMAT.test(email.trim())) {
    throw new AppError(400, 'El email no es válido');
  }

  return email.trim().toLowerCase();
};

// El rol no se lee del cuerpo: si no, cualquiera podría registrarse como admin.
export const registerUser = async (body: unknown) => {
  const { name, email, password } = parseBody(body);

  if (typeof name !== 'string' || name.trim() === '') {
    throw new AppError(400, 'El nombre es obligatorio');
  }

  const parsedEmail = parseEmail(email);

  if (typeof password !== 'string' || password.length < PASSWORD_MIN_LENGTH) {
    throw new AppError(400, `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`);
  }
  if (Buffer.byteLength(password) > PASSWORD_MAX_BYTES) {
    throw new AppError(400, `La contraseña no puede superar los ${PASSWORD_MAX_BYTES} bytes`);
  }

  if (await userRepository.findUserByEmail(parsedEmail)) {
    throw new AppError(400, EMAIL_TAKEN);
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  try {
    const user = await userRepository.createUser({
      name: name.trim(),
      email: parsedEmail,
      password: hashedPassword,
    });

    return { id: user.id as string, name: user.name, email: user.email, role: user.role };
  } catch (error) {
    // Dos registros simultáneos pueden pasar la búsqueda anterior; el índice único frena al segundo.
    if ((error as { code?: number }).code === DUPLICATE_KEY_ERROR) {
      throw new AppError(400, EMAIL_TAKEN);
    }
    throw error;
  }
};

export const loginUser = async (body: unknown) => {
  const { email, password } = parseBody(body);

  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    throw new AppError(400, 'El email y la contraseña son obligatorios');
  }

  const user = await userRepository.findUserByEmailWithPassword(email.trim().toLowerCase());

  // El mismo mensaje en los dos casos, para no revelar qué emails están registrados.
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError(401, 'Credenciales incorrectas');
  }

  const { secret, expiresIn } = getJwtConfig();
  const token = jwt.sign({ id: user.id as string, role: user.role }, secret, { expiresIn });

  return { token };
};
