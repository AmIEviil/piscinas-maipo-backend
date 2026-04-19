export interface FilterVehiclesDto {
  placa?: string;
  marca?: string;
  modelo?: string;
  anioDesde?: number;
  anioHasta?: number;
  color?: string;
  isActive?: boolean;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
}
