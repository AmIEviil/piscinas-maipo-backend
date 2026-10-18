import { Client } from '../entities/clients.entity';
import {
  CAMPOS_AUDITADOS,
  diffSnapshots,
  normalizarValor,
  snapshotCliente,
  usuarioIdValido,
} from './client-history.utils';

// Cliente base; cada test pisa solo lo que le interesa.
function clienteBase(parcial: Record<string, unknown> = {}): Client {
  return {
    id: 'c1',
    nombre: 'Juan',
    direccion: 'A',
    comuna: 'Maipu',
    telefono: '123',
    email: 'j@x.cl',
    fecha_ingreso: '2026-03-05',
    tipo_piscina: 'Fibra',
    dia_mantencion: 'Lunes',
    ruta: 'R1',
    valor_mantencion: 23500,
    isActive: true,
    frecuencia_mantencion: { id: 'f1', nombre: 'Quincenal' },
    ...parcial,
  } as unknown as Client;
}

describe('normalizarValor', () => {
  it.each([
    [null, null],
    [undefined, null],
    ['', null],
    ['   ', null],
    ['  Lunes ', 'Lunes'],
    [25000, '25000'],
    ['25000', '25000'],
    [true, 'true'],
    [false, 'false'],
    [new Date('2026-03-05T00:00:00Z'), '2026-03-05'],
    ['2026-03-05', '2026-03-05'],
    [new Date('invalido'), null],
  ])('%p -> %p', (entrada, esperado) =>
    expect(normalizarValor(entrada)).toBe(esperado),
  );
});

describe('diffSnapshots', () => {
  it('no devuelve nada si solo cambia la representacion', () => {
    const a = clienteBase({
      ruta: null,
      valor_mantencion: 25000,
      isActive: true,
      fecha_ingreso: new Date('2026-03-05T00:00:00Z'),
    });
    const b = clienteBase({
      ruta: '',
      valor_mantencion: '25000',
      isActive: 'true',
      fecha_ingreso: '2026-03-05',
    });
    expect(diffSnapshots(snapshotCliente(a), snapshotCliente(b))).toEqual([]);
  });

  it('devuelve una fila por campo cambiado, con valores normalizados', () => {
    const a = clienteBase();
    const b = clienteBase({ direccion: 'B', valor_mantencion: 25000 });
    expect(diffSnapshots(snapshotCliente(a), snapshotCliente(b))).toEqual([
      { campo: 'direccion', valorAnterior: 'A', valorNuevo: 'B' },
      {
        campo: 'valor_mantencion',
        valorAnterior: '23500',
        valorNuevo: '25000',
      },
    ]);
  });

  it('la periodicidad se compara y guarda por nombre', () => {
    const a = clienteBase();
    const b = clienteBase({
      frecuencia_mantencion: { id: 'f2', nombre: 'Semanal' },
    });
    expect(diffSnapshots(snapshotCliente(a), snapshotCliente(b))).toEqual([
      {
        campo: 'frecuencia_mantencion',
        valorAnterior: 'Quincenal',
        valorNuevo: 'Semanal',
      },
    ]);
  });

  it('un cliente sin periodicidad queda con null', () => {
    const snap = snapshotCliente(clienteBase({ frecuencia_mantencion: null }));
    expect(snap.frecuencia_mantencion).toBeNull();
  });
});

it('observacion no es un campo auditado', () => {
  expect(CAMPOS_AUDITADOS).not.toContain('observacion');
});

describe('usuarioIdValido', () => {
  it('descarta lo que no es uuid', () => {
    expect(usuarioIdValido('Unknown')).toBeNull();
    expect(usuarioIdValido(undefined)).toBeNull();
    expect(usuarioIdValido(null)).toBeNull();
    expect(usuarioIdValido('11111111-1111-1111-1111-111111111111')).toBe(
      '11111111-1111-1111-1111-111111111111',
    );
  });
});
