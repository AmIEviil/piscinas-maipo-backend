/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */
import { Injectable, NotFoundException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RevestimientoImagen } from '../revestimientos/entities/revestimiento-imagen.entity';
import { Revestimiento } from '../revestimientos/entities/revestimiento.entity';

@Injectable()
export class CloudinaryService {
  constructor(
    @InjectRepository(RevestimientoImagen)
    private imagenRepo: Repository<RevestimientoImagen>,
    @InjectRepository(Revestimiento)
    private revestRepo: Repository<Revestimiento>,
  ) {}

  async uploadImage(file: Express.Multer.File): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: 'revestimientos', // carpeta opcional
            resource_type: 'image',
          },
          (error: UploadApiErrorResponse, result: UploadApiResponse) => {
            if (error) return reject(error);
            resolve(result);
          },
        )
        .end(file.buffer);
    });
  }

  async deleteImageCloudinary(public_id: string) {
    await cloudinary.uploader.destroy(public_id);
    return { message: 'Imagen eliminada de Cloudinary' };
  }

  async addImagesBulk(
    revestimientoId: string,
    imagenes: { url: string; public_id: string }[],
  ) {
    const revestimiento = await this.revestRepo.findOne({
      where: { id: revestimientoId },
    });
    if (!revestimiento)
      throw new NotFoundException('Revestimiento no encontrado');

    const records = imagenes.map((img) =>
      this.imagenRepo.create({
        url: img.url,
        public_id: img.public_id,
        revestimiento,
      }),
    );

    return this.imagenRepo.save(records);
  }

  async deleteImage(id: string) {
    const imagen = await this.imagenRepo.findOne({ where: { id } });
    if (!imagen) throw new NotFoundException('Imagen no encontrada');

    await this.deleteImageCloudinary(imagen.public_id);
    return this.imagenRepo.remove(imagen);
  }

  async findByRevestimiento(revestimientoId: string) {
    return this.imagenRepo.find({
      where: { revestimiento: { id: revestimientoId } },
    });
  }
}
