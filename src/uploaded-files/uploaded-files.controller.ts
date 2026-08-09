import { Controller, Get, Logger, Param } from '@nestjs/common';
import { UploadedFilesService } from './uploaded-files.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLE_GROUPS } from '../auth/constants/roles';
import { Audit } from '../audit/audit.decorator';

@Controller('uploaded-files')
@Roles(...ROLE_GROUPS.MANAGEMENT)
@Audit('ArchivoAdjunto')
export class UploadedFilesController {
  private readonly logger = new Logger(UploadedFilesController.name);

  constructor(private readonly uploadedFilesService: UploadedFilesService) {}

  @Get(':parentId')
  async getFilesByParentId(@Param('parentId') parentId: string) {
    this.logger.log(`Obteniendo archivos para Parent ID: ${parentId}`);
    return this.uploadedFilesService.findByParentId(parentId);
  }
}
