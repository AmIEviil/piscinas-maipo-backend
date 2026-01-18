/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { google } from 'googleapis';
import * as streamifier from 'streamifier';
import { Repository } from 'typeorm';
import { UploadedFiles } from '../uploaded-files/entities/uploaded-files.entity';

@Injectable()
export class GoogleDriveService {
  private driveClient;

  constructor(
    @InjectRepository(UploadedFiles)
    private uploadedFilesRepository: Repository<UploadedFiles>,
  ) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
      throw new Error(
        'Faltan variables de entorno de Google Drive (CLIENT_ID, SECRET o REFRESH_TOKEN)',
      );
    }

    // 1. Configurar el cliente OAuth2
    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      'https://developers.google.com/oauthplayground', // Redirect URL (debe coincidir con la de GCP)
    );

    // 2. Establecer las credenciales con el Refresh Token
    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    // 3. Inicializar el cliente de Drive
    this.driveClient = google.drive({ version: 'v3', auth: oauth2Client });
  }

  // Subir Archivo
  async uploadFile(
    file: Express.Multer.File,
    filename: string,
    mimeType: string,
    parentId: string,
  ): Promise<UploadedFiles> {
    const bufferStream = streamifier.createReadStream(file.buffer);
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    try {
      const response = await this.driveClient.files.create({
        requestBody: {
          name: filename,
          parents: folderId ? [folderId] : [],
          mimeType: mimeType,
        },
        media: {
          mimeType: mimeType,
          body: bufferStream,
        },
        fields: 'id, name, webViewLink, webContentLink',
      });

      console.log(`Archivo subido con éxito. ID: ${response.data.id}`);

      const savedFile = await this.uploadedFilesRepository.save({
        filename: response.data.name,
        type_file: mimeType.trim().split('.').pop() || 'unknown',
        size: file.size,
        mimeType: mimeType,
        driveId: String(response.data.id),
        driveUrl: response.data.webContentLink,
        parentId: parentId,
      });

      return savedFile;
    } catch (error) {
      console.error('Error subiendo a Google Drive:', error);
      throw error;
    }
  }

  // Leer Archivo (Streaming)
  async getFileStream(
    fileId: string,
  ): Promise<{ stream: any; mimeType: string; name: string }> {
    try {
      // A. Obtener metadatos (nombre y tipo)
      const metadata = await this.driveClient.files.get({
        fileId: fileId,
        fields: 'name, mimeType',
      });

      // B. Obtener el stream del archivo
      const response = await this.driveClient.files.get(
        { fileId: fileId, alt: 'media' },
        { responseType: 'stream' },
      );

      return {
        stream: response.data,
        mimeType: metadata.data.mimeType,
        name: metadata.data.name,
      };
    } catch (error) {
      console.error(`Error obteniendo archivo ${fileId}:`, error);
      throw error;
    }
  }

  async generateViewLink(fileId: string): Promise<string> {
    await this.driveClient.permissions.create({
      fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    return `https://drive.google.com/file/d/${fileId}/preview`;
  }
}
