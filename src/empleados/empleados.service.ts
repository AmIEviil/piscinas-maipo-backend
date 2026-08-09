import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Employee } from './entities/empleado.entity';
import { EmployeeNote } from './entities/employee_notes.entity';
import {
  EMPLOYEE_ORDER_BY_FIELDS,
  FiltersEmployeesDto,
} from './dto/FiltersEmployees.dto';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/empleado.dto';
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
    // No registrar los filtros: llegan con nombre, apellido y teléfono.
    this.logger.log('Buscando empleados');
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

    // Segunda barrera contra inyeccion SQL: aunque el ValidationPipe ya valida
    // FiltersEmployeesDto, el service no confia en su entrada. orderBy se
    // interpola en la consulta y nunca debe llegar sin verificar.
    if (filters.orderBy) {
      if (!EMPLOYEE_ORDER_BY_FIELDS.includes(filters.orderBy)) {
        throw new BadRequestException(`orderBy no permitido`);
      }
      query.orderBy(
        `employee.${filters.orderBy}`,
        filters.orderDirection === 'DESC' ? 'DESC' : 'ASC',
      );
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

  async createEmployee(data: CreateEmployeeDto): Promise<Employee> {
    const newEmployee = this.empleadoRepository.create(
      data as unknown as Partial<Employee>,
    );
    return this.empleadoRepository.save(newEmployee);
  }

  async update(id: string, data: UpdateEmployeeDto): Promise<Employee> {
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
