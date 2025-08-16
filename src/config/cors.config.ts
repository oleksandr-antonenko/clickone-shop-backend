import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class CorsConfigService {
  private readonly logger = new Logger(CorsConfigService.name);

  constructor() {
    const origins = this.getAllowedOrigins();
    if (origins.length === 0) {
      this.logger.warn(
        'No CORS origins configured! This will block all cross-origin requests.'
      );
    } else {
      this.logger.log(`CORS configured for origins: ${origins.join(', ')}`);
    }
  }

  private isValidUrl(url: string): boolean {
    if (!url || url.trim() === '') return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  isOriginAllowed(origin: string | undefined): boolean {
    if (!origin) {
      return true;
    }

    const allowedOrigins = this.getAllowedOrigins();
    console.log('allowedOrigins', allowedOrigins);
    console.log('origin', origin);
    const isAllowed = allowedOrigins.includes(origin);

    if (!isAllowed) {
      this.logger.warn(`CORS: Origin not allowed: ${origin}`);
    }

    return isAllowed;
  }

  getAllowedMethods(): string[] {
    return ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'];
  }

  getAllowedHeaders(): string[] {
    return [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Content-Length',
      'X-File-Name',
      'Cache-Control',
      'Pragma',
    ];
  }

  getAllowedOrigins(): string[] {
    const origins: string[] = ['http://localhost:5173'];
    if (process.env.CORS_ALLOWED_ORIGINS) {
      const configuredOrigins = process.env.CORS_ALLOWED_ORIGINS.split(',')
        .map((origin) => origin.trim())
        .filter((origin) => origin && this.isValidUrl(origin));

      origins.push(...configuredOrigins);
    }

    if (
      process.env.CLIENT_ORIGIN &&
      this.isValidUrl(process.env.CLIENT_ORIGIN)
    ) {
      origins.push(process.env.CLIENT_ORIGIN.trim());
    }

    return [...new Set(origins)];
  }
}
