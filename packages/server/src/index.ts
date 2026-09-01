import Router from '@koa/router';
import cors from '@koa/cors';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import jwt from 'jsonwebtoken';
import { config } from '@pulsex/config';
import { fail, requestId, store } from '@pulsex/shared';
import type { User } from '@pulsex/types';

export { default as Router } from '@koa/router';

export interface AuthedState {
  requestId: string;
  user?: User;
}

export function createLogger(service: string) {
  return {
    info(event: string, extra: Record<string, unknown> = {}) {
      console.log(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          service,
          level: 'info',
          event,
          ...extra
        })
      );
    },
    error(event: string, extra: Record<string, unknown> = {}) {
      console.error(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          service,
          level: 'error',
          event,
          ...extra
        })
      );
    }
  };
}

export function signTokens(user: User) {
  const payload = { sub: user.id, account: user.account, role: user.role };
  const accessToken = jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as jwt.SignOptions['expiresIn']
  });
  const refreshToken = jwt.sign({ ...payload, typ: 'refresh' }, config.jwtSecret, {
    expiresIn: config.jwtRefreshExpiresIn as jwt.SignOptions['expiresIn']
  });
  return { accessToken, refreshToken, user };
}

export function verifyToken(token: string) {
  return jwt.verify(token, config.jwtSecret) as { sub: string; account: string; role: string; typ?: string };
}

export function authMiddleware() {
  return async (ctx: Koa.Context, next: Koa.Next) => {
    const header = ctx.get('authorization');
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token) {
      ctx.status = 401;
      ctx.body = fail('UNAUTHENTICATED', 'Missing token').body;
      return;
    }
    try {
      const payload = verifyToken(token);
      const user = store.findUserById(payload.sub) ?? store.findUser(payload.account);
      if (!user) {
        ctx.status = 401;
        ctx.body = fail('UNAUTHENTICATED', 'User not found').body;
        return;
      }
      (ctx.state as AuthedState).user = user;
      await next();
    } catch {
      ctx.status = 401;
      ctx.body = fail('UNAUTHENTICATED', 'Invalid token').body;
    }
  };
}

export function createHttpApp(service: string) {
  const app = new Koa();
  const logger = createLogger(service);

  app.use(cors({ origin: '*' }));
  app.use(bodyParser());
  app.use(async (ctx, next) => {
    const id = ctx.get('x-request-id') || requestId();
    ctx.set('x-request-id', id);
    (ctx.state as AuthedState).requestId = id;
    const started = Date.now();
    try {
      await next();
      logger.info('http_request', {
        requestId: id,
        method: ctx.method,
        path: ctx.path,
        status: ctx.status,
        ms: Date.now() - started
      });
    } catch (error) {
      logger.error('http_error', {
        requestId: id,
        method: ctx.method,
        path: ctx.path,
        message: error instanceof Error ? error.message : 'unknown'
      });
      ctx.status = 500;
      ctx.body = fail('INTERNAL_ERROR', 'Internal error', 500).body;
    }
  });

  const router = new Router();
  router.get('/health', (ctx) => {
    ctx.body = { success: true, data: { service, status: 'ok' } };
  });

  return { app, router, logger };
}

export async function listen(app: Koa, port: number, logger: ReturnType<typeof createLogger>, service: string) {
  await new Promise<void>((resolve) => {
    app.listen(port, () => {
      logger.info('listen', { port, service });
      resolve();
    });
  });
}

export type { User };
