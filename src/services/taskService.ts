import api from '../api/axios';
import { clientTasks } from './clientMock';
import type { Task, TaskFilters, PaginatedResponse, TaskStats } from '../types';

export const taskService = {
  async getTasks(filters: TaskFilters = {}): Promise<PaginatedResponse<Task>> {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.status) params.set('status', filters.status);
      if (filters.priority) params.set('priority', filters.priority);
      if (filters.sortBy) params.set('sortBy', filters.sortBy);
      if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);
      if (filters.page) params.set('page', String(filters.page));
      if (filters.limit) params.set('limit', String(filters.limit));
      const { data } = await api.get<PaginatedResponse<Task>>('/tasks', { params });
      return data;
    } catch {
      return clientTasks.getTasks(filters);
    }
  },

  async getTask(id: string): Promise<Task> {
    try {
      const { data } = await api.get<Task>(`/tasks/${id}`);
      return data;
    } catch {
      const task = clientTasks.getTask(id);
      if (!task) throw new Error('Task not found');
      return task;
    }
  },

  async createTask(
    task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Task> {
    try {
      const { data } = await api.post<Task>('/tasks', task);
      return data;
    } catch {
      return clientTasks.createTask(task);
    }
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    try {
      const { data } = await api.put<Task>(`/tasks/${id}`, updates);
      return data;
    } catch {
      return clientTasks.updateTask(id, updates);
    }
  },

  async deleteTask(id: string): Promise<void> {
    try {
      await api.delete(`/tasks/${id}`);
    } catch {
      clientTasks.deleteTask(id);
    }
  },

  async getStats(): Promise<TaskStats> {
    try {
      const { data } = await api.get<TaskStats>('/tasks/stats');
      return data;
    } catch {
      return clientTasks.getStats();
    }
  },
};
