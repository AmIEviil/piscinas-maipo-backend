import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';
import { revestimientoPropuestaTemplate } from './templates/revestimiento-propuesta';
import { RevestimientosService } from '@revestimientos/revestimientos.service';

@Injectable()
export class PdfService {
  constructor(private readonly revestimientoService: RevestimientosService) {}

  async generatePdfFromHtml(html: string): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
    });
    await page.evaluateHandle('document.fonts.ready');
    await browser.close();
    return Buffer.from(pdf);
  }

  async generatePropuestaRevestimientoPdf(revestimientoId: string) {
    const revestimiento =
      await this.revestimientoService.findOne(revestimientoId);
    console.log(revestimiento);
    const html = revestimientoPropuestaTemplate(revestimiento);
    const pdf = await this.generatePdfFromHtml(html);
    return pdf;
  }
}
