import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/clients.entity';
import { FilterClientsDto } from './dto/FilterClients.dto';
import { CreateClientDto } from './dto/CreateClient.dto';
import { ObservacionesService } from '../observaciones/observaciones.service';
import { getValorCampoTipoExtendido } from '../utils/extendedLabel.utils';
import { UpdateCampoDto } from './dto/Campos.dto';
import { UpdateClientDto } from './dto/UpdateClient.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,

    private readonly observacionesService: ObservacionesService,
  ) {}

  private readonly tipoEntidad = 'client';
  private readonly DAYS_ORDER = [
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
    'Domingo',
    'Sin Día',
  ];

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
      frecuencia_mantencion: getValorCampoTipoExtendido(client, [
        'frecuencia_mantencion',
      ]),
    };
    return resp;
  }

  async createClient(client: CreateClientDto): Promise<Client> {
    const newClient = this.clientRepository.create(client);
    if (client.observacion) {
      await this.observacionesService.createObservacion({
        tipoEntidad: this.tipoEntidad,
        registro_id: newClient.id,
        detalle: client.observacion,
        fecha: new Date(),
      });
    }
    return this.clientRepository.save(newClient);
  }

  async update(
    id: string,
    Client: UpdateClientDto,
    userId: string,
  ): Promise<Client> {
    const existing = await this.clientRepository.findOneBy({ id });
    if (!existing) throw new NotFoundException('Client not found');
    if (Client.observacion) {
      await this.observacionesService.createObservacion({
        tipoEntidad: this.tipoEntidad,
        registro_id: id,
        detalle: String(Client.observacion),
        fecha: new Date(),
        usuarioId: userId,
      });
    }

    const updatedClient = this.clientRepository.merge(existing, Client);
    return this.clientRepository.save(updatedClient);
  }

  async updateCampo(user_id: string, dto: UpdateCampoDto[]) {
    let camposActualizados = 0;
    for (const campoDto of dto) {
      const existing = await this.clientRepository.findOneBy({
        id: user_id,
      });
      if (!existing) throw new NotFoundException('Client not found');
      const updatedClient = this.clientRepository.merge(existing, {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        [campoDto.campo]: campoDto.valor,
      });
      if (campoDto.campo === 'observacion') {
        await this.observacionesService.createObservacion({
          tipoEntidad: this.tipoEntidad,
          registro_id: user_id,
          detalle: String(campoDto.valor),
          fecha: new Date(),
        });
      }
      await this.clientRepository.save(updatedClient);
      camposActualizados++;
    }
    return { camposActualizados };
  }

  async remove(id: string): Promise<void> {
    const result = await this.clientRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Client not found');
  }

  async findByFilters(filters: FilterClientsDto) {
    const query = this.clientRepository.createQueryBuilder('client');

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

    if (filters.isActive) {
      query.andWhere('client.isActive = :isActive', {
        isActive: `${filters.isActive}`,
      });
    }

    if (filters.orderBy) {
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
