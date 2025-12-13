/* eslint-disable @typescript-eslint/no-unsafe-assignment */
export interface CampoExtendido<T> {
  key: string;
  value: T;
  type: 'string' | 'number' | 'boolean';
}

export const getValorCampoTipoExtendido = <T extends string | number | boolean>(
  registro: Record<string, any>,
  campos: string[],
): CampoExtendido<T> => {
  for (const campo of campos) {
    const valor = registro[campo];

    if (valor !== undefined && valor !== null && `${valor}`.trim() !== '') {
      const v2 = valor as T;
      return {
        key: campo,
        value: v2,
        type:
          typeof v2 === 'number'
            ? 'number'
            : typeof v2 === 'boolean'
              ? 'boolean'
              : 'string',
      };
    }
  }

  // Si ninguno tiene valor, se devuelve sin valor y sin key encontrado
  return { key: campos[0] as any, value: '' as unknown as T, type: 'string' };
};
