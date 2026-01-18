import { Controller, Get, Logger, Param } from '@nestjs/common';
import { UploadedFilesService } from './uploaded-files.service';

@Controller('uploaded-files')
export class UploadedFilesController {
  private readonly logger = new Logger(UploadedFilesController.name);

  constructor(private readonly uploadedFilesService: UploadedFilesService) {}

  @Get(':parentId')
  async getFilesByParentId(@Param('parentId') parentId: string) {
    this.logger.log(`Obteniendo archivos para Parent ID: ${parentId}`);
    return this.uploadedFilesService.findByParentId(parentId);
  }
}
