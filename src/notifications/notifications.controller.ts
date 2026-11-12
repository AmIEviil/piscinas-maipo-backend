import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import {
  SubscribePushDto,
  UnsubscribePushDto,
  SendTestNotificationDto,
} from './dto/subscribe.dto';
import type { AuthenticatedRequest } from '../types/authenticated-request';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLES } from '../auth/roles/roles.constants';

@Controller('notifications')
@Roles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TECNICO, ROLES.CLIENTE)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Public()
  @Get('public-key')
  getPublicKey() {
    return this.notificationsService.getPublicKey();
  }

  @Post('subscribe')
  async subscribe(
    @Req() req: AuthenticatedRequest,
    @Body() dto: SubscribePushDto,
  ) {
    if (!req.user) {
      throw new BadRequestException('User not authenticated');
    }
    const result = await this.notificationsService.subscribe(req.user, dto);
    return {
      success: true,
      subscriptionId: result.id,
    };
  }

  @Post('unsubscribe')
  @HttpCode(HttpStatus.OK)
  async unsubscribe(@Body() dto: UnsubscribePushDto) {
    await this.notificationsService.unsubscribe(dto.endpoint);
    return { success: true };
  }

  @Post('test')
  async sendTest(
    @Req() req: AuthenticatedRequest,
    @Body() dto: SendTestNotificationDto,
  ) {
    if (!req.user) {
      throw new BadRequestException('User not authenticated');
    }
    const result = await this.notificationsService.sendToUser(req.user.id, {
      title: dto.title || 'Piscinas El Maipo',
      body: dto.body || '¡Notificaciones push configuradas correctamente!',
      url: dto.url || '/',
    });
    return { success: true, ...result };
  }
}
