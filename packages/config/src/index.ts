export const config = {
  service: process.env.SERVICE_NAME ?? 'pulsex',
  nodeEnv: process.env.NODE_ENV ?? 'development',
  gatewayPort: Number(process.env.GATEWAY_PORT ?? 3100),
  realtimePort: Number(process.env.REALTIME_PORT ?? 3101),
  jwtSecret: process.env.JWT_SECRET ?? 'pulsex-dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '2h',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  demoAccount: process.env.DEMO_ACCOUNT ?? 'yanhuaichuan',
  demoPassword: process.env.DEMO_PASSWORD ?? 'pulsex',
  db: {
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: Number(process.env.DB_PORT ?? 3306),
    database: process.env.DB_DATABASE ?? 'pulsex',
    user: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    prefix: process.env.DB_PREFIX ?? 'zt_'
  },
  legacyApiUrl: process.env.LEGACY_API_URL ?? '',
  redis: {
    host: process.env.REDIS_HOST ?? '127.0.0.1',
    port: Number(process.env.REDIS_PORT ?? 6379)
  },
  ai: {
    provider: process.env.AI_PROVIDER ?? 'openai-compatible',
    baseUrl: process.env.AI_BASE_URL ?? '',
    apiKey: process.env.AI_API_KEY ?? '',
    model: process.env.AI_MODEL ?? 'deepseek-chat'
  },
  dingtalk: {
    webhook: process.env.DINGTALK_WEBHOOK ?? '',
    secret: process.env.DINGTALK_SECRET ?? ''
  }
};

export function assertNoSecretInLog(value: string) {
  return value ? '[redacted]' : '';
}
