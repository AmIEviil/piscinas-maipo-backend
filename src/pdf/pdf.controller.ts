import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { PdfService } from './pdf.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLE_GROUPS } from '../auth/constants/roles';
import { Audit } from '../audit/audit.decorator';

// El PDF de propuesta contiene los datos del cliente (nombre, direccion,
// contacto). Antes el controlador no declaraba rol y quedaba abierto a
// cualquier usuario autenticado.
@Controller('pdf')
@Roles(...ROLE_GROUPS.STAFF)
@Audit('Client')
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

  @Get('revestimiento-propuesta/html/:id')
  async getPropuestaRevestimientoHtml(
    @Param('id') revestimientoId: string,
  ): Promise<string> {
    const html = await this.pdfService.generatePropuestaRevestimientoPdf(
      revestimientoId,
      true,
    );
    return html as string;
  }
}
