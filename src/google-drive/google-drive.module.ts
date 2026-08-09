import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoogleDriveService } from './google-drive.service';
import { GoogleDriveController } from './google-drive.controller';
import { UploadedFiles } from '../uploaded-files/entities/uploaded-files.entity';
import { ComprobantePago } from '../pagos/entities/comprobante-pago.entity';

@Module({
  providers: [GoogleDriveService],
  controllers: [GoogleDriveController],
  imports: [TypeOrmModule.forFeature([UploadedFiles, ComprobantePago])],
  exports: [GoogleDriveService],
})
export class GoogleDriveModule {}
