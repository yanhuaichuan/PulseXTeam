import { createHttpApp, listen } from '@pulsex/server';
import { aiRouter } from './index.js';

const { app, router, logger } = createHttpApp('ai-service');
app.use(aiRouter().routes());
app.use(router.routes());
await listen(app, Number(process.env.PORT ?? 3206), logger, 'ai-service');
