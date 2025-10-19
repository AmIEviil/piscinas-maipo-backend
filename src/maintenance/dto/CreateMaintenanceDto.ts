import { IsString, IsBoolean, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ClientDto {
  @IsNumber()
  id: number;
}

export class CreateMaintenanceProductDto {
  @IsNumber()
  productId: number;

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
}
