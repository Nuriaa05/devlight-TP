import express from 'express';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';

const app = express();

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Las rutas de los componentes se registran acá, antes de los manejadores de errores.

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
