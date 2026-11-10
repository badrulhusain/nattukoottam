import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // Security & Optimization Middleware
  app.use(helmet());
  app.use(compression());
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Global DTO Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // OpenAPI / Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Naatukoottam (നാട്ടുകൂട്ടം) API')
    .setDescription(
      'Kerala Community Social Networking & Interdepartmental Infrastructure Coordination Platform API',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT or Clerk session token',
        in: 'header',
      },
      'bearer-jwt',
    )
    .addTag('Health & Services', 'System health check and live status of all wired cloud services')
    .addTag('Auth', 'Citizen & Official authentication, Clerk and JWT flows')
    .addTag('Social', 'Community posts, likes, comments, and media')
    .addTag('Issues', 'Civic issue reporting, lifecycle tracking, and community support')
    .addTag('Departments', 'Government departments and official coordination')
    .addTag('Projects', 'Infrastructure project registry and overlap conflict detection')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Naatukoottam API Docs',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  // Set when Nx waits for this server to be ready
  if (process.env.NX_READY_SIGNAL_SOCKET) {
    try {
      const load = new Function('s', 'return import(s)') as (s: string) => Promise<{ emitReadySignal(server: unknown): boolean }>;
      (await load('@nx/js/ready-signal')).emitReadySignal(app.getHttpServer());
    } catch {
      // @nx/js isn't installed
    }
  }

  Logger.log(`🚀 Naatukoottam API is running on: http://localhost:${port}/${globalPrefix}`);
  Logger.log(`📚 Swagger Documentation available at: http://localhost:${port}/api/docs`);
}

bootstrap();
