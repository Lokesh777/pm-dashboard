import { clientTasks } from './clientMock';
import type { Task, TaskFilters, PaginatedResponse, TaskStats } from '../types';

export const taskService = {
  getTasks(filters: TaskFilters = {}): Promise<PaginatedResponse<Task>> {
    return Promise.resolve(clientTasks.getTasks(filters));
  },
  getTask(id: string): Promise<Task> {
    return new Promise((resolve, reject) => {
      const task = clientTasks.getTask(id);
      task ? resolve(task) : reject(new Error('Task not found'));
    });
  },
  createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    return Promise.resolve(clientTasks.createTask(task));
  },
  updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    return new Promise((resolve, reject) => {
      try {
        resolve(clientTasks.updateTask(id, updates));
      } catch (e) {
        reject(e);
      }
    });
  },
  deleteTask(id: string): Promise<void> {
    clientTasks.deleteTask(id);
    return Promise.resolve();
  },
  getStats(): Promise<TaskStats> {
    return Promise.resolve(clientTasks.getStats());
  },
};
