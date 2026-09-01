import { useEffect, useMemo, useState } from 'react';
import type {
  ActivityEvent,
  Bug,
  Document,
  Project,
  PulseMetrics,
  Release,
  Risk,
  Sprint,
  Task,
  TaskStatus,
  TestCase,
  User
} from '@pulsex/types';
import { Avatar, Badge, Button, Meter } from '@pulsex/ui';
import { api } from '../lib/api';
import { TaskCard } from '../components/TaskCard';

const columns: Array<{ key: TaskStatus; title: string }> = [
  { key: 'todo', title: '待处理' },
  { key: 'doing', title: '进行中' },
  { key: 'blocked', title: '已阻塞' },
  { key: 'done', title: '已完成' }
];

const userName: Record<string, string> = {
  user_1: 'yanhuaichuan',
  user_2: '张三',
  user_3: '李四',
  user_4: '王五'
};

export function OverviewPage({
  project,
  pulse,
  risks,
  activities,
  tasks
}: {
  project?: Project;
  pulse?: PulseMetrics;
  risks: Risk[];
  activities: ActivityEvent[];
  tasks: Task[];
}) {
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>工作台</h1>
          <div className="sub">10 秒看清当前项目状态</div>
        </div>
        <div className="presence">
          <span className="on" /> 张三
          <span className="on" /> 李四
          <span className="off" /> 王五
        </div>
      </div>
      <div className="grid-4" style={{ marginBottom: 16 }}>
        <div className="panel stat">
          项目健康度
          <b>{pulse?.health ?? '--'}</b>
        </div>
        <div className="panel stat">
          进行中任务
          <b>{pulse?.activeTasks ?? tasks.length}</b>
        </div>
        <div className="panel stat">
          风险 / 阻塞
          <b>
            {pulse?.risks ?? 0} / {pulse?.blockers ?? 0}
          </b>
        </div>
        <div className="panel stat">
          测试通过率
          <b>{pulse?.testPassRate ?? 0}%</b>
        </div>
      </div>
      <div className="grid-2">
        <div className="panel pulse-hero">
          <div className="sub">{project?.name ?? 'PulseX'}</div>
          <div className="pulse-score">
            <span className="sub">Pulse</span>
            <strong>{pulse?.health ?? 0}</strong>
          </div>
          <Meter value={pulse?.health ?? 0} />
          <div className="kv">
            <span>进度</span>
            <Meter value={pulse?.progress ?? 0} />
            <span>{pulse?.progress ?? 0}%</span>
          </div>
          <div className="kv">
            <span>质量</span>
            <Meter value={pulse?.quality ?? 0} />
            <span>{pulse?.quality ?? 0}%</span>
          </div>
          <div className="kv">
            <span>交付</span>
            <Meter value={pulse?.delivery ?? 0} />
            <span>{pulse?.delivery ?? 0}</span>
          </div>
        </div>
        <div className="panel">
          <h2>AI Project Manager</h2>
          <p className="sub" style={{ marginBottom: 12 }}>
            只分析，不直接写库
          </p>
          {risks.slice(0, 3).map((risk) => (
            <div className="list-row" key={risk.id}>
              <span className={`dot ${risk.severity}`} />
              <span>{risk.title}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="grid-2" style={{ marginTop: 16 }}>
        <div className="panel">
          <h2>风险</h2>
          {risks.map((risk) => (
            <div className="list-row" key={risk.id}>
              <span className={`dot ${risk.severity}`} />
              <div>
                <div>{risk.title}</div>
                <div className="sub">{risk.impact}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="panel">
          <h2>动态</h2>
          <div className="timeline">
            {activities.slice(0, 6).map((item) => (
              <div className="timeline-item" key={item.id}>
                <time>{item.timestamp.slice(11, 16)}</time>
                <div>
                  {userName[item.actorId] ?? item.actorId} {item.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProjectsPage({ projects }: { projects: Project[] }) {
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>项目</h1>
          <div className="sub">从项目集到底座 execution 的映射视图</div>
        </div>
      </div>
      <div className="grid-3">
        {projects.map((project) => (
          <div className="panel" key={project.id}>
            <div className="sub">{project.key}</div>
            <h2 style={{ margin: '6px 0 8px' }}>{project.name}</h2>
            <p className="sub">{project.description}</p>
            <div style={{ marginTop: 12 }}>
              <Meter value={project.health} />
            </div>
            <div className="list-row" style={{ marginTop: 8 }}>
              <span>健康度 {project.health}</span>
              <Badge tone={project.riskLevel === 'high' || project.riskLevel === 'critical' ? 'warn' : 'muted'}>
                {project.riskLevel}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PulsePage({ project, pulse, sprint }: { project?: Project; pulse?: PulseMetrics; sprint?: Sprint }) {
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>项目脉搏</h1>
          <div className="sub">{project?.name}</div>
        </div>
      </div>
      <div className="panel pulse-hero">
        <div className="pulse-score">
          <span className="sub">Pulse</span>
          <strong>{pulse?.health ?? 0}</strong>
        </div>
        <Meter value={pulse?.health ?? 0} />
        <div className="grid-3" style={{ marginTop: 18 }}>
          <div>
            <div className="sub">Progress</div>
            <b>{pulse?.progress}%</b>
          </div>
          <div>
            <div className="sub">Quality</div>
            <b>{pulse?.quality}%</b>
          </div>
          <div>
            <div className="sub">Risk</div>
            <b>{project?.riskLevel}</b>
          </div>
        </div>
      </div>
      {sprint ? (
        <div className="panel" style={{ marginTop: 16 }}>
          <h2>{sprint.name}</h2>
          <p className="sub">{sprint.goal}</p>
          <div style={{ marginTop: 10 }}>
            <Meter value={sprint.progress} />
          </div>
          <div className="sub" style={{ marginTop: 8 }}>
            Planned {sprint.planned} · Completed {sprint.completed} · Carry over {sprint.carryOver}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function BoardPage({
  tasks,
  onStatus,
  onOpen
}: {
  tasks: Task[];
  onStatus: (task: Task, status: TaskStatus) => void;
  onOpen: (task: Task) => void;
}) {
  const [dragging, setDragging] = useState<Task | null>(null);
  return (
    <div className="page canvas">
      <div className="page-head">
        <div>
          <h1>看板</h1>
          <div className="sub">拖拽卡片即可变更状态，其他成员无需刷新</div>
        </div>
      </div>
      <div className="kanban">
        {columns.map((col) => (
          <section
            key={col.key}
            className="kanban-col"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => dragging && onStatus(dragging, col.key)}
          >
            <h3>
              {col.title}
              <span>{tasks.filter((item) => item.status === col.key).length}</span>
            </h3>
            {tasks
              .filter((item) => item.status === col.key)
              .map((task) => (
                <TaskCard key={task.id} task={task} onOpen={onOpen} onDragStart={setDragging} />
              ))}
          </section>
        ))}
      </div>
    </div>
  );
}

export function TasksPage({
  tasks,
  onOpen,
  onCreate
}: {
  tasks: Task[];
  onOpen: (task: Task) => void;
  onCreate: (title: string) => void;
}) {
  const [title, setTitle] = useState('');
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>任务</h1>
          <div className="sub">信息做减法：标题、负责人、时间、标签</div>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!title.trim()) return;
            onCreate(title.trim());
            setTitle('');
          }}
          style={{ display: 'flex', gap: 8 }}
        >
          <input className="project-switch" style={{ width: 240 }} placeholder="新建任务" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Button tone="primary" type="submit">
            创建
          </Button>
        </form>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>编号</th>
            <th>标题</th>
            <th>状态</th>
            <th>优先级</th>
            <th>负责人</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id} onClick={() => onOpen(task)} style={{ cursor: 'pointer' }}>
              <td>{task.key}</td>
              <td className={task.status === 'done' ? 'sub' : ''}>{task.title}</td>
              <td>
                <Badge>{task.status}</Badge>
              </td>
              <td>{task.priority.toUpperCase()}</td>
              <td>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Avatar name={userName[task.assigneeId ?? ''] ?? '未指派'} size={20} />
                  {userName[task.assigneeId ?? ''] ?? '未指派'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SprintPage({ sprint, tasks }: { sprint?: Sprint; tasks: Task[] }) {
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>{sprint?.name ?? '迭代'}</h1>
          <div className="sub">{sprint?.goal}</div>
        </div>
      </div>
      <div className="panel">
        <Meter value={sprint?.progress ?? 0} />
        <div className="grid-4" style={{ marginTop: 16 }}>
          <div className="stat">
            计划
            <b>{sprint?.planned}</b>
          </div>
          <div className="stat">
            完成
            <b>{sprint?.completed}</b>
          </div>
          <div className="stat">
            结转
            <b>{sprint?.carryOver}</b>
          </div>
          <div className="stat">
            阻塞
            <b>{tasks.filter((item) => item.status === 'blocked').length}</b>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BugsPage({ bugs }: { bugs: Bug[] }) {
  return (
    <div className="page">
      <div className="page-head">
        <h1>缺陷</h1>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>编号</th>
            <th>标题</th>
            <th>严重度</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          {bugs.map((bug) => (
            <tr key={bug.id}>
              <td>{bug.key}</td>
              <td>{bug.title}</td>
              <td>
                <Badge tone={bug.severity <= 2 ? 'danger' : 'muted'}>S{bug.severity}</Badge>
              </td>
              <td>
                <Badge tone={bug.status === 'active' ? 'warn' : 'ok'}>{bug.status}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function TestingPage({ tests }: { tests: TestCase[] }) {
  return (
    <div className="page">
      <div className="page-head">
        <h1>测试</h1>
      </div>
      {tests.map((item) => (
        <div className="list-row" key={item.id}>
          <Badge tone={item.status === 'fail' ? 'danger' : item.status === 'pass' ? 'ok' : 'muted'}>{item.status}</Badge>
          <span>
            {item.key} {item.title}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ReleasesPage({ releases, notes, onGenerate }: { releases: Release[]; notes: string; onGenerate: () => void }) {
  return (
    <div className="page">
      <div className="page-head">
        <h1>发布</h1>
        <Button tone="primary" onClick={onGenerate}>
          Generate Notes
        </Button>
      </div>
      {releases.map((item) => (
        <div className="panel" key={item.id} style={{ marginBottom: 12 }}>
          <h2>{item.version}</h2>
          <div className="sub">
            {item.status} · {item.date}
          </div>
        </div>
      ))}
      {notes ? (
        <div className="panel ai-box" style={{ marginTop: 8 }}>
          {notes}
        </div>
      ) : null}
    </div>
  );
}

export function KnowledgePage({ docs }: { docs: Document[] }) {
  return (
    <div className="page">
      <div className="page-head">
        <h1>知识库</h1>
        <div className="sub">Wiki · ADR · Runbook · FAQ</div>
      </div>
      {docs.map((doc) => (
        <div className="list-row" key={doc.id}>
          <Badge tone="accent">{doc.kind}</Badge>
          <span>{doc.title}</span>
          <span className="sub" style={{ marginLeft: 'auto' }}>
            {doc.updatedAt.slice(0, 10)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function AIPage({
  summary,
  weekly,
  sprint,
  onLoad
}: {
  summary: string;
  weekly: string;
  sprint: string;
  onLoad: () => void;
}) {
  useEffect(() => {
    onLoad();
  }, [onLoad]);
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>AI Project Manager</h1>
          <div className="sub">预览 + 确认 + 审计，AI 不能直接操作数据库</div>
        </div>
        <Button onClick={onLoad}>重新生成</Button>
      </div>
      <div className="grid-2">
        <div className="panel">
          <h2>项目摘要</h2>
          <pre className="ai-box">{summary}</pre>
        </div>
        <div className="panel">
          <h2>周报</h2>
          <pre className="ai-box">{weekly}</pre>
        </div>
      </div>
      <div className="panel" style={{ marginTop: 16 }}>
        <h2>Sprint Review</h2>
        <pre className="ai-box">{sprint}</pre>
      </div>
    </div>
  );
}

export function DingTalkPage() {
  const [webhook, setWebhook] = useState('');
  const [secret, setSecret] = useState('');
  const [events, setEvents] = useState<string[]>(['BUG_CREATED', 'TASK_BLOCKED', 'SPRINT_COMPLETED', 'RELEASE_CREATED', 'RISK_RAISED']);
  const [saved, setSaved] = useState(false);
  const options = ['P0 Bug', 'Task Blocked', 'Sprint Complete', 'Release Created', 'Risk Raised'];
  const keys = ['BUG_CREATED', 'TASK_BLOCKED', 'SPRINT_COMPLETED', 'RELEASE_CREATED', 'RISK_RAISED'];

  useEffect(() => {
    api<{ events: string[] }>('/api/v1/notifications/dingtalk')
      .then((data) => setEvents(data.events))
      .catch(() => undefined);
  }, []);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>钉钉通知</h1>
          <div className="sub">通过 NotificationAdapter 发送，业务层不直接调用钉钉</div>
        </div>
      </div>
      <div className="panel" style={{ maxWidth: 560 }}>
        <label className="field">
          <span>Webhook</span>
          <input value={webhook} onChange={(e) => setWebhook(e.target.value)} placeholder="https://oapi.dingtalk.com/robot/send?access_token=" />
        </label>
        <label className="field">
          <span>Secret</span>
          <input value={secret} onChange={(e) => setSecret(e.target.value)} placeholder="可选加签密钥" />
        </label>
        <div style={{ marginTop: 16 }}>
          {options.map((label, index) => (
            <label className="check" key={keys[index]}>
              <input
                type="checkbox"
                checked={events.includes(keys[index])}
                onChange={(e) => {
                  setEvents((curr) => (e.target.checked ? [...curr, keys[index]] : curr.filter((item) => item !== keys[index])));
                }}
              />
              {label}
            </label>
          ))}
        </div>
        <div style={{ marginTop: 16 }}>
          <Button
            tone="primary"
            onClick={async () => {
              await api('/api/v1/notifications/dingtalk', {
                method: 'PUT',
                body: JSON.stringify({ webhook, secret, events })
              });
              setSaved(true);
            }}
          >
            保存
          </Button>
          {saved ? <span className="sub" style={{ marginLeft: 10 }}>已保存</span> : null}
        </div>
      </div>
    </div>
  );
}

export function TaskDrawer({
  task,
  users,
  activities,
  onClose
}: {
  task: Task | null;
  users: User[];
  activities: ActivityEvent[];
  onClose: () => void;
}) {
  const related = useMemo(() => {
    if (!task) return [];
    return [
      ...(task.relatedBugIds ?? []).map((id) => `BUG ${id}`),
      ...(task.relatedTestIds ?? []).map((id) => `TEST ${id}`),
      ...(task.blockedBy ?? []).map((id) => `Blocked by ${id}`)
    ];
  }, [task]);
  if (!task) return null;
  const owner = users.find((item) => item.id === task.assigneeId);
  return (
    <div className="drawer-mask" onClick={onClose}>
      <aside className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="sub">{task.key}</div>
        <h1 style={{ fontSize: 18, fontWeight: 500, margin: '6px 0 16px', color: 'var(--px-title)' }}>{task.title}</h1>
        <div className="list-row">
          状态 <Badge>{task.status}</Badge>
        </div>
        <div className="list-row">
          优先级 <Badge tone={task.priority === 'p0' ? 'danger' : 'muted'}>{task.priority.toUpperCase()}</Badge>
        </div>
        <div className="list-row">
          负责人
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Avatar name={owner?.name ?? '未指派'} /> {owner?.name ?? '未指派'}
          </span>
        </div>
        <p style={{ marginTop: 16 }}>{task.description}</p>
        <div className="grid-2" style={{ marginTop: 24 }}>
          <div>
            <h2>动态</h2>
            <div className="timeline" style={{ marginTop: 10 }}>
              {activities
                .filter((item) => item.text.includes(task.key))
                .map((item) => (
                  <div className="timeline-item" key={item.id}>
                    <time>{item.timestamp.slice(11, 16)}</time>
                    <div>{item.text}</div>
                  </div>
                ))}
            </div>
          </div>
          <div>
            <h2>关联</h2>
            {related.map((item) => (
              <div className="list-row" key={item}>
                {item}
              </div>
            ))}
            <div className="sub" style={{ marginTop: 12 }}>3 people viewing</div>
          </div>
        </div>
      </aside>
    </div>
  );
}
