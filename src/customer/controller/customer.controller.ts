import { Controller, Get, Patch, Req, UseGuards, Body, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { CustomerService } from '../service/customer.service';
import { CustomerResponseDto } from '../dto/customer-response.dto';
import { RequestUser } from '~/user/interface/request-user.interface';
import { UpdateCustomerProfileDto } from '../dto/update-customer-profile.dto';
import { PublicRead } from '~/common/decorators/public.decorator';


@ApiTags('Customer Profile')
@Controller('profile')
@ApiBearerAuth()
export class CustomerController {
   constructor(private readonly customerService: CustomerService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get my customer profile',
    description: 'Retrieve the current authenticated user\'s customer profile information. This endpoint requires authentication and returns detailed customer data including personal information, preferences, addresses, and statistics. The customer profile is automatically created when a user first logs in through Auth0. This endpoint is used by the frontend to display user profile information and manage account settings.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Customer profile retrieved successfully. Returns complete customer information including personal details, preferences, and statistics.',
    type: CustomerResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Authentication token is missing, invalid, or expired. User must be logged in to access their profile.'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Customer profile not found. This may happen if the user exists in the users table but does not have an associated customer profile. The profile will be created automatically on next login.'
  })
  async getMyProfile(@Req() req: { user: RequestUser }): Promise<CustomerResponseDto> {
    return this.customerService.getCurrentUserCustomer(req.user);
  }

  @Patch()
  @ApiOperation({ 
    summary: 'Update my customer profile',
    description: 'Update the current authenticated user\'s customer profile information. This endpoint allows customers to modify their personal information, preferences, and addresses. All fields are optional - only the fields you want to update need to be included. The customer profile is linked to the user account through Auth0 ID. This endpoint is used by the frontend for profile management and account settings.'
  })
  @ApiBody({
    type: UpdateCustomerProfileDto,
    description: 'Customer profile update data. Only include the fields you want to update. All fields are validated before processing.',
    examples: {
      basic: {
        summary: 'Update basic info',
        description: 'Update customer basic personal information like name, phone, and birth date',
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
        description: 'Update customer preferences like language, currency, and marketing consent',
        value: {
          preferredLanguage: 'uk',
          preferredCurrency: 'UAH',
          marketingConsent: true
        }
      },
      address: {
        summary: 'Update address info',
        description: 'Update customer address information for shipping and billing',
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
    description: 'Customer profile updated successfully. The changes are immediately reflected in the customer profile.',
    type: CustomerResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid customer data. Check the request body format and field validation rules.'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Authentication token is missing, invalid, or expired. User must be logged in to update their profile.'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Customer profile not found. The authenticated user does not have an associated customer profile.'
  })
  async updateMyProfile(
    @Req() req: { user: RequestUser },
    @Body() updateData: UpdateCustomerProfileDto
  ): Promise<CustomerResponseDto> {
    return this.customerService.updateCurrentUserCustomer(req.user, updateData);
  }

  @Post('register')
  @PublicRead()
  @ApiOperation({
    summary: 'Register new customer (Public)',
    description: 'Register a new customer in the system without requiring authentication. This is the production endpoint for customer registration used by the frontend registration form. The customer will be created with default settings and assigned to the "new" segment. This endpoint is publicly accessible and does not require any authentication. The customer profile will be automatically linked to a user account when they first log in through Auth0.'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          example: 'customer@example.com',
          description: 'Customer email address (required). Must be a valid email format and unique in the system.'
        },
        firstName: {
          type: 'string',
          example: 'John',
          description: 'Customer first name (required). Must be between 2 and 50 characters.'
        },
        lastName: {
          type: 'string',
          example: 'Doe',
          description: 'Customer last name (required). Must be between 2 and 50 characters.'
        },
        phone: {
          type: 'string',
          example: '+380501234567',
          description: 'Customer phone number (optional). Should include country code for international format.'
        },
        marketingConsent: {
          type: 'boolean',
          example: true,
          description: 'Marketing consent flag (optional). Determines if customer can receive marketing communications.'
        },
        preferredLanguage: {
          type: 'string',
          example: 'uk',
          description: 'Preferred language (optional). Used for localized content and communications. Default is "uk".'
        },
        preferredCurrency: {
          type: 'string',
          example: 'UAH',
          description: 'Preferred currency (optional). Used for price display and transactions. Default is "UAH".'
        }
      },
      required: ['email', 'firstName', 'lastName']
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Customer registered successfully. The customer profile has been created and is ready for use.',
    type: CustomerResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid customer data. Check the request body format and required field validation.'
  })
  @ApiResponse({
    status: 409,
    description: 'Customer already exists. A customer with this email address already exists in the system.'
  })
  async registerCustomer(@Body() registerData: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    marketingConsent?: boolean;
    preferredLanguage?: string;
    preferredCurrency?: string;
  }) {
    return this.customerService.createCustomer({
      ...registerData,
      segment: 'new', 
      totalOrders: 0,
      totalSpent: 0,
      averageOrderValue: 0
    });
  }

  @Get('statistics')
  @ApiOperation({ 
    summary: 'Get customer statistics',
    description: 'Retrieve comprehensive customer statistics for the current authenticated user. This endpoint provides detailed analytics about the customer\'s shopping behavior including total orders, spending patterns, average order value, and segment information. The statistics are calculated in real-time from the customer\'s order history and profile data. This information is used by the frontend to display customer dashboard and analytics.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Customer statistics retrieved successfully. Returns detailed analytics about the customer\'s shopping behavior and profile.',
    schema: {
      type: 'object',
      properties: {
        totalCustomers: {
          type: 'number',
          example: 2,
          description: 'Total number of customers in the system (for admin users only)'
        },
        vipCustomers: {
          type: 'number',
          example: 1,
          description: 'Number of VIP customers in the system (for admin users only)'
        },
        newCustomers: {
          type: 'number',
          example: 0,
          description: 'Number of new customers in the system (for admin users only)'
        },
        averageCheck: {
          type: 'number',
          example: 3000,
          description: 'Average check amount in the system currency (for admin users only)'
        },
        activeCustomers: {
          type: 'number',
          example: 2,
          description: 'Number of active customers in the system (for admin users only)'
        },
        inactiveCustomers: {
          type: 'number',
          example: 0,
          description: 'Number of inactive customers in the system (for admin users only)'
        },
        segments: {
          type: 'object',
          properties: {
            vip: { type: 'number', example: 1, description: 'Number of VIP customers' },
            regular: { type: 'number', example: 1, description: 'Number of regular customers' },
            new: { type: 'number', example: 0, description: 'Number of new customers' },
            inactive: { type: 'number', example: 0, description: 'Number of inactive customers' }
          },
          description: 'Customer distribution by segments'
        },
        lastUpdated: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-15T10:30:00.000Z',
          description: 'When statistics were last calculated and updated'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Authentication token is missing, invalid, or expired. User must be logged in to access statistics.'
  })
  async getCustomerStatistics(@Req() req: { user: RequestUser }) {
    return this.customerService.getCustomerStatistics(req.user);
  }
}
