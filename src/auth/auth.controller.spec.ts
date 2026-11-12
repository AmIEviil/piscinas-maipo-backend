import { ForbiddenException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthenticatedRequest } from '../types/authenticated-request';
import { ROLES } from './roles/roles.constants';

const req = (id: string, rol: string) =>
  ({
    user: { id, roleUser: { role: { nombre: rol } } },
  }) as unknown as AuthenticatedRequest;

describe('AuthController (chequeo self)', () => {
  let controller: AuthController;
  let service: {
    configureAccount: jest.Mock;
    setSessionClosedAt: jest.Mock;
  };

  beforeEach(() => {
    service = {
      configureAccount: jest.fn().mockResolvedValue({ ok: true }),
      setSessionClosedAt: jest.fn().mockResolvedValue({ ok: true }),
    };
    controller = new AuthController(service as unknown as AuthService);
  });

  it('configureAccount rechaza con 403 a un Admin sobre otro id', async () => {
    await expect(
      controller.configureAccount('b', {} as never, req('a', ROLES.ADMIN)),
    ).rejects.toThrow(ForbiddenException);
    expect(service.configureAccount).not.toHaveBeenCalled();
  });

  it('configureAccount permite al propio usuario', async () => {
    await controller.configureAccount(
      'a',
      {} as never,
      req('a', ROLES.TECNICO),
    );
    expect(service.configureAccount).toHaveBeenCalledWith('a', {});
  });

  it('setSessionClosedAt permite a Superadmin sobre otro id', async () => {
    await controller.setSessionClosedAt(
      'b',
      '2026-01-01',
      req('a', ROLES.SUPER_ADMIN),
    );
    expect(service.setSessionClosedAt).toHaveBeenCalledWith('b', '2026-01-01');
  });

  it('setSessionClosedAt rechaza con 403 a un Tecnico sobre otro id', async () => {
    await expect(
      controller.setSessionClosedAt('b', 'x', req('a', ROLES.TECNICO)),
    ).rejects.toThrow(ForbiddenException);
  });
});
