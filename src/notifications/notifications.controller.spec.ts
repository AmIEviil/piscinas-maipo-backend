import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { AuthenticatedRequest } from '../types/authenticated-request';
import { User } from '../users/entities/user.entity';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let service: {
    getPublicKey: jest.Mock;
    subscribe: jest.Mock;
    unsubscribe: jest.Mock;
    sendToUser: jest.Mock;
  };

  const dummyUser = {
    id: 'user-uuid-1',
    first_name: 'Test',
    last_name: 'User',
    email: 'test@piscinas.cl',
  } as User;

  beforeEach(async () => {
    service = {
      getPublicKey: jest.fn().mockReturnValue({ publicKey: 'mock-key' }),
      subscribe: jest.fn().mockResolvedValue({ id: 'sub-uuid-1' }),
      unsubscribe: jest.fn().mockResolvedValue(undefined),
      sendToUser: jest.fn().mockResolvedValue({ sent: 1, failed: 0 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getPublicKey', () => {
    it('returns public key', () => {
      const res = controller.getPublicKey();
      expect(res).toEqual({ publicKey: 'mock-key' });
      expect(service.getPublicKey).toHaveBeenCalled();
    });
  });

  describe('subscribe', () => {
    it('delegates to service and returns subscription id', async () => {
      const req = { user: dummyUser } as AuthenticatedRequest;
      const dto = {
        endpoint: 'https://push.apple.com/sub123',
        keys: { p256dh: 'p256dh', auth: 'auth' },
      };

      const result = await controller.subscribe(req, dto);

      expect(service.subscribe).toHaveBeenCalledWith(dummyUser, dto);
      expect(result).toEqual({ success: true, subscriptionId: 'sub-uuid-1' });
    });
  });

  describe('unsubscribe', () => {
    it('delegates to service', async () => {
      const result = await controller.unsubscribe({
        endpoint: 'https://push.apple.com/sub123',
      });
      expect(service.unsubscribe).toHaveBeenCalledWith(
        'https://push.apple.com/sub123',
      );
      expect(result).toEqual({ success: true });
    });
  });

  describe('sendTest', () => {
    it('delegates to service sendToUser', async () => {
      const req = { user: dummyUser } as AuthenticatedRequest;
      const result = await controller.sendTest(req, {
        title: 'Hola',
        body: 'Mundo',
      });

      expect(service.sendToUser).toHaveBeenCalledWith(
        dummyUser.id,
        expect.objectContaining({
          title: 'Hola',
          body: 'Mundo',
        }),
      );
      expect(result).toEqual({ success: true, sent: 1, failed: 0 });
    });
  });
});
