import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { CloudinaryController } from './cloudinary.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RevestimientoImagen } from '@revestimientos/entities/revestimiento-imagen.entity';
import { Revestimiento } from '@revestimientos/entities/revestimiento.entity';
import { CloudinaryProvider } from './cloudinary.provider';

import * as dotenv from 'dotenv';

dotenv.config();

@Module({
  imports: [TypeOrmModule.forFeature([RevestimientoImagen, Revestimiento])],
  providers: [CloudinaryProvider, CloudinaryService],
  controllers: [CloudinaryController],
})
export class CloudinaryModule {}
