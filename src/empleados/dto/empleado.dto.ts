import {
  IsDateString,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

// Reemplaza a `Partial<Employee>` / `Employee` en el controlador. Al ser una
// entidad y no un DTO validable, el cuerpo llegaba crudo a `repository.create`
// y `repository.merge`: sin validacion de RUT, de correo, de longitudes ni de
// tipos, y con posibilidad de escribir `id`, `createdAt` y `updatedAt`.
//
// El RUT y el sueldo son datos personales sujetos al deber de reserva del
// art. 154 bis del Codigo del Trabajo: se validan y acotan explicitamente.

// Valores que emite el formulario del frontend
// (`CreateEmployeeDialog.tsx`, ESTADOS_EMPLEADO).
// OJO: 'LICENCIA' indica una licencia medica, es decir un dato de salud
// (dato sensible, art. 16 Ley 21.719). Ver hallazgo N-8 de la auditoria.
export const EMPLOYEE_ESTADOS = [
  'ACTIVO',
  'INACTIVO',
  'LICENCIA',
  'VACACIONES',
] as const;

export class CreateEmployeeDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  nombre: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  apellido: string;

  // Cuerpo del RUT sin digito verificador ni puntos.
  @IsString()
  @Matches(/^\d{7,8}$/, {
    message: 'rut debe ser el número sin puntos ni dígito verificador',
  })
  rut: string;

  @IsString()
  @Matches(/^[0-9kK]$/, { message: 'dv debe ser un dígito o la letra K' })
  dv: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  email?: string;

  @IsString()
  @MaxLength(20)
  telefono: string;

  @IsString()
  @MaxLength(255)
  direccion: string;

  @IsDateString()
  fechaInicioContrato: string;

  @IsOptional()
  @IsDateString()
  fechaFinContrato?: string;

  @IsInt()
  @Min(0)
  sueldo: number;

  @IsString()
  @MaxLength(50)
  tipoContrato: string;

  @IsOptional()
  @IsIn(EMPLOYEE_ESTADOS)
  estado?: string;

  @IsString()
  @MaxLength(50)
  grupo: string;
}

export class UpdateEmployeeDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  nombre?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  apellido?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{7,8}$/, {
    message: 'rut debe ser el número sin puntos ni dígito verificador',
  })
  rut?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9kK]$/, { message: 'dv debe ser un dígito o la letra K' })
  dv?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefono?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  direccion?: string;

  @IsOptional()
  @IsDateString()
  fechaInicioContrato?: string;

  @IsOptional()
  @IsDateString()
  fechaFinContrato?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sueldo?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  tipoContrato?: string;

  @IsOptional()
  @IsIn(EMPLOYEE_ESTADOS)
  estado?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  grupo?: string;
}
