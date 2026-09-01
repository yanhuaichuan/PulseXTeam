import type {
  ActivityEvent,
  Bug,
  DingTalkConfig,
  Document,
  Project,
  PulseMetrics,
  Release,
  Risk,
  Sprint,
  Task,
  TestCase,
  User
} from '@pulsex/types';

export const users: User[] = [
  {
    id: 'user_1',
    account: 'yanhuaichuan',
    name: 'yanhuaichuan',
    email: 'yanhuaichuan@pulsex.dev',
    role: 'owner',
    online: true
  },
  {
    id: 'user_2',
    account: 'zhangsan',
    name: '张三',
    role: 'developer',
    online: true
  },
  {
    id: 'user_3',
    account: 'lisi',
    name: '李四',
    role: 'tester',
    online: true
  },
  {
    id: 'user_4',
    account: 'wangwu',
    name: '王五',
    role: 'manager',
    online: false
  }
];

export const projects: Project[] = [
  {
    id: '1001',
    key: 'PULSE',
    name: 'PulseX Engineering Workspace',
    description: '把项目管理、研发协作、测试质量、实时事件与 AI 连成一个工作空间。',
    status: 'active',
    health: 84,
    progress: 76,
    quality: 88,
    riskLevel: 'medium',
    memberIds: ['user_1', 'user_2', 'user_3', 'user_4'],
    sprintId: 'sprint_12'
  },
  {
    id: '1002',
    key: 'PAY',
    name: 'Payment API',
    description: '支付网关与对账。',
    status: 'active',
    health: 62,
    progress: 54,
    quality: 71,
    riskLevel: 'high',
    memberIds: ['user_1', 'user_2', 'user_3'],
    sprintId: 'sprint_12'
  },
  {
    id: '1003',
    key: 'ANDR',
    name: 'Android Build Pipeline',
    description: '移动端构建与发布流水线。',
    status: 'active',
    health: 79,
    progress: 68,
    quality: 85,
    riskLevel: 'medium',
    memberIds: ['user_2', 'user_4'],
    sprintId: 'sprint_11'
  }
];

export const sprints: Sprint[] = [
  {
    id: 'sprint_12',
    projectId: '1001',
    name: 'Sprint 12',
    goal: '完成 Task Board、Realtime 与 Pulse Dashboard。',
    startDate: '2026-08-18',
    endDate: '2026-09-01',
    progress: 82,
    planned: 48,
    completed: 42,
    carryOver: 6
  },
  {
    id: 'sprint_11',
    projectId: '1003',
    name: 'Sprint 11',
    goal: '稳定 Android 构建。',
    startDate: '2026-08-04',
    endDate: '2026-08-18',
    progress: 91,
    planned: 22,
    completed: 20,
    carryOver: 2
  }
];

export const tasks: Task[] = [
  {
    id: 't-182',
    key: 'TASK-182',
    projectId: '1001',
    sprintId: 'sprint_12',
    title: 'Payment API 鉴权超时重试',
    description: '网关在 11 小时内持续阻塞，需要断路器与重试策略。',
    status: 'blocked',
    priority: 'p0',
    assigneeId: 'user_2',
    estimate: 8,
    dueDate: '2026-09-01',
    blockedBy: ['TASK-165'],
    relatedBugIds: ['b-928'],
    tags: ['backend', 'payment'],
    updatedAt: '2026-09-01T10:21:00+08:00'
  },
  {
    id: 't-165',
    key: 'TASK-165',
    projectId: '1001',
    sprintId: 'sprint_12',
    title: '证书轮换脚本',
    description: '生产证书尚未完成轮换，阻塞支付重试。',
    status: 'doing',
    priority: 'p0',
    assigneeId: 'user_4',
    estimate: 5,
    dueDate: '2026-09-01',
    tags: ['infra'],
    updatedAt: '2026-09-01T09:12:00+08:00'
  },
  {
    id: 't-190',
    key: 'TASK-190',
    projectId: '1001',
    sprintId: 'sprint_12',
    title: '任务看板拖拽与实时同步',
    description: 'Teambition 风格看板，状态变更走 Domain Event。',
    status: 'doing',
    priority: 'p1',
    assigneeId: 'user_1',
    estimate: 13,
    dueDate: '2026-09-02',
    tags: ['frontend', 'realtime'],
    updatedAt: '2026-09-01T11:02:00+08:00'
  },
  {
    id: 't-201',
    key: 'TASK-201',
    projectId: '1001',
    sprintId: 'sprint_12',
    title: 'Pulse Health Score 规则',
    description: 'Progress 25% / Quality 20% / Testing 20% / Delivery 15% / Risk 10% / Stability 10%。',
    status: 'doing',
    priority: 'p1',
    assigneeId: 'user_2',
    estimate: 5,
    tags: ['pulse'],
    updatedAt: '2026-09-01T08:40:00+08:00'
  },
  {
    id: 't-210',
    key: 'TASK-210',
    projectId: '1001',
    sprintId: 'sprint_12',
    title: '钉钉 Adapter 配置页',
    description: '业务层不得直接调用钉钉 API。',
    status: 'todo',
    priority: 'p2',
    assigneeId: 'user_3',
    estimate: 3,
    tags: ['notification'],
    updatedAt: '2026-08-31T18:00:00+08:00'
  },
  {
    id: 't-220',
    key: 'TASK-220',
    projectId: '1001',
    sprintId: 'sprint_12',
    title: '登录与 Auth Adapter',
    description: '兼容底座 Session，签发 JWT。',
    status: 'done',
    priority: 'p1',
    assigneeId: 'user_1',
    estimate: 8,
    tags: ['auth'],
    updatedAt: '2026-08-30T16:20:00+08:00'
  },
  {
    id: 't-221',
    key: 'TASK-221',
    projectId: '1001',
    sprintId: 'sprint_12',
    title: 'Design System 基础组件',
    description: 'Button / Table / Card / Kanban，Teambition 冷调。',
    status: 'done',
    priority: 'p2',
    assigneeId: 'user_1',
    estimate: 8,
    tags: ['ui'],
    updatedAt: '2026-08-29T14:00:00+08:00'
  },
  {
    id: 't-240',
    key: 'TASK-240',
    projectId: '1002',
    sprintId: 'sprint_12',
    title: '对账差异告警',
    description: '夜间对账失败需要进入 Risk。',
    status: 'todo',
    priority: 'p1',
    assigneeId: 'user_2',
    estimate: 5,
    tags: ['payment'],
    updatedAt: '2026-08-31T09:00:00+08:00'
  }
];

