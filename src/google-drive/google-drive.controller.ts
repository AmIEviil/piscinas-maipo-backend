import {
  Controller,
  Get,
  Logger,
  NotFoundException,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GoogleDriveService } from './google-drive.service';
import { FileValidationPipe } from '../utils/file-validation.pipe';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLE_GROUPS } from '../auth/constants/roles';
import { Audit } from '../audit/audit.decorator';
import { UploadedFiles } from '../uploaded-files/entities/uploaded-files.entity';
import { ComprobantePago } from '../pagos/entities/comprobante-pago.entity';

@Controller('drive')
@Roles(...ROLE_GROUPS.MANAGEMENT)
@Audit('ArchivoAdjunto')
export class GoogleDriveController {
  private readonly logger = new Logger(GoogleDriveController.name);
  constructor(
    private readonly driveService: GoogleDriveService,
    @InjectRepository(UploadedFiles)
    private readonly uploadedFilesRepo: Repository<UploadedFiles>,
    @InjectRepository(ComprobantePago)
    private readonly comprobanteRepo: Repository<ComprobantePago>,
  ) {}

  @Post('upload/:parentId')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }),
  )
  async upload(
    @UploadedFile(new FileValidationPipe('document')) file: Express.Multer.File,
    @Param('parentId') parentId: string,
  ) {
    this.logger.log('Subiendo archivo a Drive');
    return await this.driveService.uploadFile(
      file,
      file.originalname,
      file.mimetype,
      parentId,
    );
  }

  // El identificador que llega es un ID de Google Drive y se resuelve con el
  // refresh token OAuth de la aplicacion. Sin comprobacion, cualquier ID
  // alcanzable por esa cuenta se podia descargar por aqui, tambien archivos
  // ajenos a la aplicacion. Solo se sirven archivos registrados por la propia
  // aplicacion.
  private async assertFileBelongsToApp(driveId: string): Promise<void> {
    const [subido, comprobante] = await Promise.all([
      this.uploadedFilesRepo.findOneBy({ driveId }),
      this.comprobanteRepo.findOneBy({ fileId: driveId }),
    ]);
    if (!subido && !comprobante) {
      throw new NotFoundException('Archivo no encontrado');
    }
  }

  @Get('file/:fileId')
  async getFile(@Param('fileId') fileId: string, @Res() res: Response) {
    await this.assertFileBelongsToApp(fileId);

    const { stream, mimeType, name } =
      await this.driveService.getFileStream(fileId);

    // `attachment` en vez de `inline`: el nombre y el tipo provienen de Drive,
    // y renderizarlos en el origen de la API permitiria ejecutar contenido
    // activo con las cookies y el origen de la aplicacion.
    const safeName = name.replace(/[^\w.\-() ]/g, '_');

    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${safeName}"`,
      'X-Content-Type-Options': 'nosniff',
    });

    stream.pipe(res);
  }
}
