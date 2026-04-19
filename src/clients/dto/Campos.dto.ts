import { IsIn, IsString, MaxLength } from 'class-validator';

const ALLOWED_CAMPOS = [
  'nombre', 'direccion', 'comuna', 'telefono', 'email',
  'tipo_piscina', 'dia_mantencion', 'valor_mantencion',
  'ruta', 'isActive', 'observacion', 'frequencia_mantencion_id',
] as const;

export class UpdateCampoDto {
  @IsString()
  @IsIn(ALLOWED_CAMPOS, { message: `campo must be one of: ${ALLOWED_CAMPOS.join(', ')}` })
  campo: string;

  @MaxLength(1000)
  valor: string | number | boolean;
}
