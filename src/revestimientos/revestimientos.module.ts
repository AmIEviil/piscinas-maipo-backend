import { Module } from '@nestjs/common';
import { RevestimientosService } from './revestimientos.service';
import { RevestimientosController } from './revestimientos.controller';
import { ExtraRevestimiento } from './entities/extra-revestimiento.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Revestimiento } from './entities/revestimiento.entity';
import { CloudinaryModule } from '../cloudinary/clodinary.module';

@Module({
  providers: [RevestimientosService],
  controllers: [RevestimientosController],
  imports: [
    TypeOrmModule.forFeature([Revestimiento, ExtraRevestimiento]),
    CloudinaryModule,
  ],
  exports: [RevestimientosService],
})
export class RevestimientosModule {}
