import api from '../api/axios';
import type { Task, TaskFilters, PaginatedResponse, TaskStats } from '../types';

export const taskService = {
  async getTasks(filters: TaskFilters = {}): Promise<PaginatedResponse<Task>> {
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
  },

  async getTask(id: string): Promise<Task> {
    const { data } = await api.get<Task>(`/tasks/${id}`);
    return data;
  },

  async createTask(
    task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Task> {
    const { data } = await api.post<Task>('/tasks', task);
    return data;
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const { data } = await api.put<Task>(`/tasks/${id}`, updates);
    return data;
  },

  async deleteTask(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },

  async getStats(): Promise<TaskStats> {
    const { data } = await api.get<TaskStats>('/tasks/stats');
    return data;
  },
};
