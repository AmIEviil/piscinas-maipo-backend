import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service';
import { AddImagesBulkDto } from './dto/create-images.dto';
import { FileValidationPipe } from '../utils/file-validation.pipe';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLES, ROLE_GROUPS } from '../auth/constants/roles';

@Controller('upload')
@Roles(...ROLE_GROUPS.STAFF)
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Roles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEC)
  @Post()
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }),
  )
  async uploadFile(
    @UploadedFile(new FileValidationPipe('image')) file: Express.Multer.File,
  ) {
    const result = await this.cloudinaryService.uploadImage(file);
    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  }

  @Roles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEC)
  @Post('revestimiento/:id/imagenes/bulk')
  async addImagesBulk(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: AddImagesBulkDto,
  ) {
    return this.cloudinaryService.addImagesBulk(id, body.imagenes);
  }

  @Get()
  async findByRevestimiento(@Param('id') id: string) {
    return this.cloudinaryService.findByRevestimiento(id);
  }

  @Roles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEC)
  @Delete(':imagenId')
  async delete(@Param('imagenId', ParseUUIDPipe) imagenId: string) {
    return this.cloudinaryService.deleteImage(imagenId);
  }

  @Roles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEC)
  @Delete('cloudinary/:publicId')
  async deleteFromCloudinary(@Param('publicId') publicId: string) {
    return this.cloudinaryService.deleteImageCloudinary(publicId);
  }
}
