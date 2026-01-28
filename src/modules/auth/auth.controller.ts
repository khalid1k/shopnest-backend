import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from './dto/createUser.dto';
import { UserResponseDto } from './dto/createUserResponse.dto';
import { LoginDto } from './dto/login.dto';
import { UserLoginResponseDto } from './dto/loginResponse.dto';
import * as express from 'express';
import { ConfigService } from '@nestjs/config';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private isProduction: boolean;
  constructor(
    private readonly authService: AuthService,
    private configService: ConfigService,
  ) {
    this.isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';
  }

  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Create a new user account and return access token',
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'User with this email already exists',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['fullName', 'email', 'password'],
      properties: {
        fullName: {
          type: 'string',
          example: 'Muhammad Khalid',
        },
        email: {
          type: 'string',
          example: 'khalid@example.com',
        },
        password: {
          type: 'string',
          example: 'SecurePassword@123',
        },
      },
    },
  })
  async register(
    @Body() userData: CreateUserDto,
    @Res({ passthrough: true }) response: express.Response,
  ): Promise<UserResponseDto> {
    const result = await this.authService.registerUser(userData);

    response.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60, // 1 hour
    });

    return result;
  }

  @Post('login')
  @ApiOperation({
    summary: 'Login user',
    description: 'Authenticate user and return access token',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: UserLoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: {
          type: 'string',
          example: 'khalid@example.com',
        },
        password: {
          type: 'string',
          example: 'SecurePassword@123',
        },
      },
    },
  })
  async login(
    @Body() userData: LoginDto,
    @Res({ passthrough: true }) response: express.Response,
  ): Promise<UserLoginResponseDto> {
    const result = await this.authService.login(userData);

    response.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60, // 1 hour
    });

    return result;
  }
}
