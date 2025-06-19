import { Controller, Post, Body, HttpException, HttpStatus, Get, Headers, UnauthorizedException } from '@nestjs/common';
import { AuthService, LoginDto, AuthResponse } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
    try {
      if (!loginDto.username || !loginDto.password) {
        throw new HttpException(
          'Username and password are required',
          HttpStatus.BAD_REQUEST
        );
      }

      return await this.authService.login(loginDto);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw new HttpException(
          'Invalid username or password',
          HttpStatus.UNAUTHORIZED
        );
      }
      throw new HttpException(
        'Login failed',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('verify')
  async verifyToken(@Headers('authorization') authorization: string): Promise<{ valid: boolean; user?: any }> {
    try {
      if (!authorization || !authorization.startsWith('Bearer ')) {
        throw new UnauthorizedException('No token provided');
      }

      const token = authorization.substring(7);
      const user = await this.authService.validateToken(token);
      
      return {
        valid: true,
        user,
      };
    } catch (error) {
      return {
        valid: false,
      };
    }
  }
}