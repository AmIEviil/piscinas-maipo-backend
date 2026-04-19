/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { GoogleDriveService } from './google-drive.service';
import { FileValidationPipe } from '../utils/file-validation.pipe';

@Controller('drive')
export class GoogleDriveController {
  private readonly logger = new Logger(GoogleDriveController.name);
  constructor(private readonly driveService: GoogleDriveService) {}

  @Post('upload/:parentId')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
  async upload(
    @UploadedFile(new FileValidationPipe('document')) file: Express.Multer.File,
    @Param('parentId') parentId: string,
  ) {
    this.logger.log(`Subiendo archivo: ${file.originalname}`);
    return await this.driveService.uploadFile(
      file,
      file.originalname,
      file.mimetype,
      parentId,
    );
  }

  @Get('file/:fileId')
  async getFile(@Param('fileId') fileId: string, @Res() res: Response) {
    const { stream, mimeType, name } =
      await this.driveService.getFileStream(fileId);

    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `inline; filename="${name}"`,
    });

    stream.pipe(res);
  }
}
