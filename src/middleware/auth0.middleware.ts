import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { auth } from 'express-oauth2-jwt-bearer';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private checkJwt = auth({
    audience: `${process.env.AUTH0_AUDIENCE}`,
    issuerBaseURL: `${process.env.AUTH0_DOMAIN}`,
  });

  use(req: Request, res: Response, next: NextFunction) {
    this.checkJwt(req, res, (error: any) => {
      if (error) {
        throw new UnauthorizedException(`${error.message}`);
      }
    });
    next();
  }
}
