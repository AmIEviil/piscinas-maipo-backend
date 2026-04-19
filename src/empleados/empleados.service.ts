import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Employee } from './entities/empleado.entity';
import { EmployeeNote } from './entities/employee_notes.entity';
import { FiltersEmployeesDto } from './dto/FiltersEmployees.dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class EmpleadosService {
  private readonly logger = new Logger(EmpleadosService.name);
  constructor(
    @InjectRepository(Employee)
    private readonly empleadoRepository: Repository<Employee>,

    @InjectRepository(EmployeeNote)
    private readonly empleadoNoteRepository: Repository<EmployeeNote>,
  ) {}

  async findAll(filters?: FiltersEmployeesDto): Promise<Employee[]> {
    this.logger.log(
      'Buscando empleados con filtros: ' + JSON.stringify(filters),
    );
    const query = this.empleadoRepository
      .createQueryBuilder('employee')
      .leftJoinAndSelect('employee.notas', 'notas');

    if (!filters) {
      return query.getMany();
    }

    if (filters.nombre) {
      query.andWhere('employee.nombre ILIKE :nombre', {
        nombre: `%${filters.nombre}%`,
      });
    }

    if (filters.apellido) {
      query.andWhere('employee.apellido ILIKE :apellido', {
        apellido: `%${filters.apellido}%`,
      });
    }

    if (filters.telefono) {
      query.andWhere('employee.telefono ILIKE :telefono', {
        telefono: `%${filters.telefono}%`,
      });
    }

    if (filters.grupo) {
      query.andWhere('employee.grupo = :grupo', {
        grupo: filters.grupo,
      });
    }

    if (filters.orderBy) {
      if (filters.orderBy) {
        query.orderBy(
          `employee.${filters.orderBy}`,
          filters.orderDirection === 'DESC' ? 'DESC' : 'ASC',
        );
      }
    }
    query.addOrderBy('notas."fechaCreacion"', 'DESC');

    return query.getMany();
  }

  async findOne(id: string): Promise<Employee> {
    const empleado = await this.empleadoRepository
      .createQueryBuilder('employee')
      .leftJoinAndSelect('employee.notas', 'notas')
      .where('employee.id = :id', { id })
      .orderBy('notas."fechaCreacion"', 'DESC')
      .getOne();

    if (!empleado) {
      throw new NotFoundException(`Empleado con id ${id} no existe`);
    }

    return empleado;
  }

  async createEmployee(data: Partial<Employee>): Promise<Employee> {
    const newEmployee = this.empleadoRepository.create(data);
    return this.empleadoRepository.save(newEmployee);
  }

  async update(id: string, data: Partial<Employee>): Promise<Employee> {
    const empleado = await this.empleadoRepository.findOneBy({ id });
    if (!empleado) {
      throw new NotFoundException(`Empleado con id ${id} no existe`);
    }
    Object.assign(empleado, data);
    return this.empleadoRepository.save(empleado);
  }

  async remove(id: string): Promise<void> {
    const result = await this.empleadoRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Empleado con id ${id} no existe`);
    }
  }
}
