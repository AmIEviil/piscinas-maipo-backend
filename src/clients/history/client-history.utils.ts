import { Client } from '../entities/clients.entity';

export type AccionHistorial = 'creado' | 'modificado';
export type OrigenCambio = 'creacion' | 'ficha' | 'masivo';

/**
 * Campos de la ficha que generan historial. `observacion` queda fuera a
 * proposito: vive en otra tabla y tiene su propio flujo.
 */
export const CAMPOS_AUDITADOS = [
  'nombre',
  'direccion',
  'comuna',
  'telefono',
  'email',
  'fecha_ingreso',
  'tipo_piscina',
  'dia_mantencion',
  'ruta',
  'valor_mantencion',
  'isActive',
  'frecuencia_mantencion',
] as const;

export type SnapshotCliente = Record<
  (typeof CAMPOS_AUDITADOS)[number],
  string | null
>;

export interface CambioCampo {
  campo: string;
  valorAnterior: string | null;
  valorNuevo: string | null;
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Lleva cualquier valor a una unica representacion en texto, para que el diff
 * no genere filas falsas por diferencias de forma: '' vs null, 25000 vs
 * '25000', true vs 'true' o Date vs 'YYYY-MM-DD'.
 */
export function normalizarValor(valor: unknown): string | null {
  if (valor === null || valor === undefined) return null;

  if (valor instanceof Date) {
    if (Number.isNaN(valor.getTime())) return null;
    // UTC a proposito: con hora local, un 2026-03-05T00:00Z en Chile (UTC-3/-4)
    // se leeria como el 4 de marzo.
    return valor.toISOString().slice(0, 10);
  }

  // Solo primitivos: un objeto suelto se stringificaria como '[object Object]'.
  if (
    typeof valor !== 'string' &&
    typeof valor !== 'number' &&
    typeof valor !== 'boolean'
  ) {
    return null;
  }

  const texto = String(valor).trim();
  return texto === '' ? null : texto;
}

export function snapshotCliente(client: Client): SnapshotCliente {
  return {
    nombre: normalizarValor(client.nombre),
    direccion: normalizarValor(client.direccion),
    comuna: normalizarValor(client.comuna),
    telefono: normalizarValor(client.telefono),
    email: normalizarValor(client.email),
    fecha_ingreso: normalizarValor(client.fecha_ingreso),
    tipo_piscina: normalizarValor(client.tipo_piscina),
    dia_mantencion: normalizarValor(client.dia_mantencion),
    ruta: normalizarValor(client.ruta),
    valor_mantencion: normalizarValor(client.valor_mantencion),
    isActive: normalizarValor(client.isActive),
    // Se guarda el nombre y no el uuid: el historial tiene que leerse solo.
    frecuencia_mantencion: normalizarValor(
      client.frecuencia_mantencion?.nombre,
    ),
  };
}

export function diffSnapshots(
  antes: SnapshotCliente,
  despues: SnapshotCliente,
): CambioCampo[] {
  return CAMPOS_AUDITADOS.filter(
    (campo) => antes[campo] !== despues[campo],
  ).map((campo) => ({
    campo,
    valorAnterior: antes[campo],
    valorNuevo: despues[campo],
  }));
}

/**
 * `usuarioId` llega del JWT y a veces es 'Unknown'; guardarlo tal cual
 * reventaria el insert sobre la columna uuid.
 */
export function usuarioIdValido(id: string | null | undefined): string | null {
  return id && UUID_REGEX.test(id) ? id : null;
}
