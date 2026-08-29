import {
  ArrayNotEmpty,
  IsArray,
  IsIn,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

/**
 * Campos que se pueden cambiar en bloque desde el listado de clientes.
 *
 * Es una lista blanca corta a proposito: la edicion masiva existe para el
 * cambio de temporada (verano semanal / invierno quincenal) y para rearmar
 * las rutas del dia, no para editar cualquier campo de la ficha. Nombre,
 * telefono o valor se siguen editando cliente por cliente.
 */
export const CAMPOS_BULK = [
  'dia_mantencion',
  'ruta',
  'frecuencia_mantencion_id',
] as const;

export type CampoBulk = (typeof CAMPOS_BULK)[number];

export class BulkUpdateClientsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('all', { each: true })
  ids: string[];

  @IsString()
  @IsIn(CAMPOS_BULK, {
    message: `campo must be one of: ${CAMPOS_BULK.join(', ')}`,
  })
  campo: CampoBulk;

  /**
   * Valor nuevo, siempre como texto: el dia y la ruta son cadenas y la
   * frecuencia es el uuid de la fila de MaintenanceTemporality. La cadena
   * vacia solo se acepta en `ruta` (equivale a "sin ruta"), y eso se valida
   * en el servicio porque depende del campo.
   */
  @IsString()
  @MaxLength(100)
  valor: string;
}
