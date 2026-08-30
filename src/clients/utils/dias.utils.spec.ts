import { esDiaValido, moverAlDiaDeLaSemana } from './dias.utils';

describe('dias.utils', () => {
  describe('esDiaValido', () => {
    it('acepta los dias del selector, con y sin tilde', () => {
      expect(esDiaValido('Lunes')).toBe(true);
      expect(esDiaValido('Miércoles')).toBe(true);
      expect(esDiaValido('Miercoles')).toBe(true);
    });

    it('rechaza cualquier otra cosa', () => {
      expect(esDiaValido('')).toBe(false);
      expect(esDiaValido('lunes')).toBe(false);
      expect(esDiaValido('Feriado')).toBe(false);
    });
  });

  describe('moverAlDiaDeLaSemana', () => {
    // 2026-08-26 es miercoles; su semana va del lunes 24 al domingo 30.
    const hoy = '2026-08-20';

    it('mueve la fecha dentro de su misma semana', () => {
      expect(moverAlDiaDeLaSemana('2026-08-26', 1, hoy)).toBe('2026-08-24');
      expect(moverAlDiaDeLaSemana('2026-08-26', 5, hoy)).toBe('2026-08-28');
    });

    it('trata el domingo como fin de semana, no como inicio', () => {
      expect(moverAlDiaDeLaSemana('2026-08-26', 0, hoy)).toBe('2026-08-30');
    });

    it('devuelve la misma fecha si ya cae en el dia pedido', () => {
      expect(moverAlDiaDeLaSemana('2026-08-26', 3, hoy)).toBe('2026-08-26');
    });

    it('corre a la semana siguiente si el resultado ya paso', () => {
      // Hoy es jueves 27: mover el viernes 28 al lunes lo dejaria en el 24,
      // que ya paso, asi que salta al lunes siguiente.
      expect(moverAlDiaDeLaSemana('2026-08-28', 1, '2026-08-27')).toBe(
        '2026-08-31',
      );
    });

    it('cruza el cambio de mes sin desfase de zona horaria', () => {
      expect(moverAlDiaDeLaSemana('2026-08-31', 5, hoy)).toBe('2026-09-04');
    });
  });
});
