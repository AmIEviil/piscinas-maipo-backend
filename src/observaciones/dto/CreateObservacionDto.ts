import { IsString } from 'class-validator';

export class CreateObservacionDto {
  @IsString()
  tipoEntidad: string;
  @IsString()
  registro_id: string;
  @IsString()
  detalle: string;
  @IsString()
  fecha: string;
  @IsString()
  usuarioId: string;
}
