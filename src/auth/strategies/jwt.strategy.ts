import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from 'users/entities/user.entity';

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

  async validate(payload: { email: string; id: number }): Promise<User> {
    console.log('🔐 JWT Strategy - Received payload:', payload);

    const { email, id } = payload;
    console.log('🔍 JWT Strategy - Looking for user with email:', email);

    const user = await this.userRepository.findOneBy({ email });
    console.log('🔍 JWT Strategy - Database query result:', user);

    if (!user) {
      console.log('❌ JWT Strategy - User not found for email:', email);
      throw new UnauthorizedException('token not valid');
    }

    console.log('✅ JWT Strategy - User found:', {
      id: user.id,
      email: user.email,
      isActive: user.isActive,
    });

    if (!user.isActive) {
      console.log('❌ JWT Strategy - User is not active:', user.id);
      throw new UnauthorizedException('User not active');
    }

    // Ensure the user object includes the id field
    const userWithId = {
      ...user,
      id: user.id,
    };

    console.log('✅ JWT Strategy - Returning user object:', {
      id: userWithId.id,
      email: userWithId.email,
    });
    return userWithId;
  }
}
