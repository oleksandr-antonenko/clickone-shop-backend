import {
  Injectable,
  NestMiddleware,
  OnModuleInit,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { auth } from 'express-oauth2-jwt-bearer';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private checkJwt: (req: Request, res: Response, next: NextFunction) => void;

  private initializeAuth() {
    const audience = process.env.AUTH0_AUDIENCE;
    const issuerBaseURL = process.env.AUTH0_ISSUER_BASE_URL;
    
    try {
      if (!audience || !issuerBaseURL) {
        this.useRejectAuth('Auth0 configuration is missing. Please configure AUTH0_AUDIENCE and AUTH0_ISSUER_BASE_URL.');
        return;
      }
      
      this.checkJwt = auth({
        audience,
        issuerBaseURL,
      });
    } catch (error) {
      this.useRejectAuth(`Auth0 initialization failed: ${error.message}`);
    }
  }
  
  private useRejectAuth(message: string) {
    this.checkJwt = (req, res, next) => {
      return res.status(401).json({
        statusCode: 401,
        message,
        error: 'Unauthorized'
      });
    };
  }

  use(req: Request, res: Response, next: NextFunction) {
    if (!this.checkJwt) {
      this.initializeAuth();
    }
    
    if (this.isPublicPath(req.path)) {
      return next();
    }
    
    this.checkJwt(req, res, (error: any) => {
      if (error) {
        return res.status(401).json({
          statusCode: 401,
          message: error.message,
          error: 'Unauthorized'
        });
      }
      next();
    });
  }
  
  private isPublicPath(path: string): boolean {
    const publicPaths = [
      '/api/docs',
      '/api/swagger',
    ];
    return publicPaths.some(publicPath => path.startsWith(publicPath));
  }
}
