import type { RealtimeEvent } from '@pulsex/types';

export function connectRealtime(url: string, token: string, onEvent: (event: RealtimeEvent) => void) {
  let socket: WebSocket | null = null;
  let closed = false;

  const open = () => {
    if (closed) return;
    socket = new WebSocket(`${url}?token=${token}`);
    socket.onmessage = (event) => onEvent(JSON.parse(String(event.data)) as RealtimeEvent);
    socket.onclose = () => {
      if (!closed) setTimeout(open, 1500);
    };
  };

  open();
  return {
    subscribe(channel: string) {
      socket?.send(JSON.stringify({ action: 'subscribe', channel }));
    },
    close() {
      closed = true;
      socket?.close();
    }
  };
}
