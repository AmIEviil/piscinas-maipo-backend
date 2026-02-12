import { Module } from '@nestjs/common';
import { UploadedFilesService } from './uploaded-files.service';
import { UploadedFilesController } from './uploaded-files.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadedFiles } from './entities/uploaded-files.entity';
import { GoogleDriveModule } from '../google-drive/google-drive.module';

@Module({
  providers: [UploadedFilesService],
  controllers: [UploadedFilesController],
  imports: [TypeOrmModule.forFeature([UploadedFiles]), GoogleDriveModule],
  exports: [UploadedFilesService],
})
export class UploadedFilesModule {}
