import { ApiProperty } from '@nestjs/swagger';
import { CustomerResponseDto } from '../../customer/dto/customer-response.dto';

export class AdminCustomersResponseDto {
  @ApiProperty({
    description: 'List of customers',
    type: [CustomerResponseDto]
  })
  customers: CustomerResponseDto[];

  @ApiProperty({
    description: 'Total number of customers',
    example: 150
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10
  })
  limit: number;

  @ApiProperty({
    description: 'Applied filters',
    example: {
      search: 'john',
      status: 'active',
      segment: 'vip'
    }
  })
  filters: {
    search?: string;
    status?: string;
    segment?: string;
  };

  @ApiProperty({
    description: 'Pagination metadata',
    example: {
      pagination: {
        page: 1,
        limit: 10,
        total: 150,
        totalPages: 15,
        hasNextPage: true,
        hasPreviousPage: false
      }
    }
  })
  pagination: {
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
} 
 