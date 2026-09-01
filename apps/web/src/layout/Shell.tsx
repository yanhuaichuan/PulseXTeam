import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Activity,
  Bell,
  BookOpen,
  Bug,
  CheckSquare,
  FolderKanban,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  Rocket,
  Search,
  Sparkles,
  SquareKanban,
  TestTubes,
  Webhook
} from 'lucide-react';
import { Avatar } from '@pulsex/ui';
import { clearSession, getUser } from '../lib/api';
import { CommandPalette } from '../components/CommandPalette';
import { useState } from 'react';

const nav = [
  { to: '/', label: '概览', icon: LayoutDashboard },
  { to: '/projects', label: '项目', icon: FolderKanban },
  { to: '/pulse', label: '脉搏', icon: Activity },
  { to: '/tasks', label: '任务', icon: CheckSquare },
  { to: '/board', label: '看板', icon: SquareKanban },
  { to: '/sprint', label: '迭代', icon: LayoutGrid },
  { to: '/testing', label: '测试', icon: TestTubes },
  { to: '/bugs', label: '缺陷', icon: Bug },
  { to: '/releases', label: '发布', icon: Rocket },
  { to: '/knowledge', label: '知识', icon: BookOpen },
  { to: '/ai', label: 'AI', icon: Sparkles },
  { to: '/dingtalk', label: '钉钉', icon: Webhook }
];

export function Shell({
  children,
  projectId,
  onProjectChange,
  projectOptions
}: {
  children: ReactNode;
  projectId: string;
  onProjectChange: (id: string) => void;
  projectOptions: Array<{ id: string; name: string }>;
}) {
  const user = getUser();
  const navigate = useNavigate();
  const [cmdOpen, setCmdOpen] = useState(false);

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="6" fill="#4da8f7" />
            <path d="M5 16h4l2.2-6 3.6 12 2.4-8 1.8 4H27" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
          <strong>PulseX</strong>
        </div>
        <select className="project-switch" value={projectId} onChange={(e) => onProjectChange(e.target.value)}>
          {projectOptions.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <button className="search-btn" onClick={() => setCmdOpen(true)}>
          <Search size={14} strokeWidth={1.5} />
          搜索项目、任务、文档
          <span style={{ marginLeft: 'auto' }}>⌘K</span>
        </button>
        <div className="top-actions">
          <button className="icon-btn" title="通知">
            <Bell size={16} strokeWidth={1.5} />
          </button>
          <Avatar name={user?.name ?? 'U'} size={28} />
          <button
            className="icon-btn"
            title="退出"
            onClick={() => {
              clearSession();
              navigate('/login');
            }}
          >
            <LogOut size={16} strokeWidth={1.5} />
          </button>
        </div>
      </header>
      <div className="body">
        <aside className="sidebar">
          <div className="side-label">工作台</div>
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} end={item.to === '/'} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                <Icon size={16} strokeWidth={1.5} />
                {item.label}
              </NavLink>
            );
          })}
        </aside>
        <main className="content">{children}</main>
      </div>
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  );
}
