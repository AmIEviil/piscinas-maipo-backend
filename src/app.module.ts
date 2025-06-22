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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Permite acceder a process.env en toda la app sin volver a importar
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: 5432,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true, // Solo en desarrollo
    }),
    UsersModule,
    ClientsModule,
    MaintenanceModule,
    ProductsModule,
    RepairsModule,
    RevestimientosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
