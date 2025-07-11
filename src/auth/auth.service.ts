import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}


  async validateToken(token: string): Promise<any> {
    try {
      return await this.jwtService.verifyAsync(token);
    } catch (error) {
      return null;
    }
  }


  extractUserFromPayload(payload: any): any {
    return {
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      // Add other user fields as needed
    };
  }


  hasPermissions(user: any, requiredPermissions: string[]): boolean {
    if (!user || !user.permissions) {
      return false;
    }
    
    return requiredPermissions.every(permission => 
      user.permissions.includes(permission)
    );
  }
} 