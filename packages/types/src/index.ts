export type Role =
  | 'owner'
  | 'admin'
  | 'manager'
  | 'developer'
  | 'tester'
  | 'member'
  | 'viewer';

export type TaskStatus = 'todo' | 'doing' | 'done' | 'blocked' | 'closed';
export type TaskPriority = 'p0' | 'p1' | 'p2' | 'p3';
export type BugStatus = 'active' | 'resolved' | 'closed';
export type RiskSeverity = 'critical' | 'high' | 'medium' | 'low';
export type RiskStatus = 'open' | 'mitigating' | 'closed';

export interface User {
  id: string;
  account: string;
  name: string;
  avatar?: string;
  email?: string;
  role: Role;
  online?: boolean;
}

export interface Project {
  id: string;
  key: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'closed';
  health: number;
  progress: number;
  quality: number;
  riskLevel: RiskSeverity;
  memberIds: string[];
  sprintId?: string;
}

export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  progress: number;
  planned: number;
  completed: number;
  carryOver: number;
}

export interface Task {
  id: string;
  key: string;
  projectId: string;
  sprintId?: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string;
  estimate?: number;
  dueDate?: string;
  blockedBy?: string[];
  relatedBugIds?: string[];
  relatedTestIds?: string[];
  tags?: string[];
  updatedAt: string;
}

export interface Bug {
  id: string;
  key: string;
  projectId: string;
  title: string;
  severity: 1 | 2 | 3 | 4;
  priority: TaskPriority;
  status: BugStatus;
  assigneeId?: string;
  relatedTaskId?: string;
  updatedAt: string;
}

export interface TestCase {
  id: string;
  key: string;
  projectId: string;
  title: string;
  status: 'pass' | 'fail' | 'blocked' | 'pending';
  relatedTaskId?: string;
}

export interface Risk {
  id: string;
  projectId: string;
  title: string;
  severity: RiskSeverity;
  probability: number;
  impact: string;
  ownerId?: string;
  status: RiskStatus;
  deadline?: string;
  relatedTaskIds?: string[];
}

export interface ActivityEvent {
  id: string;
  projectId: string;
  actorId: string;
  type: string;
  text: string;
  timestamp: string;
}

export interface Release {
  id: string;
  projectId: string;
  version: string;
  status: 'planned' | 'shipping' | 'released';
  date: string;
  notes?: string;
}

export interface Document {
  id: string;
  projectId: string;
  kind: 'wiki' | 'adr' | 'runbook' | 'faq' | 'doc';
  title: string;
  updatedAt: string;
}

export interface PulseMetrics {
  projectId: string;
  health: number;
  progress: number;
  quality: number;
  testing: number;
  delivery: number;
  risk: number;
  stability: number;
  activeTasks: number;
  risks: number;
  blockers: number;
  bugs: number;
  testPassRate: number;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiErrorBody;

export interface RealtimeEvent<T = unknown> {
  id: string;
  type: string;
  timestamp: number;
  workspaceId: string;
  projectId?: string;
  actorId: string;
  payload: T;
}

export interface ChatRequest {
  model?: string;
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
}

export interface ChatResponse {
  content: string;
  provider: string;
  model: string;
}

export interface AIProvider {
  chat(request: ChatRequest): Promise<ChatResponse>;
}

export interface DingTalkConfig {
  webhook: string;
  secret?: string;
  events: string[];
}
