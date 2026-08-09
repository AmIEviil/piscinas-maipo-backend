import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

// Columnas por las que se permite ordenar. Se interpolan en la consulta
// (TypeORM no parametriza la expresion de columna en orderBy), por lo que la
// lista blanca es la unica barrera contra inyeccion SQL. No agregar nada aqui
// que no sea un nombre de columna real de la entidad Client.
export const CLIENT_ORDER_BY_FIELDS = [
  'nombre',
  'direccion',
  'comuna',
  'telefono',
  'email',
  'fecha_ingreso',
  'tipo_piscina',
  'dia_mantencion',
  'ruta',
  'valor_mantencion',
  'isActive',
] as const;

export type ClientOrderByField = (typeof CLIENT_ORDER_BY_FIELDS)[number];

export class FilterClientsDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  nombre?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  direccion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  comuna?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  dia?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  ruta?: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsIn(CLIENT_ORDER_BY_FIELDS, {
    message: `orderBy must be one of: ${CLIENT_ORDER_BY_FIELDS.join(', ')}`,
  })
  orderBy?: ClientOrderByField;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  @IsIn(['ASC', 'DESC'])
  orderDirection?: 'ASC' | 'DESC';
}
