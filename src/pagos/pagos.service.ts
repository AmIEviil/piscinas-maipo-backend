import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ComprobantePago } from './entities/comprobante-pago.entity';
import { In, Repository } from 'typeorm';
import { GoogleDriveService } from '../google-drive/google-drive.service';
import {
  ComprobantePagoWithUrlDto,
  CreateComprobantePagoDto,
} from './dto/comprobante-pago.dto';
import { UploadedFilesService } from '../uploaded-files/uploaded-files.service';
import { UploadedFiles } from '../uploaded-files/entities/uploaded-files.entity';
import { Maintenance } from '../maintenance/entities/maintenance.entity';

@Injectable()
export class PagosService {
  constructor(
    @InjectRepository(ComprobantePago)
    private readonly comprobantePagoRepository: Repository<ComprobantePago>,
    @InjectRepository(Maintenance)
    private readonly maintenanceRepository: Repository<Maintenance>,
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

    const ids = dto.mantencionIds ?? [];

    // El comprobante y el estado de las visitas se escriben juntos: si una de
    // las dos falla, no debe quedar una visita marcada como pagada sin un
    // comprobante que la respalde.
    return await this.comprobantePagoRepository.manager.transaction(
      async (manager) => {
        let mantenciones: Maintenance[] = [];

        if (ids.length > 0) {
          mantenciones = await manager.findBy(Maintenance, { id: In(ids) });
          for (const mantencion of mantenciones) {
            mantencion.recibioPago = true;
          }
          await manager.save(mantenciones);
        }

        const nuevo = manager.create(ComprobantePago, {
          tipo: dto.tipo,
          nombre: dto.nombre,
          fecha_emision: dto.fecha_emision,
          monto: Number(dto.monto),
          fileId: uploadResponse?.driveId || '',
          parentId: dto.parentId,
          mantenciones,
        });

        return await manager.save(nuevo);
      },
    );
  }

  async findByParentId(
    parentId: string,
  ): Promise<{ [key: string]: ComprobantePagoWithUrlDto[] }> {
    const results = await this.comprobantePagoRepository.find({
      where: { parentId },
      relations: { mantenciones: true },
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
          mantenciones: (comprobante.mantenciones ?? []).map((m) => ({
            id: m.id,
            fechaMantencion: String(m.fechaMantencion),
          })),
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
    let fileId = '';

    // El comprobante y el estado de las visitas se revierten juntos: si una
    // de las dos falla, no debe quedar el comprobante borrado con visitas
    // que sigan marcadas como pagadas sin comprobante que las respalde.
    await this.comprobantePagoRepository.manager.transaction(
      async (manager) => {
        const comprobante = await manager.findOne(ComprobantePago, {
          where: { id },
          relations: { mantenciones: true },
        });

        if (!comprobante) {
          throw new Error(`ComprobantePago with id ${id} not found`);
        }

        fileId = String(comprobante.fileId ?? '');

        if (comprobante.mantenciones?.length) {
          for (const mantencion of comprobante.mantenciones) {
            mantencion.recibioPago = false;
          }
          await manager.save(comprobante.mantenciones);
        }

        await manager.remove(comprobante);
      },
    );

    // El borrado del archivo en Drive queda fuera de la transaccion: es un
    // sistema externo y no participa del rollback.
    if (fileId) {
      try {
        await this.googleDriveService.deleteFile(fileId);
      } catch (error) {
        console.error(
          `Comprobante ${id} eliminado, pero no se pudo borrar su archivo en Drive:`,
          error,
        );
      }
    }
  }

  async findRecentPayments(): Promise<ComprobantePago[]> {
    const since = new Date();
    since.setDate(since.getDate() - 7);
    const sinceStr = since.toISOString().split('T')[0]; // 'YYYY-MM-DD'

    return this.comprobantePagoRepository
      .createQueryBuilder('pago')
      .where('pago.fecha_emision >= :since', { since: sinceStr })
      .getMany();
  }
}
