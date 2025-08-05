import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../user/dto/user-response.dto';

export class AdminUsersResponseDto {
  @ApiProperty({
    description: 'List of users',
    type: [UserResponseDto]
  })
  users: UserResponseDto[];

  @ApiProperty({
    description: 'Total number of users',
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
      role: 'admin',
      status: 'active'
    }
  })
  filters: {
    search?: string;
    role?: string;
    status?: string;
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
 