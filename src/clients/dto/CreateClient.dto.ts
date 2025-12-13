import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateClientDto {
  @IsString()
  nombre: string;
  @IsString()
  direccion: string;
  @IsString()
  comuna: string;
  @IsString()
  telefono: string;
  @IsString()
  email?: string;
  @IsString()
  fecha_ingreso?: string;
  @IsString()
  tipo_piscina: string;
  @IsString()
  dia_mantencion: string;
  @IsNumber()
  valor_mantencion: number;
  frequencia_mantencion_id: string;
  @IsOptional()
  @IsString()
  observacion?: string;
  @IsString()
  ruta?: string;
}
