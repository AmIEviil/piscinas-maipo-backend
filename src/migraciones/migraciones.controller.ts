import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { MigracionesService } from './migraciones.service';
// import { MigrationAccessGuard } from './guards/MigrationAccessGuard';
// import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('migraciones')
// @UseGuards(JwtAuthGuard, MigrationAccessGuard)
export class MigracionesController {
  constructor(private readonly migrationService: MigracionesService) {}

  @Get()
  async listMigrations(@Query('order') order: 'asc' | 'desc' = 'asc') {
    console.log('Order:', order);
    return this.migrationService.getMigrationsStatus();
  }

  @Post('execute/:migrationName/:userId')
  async executeMigration(
    @Param('migrationName') migrationName: string,
    @Param('userId') userId: string,
  ) {
    console.log('Ejecutar migración llamada con:', migrationName, userId);
    return this.migrationService.executeMigration();
  }

  @Post('revert/:migrationName/:userId')
  async revertMigration(
    @Param('migrationName') migrationName: string,
    @Param('userId') userId: string,
  ) {
    console.log('Revertir migración llamada con:', migrationName, userId);
    return this.migrationService.revertMigration();
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
    console.log('migrationName:', migrationName);
    return this.migrationService.getMigrationHistory();
  }
}
