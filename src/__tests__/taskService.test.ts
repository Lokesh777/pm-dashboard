import { describe, it, expect, beforeEach } from 'vitest';
import { taskService } from '../services/taskService';

describe('taskService', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('auth-token', 'mock-jwt-test');
    localStorage.setItem(
      'auth-user',
      JSON.stringify({ id: '1', name: 'Lokesh', email: 'lokesh@example.com' })
    );
  });

  describe('getTasks', () => {
    it('returns paginated tasks', async () => {
      const result = await taskService.getTasks({ page: 1, limit: 6 });
      expect(result.data).toBeDefined();
      expect(result.total).toBeGreaterThan(0);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(6);
      expect(result.data.length).toBeLessThanOrEqual(6);
    });

    it('filters by search term', async () => {
      const all = await taskService.getTasks({});
      const filtered = await taskService.getTasks({ search: 'authentication' });
      expect(filtered.data.length).toBeLessThan(all.data.length);
      expect(
        filtered.data.every(
          (t) =>
            t.title.toLowerCase().includes('authentication') ||
            t.description.toLowerCase().includes('authentication')
        )
      ).toBe(true);
    });

    it('filters by status', async () => {
      const result = await taskService.getTasks({ status: 'completed' });
      expect(result.data.every((t) => t.status === 'completed')).toBe(true);
    });

    it('filters by priority', async () => {
      const result = await taskService.getTasks({ priority: 'high' });
      expect(result.data.every((t) => t.priority === 'high')).toBe(true);
    });
  });

  describe('createTask', () => {
    it('creates a new task', async () => {
      const newTask = await taskService.createTask({
        title: 'Test Task',
        description: 'Test Description',
        assignedUser: 'Lokesh',
        priority: 'medium',
        status: 'pending',
        dueDate: '2026-09-01',
      });
      expect(newTask.id).toBeDefined();
      expect(newTask.title).toBe('Test Task');
      expect(newTask.createdAt).toBeDefined();
    });
  });

  describe('updateTask', () => {
    it('updates an existing task', async () => {
      const tasks = await taskService.getTasks({});
      const firstTask = tasks.data[0];
      const updated = await taskService.updateTask(firstTask.id, {
        title: 'Updated Title',
        status: 'completed',
      });
      expect(updated.title).toBe('Updated Title');
      expect(updated.status).toBe('completed');
    });

    it('throws error for non-existent task', async () => {
      await expect(taskService.updateTask('nonexistent', { title: 'x' })).rejects.toThrow(
        'Request failed with status code 404'
      );
    });
  });

  describe('deleteTask', () => {
    it('deletes a task', async () => {
      const created = await taskService.createTask({
        title: 'To Delete',
        description: 'Will be deleted',
        assignedUser: 'Lokesh',
        priority: 'low',
        status: 'pending',
        dueDate: '2026-09-01',
      });
      await taskService.deleteTask(created.id);
      await expect(taskService.getTask(created.id)).rejects.toThrow();
    });
  });

  describe('getStats', () => {
    it('returns correct task statistics', async () => {
      const stats = await taskService.getStats();
      expect(stats.total).toBeGreaterThan(0);
      expect(stats.pending + stats.inProgress + stats.completed).toBe(stats.total);
      expect(stats.highPriority).toBeGreaterThanOrEqual(0);
    });
  });
});
