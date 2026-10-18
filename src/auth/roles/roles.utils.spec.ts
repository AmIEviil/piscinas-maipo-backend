import { ForbiddenException } from '@nestjs/common';
import { User } from '../../users/entities/user.entity';
import { ROLES } from './roles.constants';
import { assertSelfOrSuperadmin } from './roles.utils';

const usuario = (id: string, rol: string) =>
  ({ id, roleUser: { role: { nombre: rol } } }) as unknown as User;

describe('assertSelfOrSuperadmin', () => {
  it('assertSelfOrSuperadmin permite al propio usuario', () => {
    expect(() =>
      assertSelfOrSuperadmin(usuario('a', ROLES.TECNICO), 'a'),
    ).not.toThrow();
  });

  it('assertSelfOrSuperadmin permite a Superadmin sobre otro id', () => {
    expect(() =>
      assertSelfOrSuperadmin(usuario('a', ROLES.SUPER_ADMIN), 'b'),
    ).not.toThrow();
  });

  it('assertSelfOrSuperadmin rechaza a Admin sobre otro id', () => {
    expect(() =>
      assertSelfOrSuperadmin(usuario('a', ROLES.ADMIN), 'b'),
    ).toThrow(ForbiddenException);
  });
});
