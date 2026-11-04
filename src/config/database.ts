import mongoose from 'mongoose';

export const connectDatabase = async (): Promise<void> => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error('Falta la variable de entorno MONGO_URI');
  }

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log('Conectado a MongoDB');
};
