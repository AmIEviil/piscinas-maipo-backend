export interface IRevestimientoCreate {
  fechaPropuesta: string;
  largoPiscina: number;
  anchoPiscina: number;
  profundidadMin: number;
  profundidadMax: number;
  profundidadAvg: number;
  areaPiscina: number;
  volumenPiscina: number;

  tipoRevestimiento: string;
  valorM2: number;
  costoManoObra: number;
  costoMateriales: number;
  costoTotal: number;
  valorTotal: number;
  porcentajeGanancia: number;

  estado: string;
  detalles?: string;
  garantia?: string;
  fechaInicio?: string;
  fechaTermino?: string;
  clienteId: number;

  imagenes: { url: string; public_id: string }[];
}
