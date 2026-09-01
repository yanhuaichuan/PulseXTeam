import { createMemoryEventBus, EventTypes, type DomainEvent, type EventBus } from '@pulsex/events';
import type { ActivityEvent, DingTalkConfig, Task, TaskStatus, User } from '@pulsex/types';
import {
  activities,
  bugs,
  computePulse,
  dingTalkConfig,
  documents,
  projects,
  releases,
  risks,
  sprints,
  tasks,
  tests,
  users
} from './seed.js';

const bus: EventBus = createMemoryEventBus();
const seenEvents = new Set<string>();

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export const store = {
  users,
  projects,
  sprints,
  tasks,
  bugs,
  tests,
  risks,
  activities,
  releases,
  documents,
  dingTalkConfig: { ...dingTalkConfig } as DingTalkConfig,
  bus,
  seenEvents,

  findUser(account: string) {
    return users.find((item) => item.account === account);
  },

  findUserById(id: string) {
    return users.find((item) => item.id === id);
  },

  async emit(event: DomainEvent) {
    if (this.seenEvents.has(event.id)) return;
    this.seenEvents.add(event.id);
    await bus.publish(event);
  },

  recordActivity(input: Omit<ActivityEvent, 'id'>) {
    const activity: ActivityEvent = { id: uid('act'), ...input };
    activities.unshift(activity);
    return activity;
  },

  updateTaskStatus(taskId: string, status: TaskStatus, actor: User) {
    const task = tasks.find((item) => item.id === taskId || item.key === taskId);
    if (!task) return null;
    const from = task.status;
    task.status = status;
    task.updatedAt = new Date().toISOString();
    if (status === 'done' || status === 'closed') {
      this.recordActivity({
        projectId: task.projectId,
        actorId: actor.id,
        type: EventTypes.TASK_COMPLETED,
        text: `完成了 ${task.key}`,
        timestamp: task.updatedAt
      });
    } else {
      this.recordActivity({
        projectId: task.projectId,
        actorId: actor.id,
        type: EventTypes.TASK_STATUS_CHANGED,
        text: `将 ${task.key} 从 ${from} 设为 ${status}`,
        timestamp: task.updatedAt
      });
    }
    return { task, from };
  },

  createTask(partial: Pick<Task, 'projectId' | 'title' | 'priority'> & Partial<Task>, actor: User) {
    const seq = tasks.length + 180;
    const task: Task = {
      id: uid('t'),
      key: `TASK-${seq}`,
      description: '',
      status: 'todo',
      updatedAt: new Date().toISOString(),
      ...partial
    };
    tasks.unshift(task);
    this.recordActivity({
      projectId: task.projectId,
      actorId: actor.id,
      type: EventTypes.TASK_CREATED,
      text: `创建了 ${task.key}`,
      timestamp: task.updatedAt
    });
    return task;
  },

  pulse(projectId: string) {
    return computePulse(projectId);
  }
};

export { computePulse } from './seed.js';
export * from './seed.js';
