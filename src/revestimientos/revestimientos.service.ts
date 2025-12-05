import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Revestimiento } from './entities/revestimiento.entity';
import { Repository } from 'typeorm';
import { ExtraRevestimiento } from './entities/extra-revestimiento.entity';
import { FilterRevestimientosDto } from './dto/FilterRevestimientos.dto';
import { IRevestimientoCreate } from './dto/CreateRevestimiento.dto';

@Injectable()
export class RevestimientosService {
  constructor(
    @InjectRepository(Revestimiento)
    private revestimientoRepository: Repository<Revestimiento>,

    @InjectRepository(ExtraRevestimiento)
    private extraRevestimientoRepository: Repository<ExtraRevestimiento>,
  ) {}

  async findByFilter(
    filters: FilterRevestimientosDto,
  ): Promise<Revestimiento[]> {
    const query = this.revestimientoRepository
      .createQueryBuilder('revestimiento')
      .leftJoinAndSelect('revestimiento.client', 'client')
      .leftJoinAndSelect('revestimiento.extras', 'extras')
      .leftJoinAndSelect('revestimiento.imagenes', 'imagenes');

    if (filters.client_name) {
      query.andWhere('LOWER(client.nombre) LIKE LOWER(:client_name)', {
        client_name: `%${filters.client_name}%`,
      });
    }

    if (filters.fechaPropuesta) {
      query.andWhere('revestimiento.fechaPropuesta = :fechaPropuesta', {
        fechaPropuesta: filters.fechaPropuesta,
      });
    }

    if (filters.fechaTrabajo) {
      query.andWhere('revestimiento.fechaTrabajo = :fechaTrabajo', {
        fechaTrabajo: filters.fechaTrabajo,
      });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<Revestimiento> {
    const revestimiento = await this.revestimientoRepository.findOne({
      where: { id },
      relations: ['extras', 'client', 'imagenes'],
    });
    if (!revestimiento) throw new Error('Revestimiento not found');
    return revestimiento;
  }

  async createRevestimiento(
    data: Partial<IRevestimientoCreate>,
  ): Promise<Revestimiento> {
    const newRevestimiento = this.revestimientoRepository.create({
      ...data,
      client: { id: data.clienteId },
    });
    return this.revestimientoRepository.save(newRevestimiento);
  }

  async updateRevestimiento(
    id: string,
    data: Partial<IRevestimientoCreate>,
  ): Promise<Revestimiento> {
    const existing = await this.revestimientoRepository.findOneBy({ id });
    if (!existing) throw new Error('Revestimiento not found');
    const updatedRevestimiento = this.revestimientoRepository.merge(
      existing,
      data,
    );
    return this.revestimientoRepository.save(updatedRevestimiento);
  }

  async deleteRevestimiento(id: string): Promise<void> {
    const result = await this.revestimientoRepository.delete(id);
    if (result.affected === 0) throw new Error('Revestimiento not found');
  }
}
