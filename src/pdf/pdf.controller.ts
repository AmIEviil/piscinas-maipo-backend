import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { PdfService } from './pdf.service';

@Controller('pdf')
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Get('revestimiento-propuesta/:id')
  async generatePropuestaRevestimientoPdf(
    @Param('id') revestimientoId: string,
    @Res() res: Response,
  ) {
    const pdf =
      await this.pdfService.generatePropuestaRevestimientoPdf(revestimientoId);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=html.pdf',
      'Content-Length': pdf.length,
    });

    res.end(pdf);
  }
}
