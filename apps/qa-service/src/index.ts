import { Router, authMiddleware } from '@pulsex/server';
import { ok, store } from '@pulsex/shared';

export function qaRouter() {
  const router = new Router({ prefix: '/api/v1' });
  router.use(authMiddleware());

  router.get('/bugs', (ctx) => {
    const projectId = String(ctx.query.projectId ?? '');
    ctx.body = ok(projectId ? store.bugs.filter((item) => item.projectId === projectId) : store.bugs);
  });

  router.get('/tests', (ctx) => {
    const projectId = String(ctx.query.projectId ?? '');
    ctx.body = ok(projectId ? store.tests.filter((item) => item.projectId === projectId) : store.tests);
  });

  router.get('/risks', (ctx) => {
    const projectId = String(ctx.query.projectId ?? '');
    ctx.body = ok(projectId ? store.risks.filter((item) => item.projectId === projectId) : store.risks);
  });

  router.get('/releases', (ctx) => {
    const projectId = String(ctx.query.projectId ?? '');
    ctx.body = ok(projectId ? store.releases.filter((item) => item.projectId === projectId) : store.releases);
  });

  return router;
}
