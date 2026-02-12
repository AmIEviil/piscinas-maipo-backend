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
    file?: Express.Multer.File,
  ): Promise<ComprobantePago> {
    let uploadResponse: UploadedFiles | null = null;
    if (file) {
      uploadResponse = await this.googleDriveService.uploadFile(
        file,
        file.originalname,
        file.mimetype,
        dto.parentId,
      );
    }

    const newComprobante = this.comprobantePagoRepository.create({
      tipo: dto.tipo,
      nombre: dto.nombre,
      fecha_emision: dto.fecha_emision,
      monto: Number(dto.monto),
      fileId: uploadResponse?.driveId || '',
      parentId: dto.parentId,
    });

    return await this.comprobantePagoRepository.save(newComprobante);
  }

  async findByParentId(
    parentId: string,
  ): Promise<{ [key: string]: ComprobantePagoWithUrlDto[] }> {
    const results = await this.comprobantePagoRepository.find({
      where: { parentId },
    });

    const comprobantes = await Promise.all(
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
          monto: comprobante.monto,
          parentId: comprobante.parentId,
          fileId: comprobante.fileId,
          viewUrl,
          fileInfo,
        };
      }),
    );

    const grouped = comprobantes.reduce(
      (acc, item) => {
        const date = new Date(item.fecha_emision);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
      },
      {} as Record<string, ComprobantePagoWithUrlDto[]>,
    );

    return grouped;
  }

  async deleteComprobantePago(id: string): Promise<void> {
    const comprobante = await this.comprobantePagoRepository.findOneBy({ id });
    if (!comprobante) {
      throw new Error(`ComprobantePago with id ${id} not found`);
    }

    await this.googleDriveService.deleteFile(String(comprobante.fileId));
    await this.comprobantePagoRepository.delete(id);
  }
}
