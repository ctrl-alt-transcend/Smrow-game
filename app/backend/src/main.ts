import { Logger, filterLogLevels } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaClientExceptionFilter } from './prisma-client-exception/prisma-client-exception.filter';
import cookieParser from 'cookie-parser';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

/** @brief: Defines the application gateway. This is where the Nest instance starts up
 */
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: filterLogLevels(process.env.LOG_LEVEL ?? '>=warn'),
  });

  if (process.env.NODE_ENV === 'development') {
    const { DevIoAdapter } = await import('./ws/dev-io.adapter.js');
    app.useWebSocketAdapter(new DevIoAdapter(app));
  }

  app.useStaticAssets(join(process.cwd(), 'uploads', 'avatars'), {
    prefix: '/uploads/avatars',
    index: false,
    dotfiles: 'deny',
  });
  app.useStaticAssets(join(process.cwd(), 'public'));
  app.use(cookieParser());
  const { httpAdapter } = app.get(HttpAdapterHost);

  /** @brief: includes the global exception filter for the Prisma Exception events.
   */
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((err) => Logger.fatal(err, 'Bootstrap'));
