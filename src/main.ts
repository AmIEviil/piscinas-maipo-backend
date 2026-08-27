import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(helmet());

  // La aplicacion corre detras de un proxy inverso que termina TLS. Sin esto,
  // `req.ip` registra la IP del proxy en la auditoria de accesos y el
  // throttler cuenta todas las peticiones como si vinieran de un mismo
  // cliente.
  app.set('trust proxy', 1);

  // Origenes permitidos. Se toman de FRONTEND_URL (admite una lista separada
  // por comas para el caso de dominio con y sin www).
  //
  // Se retiraron las entradas fijas http://72.61.219.117 y :80: mantener un
  // origen HTTP en la lista implica aceptar que la aplicacion se sirva sin
  // TLS, es decir, credenciales y datos personales en texto claro.
  const origins = (process.env.FRONTEND_URL ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (process.env.NODE_ENV !== 'production') {
    origins.push('http://localhost:5173');
  }

  if (origins.length === 0) {
    throw new Error(
      'FRONTEND_URL no está definida: no hay ningún origen permitido para CORS',
    );
  }

  if (process.env.NODE_ENV === 'production') {
    const inseguros = origins.filter((origin) => origin.startsWith('http://'));
    if (inseguros.length > 0) {
      throw new Error(
        `Orígenes sin TLS en producción: ${inseguros.join(', ')}. Use https://`,
      );
    }
  }

  app.enableCors({
    origin: origins,
    credentials: true,
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
