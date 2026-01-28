import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateUserDto } from './dto/createUser.dto';
import * as bcrypt from 'bcryptjs';
import { users } from '../database/schema';
import { eq, InferSelectModel } from 'drizzle-orm';
import { UserResponseDto } from './dto/createUserResponse.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserLoginResponseDto } from './dto/loginResponse.dto';

type UserEntity = InferSelectModel<typeof users>;

@Injectable()
export class AuthService {
  private readonly accessTokenExpiry: string | number;

  constructor(
    private readonly db: DatabaseService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.accessTokenExpiry =
      this.configService.get<string | number>('JWT_ACCESS_TOKEN_EXPIRY') ||
      '1h';
  }

  async registerUser(data: CreateUserDto): Promise<UserResponseDto> {
    const [existingUser] = await this.db.db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const [user] = await this.db.db
      .insert(users)
      .values({
        fullName: data.fullName,
        email: data.email,
        password: hashedPassword,
      })
      .returning();

    const { accessToken } = this.generateToken(user);

    return {
      id: user.id.toString(),
      fullName: user.fullName,
      email: user.email,
      accessToken,
    };
  }

  async login(data: LoginDto): Promise<UserLoginResponseDto> {
    const [user] = await this.db.db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { accessToken } = this.generateToken(user);

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      accessToken,
    };
  }

  private generateToken(user: UserEntity): { accessToken: string } {
    const payload = {
      sub: user.id,
      fullName: user.fullName,
      email: user.email,
    };

    const accessToken = this.jwtService.sign(payload, {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      expiresIn: this.accessTokenExpiry as any,
    });

    return { accessToken };
  }
}
