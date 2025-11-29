import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { MigracionesService } from './migraciones.service';
import { JwtAuthGuard } from 'auth/guards/jwt-auth.guard';
// import { MigrationAccessGuard } from './guards/MigrationAccessGuard';
// import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('migrations')
// @UseGuards(JwtAuthGuard, MigrationAccessGuard)
@UseGuards(JwtAuthGuard)
export class MigracionesController {
  constructor(private readonly migrationService: MigracionesService) {}

  @Get()
  async listMigrations(@Query('order') order: 'asc' | 'desc' = 'asc') {
    return this.migrationService.getMigrationsStatus(order);
  }

  @Post('execute/:migrationName/:userId')
  async executeMigration(
    @Param('migrationName') migrationName: string,
    @Param('userId') userId: string,
  ) {
    return this.migrationService.executeMigration(migrationName, userId);
  }

  @Post('revert/:migrationName/:userId')
  async revertMigration(
    @Param('migrationName') migrationName: string,
    @Param('userId') userId: string,
  ) {
    return this.migrationService.revertMigration(migrationName, userId);
  }

  @Post('execute-all')
  async executeAllMigrations() {
    return this.migrationService.executeAllPendingMigrations();
  }

  @Post('revert-last')
  async revertLastMigration() {
    return this.migrationService.revertLastMigration();
  }

  @Get('history')
  async getMigrationHistory(@Query('migration') migrationName?: string) {
    return this.migrationService.getMigrationHistory(migrationName);
  }
}
