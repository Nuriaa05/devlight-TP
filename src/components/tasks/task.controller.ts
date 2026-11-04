import type { NextFunction, Request, Response } from 'express';
import * as taskService from './task.service';

type TaskRequest = Request<{ id: string }>;

export const getAllTasks = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const tasks = await taskService.getAllTasks();
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (req: TaskRequest, res: Response, next: NextFunction) => {
  try {
    const task = await taskService.getTaskById(req.params.id);
    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await taskService.createTask(req.body);
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req: TaskRequest, res: Response, next: NextFunction) => {
  try {
    const task = await taskService.updateTask(req.params.id, req.body);
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
