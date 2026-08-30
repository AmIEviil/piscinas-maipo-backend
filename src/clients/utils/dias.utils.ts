/**
 * Utilidades de dia de la semana para el cambio masivo de dia de mantencion.
 *
 * Todo se hace con cadenas "YYYY-MM-DD" y aritmetica en UTC: la columna
 * `fecha_mantencion` es de tipo `date`, el driver de Postgres la devuelve como
 * cadena y convertirla a `Date` local mueve el dia en cualquier zona con
 * desfase negativo (Santiago lo tiene). Con UTC el dia es el que dice la
 * cadena, sin sorpresas.
 */

/**
 * Nombres de dia tal como los guarda el frontend en `dia_mantencion`.
 *
 * Se aceptan las variantes con y sin tilde porque los datos historicos tienen
 * las dos ("Miércoles" del selector actual, "Miercoles" de cargas viejas).
 */
export const DIAS_SEMANA: Record<string, number> = {
  Domingo: 0,
  Lunes: 1,
  Martes: 2,
  Miércoles: 3,
  Miercoles: 3,
  Jueves: 4,
  Viernes: 5,
  Sábado: 6,
  Sabado: 6,
};

export const esDiaValido = (dia: string): boolean =>
  DIAS_SEMANA[dia] !== undefined;

const aFechaUTC = (fecha: string): Date => new Date(`${fecha}T00:00:00Z`);

export const aClaveFecha = (fecha: Date): string =>
  fecha.toISOString().slice(0, 10);

/**
 * Mueve una fecha al dia de la semana pedido dentro de su misma semana
 * (lunes a domingo).
 *
 * Si el resultado cae en el pasado -- por ejemplo, mover un viernes al lunes
 * cuando hoy ya es miercoles -- se corre a la semana siguiente: reprogramar
 * una visita a un dia que ya paso no le sirve a nadie.
 *
 * @param fecha      fecha original, "YYYY-MM-DD"
 * @param diaDestino 0 (domingo) a 6 (sabado)
 * @param hoy        fecha de hoy, "YYYY-MM-DD"
 */
export const moverAlDiaDeLaSemana = (
  fecha: string,
  diaDestino: number,
  hoy: string,
): string => {
  const original = aFechaUTC(fecha);
  // La semana empieza el lunes: se normaliza el domingo (0) a 7 para que
  // quede al final y no arrastre la fecha a la semana anterior.
  const indice = (dia: number) => (dia === 0 ? 7 : dia);
  const desplazamiento = indice(diaDestino) - indice(original.getUTCDay());

  const destino = new Date(original);
  destino.setUTCDate(destino.getUTCDate() + desplazamiento);

  if (aClaveFecha(destino) <= hoy) {
    destino.setUTCDate(destino.getUTCDate() + 7);
  }

  return aClaveFecha(destino);
};
