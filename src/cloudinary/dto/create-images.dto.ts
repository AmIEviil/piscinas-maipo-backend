import { IsArray, ValidateNested, IsString } from 'class-validator';
import { Type } from 'class-transformer';

class ImagenDto {
  @IsString()
  url: string;

  @IsString()
  public_id: string;
}

export class AddImagesBulkDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImagenDto)
  imagenes: ImagenDto[];
}
