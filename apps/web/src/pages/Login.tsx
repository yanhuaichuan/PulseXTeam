import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@pulsex/ui';
import { api, setSession } from '../lib/api';
import type { User } from '@pulsex/types';

export function LoginPage() {
  const [account, setAccount] = useState('yanhuaichuan');
  const [password, setPassword] = useState('pulsex');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    try {
      const data = await api<{ accessToken: string; refreshToken: string; user: User }>('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ account, password })
      });
      setSession(data.accessToken, data.refreshToken, data.user);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败');
    }
  }

  return (
    <div className="login">
      <section className="login-brand">
        <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="6" fill="#4da8f7" />
          <path d="M5 16h4l2.2-6 3.6 12 2.4-8 1.8 4H27" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
        <h1>PulseX 脉动</h1>
        <p>看见项目脉搏，掌控研发节奏。</p>
        <p style={{ marginTop: 18 }}>Feel the pulse. Ship with confidence.</p>
      </section>
      <form className="login-form" onSubmit={onSubmit}>
        <h2>登录工作台</h2>
        <p className="sub">使用演示账号进入 Engineering Workspace</p>
        <label className="field">
          <span>账号</span>
          <input value={account} onChange={(e) => setAccount(e.target.value)} />
        </label>
        <label className="field">
          <span>密码</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error ? <div className="error">{error}</div> : null}
        <div style={{ marginTop: 20 }}>
          <Button tone="primary" type="submit" style={{ width: '100%', height: 36 }}>
            进入 PulseX
          </Button>
        </div>
        <p className="hint">演示账号 yanhuaichuan / pulsex · 作者 yanhuaichuan</p>
      </form>
    </div>
  );
}
