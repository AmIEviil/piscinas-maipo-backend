export interface UpdateClientDto {
  nombre?: string;
  direccion?: string;
  comuna?: string;
  telefono?: string;
  email?: string;
  fecha_ingreso?: string;
  tipo_piscina?: string;
  dia_mantencion?: string;
  ruta?: string;
  valor_mantencion?: number;
  isActive?: boolean;
  frequencia_mantencion_id?: string;
  observacion?: string;
}
