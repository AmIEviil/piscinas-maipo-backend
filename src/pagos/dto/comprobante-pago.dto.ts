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
  parentId: string;
}

export interface ComprobantePagoWithUrlDto {
  id: string;
  tipo: string;
  nombre: string;
  fecha_emision: string;
  parentId: string;
  fileId: string;
  viewUrl: string | null;
}