export const bugs: Bug[] = [
  {
    id: 'b-928',
    key: 'BUG-928',
    projectId: '1001',
    title: '支付回调偶发 409，可能影响本周 Release',
    severity: 1,
    priority: 'p0',
    status: 'active',
    assigneeId: 'user_2',
    relatedTaskId: 't-182',
    updatedAt: '2026-09-01T10:28:00+08:00'
  },
  {
    id: 'b-821',
    key: 'BUG-821',
    projectId: '1001',
    title: '看板卡片在离线重连后重复',
    severity: 3,
    priority: 'p2',
    status: 'resolved',
    assigneeId: 'user_1',
    relatedTaskId: 't-190',
    updatedAt: '2026-08-31T19:10:00+08:00'
  },
  {
    id: 'b-830',
    key: 'BUG-830',
    projectId: '1002',
    title: '退款幂等键未透传',
    severity: 2,
    priority: 'p1',
    status: 'active',
    assigneeId: 'user_3',
    updatedAt: '2026-09-01T07:40:00+08:00'
  }
];

export const tests: TestCase[] = [
  {
    id: 'tc-182',
    key: 'TEST-182',
    projectId: '1001',
    title: '任务状态变更应广播 TASK_STATUS_CHANGED',
    status: 'pass',
    relatedTaskId: 't-190'
  },
  {
    id: 'tc-183',
    key: 'TEST-183',
    projectId: '1001',
    title: 'Payment 超时重试',
    status: 'fail',
    relatedTaskId: 't-182'
  },
  {
    id: 'tc-184',
    key: 'TEST-184',
    projectId: '1001',
    title: 'JWT 刷新',
    status: 'pass',
    relatedTaskId: 't-220'
  },
  {
    id: 'tc-190',
    key: 'TEST-190',
    projectId: '1001',
    title: 'WebSocket 重连去重',
    status: 'pending'
  }
];

export const risks: Risk[] = [
  {
    id: 'r-1',
    projectId: '1001',
    title: 'Payment API 已阻塞 11 小时',
    severity: 'critical',
    probability: 0.9,
    impact: '本周 Release 可能无法包含支付重试',
    ownerId: 'user_4',
    status: 'open',
    deadline: '2026-09-01',
    relatedTaskIds: ['t-182', 't-165']
  },
  {
    id: 'r-2',
    projectId: '1001',
    title: 'Sprint 12 完成率低于预期',
    severity: 'medium',
    probability: 0.6,
    impact: 'Carry over 增加',
    ownerId: 'user_1',
    status: 'mitigating',
    relatedTaskIds: ['t-201']
  },
  {
    id: 'r-3',
    projectId: '1003',
    title: 'Android Build 证书即将过期',
    severity: 'medium',
    probability: 0.4,
    impact: '流水线中断',
    ownerId: 'user_2',
    status: 'open'
  }
];

