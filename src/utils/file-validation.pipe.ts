import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  document: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
};

@Injectable()
export class FileValidationPipe implements PipeTransform {
  constructor(
    private readonly type: keyof typeof ALLOWED_MIME_TYPES = 'image',
  ) {}

  transform(file: Express.Multer.File) {
    if (!file) return file;

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024} MB`,
      );
    }

    const allowed = ALLOWED_MIME_TYPES[this.type];
    if (!allowed.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type "${file.mimetype}". Allowed: ${allowed.join(', ')}`,
      );
    }

    return file;
  }
}
