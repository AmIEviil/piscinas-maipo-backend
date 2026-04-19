import { IsEmail, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateClientDto {
  @IsString()
  @MaxLength(150)
  nombre: string;

  @IsString()
  @MaxLength(255)
  direccion: string;

  @IsString()
  @MaxLength(100)
  comuna: string;

  @IsString()
  @MaxLength(20)
  telefono: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  fecha_ingreso?: string;

  @IsString()
  @MaxLength(50)
  tipo_piscina: string;

  @IsString()
  @MaxLength(20)
  dia_mantencion: string;

  @IsNumber()
  @Min(0)
  valor_mantencion: number;

  @IsOptional()
  @IsString()
  frequencia_mantencion_id?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  observacion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  ruta?: string;
}
