import { ApiProperty } from '@nestjs/swagger';
import { AdminResponseDto } from './admin-response.dto';

export class AdminAdminsResponseDto {
  @ApiProperty({
    description: 'List of admins',
    type: [AdminResponseDto]
  })
  admins: AdminResponseDto[];

  @ApiProperty({
    description: 'Total number of admins',
    example: 25
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
      role: 'admin',
      status: 'active',
      department: 'IT'
    }
  })
  filters: {
    search?: string;
    role?: string;
    status?: string;
    department?: string;
  };

  @ApiProperty({
    description: 'Pagination metadata',
    example: {
      pagination: {
        page: 1,
        limit: 10,
        total: 25,
        totalPages: 3,
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
 