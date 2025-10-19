import { IsString, Matches, MinLength, MaxLength } from 'class-validator';

export class ConfigureAccountDto {
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  user_name: string;

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'La contraseña debe tener al menos una mayúscula, una minúscula y un número',
  })
  password: string;
}
