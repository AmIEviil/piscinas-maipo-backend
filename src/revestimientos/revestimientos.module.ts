import { Module } from '@nestjs/common';
import { RevestimientosService } from './revestimientos.service';
import { RevestimientosController } from './revestimientos.controller';
import { ExtraRevestimiento } from './entities/extra-revestimiento.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  providers: [RevestimientosService],
  controllers: [RevestimientosController],
  imports: [TypeOrmModule.forFeature([ExtraRevestimiento])],
})
export class RevestimientosModule {}
