import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { DatabaseService } from '../database/database.service';
import { JWTPayload } from './dto/jwtPayload.interface';
import { users } from '../database/schema';
import { eq } from 'drizzle-orm';

export interface requestUser {
  id: string;
  fullName: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly db: DatabaseService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || '',
    });
  }

  async validate(payload: JWTPayload): Promise<requestUser> {
    if (!payload.sub) {
      throw new UnauthorizedException('invalid token payload');
    }

    const [user] = await this.db.db
      .select()
      .from(users)
      .where(eq(users.id, payload.sub))
      .limit(1);

    if (!user) {
      throw new UnauthorizedException('user not found');
    }

    return {
      id: payload.sub,
      fullName: payload.fullName,
      email: payload.email,
    };
  }
}
