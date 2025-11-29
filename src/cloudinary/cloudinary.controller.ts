import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service';
import { AddImagesBulkDto } from './dto/create-images.dto';
import { JwtAuthGuard } from 'auth/guards/jwt-auth.guard';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const result = await this.cloudinaryService.uploadImage(file);
    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  }

  @Post('revestimiento/:id/imagenes/bulk')
  async addImagesBulk(@Param('id') id: string, @Body() body: AddImagesBulkDto) {
    return this.cloudinaryService.addImagesBulk(id, body.imagenes);
  }

  @Get()
  async findByRevestimiento(@Param('id') id: string) {
    return this.cloudinaryService.findByRevestimiento(id);
  }

  @Delete(':imagenId')
  async delete(@Param('imagenId') imagenId: string) {
    return this.cloudinaryService.deleteImage(imagenId);
  }

  @Delete('cloudinary/:publicId')
  async deleteFromCloudinary(@Param('publicId') publicId: string) {
    return this.cloudinaryService.deleteImageCloudinary(publicId);
  }
}
