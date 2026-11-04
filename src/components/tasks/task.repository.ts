import { Task, TaskModel } from './task.model';

export type TaskData = Partial<Task>;

export const findAllTasks = () => TaskModel.find();

export const findTaskById = (id: string) => TaskModel.findById(id);

export const createTask = (data: TaskData) => TaskModel.create(data);

export const updateTask = (id: string, data: TaskData) =>
  TaskModel.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true });

export const deleteTask = (id: string) => TaskModel.findByIdAndDelete(id);
