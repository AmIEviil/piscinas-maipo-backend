import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { Product } from '../products/entities/product.entity';
import { ComprobantePago } from '../pagos/entities/comprobante-pago.entity';
import { Maintenance } from '../maintenance/entities/maintenance.entity';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) {}

  async sendAccountActivation(user: {
    first_name: string;
    last_name: string;
    email: string;
    activationToken: string;
  }): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Activa tu cuenta — Piscinas El Maipo',
        template: 'account-activation',
        context: {
          first_name: user.first_name,
          last_name: user.last_name,
          activationLink: `${process.env.FRONTEND_URL}/configurar-cuenta?token=${user.activationToken}`,
        },
      });
    } catch (error) {
      this.logger.error(`Error sending activation email to ${user.email}`, error);
    }
  }

  async sendPasswordReset(user: {
    first_name: string;
    email: string;
    resetToken: string;
  }): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Restablecer contraseña — Piscinas El Maipo',
        template: 'password-reset',
        context: {
          first_name: user.first_name,
          resetLink: `${process.env.FRONTEND_URL}/restablecer-contrasena?token=${user.resetToken}`,
          expiresIn: '15 minutos',
        },
      });
    } catch (error) {
      this.logger.error(`Error sending password reset email to ${user.email}`, error);
    }
  }

  async sendLowStockAlert(
    products: Product[],
    adminEmails: string[],
  ): Promise<void> {
    if (!adminEmails.length) return;
    try {
      await this.mailerService.sendMail({
        to: adminEmails,
        subject: '⚠️ Alerta de stock bajo — Piscinas El Maipo',
        template: 'low-stock-alert',
        context: {
          products: products.map((p) => ({
            nombre: p.nombre,
            cant_disponible: p.cant_disponible,
            stock_minimo: p.stock_minimo,
            tipo: p.tipo?.nombre ?? '—',
          })),
          total: products.length,
          fecha: new Date().toLocaleDateString('es-CL'),
        },
      });
    } catch (error) {
      this.logger.error('Error sending low stock alert', error);
    }
  }

  async sendPendingPaymentsAlert(
    pagos: ComprobantePago[],
    adminEmails: string[],
  ): Promise<void> {
    if (!adminEmails.length) return;
    try {
      await this.mailerService.sendMail({
        to: adminEmails,
        subject: '💳 Resumen de pagos recientes — Piscinas El Maipo',
        template: 'pending-payments',
        context: {
          pagos: pagos.map((p) => ({
            nombre: p.nombre,
            tipo: p.tipo,
            monto: p.monto?.toLocaleString('es-CL') ?? '—',
            fecha_emision: p.fecha_emision,
          })),
          total: pagos.length,
          fecha: new Date().toLocaleDateString('es-CL'),
        },
      });
    } catch (error) {
      this.logger.error('Error sending pending payments alert', error);
    }
  }

  async sendDailyMaintenanceSummary(
    maintenances: Maintenance[],
    adminEmails: string[],
    date: Date,
  ): Promise<void> {
    if (!adminEmails.length) return;
    try {
      const realizadas = maintenances.filter((m) => m.realizada).length;
      const noRealizadas = maintenances.length - realizadas;
      await this.mailerService.sendMail({
        to: adminEmails,
        subject: `📋 Resumen de mantenciones — ${date.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}`,
        template: 'daily-maintenance-summary',
        context: {
          fecha: date.toLocaleDateString('es-CL', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }),
          total: maintenances.length,
          realizadas,
          noRealizadas,
          clientes: maintenances.map((m) => ({
            nombre: m.client?.nombre ?? '—',
            direccion: m.client?.direccion ?? '—',
            ruta: m.client?.ruta ?? '—',
            realizada: m.realizada,
            realizadaLabel: m.realizada ? 'Sí' : 'No',
            valor: m.valor_mantencion?.toLocaleString('es-CL') ?? '0',
            productos: (m.productos ?? []).map((mp) => ({
              nombre: mp.product?.nombre ?? '—',
              cantidad: mp.cantidad,
            })),
            tieneProductos: (m.productos ?? []).length > 0,
          })),
          hayMantenciones: maintenances.length > 0,
        },
      });
    } catch (error) {
      this.logger.error('Error sending daily maintenance summary', error);
    }
  }

  async sendPendingAccountsSummary(
    pendingClients: {
      clientId: string;
      nombre: string;
      direccion: string;
      dia_mantencion: string;
      ruta: string;
      totalPendiente: number;
      mantencionesPendientes: number;
    }[],
    adminEmails: string[],
  ): Promise<void> {
    if (!adminEmails.length) return;
    try {
      const totalGeneral = pendingClients.reduce((s, c) => s + c.totalPendiente, 0);
      await this.mailerService.sendMail({
        to: adminEmails,
        subject: pendingClients.length
          ? '💳 Cuentas pendientes de pago — Piscinas El Maipo'
          : '✅ Sin cuentas pendientes — Piscinas El Maipo',
        template: 'pending-accounts',
        context: {
          fecha: new Date().toLocaleDateString('es-CL'),
          hayPendientes: pendingClients.length > 0,
          totalClientes: pendingClients.length,
          totalGeneral: totalGeneral.toLocaleString('es-CL'),
          clientes: pendingClients.map((c) => ({
            nombre: c.nombre,
            direccion: c.direccion,
            dia_mantencion: c.dia_mantencion,
            ruta: c.ruta,
            totalPendiente: c.totalPendiente.toLocaleString('es-CL'),
            mantencionesPendientes: c.mantencionesPendientes,
          })),
        },
      });
    } catch (error) {
      this.logger.error('Error sending pending accounts summary', error);
    }
  }

  async sendWeeklyMaintenanceSummary(
    data: {
      thisWeekMaintenances: Maintenance[];
      nextWeekMaintenances: Maintenance[];
      productUsage: {
        nombre: string;
        tipo: string;
        usadoEnSemana: number;
        cantDisponible: number;
        stockMinimo: number | null;
        recomendarCompra: boolean;
      }[];
      weekStart: Date;
      weekEnd: Date;
    },
    adminEmails: string[],
  ): Promise<void> {
    if (!adminEmails.length) return;
    try {
      const realizadas = data.thisWeekMaintenances.filter((m) => m.realizada).length;
      const noRealizadas = data.thisWeekMaintenances.length - realizadas;
      const productosAComprar = data.productUsage.filter((p) => p.recomendarCompra);

      await this.mailerService.sendMail({
        to: adminEmails,
        subject: `📊 Resumen semanal — semana del ${data.weekStart.toLocaleDateString('es-CL')}`,
        template: 'weekly-maintenance-summary',
        context: {
          semanaInicio: data.weekStart.toLocaleDateString('es-CL'),
          semanaFin: data.weekEnd.toLocaleDateString('es-CL'),
          totalMantenciones: data.thisWeekMaintenances.length,
          realizadas,
          noRealizadas,
          mantenciones: data.thisWeekMaintenances.map((m) => ({
            fecha: new Date(m.fechaMantencion).toLocaleDateString('es-CL'),
            cliente: m.client?.nombre ?? '—',
            ruta: m.client?.ruta ?? '—',
            realizada: m.realizada,
            realizadaLabel: m.realizada ? 'Sí' : 'No',
            valor: m.valor_mantencion?.toLocaleString('es-CL') ?? '0',
          })),
          productos: data.productUsage.map((p) => ({
            nombre: p.nombre,
            tipo: p.tipo,
            usadoEnSemana: p.usadoEnSemana,
            cantDisponible: p.cantDisponible,
            recomendarCompra: p.recomendarCompra,
          })),
          hayProductosAComprar: productosAComprar.length > 0,
          productosAComprar,
          proximaSemana: data.nextWeekMaintenances.map((m) => ({
            fecha: new Date(m.fechaMantencion).toLocaleDateString('es-CL', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            }),
            cliente: m.client?.nombre ?? '—',
            direccion: m.client?.direccion ?? '—',
            ruta: m.client?.ruta ?? '—',
          })),
          hayProximaSemana: data.nextWeekMaintenances.length > 0,
        },
      });
    } catch (error) {
      this.logger.error('Error sending weekly maintenance summary', error);
    }
  }

  async sendMonthlyConsolidation(
    data: {
      maintenances: Maintenance[];
      productUsage: {
        nombre: string;
        tipo: string;
        usadoEnSemana: number;
        cantDisponible: number;
        stockMinimo: number | null;
        recomendarCompra: boolean;
      }[];
      pendingClients: {
        clientId: string;
        nombre: string;
        direccion: string;
        dia_mantencion: string;
        ruta: string;
        totalPendiente: number;
        mantencionesPendientes: number;
      }[];
      month: Date;
    },
    adminEmails: string[],
  ): Promise<void> {
    if (!adminEmails.length) return;
    try {
      const mesNombre = data.month.toLocaleDateString('es-CL', {
        month: 'long',
        year: 'numeric',
      });
      const realizadas = data.maintenances.filter((m) => m.realizada).length;
      const noRealizadas = data.maintenances.length - realizadas;
      const totalFacturado = data.maintenances
        .filter((m) => m.realizada)
        .reduce((s, m) => s + (m.valor_mantencion ?? 0), 0);
      const totalPendienteGlobal = data.pendingClients.reduce(
        (s, c) => s + c.totalPendiente,
        0,
      );
      const productosAComprar = data.productUsage.filter((p) => p.recomendarCompra);

      await this.mailerService.sendMail({
        to: adminEmails,
        subject: `📅 Consolidación mensual — ${mesNombre}`,
        template: 'monthly-consolidation',
        context: {
          mesNombre,
          totalMantenciones: data.maintenances.length,
          realizadas,
          noRealizadas,
          totalFacturado: totalFacturado.toLocaleString('es-CL'),
          mantenciones: data.maintenances.map((m) => ({
            fecha: new Date(m.fechaMantencion).toLocaleDateString('es-CL'),
            cliente: m.client?.nombre ?? '—',
            ruta: m.client?.ruta ?? '—',
            realizada: m.realizada,
            realizadaLabel: m.realizada ? 'Sí' : 'No',
            valor: m.valor_mantencion?.toLocaleString('es-CL') ?? '0',
          })),
          productos: data.productUsage.map((p) => ({
            nombre: p.nombre,
            tipo: p.tipo,
            usadoEnMes: p.usadoEnSemana,
            cantDisponible: p.cantDisponible,
            recomendarCompra: p.recomendarCompra,
          })),
          hayProductosAComprar: productosAComprar.length > 0,
          productosAComprar,
          hayPendientes: data.pendingClients.length > 0,
          totalClientesPendientes: data.pendingClients.length,
          totalPendienteGlobal: totalPendienteGlobal.toLocaleString('es-CL'),
          clientesPendientes: data.pendingClients.map((c) => ({
            nombre: c.nombre,
            direccion: c.direccion,
            dia_mantencion: c.dia_mantencion,
            ruta: c.ruta,
            totalPendiente: c.totalPendiente.toLocaleString('es-CL'),
            mantencionesPendientes: c.mantencionesPendientes,
          })),
        },
      });
    } catch (error) {
      this.logger.error('Error sending monthly consolidation', error);
    }
  }

  async sendWeeklySummary(
    data: {
      lowStockCount: number;
      recentPaymentsCount: number;
      recentPaymentsTotal: number;
    },
    adminEmails: string[],
  ): Promise<void> {
    if (!adminEmails.length) return;
    try {
      await this.mailerService.sendMail({
        to: adminEmails,
        subject: '📊 Resumen semanal — Piscinas El Maipo',
        template: 'weekly-summary',
        context: {
          ...data,
          recentPaymentsTotalFormatted: data.recentPaymentsTotal.toLocaleString('es-CL'),
          semana: new Date().toLocaleDateString('es-CL'),
        },
      });
    } catch (error) {
      this.logger.error('Error sending weekly summary', error);
    }
  }
}
