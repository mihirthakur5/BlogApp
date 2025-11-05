import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import express from 'express';
import { TypeOrmExceptionFilter } from '../filters/typeorm-exception.filter';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    // include scheme so browser origin matches exactly
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.use('/uploads', express.static(join(process.cwd(), 'src', 'uploads')));
  app.useGlobalFilters(new TypeOrmExceptionFilter());
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
