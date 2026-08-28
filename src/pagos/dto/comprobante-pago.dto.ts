export interface ComprobantePagoDto {
  id?: string;
  tipo: string;
  nombre: string;
  fecha_emision: string;
  fileId: number;
  parentId: string;
}

export interface CreateComprobantePagoDto {
  tipo: string;
  nombre: string;
  fecha_emision: string;
  monto?: number;
  parentId: string;
  /**
   * Ids de las mantenciones que cubre este pago. Viaja por FormData, asi que
   * el controlador lo normaliza: puede llegar como string suelto, como
   * arreglo, o no llegar.
   */
  mantencionIds?: string[];
}

export interface ComprobanteMantencionDto {
  id: string;
  fechaMantencion: string;
}

export interface ComprobantePagoWithUrlDto {
  id: string;
  tipo: string;
  nombre: string;
  fecha_emision: string;
  /** Existia en la entidad y lo lee el frontend, pero faltaba en el DTO. */
  monto: number;
  parentId: string;
  fileId: string;
  viewUrl: string | null;
  mantenciones: ComprobanteMantencionDto[];
}
