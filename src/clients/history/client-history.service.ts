import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { ClientHistory } from '../entities/client-history.entity';
import { Client } from '../entities/clients.entity';
import {
  AccionHistorial,
  CambioCampo,
  OrigenCambio,
  usuarioIdValido,
} from './client-history.utils';

export interface ClientHistoryEntry {
  id: string;
  accion: AccionHistorial;
  campo: string | null;
  valorAnterior: string | null;
  valorNuevo: string | null;
  origen: OrigenCambio;
  usuario: string | null;
  fecha: string;
}

@Injectable()
export class ClientHistoryService {
  constructor(
    @InjectRepository(ClientHistory)
    private readonly historyRepository: Repository<ClientHistory>,

    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  /**
   * Los registrar* reciben el `manager` de quien los llama para escribir en
   * la misma transaccion que el cambio: si el cambio se revierte, su historial
   * tambien.
   */
  async registrarCreacion(
    manager: EntityManager,
    clientId: string,
    usuarioId?: string | null,
  ): Promise<void> {
    const fila = manager.create(ClientHistory, {
      clientId,
      accion: 'creado',
      campo: null,
      valorAnterior: null,
      valorNuevo: null,
      origen: 'creacion',
      usuarioId: usuarioIdValido(usuarioId),
    });
    await manager.save(ClientHistory, fila);
  }

  async registrarCambios(
    manager: EntityManager,
    clientId: string,
    cambios: CambioCampo[],
    origen: OrigenCambio,
    usuarioId?: string | null,
  ): Promise<number> {
    if (cambios.length === 0) return 0;

    const usuario = usuarioIdValido(usuarioId);
    const filas = cambios.map((cambio) =>
      manager.create(ClientHistory, {
        clientId,
        accion: 'modificado',
        campo: cambio.campo,
        valorAnterior: cambio.valorAnterior,
        valorNuevo: cambio.valorNuevo,
        origen,
        usuarioId: usuario,
      }),
    );
    await manager.save(ClientHistory, filas);
    return filas.length;
  }

  async findByClient(clientId: string): Promise<ClientHistoryEntry[]> {
    // Sin esta comprobacion un id inexistente devolveria [] y se confundiria
    // con un cliente que simplemente no tiene cambios.
    const existe = await this.clientRepository.existsBy({ id: clientId });
    if (!existe) {
      throw new NotFoundException(`client with id ${clientId} not found`);
    }

    const filas = await this.historyRepository.find({
      where: { clientId },
      relations: { usuario: true },
      order: { fecha: 'DESC' },
    });

    return filas.map((fila) => ({
      id: fila.id,
      accion: fila.accion,
      campo: fila.campo,
      valorAnterior: fila.valorAnterior,
      valorNuevo: fila.valorNuevo,
      origen: fila.origen,
      usuario: fila.usuario
        ? `${fila.usuario.first_name} ${fila.usuario.last_name}`.trim()
        : null,
      fecha: fila.fecha.toISOString(),
    }));
  }
}
