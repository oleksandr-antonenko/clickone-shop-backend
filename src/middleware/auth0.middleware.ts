import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import * as jwt from 'jsonwebtoken';
import * as jwksRsa from 'jwks-rsa';

export interface UserInfo {
  sub: string;
  type?: 'machine-to-machine';
  email?: string;
  name?: string;
  picture?: string;
  [key: string]: any;
}

export interface FastifyRequestWithUser extends FastifyRequest {
  user?: jwt.JwtPayload;
  userInfo?: UserInfo;
  isAuthenticated?: boolean;
}

@Injectable()
export class Auth0Middleware implements NestMiddleware {
  private static readonly BEARER_PREFIX = 'Bearer ';
  private static readonly JWT_ALGORITHM = 'RS256';
  private static readonly MACHINE_TO_MACHINE_GRANT_TYPE = 'client-credentials';
  
  private readonly logger = new Logger(Auth0Middleware.name);
  private jwksClient: jwksRsa.JwksClient | null = null;
  private configurationValid: boolean | null = null;


  private validateConfiguration(): boolean {
    if (this.configurationValid !== null) {
      return this.configurationValid;
    }

    const domain = process.env.AUTH0_DOMAIN;
    const audience = process.env.AUTH0_AUDIENCE;

    if (!domain || !audience) {
      this.logger.error('AUTH0_DOMAIN and AUTH0_AUDIENCE environment variables must be configured');
      this.configurationValid = false;
      return false;
    }

    this.configurationValid = true;
    return true;
  }

  private getJwksClient(): jwksRsa.JwksClient | null {
    if (!this.validateConfiguration()) {
      return null;
    }

    if (this.jwksClient) {
      return this.jwksClient;
    }

    const domain = process.env.AUTH0_DOMAIN!;

    try {
      this.jwksClient = jwksRsa({
        jwksUri: `https://${domain}/.well-known/jwks.json`,
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
      });

      return this.jwksClient;
    } catch (error) {
      this.logger.error('Failed to create JWKS client:', error);
      return null;
    }
  }

  private async getSigningKey(kid: string): Promise<string | null> {
    try {
      const client = this.getJwksClient();
      if (!client) {
        return null;
      }

      const key = await client.getSigningKey(kid);
      return key.getPublicKey();
    } catch (error) {
      this.logger.error('Unable to retrieve signing key from JWKS:', error);
      return null;
    }
  }

  private async verifyToken(token: string): Promise<jwt.JwtPayload | null> {
    try {
      if (!this.validateConfiguration()) {
        return null;
      }

      const decoded = jwt.decode(token, { complete: true }) as jwt.Jwt;
      
      if (!decoded?.header?.kid) {
        this.logger.warn('Invalid token format - missing kid in header');
        return null;
      }

      const signingKey = await this.getSigningKey(decoded.header.kid);
      if (!signingKey) {
        return null;
      }

      const audience = process.env.AUTH0_AUDIENCE!;
      const domain = process.env.AUTH0_DOMAIN!;
      const issuer = `https://${domain}/`;
      
      const verifiedToken = jwt.verify(token, signingKey, {
        audience,
        issuer,
        algorithms: [Auth0Middleware.JWT_ALGORITHM],
      }) as jwt.JwtPayload;
      
      return verifiedToken;
    } catch (error) {
      this.logger.warn('Token verification failed:', error.message);
      return null;
    }
  }

  private async getUserInfo(token: string): Promise<UserInfo | null> {
    if (!this.validateConfiguration()) {
      return null;
    }

    const domain = process.env.AUTH0_DOMAIN!;

    try {
      const userInfoUrl = `https://${domain}/userinfo`;
      const response = await fetch(userInfoUrl, {
        headers: {
          Authorization: `${Auth0Middleware.BEARER_PREFIX}${token}`,
        },
      });

      if (!response.ok) {
        this.logger.warn(`Failed to fetch user info: ${response.status} ${response.statusText}`);
        return null;
      }

      return await response.json();
    } catch (error) {
      this.logger.warn('Failed to retrieve user information:', error.message);
      return null;
    }
  }

  private createMachineToMachineUserInfo(sub: string): UserInfo {
    return {
      sub,
      type: 'machine-to-machine'
    };
  }

  private extractBearerToken(authHeader?: string): string | null {
    if (!authHeader?.startsWith(Auth0Middleware.BEARER_PREFIX)) {
      return null;
    }
    return authHeader.split(' ')[1] || null;
  }

  private sendUnauthorizedResponse(reply: FastifyReply, message: string = 'Unauthorized'): void {
    reply.code(401).send({
      statusCode: 401,
      message,
      error: 'Unauthorized',
    });
  }


  use(req: FastifyRequest, reply: FastifyReply, next: () => void): void {
    const request = req as FastifyRequestWithUser;

    request.isAuthenticated = false;

    if (!this.validateConfiguration()) {
      this.logger.error('Auth0 configuration is invalid - allowing request without authentication');
      next();
      return;
    }
    
    const token = this.extractBearerToken(request.headers.authorization);
    if (!token) {
      this.sendUnauthorizedResponse(reply);
      return;
    }
    
    this.processAuthentication(request, reply, token, next).catch((error) => {
      this.logger.error('Unexpected error in Auth0Middleware:', error);
      this.sendUnauthorizedResponse(reply, 'Authentication service temporarily unavailable');
    });
  }

  private async processAuthentication(
    req: FastifyRequestWithUser,
    reply: FastifyReply,
    token: string,
    next: () => void
  ): Promise<void> {
    const decodedToken = await this.verifyToken(token);
    if (!decodedToken) {
      this.sendUnauthorizedResponse(reply, 'Invalid or expired token');
      return;
    }

    req.user = decodedToken;
    req.isAuthenticated = true;
    
    if (decodedToken.gty === Auth0Middleware.MACHINE_TO_MACHINE_GRANT_TYPE) {
      req.userInfo = this.createMachineToMachineUserInfo(decodedToken.sub!);
    } else {
      const userInfo = await this.getUserInfo(token);
      if (userInfo) {
        req.userInfo = userInfo;
      } else {
        req.userInfo = {
          sub: decodedToken.sub!,
        };
      }
    }
    
    next();
  }
}
