import { http, HttpResponse, delay } from 'msw';
import { mockUsers, mockTasks, MOCK_PASSWORD } from './seed';
import type { Task } from '../types';

const STORAGE_KEY = 'pm-dashboard-tasks';
const AUTH_TOKEN_KEY = 'auth-token';
const AUTH_USER_KEY = 'auth-user';

function getStoredTasks(): Task[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockTasks));
    return [...mockTasks];
  }
  return JSON.parse(stored);
}

function saveTasks(tasks: Task[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function getUserFromToken(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const userStr = localStorage.getItem(AUTH_USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export const authHandlers = [
  http.post(`${API_BASE}/auth/login`, async ({ request }) => {
    await delay(800);
    const body = (await request.json()) as { email: string; password: string };
    const user = mockUsers.find((u) => u.email === body.email);

    if (!user || body.password !== MOCK_PASSWORD) {
      return HttpResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const token = `mock-jwt-${Date.now()}`;
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));

    return HttpResponse.json({ user, token });
  }),

  http.post(`${API_BASE}/auth/logout`, async ({ request }) => {
    await delay(300);
    const user = getUserFromToken(request);
    if (!user) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    return HttpResponse.json({ message: 'Logged out' });
  }),

  http.get(`${API_BASE}/auth/me`, async ({ request }) => {
    await delay(200);
    const user = getUserFromToken(request);
    if (!user) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return HttpResponse.json({ user });
  }),
];

export const taskHandlers = [
  http.get(`${API_BASE}/tasks`, async ({ request }) => {
    await delay(500);
    const user = getUserFromToken(request);
    if (!user) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const priority = url.searchParams.get('priority') || '';
    const sortBy = (url.searchParams.get('sortBy') as keyof Task) || 'createdAt';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '6');

    let tasks = getStoredTasks();

    if (search) {
      const s = search.toLowerCase();
      tasks = tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(s) ||
          t.description.toLowerCase().includes(s)
      );
    }
    if (status) tasks = tasks.filter((t) => t.status === status);
    if (priority) tasks = tasks.filter((t) => t.priority === priority);

    tasks.sort((a, b) => {
      const valA = a[sortBy];
      const valB = b[sortBy];
      const compare = valA < valB ? -1 : valA > valB ? 1 : 0;
      return sortOrder === 'asc' ? compare : -compare;
    });

    const total = tasks.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginatedTasks = tasks.slice(start, start + limit);

    return HttpResponse.json({
      data: paginatedTasks,
      total,
      page,
      limit,
      totalPages,
    });
  }),

  http.get(`${API_BASE}/tasks/stats`, async ({ request }) => {
    await delay(300);
    const user = getUserFromToken(request);
    if (!user) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tasks = getStoredTasks();
    return HttpResponse.json({
      total: tasks.length,
      pending: tasks.filter((t) => t.status === 'pending').length,
      inProgress: tasks.filter((t) => t.status === 'in-progress').length,
      completed: tasks.filter((t) => t.status === 'completed').length,
      highPriority: tasks.filter((t) => t.priority === 'high').length,
    });
  }),

  http.get(`${API_BASE}/tasks/:id`, async ({ request, params }) => {
    await delay(300);
    const user = getUserFromToken(request);
    if (!user) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tasks = getStoredTasks();
    const task = tasks.find((t) => t.id === params.id);
    if (!task) {
      return HttpResponse.json({ message: 'Task not found' }, { status: 404 });
    }
    return HttpResponse.json(task);
  }),

  http.post(`${API_BASE}/tasks`, async ({ request }) => {
    await delay(500);
    const user = getUserFromToken(request);
    if (!user) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as Omit<Task, 'id' | 'createdAt' | 'updatedAt'>;
    const now = new Date().toISOString().split('T')[0];
    const newTask: Task = {
      ...body,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };

    const tasks = getStoredTasks();
    tasks.unshift(newTask);
    saveTasks(tasks);

    return HttpResponse.json(newTask, { status: 201 });
  }),

  http.put(`${API_BASE}/tasks/:id`, async ({ request, params }) => {
    await delay(500);
    const user = getUserFromToken(request);
    if (!user) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as Partial<Task>;
    const tasks = getStoredTasks();
    const index = tasks.findIndex((t) => t.id === params.id);
    if (index === -1) {
      return HttpResponse.json({ message: 'Task not found' }, { status: 404 });
    }

    const now = new Date().toISOString().split('T')[0];
    tasks[index] = { ...tasks[index], ...body, updatedAt: now };
    saveTasks(tasks);

    return HttpResponse.json(tasks[index]);
  }),

  http.patch(`${API_BASE}/tasks/:id`, async ({ request, params }) => {
    await delay(400);
    const user = getUserFromToken(request);
    if (!user) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as Partial<Task>;
    const tasks = getStoredTasks();
    const index = tasks.findIndex((t) => t.id === params.id);
    if (index === -1) {
      return HttpResponse.json({ message: 'Task not found' }, { status: 404 });
    }

    const now = new Date().toISOString().split('T')[0];
    tasks[index] = { ...tasks[index], ...body, updatedAt: now };
    saveTasks(tasks);

    return HttpResponse.json(tasks[index]);
  }),

  http.delete(`${API_BASE}/tasks/:id`, async ({ request, params }) => {
    await delay(400);
    const user = getUserFromToken(request);
    if (!user) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tasks = getStoredTasks();
    const filtered = tasks.filter((t) => t.id !== params.id);
    saveTasks(filtered);

    return HttpResponse.json({ message: 'Task deleted' });
  }),
];

export const handlers = [...authHandlers, ...taskHandlers];
