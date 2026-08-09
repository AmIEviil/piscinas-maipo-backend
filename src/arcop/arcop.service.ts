import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Client } from '../clients/entities/clients.entity';
import { Employee } from '../empleados/entities/empleado.entity';
import { EmployeeNote } from '../empleados/entities/employee_notes.entity';
import { Maintenance } from '../maintenance/entities/maintenance.entity';
import { Repair } from '../repairs/entities/repair.entity';
import { Revestimiento } from '../revestimientos/entities/revestimiento.entity';
import { Observaciones } from '../observaciones/entity/observaciones.entity';
import { UploadedFiles } from '../uploaded-files/entities/uploaded-files.entity';
import { ComprobantePago } from '../pagos/entities/comprobante-pago.entity';
import { DeletionLog } from './entities/deletion-log.entity';
import { SupresionDto } from './dto/supresion.dto';

/**
 * Soporte tecnico para los derechos ARCOP (arts. 4 a 9 Ley 21.719).
 *
 * - Acceso y portabilidad: exportacion completa y estructurada de todo lo que
 *   la aplicacion guarda sobre un titular.
 * - Supresion: borrado con constancia del alcance, para poder acreditarlo.
 *
 * Rectificacion y oposicion no necesitan endpoints nuevos: la primera se hace
 * por los endpoints de actualizacion existentes (que ya dejan traza en
 * `access_audit`), y la segunda es una decision de negocio que se materializa
 * dando de baja al titular.
 */
@Injectable()
export class ArcopService {
  private readonly logger = new Logger(ArcopService.name);

  constructor(
    @InjectRepository(Client)
    private readonly clientRepo: Repository<Client>,
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
    @InjectRepository(EmployeeNote)
    private readonly employeeNoteRepo: Repository<EmployeeNote>,
    @InjectRepository(Maintenance)
    private readonly maintenanceRepo: Repository<Maintenance>,
    @InjectRepository(Repair)
    private readonly repairRepo: Repository<Repair>,
    @InjectRepository(Revestimiento)
    private readonly revestimientoRepo: Repository<Revestimiento>,
    @InjectRepository(Observaciones)
    private readonly observacionesRepo: Repository<Observaciones>,
    @InjectRepository(UploadedFiles)
    private readonly uploadedFilesRepo: Repository<UploadedFiles>,
    @InjectRepository(ComprobantePago)
    private readonly comprobanteRepo: Repository<ComprobantePago>,
    @InjectRepository(DeletionLog)
    private readonly deletionLogRepo: Repository<DeletionLog>,
    private readonly dataSource: DataSource,
  ) {}

  // ---------------------------------------------------------------------
  // Acceso y portabilidad
  // ---------------------------------------------------------------------

  /**
   * Todo lo que la aplicacion guarda sobre un cliente, en formato
   * estructurado y de uso comun (art. 9: portabilidad).
   */
  async exportarCliente(clientId: string) {
    const client = await this.clientRepo.findOne({
      where: { id: clientId },
      relations: { frecuencia_mantencion: true },
    });
    if (!client) throw new NotFoundException('Cliente no encontrado');

    const [
      mantenciones,
      reparaciones,
      revestimientos,
      observaciones,
      archivos,
      comprobantes,
    ] = await Promise.all([
      this.maintenanceRepo.find({
        where: { client: { id: clientId } },
        relations: { productos: true },
      }),
      this.repairRepo.find({ where: { client: { id: clientId } } }),
      this.revestimientoRepo.find({
        where: { client: { id: clientId } },
        relations: { extras: true, imagenes: true },
      }),
      this.observacionesRepo.find({ where: { registro_id: clientId } }),
      this.uploadedFilesRepo.find({ where: { parentId: clientId } }),
      this.comprobanteRepo.find({ where: { parentId: clientId } }),
    ]);

    return {
      generado_en: new Date().toISOString(),
      tipo_titular: 'cliente',
      // Sirve como acuse: identifica la exportacion sin exponer nada nuevo.
      identificador: clientId,
      datos_identificacion: {
        nombre: client.nombre,
        direccion: client.direccion,
        comuna: client.comuna,
        telefono: client.telefono,
        email: client.email,
      },
      datos_servicio: {
        fecha_ingreso: client.fecha_ingreso,
        tipo_piscina: client.tipo_piscina,
        dia_mantencion: client.dia_mantencion,
        ruta: client.ruta,
        valor_mantencion: client.valor_mantencion,
        frecuencia_mantencion: client.frecuencia_mantencion,
        activo: client.isActive,
      },
      mantenciones,
      reparaciones,
      revestimientos,
      observaciones,
      // De los archivos se entrega el inventario, no el contenido binario.
      archivos_adjuntos: archivos.map((a) => ({
        nombre: a.filename,
        tipo: a.mimeType,
        tamano_bytes: a.size,
        fecha_carga: a.uploadDate,
      })),
      comprobantes_pago: comprobantes.map((c) => ({
        tipo: c.tipo,
        nombre: c.nombre,
        fecha_emision: c.fecha_emision,
        monto: c.monto,
      })),
    };
  }

