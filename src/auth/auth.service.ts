import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

interface M2MUser {
  sub: string;
  azp: string;
  isM2M: boolean;
  scopes: string[];
  permissions: string[];
}

interface RegularUser {
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
  permissions?: string[];
}

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

  extractUserFromPayload(payload: any): RegularUser {
    return {
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      permissions: payload.permissions || [],
    };
  }

  extractM2MFromPayload(payload: any): M2MUser {
    return {
      sub: payload.sub,
      azp: payload.azp,
      isM2M: payload.isM2M,
      scopes: payload.scopes || [],
      permissions: payload.permissions || [],
    };
  }

  hasPermissions(user: RegularUser | M2MUser, requiredPermissions: string[]): boolean {
    if (!user || !user.permissions || !Array.isArray(user.permissions)) {
      return false;
    }
    
    return requiredPermissions.every(permission => 
      user.permissions!.includes(permission)
    );
  }

  hasScopes(m2mUser: M2MUser, requiredScopes: string[]): boolean {
    if (!m2mUser || !m2mUser.scopes) {
      return false;
    }
    
    return requiredScopes.every(scope => 
      m2mUser.scopes.includes(scope)
    );
  }

  isM2MUser(user: any): user is M2MUser {
    return user && user.isM2M === true;
  }

  isRegularUser(user: any): user is RegularUser {
    return user && !user.isM2M;
  }
} 