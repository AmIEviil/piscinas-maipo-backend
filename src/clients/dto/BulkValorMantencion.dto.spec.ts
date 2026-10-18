import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { BulkValorMantencionDto } from './BulkValorMantencion.dto';

const UUID = '3f2b8c1e-7a4d-4e5b-9c6a-1d2e3f4a5b6c';

const errores = async (plano: unknown) =>
  validate(plainToInstance(BulkValorMantencionDto, plano));

describe('BulkValorMantencionDto', () => {
  it.each([0, -5, 1500.5, 10_000_001])('rechaza valor %p', async (valor) => {
    expect(await errores({ items: [{ id: UUID, valor }] })).not.toHaveLength(0);
  });

  it('rechaza items vacio y mas de 1000 items', async () => {
    expect(await errores({ items: [] })).not.toHaveLength(0);
    const muchos = Array.from({ length: 1001 }, () => ({
      id: UUID,
      valor: 25000,
    }));
    expect(await errores({ items: muchos })).not.toHaveLength(0);
  });

  it('rechaza id que no es uuid', async () => {
    expect(
      await errores({ items: [{ id: 'abc', valor: 25000 }] }),
    ).not.toHaveLength(0);
  });

  it('acepta [{ id: uuid, valor: 25000 }]', async () => {
    expect(await errores({ items: [{ id: UUID, valor: 25000 }] })).toHaveLength(
      0,
    );
  });
});
