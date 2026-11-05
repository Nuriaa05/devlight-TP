import 'dotenv/config';
import app from './app';
import { connectDatabase } from './config/database';
import { getJwtConfig } from './config/jwt';

const PORT = process.env.PORT || 3000;

const start = async (): Promise<void> => {
  try {
    // Falla al arrancar, y no recién en el primer login, si la configuración está incompleta.
    getJwtConfig();
    await connectDatabase();

    // Express 5 informa los errores de escucha (por ejemplo, puerto ocupado) en este callback.
    app.listen(PORT, (error?: Error) => {
      if (error) {
        console.error('No se pudo iniciar el servidor:', error.message);
        process.exit(1);
      }

      console.log(`Servidor escuchando en http://localhost:${PORT}`);
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('No se pudo iniciar el servidor:', message);
    process.exit(1);
  }
};

start();
