import { model, Schema, Types } from 'mongoose';

export const TASK_PRIORITIES = ['baja', 'media', 'alta'] as const;

export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export interface Task {
  title: string;
  priority: TaskPriority;
  dueDate: Date;
  completed: boolean;
  user: Types.ObjectId;
}

const taskSchema = new Schema<Task>(
  {
    title: { type: String, required: true, trim: true },
    priority: { type: String, enum: TASK_PRIORITIES, default: 'media' },
    dueDate: { type: Date, required: true },
    completed: { type: Boolean, default: false },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true, versionKey: false },
);

export const TaskModel = model<Task>('Task', taskSchema);
