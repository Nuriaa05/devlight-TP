import { model, Schema } from 'mongoose';

export const USER_ROLES = ['user', 'admin'] as const;

export type UserRole = (typeof USER_ROLES)[number];

export interface User {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

const userSchema = new Schema<User>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    // select: false evita que el hash salga en las consultas si no se pide a propósito.
    password: { type: String, required: true, select: false },
    role: { type: String, enum: USER_ROLES, default: 'user' },
  },
  { timestamps: true, versionKey: false },
);

export const UserModel = model<User>('User', userSchema);
