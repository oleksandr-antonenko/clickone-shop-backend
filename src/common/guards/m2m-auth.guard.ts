import { ExecutionContext, Injectable, CanActivate, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { M2M_KEY, M2M_SCOPES_KEY, M2M_PERMISSIONS_KEY } from '../decorators/m2m.decorator';
import { AuthService } from '../../auth/auth.service';

@Injectable()
export class M2MAuthGuard extends AuthGuard('m2m') implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authService: AuthService
  ) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Check if endpoint requires M2M authentication
    const m2mMetadata = this.reflector.getAllAndOverride<any>(M2M_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!m2mMetadata?.isM2M) {
      // If not M2M endpoint, allow regular JWT authentication
      return true;
    }

    // For M2M endpoints, use M2M strategy
    return super.canActivate(context) as Promise<boolean>;
  }

  handleRequest<TUser = any>(err: any, user: any, info: any, context: ExecutionContext, status?: any): TUser {
    if (err || !user) {
      throw new UnauthorizedException('Invalid M2M token');
    }

    // Verify it's an M2M user
    if (!this.authService.isM2MUser(user)) {
      throw new UnauthorizedException('Invalid token type - M2M endpoint requires M2M token');
    }

    // Check required scopes
    const requiredScopes = this.reflector.getAllAndOverride<string[]>(M2M_SCOPES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (requiredScopes && requiredScopes.length > 0) {
      if (!this.authService.hasScopes(user, requiredScopes)) {
        throw new UnauthorizedException(`Insufficient scopes. Required: ${requiredScopes.join(', ')}`);
      }
    }

    // Check required permissions
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(M2M_PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (requiredPermissions && requiredPermissions.length > 0) {
      if (!this.authService.hasPermissions(user, requiredPermissions)) {
        throw new UnauthorizedException(`Insufficient permissions. Required: ${requiredPermissions.join(', ')}`);
      }
    }

    return user as TUser;
  }
} 