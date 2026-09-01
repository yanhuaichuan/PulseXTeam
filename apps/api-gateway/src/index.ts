import http from 'node:http';
import { WebSocketServer, type WebSocket } from 'ws';
import { aiRouter } from '@pulsex/ai-service';
import { config } from '@pulsex/config';
import { knowledgeRouter } from '@pulsex/knowledge-service';
import { bindNotificationBus, notificationRouter } from '@pulsex/notification-service';
import { projectRouter } from '@pulsex/project-service';
import { qaRouter } from '@pulsex/qa-service';
import { authMiddleware, createHttpApp, createLogger, type AuthedState, verifyToken } from '@pulsex/server';
import { ok, store } from '@pulsex/shared';
import { taskRouter } from '@pulsex/task-service';
import type { RealtimeEvent } from '@pulsex/types';
import { authRouter } from './auth-adapter.js';

const { app, router, logger } = createHttpApp('api-gateway');
bindNotificationBus();

router.use(authRouter().routes());
router.get('/api/v1/me', authMiddleware(), (ctx) => {
  ctx.body = ok((ctx.state as AuthedState).user);
});
router.get('/api/v1/search', authMiddleware(), (ctx) => {
  const q = String(ctx.query.q ?? '').toLowerCase();
  ctx.body = ok({
    projects: store.projects.filter((item) => item.name.toLowerCase().includes(q) || item.key.toLowerCase().includes(q)),
    tasks: store.tasks.filter((item) => item.title.toLowerCase().includes(q) || item.key.toLowerCase().includes(q)),
    bugs: store.bugs.filter((item) => item.title.toLowerCase().includes(q) || item.key.toLowerCase().includes(q)),
    docs: store.documents.filter((item) => item.title.toLowerCase().includes(q)),
    people: store.users.filter((item) => item.name.toLowerCase().includes(q) || item.account.includes(q))
  });
});

app.use(router.routes());
app.use(projectRouter().routes());
app.use(taskRouter().routes());
app.use(qaRouter().routes());
app.use(knowledgeRouter().routes());
app.use(notificationRouter().routes());
app.use(aiRouter().routes());

const server = http.createServer(app.callback());
const wsLogger = createLogger('realtime-gateway');
const wss = new WebSocketServer({ server, path: '/ws' });
const clients = new Map<WebSocket, { userId: string; channels: Set<string> }>();

function broadcast(channel: string, event: RealtimeEvent) {
  for (const [socket, meta] of clients) {
    if (meta.channels.has(channel) && socket.readyState === socket.OPEN) {
      socket.send(JSON.stringify(event));
    }
  }
}

store.bus.subscribe('*', async (event) => {
  const payload: RealtimeEvent = {
    id: event.id,
    type: event.type,
    timestamp: event.timestamp,
    workspaceId: event.workspaceId,
    projectId: event.projectId,
    actorId: event.actorId,
    payload: event.payload
  };
  broadcast('workspace:default', payload);
  if (event.projectId) broadcast(`project:${event.projectId}`, payload);
});

wss.on('connection', (socket, req) => {
  const url = new URL(req.url ?? '/ws', 'http://localhost');
  const token = url.searchParams.get('token') ?? '';
  try {
    const payload = verifyToken(token);
    clients.set(socket, { userId: payload.sub, channels: new Set(['workspace:default']) });
    socket.send(
      JSON.stringify({
        id: `hello_${Date.now()}`,
        type: 'CONNECTED',
        timestamp: Date.now(),
        workspaceId: 'default',
        actorId: payload.sub,
        payload: { ok: true }
      } satisfies RealtimeEvent)
    );
  } catch {
    socket.close(4001, 'unauthorized');
    return;
  }

  socket.on('message', (raw) => {
    try {
      const message = JSON.parse(String(raw)) as { action?: string; channel?: string };
      const meta = clients.get(socket);
      if (!meta) return;
      if (message.action === 'subscribe' && message.channel) {
        meta.channels.add(message.channel);
        socket.send(
          JSON.stringify({
            id: `sub_${Date.now()}`,
            type: 'SUBSCRIBED',
            timestamp: Date.now(),
            workspaceId: 'default',
            actorId: meta.userId,
            payload: { channel: message.channel }
          } satisfies RealtimeEvent)
        );
      }
    } catch {
      wsLogger.error('bad_ws_message');
    }
  });

  socket.on('close', () => {
    clients.delete(socket);
  });
});

server.listen(config.gatewayPort, () => {
  logger.info('listen', {
    port: config.gatewayPort,
    service: 'api-gateway',
    ws: '/ws'
  });
});
