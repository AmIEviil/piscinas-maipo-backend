import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, MoreThan, Repository } from 'typeorm';
import { Client } from './entities/clients.entity';
import { Maintenance } from '../maintenance/entities/maintenance.entity';
import { MaintenanceTemporality } from './entities/frecuency-maintenance';
import { FilterClientsDto } from './dto/FilterClients.dto';
import { CreateClientDto } from './dto/CreateClient.dto';
import { ObservacionesService } from '../observaciones/observaciones.service';
import { getValorCampoTipoExtendido } from '../utils/extendedLabel.utils';
import { UpdateCampoDto } from './dto/Campos.dto';
import { UpdateClientDto } from './dto/UpdateClient.dto';
import { BulkUpdateClientsDto } from './dto/BulkUpdateClients.dto';
import { BulkValorMantencionDto } from './dto/BulkValorMantencion.dto';
import { ClientHistoryService } from './history/client-history.service';
import {
  diffSnapshots,
  normalizarValor,
  snapshotCliente,
} from './history/client-history.utils';
import {
  DIAS_SEMANA,
  aClaveFecha,
  esDiaValido,
  moverAlDiaDeLaSemana,
} from './utils/dias.utils';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,

    @InjectRepository(MaintenanceTemporality)
    private readonly temporalidadRepository: Repository<MaintenanceTemporality>,

    private readonly observacionesService: ObservacionesService,

    private readonly historyService: ClientHistoryService,
  ) {}

  private readonly tipoEntidad = 'client';

  findAll(): Promise<Client[]> {
    return this.clientRepository.find();
  }

  async findOne(id: string): Promise<any> {
    const client = await this.clientRepository.findOneBy({ id });
    if (!client) {
      throw new NotFoundException(`client with id ${id} not found`);
    }

    const resp: any = {
      id: getValorCampoTipoExtendido(client, ['id']),
      nombre: getValorCampoTipoExtendido(client, ['nombre']),
      direccion: getValorCampoTipoExtendido(client, ['direccion']),
      comuna: getValorCampoTipoExtendido(client, ['comuna']),
      telefono: getValorCampoTipoExtendido(client, ['telefono']),
      email: getValorCampoTipoExtendido(client, ['email']),
      fecha_ingreso: getValorCampoTipoExtendido(client, ['fecha_ingreso']),
      tipo_piscina: getValorCampoTipoExtendido(client, ['tipo_piscina']),
      dia_mantencion: getValorCampoTipoExtendido(client, ['dia_mantencion']),
      ruta: getValorCampoTipoExtendido(client, ['ruta']),
      valor_mantencion: getValorCampoTipoExtendido(client, [
        'valor_mantencion',
      ]),
      isActive: getValorCampoTipoExtendido(client, ['isActive']),
      // Se aplana la relacion a dos campos planos en vez de devolver el
      // objeto {id, nombre}: getValorCampoTipoExtendido serializa con
      // `${valor}`, asi que la relacion cruda llegaba al front como
      // "[object Object]" en cuanto alguien la pintaba con String().
      frecuencia_mantencion: getValorCampoTipoExtendido(
        { frecuencia_mantencion: client.frecuencia_mantencion?.nombre },
        ['frecuencia_mantencion'],
      ),
      frecuencia_mantencion_id: getValorCampoTipoExtendido(client, [
        'frecuencia_mantencion_id',
      ]),
    };
    return resp;
  }

  /** Periodicidades disponibles para el selector de clientes. */
  findFrecuencias(): Promise<MaintenanceTemporality[]> {
    return this.temporalidadRepository.find({ order: { nombre: 'ASC' } });
  }

  async createClient(client: CreateClientDto, userId: string): Promise<Client> {
    return this.clientRepository.manager.transaction(async (manager) => {
      const newClient = this.clientRepository.create(client);
      this.alinearFrecuencia(newClient, client.frecuencia_mantencion_id);
      const saved = await manager.save(Client, newClient);
      await this.historyService.registrarCreacion(manager, saved.id, userId);
      // Despues del save: antes el cliente aun no tenia id y la observacion
      // quedaba con registro_id undefined.
      if (client.observacion) {
        await this.observacionesService.createObservacion({
          tipoEntidad: this.tipoEntidad,
          registro_id: saved.id,
          detalle: client.observacion,
          fecha: new Date(),
        });
      }
      return saved;
    });
  }

  /**
   * Deja la relacion `frecuencia_mantencion` de acuerdo con el FK que se
   * acaba de escribir.
   *
   * `findOneBy` carga la relacion (es eager), asi que al guardar conviven en
   * la misma entidad el objeto viejo y la columna nueva, que apuntan a filas
   * distintas. Cual de los dos gana al construir el UPDATE depende de como
   * TypeORM calcule el diff, y ese no es un detalle del que valga la pena
   * depender: se igualan a mano.
   */
  private alinearFrecuencia(client: Client, frecuenciaId?: string) {
    if (!frecuenciaId) return;
    client.frecuencia_mantencion = {
      id: frecuenciaId,
    } as MaintenanceTemporality;
  }

  async update(
    id: string,
    dto: UpdateClientDto,
    userId: string,
  ): Promise<Client> {
    return this.clientRepository.manager.transaction(async (manager) => {
      const existing = await manager.findOneBy(Client, { id });
      if (!existing) throw new NotFoundException('Client not found');
      if (dto.observacion) {
        await this.observacionesService.createObservacion({
          tipoEntidad: this.tipoEntidad,
          registro_id: id,
          detalle: String(dto.observacion),
          fecha: new Date(),
          usuarioId: userId,
        });
      }

      const antes = snapshotCliente(existing);
      const updatedClient = this.clientRepository.merge(existing, dto);
      this.alinearFrecuencia(updatedClient, dto.frecuencia_mantencion_id);
      await manager.save(Client, updatedClient);

      // Se recarga para diffear contra lo que quedo en BD, incluida la
      // frecuencia nueva (relacion eager), no contra lo que se intento escribir.
      const recargado = await manager.findOneBy(Client, { id });
      if (!recargado) throw new NotFoundException('Client not found');
      await this.historyService.registrarCambios(
        manager,
        id,
        diffSnapshots(antes, snapshotCliente(recargado)),
        'ficha',
        userId,
      );
      return recargado;
    });
  }

  async updateCampo(clientId: string, dto: UpdateCampoDto[], userId: string) {
    return this.clientRepository.manager.transaction(async (manager) => {
      const existing = await manager.findOneBy(Client, { id: clientId });
      if (!existing) throw new NotFoundException('Client not found');

      // Un solo antes/despues para todo el arreglo: el historial refleja el
      // resultado neto y no un paso por campo.
      const antes = snapshotCliente(existing);
      let camposActualizados = 0;
      for (const campoDto of dto) {
        this.clientRepository.merge(existing, {
          [campoDto.campo]: campoDto.valor,
        });
        if (campoDto.campo === 'frecuencia_mantencion_id') {
          this.alinearFrecuencia(existing, String(campoDto.valor));
        }
        if (campoDto.campo === 'observacion') {
          await this.observacionesService.createObservacion({
            tipoEntidad: this.tipoEntidad,
            registro_id: clientId,
            detalle: String(campoDto.valor),
            fecha: new Date(),
          });
        }
        camposActualizados++;
      }
      await manager.save(Client, existing);

      const recargado = await manager.findOneBy(Client, { id: clientId });
      if (!recargado) throw new NotFoundException('Client not found');
      await this.historyService.registrarCambios(
        manager,
        clientId,
        diffSnapshots(antes, snapshotCliente(recargado)),
        'ficha',
        userId,
      );
      return { camposActualizados };
    });
  }

  /**
   * Cambio masivo de dia de mantencion, ruta o periodicidad.
   *
   * Existe porque el cambio real del negocio es estacional: en primavera y
   * verano casi todas las piscinas pasan a semanal y en otono e invierno
   * vuelven a quincenal. Hacerlo cliente por cliente son decenas de PUT y
   * ninguna garantia de que queden todos igual; aca es un solo UPDATE dentro
   * de una transaccion: o cambian todos o no cambia ninguno.
   *
   * Cuando el campo es `dia_mantencion` se arrastran ademas las mantenciones
   * futuras que aun no se realizaron (ver `reprogramarMantencionesFuturas`).
   */
  async bulkUpdate(dto: BulkUpdateClientsDto, userId: string) {
    const ids = [...new Set(dto.ids)];
    const valor = dto.valor.trim();

    // Validacion por campo: el DTO solo puede decir que el valor es una
    // cadena, no si es un dia real o un uuid de frecuencia que exista.
    if (dto.campo === 'dia_mantencion') {
      if (!esDiaValido(valor)) {
        throw new BadRequestException(`Dia de mantencion invalido: ${valor}`);
      }
    }

    // El historial guarda el nombre de la periodicidad, no su uuid.
    let nombreFrecuencia: string | null = null;
    if (dto.campo === 'frecuencia_mantencion_id') {
      const frecuencia = await this.temporalidadRepository.findOneBy({
        id: valor,
      });
      if (!frecuencia) {
        throw new NotFoundException(`Periodicidad ${valor} no encontrada`);
      }
      nombreFrecuencia = frecuencia.nombre;
    }

    const clientes = await this.clientRepository.find({
      where: { id: In(ids) },
    });

    if (clientes.length !== ids.length) {
      const encontrados = new Set(clientes.map((cliente) => cliente.id));
      const faltantes = ids.filter((id) => !encontrados.has(id));
      throw new NotFoundException(
        `Clientes no encontrados: ${faltantes.join(', ')}`,
      );
    }

    // La ruta es el unico campo que admite vaciarse ("sin ruta"), y se guarda
    // como null para no dejar cadenas vacias en la columna.
    const valorAGuardar = dto.campo === 'ruta' && valor === '' ? null : valor;

    const claveHistorial =
      dto.campo === 'frecuencia_mantencion_id'
        ? 'frecuencia_mantencion'
        : dto.campo;
    const valorHistorial = normalizarValor(
      dto.campo === 'frecuencia_mantencion_id'
        ? nombreFrecuencia
        : valorAGuardar,
    );

    return this.clientRepository.manager.transaction(async (manager) => {
      await manager.update(
        Client,
        { id: In(ids) },
        { [dto.campo]: valorAGuardar },
      );

      // Un registro por cliente y solo si su valor realmente cambia, dentro
      // de la misma transaccion para que historial y datos no diverjan.
      for (const cliente of clientes) {
        const antes = snapshotCliente(cliente);
        const despues = { ...antes, [claveHistorial]: valorHistorial };
        const cambios = diffSnapshots(antes, despues);
        if (cambios.length === 0) continue;
        await this.historyService.registrarCambios(
          manager,
          cliente.id,
          cambios,
          'masivo',
          userId,
        );
      }

      const mantencionesReprogramadas =
        dto.campo === 'dia_mantencion'
          ? await this.reprogramarMantencionesFuturas(manager, ids, valor)
          : 0;

      return {
        clientesActualizados: ids.length,
        campo: dto.campo,
        valor: valorAGuardar,
        mantencionesReprogramadas,
        actualizadoPor: userId,
      };
    });
  }

  /**
   * Cambio masivo del valor de mantencion, con un valor propio por cliente.
   *
   * Es un endpoint aparte de `bulkUpdate` porque aqui cada cliente recibe un
   * monto distinto (subida global mas overrides calculados en el front). Solo
   * se escribe el cliente cuyo valor realmente cambia; las mantenciones ya
   * registradas nunca se tocan: conservan el valor con que se hicieron.
   */
  async bulkUpdateValorMantencion(
    dto: BulkValorMantencionDto,
    userId: string,
  ): Promise<{ clientesActualizados: number; sinCambios: number }> {
    const ids = dto.items.map((item) => item.id);
    if (new Set(ids).size !== ids.length) {
      throw new BadRequestException('Hay clientes repetidos en la solicitud');
    }

    const clientes = await this.clientRepository.find({
      where: { id: In(ids) },
    });

    if (clientes.length !== ids.length) {
      const encontrados = new Set(clientes.map((cliente) => cliente.id));
      const faltantes = ids.filter((id) => !encontrados.has(id));
      throw new NotFoundException(
        `Clientes no encontrados: ${faltantes.join(', ')}`,
      );
    }

    const actualPorId = new Map(
      clientes.map((cliente) => [cliente.id, cliente.valor_mantencion]),
    );

    return this.clientRepository.manager.transaction(async (manager) => {
      let clientesActualizados = 0;
      let sinCambios = 0;

      for (const item of dto.items) {
        const actual = actualPorId.get(item.id);
        if (actual === item.valor) {
          sinCambios++;
          continue;
        }
        await manager.update(
          Client,
          { id: item.id },
          { valor_mantencion: item.valor },
        );
        // Mismo manager que el UPDATE para que historial y dato no diverjan.
        await this.historyService.registrarCambios(
          manager,
          item.id,
          [
            {
              campo: 'valor_mantencion',
              valorAnterior: normalizarValor(actual),
              valorNuevo: normalizarValor(item.valor),
            },
          ],
          'masivo',
          userId,
        );
        clientesActualizados++;
      }

      return { clientesActualizados, sinCambios };
    });
  }

  /**
   * Corre al nuevo dia de la semana las mantenciones futuras sin realizar.
   *
   * Solo se tocan las que quedan por delante y siguen pendientes: una visita
   * ya hecha es un registro historico y cambiarle la fecha seria falsear lo
   * que paso. Hoy la agenda se registra a medida que se visita, asi que en la
   * practica esto casi siempre devuelve 0; queda igual para que una mantencion
   * adelantada no se quede en el dia viejo despues del cambio de temporada.
   */
  private async reprogramarMantencionesFuturas(
    manager: EntityManager,
    idsClientes: string[],
    diaDestino: string,
  ): Promise<number> {
    const hoy = aClaveFecha(new Date());

    const pendientes = await manager.find(Maintenance, {
      where: {
        client: { id: In(idsClientes) },
        realizada: false,
        fechaMantencion: MoreThan(hoy as unknown as Date),
      },
      select: { id: true, fechaMantencion: true },
    });

    if (pendientes.length === 0) return 0;

    const indiceDestino = DIAS_SEMANA[diaDestino];
    let reprogramadas = 0;

    for (const mantencion of pendientes) {
      const fechaActual = String(mantencion.fechaMantencion).slice(0, 10);
      const nuevaFecha = moverAlDiaDeLaSemana(fechaActual, indiceDestino, hoy);
      if (nuevaFecha === fechaActual) continue;

      await manager.update(
        Maintenance,
        { id: mantencion.id },
        { fechaMantencion: nuevaFecha as unknown as Date },
      );
      reprogramadas++;
    }

    return reprogramadas;
  }

  async remove(id: string): Promise<void> {
    const result = await this.clientRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Client not found');
  }

  async findByFilters(filters: FilterClientsDto) {
    // leftJoinAndSelect explicito: `eager: true` en la relacion solo aplica a
    // los metodos del repositorio (find/findOne), no al QueryBuilder, asi que
    // sin esto el listado sale siempre sin frecuencia.
    const query = this.clientRepository
      .createQueryBuilder('client')
      .leftJoinAndSelect('client.frecuencia_mantencion', 'frecuencia');

    if (filters.nombre) {
      query.andWhere('client.nombre ILIKE :nombre', {
        nombre: `%${filters.nombre}%`,
      });
    }

    if (filters.ruta) {
      query.andWhere('client.ruta ILIKE :ruta', {
        ruta: `%${filters.ruta}%`,
      });
    }

    if (filters.telefono) {
      // Se comparan solo los digitos: los telefonos estan guardados con
      // formatos mezclados ("569 81490150", "56995328476", "056 97967935"),
      // asi que un ILIKE crudo sobre la columna no encuentra el mismo numero
      // escrito de otra forma.
      const digitos = filters.telefono.replace(/[^0-9]/g, '');
      if (digitos) {
        query.andWhere(
          "regexp_replace(client.telefono, '[^0-9]', '', 'g') LIKE :telefono",
          { telefono: `%${digitos}%` },
        );
      }
    }

    if (filters.direccion) {
      query.andWhere('client.direccion ILIKE :direccion', {
        direccion: `%${filters.direccion}%`,
      });
    }

    if (filters.comuna) {
      query.andWhere('client.comuna ILIKE :comuna', {
        comuna: `%${filters.comuna}%`,
      });
    }

    if (filters.dia) {
      query.andWhere('client.dia_mantencion ILIKE :dia', {
        dia: `%${filters.dia}%`,
      });
    }

    if (filters.frecuencia) {
      query.andWhere('client.frecuencia_mantencion_id = :frecuencia', {
        frecuencia: filters.frecuencia,
      });
    }

    if (filters.isActive) {
      query.andWhere('client.isActive = :isActive', {
        isActive: `${filters.isActive}`,
      });
    }

    // Se ordena por el nombre de la periodicidad, no por `client.
    // frecuencia_mantencion`: esa propiedad es la relacion, no una columna, y
    // el QueryBuilder generaria SQL invalido.
    if (filters.orderBy === 'frecuencia_mantencion') {
      query.orderBy('frecuencia.nombre', filters.orderDirection);
    } else if (filters.orderBy) {
      query.orderBy(`client.${filters.orderBy}`, filters.orderDirection);
    }

    const clients = await query.getMany();

    const clientsWithObservations = await Promise.all(
      clients.map(async (client) => {
        const observaciones = await this.observacionesService.findByRegistroId(
          client.id,
        );
        return { ...client, observaciones };
      }),
    );

    // === AGRUPAR POR DÍA ===
    const grouped: Record<string, Client[]> = {};

    clientsWithObservations.forEach((client) => {
      const day = client.dia_mantencion || 'Sin Día';
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push(client);
    });

    // === ORDEN FIJO ===
    const DAYS_ORDER = [
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
      'Domingo',
      'Sin Día',
    ];

    const orderedGrouped: Record<string, Client[]> = {};

    DAYS_ORDER.forEach((day) => {
      if (grouped[day]) {
        orderedGrouped[day] = grouped[day];
      }
    });

    return orderedGrouped;
  }
}
