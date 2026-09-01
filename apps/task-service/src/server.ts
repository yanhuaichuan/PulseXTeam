import { createHttpApp, listen } from '@pulsex/server';
import { taskRouter } from './index.js';

const { app, router, logger } = createHttpApp('task-service');
app.use(taskRouter().routes());
app.use(router.routes());
await listen(app, Number(process.env.PORT ?? 3202), logger, 'task-service');
