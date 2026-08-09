import { BadRequestException } from '@nestjs/common';
import { FileValidationPipe, sanitizeFileName } from './file-validation.pipe';

const file = (
  mimetype: string,
  buffer: Buffer,
  originalname = 'foto.png',
): Express.Multer.File =>
  ({
    mimetype,
    buffer,
    size: buffer.length,
    originalname,
  }) as Express.Multer.File;

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00]);
const PDF = Buffer.from('%PDF-1.7\n...');

describe('FileValidationPipe', () => {
  const imagePipe = new FileValidationPipe('image');
  const docPipe = new FileValidationPipe('document');

  it('acepta un PNG real declarado como PNG', () => {
    expect(imagePipe.transform(file('image/png', PNG))).toBeDefined();
  });

  it('acepta un PDF real en el perfil de documentos', () => {
    expect(
      docPipe.transform(file('application/pdf', PDF, 'a.pdf')),
    ).toBeDefined();
  });

  // El mimetype es la cabecera Content-Type que envía el cliente: se puede
  // declarar cualquier cosa. Antes esa cabecera era la única comprobación.
  it('rechaza contenido ejecutable declarado como imagen', () => {
    const script = Buffer.from('<?php system($_GET["c"]); ?>');
    expect(() => imagePipe.transform(file('image/png', script))).toThrow(
      BadRequestException,
    );
  });

  it('rechaza un PDF declarado como PNG', () => {
    expect(() => imagePipe.transform(file('image/png', PDF))).toThrow(
      BadRequestException,
    );
  });

  it('rechaza un tipo real permitido pero declarado como otro', () => {
    expect(() => imagePipe.transform(file('image/png', JPEG))).toThrow(
      BadRequestException,
    );
  });

  it('rechaza un archivo vacío', () => {
    expect(() =>
      imagePipe.transform(file('image/png', Buffer.alloc(0))),
    ).toThrow(BadRequestException);
  });

  it('limpia el nombre del archivo', () => {
    const result = imagePipe.transform(
      file('image/png', PNG, '../../etc/pas swd;rm -rf.png'),
    );
    // Se quita la ruta y se neutraliza el ';'. Los espacios son admisibles.
    expect(result.originalname).toBe('pas swd_rm -rf.png');
  });
});

describe('sanitizeFileName', () => {
  it('quita rutas', () => {
    expect(sanitizeFileName('C:\\Users\\x\\a.pdf')).toBe('a.pdf');
    expect(sanitizeFileName('/var/tmp/a.pdf')).toBe('a.pdf');
  });

  it('devuelve un nombre por defecto si no queda nada utilizable', () => {
    expect(sanitizeFileName('/')).toBe('archivo');
  });
});
