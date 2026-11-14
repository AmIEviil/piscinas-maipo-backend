import { Injectable, NotFoundException } from '@nestjs/common';
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
    private readonly revestimientoRepository: Repository<Revestimiento>,

    @InjectRepository(ExtraRevestimiento)
    private readonly extraRevestimientoRepository: Repository<ExtraRevestimiento>,
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

  /**
   * Edicion de un revestimiento.
   *
   * - `clienteId` se traduce a la relacion `client`, igual que al crear (un
   *   merge directo lo ignoraba y el cliente no se podia cambiar).
   * - `extras`, si viene, REEMPLAZA la lista completa: se borran los
   *   anteriores y se insertan los recibidos, en una transaccion. Con el
   *   merge anterior un extra quitado en el formulario seguia en la base.
   * - `imagenes` se ignora: las imagenes se agregan y quitan con sus propios
   *   endpoints (`upload/revestimiento/:id/imagenes/bulk` y `upload/:id`).
   */
  async updateRevestimiento(
    id: string,
    data: Partial<IRevestimientoCreate>,
  ): Promise<Revestimiento> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { clienteId, extras, imagenes, ...campos } = data;

    return this.revestimientoRepository.manager.transaction(async (manager) => {
      const repo = manager.getRepository(Revestimiento);
      const extraRepo = manager.getRepository(ExtraRevestimiento);

      const existing = await repo.findOneBy({ id });
      if (!existing) {
        throw new NotFoundException(`Revestimiento con id ${id} no existe`);
      }

      repo.merge(existing, campos);
      if (clienteId) {
        existing.client = { id: clienteId } as Revestimiento['client'];
      }

      if (extras) {
        await extraRepo.delete({ revestimiento: { id } });
        existing.extras = extras.map((extra) =>
          extraRepo.create({
            nombre: extra.nombre,
            valor: extra.valor,
            detalle: extra.detalle,
          }),
        );
      }

      return repo.save(existing);
    });
  }

  async deleteRevestimiento(id: string): Promise<void> {
    const result = await this.revestimientoRepository.delete(id);
    if (result.affected === 0) throw new Error('Revestimiento not found');
  }
}
