import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { PagosService } from './pagos.service';
import { CreateComprobantePagoDto } from './dto/comprobante-pago.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('pagos')
export class PagosController {
  private readonly logger = new Logger(PagosController.name);
  constructor(private readonly pagosService: PagosService) {}

  @Get()
  async findAll() {
    this.logger.log('Obteniendo todos los comprobantes de pago');
    return await this.pagosService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`Obteniendo comprobante de pago con id: ${id}`);
    return await this.pagosService.findOne(id);
  }

  @Post('/upload')
  @UseInterceptors(FileInterceptor('file'))
  async createComprobantePago(
    @Body() dto: CreateComprobantePagoDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    this.logger.log('Creando un nuevo comprobante de pago', { dto });
    return await this.pagosService.createComprobantePago(dto, file);
  }

  @Get('by-parent/:parentId')
  async findByParentId(@Param('parentId') parentId: string) {
    this.logger.log(
      `Obteniendo comprobantes de pago con parentId: ${parentId}`,
    );
    return this.pagosService.findByParentId(parentId);
  }

  @Delete(':id')
  async deleteComprobantePago(@Param('id') id: string) {
    this.logger.log(`Eliminando comprobante de pago con id: ${id}`);
    return await this.pagosService.deleteComprobantePago(id);
  }
}
