import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FilterVehiclesDto } from './dto/filterVehicles.dto';
import { UploadedFiles } from '../uploaded-files/entities/uploaded-files.entity';

@Injectable()
export class VehiclesService {
  private readonly logger = new Logger(VehiclesService.name);
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,

    @InjectRepository(UploadedFiles)
    private readonly uploadedFilesRepository: Repository<UploadedFiles>,
  ) {}

  async findAll(filters?: FilterVehiclesDto): Promise<Vehicle[]> {
    this.logger.log('Buscando todos los vehículos', JSON.stringify(filters));
    const query = this.vehicleRepository.createQueryBuilder('vehicle');

    if (!filters) {
      return query.getMany();
    }
    if (filters.placa) {
      query.andWhere('vehicle.placa ILIKE :placa', {
        placa: `%${filters.placa}%`,
      });
    }
    if (filters.marca) {
      query.andWhere('vehicle.marca ILIKE :marca', {
        marca: `%${filters.marca}%`,
      });
    }
    if (filters.modelo) {
      query.andWhere('vehicle.modelo ILIKE :modelo', {
        modelo: `%${filters.modelo}%`,
      });
    }
    if (filters.anioDesde) {
      query.andWhere('vehicle.anio >= :anioDesde', {
        anioDesde: filters.anioDesde,
      });
    }
    if (filters.anioHasta) {
      query.andWhere('vehicle.anio <= :anioHasta', {
        anioHasta: filters.anioHasta,
      });
    }
    if (filters.color) {
      query.andWhere('vehicle.color ILIKE :color', {
        color: `%${filters.color}%`,
      });
    }
    if (filters.isActive !== undefined) {
      query.andWhere('vehicle.isActive = :isActive', {
        isActive: filters.isActive,
      });
    }
    if (filters.orderBy) {
      query.orderBy(
        `vehicle.${filters.orderBy}`,
        filters.orderDirection === 'DESC' ? 'DESC' : 'ASC',
      );
    }

    const vehicles = await query.getMany();

    return vehicles;
  }

  async findOne(placa: string): Promise<{
    vehicle: Vehicle | null;
    files: UploadedFiles[];
  }> {
    this.logger.log(`Buscando vehículo con placa: ${placa}`);
    const vehicle = await this.vehicleRepository.findOneBy({ placa });

    const files = await this.uploadedFilesRepository.findBy({
      parentId: vehicle?.id,
    });
    this.logger.log(
      `Archivos asociados al vehículo ${placa}: ${JSON.stringify(files)}`,
    );

    return { vehicle, files };
  }

  async create(vehicleData: Partial<Vehicle>): Promise<Vehicle> {
    this.logger.log('Creando nuevo vehículo: ' + JSON.stringify(vehicleData));
    const newVehicle = this.vehicleRepository.create(vehicleData);
    return this.vehicleRepository.save(newVehicle);
  }

  async update(placa: string, updateData: Partial<Vehicle>): Promise<Vehicle> {
    this.logger.log(
      `Actualizando vehículo con placa: ${placa}, Datos: ` +
        JSON.stringify(updateData),
    );
    await this.vehicleRepository.update({ placa }, updateData);
    const updatedVehicle = await this.vehicleRepository.findOneBy({ placa });
    return updatedVehicle!;
  }

  async remove(placa: string): Promise<void> {
    this.logger.log(`Eliminando vehículo con placa: ${placa}`);
    await this.vehicleRepository.delete({ placa });
  }
}
