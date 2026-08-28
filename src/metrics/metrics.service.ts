import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Client } from '../clients/entities/clients.entity';
import { Maintenance } from '../maintenance/entities/maintenance.entity';

@Injectable()
export class MetricsService {
  constructor(
    @InjectRepository(Client)
    private clientRepo: Repository<Client>,
    @InjectRepository(Maintenance)
    private maintenanceRepo: Repository<Maintenance>,
  ) {}

  // Mantenciones por cada día hábil actual
  async getDailyMetrics() {
    const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

    // El contenedor corre en UTC, así que toISOString() adelanta el día a
    // partir de las 20:00 de Chile: a esa hora "hoy" pasaba a ser mañana,
    // realizadas daba 0 y todas las mantenciones aparecían como faltantes.
    // Se calcula la fecha en la zona del negocio y se instancia al mediodía
    // para que el Date no vuelva a cruzar el día en ninguna zona horaria.
    const hoy = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Santiago',
    }).format(new Date());
    const fechaHoy = new Date(`${hoy}T12:00:00`);

    const results: {
      dia: string;
      programadas: number;
      realizadas: number;
      faltantes: number;
    }[] = [];

    for (const dia of diasSemana) {
      // Solo clientes activos: un cliente dado de baja ya no tiene mantención
      // programada, pero seguía sumando a programadas y a faltantes.
      const programadas = await this.clientRepo.count({
        where: { dia_mantencion: dia, isActive: true },
      });

      const realizadas = await this.maintenanceRepo.count({
        where: {
          fechaMantencion: fechaHoy,
          realizada: true,
          client: { dia_mantencion: dia, isActive: true },
        },
        relations: ['client'],
      });

      results.push({
        dia,
        programadas,
        realizadas,
        faltantes: Math.max(programadas - realizadas, 0),
      });
    }

    return results;
  }

  // Mantenciones totales en la semana actual
  async getWeeklyMetrics() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 (domingo) a 6 (sábado)

    const startOfWeek = new Date(today);
    startOfWeek.setDate(
      today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1),
    ); // Lunes

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Domingo

    const mantenciones = await this.maintenanceRepo.find({
      where: {
        fechaMantencion: Between(startOfWeek, endOfWeek),
      },
    });

    const realizadas = mantenciones.filter((m) => m.realizada).length;

    return {
      semana: `${startOfWeek.toISOString().split('T')[0]} al ${
        endOfWeek.toISOString().split('T')[0]
      }`,
      programadas: mantenciones.length,
      realizadas,
      faltantes: mantenciones.length - realizadas,
    };
  }

  // Mantenciones en un rango de fechas (mes)
  async getMonthlyMetrics(from: string, to: string) {
    const mantenciones = await this.maintenanceRepo.find({
      where: {
        fechaMantencion: Between(new Date(from), new Date(to)),
      },
    });

    const realizadas = mantenciones.filter((m) => m.realizada).length;

    return {
      desde: from,
      hasta: to,
      programadas: mantenciones.length,
      realizadas,
      faltantes: mantenciones.length - realizadas,
    };
  }
}
