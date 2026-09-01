import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
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
import { api, getToken } from './lib/api';
import { Shell } from './layout/Shell';
import { LoginPage } from './pages/Login';
import {
  AIPage,
  BoardPage,
  BugsPage,
  DingTalkPage,
  KnowledgePage,
  OverviewPage,
  ProjectsPage,
  PulsePage,
  ReleasesPage,
  SprintPage,
  TaskDrawer,
  TasksPage,
  TestingPage
} from './pages/workspace';

function useHotkey(open: () => void) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        open();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);
}

function Workspace() {
  const [projectId, setProjectId] = useState('1001');
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [tests, setTests] = useState<TestCase[]>([]);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [releases, setReleases] = useState<Release[]>([]);
  const [docs, setDocs] = useState<Document[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [pulse, setPulse] = useState<PulseMetrics>();
  const [openTask, setOpenTask] = useState<Task | null>(null);
  const [summary, setSummary] = useState('');
  const [weekly, setWeekly] = useState('');
  const [sprintReview, setSprintReview] = useState('');
  const [notes, setNotes] = useState('');
  const [notice, setNotice] = useState('');

  const project = projects.find((item) => item.id === projectId);
  const sprint = sprints.find((item) => item.projectId === projectId);

  const load = useCallback(async () => {
    const qs = `projectId=${projectId}`;
    const [p, t, b, tc, r, a, s, rel, d, members, pu] = await Promise.all([
      api<Project[]>('/api/v1/projects'),
      api<Task[]>(`/api/v1/tasks?${qs}`),
      api<Bug[]>(`/api/v1/bugs?${qs}`),
      api<TestCase[]>(`/api/v1/tests?${qs}`),
      api<Risk[]>(`/api/v1/risks?${qs}`),
      api<ActivityEvent[]>(`/api/v1/activities?${qs}`),
      api<Sprint[]>(`/api/v1/sprints?${qs}`),
      api<Release[]>(`/api/v1/releases?${qs}`),
      api<Document[]>(`/api/v1/docs?${qs}`),
      api<User[]>(`/api/v1/projects/${projectId}/members`),
      api<PulseMetrics>(`/api/v1/projects/${projectId}/pulse`)
    ]);
    setProjects(p);
    setTasks(t);
    setBugs(b);
    setTests(tc);
    setRisks(r);
    setActivities(a);
    setSprints(s);
    setReleases(rel);
    setDocs(d);
    setUsers(members);
    setPulse(pu);
  }, [projectId]);

  useEffect(() => {
    load().catch(() => undefined);
  }, [load]);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    const socket = new WebSocket(`${location.origin.replace('http', 'ws')}/ws?token=${token}`);
    socket.addEventListener('open', () => {
      socket.send(JSON.stringify({ action: 'subscribe', channel: `project:${projectId}` }));
    });
    socket.addEventListener('message', (event) => {
      const payload = JSON.parse(String(event.data)) as { type?: string };
      if (payload.type && payload.type !== 'CONNECTED' && payload.type !== 'SUBSCRIBED') {
        setNotice(payload.type);
        load().catch(() => undefined);
      }
    });
    return () => socket.close();
  }, [projectId, load]);

  async function changeStatus(task: Task, status: TaskStatus) {
    const updated = await api<Task>(`/api/v1/tasks/${task.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    setTasks((curr) => curr.map((item) => (item.id === updated.id ? updated : item)));
    setOpenTask((curr) => (curr?.id === updated.id ? updated : curr));
  }

  async function createTask(title: string) {
    const created = await api<Task>('/api/v1/tasks', {
      method: 'POST',
      body: JSON.stringify({ projectId, title, priority: 'p2' })
    });
    setTasks((curr) => [created, ...curr]);
  }

  const loadAI = useCallback(async () => {
    const [s, w, sp] = await Promise.all([
      api<{ content: string }>(`/api/v1/ai/summary?projectId=${projectId}`),
      api<{ content: string }>(`/api/v1/ai/weekly?projectId=${projectId}`),
      api<{ content: string }>(`/api/v1/ai/sprint?projectId=${projectId}`)
    ]);
    setSummary(s.content);
    setWeekly(w.content);
    setSprintReview(sp.content);
  }, [projectId]);

  useHotkey(() => {
    document.querySelector<HTMLButtonElement>('.search-btn')?.click();
  });

  const options = useMemo(() => projects.map((item) => ({ id: item.id, name: item.name })), [projects]);

  return (
    <Shell projectId={projectId} onProjectChange={setProjectId} projectOptions={options}>
      {notice ? (
        <div style={{ padding: '6px 28px', color: 'var(--px-accent)', fontSize: 12 }}>实时事件 {notice} · 页面已同步</div>
      ) : null}
      <Routes>
        <Route
          path="/"
          element={<OverviewPage project={project} pulse={pulse} risks={risks} activities={activities} tasks={tasks} />}
        />
        <Route path="/projects" element={<ProjectsPage projects={projects} />} />
        <Route path="/pulse" element={<PulsePage project={project} pulse={pulse} sprint={sprint} />} />
        <Route path="/tasks" element={<TasksPage tasks={tasks} onOpen={setOpenTask} onCreate={createTask} />} />
        <Route path="/board" element={<BoardPage tasks={tasks} onStatus={changeStatus} onOpen={setOpenTask} />} />
        <Route path="/sprint" element={<SprintPage sprint={sprint} tasks={tasks} />} />
        <Route path="/testing" element={<TestingPage tests={tests} />} />
        <Route path="/bugs" element={<BugsPage bugs={bugs} />} />
        <Route
          path="/releases"
          element={
            <ReleasesPage
              releases={releases}
              notes={notes}
              onGenerate={async () => {
                const data = await api<{ content: string }>(`/api/v1/ai/release-notes?projectId=${projectId}`);
                setNotes(data.content);
              }}
            />
          }
        />
        <Route path="/knowledge" element={<KnowledgePage docs={docs} />} />
        <Route path="/ai" element={<AIPage summary={summary} weekly={weekly} sprint={sprintReview} onLoad={loadAI} />} />
        <Route path="/dingtalk" element={<DingTalkPage />} />
      </Routes>
      <TaskDrawer task={openTask} users={users} activities={activities} onClose={() => setOpenTask(null)} />
    </Shell>
  );
}

function Guard({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  if (!getToken()) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}

export default function App() {
  const navigate = useNavigate();
  useEffect(() => {
    if (getToken() && window.location.pathname === '/login') navigate('/');
  }, [navigate]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <Guard>
            <Workspace />
          </Guard>
        }
      />
    </Routes>
  );
}
