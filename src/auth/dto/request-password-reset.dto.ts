import { IsEmail, IsString, MinLength } from 'class-validator';

export class RequestPasswordResetDto {
  @IsString()
  @MinLength(3)
  user_name: string;

  @IsEmail()
  email: string;
}
