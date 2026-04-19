import { IsString, MaxLength } from 'class-validator';

export class LoginUserDto {
  @IsString()
  @MaxLength(50)
  user_name: string;

  @IsString()
  @MaxLength(50)
  password: string;
}
