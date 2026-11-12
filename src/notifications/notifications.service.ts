import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as webPush from 'web-push';
import { PushSubscriptionEntity } from './entities/push-subscription.entity';
import { SubscribePushDto } from './dto/subscribe.dto';
import { User } from '../users/entities/user.entity';

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  data?: Record<string, any>;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private vapidConfigured = false;

  constructor(
    @InjectRepository(PushSubscriptionEntity)
    private readonly subscriptionRepo: Repository<PushSubscriptionEntity>,
    private readonly configService: ConfigService,
  ) {
    const publicKey = this.configService.get<string>('VAPID_PUBLIC_KEY');
    const privateKey = this.configService.get<string>('VAPID_PRIVATE_KEY');
    const subject =
      this.configService.get<string>('VAPID_SUBJECT') ||
      'mailto:soporte@piscinasmaipo.cl';

    if (publicKey && privateKey) {
      try {
        webPush.setVapidDetails(subject, publicKey, privateKey);
        this.vapidConfigured = true;
        this.logger.log('Web Push VAPID keys successfully configured');
      } catch (err: any) {
        this.logger.error(`Error setting VAPID details: ${err.message}`);
      }
    } else {
      this.logger.warn(
        'Web Push VAPID keys (VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY) not set in environment',
      );
    }
  }

  getPublicKey(): { publicKey: string | null } {
    return {
      publicKey: this.configService.get<string>('VAPID_PUBLIC_KEY') || null,
    };
  }

  async subscribe(
    user: User,
    dto: SubscribePushDto,
  ): Promise<PushSubscriptionEntity> {
    let sub = await this.subscriptionRepo.findOneBy({ endpoint: dto.endpoint });

    if (sub) {
      sub.userId = user.id;
      sub.user = user;
      sub.p256dh = dto.keys.p256dh;
      sub.auth = dto.keys.auth;
      if (dto.userAgent) {
        sub.userAgent = dto.userAgent;
      }
    } else {
      sub = this.subscriptionRepo.create({
        endpoint: dto.endpoint,
        p256dh: dto.keys.p256dh,
        auth: dto.keys.auth,
        userId: user.id,
        user,
        userAgent: dto.userAgent,
      });
    }

    return await this.subscriptionRepo.save(sub);
  }

  async unsubscribe(endpoint: string): Promise<void> {
    await this.subscriptionRepo.delete({ endpoint });
  }

  async sendToUser(
    userId: string,
    payload: PushNotificationPayload,
  ): Promise<{ sent: number; failed: number }> {
    if (!this.vapidConfigured) {
      this.logger.warn('Cannot send push notification: VAPID keys not configured');
      return { sent: 0, failed: 0 };
    }

    const subscriptions = await this.subscriptionRepo.find({
      where: { userId },
    });

    return this.sendToSubscriptions(subscriptions, payload);
  }

  async sendToUsers(
    userIds: string[],
    payload: PushNotificationPayload,
  ): Promise<{ sent: number; failed: number }> {
    if (!this.vapidConfigured || !userIds.length) {
      return { sent: 0, failed: 0 };
    }

    const subscriptions = await this.subscriptionRepo.find({
      where: { userId: In(userIds) },
    });

    return this.sendToSubscriptions(subscriptions, payload);
  }

  async sendToAll(
    payload: PushNotificationPayload,
  ): Promise<{ sent: number; failed: number }> {
    if (!this.vapidConfigured) {
      this.logger.warn('Cannot send push notification: VAPID keys not configured');
      return { sent: 0, failed: 0 };
    }

    const subscriptions = await this.subscriptionRepo.find();
    return this.sendToSubscriptions(subscriptions, payload);
  }

  private async sendToSubscriptions(
    subscriptions: PushSubscriptionEntity[],
    payload: PushNotificationPayload,
  ): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    const payloadString = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/piscinasElMaipo.png',
      badge: payload.badge || '/piscinasElMaipo.png',
      url: payload.url || '/',
      data: payload.data || {},
    });

    for (const sub of subscriptions) {
      const pushSubscription: webPush.PushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };

      try {
        await webPush.sendNotification(pushSubscription, payloadString);
        sent++;
      } catch (error: any) {
        failed++;
        this.logger.error(
          `Error sending push notification to endpoint ${sub.endpoint.slice(0, 30)}...: ${error.message}`,
        );
        // If expired or gone (404/410), delete subscription
        if (error.statusCode === 404 || error.statusCode === 410) {
          this.logger.log(`Subscription ${sub.id} is expired or unregistered. Removing.`);
          await this.subscriptionRepo.delete(sub.id);
        }
      }
    }

    return { sent, failed };
  }
}
