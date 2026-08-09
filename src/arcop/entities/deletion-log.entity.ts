import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

/**
 * Constancia del ejercicio del derecho de supresion (art. 6 Ley 21.719).
 *
 * El problema que resuelve: si se borran los datos de un titular sin dejar
 * rastro, no hay forma de acreditar despues que la supresion se hizo, cuando,
 * a peticion de quien y con que alcance. Eso es exactamente lo que pediria la
 * Agencia ante un reclamo.
 *
 * El registro guarda *metadatos de la operacion*, nunca los datos suprimidos:
 * conservar una copia bajo el nombre de "auditoria" vaciaria de contenido la
 * supresion. Del titular solo queda un identificador y, si se necesita para
 * responder al reclamante, una referencia externa a la solicitud.
 */
@Entity('data_deletion_log')
export class DeletionLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Tipo de titular: Client o Employee. */
  @Index()
  @Column({ type: 'varchar', length: 50 })
  entity: string;

  /** Identificador del registro suprimido. */
  @Column({ type: 'varchar', length: 100 })
  record_id: string;

  /** Base de la supresion: solicitud del titular, fin del plazo, u otra. */
  @Column({ type: 'varchar', length: 50 })
  motivo: string;

  /** Referencia de la solicitud (numero de ticket, correo, expediente). */
  @Column({ type: 'varchar', length: 255, nullable: true })
  referencia_solicitud: string | null;

  /** Usuario de la aplicacion que ejecuto la supresion. */
  @Column({ type: 'uuid', nullable: true })
  ejecutado_por: string | null;

  /**
   * Recuento de registros asociados eliminados en cascada, por tabla.
   * Permite acreditar el alcance sin conservar el contenido.
   */
  @Column({ type: 'jsonb', nullable: true })
  alcance: Record<string, number> | null;

  @Index()
  @CreateDateColumn()
  created_at: Date;
}

export const MOTIVOS_SUPRESION = [
  'solicitud_titular',
  'fin_plazo_conservacion',
  'dato_inexacto',
  'otro',
] as const;

export type MotivoSupresion = (typeof MOTIVOS_SUPRESION)[number];
