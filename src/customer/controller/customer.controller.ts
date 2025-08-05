import { Controller, Get, Patch, Req, UseGuards, Body, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { CustomerService } from '../service/customer.service';
import { CustomerResponseDto } from '../dto/customer-response.dto';
import { RequestUser } from '~/user/interface/request-user.interface';
import { UpdateCustomerProfileDto } from '../dto/update-customer-profile.dto';


@ApiTags('Customer Profile')
@Controller('profile')
@ApiBearerAuth()
export class CustomerController {
   constructor(private readonly customerService: CustomerService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get my customer profile',
    description: 'Retrieve the current user\'s customer profile information'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Customer profile retrieved successfully',
    type: CustomerResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing authentication token'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Customer profile not found'
  })
  async getMyProfile(@Req() req: { user: RequestUser }): Promise<CustomerResponseDto> {
    return this.customerService.getCurrentUserCustomer(req.user);
  }

  @Patch()
  @ApiOperation({ 
    summary: 'Update my customer profile',
    description: 'Update the current user\'s customer profile information'
  })
  @ApiBody({
    type: UpdateCustomerProfileDto,
    description: 'Customer profile data to update',
    examples: {
      basic: {
        summary: 'Update basic info',
        description: 'Update customer basic information',
        value: {
          firstName: 'John',
          lastName: 'Doe',
          phone: '+380501234567',
          dateOfBirth: '1990-01-01',
          gender: 'male'
        }
      },
      preferences: {
        summary: 'Update preferences',
        description: 'Update customer preferences',
        value: {
          preferredLanguage: 'uk',
          preferredCurrency: 'UAH',
          marketingConsent: true
        }
      },
      address: {
        summary: 'Update address info',
        description: 'Update customer address information',
        value: {
          addresses: [
            {
              type: 'shipping',
              firstName: 'John',
              lastName: 'Doe',
              address1: 'Shevchenko St. 1',
              city: 'Kyiv',
              state: 'Kyiv',
              postalCode: '01001',
              country: 'Ukraine'
            }
          ]
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Customer profile updated successfully',
    type: CustomerResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid customer data'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing authentication token'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Customer profile not found'
  })
  async updateMyProfile(
    @Req() req: { user: RequestUser },
    @Body() updateData: UpdateCustomerProfileDto
  ): Promise<CustomerResponseDto> {
    return this.customerService.updateCurrentUserCustomer(req.user, updateData);
  }

  @Post()
  @ApiOperation({
    summary: 'Create customer (Development only)',
    description: 'Create a new customer. This endpoint should be disabled in production.'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          example: 'customer@example.com',
          description: 'Customer email'
        },
        firstName: {
          type: 'string',
          example: 'John',
          description: 'Customer first name'
        },
        lastName: {
          type: 'string',
          example: 'Doe',
          description: 'Customer last name'
        },
        phone: {
          type: 'string',
          example: '+380501234567',
          description: 'Customer phone number'
        },
        segment: {
          type: 'string',
          enum: ['vip', 'regular', 'new', 'inactive'],
          example: 'regular',
          description: 'Customer segment'
        },
        totalOrders: {
          type: 'number',
          example: 5,
          description: 'Total number of orders'
        },
        totalSpent: {
          type: 'number',
          example: 15000,
          description: 'Total amount spent'
        },
        averageOrderValue: {
          type: 'number',
          example: 3000,
          description: 'Average order value'
        }
      },
      required: ['email', 'firstName', 'lastName']
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Customer created successfully',
    type: CustomerResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid customer data'
  })
  @ApiResponse({
    status: 409,
    description: 'Customer already exists'
  })
  async createCustomer(@Body() createCustomerData: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    segment?: 'vip' | 'regular' | 'new' | 'inactive';
    totalOrders?: number;
    totalSpent?: number;
    averageOrderValue?: number;
  }) {
    return this.customerService.createCustomer(createCustomerData);
  }

  @Get('statistics')
  @ApiOperation({ 
    summary: 'Get customer statistics',
    description: 'Retrieve customer statistics including total customers, VIP customers, new customers, and average check'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Customer statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalCustomers: {
          type: 'number',
          example: 2,
          description: 'Total number of customers'
        },
        vipCustomers: {
          type: 'number',
          example: 1,
          description: 'Number of VIP customers'
        },
        newCustomers: {
          type: 'number',
          example: 0,
          description: 'Number of new customers'
        },
        averageCheck: {
          type: 'number',
          example: 3000,
          description: 'Average check amount in USD'
        },
        activeCustomers: {
          type: 'number',
          example: 2,
          description: 'Number of active customers'
        },
        inactiveCustomers: {
          type: 'number',
          example: 0,
          description: 'Number of inactive customers'
        },
        segments: {
          type: 'object',
          properties: {
            vip: { type: 'number', example: 1 },
            regular: { type: 'number', example: 1 },
            new: { type: 'number', example: 0 },
            inactive: { type: 'number', example: 0 }
          }
        },
        lastUpdated: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-15T10:30:00.000Z',
          description: 'When statistics were last updated'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing authentication token'
  })
  async getCustomerStatistics(@Req() req: { user: RequestUser }) {
    return this.customerService.getCustomerStatistics(req.user);
  }
}
