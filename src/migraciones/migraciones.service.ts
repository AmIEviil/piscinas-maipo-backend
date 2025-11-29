/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { MigrationAudit } from './entities/migration-audit.entity';

@Injectable()
export class MigracionesService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(MigrationAudit)
    private migrationAuditRepo: Repository<MigrationAudit>,
  ) {}

  async getMigrationsStatus(order: 'asc' | 'desc' = 'asc') {
    const executedMigrations = await this.dataSource.query(
      `SELECT * FROM "migrations" ORDER BY "timestamp" ${order.toUpperCase()}`,
    );

    const allMigrations = this.dataSource.migrations;
    const allLocalMigrationNames = allMigrations.map(
      (migration) => migration.constructor.name,
    );

    const executedNames = executedMigrations.map((m) => m.name);
    const pending = allLocalMigrationNames.filter(
      (name) => !executedNames.includes(name),
    );

    // Función auxiliar para ordenar por fecha
    const sortByDate = (items: any[], order: 'asc' | 'desc') => {
      return items.sort((a, b) => {
        const timeA = a.timestamp ? parseInt(a.timestamp) : 0;
        const timeB = b.timestamp ? parseInt(b.timestamp) : 0;

        return order === 'asc' ? timeA - timeB : timeB - timeA;
      });
    };

    // Procesar migraciones ejecutadas
    const executed = executedMigrations.map((migration) => {
      return {
        name: migration.name,
        timestamp: migration.timestamp,
      };
    });

    // Procesar migraciones pendientes
    const pendingWithDates = pending.map((name) => {
      const timestamp = this.extractTimestampFromName(name);
      return {
        name,
        timestamp: timestamp,
      };
    });

    return {
      executed: sortByDate(executed, order),
      pending: sortByDate(pendingWithDates, order),
      order,
      summary: {
        totalExecuted: executed.length,
        totalPending: pending.length,
        totalMigrations: allLocalMigrationNames.length,
      },
    };
  }

  private extractTimestampFromName(migrationName: string): string | null {
    const match = migrationName.match(/\d+/);
    return match ? match[0] : null;
  }

  async executeMigration(migrationName: string, userId: string) {
    const auditEntry = this.migrationAuditRepo.create({
      migration_name: migrationName,
      action: 'EXECUTE',
      user_id: userId,
      details: { migrationName, userId },
      success: true,
    });

    try {
      const allMigrations = this.dataSource.migrations;
      const migrationToRun = allMigrations.find(
        (migration) => migration.constructor.name === migrationName,
      );

      if (!migrationToRun) {
        throw new NotFoundException(`Migración ${migrationName} no encontrada`);
      }

      // Ejecutar migración
      await migrationToRun.up(this.dataSource.createQueryRunner());

      // Registrar en tabla original de TypeORM
      await this.dataSource.query(
        `INSERT INTO "migrations" ("timestamp", "name") VALUES ($1, $2)`,
        [Date.now().toString(), migrationName],
      );

      // Guardar auditoría exitosa
      await this.migrationAuditRepo.save(auditEntry);

      return {
        success: true,
        message: `Migración ${migrationName} ejecutada correctamente`,
        migration: migrationName,
        executedBy: userId,
        auditId: auditEntry.id,
      };
    } catch (error) {
      // Guardar auditoría fallida
      auditEntry.success = false;
      auditEntry.error_message = error.message;
      await this.migrationAuditRepo.save(auditEntry);

      throw error;
    }
  }

  async revertMigration(migrationName: string, userId: string) {
    const allMigrations = this.dataSource.migrations;
    const migrationToRevert = allMigrations.find(
      (migration) => migration.constructor.name === migrationName,
    );

    if (!migrationToRevert) {
      throw new NotFoundException(`Migración ${migrationName} no encontrada`);
    }

    // Verificar que la migración esté ejecutada
    const executedMigrations = await this.dataSource.query(
      `SELECT * FROM "migrations" WHERE "name" = $1`,
      [migrationName],
    );

    if (executedMigrations.length === 0) {
      throw new NotFoundException(
        `La migración ${migrationName} no está ejecutada`,
      );
    }

    // Revertir la migración
    await migrationToRevert.down(this.dataSource.createQueryRunner());

    // Actualizar registro con información de reversión
    await this.dataSource.query(
      `DELETE FROM "migrations" 
       WHERE "name" = $1`,
      [migrationName],
    );

    // Registrar auditoría de reversión
    const auditEntry = this.migrationAuditRepo.create({
      migration_name: migrationName,
      action: 'REVERT',
      user_id: userId,
      details: { migrationName, userId },
      success: true,
    });
    await this.migrationAuditRepo.save(auditEntry);

    return {
      success: true,
      message: `Migración ${migrationName} revertida correctamente`,
      migration: migrationName,
      revertedBy: userId,
    };
  }

  async executeAllPendingMigrations() {
    const result = await this.dataSource.runMigrations();
    const executedNames = result.map((m) => m.constructor.name);

    return {
      success: true,
      message: `${executedNames.length} migraciones ejecutadas`,
      executedMigrations: executedNames,
    };
  }

  async revertLastMigration() {
    await this.dataSource.undoLastMigration();
    return {
      success: true,
      message: 'Última migración revertida',
      reverted: true,
    };
  }

  async getMigrationHistory(migrationName?: string) {
    const query = this.migrationAuditRepo
      .createQueryBuilder('audit')
      .leftJoinAndSelect('audit.user', 'user')
      .orderBy('audit.executed_at', 'DESC');

    if (migrationName) {
      query.where('audit.migration_name = :migrationName', { migrationName });
    }

    return query.getMany();
  }
}
