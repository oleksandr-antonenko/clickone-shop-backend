import { Injectable } from '@nestjs/common';


@Injectable()
export class AuthConfigService {

  get auth0Domain(): string {
    return process.env.AUTH0_DOMAIN || '';
  }


  get auth0Audience(): string {
    return process.env.AUTH0_AUDIENCE || '';
  }


  get jwtSecret(): string {
    return process.env.JWT_SECRET || 'fallback-secret';
  }


  get defaultPublicRoutes(): string[] {
    return [
      'get:/api/products',
      'get:/api/products/*',
      'get:/api/category',
      'get:/api/category/*',
      'get:/api/brands',
      'get:/api/brands/*',
      'get:/api/families',
      'get:/api/collections',
      'get:/api/collections/*',
      'get:/api/attributes/values',
      'get:/api/settings',
      'get:/api/settings/*',
      'get:/api',
      'get:/docs',
      'get:/docs/*',
      'get:/uploads/*',
    ];
  }


  get protectedWriteRoutes(): string[] {
    return [
      'post:/api/products',
      'patch:/api/products/*',
      'delete:/api/products/*',
      'post:/api/category',
      'patch:/api/category/*',
      'delete:/api/category/*',
      'post:/api/brands',
      'patch:/api/brands/*',
      'delete:/api/brands/*',
      'post:/api/families',
      'patch:/api/families/*',
      'delete:/api/families/*',
      'post:/api/collections',
      'patch:/api/collections/*',
      'delete:/api/collections/*',
      'post:/api/attributes/values',
      'patch:/api/attributes/values/*',
      'delete:/api/attributes/values/*',
      'post:/api/settings',
      'patch:/api/settings/*',
      'delete:/api/settings/*',
      'post:/api/order',
      'patch:/api/order/*',
      'delete:/api/order/*',
      'get:/api/users/*'
    ];
  }

  isDefaultPublicRoute(route: string): boolean {
    return this.defaultPublicRoutes.some(pattern => {
      if (pattern.includes('*')) {
        const regexPattern = pattern.replace(/\*/g, '.*');
        return new RegExp(regexPattern).test(route);
      }
      return route === pattern;
    });
  }


  isProtectedWriteRoute(route: string): boolean {
    return this.protectedWriteRoutes.some(pattern => {
      if (pattern.includes('*')) {
        const regexPattern = pattern.replace(/\*/g, '.*');
        return new RegExp(regexPattern).test(route);
      }
      return route === pattern;
    });
  }
} 