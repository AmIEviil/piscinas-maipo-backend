import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Observaciones {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tipo_entidad', type: 'varchar', length: 100 })
  tipoEntidad: string;

  @Column({ name: 'registro_id', type: 'uuid' })
  registro_id: string;

  @Column({ name: 'detalle', type: 'text' })
  detalle: string;

  @Column({ name: 'fecha', type: 'date' })
  fecha: Date;

  @Column({ name: 'usuario_id', type: 'uuid' })
  usuarioId: string;
}
