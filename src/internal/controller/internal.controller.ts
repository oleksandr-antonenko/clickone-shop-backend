import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InternalService } from '../service/internal.service';
import { Auth0WebhookDto } from '../dto/auth0-webhook.dto';
import { CompleteOrderDto } from '../dto/complete-order.dto';
import { UserResponseDto } from '../../user/dto/user-response.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Auth0WebhookGuard } from '../../common/guards/auth0-webhook.guard';

@ApiTags('Internal')
@Controller('internal')
export class InternalController {
  constructor(private readonly internalService: InternalService) {}


  @Post('auth0/user-created')
  @Public()
  @UseGuards(Auth0WebhookGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Auth0 user creation webhook',
    description: 'Webhook endpoint for creating users when they first login with Auth0'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'User created successfully',
    type: UserResponseDto
  })
  @ApiResponse({ 
    status: 409, 
    description: 'User already exists'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid request data'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Invalid webhook signature'
  })
  async handleAuth0UserCreated(@Body() webhookData: Auth0WebhookDto): Promise<UserResponseDto> {
    return this.internalService.handleAuth0UserCreated(webhookData);
  }


  @Post('orders/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Complete order',
    description: 'Mark an order as delivered and update delivery information'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Order completed successfully'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid request data or order cannot be completed'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Order not found'
  })
  async completeOrder(@Body() completeOrderData: CompleteOrderDto) {
    return this.internalService.completeOrder(completeOrderData);
  }
} 