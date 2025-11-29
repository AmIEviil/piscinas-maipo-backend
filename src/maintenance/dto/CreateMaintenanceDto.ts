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
