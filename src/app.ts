import express from 'express';
import taskRoutes from './components/tasks/task.routes';
import userRoutes from './components/users/user.routes';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import { loggerMiddleware } from './middlewares/logger.middleware';

const app = express();

app.use(loggerMiddleware);
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