  /** Todo lo que la aplicacion guarda sobre un trabajador. */
  async exportarEmpleado(employeeId: string) {
    const employee = await this.employeeRepo.findOne({
      where: { id: employeeId },
      relations: { notas: true },
    });
    if (!employee) throw new NotFoundException('Empleado no encontrado');

    return {
      generado_en: new Date().toISOString(),
      tipo_titular: 'trabajador',
      identificador: employeeId,
      datos_identificacion: {
        nombre: employee.nombre,
        apellido: employee.apellido,
        rut: `${employee.rut}-${employee.dv}`,
        email: employee.email,
        telefono: employee.telefono,
        direccion: employee.direccion,
      },
      datos_laborales: {
        fecha_inicio_contrato: employee.fechaInicioContrato,
        fecha_fin_contrato: employee.fechaFinContrato,
        tipo_contrato: employee.tipoContrato,
        sueldo: employee.sueldo,
        estado: employee.estado,
        grupo: employee.grupo,
      },
      registro: {
        creado_en: employee.createdAt,
        actualizado_en: employee.updatedAt,
      },
      notas: employee.notas ?? [],
    };
  }

  // ---------------------------------------------------------------------
  // Supresion
  // ---------------------------------------------------------------------

  /**
   * Suprime un cliente y todo lo asociado, dejando constancia del alcance.
   *
   * Va en transaccion: una supresion a medias deja datos personales huerfanos
   * y una constancia que no corresponde con la realidad.
   */
  async suprimirCliente(
    clientId: string,
    dto: SupresionDto,
    ejecutadoPor: string | null,
  ) {
    const client = await this.clientRepo.findOneBy({ id: clientId });
    if (!client) throw new NotFoundException('Cliente no encontrado');

    const alcance = await this.dataSource.transaction(async (manager) => {
      const porCliente = { where: { client: { id: clientId } } };

      const [
        mantenciones,
        reparaciones,
        revestimientos,
        observaciones,
        archivos,
        comprobantes,
      ] = await Promise.all([
        manager.count(Maintenance, porCliente),
        manager.count(Repair, porCliente),
        manager.count(Revestimiento, porCliente),
        manager.count(Observaciones, { where: { registro_id: clientId } }),
        manager.count(UploadedFiles, { where: { parentId: clientId } }),
        manager.count(ComprobantePago, { where: { parentId: clientId } }),
      ]);

      // Mantenciones, reparaciones y revestimientos caen por ON DELETE CASCADE
      // desde Client. Observaciones, archivos y comprobantes se enlazan por
      // un id suelto (`registro_id` / `parentId`), sin clave foranea, asi que
      // hay que borrarlos explicitamente o quedarian huerfanos.
      await manager.delete(Observaciones, { registro_id: clientId });
      await manager.delete(UploadedFiles, { parentId: clientId });
      await manager.delete(ComprobantePago, { parentId: clientId });
      await manager.delete(Client, { id: clientId });

      return {
        mantenciones,
        reparaciones,
        revestimientos,
        observaciones,
        archivos,
        comprobantes,
      };
    });

    await this.deletionLogRepo.insert({
      entity: 'Client',
      record_id: clientId,
      motivo: dto.motivo,
      referencia_solicitud: dto.referencia_solicitud ?? null,
      ejecutado_por: ejecutadoPor,
      alcance,
    });

    // Los binarios viven fuera de la base y no se borran aqui: queda
    // constancia para que el responsable complete la supresion en el proveedor.
    if (alcance.archivos > 0 || alcance.comprobantes > 0) {
      this.logger.warn(
        `Supresión de Client ${clientId}: ${alcance.archivos + alcance.comprobantes} archivo(s) en Google Drive requieren eliminación manual en el proveedor`,
      );
    }

    return {
      message: 'Datos del titular suprimidos',
      entity: 'Client',
      record_id: clientId,
      alcance,
      requiere_accion_manual:
        alcance.archivos + alcance.comprobantes > 0
          ? 'Eliminar los archivos asociados en Google Drive'
          : null,
    };
  }

  /** Suprime un trabajador y sus notas, dejando constancia del alcance. */
  async suprimirEmpleado(
    employeeId: string,
    dto: SupresionDto,
    ejecutadoPor: string | null,
  ) {
    const employee = await this.employeeRepo.findOneBy({ id: employeeId });
    if (!employee) throw new NotFoundException('Empleado no encontrado');

    const alcance = await this.dataSource.transaction(async (manager) => {
      const notas = await manager.count(EmployeeNote, {
        where: { employee: { id: employeeId } },
      });

      // EmployeeNote cae por ON DELETE CASCADE, pero se cuenta antes para
      // dejar constancia del alcance real.
      await manager.delete(Employee, { id: employeeId });

      return { notas };
    });

    await this.deletionLogRepo.insert({
      entity: 'Employee',
      record_id: employeeId,
      motivo: dto.motivo,
      referencia_solicitud: dto.referencia_solicitud ?? null,
      ejecutado_por: ejecutadoPor,
      alcance,
    });

    return {
      message: 'Datos del titular suprimidos',
      entity: 'Employee',
      record_id: employeeId,
      alcance,
    };
  }

  /**
   * Constancias de supresion. Es la evidencia que se presenta ante un reclamo
   * o una fiscalizacion.
   */
  async historialSupresiones(entity?: string) {
    return this.deletionLogRepo.find({
      where: entity ? { entity } : {},
      order: { created_at: 'DESC' },
      take: 500,
    });
  }

  /** Recuento de notas de trabajadores marcadas como sensibles. */
  async empleadosEnEstadoSensible() {
    // 'LICENCIA' indica una licencia medica: dato de salud (art. 16). Sirve
    // para revisar periodicamente que no se acumulen mas alla de lo necesario.
    return this.employeeRepo.count({ where: { estado: 'LICENCIA' } });
  }
}
