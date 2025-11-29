import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { JwtValidationMiddleware } from './jwt-validation.middleware';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../users/entities/user.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get('JWT_SECRET'),
          signOptions: {
            expiresIn: '12h',
          },
        };
      },
    }),
  ],
  providers: [JwtValidationMiddleware],
  exports: [JwtValidationMiddleware],
})
export class JwtMiddlewareModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtValidationMiddleware).forRoutes('*'); // Apply to all routes
  }
}
