export interface FilterClientsDto {
  nombre?: string;
  direccion?: string;
  comuna?: string;
  dia?: string;
  ruta?: string;
  isActive?: boolean;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
}
