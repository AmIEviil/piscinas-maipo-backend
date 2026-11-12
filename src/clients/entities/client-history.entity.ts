import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Client } from './clients.entity';
import { User } from '../../users/entities/user.entity';
import { AccionHistorial, OrigenCambio } from '../history/client-history.utils';

/**
 * Una fila por campo modificado (o una sola fila 'creado' al dar de alta).
 *
 * `clientId` y `usuarioId` se declaran ademas de su relacion por el mismo
 * motivo que `Client.frecuencia_mantencion_id`: sin @Column explicito,
 * `create()` descarta en silencio el id suelto.
 */
@Entity('client_history')
@Index(['clientId', 'fecha'])
export class ClientHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'client_id', type: 'uuid' })
  clientId: string;

  @ManyToOne(() => Client, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column({ type: 'varchar', length: 20 })
  accion: AccionHistorial;

  @Column({ type: 'varchar', length: 50, nullable: true })
  campo: string | null;

  @Column({ name: 'valor_anterior', type: 'text', nullable: true })
  valorAnterior: string | null;

  @Column({ name: 'valor_nuevo', type: 'text', nullable: true })
  valorNuevo: string | null;

  @Column({ type: 'varchar', length: 20 })
  origen: OrigenCambio;

  @Column({ name: 'usuario_id', type: 'uuid', nullable: true })
  usuarioId: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: User | null;

  @CreateDateColumn({ type: 'timestamptz' })
  fecha: Date;
}
