import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { MOTIVOS_SUPRESION } from '../entities/deletion-log.entity';

export class SupresionDto {
  @IsIn(MOTIVOS_SUPRESION, {
    message: `motivo debe ser uno de: ${MOTIVOS_SUPRESION.join(', ')}`,
  })
  motivo: string;

  /**
   * Referencia de la solicitud del titular (ticket, correo, expediente).
   * Es lo que permite ligar la supresion con la peticion que la origino.
   */
  @IsOptional()
  @IsString()
  @MaxLength(255)
  referencia_solicitud?: string;
}
