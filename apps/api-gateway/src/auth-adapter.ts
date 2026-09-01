import { config } from '@pulsex/config';
import { Router, signTokens, verifyToken } from '@pulsex/server';
import { fail, ok, store } from '@pulsex/shared';
import type { User } from '@pulsex/types';

interface LegacyTokenResponse {
  token?: string;
  user?: { account?: string; realname?: string };
}

/**
 * Legacy Auth → Auth Adapter → JWT
 * Phase 1 reads the ZenTao token API when LEGACY_API_URL is set.
 * Otherwise falls back to the local demo account (never writes PHP sessions).
 */
export async function authenticate(account: string, password: string): Promise<User | null> {
  if (config.legacyApiUrl) {
    try {
      const response = await fetch(`${config.legacyApiUrl.replace(/\/$/, '')}/tokens`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ account, password })
      });
      if (response.ok) {
        const body = (await response.json()) as LegacyTokenResponse;
        const mapped =
          store.findUser(account) ??
          ({
            id: `legacy_${account}`,
            account,
            name: body.user?.realname ?? account,
            role: 'member'
          } satisfies User);
        return mapped;
      }
    } catch {
      // Adapter must not crash the gateway if PHP is down.
    }
  }

  if (account === config.demoAccount && password === config.demoPassword) {
    return store.findUser(account) ?? null;
  }

  const local = store.findUser(account);
  if (local && password === config.demoPassword) return local;
  return null;
}

export function authRouter() {
  const router = new Router({ prefix: '/api/v1/auth' });

  router.post('/login', async (ctx) => {
    const body = ctx.request.body as { account?: string; password?: string };
    if (!body?.account || !body?.password) {
      ctx.status = 400;
      ctx.body = fail('INVALID_INPUT', 'account and password required').body;
      return;
    }
    const user = await authenticate(body.account, body.password);
    if (!user) {
      ctx.status = 401;
      ctx.body = fail('INVALID_CREDENTIALS', '账号或密码不正确').body;
      return;
    }
    ctx.body = ok(signTokens(user));
  });

  router.post('/refresh', (ctx) => {
    const body = ctx.request.body as { refreshToken?: string };
    if (!body?.refreshToken) {
      ctx.status = 400;
      ctx.body = fail('INVALID_INPUT', 'refreshToken required').body;
      return;
    }
    try {
      const payload = verifyToken(body.refreshToken);
      if (payload.typ !== 'refresh') throw new Error('not refresh');
      const user = store.findUserById(payload.sub) ?? store.findUser(payload.account);
      if (!user) throw new Error('missing user');
      ctx.body = ok(signTokens(user));
    } catch {
      ctx.status = 401;
      ctx.body = fail('UNAUTHENTICATED', 'Invalid refresh token').body;
    }
  });

  return router;
}
