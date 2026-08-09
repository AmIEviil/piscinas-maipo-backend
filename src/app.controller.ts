import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Health check. Devuelve una cadena fija, sin datos de negocio.
  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
