import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MailService } from '../mail/mail.service';
import { ProductsService } from '../products/products.service';
import { PagosService } from '../pagos/pagos.service';
import { UsersService } from '../users/users.service';
import { MaintenanceService } from '../maintenance/maintenance.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private readonly mailService: MailService,
    private readonly productsService: ProductsService,
    private readonly pagosService: PagosService,
    private readonly usersService: UsersService,
    private readonly maintenanceService: MaintenanceService,
  ) {}

  @Cron(CronExpression.EVERY_2_HOURS, { timeZone: 'America/Santiago' })
  handleCronEvery2Hours() {
    try {
      this.logger.log(`✅ Ejecutando tarea cada 2 horas`);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error('❌ Error al ejecutar tarea cada 2 horas:', error.message);
      } else {
        this.logger.error('❌ Error al ejecutar tarea cada 2 horas:', String(error));
      }
    }
  }

  // Runs every day at 8:00 AM — low stock alert
  @Cron('0 8 * * *', { timeZone: 'America/Santiago' })
  async handleLowStockAlert() {
    try {
      const [products, adminEmails] = await Promise.all([
        this.productsService.getLowStockProducts(),
        this.usersService.findAdminEmails(),
      ]);

      if (!products.length) {
        this.logger.log('✅ Stock check: no products below minimum');
        return;
      }

      this.logger.log(`⚠️ Stock check: ${products.length} product(s) below minimum — sending alert`);
      await this.mailService.sendLowStockAlert(products, adminEmails);
    } catch (error) {
      this.logger.error('❌ Error in low stock alert cron:', error);
    }
  }

  // Runs every day at 8:00 AM — pending accounts alert
  @Cron('0 8 * * *', { timeZone: 'America/Santiago' })
  async handlePendingAccountsAlert() {
    try {
      const [pendingClients, adminEmails] = await Promise.all([
        this.maintenanceService.findClientsWithPendingPayments(),
        this.usersService.findAdminEmails(),
      ]);

      this.logger.log(
        pendingClients.length
          ? `💳 Pending accounts: ${pendingClients.length} client(s) — sending alert`
          : '✅ Pending accounts: all up to date',
      );
      await this.mailService.sendPendingAccountsSummary(pendingClients, adminEmails);
    } catch (error) {
      this.logger.error('❌ Error in pending accounts cron:', error);
    }
  }

  // Runs Monday–Friday at 11:00 PM — daily maintenance summary
  @Cron('0 23 * * 1-5', { timeZone: 'America/Santiago' })
  async handleDailyMaintenanceSummary() {
    try {
      const today = new Date();
      const [maintenances, adminEmails] = await Promise.all([
        this.maintenanceService.findByDate(today),
        this.usersService.findAdminEmails(),
      ]);

      this.logger.log(
        `📋 Daily maintenance summary: ${maintenances.length} record(s) for ${today.toLocaleDateString('es-CL')}`,
      );
      await this.mailService.sendDailyMaintenanceSummary(maintenances, adminEmails, today);
    } catch (error) {
      this.logger.error('❌ Error in daily maintenance summary cron:', error);
    }
  }

  // Runs every Sunday at 9:00 PM — weekly maintenance + products + next week
  @Cron('0 21 * * 0', { timeZone: 'America/Santiago' })
  async handleWeeklyMaintenanceSummary() {
    try {
      const today = new Date();

      // Current week: Mon–Sun (today is Sunday)
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - 6); // last Monday
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(today);
      weekEnd.setHours(23, 59, 59, 999);

      // Next week: next Mon–Fri
      const nextWeekStart = new Date(today);
      nextWeekStart.setDate(today.getDate() + 1); // Monday
      nextWeekStart.setHours(0, 0, 0, 0);

      const nextWeekEnd = new Date(today);
      nextWeekEnd.setDate(today.getDate() + 5); // Friday
      nextWeekEnd.setHours(23, 59, 59, 999);

      const [thisWeekMaintenances, nextWeekMaintenances, productUsage, adminEmails] =
        await Promise.all([
          this.maintenanceService.findByDateRange(weekStart, weekEnd),
          this.maintenanceService.findByDateRange(nextWeekStart, nextWeekEnd),
          this.productsService.getWeeklyProductUsage(weekStart, weekEnd),
          this.usersService.findAdminEmails(),
        ]);

      this.logger.log(
        `📊 Weekly summary: ${thisWeekMaintenances.length} this week, ${nextWeekMaintenances.length} scheduled next week`,
      );
      await this.mailService.sendWeeklyMaintenanceSummary(
        { thisWeekMaintenances, nextWeekMaintenances, productUsage, weekStart, weekEnd },
        adminEmails,
      );
    } catch (error) {
      this.logger.error('❌ Error in weekly maintenance summary cron:', error);
    }
  }

  // Runs on the 1st of every month at 9:00 AM — monthly consolidation (covers prior month)
  @Cron('0 9 1 * *', { timeZone: 'America/Santiago' })
  async handleMonthlyConsolidation() {
    try {
      const now = new Date();
      const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      firstOfLastMonth.setHours(0, 0, 0, 0);
      lastOfLastMonth.setHours(23, 59, 59, 999);

      const [maintenances, productUsage, pendingClients, adminEmails] = await Promise.all([
        this.maintenanceService.findByDateRange(firstOfLastMonth, lastOfLastMonth),
        this.productsService.getWeeklyProductUsage(firstOfLastMonth, lastOfLastMonth),
        this.maintenanceService.findClientsWithPendingPayments(),
        this.usersService.findAdminEmails(),
      ]);

      this.logger.log(
        `📅 Monthly consolidation: ${maintenances.length} maintenances for ${firstOfLastMonth.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}`,
      );
      await this.mailService.sendMonthlyConsolidation(
        { maintenances, productUsage, pendingClients, month: firstOfLastMonth },
        adminEmails,
      );
    } catch (error) {
      this.logger.error('❌ Error in monthly consolidation cron:', error);
    }
  }

  // Runs every Monday at 8:00 AM
  @Cron('0 8 * * 1', { timeZone: 'America/Santiago' })
  async handleWeeklyNotifications() {
    try {
      const [products, recentPayments, adminEmails] = await Promise.all([
        this.productsService.getLowStockProducts(),
        this.pagosService.findRecentPayments(),
        this.usersService.findAdminEmails(),
      ]);

      const recentPaymentsTotal = recentPayments.reduce(
        (sum, p) => sum + (p.monto ?? 0),
        0,
      );

      await Promise.all([
        this.mailService.sendPendingPaymentsAlert(recentPayments, adminEmails),
        this.mailService.sendWeeklySummary(
          {
            lowStockCount: products.length,
            recentPaymentsCount: recentPayments.length,
            recentPaymentsTotal,
          },
          adminEmails,
        ),
      ]);

      this.logger.log('✅ Weekly notifications sent');
    } catch (error) {
      this.logger.error('❌ Error in weekly notifications cron:', error);
    }
  }
}
