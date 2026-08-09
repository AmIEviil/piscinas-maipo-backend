import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { JwtStrategy } from './jwt.strategy';
import { User } from '../../users/entities/user.entity';
import { JwtPayload, TOKEN_TYPE, TokenType } from '../constants/token-types';

const activeUser = { id: 'u1', email: 'a@b.cl', isActive: true } as User;

const makeStrategy = (user: User | null = activeUser) => {
  const repo = {
    findOneBy: jest.fn().mockResolvedValue(user),
  } as unknown as Repository<User>;
  const config = {
    get: () => 'test-secret',
  } as unknown as ConfigService;
  return new JwtStrategy(repo, config);
};

const payload = (typ: TokenType): JwtPayload => ({
  id: 'u1',
  email: 'a@b.cl',
  typ,
});

describe('JwtStrategy', () => {
  it('acepta un token de acceso', async () => {
    const strategy = makeStrategy();
    await expect(
      strategy.validate(payload(TOKEN_TYPE.ACCESS)),
    ).resolves.toMatchObject({ id: 'u1' });
  });

  // Todos los JWT se firman con el mismo secreto: sin el claim `typ` un
  // refresh token de 7 dias serviria como token de acceso.
  it.each([TOKEN_TYPE.REFRESH, TOKEN_TYPE.PWD_RESET, TOKEN_TYPE.ACTIVATION])(
    'rechaza un token de tipo %s',
    async (typ) => {
      const strategy = makeStrategy();
      await expect(strategy.validate(payload(typ))).rejects.toThrow(
        UnauthorizedException,
      );
    },
  );

  it('rechaza un token sin claim typ', async () => {
    const strategy = makeStrategy();
    await expect(
      strategy.validate({ id: 'u1', email: 'a@b.cl' } as JwtPayload),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('rechaza si el usuario no existe', async () => {
    const strategy = makeStrategy(null);
    await expect(strategy.validate(payload(TOKEN_TYPE.ACCESS))).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('rechaza si el usuario esta inactivo', async () => {
    const strategy = makeStrategy({ ...activeUser, isActive: false } as User);
    await expect(strategy.validate(payload(TOKEN_TYPE.ACCESS))).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
