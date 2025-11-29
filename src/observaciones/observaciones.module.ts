import { Module } from '@nestjs/common';
import { ObservacionesService } from './observaciones.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Observaciones } from './entity/observaciones.entity';
import { ObservacionesController } from './observaciones.controller';

@Module({
  providers: [ObservacionesService],
  controllers: [ObservacionesController],
  imports: [TypeOrmModule.forFeature([Observaciones])],
  exports: [ObservacionesService],
})
export class ObservacionesModule {}
