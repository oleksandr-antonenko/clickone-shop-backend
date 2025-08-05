import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import * as crypto from 'crypto';

@Injectable()
export class Auth0WebhookGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    
    if (process.env.NODE_ENV === 'development') {
      return true;
    }

    const signature = request.headers['x-auth0-signature'] as string;
    const timestamp = request.headers['x-auth0-timestamp'] as string;
    
    if (!signature || !timestamp) {
      throw new UnauthorizedException('Missing Auth0 webhook signature');
    }

    const now = Math.floor(Date.now() / 1000);
    const timestampNum = parseInt(timestamp, 10);
    
    if (Math.abs(now - timestampNum) > 300) { 
      throw new UnauthorizedException('Webhook timestamp is too old');
    }

    const webhookSecret = process.env.AUTH0_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.warn('AUTH0_WEBHOOK_SECRET not configured, skipping signature validation');
      return true;
    }

    const payload = JSON.stringify(request.body);
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload + timestamp)
      .digest('hex');

    if (signature !== expectedSignature) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    return true;
  }
} 
 