import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';

type Tone = 'primary' | 'ghost' | 'danger' | 'text';

const styles: Record<Tone, CSSProperties> = {
  primary: {
    background: 'var(--px-accent)',
    color: '#fff',
    border: '1px solid var(--px-accent)'
  },
  ghost: {
    background: '#fff',
    color: 'var(--px-title)',
    border: '1px solid var(--px-border)'
  },
  danger: {
    background: '#fff',
    color: 'var(--px-danger)',
    border: '1px solid var(--px-border)'
  },
  text: {
    background: 'transparent',
    color: 'var(--px-text)',
    border: '1px solid transparent'
  }
};

export function Button({
  tone = 'ghost',
  children,
  style,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: Tone; children: ReactNode }) {
  return (
    <button
      {...props}
      style={{
        height: 32,
        padding: '0 12px',
        borderRadius: 6,
        fontSize: 13,
        fontWeight: 400,
        cursor: props.disabled ? 'not-allowed' : 'pointer',
        opacity: props.disabled ? 0.55 : 1,
        ...styles[tone],
        ...style
      }}
    >
      {children}
    </button>
  );
}

export function Avatar({ name, size = 24 }: { name: string; size?: number }) {
  const hue = name.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % 40;
  return (
    <span
      title={name}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: Math.max(10, size * 0.42),
        color: '#5b6b7c',
        background: `hsl(${200 + hue} 32% 90%)`,
        flex: '0 0 auto'
      }}
    >
      {name.slice(0, 1)}
    </span>
  );
}

export function Badge({ children, tone = 'muted' }: { children: ReactNode; tone?: 'muted' | 'accent' | 'warn' | 'danger' | 'ok' }) {
  const map = {
    muted: { color: 'var(--px-muted)', background: '#f3f5f7' },
    accent: { color: 'var(--px-accent)', background: 'var(--px-accent-soft)' },
    warn: { color: '#c9891a', background: 'var(--px-warning-soft)' },
    danger: { color: 'var(--px-danger)', background: 'var(--px-danger-soft)' },
    ok: { color: '#4a9a2f', background: 'var(--px-success-soft)' }
  } as const;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        height: 20,
        padding: '0 6px',
        borderRadius: 4,
        fontSize: 12,
        ...map[tone]
      }}
    >
      {children}
    </span>
  );
}

export function Meter({ value }: { value: number }) {
  return (
    <div style={{ height: 6, background: '#eef2f6', borderRadius: 99, overflow: 'hidden' }}>
      <div
        style={{
          width: `${Math.min(100, Math.max(0, value))}%`,
          height: '100%',
          background: 'var(--px-accent)',
          borderRadius: 99
        }}
      />
    </div>
  );
}
