import {
  IsString,
  IsBoolean,
  IsNumber,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ClientDto {
  @IsString()
  id: string;
}

export class CreateMaintenanceProductDto {
  @IsString()
  productId: string;

  @IsNumber()
  cantidad: number;
}

export class CreateMaintenanceDto {
  @IsString()
  fechaMantencion: string;

  @IsBoolean()
  realizada: boolean;

  @IsBoolean()
  recibioPago: boolean;

  @IsNumber()
  valorMantencion: number;

  @ValidateNested()
  @Type(() => ClientDto)
  client: ClientDto;

  @ValidateNested({ each: true })
  @Type(() => CreateMaintenanceProductDto)
  productosUsados?: CreateMaintenanceProductDto[];

  @IsString()
  @IsOptional()
  observaciones: string;
}

export class UpdateMaintenanceDto {
  @IsOptional()
  @IsString()
  fechaMantencion?: string;

  @IsOptional()
  @IsBoolean()
  realizada?: boolean;

  @IsOptional()
  @IsBoolean()
  recibioPago?: boolean;

  @IsOptional()
  @IsNumber()
  valorMantencion?: number;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateMaintenanceProductDto)
  productosUsados?: CreateMaintenanceProductDto[];

  @IsOptional()
  @IsString()
  observaciones?: string;
}
