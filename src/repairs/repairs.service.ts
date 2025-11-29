import { Injectable } from '@nestjs/common';
import { Repair } from './entities/repair.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { FilterRepairDto } from './dto/FilterRepair.dto';

@Injectable()
export class RepairsService {
  constructor(
    @InjectRepository(Repair)
    private repairsRepository: Repository<Repair>,
  ) {}

  async findAllRepairs(filters: FilterRepairDto): Promise<Repair[]> {
    const query = this.repairsRepository.createQueryBuilder('repair');

    if (filters.nombreCliente) {
      query.andWhere('repair.nombreCliente = :nombreCliente', {
        nombreCliente: filters.nombreCliente,
      });
    }
    if (filters.direccionCliente) {
      query.andWhere('repair.direccionCliente = :direccionCliente', {
        direccionCliente: filters.direccionCliente,
      });
    }
    if (filters.comunaCliente) {
      query.andWhere('repair.comunaCliente = :comunaCliente', {
        comunaCliente: filters.comunaCliente,
      });
    }
    if (filters.fechaTrabajo) {
      query.andWhere('repair.fechaTrabajo = :fechaTrabajo', {
        fechaTrabajo: filters.fechaTrabajo,
      });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<Repair> {
    const repair = await this.repairsRepository.findOne({ where: { id } });
    if (!repair) throw new Error('Repair not found');
    return repair;
  }

  async createRepair(data: Partial<Repair>): Promise<Repair> {
    const newRepair = this.repairsRepository.create(data);
    return this.repairsRepository.save(newRepair);
  }
  async updateRepair(id: string, data: Partial<Repair>): Promise<Repair> {
    const repair = await this.findOne(id);
    if (!repair) throw new Error('Repair not found');
    const updatedRepair = this.repairsRepository.merge(repair, data);
    return this.repairsRepository.save(updatedRepair);
  }

  async deleteRepair(id: string): Promise<void> {
    const repair = await this.findOne(id);
    if (!repair) throw new Error('Repair not found');
    await this.repairsRepository.delete(id);
  }
}
