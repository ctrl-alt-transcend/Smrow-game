import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { PrismaClientExceptionFilter } from './common/filters/prisma-client-exception.filter';


/** @brief: Defines the application gateway. This is where the Nest instance starts up
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /** @brief: A Pipe operates on a handler’s arguments (route parameters, body, query).
  *           Its role is to validate or transform data before it reaches a controller.
  */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const { httpAdapter } = app.get(HttpAdapterHost)

  /** @brief: includes the global exception filter for the Prisma Exception events.
 */
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter))

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

