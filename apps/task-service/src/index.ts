import { EventTypes } from '@pulsex/events';
import { Router, authMiddleware, type AuthedState } from '@pulsex/server';
import { ok, store } from '@pulsex/shared';
import type { TaskPriority, TaskStatus } from '@pulsex/types';

export function taskRouter() {
  const router = new Router({ prefix: '/api/v1' });
  router.use(authMiddleware());

  router.get('/tasks', (ctx) => {
    const projectId = String(ctx.query.projectId ?? '');
    const list = projectId ? store.tasks.filter((item) => item.projectId === projectId) : store.tasks;
    ctx.body = ok(list);
  });

  router.get('/tasks/:id', (ctx) => {
    const task = store.tasks.find((item) => item.id === ctx.params.id || item.key === ctx.params.id);
    if (!task) {
      ctx.status = 404;
      ctx.body = { success: false, error: { code: 'TASK_NOT_FOUND', message: 'Task not found' } };
      return;
    }
    ctx.body = ok(task);
  });

  router.post('/tasks', async (ctx) => {
    const user = (ctx.state as AuthedState).user!;
    const body = ctx.request.body as { projectId: string; title: string; priority?: TaskPriority };
    if (!body?.title || !body?.projectId) {
      ctx.status = 400;
      ctx.body = { success: false, error: { code: 'INVALID_INPUT', message: 'title and projectId required' } };
      return;
    }
    const task = store.createTask(
      { projectId: body.projectId, title: body.title, priority: body.priority ?? 'p2' },
      user
    );
    await store.emit({
      id: `evt_${task.id}`,
      type: EventTypes.TASK_CREATED,
      timestamp: Date.now(),
      workspaceId: 'default',
      projectId: task.projectId,
      actorId: user.id,
      payload: { task }
    });
    ctx.body = ok(task);
  });

  router.patch('/tasks/:id', async (ctx) => {
    const user = (ctx.state as AuthedState).user!;
    const body = ctx.request.body as { status?: TaskStatus };
    if (!body?.status) {
      ctx.status = 400;
      ctx.body = { success: false, error: { code: 'INVALID_INPUT', message: 'status required' } };
      return;
    }
    const result = store.updateTaskStatus(ctx.params.id, body.status, user);
    if (!result) {
      ctx.status = 404;
      ctx.body = { success: false, error: { code: 'TASK_NOT_FOUND', message: 'Task not found' } };
      return;
    }
    const type =
      body.status === 'done'
        ? EventTypes.TASK_COMPLETED
        : body.status === 'blocked'
          ? EventTypes.TASK_BLOCKED
          : EventTypes.TASK_STATUS_CHANGED;
    await store.emit({
      id: `evt_${result.task.id}_${Date.now()}`,
      type,
      timestamp: Date.now(),
      workspaceId: 'default',
      projectId: result.task.projectId,
      actorId: user.id,
      payload: { taskId: result.task.key, from: result.from, to: body.status }
    });
    ctx.body = ok(result.task);
  });

  router.get('/activities', (ctx) => {
    const projectId = String(ctx.query.projectId ?? '');
    const list = projectId
      ? store.activities.filter((item) => item.projectId === projectId)
      : store.activities;
    ctx.body = ok(list.slice(0, 40));
  });

  return router;
}
