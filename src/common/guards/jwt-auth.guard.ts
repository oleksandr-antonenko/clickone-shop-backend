import { ExecutionContext, Injectable, CanActivate } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY, PUBLIC_ROUTES_KEY, PUBLIC_READ_KEY } from '../decorators/public.decorator';
import { AuthConfigService } from '../../config/auth.config';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authConfig: AuthConfigService
  ) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const route = this.getRoutePath(request);
    const method = request.method.toLowerCase();

    const publicMetadata = this.reflector.getAllAndOverride<any>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (publicMetadata?.isPublic) {
      return true;
    }

    const publicRoutes = this.reflector.getAllAndOverride<string[]>(PUBLIC_ROUTES_KEY, [
      context.getClass(),
    ]);

    if (publicRoutes && this.isRoutePublic(route, publicRoutes)) {
      return true;
    }

    const isPublicRead = this.reflector.getAllAndOverride<boolean>(PUBLIC_READ_KEY, [
      context.getClass(),
    ]);

    if (isPublicRead && method === 'get') {
      return true;
    }

    if (this.authConfig.isDefaultPublicRoute(route)) {
      return true;
    }
    
    return super.canActivate(context) as Promise<boolean>;
  }


  private getRoutePath(request: any): string {
    const method = request.method.toLowerCase();
    const path = request.route?.path || request.url;
    return `${method}:${path}`;
  }


  private isRoutePublic(route: string, publicRoutes: string[]): boolean {
    return publicRoutes.some(pattern => {
      if (pattern.includes('*')) {
        const regexPattern = pattern.replace(/\*/g, '.*');
        return new RegExp(regexPattern).test(route);
      }
      return route === pattern;
    });
  }
} 