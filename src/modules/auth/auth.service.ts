import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateUserDto } from './dto/createUser.dto';
import * as bcrypt from 'bcryptjs';
import { users } from '../database/schema';
import { eq } from 'drizzle-orm';
import { UserResponseDto } from './dto/createUserResponse.dto';
import { loginDto } from './dto/login.dto';
import { JWTPayload } from './dto/jwtPayload.interface';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserLoginResponseDto } from './dto/loginResponse.dto';

@Injectable()
export class AuthService {
    private readonly accessTokenExpiry: string;
    constructor(
        private readonly db: DatabaseService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ){
         this.accessTokenExpiry = this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRY') || '1h';
    }

    async registerUser(data: CreateUserDto): Promise<UserResponseDto> {
        const userEmail = data.email;

        const [existingUser] = await this.db.db.select().from(users).where(eq(users.email, data.email)).limit(1);

        if(existingUser){
            throw new ConflictException("user with this email already exist!")
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        const insertData = {
              fullName: data.fullName,
              email: data.email,
              password: hashedPassword
            }
             const [user] = await this.db.db.insert(users).values(insertData).returning(); 
             
             
             const { accessToken } = await this.generateToken(user);

             const response = {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                accessToken: accessToken,
             }
             
             return response;

       

       
    }

    async login(data: loginDto): Promise<UserLoginResponseDto> {
        const [user] = await this.db.db.select().from(users).where(eq(users.email, data.email)).limit(1);
        if(!user){
            throw new UnauthorizedException("Invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(data.password, user.password);

        if(!isPasswordValid){
            throw new UnauthorizedException("Invalid credentials");
        }

        const {accessToken} = await this.generateToken(user);
        return {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            accessToken: accessToken,
        }

    }

    private async generateToken(user:any) : Promise<{accessToken: string}> {
        const payload : JWTPayload = {
            sub: user.id,
            fullName: user.fullName,
            email: user.email
        }

        const accessToken = this.jwtService.sign(payload as any, {
            expiresIn: this.accessTokenExpiry as any,
        });
        
        return {accessToken};
    }

}
