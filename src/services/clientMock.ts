import { mockTasks, mockUsers, MOCK_PASSWORD } from '../mocks/seed';
import type { Task, TaskFilters, PaginatedResponse, TaskStats, User, AuthResponse } from '../types';

const STORAGE_KEY = 'pm-dashboard-tasks';
const AUTH_TOKEN_KEY = 'auth-token';
const AUTH_USER_KEY = 'auth-user';

function getStoredTasks(): Task[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockTasks));
  return [...mockTasks];
}

function saveTasks(tasks: Task[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export const clientAuth = {
  login(email: string, password: string): AuthResponse | null {
    const user = mockUsers.find((u) => u.email === email);
    if (!user || password !== MOCK_PASSWORD) return null;
    const token = `mock-jwt-${Date.now()}`;
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    return { user, token };
  },

  logout() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  },

  getUser(): User | null {
    try {
      const userStr = localStorage.getItem(AUTH_USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  isLoggedIn(): boolean {
    return !!localStorage.getItem(AUTH_TOKEN_KEY);
  },
};

export const clientTasks = {
  getTasks(filters: TaskFilters = {}): PaginatedResponse<Task> {
    let tasks = getStoredTasks();

    if (filters.search) {
      const s = filters.search.toLowerCase();
      tasks = tasks.filter(
        (t) => t.title.toLowerCase().includes(s) || t.description.toLowerCase().includes(s)
      );
    }
    if (filters.status) tasks = tasks.filter((t) => t.status === filters.status);
    if (filters.priority) tasks = tasks.filter((t) => t.priority === filters.priority);

    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder || 'desc';
    tasks.sort((a, b) => {
      const valA = a[sortBy];
      const valB = b[sortBy];
      const compare = valA < valB ? -1 : valA > valB ? 1 : 0;
      return sortOrder === 'asc' ? compare : -compare;
    });

    const total = tasks.length;
    const page = filters.page || 1;
    const limit = filters.limit || 6;
    const start = (page - 1) * limit;
    return {
      data: tasks.slice(start, start + limit),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  getTask(id: string): Task | undefined {
    return getStoredTasks().find((t) => t.id === id);
  },

  createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task {
    const now = new Date().toISOString().split('T')[0];
    const newTask: Task = { ...task, id: generateId(), createdAt: now, updatedAt: now };
    const tasks = getStoredTasks();
    tasks.unshift(newTask);
    saveTasks(tasks);
    return newTask;
  },

  updateTask(id: string, updates: Partial<Task>): Task {
    const tasks = getStoredTasks();
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error('Task not found');
    tasks[idx] = { ...tasks[idx], ...updates, updatedAt: new Date().toISOString().split('T')[0] };
    saveTasks(tasks);
    return tasks[idx];
  },

  deleteTask(id: string) {
    saveTasks(getStoredTasks().filter((t) => t.id !== id));
  },

  getStats(): TaskStats {
    const tasks = getStoredTasks();
    return {
      total: tasks.length,
      pending: tasks.filter((t) => t.status === 'pending').length,
      inProgress: tasks.filter((t) => t.status === 'in-progress').length,
      completed: tasks.filter((t) => t.status === 'completed').length,
      highPriority: tasks.filter((t) => t.priority === 'high').length,
    };
  },
};
