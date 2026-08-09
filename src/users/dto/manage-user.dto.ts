import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

// Estos DTOs reemplazan a `Partial<User>` en el controlador. Con `Partial<User>`
// el metatipo en runtime es Object, el ValidationPipe no lo procesa y el cuerpo
// llegaba crudo a `repository.merge`: se podia escribir `password` en texto
// plano (rompiendo el login, que espera un hash bcrypt), `refresh_token`,
// `failed_attempts`, `blocked_until` o `session_closed_at`.
//
// Ninguno de los dos expone campos de credenciales ni de estado de bloqueo:
// esos se gestionan solo por los flujos de auth.

export class CreateUserAdminDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  user_name?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  first_name: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  last_name: string;

  @IsEmail()
  @MaxLength(254)
  email: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateUserAdminDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  user_name?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  first_name?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  last_name?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  email?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
