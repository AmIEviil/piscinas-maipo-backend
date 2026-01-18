import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UploadedFiles } from './entities/uploaded-files.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UploadedFilesService {
  private readonly logger = new Logger(UploadedFilesService.name);

  constructor(
    @InjectRepository(UploadedFiles)
    private readonly uploadedFilesRepository: Repository<UploadedFiles>,
  ) {}

  async create(fileData: Partial<UploadedFiles>): Promise<UploadedFiles> {
    this.logger.log(`Creando registro de archivo: ${fileData.filename}`);
    const fileRecord = this.uploadedFilesRepository.create(fileData);
    return this.uploadedFilesRepository.save(fileRecord);
  }

  async findByFileId(fileId: number): Promise<UploadedFiles | null> {
    this.logger.log(`Buscando archivo por ID: ${fileId}`);
    return this.uploadedFilesRepository.findOneBy({ fileId: fileId });
  }

  async findByDriveId(driveId: string): Promise<UploadedFiles | null> {
    this.logger.log(`Buscando archivo por Drive ID: ${driveId}`);
    return this.uploadedFilesRepository.findOneBy({ driveId: driveId });
  }

  async deleteById(id: string): Promise<void> {
    this.logger.log(`Eliminando archivo por ID: ${id}`);
    await this.uploadedFilesRepository.delete(id);
  }

  async listAll(): Promise<UploadedFiles[]> {
    this.logger.log('Listando todos los archivos subidos');
    return this.uploadedFilesRepository.find();
  }

  async findByParentId(parentId: string): Promise<UploadedFiles[]> {
    this.logger.log(`Buscando archivos por Parent ID: ${parentId}`);

    const query =
      this.uploadedFilesRepository.createQueryBuilder('uploadedFiles');

    query.where('uploadedFiles.parentId = :parentId', { parentId });
    return query.getMany();
  }
}
