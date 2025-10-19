import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Maintenance } from './entities/maintenance.entity';
import { CreateMaintenanceDto } from './dto/CreateMaintenanceDto';
import { MaintenanceProduct } from './entities/maintenance-product.entity';

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

  async createMaintenance(dto: CreateMaintenanceDto) {
    console.log('Creating maintenance with DTO:', dto);
    return this.maintenanceRepository.manager.transaction(async (manager) => {
      // Crear mantención
      const newMaintenance = this.maintenanceRepository.create({
        fechaMantencion: dto.fechaMantencion,
        realizada: dto.realizada,
        recibioPago: dto.recibioPago,
        valor_mantencion: dto.valorMantencion,
        client: { id: dto.client.id },
      });

      await manager.save(newMaintenance);

      // Crear productos asociados
      if (dto.productosUsados && dto.productosUsados.length > 0) {
        const productsToInsert = dto.productosUsados.map((p) =>
          manager.create(MaintenanceProduct, {
            maintenance: newMaintenance,
            product: { id: p.productId },
            cantidad: p.cantidad,
          }),
        );

        await manager.save(productsToInsert);
      }

      // Retornar mantención con productos
      return manager.findOne(Maintenance, {
        where: { id: newMaintenance.id },
        relations: ['productos', 'productos.product', 'client'],
      });
    });
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
