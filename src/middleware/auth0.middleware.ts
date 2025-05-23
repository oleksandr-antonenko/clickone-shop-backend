import { Injectable, NestMiddleware } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
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
    } catch (err) {
      console.error('Error getting signing key:', err);
      throw new Error('Unable to get signing key');
    }
  }

  private async verifyToken(token: string): Promise<any> {
    try {
      const decoded = jwt.decode(token, { complete: true }) as any;
      
      if (!decoded || !decoded.header || !decoded.header.kid) {
        throw new Error('Invalid token');
      }

      const signingKey = await this.getSigningKey(decoded.header.kid);
      
      const audience = process.env.AUTH0_AUDIENCE;
      const issuer = `https://${process.env.AUTH0_DOMAIN}/`;
      
      const verifiedToken = jwt.verify(token, signingKey, {
        audience,
        issuer,
        algorithms: ['RS256'],
      });
      
      return verifiedToken;
    } catch (error) {
      console.error('Token verification failed:', error);
      throw error;
    }
  }

  private async getUserInfo(token: string): Promise<any> {
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

      return await response.json();
    } catch (error) {
      console.error('Error fetching user info:', error);
      throw error;
    }
  }

  async use(req: any, res: any, next: () => void) {
    try {
      const request = req as FastifyRequestWithUser;
      console.log('Auth middleware processing request for path:', request.url);
      
      request.isAuthenticated = false;
      
      if (!request.headers.authorization || !request.headers.authorization.startsWith('Bearer ')) {
        console.log('No valid authorization header, authentication failed');
        res.status(401).send({
          statusCode: 401,
          message: 'Unauthorized',
          error: 'Unauthorized',
        });
        return;
      }
      
      const token = request.headers.authorization.split(' ')[1];
      
      if (!token) {
        console.log('Empty token provided, authentication failed');
        res.status(401).send({
          statusCode: 401,
          message: 'Unauthorized',
          error: 'Unauthorized',
        });
        return;
      }
      
      console.log('Authorization token received');
      
      try {
        const decodedToken = await this.verifyToken(token);
        console.log('Token verified successfully');
        console.log(JSON.stringify(decodedToken, null, 2));
        
        request.user = decodedToken;
        request.isAuthenticated = true;
        try {
          const userInfo = await this.getUserInfo(token);
          console.log('User info retrieved successfully:');
          console.log(JSON.stringify(userInfo, null, 2));
          request.userInfo = userInfo;
        } catch (userInfoError) {
          console.error('Failed to get user info:', userInfoError);
        }
      } catch (authError) {
        res.status(401).send({
          statusCode: 401,
          message: 'Unauthorized',
          error: 'Unauthorized',
        });
        return;
      }
      
      next();
    } catch (error) {
      console.error('Middleware error:', error);
      next();
    }
  }
}
