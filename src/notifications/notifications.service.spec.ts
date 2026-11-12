import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { PushSubscriptionEntity } from './entities/push-subscription.entity';
import { User } from '../users/entities/user.entity';

const mockRepository = () => ({
  find: jest.fn(),
  findOneBy: jest.fn(),
  save: jest.fn((entity) => Promise.resolve({ id: 'sub-uuid-1', ...entity })),
  create: jest.fn((dto) => dto),
  delete: jest.fn().mockResolvedValue({ affected: 1 }),
});

const mockConfigService = {
  get: jest.fn((key: string) => {
    if (key === 'VAPID_PUBLIC_KEY') return 'test-public-key';
    if (key === 'VAPID_PRIVATE_KEY') return 'test-private-key';
    if (key === 'VAPID_SUBJECT') return 'mailto:test@test.cl';
    return null;
  }),
};

describe('NotificationsService', () => {
  let service: NotificationsService;
  let repo: ReturnType<typeof mockRepository>;

  const dummyUser = {
    id: 'user-uuid-1',
    first_name: 'Test',
    last_name: 'User',
    email: 'test@piscinas.cl',
    isActive: true,
  } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: ConfigService, useValue: mockConfigService },
        {
          provide: getRepositoryToken(PushSubscriptionEntity),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    repo = module.get(getRepositoryToken(PushSubscriptionEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPublicKey', () => {
    it('returns public key from config', () => {
      const result = service.getPublicKey();
      expect(result).toEqual({ publicKey: 'test-public-key' });
    });
  });

  describe('subscribe', () => {
    it('creates new subscription if endpoint does not exist', async () => {
      repo.findOneBy.mockResolvedValue(null);

      const dto = {
        endpoint: 'https://push.apple.com/sub123',
        keys: {
          p256dh: 'p256dh-key',
          auth: 'auth-secret',
        },
        userAgent: 'iPhone iOS Safari',
      };

      const result = await service.subscribe(dummyUser, dto);

      expect(repo.findOneBy).toHaveBeenCalledWith({ endpoint: dto.endpoint });
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          endpoint: dto.endpoint,
          p256dh: 'p256dh-key',
          auth: 'auth-secret',
          userId: dummyUser.id,
          userAgent: 'iPhone iOS Safari',
        }),
      );
      expect(repo.save).toHaveBeenCalled();
      expect(result.id).toBe('sub-uuid-1');
    });

    it('updates existing subscription if endpoint already exists', async () => {
      const existing = {
        id: 'existing-sub-id',
        endpoint: 'https://push.apple.com/sub123',
        p256dh: 'old-key',
        auth: 'old-auth',
        userId: 'old-user-id',
      } as PushSubscriptionEntity;

      repo.findOneBy.mockResolvedValue(existing);

      const dto = {
        endpoint: 'https://push.apple.com/sub123',
        keys: {
          p256dh: 'new-key',
          auth: 'new-auth',
        },
        userAgent: 'iPhone iOS Safari Updated',
      };

      const result = await service.subscribe(dummyUser, dto);

      expect(existing.userId).toBe(dummyUser.id);
      expect(existing.p256dh).toBe('new-key');
      expect(existing.auth).toBe('new-auth');
      expect(existing.userAgent).toBe('iPhone iOS Safari Updated');
      expect(repo.save).toHaveBeenCalledWith(existing);
    });
  });

  describe('unsubscribe', () => {
    it('deletes subscription by endpoint', async () => {
      await service.unsubscribe('https://push.apple.com/sub123');
      expect(repo.delete).toHaveBeenCalledWith({
        endpoint: 'https://push.apple.com/sub123',
      });
    });
  });
});
