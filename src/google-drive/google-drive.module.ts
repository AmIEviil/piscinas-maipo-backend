import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoogleDriveService } from './google-drive.service';
import { GoogleDriveController } from './google-drive.controller';
import { UploadedFiles } from '../uploaded-files/entities/uploaded-files.entity';

@Module({
  providers: [GoogleDriveService],
  controllers: [GoogleDriveController],
  imports: [TypeOrmModule.forFeature([UploadedFiles])],
  exports: [GoogleDriveService],
})
export class GoogleDriveModule {}
