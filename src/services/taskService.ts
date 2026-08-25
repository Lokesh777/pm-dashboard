import type { Task, TaskFilters, PaginatedResponse, TaskStats } from '../types';

const STORAGE_KEY = 'pm-dashboard-tasks';

const defaultTasks: Task[] = [
  {
    id: '1',
    title: 'Setup project architecture',
    description: 'Initialize the project with proper folder structure and configure build tools',
    assignedUser: 'Lokesh',
    priority: 'high',
    status: 'completed',
    dueDate: '2026-08-20',
    createdAt: '2026-08-15',
    updatedAt: '2026-08-20',
  },
  {
    id: '2',
    title: 'Design database schema',
    description: 'Create the database schema for all entities including users, tasks, and projects',
    assignedUser: 'Lokesh',
    priority: 'high',
    status: 'completed',
    dueDate: '2026-08-22',
    createdAt: '2026-08-16',
    updatedAt: '2026-08-22',
  },
  {
    id: '3',
    title: 'Implement authentication',
    description: 'Build login/logout functionality with JWT token management',
    assignedUser: 'Lokesh',
    priority: 'high',
    status: 'in-progress',
    dueDate: '2026-08-26',
    createdAt: '2026-08-18',
    updatedAt: '2026-08-24',
  },
  {
    id: '4',
    title: 'Build dashboard UI',
    description: 'Create the main dashboard with task statistics and overview cards',
    assignedUser: 'Lokesh',
    priority: 'medium',
    status: 'in-progress',
    dueDate: '2026-08-27',
    createdAt: '2026-08-19',
    updatedAt: '2026-08-24',
  },
  {
    id: '5',
    title: 'Implement task CRUD',
    description: 'Create, read, update, and delete operations for tasks',
    assignedUser: 'Lokesh',
    priority: 'high',
    status: 'pending',
    dueDate: '2026-08-28',
    createdAt: '2026-08-20',
    updatedAt: '2026-08-20',
  },
  {
    id: '6',
    title: 'Add search and filters',
    description: 'Implement search by title, filter by status and priority with debouncing',
    assignedUser: 'Lokesh',
    priority: 'medium',
    status: 'pending',
    dueDate: '2026-08-29',
    createdAt: '2026-08-20',
    updatedAt: '2026-08-20',
  },
  {
    id: '7',
    title: 'Write unit tests',
    description: 'Write tests for components, hooks, and API services',
    assignedUser: 'Lokesh',
    priority: 'low',
    status: 'pending',
    dueDate: '2026-08-30',
    createdAt: '2026-08-20',
    updatedAt: '2026-08-20',
  },
  {
    id: '8',
    title: 'Performance optimization',
    description: 'Add React.memo, useMemo, useCallback, and lazy loading',
    assignedUser: 'Lokesh',
    priority: 'medium',
    status: 'pending',
    dueDate: '2026-08-31',
    createdAt: '2026-08-21',
    updatedAt: '2026-08-21',
  },
  {
    id: '9',
    title: 'Responsive design',
    description: 'Make the app fully responsive for mobile, tablet, and desktop',
    assignedUser: 'Lokesh',
    priority: 'medium',
    status: 'pending',
    dueDate: '2026-09-01',
    createdAt: '2026-08-22',
    updatedAt: '2026-08-22',
  },
  {
    id: '10',
    title: 'Dark mode support',
    description: 'Implement dark and light mode toggle (bonus feature)',
    assignedUser: 'Lokesh',
    priority: 'low',
    status: 'pending',
    dueDate: '2026-09-02',
    createdAt: '2026-08-23',
    updatedAt: '2026-08-23',
  },
  {
    id: '11',
    title: 'Error boundary implementation',
    description: 'Add error boundaries for graceful error handling',
    assignedUser: 'Lokesh',
    priority: 'low',
    status: 'pending',
    dueDate: '2026-09-03',
    createdAt: '2026-08-23',
    updatedAt: '2026-08-23',
  },
  {
    id: '12',
    title: 'API error handling',
    description: 'Handle network failures, timeouts, and unauthorized responses properly',
    assignedUser: 'Lokesh',
    priority: 'high',
    status: 'in-progress',
    dueDate: '2026-08-26',
    createdAt: '2026-08-20',
    updatedAt: '2026-08-24',
  },
];

function getStoredTasks(): Task[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultTasks));
    return defaultTasks;
  }
  return JSON.parse(stored) as Task[];
}

function saveTasks(tasks: Task[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const taskService = {
  async getTasks(filters: TaskFilters = {}): Promise<PaginatedResponse<Task>> {
    await delay(500);
    let tasks = getStoredTasks();

    if (filters.search) {
      const search = filters.search.toLowerCase();
      tasks = tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(search) ||
          t.description.toLowerCase().includes(search)
      );
    }

    if (filters.status) {
      tasks = tasks.filter((t) => t.status === filters.status);
    }

    if (filters.priority) {
      tasks = tasks.filter((t) => t.priority === filters.priority);
    }

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
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginatedTasks = tasks.slice(start, start + limit);

    return { data: paginatedTasks, total, page, limit, totalPages };
  },

  async getTask(id: string): Promise<Task> {
    await delay(300);
    const tasks = getStoredTasks();
    const task = tasks.find((t) => t.id === id);
    if (!task) throw new Error('Task not found');
    return task;
  },

  async createTask(
    task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Task> {
    await delay(500);
    const tasks = getStoredTasks();
    const now = new Date().toISOString().split('T')[0];
    const newTask: Task = {
      ...task,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    tasks.unshift(newTask);
    saveTasks(tasks);
    return newTask;
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    await delay(500);
    const tasks = getStoredTasks();
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) throw new Error('Task not found');
    const now = new Date().toISOString().split('T')[0];
    tasks[index] = { ...tasks[index], ...updates, updatedAt: now };
    saveTasks(tasks);
    return tasks[index];
  },

  async deleteTask(id: string): Promise<void> {
    await delay(400);
    const tasks = getStoredTasks();
    const filtered = tasks.filter((t) => t.id !== id);
    saveTasks(filtered);
  },

  async getStats(): Promise<TaskStats> {
    await delay(300);
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
