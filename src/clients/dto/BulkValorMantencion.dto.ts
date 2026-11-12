import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

/** Valor de mantencion nuevo para un cliente, en CLP enteros. */
export class ItemValorMantencionDto {
  @IsUUID('all')
  id: string;

  @IsInt()
  @Min(1)
  @Max(10_000_000)
  valor: number;
}

/**
 * Cambio masivo del valor de mantencion con un valor por cliente.
 *
 * El front calcula el monto final de cada fila (subida global o override
 * individual) y manda el resultado: el backend no interpreta porcentajes.
 * El tope de 1000 items evita requests desproporcionados dentro de una sola
 * transaccion.
 */
export class BulkValorMantencionDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(1000)
  @ValidateNested({ each: true })
  @Type(() => ItemValorMantencionDto)
  items: ItemValorMantencionDto[];
}
