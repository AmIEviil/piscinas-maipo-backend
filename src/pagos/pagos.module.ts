import { Module } from '@nestjs/common';
import { PagosService } from './pagos.service';
import { PagosController } from './pagos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComprobantePago } from './entities/comprobante-pago.entity';
import { GoogleDriveModule } from '../google-drive/google-drive.module';
import { UploadedFilesModule } from '../uploaded-files/uploaded-files.module';

@Module({
  providers: [PagosService],
  controllers: [PagosController],
  imports: [
    TypeOrmModule.forFeature([ComprobantePago]),
    GoogleDriveModule,
    UploadedFilesModule,
  ],
})
export class PagosModule {}
