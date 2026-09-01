import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

interface SearchResult {
  projects: Array<{ id: string; name: string }>;
  tasks: Array<{ id: string; key: string; title: string }>;
  bugs: Array<{ id: string; key: string; title: string }>;
  docs: Array<{ id: string; title: string }>;
  people: Array<{ id: string; name: string }>;
}

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState('');
  const [result, setResult] = useState<SearchResult | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      api<SearchResult>(`/api/v1/search?q=${encodeURIComponent(q)}`).then(setResult).catch(() => setResult(null));
    }, 120);
    return () => clearTimeout(timer);
  }, [q, open]);

  const actions = useMemo(
    () => [
      { label: '创建任务', to: '/tasks?create=1' },
      { label: '创建缺陷', to: '/bugs' },
      { label: '询问 AI', to: '/ai' },
      { label: '打开看板', to: '/board' }
    ],
    []
  );

  if (!open) return null;

  return (
    <div className="cmdk-mask" onClick={onClose}>
      <div className="cmdk" onClick={(e) => e.stopPropagation()}>
        <input
          autoFocus
          placeholder="搜索项目、任务、缺陷、文档，或执行操作"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div style={{ padding: '8px 0 12px', maxHeight: 360, overflow: 'auto' }}>
          {actions
            .filter((item) => item.label.includes(q) || !q)
            .map((item) => (
              <div
                className="cmdk-item"
                key={item.to}
                onClick={() => {
                  navigate(item.to);
                  onClose();
                }}
              >
                <span>{item.label}</span>
                <span className="sub">操作</span>
              </div>
            ))}
          {result?.projects.map((item) => (
            <div className="cmdk-item" key={item.id} onClick={() => { navigate('/projects'); onClose(); }}>
              <span>{item.name}</span>
              <span className="sub">项目</span>
            </div>
          ))}
          {result?.tasks.map((item) => (
            <div className="cmdk-item" key={item.id} onClick={() => { navigate('/board'); onClose(); }}>
              <span>{item.key} {item.title}</span>
              <span className="sub">任务</span>
            </div>
          ))}
          {result?.bugs.map((item) => (
            <div className="cmdk-item" key={item.id} onClick={() => { navigate('/bugs'); onClose(); }}>
              <span>{item.key} {item.title}</span>
              <span className="sub">缺陷</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
