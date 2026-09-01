import { config } from '@pulsex/config';
import { EventTypes, type DomainEvent } from '@pulsex/events';
import { Router, authMiddleware } from '@pulsex/server';
import { ok, store } from '@pulsex/shared';
import type { DingTalkConfig } from '@pulsex/types';

export interface NotificationAdapter {
  channel: 'dingtalk' | 'webhook' | 'email' | 'feishu';
  send(event: DomainEvent): Promise<void>;
}

class DingTalkAdapter implements NotificationAdapter {
  channel = 'dingtalk' as const;

  async send(event: DomainEvent) {
    const hook = store.dingTalkConfig.webhook || config.dingtalk.webhook;
    if (!hook) return;
    if (!store.dingTalkConfig.events.includes(event.type)) return;
    const payload = {
      msgtype: 'markdown',
      markdown: {
        title: event.type,
        text: `### PulseX ${event.type}\n\n- project: ${event.projectId ?? '-'}\n- actor: ${event.actorId}\n- payload: \`${JSON.stringify(event.payload)}\``
      }
    };
    await fetch(hook, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }
}

export const adapters: NotificationAdapter[] = [new DingTalkAdapter()];

export function bindNotificationBus() {
  store.bus.subscribe('*', async (event) => {
    await Promise.all(adapters.map((adapter) => adapter.send(event)));
  });
}

export function notificationRouter() {
  const router = new Router({ prefix: '/api/v1' });
  router.use(authMiddleware());

  router.get('/notifications/dingtalk', (ctx) => {
    ctx.body = ok({
      webhook: store.dingTalkConfig.webhook ? 'configured' : '',
      secret: store.dingTalkConfig.secret ? 'configured' : '',
      events: store.dingTalkConfig.events,
      hasWebhook: Boolean(store.dingTalkConfig.webhook || config.dingtalk.webhook)
    });
  });

  router.put('/notifications/dingtalk', (ctx) => {
    const body = ctx.request.body as Partial<DingTalkConfig>;
    if (body.webhook !== undefined) store.dingTalkConfig.webhook = body.webhook;
    if (body.secret !== undefined) store.dingTalkConfig.secret = body.secret;
    if (body.events) store.dingTalkConfig.events = body.events;
    ctx.body = ok({ saved: true, events: store.dingTalkConfig.events });
  });

  router.get('/notifications/events', (ctx) => {
    ctx.body = ok(Object.values(EventTypes));
  });

  return router;
}
