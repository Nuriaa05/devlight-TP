import { Types } from 'mongoose';
import { Task, TaskModel, TaskPriority } from './task.model';

export type TaskData = Partial<Omit<Task, 'user'>>;

export interface TaskFilters {
  priority?: TaskPriority;
  completed?: boolean;
}

export const findUserTasks = (userId: string, filters: TaskFilters) =>
  TaskModel.find({ ...filters, user: userId });

export const findUserTaskById = (id: string, userId: string) =>
  TaskModel.findOne({ _id: id, user: userId });

export const createTask = (data: TaskData, userId: string) =>
  TaskModel.create({ ...data, user: new Types.ObjectId(userId) });

export const updateUserTask = (id: string, userId: string, data: TaskData) =>
  TaskModel.findOneAndUpdate({ _id: id, user: userId }, data, {
    returnDocument: 'after',
    runValidators: true,
  });

export const deleteTask = (id: string) => TaskModel.findByIdAndDelete(id);
