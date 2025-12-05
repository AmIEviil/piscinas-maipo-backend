export interface FilterClientsDto {
  nombre?: string;
  direccion?: string;
  comuna?: string;
  dia?: string;
  orderBy?:
    | 'nombre'
    | 'comuna'
    | 'dia_mantencion'
    | 'direccion'
    | 'valor_mantencion';
  orderDirection?: 'ASC' | 'DESC';
}
