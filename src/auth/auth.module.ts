import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { HttpModule } from '@nestjs/axios';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/entities/role.entity';
import { RoleUser } from '../users/entities/role-user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  imports: [
    ConfigModule,
    HttpModule,
    TypeOrmModule.forFeature([User, Role, RoleUser]),
    // MailModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),

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
  exports: [TypeOrmModule, JwtStrategy, PassportModule, JwtModule, AuthService],
})
export class AuthModule {}
