import { AppError } from '../../utils/AppError';
import { TASK_PRIORITIES, TaskPriority } from './task.model';
import * as taskRepository from './task.repository';
import { TaskData, TaskFilters } from './task.repository';

const OBJECT_ID_FORMAT = /^[a-f\d]{24}$/i;
const DATE_FORMAT = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z)?$/;
const TASK_NOT_FOUND = 'Tarea no encontrada';
const INVALID_PRIORITY = `La prioridad debe ser ${TASK_PRIORITIES.join(', ')}`;

const assertValidId = (id: string): void => {
  if (!OBJECT_ID_FORMAT.test(id)) {
    throw new AppError(400, 'El id de la tarea no tiene un formato válido');
  }
};

const toDay = (date: Date): string => date.toISOString().slice(0, 10);

const parseDueDate = (value: unknown): Date => {
  const date = typeof value === 'string' && DATE_FORMAT.test(value) ? new Date(value) : null;

  // La segunda comparación descarta fechas inexistentes, como el 31 de febrero.
  if (!date || Number.isNaN(date.getTime()) || toDay(date) !== (value as string).slice(0, 10)) {
    throw new AppError(400, 'La fecha límite debe ser una fecha válida con formato AAAA-MM-DD');
  }

  return date;
};

// Compara días y no horas, para que una tarea pueda vencer hoy.
const assertNotPast = (dueDate: Date): void => {
  const today = new Date().toLocaleDateString('en-CA');

  if (toDay(dueDate) < today) {
    throw new AppError(400, 'La fecha límite no puede estar en el pasado');
  }
};

// Solo lee los campos de la tarea: el dueño sale siempre del token, nunca del cuerpo.
const parseTaskData = (body: unknown): TaskData => {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    throw new AppError(400, 'El cuerpo de la petición debe ser un objeto JSON');
  }

  const { title, priority, dueDate, completed } = body as Record<string, unknown>;
  const data: TaskData = {};

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '') {
      throw new AppError(400, 'El título no puede estar vacío');
    }
    data.title = title.trim();
  }

  if (priority !== undefined) {
    if (!TASK_PRIORITIES.includes(priority as TaskPriority)) {
      throw new AppError(400, INVALID_PRIORITY);
    }
    data.priority = priority as TaskPriority;
  }

  if (dueDate !== undefined) {
    data.dueDate = parseDueDate(dueDate);
  }

  if (completed !== undefined) {
    if (typeof completed !== 'boolean') {
      throw new AppError(400, 'El campo completed debe ser true o false');
    }
    data.completed = completed;
  }

  return data;
};

const parseFilters = (query: Record<string, unknown>): TaskFilters => {
  const { priority, completed } = query;
  const filters: TaskFilters = {};

  if (priority !== undefined) {
    if (!TASK_PRIORITIES.includes(priority as TaskPriority)) {
      throw new AppError(400, INVALID_PRIORITY);
    }
    filters.priority = priority as TaskPriority;
  }

  if (completed !== undefined) {
    if (completed !== 'true' && completed !== 'false') {
      throw new AppError(400, 'El filtro completed debe ser true o false');
    }
    filters.completed = completed === 'true';
  }

  return filters;
};

export const getUserTasks = (userId: string, query: Record<string, unknown>) =>
  taskRepository.findUserTasks(userId, parseFilters(query));

// Una tarea ajena responde 404, para no revelar que existe.
export const getUserTaskById = async (id: string, userId: string) => {
  assertValidId(id);

  const task = await taskRepository.findUserTaskById(id, userId);
  if (!task) {
    throw new AppError(404, TASK_NOT_FOUND);
  }

  return task;
};

export const createTask = async (body: unknown, userId: string) => {
  const data = parseTaskData(body);

  if (!data.title) {
    throw new AppError(400, 'El título es obligatorio');
  }
  if (!data.dueDate) {
    throw new AppError(400, 'La fecha límite es obligatoria');
  }
  assertNotPast(data.dueDate);

  return taskRepository.createTask(data, userId);
};

export const updateUserTask = async (id: string, body: unknown, userId: string) => {
  assertValidId(id);

  const data = parseTaskData(body);
  if (Object.keys(data).length === 0) {
    throw new AppError(400, 'No se envió ningún campo para modificar');
  }

  const task = await getUserTaskById(id, userId);

  // Una tarea ya vencida se puede seguir editando mientras no se cambie su fecha.
  if (data.dueDate && data.dueDate.getTime() !== task.dueDate.getTime()) {
    assertNotPast(data.dueDate);
  }

  const updatedTask = await taskRepository.updateUserTask(id, userId, data);
  if (!updatedTask) {
    throw new AppError(404, TASK_NOT_FOUND);
  }

  return updatedTask;
};

// Solo llega un admin, que puede eliminar la tarea de cualquier usuario.
export const deleteTask = async (id: string) => {
  assertValidId(id);

  const task = await taskRepository.deleteTask(id);
  if (!task) {
    throw new AppError(404, TASK_NOT_FOUND);
  }
};
