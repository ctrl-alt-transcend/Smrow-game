import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';


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

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

