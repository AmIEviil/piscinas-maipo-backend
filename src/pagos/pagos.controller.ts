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
import { FileValidationPipe } from '../utils/file-validation.pipe';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLES } from '../auth/roles/roles.constants';

@Controller('pagos')
@Roles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TECNICO)
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

  @Roles(ROLES.SUPER_ADMIN)
  @Post('/upload')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }),
  )
  async createComprobantePago(
    @Body() dto: CreateComprobantePagoDto,
    @UploadedFile(new FileValidationPipe('document'))
    file?: Express.Multer.File,
  ) {
    // FormData no transporta arreglos: un id llega como string suelto y
    // varios llegan como arreglo. Se normaliza a arreglo siempre.
    const crudo = dto.mantencionIds as unknown;
    const mantencionIds = Array.isArray(crudo)
      ? crudo.map(String)
      : typeof crudo === 'string' && crudo.length > 0
        ? [crudo]
        : [];

    this.logger.log('Creando un nuevo comprobante de pago', { dto });
    return await this.pagosService.createComprobantePago(
      { ...dto, mantencionIds },
      file,
    );
  }

  @Get('by-parent/:parentId')
  async findByParentId(@Param('parentId') parentId: string) {
    this.logger.log(
      `Obteniendo comprobantes de pago con parentId: ${parentId}`,
    );
    return this.pagosService.findByParentId(parentId);
  }

  @Roles(ROLES.SUPER_ADMIN)
  @Delete(':id')
  async deleteComprobantePago(@Param('id') id: string) {
    this.logger.log(`Eliminando comprobante de pago con id: ${id}`);
    return await this.pagosService.deleteComprobantePago(id);
  }
}
