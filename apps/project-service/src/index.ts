import { Router, authMiddleware } from '@pulsex/server';
import { ok, store } from '@pulsex/shared';

export function projectRouter() {
  const router = new Router({ prefix: '/api/v1' });
  router.use(authMiddleware());

  router.get('/projects', (ctx) => {
    ctx.body = ok(store.projects);
  });

  router.get('/projects/:id', (ctx) => {
    const project = store.projects.find((item) => item.id === ctx.params.id);
    if (!project) {
      ctx.status = 404;
      ctx.body = { success: false, error: { code: 'PROJECT_NOT_FOUND', message: 'Project not found' } };
      return;
    }
    ctx.body = ok(project);
  });

  router.get('/projects/:id/members', (ctx) => {
    const project = store.projects.find((item) => item.id === ctx.params.id);
    if (!project) {
      ctx.status = 404;
      ctx.body = { success: false, error: { code: 'PROJECT_NOT_FOUND', message: 'Project not found' } };
      return;
    }
    ctx.body = ok(store.users.filter((user) => project.memberIds.includes(user.id)));
  });

  router.get('/projects/:id/pulse', (ctx) => {
    const project = store.projects.find((item) => item.id === ctx.params.id);
    if (!project) {
      ctx.status = 404;
      ctx.body = { success: false, error: { code: 'PROJECT_NOT_FOUND', message: 'Project not found' } };
      return;
    }
    ctx.body = ok(store.pulse(project.id));
  });

  router.get('/sprints', (ctx) => {
    const projectId = String(ctx.query.projectId ?? '');
    ctx.body = ok(projectId ? store.sprints.filter((item) => item.projectId === projectId) : store.sprints);
  });

  return router;
}
