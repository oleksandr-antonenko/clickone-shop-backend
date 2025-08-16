import { Injectable, CanActivate, ExecutionContext, ConflictException } from '@nestjs/common';
import { Request } from 'express';
import { CustomerService } from '../../customer/service/customer.service';

interface RequestWithUser extends Request {
  user?: any;
}

@Injectable()
export class RequireCustomerGuard implements CanActivate {
  constructor(private readonly customerService: CustomerService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user?.sub) {
      throw new ConflictException('Authentication required');
    }

    try {
      const customer = await this.customerService.getCurrentUserCustomer(user);
      
      if (!customer) {
        throw new ConflictException('Створіть профіль покупця: POST /me/customer');
      }

      return true;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      
      throw new ConflictException('Створіть профіль покупця: POST /me/customer');
    }
  }
}
