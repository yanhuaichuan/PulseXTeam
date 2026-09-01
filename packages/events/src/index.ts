export const EventTypes = {
  TASK_CREATED: 'TASK_CREATED',
  TASK_UPDATED: 'TASK_UPDATED',
  TASK_COMPLETED: 'TASK_COMPLETED',
  TASK_STATUS_CHANGED: 'TASK_STATUS_CHANGED',
  TASK_BLOCKED: 'TASK_BLOCKED',
  BUG_CREATED: 'BUG_CREATED',
  BUG_RESOLVED: 'BUG_RESOLVED',
  TEST_FAILED: 'TEST_FAILED',
  TEST_PASSED: 'TEST_PASSED',
  SPRINT_STARTED: 'SPRINT_STARTED',
  SPRINT_COMPLETED: 'SPRINT_COMPLETED',
  RELEASE_CREATED: 'RELEASE_CREATED',
  RISK_RAISED: 'RISK_RAISED',
  ACTIVITY_RECORDED: 'ACTIVITY_RECORDED'
} as const;

export type EventType = (typeof EventTypes)[keyof typeof EventTypes];

export interface DomainEvent<T = unknown> {
  id: string;
  type: EventType | string;
  timestamp: number;
  workspaceId: string;
  projectId?: string;
  actorId: string;
  payload: T;
}

export type EventHandler = (event: DomainEvent) => void | Promise<void>;

export interface EventBus {
  publish(event: DomainEvent): Promise<void>;
  subscribe(type: string | '*', handler: EventHandler): () => void;
}

export function createMemoryEventBus(): EventBus {
  const handlers = new Map<string, Set<EventHandler>>();

  return {
    async publish(event) {
      const run = async (key: string) => {
        const set = handlers.get(key);
        if (!set) return;
        await Promise.all([...set].map((fn) => fn(event)));
      };
      await run(event.type);
      await run('*');
    },
    subscribe(type, handler) {
      if (!handlers.has(type)) handlers.set(type, new Set());
      handlers.get(type)!.add(handler);
      return () => handlers.get(type)?.delete(handler);
    }
  };
}
