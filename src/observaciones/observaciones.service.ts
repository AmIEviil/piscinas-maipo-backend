import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Observaciones } from './entity/observaciones.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ObservacionesService {
  constructor(
    @InjectRepository(Observaciones)
    private observacionesRepository: Repository<Observaciones>,
  ) {}

  findAll(): Promise<Observaciones[]> {
    return this.observacionesRepository.find();
  }

  findByEntity(tipoEntidad: string): Promise<Observaciones[]> {
    return this.observacionesRepository.find({ where: { tipoEntidad } });
  }

  findByRegistroId(registro_id: string): Promise<Observaciones[]> {
    return this.observacionesRepository.find({ where: { registro_id } });
  }

  async createObservacion(
    observacionData: Partial<Observaciones>,
  ): Promise<Observaciones> {
    const nuevaObservacion =
      this.observacionesRepository.create(observacionData);
    return this.observacionesRepository.save(nuevaObservacion);
  }

  async updateObservacion(
    id: string,
    observacionData: Partial<Observaciones>,
  ): Promise<any> {
    const observacionToUpdate = await this.observacionesRepository.findOneBy({
      id,
    });
    if (!observacionToUpdate) {
      throw new Error(`Observacion with id ${id} not found`);
    }
    const resultado = await this.observacionesRepository.update(
      id,
      observacionData,
    );
    return resultado;
  }

  async deleteObservacion(id: string): Promise<void> {
    await this.observacionesRepository.delete(id);
  }
}
