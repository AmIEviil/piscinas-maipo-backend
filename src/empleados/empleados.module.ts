import { Module } from '@nestjs/common';
import { EmpleadosController } from './empleados.controller';
import { EmpleadosService } from './empleados.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from './entities/empleado.entity';
import { EmployeeNote } from './entities/employee_notes.entity';

@Module({
  controllers: [EmpleadosController],
  providers: [EmpleadosService],
  imports: [TypeOrmModule.forFeature([Employee, EmployeeNote])],
})
export class EmpleadosModule {}
