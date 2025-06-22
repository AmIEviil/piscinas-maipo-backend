import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/clients.entity';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
  ) {}

  findAll(): Promise<Client[]> {
    console.log('🧪 Entró al método findAll');
    return this.clientRepository.find();
  }

  async findOne(id: number): Promise<Client> {
    console.log('🧪 Entró al método findOne');
    const client = await this.clientRepository.findOneBy({ id });
    if (!client) {
      throw new NotFoundException(`client with id ${id} not found`);
    }
    return client;
  }

  async createClient(client: Partial<Client>): Promise<Client> {
    console.log('🆕 Entró al método creatClient');
    const newClient = this.clientRepository.create(client);
    return this.clientRepository.save(newClient);
  }

  async update(id: number, Client: Partial<Client>): Promise<Client> {
    console.log('🆙 Entró al método update');
    const existing = await this.clientRepository.findOneBy({ id });
    if (!existing) throw new NotFoundException('Client not found');

    const updatedClient = this.clientRepository.merge(existing, Client);
    return this.clientRepository.save(updatedClient);
  }

  async remove(id: number): Promise<void> {
    console.log('🚮 Entró al método remove');
    const result = await this.clientRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Client not found');
  }

  async findByFilters(filters: {
    nombre?: string;
    direccion?: string;
    comuna?: string;
    dia?: string;
  }) {
    console.log('🎯 findByFilters:', filters);

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
      query.andWhere('client.dia_mantencion = :dia', { dia: filters.dia });
    }

    return query.getMany();
  }
}
