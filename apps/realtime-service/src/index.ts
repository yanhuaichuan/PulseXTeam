import { createServer } from 'node:http';
import { WebSocketServer, type WebSocket } from 'ws';
import { config } from '@pulsex/config';
import { createLogger, verifyToken } from '@pulsex/server';
import { store } from '@pulsex/shared';
import type { RealtimeEvent } from '@pulsex/types';

const logger = createLogger('realtime-service');
const clients = new Map<WebSocket, { userId: string; channels: Set<string> }>();
const presence = new Map<string, Set<string>>();

function addPresence(channel: string, userId: string) {
  if (!presence.has(channel)) presence.set(channel, new Set());
  presence.get(channel)!.add(userId);
}

function removePresence(channel: string, userId: string) {
  presence.get(channel)?.delete(userId);
}

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

const httpServer = createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ success: true, data: { service: 'realtime-service', status: 'ok' } }));
    return;
  }
  res.writeHead(404);
  res.end();
});

const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

wss.on('connection', (socket, req) => {
  const url = new URL(req.url ?? '/ws', 'http://localhost');
  const token = url.searchParams.get('token') ?? '';
  try {
    const payload = verifyToken(token);
    clients.set(socket, { userId: payload.sub, channels: new Set(['workspace:default']) });
    addPresence('workspace:default', payload.sub);
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
      const message = JSON.parse(String(raw)) as { action: string; channel?: string; event?: RealtimeEvent };
      const meta = clients.get(socket);
      if (!meta) return;
      if (message.action === 'subscribe' && message.channel) {
        meta.channels.add(message.channel);
        addPresence(message.channel, meta.userId);
        socket.send(
          JSON.stringify({
            id: `sub_${Date.now()}`,
            type: 'SUBSCRIBED',
            timestamp: Date.now(),
            workspaceId: 'default',
            actorId: meta.userId,
            payload: {
              channel: message.channel,
              viewers: [...(presence.get(message.channel) ?? [])]
            }
          } satisfies RealtimeEvent)
        );
      }
      if (message.action === 'unsubscribe' && message.channel) {
        meta.channels.delete(message.channel);
        removePresence(message.channel, meta.userId);
      }
      if (message.action === 'publish' && message.event) {
        if (store.seenEvents.has(message.event.id)) return;
        void store.emit({
          ...message.event,
          timestamp: Date.now()
        });
      }
    } catch {
      logger.error('bad_message');
    }
  });

  socket.on('close', () => {
    const meta = clients.get(socket);
    if (meta) {
      for (const channel of meta.channels) removePresence(channel, meta.userId);
    }
    clients.delete(socket);
  });
});

httpServer.listen(config.realtimePort, () => {
  logger.info('listen', { port: config.realtimePort, service: 'realtime-service' });
});
