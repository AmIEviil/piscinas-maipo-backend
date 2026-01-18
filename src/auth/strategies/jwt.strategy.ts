import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    super({
      secretOrKey: jwtSecret,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: { email: string; id: string }): Promise<User> {
    console.log('🔐 JWT Strategy - Received payload:', payload);
    const { email } = payload;
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      console.log('❌ JWT Strategy - User not found for email:', email);
      throw new UnauthorizedException('token not valid');
    }

    if (!user.isActive) {
      console.log('❌ JWT Strategy - User is not active:', user.id);
      throw new UnauthorizedException('User not active');
    }

    const userWithId = {
      ...user,
      id: user.id,
    };

    return userWithId;
  }
}
