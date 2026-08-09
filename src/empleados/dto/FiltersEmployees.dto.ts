import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

// Columnas por las que se permite ordenar. Se interpolan en la consulta
// (TypeORM no parametriza la expresion de columna en orderBy), por lo que la
// lista blanca es la unica barrera contra inyeccion SQL. No agregar nada aqui
// que no sea un nombre de columna real de la entidad Employee.
export const EMPLOYEE_ORDER_BY_FIELDS = [
  'nombre',
  'apellido',
  'rut',
  'email',
  'telefono',
  'fechaInicioContrato',
  'fechaFinContrato',
  'tipoContrato',
  'estado',
  'grupo',
  'createdAt',
] as const;

export type EmployeeOrderByField = (typeof EMPLOYEE_ORDER_BY_FIELDS)[number];

export class FiltersEmployeesDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombre?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  apellido?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefono?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  grupo?: string;

  @IsOptional()
  @IsIn(EMPLOYEE_ORDER_BY_FIELDS, {
    message: `orderBy must be one of: ${EMPLOYEE_ORDER_BY_FIELDS.join(', ')}`,
  })
  orderBy?: EmployeeOrderByField;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  @IsIn(['ASC', 'DESC'])
  orderDirection?: 'ASC' | 'DESC';
}
