import { Body, Controller, Get, Post, Req, UseGuards, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateUserDto } from './dto/createUser.dto';
import { UserResponseDto } from './dto/createUserResponse.dto';
import { loginDto } from './dto/login.dto';
import { UserLoginResponseDto } from './dto/loginResponse.dto';
import { JwtAuthGuard } from 'src/common/guards/jwtAuthGuard';
import * as express from 'express';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService){}

    @Post('register')
    @ApiOperation({summary: 'Register a new user', description: 'Create a new account.'})
    @ApiResponse({status: 201, description: 'User successfully registered', type: UserResponseDto})
    @ApiResponse({status: 400, description: 'Invalid input or user already exists'})
    @ApiBody({
        schema: {
            type: 'object',
            required: ["fullName", "email", "password"],
            properties: {
                fullName: {type: 'string', example: 'Muhammad Khalid',},
                password: { type: 'string', example: "securePassword123!"},
                email: { type: 'string', example: "khalid@example.com"}
            }
        }
    })
    async register (@Body() userData: CreateUserDto, @Res({passthrough: true}) response: express.Response): Promise<UserResponseDto> {
        const result = await this.authService.registerUser(userData);
        response.cookie("accessToken", result.accessToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            maxAge: 3600000,
        })
        return result;
    }

    @Post("login")
    @ApiOperation({summary: 'User Login', description: "Authenticate user and receive the acccess token"})
    @ApiResponse({status: 200, description: 'Login successful', type: UserLoginResponseDto})
    @ApiResponse({status: 401, description: 'invalid credentials'})
    @ApiBody({
        schema: {
            type: 'object',
            required: ["email", 'password'],
            properties: {
                email: {type: 'string', example: "khalid@example.com"},
                password: {type: "string", example: 'password@1234'}
            }
        }
    })
    async login(@Body() userData: loginDto, @Res({ passthrough: true }) response: express.Response) : Promise <UserLoginResponseDto> {
        const result = await this.authService.login(userData);
        response.cookie("accessToken", result.accessToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            maxAge: 3600000,
        })
        return result;
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    @ApiOperation({summary: 'get me', description: "Authenticate user and receive the acccess token"})
     @ApiBearerAuth('JWT-auth')
    getme(@Req() req){
        console.log("user data is ", req.user)
        return req.user;
    }

}
