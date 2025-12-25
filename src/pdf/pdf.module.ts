import { Module } from '@nestjs/common';
import { RevestimientosModule } from '@revestimientos/revestimientos.module';
import { PdfController } from './pdf.controller';
import { PdfService } from './pdf.service';

@Module({
  imports: [RevestimientosModule],
  controllers: [PdfController],
  providers: [PdfService],
})
export class PdfModule {}