export const activities: ActivityEvent[] = [
  {
    id: 'a-1',
    projectId: '1001',
    actorId: 'user_2',
    type: 'TASK_COMPLETED',
    text: '完成了 TASK-220',
    timestamp: '2026-09-01T09:21:00+08:00'
  },
  {
    id: 'a-2',
    projectId: '1001',
    actorId: 'user_3',
    type: 'BUG_CREATED',
    text: '创建了 BUG-928',
    timestamp: '2026-09-01T09:23:00+08:00'
  },
  {
    id: 'a-3',
    projectId: '1001',
    actorId: 'user_3',
    type: 'TEST_FAILED',
    text: 'TEST-183 未通过',
    timestamp: '2026-09-01T09:27:00+08:00'
  },
  {
    id: 'a-4',
    projectId: '1001',
    actorId: 'user_2',
    type: 'COMMENT',
    text: '回复：正在排查支付 409',
    timestamp: '2026-09-01T09:34:00+08:00'
  },
  {
    id: 'a-5',
    projectId: '1001',
    actorId: 'user_3',
    type: 'TEST_PASSED',
    text: 'TEST-182 已通过',
    timestamp: '2026-09-01T09:45:00+08:00'
  },
  {
    id: 'a-6',
    projectId: '1001',
    actorId: 'user_1',
    type: 'TASK_STATUS_CHANGED',
    text: '将 TASK-190 设为进行中',
    timestamp: '2026-09-01T10:23:00+08:00'
  }
];

export const releases: Release[] = [
  {
    id: 'rel-210',
    projectId: '1001',
    version: 'v2.1.0',
    status: 'shipping',
    date: '2026-09-05',
    notes: ''
  },
  {
    id: 'rel-200',
    projectId: '1001',
    version: 'v2.0.0',
    status: 'released',
    date: '2026-08-12',
    notes: 'Foundation：Gateway、Auth Adapter、App Shell。'
  }
];

export const documents: Document[] = [
  {
    id: 'd-1',
    projectId: '1001',
    kind: 'adr',
    title: 'ADR-001 为什么第一阶段用 Redis Streams',
    updatedAt: '2026-08-20T10:00:00+08:00'
  },
  {
    id: 'd-2',
    projectId: '1001',
    kind: 'wiki',
    title: 'Strangler Migration 手册',
    updatedAt: '2026-08-22T11:00:00+08:00'
  },
  {
    id: 'd-3',
    projectId: '1001',
    kind: 'runbook',
    title: 'Payment 阻塞应急 Runbook',
    updatedAt: '2026-09-01T08:00:00+08:00'
  },
  {
    id: 'd-4',
    projectId: '1001',
    kind: 'faq',
    title: '如何配置钉钉 Webhook',
    updatedAt: '2026-08-28T09:00:00+08:00'
  }
];

export function computePulse(projectId: string): PulseMetrics {
  const project = projects.find((item) => item.id === projectId)!;
  const projectTasks = tasks.filter((item) => item.projectId === projectId);
  const projectBugs = bugs.filter((item) => item.projectId === projectId);
  const projectTests = tests.filter((item) => item.projectId === projectId);
  const projectRisks = risks.filter((item) => item.projectId === projectId);
  const passed = projectTests.filter((item) => item.status === 'pass').length;
  const testPassRate = projectTests.length
    ? Math.round((passed / projectTests.length) * 100)
    : 100;
  const blockers = projectTasks.filter((item) => item.status === 'blocked').length;
  const progress = project.progress;
  const quality = project.quality;
  const testing = testPassRate;
  const delivery = Math.max(40, 100 - blockers * 12);
  const risk = Math.max(20, 100 - projectRisks.length * 18);
  const stability = Math.max(50, 100 - projectBugs.filter((item) => item.status === 'active').length * 8);
  const health = Math.round(
    progress * 0.25 + quality * 0.2 + testing * 0.2 + delivery * 0.15 + risk * 0.1 + stability * 0.1
  );

  return {
    projectId,
    health,
    progress,
    quality,
    testing,
    delivery,
    risk,
    stability,
    activeTasks: projectTasks.filter((item) => item.status !== 'done' && item.status !== 'closed').length,
    risks: projectRisks.filter((item) => item.status !== 'closed').length,
    blockers,
    bugs: projectBugs.filter((item) => item.status === 'active').length,
    testPassRate
  };
}

export const dingTalkConfig: DingTalkConfig = {
  webhook: '',
  secret: '',
  events: ['BUG_CREATED', 'TASK_BLOCKED', 'SPRINT_COMPLETED', 'RELEASE_CREATED', 'RISK_RAISED']
};
