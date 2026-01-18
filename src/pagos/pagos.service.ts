import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ComprobantePago } from './entities/comprobante-pago.entity';
import { Repository } from 'typeorm';
import { GoogleDriveService } from '../google-drive/google-drive.service';
import {
  ComprobantePagoWithUrlDto,
  CreateComprobantePagoDto,
} from './dto/comprobante-pago.dto';
import { UploadedFilesService } from '../uploaded-files/uploaded-files.service';
import { UploadedFiles } from '../uploaded-files/entities/uploaded-files.entity';

@Injectable()
export class PagosService {
  constructor(
    @InjectRepository(ComprobantePago)
    private readonly comprobantePagoRepository: Repository<ComprobantePago>,
    private readonly uploadedFilesService: UploadedFilesService,
    private readonly googleDriveService: GoogleDriveService,
  ) {}

  async findAll(): Promise<ComprobantePago[]> {
    return await this.comprobantePagoRepository.find();
  }

  async findOne(id: string): Promise<ComprobantePago> {
    const comprobante = await this.comprobantePagoRepository.findOneBy({ id });
    if (!comprobante) {
      throw new Error(`ComprobantePago with id ${id} not found`);
    }
    return comprobante;
  }

  async createComprobantePago(
    dto: CreateComprobantePagoDto,
    file: Express.Multer.File,
  ): Promise<ComprobantePago> {
    const uploadResponse = await this.googleDriveService.uploadFile(
      file,
      file.originalname,
      file.mimetype,
      dto.parentId,
    );

    const newComprobante = this.comprobantePagoRepository.create({
      tipo: dto.tipo,
      nombre: dto.nombre,
      fecha_emision: dto.fecha_emision,
      fileId: uploadResponse.driveId,
      parentId: dto.parentId,
    });

    return await this.comprobantePagoRepository.save(newComprobante);
  }

  async findByParentId(parentId: string): Promise<ComprobantePagoWithUrlDto[]> {
    const results = await this.comprobantePagoRepository.find({
      where: { parentId },
    });

    return await Promise.all(
      results.map(async (comprobante) => {
        let viewUrl: string | null = null;
        let fileInfo: UploadedFiles | null = null;
        try {
          viewUrl = await this.googleDriveService.generateViewLink(
            String(comprobante.fileId),
          );
          fileInfo = await this.uploadedFilesService.findByDriveId(
            String(comprobante.fileId),
          );
        } catch (error) {
          console.error(
            `Error obteniendo el enlace de vista para fileId ${comprobante.fileId}:`,
            error,
          );
        }

        return {
          id: comprobante.id,
          tipo: comprobante.tipo,
          nombre: comprobante.nombre,
          fecha_emision: comprobante.fecha_emision,
          parentId: comprobante.parentId,
          fileId: comprobante.fileId,
          viewUrl,
          fileInfo,
        };
      }),
    );
  }
}
