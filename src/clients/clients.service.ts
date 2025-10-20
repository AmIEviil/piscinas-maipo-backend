import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/clients.entity';
import { FilterClientsDto } from './dto/FilterClients.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
  ) {}

  findAll(): Promise<Client[]> {
    return this.clientRepository.find();
  }

  async findOne(id: number): Promise<Client> {
    const client = await this.clientRepository.findOneBy({ id });
    if (!client) {
      throw new NotFoundException(`client with id ${id} not found`);
    }
    return client;
  }

  async createClient(client: Partial<Client>): Promise<Client> {
    const newClient = this.clientRepository.create(client);
    return this.clientRepository.save(newClient);
  }

  async update(id: number, Client: Partial<Client>): Promise<Client> {
    const existing = await this.clientRepository.findOneBy({ id });
    if (!existing) throw new NotFoundException('Client not found');

    const updatedClient = this.clientRepository.merge(existing, Client);
    return this.clientRepository.save(updatedClient);
  }

  async remove(id: number): Promise<void> {
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

    return query.getMany();
  }
}
