import { mockTasks, mockUsers, MOCK_PASSWORD } from '../mocks/seed';
import type { Task, TaskFilters, PaginatedResponse, TaskStats, User, AuthResponse } from '../types';

const TASKS_KEY = 'pm-dashboard-tasks';
const TOKEN_KEY = 'auth-token';
const USER_KEY = 'auth-user';

function getTasks(): Task[] {
  try {
    const stored = localStorage.getItem(TASKS_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  localStorage.setItem(TASKS_KEY, JSON.stringify(mockTasks));
  return [...mockTasks];
}

function saveTasks(tasks: Task[]) {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function today(): string {
  return new Date().toISOString().split('T')[0];
}

export const clientAuth = {
  login(email: string, password: string): AuthResponse | null {
    const user = mockUsers.find((u) => u.email === email);
    if (!user || password !== MOCK_PASSWORD) return null;
    const token = `mock-${Date.now()}`;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return { user, token };
  },
  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
  getUser(): User | null {
    try {
      const s = localStorage.getItem(USER_KEY);
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  },
};

function requireAuth(): void {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    const error = new Error('Unauthorized');
    (error as any).status = 401;
    throw error;
  }
}

export const clientTasks = {
  getTasks(filters: TaskFilters = {}): PaginatedResponse<Task> {
    requireAuth();
    let tasks = getTasks();
    if (filters.search) {
      const s = filters.search.toLowerCase();
      tasks = tasks.filter((t) => t.title.toLowerCase().includes(s) || t.description.toLowerCase().includes(s));
    }
    if (filters.status) tasks = tasks.filter((t) => t.status === filters.status);
    if (filters.priority) tasks = tasks.filter((t) => t.priority === filters.priority);
    const sort = filters.sortBy || 'createdAt';
    const order = filters.sortOrder || 'desc';
    tasks.sort((a, b) => {
      const c = a[sort] < b[sort] ? -1 : a[sort] > b[sort] ? 1 : 0;
      return order === 'asc' ? c : -c;
    });
    const total = tasks.length;
    const page = filters.page || 1;
    const limit = filters.limit || 6;
    const start = (page - 1) * limit;
    return { data: tasks.slice(start, start + limit), total, page, limit, totalPages: Math.ceil(total / limit) };
  },
  getTask(id: string): Task | undefined {
    requireAuth();
    return getTasks().find((t) => t.id === id);
  },
  createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task {
    requireAuth();
    const newTask: Task = { ...task, id: genId(), createdAt: today(), updatedAt: today() };
    const tasks = getTasks();
    tasks.unshift(newTask);
    saveTasks(tasks);
    return newTask;
  },
  updateTask(id: string, updates: Partial<Task>): Task {
    requireAuth();
    const tasks = getTasks();
    const i = tasks.findIndex((t) => t.id === id);
    if (i === -1) throw new Error('Task not found');
    tasks[i] = { ...tasks[i], ...updates, updatedAt: today() };
    saveTasks(tasks);
    return tasks[i];
  },
  deleteTask(id: string) {
    requireAuth();
    saveTasks(getTasks().filter((t) => t.id !== id));
  },
  getStats(): TaskStats {
    const t = getTasks();
    return {
      total: t.length,
      pending: t.filter((x) => x.status === 'pending').length,
      inProgress: t.filter((x) => x.status === 'in-progress').length,
      completed: t.filter((x) => x.status === 'completed').length,
      highPriority: t.filter((x) => x.priority === 'high').length,
    };
  },
};
