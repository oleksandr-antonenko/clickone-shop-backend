import {Injectable, NestMiddleware} from '@nestjs/common';
import {FastifyRequest, FastifyReply} from 'fastify';
import * as jwt from 'jsonwebtoken';
import * as jwksRsa from 'jwks-rsa';

export interface FastifyRequestWithUser extends FastifyRequest {
  user?: any;
  userInfo?: any;
  isAuthenticated?: boolean;
}

@Injectable()
export class Auth0Middleware implements NestMiddleware {
  private jwksClient: any;

  private getJwksClient() {
    if (this.jwksClient) {
      return this.jwksClient;
    }

    const domain = process.env.AUTH0_DOMAIN;
    if (!domain) {
      return null;
    }

    this.jwksClient = jwksRsa({
      jwksUri: `https://${domain}/.well-known/jwks.json`,
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
    });

    return this.jwksClient;
  }

  private async getSigningKey(kid: string): Promise<string | null> {
    try {
      const client = this.getJwksClient();
      const key = await client.getSigningKey(kid);
      return key.getPublicKey();
    } catch {
      return null;
    }
  }

  private async verifyToken(
    token: string
  ): Promise<string | jwt.JwtPayload | null> {
    try {
      const decoded = jwt.decode(token, {complete: true});

      if (!decoded) {
        return null;
      }

      const kid = decoded.header.kid;

      const signingKey = await this.getSigningKey(kid);

      if (!signingKey) {
        return null;
      }

      const audience = process.env.AUTH0_AUDIENCE;
      const issuer = `https://${process.env.AUTH0_DOMAIN}/`;

      const verifiedToken = jwt.verify(token, signingKey, {
        audience,
        issuer,
        algorithms: ['RS256'],
      });

      return verifiedToken;
    } catch {
      return null;
    }
  }

  private async getUserInfo(token: string): Promise<any> {
    if (!process.env.AUTH0_DOMAIN) {
      return null;
    }

    try {
      const userInfoUrl = `https://${process.env.AUTH0_DOMAIN}/userinfo`;
      const response = await fetch(userInfoUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch {
      return null;
    }
  }

  async use(req: FastifyRequest, res: FastifyReply, next: () => void) {
    try {
      const request = req as FastifyRequestWithUser;

      request.isAuthenticated = false;

      if (
        !request.headers.authorization ||
        !request.headers.authorization.startsWith('Bearer ')
      ) {
        res.code(401).send({
          statusCode: 401,
          message: 'Unauthorized',
          error: 'Unauthorized',
        });
        return;
      }

      const token = request.headers.authorization.split(' ')[1];

      if (!token) {
        res.code(401).send({
          statusCode: 401,
          message: 'Unauthorized',
          error: 'Unauthorized',
        });
        return;
      }

      try {
        const decodedToken = await this.verifyToken(token);

        if (!decodedToken) {
          return res.code(401).send({
            statusCode: 401,
            message: 'Unauthorized',
            error: 'Token verification failed',
          });
        }

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
          } catch (error: unknown) {
            return res.code(401).send({
              statusCode: 401,
              message: 'Unauthorized',
              error:
                error instanceof Error
                  ? error.message
                  : 'Failed to verify token',
            });
          }
        }
        next();
      } catch (error: unknown) {
        return res.code(401).send({
          statusCode: 401,
          message: 'Unauthorized',
          error:
            error instanceof Error ? error.message : 'Failed to verify token',
        });
        next();
      }
    } catch (error: unknown) {
      return res.code(401).send({
        statusCode: 401,
        message: 'Unauthorized',
        error:
          error instanceof Error ? error.message : 'Failed to verify token',
      });
      next();
    }
  }
}
