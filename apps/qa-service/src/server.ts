import { createHttpApp, listen } from '@pulsex/server';
import { qaRouter } from './index.js';

const { app, router, logger } = createHttpApp('qa-service');
app.use(qaRouter().routes());
app.use(router.routes());
await listen(app, Number(process.env.PORT ?? 3203), logger, 'qa-service');
