import { createHttpApp, listen } from '@pulsex/server';
import { projectRouter } from './index.js';

const { app, router, logger } = createHttpApp('project-service');
app.use(projectRouter().routes());
app.use(router.routes());
await listen(app, Number(process.env.PORT ?? 3201), logger, 'project-service');
