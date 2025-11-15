import { forwardRef, Module } from '@nestjs/common';
import { MigracionesService } from './migraciones.service';
import { MigracionesController } from './migraciones.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MigrationAudit } from './entities/migration-audit.entity';

@Module({
  providers: [MigracionesService],
  controllers: [MigracionesController],
  exports: [MigracionesService],
  imports: [
    TypeOrmModule.forFeature([MigrationAudit]),
    forwardRef(() => MigrationAudit),
  ],
})
export class MigracionesModule {}
