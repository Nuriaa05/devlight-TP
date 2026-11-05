import { Router } from 'express';
import { adminMiddleware } from '../../middlewares/admin.middleware';
import { authMiddleware } from '../../middlewares/auth.middleware';
import * as taskController from './task.controller';

const router = Router();

router.use(authMiddleware);

router.get('/', taskController.getAllTasks);
router.get('/:id', taskController.getTaskById);
router.post('/', taskController.createTask);
router.put('/:id', taskController.updateTask);
router.delete('/:id', adminMiddleware, taskController.deleteTask);

export default router;
