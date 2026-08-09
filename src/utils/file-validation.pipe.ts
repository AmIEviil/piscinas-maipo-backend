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

// Firmas (magic bytes) de los tipos permitidos.
//
// El `mimetype` de Multer es la cabecera Content-Type que envia el cliente:
// se puede declarar 'image/png' y subir cualquier cosa. Aqui se comprueba el
// contenido real del archivo y se exige que coincida con lo declarado.
type Signature = {
  mime: string;
  test: (buf: Buffer) => boolean;
};

const startsWith = (buf: Buffer, bytes: number[]): boolean =>
  buf.length >= bytes.length && bytes.every((b, i) => buf[i] === b);

const SIGNATURES: Signature[] = [
  { mime: 'image/jpeg', test: (b) => startsWith(b, [0xff, 0xd8, 0xff]) },
  {
    mime: 'image/png',
    test: (b) =>
      startsWith(b, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  },
  {
    mime: 'image/gif',
    test: (b) =>
      b.length >= 6 &&
      (b.subarray(0, 6).toString('ascii') === 'GIF87a' ||
        b.subarray(0, 6).toString('ascii') === 'GIF89a'),
  },
  {
    mime: 'image/webp',
    test: (b) =>
      b.length >= 12 &&
      b.subarray(0, 4).toString('ascii') === 'RIFF' &&
      b.subarray(8, 12).toString('ascii') === 'WEBP',
  },
  {
    mime: 'application/pdf',
    test: (b) => b.subarray(0, 5).toString('ascii') === '%PDF-',
  },
  {
    // Formato OLE2: .doc de Word 97-2003.
    mime: 'application/msword',
    test: (b) =>
      startsWith(b, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]),
  },
  {
    // .docx es un ZIP. La firma ZIP no distingue un .docx de otro contenedor
    // comprimido; es el mismo limite que tiene cualquier deteccion por firma.
    mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    test: (b) => startsWith(b, [0x50, 0x4b, 0x03, 0x04]),
  },
];

const detectMimeType = (buffer: Buffer): string | null =>
  SIGNATURES.find((sig) => sig.test(buffer))?.mime ?? null;

/**
 * Limpia el nombre de archivo antes de que llegue a Drive o Cloudinary:
 * quita rutas y deja solo caracteres seguros.
 */
export const sanitizeFileName = (name: string): string => {
  const base = name.replace(/^.*[\\/]/, '');
  return base.replace(/[^\w.\-() ]/g, '_').slice(0, 200) || 'archivo';
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

    if (!file.buffer || file.buffer.length === 0) {
      throw new BadRequestException('Empty file');
    }

    const detected = detectMimeType(file.buffer);

    if (!detected || !allowed.includes(detected)) {
      throw new BadRequestException(
        'El contenido del archivo no corresponde a un tipo permitido',
      );
    }

    // .doc y .docx comparten extension a ojos del usuario pero tienen firmas
    // distintas; para el resto se exige que lo declarado coincida con lo real.
    const declaredIsOffice =
      file.mimetype === 'application/msword' ||
      file.mimetype ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    const detectedIsOffice =
      detected === 'application/msword' ||
      detected ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    if (detected !== file.mimetype && !(declaredIsOffice && detectedIsOffice)) {
      throw new BadRequestException(
        `El contenido del archivo (${detected}) no coincide con el tipo declarado (${file.mimetype})`,
      );
    }

    file.originalname = sanitizeFileName(file.originalname);

    return file;
  }
}
