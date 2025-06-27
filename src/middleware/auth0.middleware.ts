import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';

import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import * as jwksRsa from 'jwks-rsa';

interface AuthenticatedRequest extends Request {
  user?: jwt.JwtPayload;
  userInfo?: UserInfo;
  isAuthenticated?: boolean;
}

interface UserInfo {
  sub: string;
  type?: string;
  [key: string]: unknown;
}

interface DecodedToken extends jwt.JwtPayload {
  gty?: string;
  sub: string;
}

@Injectable()
export class Auth0Middleware implements NestMiddleware {
  private jwksClient: jwksRsa.JwksClient | null = null;

  private getJwksClient(): jwksRsa.JwksClient {
    if (this.jwksClient) {
      return this.jwksClient;
    }

    const domain = process.env.AUTH0_DOMAIN;
    if (!domain) {
      throw new Error('AUTH0_DOMAIN is not configured!');
    }

    this.jwksClient = jwksRsa({
      jwksUri: `https://${domain}/.well-known/jwks.json`,
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
    });

    return this.jwksClient;
  }

  private async getSigningKey(kid: string): Promise<string> {
    try {
      const client = this.getJwksClient();
      const key = await client.getSigningKey(kid);
      return key.getPublicKey();
    } catch {
      throw new Error('Unable to get signing key');
    }
  }

  private async verifyToken(token: string): Promise<DecodedToken> {
    try {
      const decoded = jwt.decode(token, { complete: true }) as {
        header: { kid: string };
        payload: DecodedToken;
      } | null;

      if (!decoded?.header?.kid) {
        throw new Error('Invalid token');
      }

      const signingKey = await this.getSigningKey(decoded.header.kid);

      const audience = process.env.AUTH0_AUDIENCE;
      const issuer = `https://${process.env.AUTH0_DOMAIN}/`;

      const verifiedToken = jwt.verify(token, signingKey, {
        audience,
        issuer,
        algorithms: ['RS256'],
      }) as DecodedToken;

      return verifiedToken;
    } catch {
      throw new UnauthorizedException('Failed to verify token');
    }
  }

  private async getUserInfo(token: string): Promise<UserInfo> {
    try {
      if (!process.env.AUTH0_DOMAIN) {
        throw new Error('AUTH0_DOMAIN is not configured');
      }

      const userInfoUrl = `https://${process.env.AUTH0_DOMAIN}/userinfo`;
      const response = await fetch(userInfoUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch user info: ${errorText}`);
      }

      return (await response.json()) as UserInfo;
    } catch {
      throw new UnauthorizedException('Failed to fetch user info');
    }
  }

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const request = req as AuthenticatedRequest;

      request.isAuthenticated = false;

      if (
        !request.headers.authorization ||
        !request.headers.authorization.startsWith('Bearer ')
      ) {
        res.status(401).json({
          statusCode: 401,
          message: 'Unauthorized',
          error: 'Unauthorized',
        });
        return;
      }

      const token = request.headers.authorization.split(' ')[1];

      if (!token) {
        res.status(401).json({
          statusCode: 401,
          message: 'Unauthorized',
          error: 'Unauthorized',
        });
        return;
      }

      try {
        const decodedToken = await this.verifyToken(token);

        request.user = decodedToken;
        request.isAuthenticated = true;

        if (decodedToken.gty === 'client-credentials') {
          request.userInfo = {
            sub: decodedToken.sub,
            type: 'machine-to-machine',
          };
        } else {
          try {
            const userInfo = await this.getUserInfo(token);
            request.userInfo = userInfo;
          } catch {
            throw new UnauthorizedException('Failed to get user info');
          }
        }
      } catch {
        res.status(401).json({
          statusCode: 401,
          message: 'Unauthorized',
          error: 'Unauthorized',
        });
        return;
      }

      next();
    } catch {
      res.status(401).json({
        statusCode: 401,
        message: 'Failed to verify token',
        error: 'Unauthorized',
      });
    }
  }
}
