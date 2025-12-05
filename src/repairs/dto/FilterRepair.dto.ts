import { IsNumber, IsOptional, IsString } from 'class-validator';

export interface FilterRepairDto {
  nombreCliente?: string;
  direccionCliente?: string;
  comunaCliente?: string;
  fechaTrabajo?: string;
}

export class CreateRepairDto {
  @IsString()
  client_id: string;
  @IsString()
  fecha_ingreso: string;
  @IsString()
  fecha_trabajo: string;
  @IsString()
  detalles: string;
  @IsString()
  materiales: string;
  @IsNumber()
  costo_reparacion: number;
  @IsNumber()
  valor_reparacion: number;
  @IsString()
  @IsOptional()
  estado: string;
  @IsString()
  garantia: string;
}
