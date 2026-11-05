import { User, UserModel } from './user.model';

export const findUserByEmail = (email: string) => UserModel.findOne({ email });

export const findUserByEmailWithPassword = (email: string) =>
  UserModel.findOne({ email }).select('+password');

export const createUser = (data: Pick<User, 'name' | 'email' | 'password'>) =>
  UserModel.create(data);
