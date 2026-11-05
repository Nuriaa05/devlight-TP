import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import * as taskController from './task.controller';

const router = Router();

router.get('/', taskController.getAllTasks);
router.get('/:id', taskController.getTaskById);
router.post('/', authMiddleware, taskController.createTask);
router.put('/:id', authMiddleware, taskController.updateTask);
router.delete('/:id', authMiddleware, taskController.deleteTask);

export default router;
