import { createHttpApp, listen } from '@pulsex/server';
import { bindNotificationBus, notificationRouter } from './index.js';

bindNotificationBus();
const { app, router, logger } = createHttpApp('notification-service');
app.use(notificationRouter().routes());
app.use(router.routes());
await listen(app, Number(process.env.PORT ?? 3205), logger, 'notification-service');
