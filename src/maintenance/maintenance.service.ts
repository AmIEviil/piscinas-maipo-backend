import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Maintenance } from './entities/maintenance.entity';

@Injectable()
export class MaintenanceService {
  constructor(
    @InjectRepository(Maintenance)
    private maintenanceRepository: Repository<Maintenance>,
  ) {}

  findAll(): Promise<Maintenance[]> {
    return this.maintenanceRepository.find();
  }

  async findOne(id: number): Promise<Maintenance> {
    const maintenance = await this.maintenanceRepository.findOneBy({ id });
    if (!maintenance) {
      throw new NotFoundException(`Maintenance with id ${id} not found`);
    }
    return maintenance;
  }

  async createMaintenance(
    maintenance: Partial<Maintenance>,
  ): Promise<Maintenance> {
    const newMaintenance = this.maintenanceRepository.create(maintenance);
    return this.maintenanceRepository.save(newMaintenance);
  }

  async update(
    id: number,
    maintenance: Partial<Maintenance>,
  ): Promise<Maintenance> {
    const existing = await this.maintenanceRepository.findOneBy({ id });
    if (!existing) throw new NotFoundException('maintenance not found');

    const updatedMaintenance = this.maintenanceRepository.merge(
      existing,
      maintenance,
    );
    return this.maintenanceRepository.save(updatedMaintenance);
  }

  async remove(id: number): Promise<void> {
    const result = await this.maintenanceRepository.delete(id);
    if (result.affected === 0)
      throw new NotFoundException('maintenance not found');
  }

  async findByClientId(id: number) {
    return await this.maintenanceRepository.find({
      where: { client: { id } },
      relations: ['productos', 'productos.product'],
    });
  }
}
