import { IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export interface FilterRepairDto {
  nombreCliente?: string;
  direccionCliente?: string;
  comunaCliente?: string;
  fechaTrabajo?: string;
}

export class CreateRepairDto {
  @IsUUID()
  client_id: string;

  @IsString()
  @MaxLength(30)
  fecha_ingreso: string;

  @IsString()
  @MaxLength(30)
  fecha_trabajo: string;

  @IsString()
  @MaxLength(2000)
  detalles: string;

  @IsString()
  @MaxLength(2000)
  materiales: string;

  @IsNumber()
  @Min(0)
  costo_reparacion: number;

  @IsNumber()
  @Min(0)
  valor_reparacion: number;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  estado?: string;

  @IsString()
  @MaxLength(500)
  garantia: string;
}
