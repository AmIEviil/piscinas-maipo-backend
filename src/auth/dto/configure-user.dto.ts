import { IsString, Matches, MinLength, MaxLength } from 'class-validator';
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MESSAGE,
  PASSWORD_MIN_LENGTH,
  PASSWORD_REGEX,
} from '../constants/password-policy';

export class ConfigureAccountDto {
  // Token de activacion recibido por correo. Es lo unico que autoriza la
  // activacion de la cuenta.
  @IsString()
  @MaxLength(512)
  token: string;

  @IsString()
  @MinLength(3)
  @MaxLength(30)
  user_name: string;

  @IsString()
  @MinLength(PASSWORD_MIN_LENGTH)
  @MaxLength(PASSWORD_MAX_LENGTH)
  @Matches(PASSWORD_REGEX, { message: PASSWORD_MESSAGE })
  password: string;
}
