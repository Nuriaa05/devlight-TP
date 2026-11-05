import type { NextFunction, Request, Response } from 'express';
import * as taskService from './task.service';

type TaskRequest = Request<{ id: string }>;

// Todas estas rutas pasan por authMiddleware, que es quien define req.user.

export const getAllTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tasks = await taskService.getUserTasks(req.user!.id, req.query);
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (req: TaskRequest, res: Response, next: NextFunction) => {
  try {
    const task = await taskService.getUserTaskById(req.params.id, req.user!.id);
    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await taskService.createTask(req.body, req.user!.id);
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req: TaskRequest, res: Response, next: NextFunction) => {
  try {
    const task = await taskService.updateUserTask(req.params.id, req.body, req.user!.id);
    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req: TaskRequest, res: Response, next: NextFunction) => {
  try {
    await taskService.deleteTask(req.params.id);
    res.status(200).json({ message: 'Tarea eliminada' });
  } catch (error) {
    next(error);
  }
};
