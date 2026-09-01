import { Router, authMiddleware } from '@pulsex/server';
import { ok, store } from '@pulsex/shared';

export function knowledgeRouter() {
  const router = new Router({ prefix: '/api/v1' });
  router.use(authMiddleware());

  router.get('/docs', (ctx) => {
    const projectId = String(ctx.query.projectId ?? '');
    const q = String(ctx.query.q ?? '').toLowerCase();
    let list = projectId ? store.documents.filter((item) => item.projectId === projectId) : store.documents;
    if (q) list = list.filter((item) => item.title.toLowerCase().includes(q));
    ctx.body = ok(list);
  });

  return router;
}
