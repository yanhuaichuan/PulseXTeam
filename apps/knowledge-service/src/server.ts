import { createHttpApp, listen } from '@pulsex/server';
import { knowledgeRouter } from './index.js';

const { app, router, logger } = createHttpApp('knowledge-service');
app.use(knowledgeRouter().routes());
app.use(router.routes());
await listen(app, Number(process.env.PORT ?? 3204), logger, 'knowledge-service');
