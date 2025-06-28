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
    const hoy = new Date().toISOString().split('T')[0];

    const results: {
      dia: string;
      programadas: number;
      realizadas: number;
      faltantes: number;
    }[] = [];

    for (const dia of diasSemana) {
      const programadas = await this.clientRepo.count({
        where: { dia_mantencion: dia },
      });

      const realizadas = await this.maintenanceRepo.count({
        where: {
          fechaMantencion: new Date(hoy),
          realizada: true,
          client: { dia_mantencion: dia },
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
