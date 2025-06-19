import { Injectable, UnauthorizedException } from '@nestjs/common';

export interface LoginDto {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    username: string;
    role: string;
  };
}

@Injectable()
export class AuthService {
  private readonly users = [
    {
      username: 'admin',
      password: 'admin',
      role: 'admin',
    },
  ];

  async validateUser(username: string, password: string): Promise<any> {
    const user = this.users.find(
      u => u.username === username && u.password === password
    );
    
    if (user) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { username, password } = loginDto;
    
    const user = await this.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate a simple token (in production, use JWT)
    const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');

    return {
      access_token: token,
      user: {
        username: user.username,
        role: user.role,
      },
    };
  }

  async validateToken(token: string): Promise<any> {
    try {
      const decoded = Buffer.from(token, 'base64').toString();
      const [username] = decoded.split(':');
      
      const user = this.users.find(u => u.username === username);
      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }

      const { password, ...result } = user;
      return result;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}