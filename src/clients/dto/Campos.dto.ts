import { IsString } from 'class-validator';

export class UpdateCampoDto {
  @IsString()
  campo: string;

  valor: any;
}
