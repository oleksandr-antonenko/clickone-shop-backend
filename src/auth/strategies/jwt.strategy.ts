import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as jwt from 'jsonwebtoken';
import * as jwksRsa from 'jwks-rsa';

interface DecodedToken extends jwt.JwtPayload {
  gty?: string;
  sub: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private jwksClient: jwksRsa.JwksClient | null = null;

  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: async (request, rawJwtToken, done) => {
        try {
          const signingKey = await this.getSigningKey(rawJwtToken);
          done(null, signingKey);
        } catch (error) {
          done(error, null);
        }
      },
      audience: process.env.AUTH0_AUDIENCE,
      issuer: `https://${process.env.AUTH0_DOMAIN}/`,
      algorithms: ['RS256'],
    });
  }

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

  private async getSigningKey(token: string): Promise<string> {
    try {
      const decoded = jwt.decode(token, { complete: true }) as {
        header: { kid: string };
        payload: DecodedToken;
      } | null;

      if (!decoded?.header?.kid) {
        throw new Error('Invalid token');
      }

      const client = this.getJwksClient();
      const key = await client.getSigningKey(decoded.header.kid);
      return key.getPublicKey();
    } catch (error) {
      throw new Error('Unable to get signing key');
    }
  }

  async validate(payload: DecodedToken) {
    return { ...payload };
  }
} 