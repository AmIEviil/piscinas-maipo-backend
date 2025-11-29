import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true, // Solo en desarrollo
      // migrationsRun: true,
      extra: {
        max: 10, // <= conexiones máximas por instancia
        idleTimeoutMillis: 30000, // cierra conexiones inactivas tras 30s
      },
      migrations: [__dirname + '/migrations/*{.ts,.js}'],
    }),
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
  ],
  controllers: [AppController, ObservacionesController],
  providers: [AppService],
})
export class AppModule {}
