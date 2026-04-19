export interface FiltersEmployeesDto {
  nombre?: string;
  apellido?: string;
  telefono?: string;
  grupo?: string;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
}
