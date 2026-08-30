export interface FilterClientsDto {
  nombre?: string;
  direccion?: string;
  telefono?: string;
  comuna?: string;
  dia?: string;
  ruta?: string;
  frecuencia?: string;
  isActive?: boolean;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
}
