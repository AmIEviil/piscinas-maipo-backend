import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type AuditAction = 'READ' | 'CREATE' | 'UPDATE' | 'DELETE';

// Registro de accesos a datos personales.
//
// La Ley 21.719 exige poder *acreditar* el cumplimiento (principio de
// responsabilidad, art. 3 lit. g). Sin traza de quien consulto, modifico,
// exporto o elimino datos de clientes y trabajadores no hay forma de responder
// a una fiscalizacion ni de dimensionar el alcance de una brecha para
// notificarla (art. 14 septies).
//
// Se guarda quien, que, cuando y desde donde. NO se guarda el contenido de los
// datos accedidos: el registro de auditoria no debe convertirse en una segunda
// copia de los datos personales.
@Entity('access_audit')
export class AccessAudit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  user_id: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  user_name: string | null;

  @Column({ type: 'varchar', length: 50 })
  action: AuditAction;

  /** Tipo de dato personal afectado: Client, Employee, User, Pago, Archivo. */
  @Index()
  @Column({ type: 'varchar', length: 50 })
  entity: string;

  /** Identificador del registro cuando la ruta apunta a uno concreto. */
  @Column({ type: 'varchar', length: 100, nullable: true })
  record_id: string | null;

  @Column({ type: 'varchar', length: 10 })
  method: string;

  @Column({ type: 'varchar', length: 255 })
  path: string;

  @Column({ type: 'int' })
  status_code: number;

  @Column({ type: 'varchar', length: 64, nullable: true })
  ip: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  user_agent: string | null;

  @Index()
  @CreateDateColumn()
  created_at: Date;
}
