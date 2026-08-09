import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ClientsModule } from './clients/clients.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { ProductsModule } from './products/products.module';
import { RepairsModule } from './repairs/repairs.module';
import { RevestimientosModule } from './revestimientos/revestimientos.module';
import { MetricsModule } from './metrics/metrics.module';
import { AuthModule } from './auth/auth.module';
import { HttpModule } from '@nestjs/axios';
import { CloudinaryModule } from './cloudinary/clodinary.module';
import { MigracionesModule } from './migraciones/migraciones.module';
import { ObservacionesController } from './observaciones/observaciones.controller';
import { ObservacionesModule } from './observaciones/observaciones.module';
import { TasksModule } from './tasks/tasks.module';
import { PdfModule } from './pdf/pdf.module';
import { GoogleDriveModule } from './google-drive/google-drive.module';
import { UploadedFilesModule } from './uploaded-files/uploaded-files.module';
import { PagosModule } from './pagos/pagos.module';
import { EmpleadosModule } from './empleados/empleados.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { MailModule } from './mail/mail.module';
import { GlobalJwtAuthGuard } from './auth/guards/global-jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { RoleUser } from './users/entities/role-user.entity';
import { AuditModule } from './audit/audit.module';
import { ArcopModule } from './arcop/arcop.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        name: 'global',
        ttl: 60_000,
        limit: 120,
      },
    ]),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      // ponytail: fail-closed. Opt in with DB_SYNCHRONIZE=true in dev .env only. NEVER in prod (use migrations).
      synchronize: process.env.DB_SYNCHRONIZE === 'true',
      // migrationsRun: true,
      // TLS hacia la base de datos. Se activa con DB_SSL=true. Si la base no
      // esta en el mismo host que la aplicacion, la conexion lleva datos
      // personales por la red y debe ir cifrada.
      // DB_SSL_REJECT_UNAUTHORIZED=false solo para proveedores con certificado
      // autofirmado; deja el canal cifrado pero sin validar la contraparte.
      ssl:
        process.env.DB_SSL === 'true'
          ? {
              rejectUnauthorized:
                process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
            }
          : false,
      extra: {
        max: 10,
        idleTimeoutMillis: 30000,
      },
      migrations: [__dirname + '/migrations/*{.ts,.js}'],
    }),
    TypeOrmModule.forFeature([RoleUser]), // para RolesGuard
    AuditModule,
    ArcopModule,
    UsersModule,
    ClientsModule,
    MaintenanceModule,
    ProductsModule,
    RepairsModule,
    RevestimientosModule,
    MetricsModule,
    AuthModule,
    HttpModule,
    CloudinaryModule,
    MigracionesModule,
    ObservacionesModule,
    TasksModule,
    PdfModule,
    GoogleDriveModule,
    UploadedFilesModule,
    PagosModule,
    EmpleadosModule,
    VehiclesModule,
    MailModule,
  ],
  controllers: [AppController, ObservacionesController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: GlobalJwtAuthGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
