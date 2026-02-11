import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Maintenance } from './entities/maintenance.entity';
import {
  CreateMaintenanceDto,
  UpdateMaintenanceDto,
} from './dto/CreateMaintenanceDto';
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

  async findOne(id: string): Promise<Maintenance> {
    const maintenance = await this.maintenanceRepository.findOneBy({ id });
    if (!maintenance) {
      throw new NotFoundException(`Maintenance with id ${id} not found`);
    }
    return maintenance;
  }

  async createMaintenance(dto: CreateMaintenanceDto) {
    return this.maintenanceRepository.manager.transaction(async (manager) => {
      // Crear mantención
      const newMaintenance = this.maintenanceRepository.create({
        fechaMantencion: dto.fechaMantencion,
        realizada: dto.realizada,
        recibioPago: dto.recibioPago,
        valor_mantencion: dto.valorMantencion,
        client: { id: dto.client.id },
        observaciones: dto.observaciones,
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
        const updateDisponibles = dto.productosUsados.map(async (p) => {
          await manager.decrement(
            'Product',
            { id: p.productId },
            'cant_disponible',
            p.cantidad,
          );
        });
        await Promise.all(updateDisponibles);
        await manager.save(productsToInsert);
      }

      // Retornar mantención con productos
      return manager.findOne(Maintenance, {
        where: { id: newMaintenance.id },
        relations: ['productos', 'productos.product', 'client'],
      });
    });
  }

  async update(id: string, dto: UpdateMaintenanceDto) {
    return this.maintenanceRepository.manager.transaction(async (manager) => {
      const maintenance = await manager.findOne(Maintenance, {
        where: { id },
        relations: ['productos', 'productos.product'],
      });

      if (!maintenance) {
        throw new NotFoundException('Maintenance not found');
      }

      await manager.update(
        Maintenance,
        { id },
        {
          fechaMantencion: dto.fechaMantencion ?? maintenance.fechaMantencion,
          realizada: dto.realizada ?? maintenance.realizada,
          recibioPago: dto.recibioPago ?? maintenance.recibioPago,
          valor_mantencion: dto.valorMantencion ?? maintenance.valor_mantencion,
          observaciones: dto.observaciones ?? maintenance.observaciones,
        },
      );

      // 2. Lógica de Productos (Manejo de Stock e Items)
      if (dto.productosUsados) {
        const actuales = maintenance.productos;
        const nuevos = dto.productosUsados;

        const mapActuales = new Map(actuales.map((p) => [p.product.id, p]));
        const mapNuevos = new Map(nuevos.map((p) => [p.productId, p]));

        // A. Eliminar productos que ya no vienen
        for (const actual of actuales) {
          if (!mapNuevos.has(actual.product.id)) {
            // Devolvemos el stock
            await manager.increment(
              'Product',
              { id: actual.product.id },
              'cant_disponible',
              actual.cantidad,
            );
            // Eliminamos la relación
            await manager.remove(actual);
          }
        }

        // B. Agregar o Actualizar productos
        for (const nuevo of nuevos) {
          const existente = mapActuales.get(nuevo.productId);

          if (!existente) {
            await manager.decrement(
              'Product',
              { id: nuevo.productId },
              'cant_disponible',
              nuevo.cantidad,
            );

            const mp = manager.create(MaintenanceProduct, {
              maintenance: { id },
              product: { id: nuevo.productId },
              cantidad: nuevo.cantidad,
            });

            await manager.save(mp);
          } else {
            // --- Producto Existente (Update cantidad) ---
            const diff = nuevo.cantidad - existente.cantidad;

            if (diff !== 0) {
              if (diff > 0) {
                await manager.decrement(
                  'Product',
                  { id: nuevo.productId },
                  'cant_disponible',
                  diff,
                );
              } else {
                await manager.increment(
                  'Product',
                  { id: nuevo.productId },
                  'cant_disponible',
                  Math.abs(diff),
                );
              }

              existente.cantidad = nuevo.cantidad;
              await manager.save(existente);
            }
          }
        }
      }

      // 3. Retornamos la entidad actualizada fresca desde la BD
      return manager.findOne(Maintenance, {
        where: { id },
        relations: ['productos', 'productos.product', 'client'],
      });
    });
  }

  async remove(id: string): Promise<void> {
    const result = await this.maintenanceRepository.delete(id);
    if (result.affected === 0)
      throw new NotFoundException('maintenance not found');
  }

  async findByClientId(id: string) {
    const allMaintenances = await this.maintenanceRepository.find({
      where: { client: { id } },
      relations: ['productos', 'productos.product'],
    });
    if (allMaintenances.length === 0) {
      return [];
    }
    return allMaintenances;
  }

  async findGroupedByMonth(id: string) {
    const maintenances = await this.findByClientId(id);

    const grouped = maintenances.reduce(
      (acc, item) => {
        const date = new Date(item.fechaMantencion);

        // clave tipo "2025-10"
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        if (!acc[key]) acc[key] = [];
        acc[key].push(item);

        return acc;
      },
      {} as Record<string, Maintenance[]>,
    );

    return grouped;
  }
}
