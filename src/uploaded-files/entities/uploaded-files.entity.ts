import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UploadedFiles {
  @PrimaryGeneratedColumn('increment')
  fileId: number;

  @Column({ type: 'varchar', length: 255 })
  filename: string;

  @Column({ type: 'varchar' })
  type_file: string;

  @Column({ type: 'bigint' })
  size: number;

  @Column({ type: 'varchar', length: 100 })
  mimeType: string;

  @Column()
  driveId: string;

  @Column({ type: 'varchar', length: 500 })
  driveUrl: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  uploadDate: Date;

  @Column({ type: 'uuid', nullable: false })
  parentId: string;
}
