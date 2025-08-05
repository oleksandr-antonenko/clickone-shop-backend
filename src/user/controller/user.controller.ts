import { Controller, Get, Put, Post, Delete, Patch, Req, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { UserService } from '../service/user.service';
import { UserResponseDto } from '../dto/user-response.dto';
import { UpdateUserRolesDto } from '../dto/update-user-roles.dto';
import { AddRoleDto } from '../dto/add-role.dto';
import { RequestUser } from '../interface/request-user.interface';

@ApiTags('User Management')
@Controller('users')
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiOperation({
    summary: 'Get my profile',
    description: 'Retrieve the profile of the currently authenticated user'
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    type: UserResponseDto
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized'
  })
  @ApiResponse({
    status: 404,
    description: 'User not found'
  })
  async getMyProfile(@Req() req: any): Promise<UserResponseDto> {
    return this.userService.getCurrentUserProfile(req.user);
  }

  @Get('me/login-info')
  @ApiOperation({
    summary: 'Get my login statistics',
    description: 'Retrieve the last login time and login statistics for the current user'
  })
  @ApiResponse({
    status: 200,
    description: 'Login information retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        lastLoginAt: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-15T10:30:00.000Z'
        },
        daysSinceLastLogin: {
          type: 'number',
          example: 2
        },
        isFirstLogin: {
          type: 'boolean',
          example: false
        }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized'
  })
  @ApiResponse({
    status: 404,
    description: 'User not found'
  })
  async getMyLoginInfo(@Req() req: any) {
    return this.userService.getUserLoginInfo(req.user);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all users',
    description: 'Retrieve all users with pagination'
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (default: 1)',
    type: Number
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page (default: 10)',
    type: Number
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully'
  })
  async getAllUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    return this.userService.getAllUsers(page, limit);
  }

  @Get('statistics')
  @ApiOperation({
    summary: 'Get user statistics',
    description: 'Retrieve user statistics including total users, administrators, managers, and active users'
  })
  @ApiResponse({
    status: 200,
    description: 'User statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalUsers: {
          type: 'number',
          example: 2,
          description: 'Total number of users'
        },
        administrators: {
          type: 'number',
          example: 1,
          description: 'Number of administrators'
        },
        managers: {
          type: 'number',
          example: 1,
          description: 'Number of managers'
        },
        activeUsers: {
          type: 'number',
          example: 2,
          description: 'Number of active users'
        },
        inactiveUsers: {
          type: 'number',
          example: 0,
          description: 'Number of inactive users'
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
    description: 'Unauthorized'
  })
  async getUserStatistics() {
    return this.userService.getUserStatistics();
  }

  @Patch(':userId/roles')
  @ApiOperation({
    summary: 'Update user roles',
    description: 'Update the roles for a specific user. Replace all existing roles with the new array.'
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    example: 'f38c9d3a-5ed2-4eb5-9481-ba1ee73f838d'
  })
  @ApiBody({
    type: UpdateUserRolesDto,
    description: 'Roles to assign to the user',
    examples: {
      admin: {
        summary: 'Make user admin',
        description: 'Assign admin role to user',
        value: {
          roles: ['admin']
        }
      },
      manager: {
        summary: 'Make user manager',
        description: 'Assign manager role to user',
        value: {
          roles: ['manager']
        }
      },
      multiple: {
        summary: 'Multiple roles',
        description: 'Assign multiple roles to user',
        value: {
          roles: ['admin', 'manager', 'user']
        }
      },
      user: {
        summary: 'Make user regular user',
        description: 'Assign only user role',
        value: {
          roles: ['user']
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'User roles updated successfully',
    type: UserResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid roles data'
  })
  @ApiResponse({
    status: 404,
    description: 'User not found'
  })
  async updateUserRoles(
    @Param('userId') userId: string,
    @Body() updateRolesDto: UpdateUserRolesDto
  ): Promise<UserResponseDto> {
    return this.userService.updateUserRoles(userId, updateRolesDto.roles);
  }

  @Post(':userId/roles')
  @ApiOperation({
    summary: 'Add role to user',
    description: 'Add a single role to a user without replacing existing roles'
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    example: 'f38c9d3a-5ed2-4eb5-9481-ba1ee73f838d'
  })
  @ApiBody({
    type: AddRoleDto,
    description: 'Role to add to the user',
    examples: {
      admin: {
        summary: 'Add admin role',
        description: 'Add admin role to user',
        value: {
          role: 'admin'
        }
      },
      manager: {
        summary: 'Add manager role',
        description: 'Add manager role to user',
        value: {
          role: 'manager'
        }
      },
      moderator: {
        summary: 'Add moderator role',
        description: 'Add moderator role to user',
        value: {
          role: 'moderator'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Role added successfully',
    type: UserResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid role data'
  })
  @ApiResponse({
    status: 404,
    description: 'User not found'
  })
  async addRoleToUser(
    @Param('userId') userId: string,
    @Body() addRoleDto: AddRoleDto
  ): Promise<UserResponseDto> {
    return this.userService.addRoleToUser(userId, addRoleDto.role);
  }

  @Delete(':userId/roles/:role')
  @ApiOperation({
    summary: 'Remove role from user',
    description: 'Remove a specific role from a user'
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    example: 'f38c9d3a-5ed2-4eb5-9481-ba1ee73f838d'
  })
  @ApiParam({
    name: 'role',
    description: 'Role to remove',
    example: 'admin'
  })
  @ApiResponse({
    status: 200,
    description: 'Role removed successfully',
    type: UserResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid role data'
  })
  @ApiResponse({
    status: 404,
    description: 'User not found'
  })
  async removeRoleFromUser(
    @Param('userId') userId: string,
    @Param('role') role: string
  ): Promise<UserResponseDto> {
    return this.userService.removeRoleFromUser(userId, role);
  }

  @Get(':userId/roles/:role')
  @ApiOperation({
    summary: 'Check if user has role',
    description: 'Check if a specific user has a specific role'
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    example: 'f38c9d3a-5ed2-4eb5-9481-ba1ee73f838d'
  })
  @ApiParam({
    name: 'role',
    description: 'Role to check',
    example: 'admin'
  })
  @ApiResponse({
    status: 200,
    description: 'Role check result',
    schema: {
      type: 'object',
      properties: {
        hasRole: {
          type: 'boolean',
          example: true
        }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'User not found'
  })
  async checkUserRole(
    @Param('userId') userId: string,
    @Param('role') role: string
  ): Promise<{ hasRole: boolean }> {
    const hasRole = await this.userService.userHasRole(userId, role);
    return { hasRole };
  }
} 