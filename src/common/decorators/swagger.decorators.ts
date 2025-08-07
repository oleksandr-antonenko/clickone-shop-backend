import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';


export function ApiOperationFrontend(summary: string, description?: string) {
  return applyDecorators(
    ApiOperation({
      summary,
      description: description || summary
    })
  );
}

export function ApiResponseFrontend(status: number, description: string, type?: any) {
  return applyDecorators(
    ApiResponse({
      status,
      description,
      type
    })
  );
}

export function ApiBodyFrontend(type: any, description?: string) {
  return applyDecorators(
    ApiBody({
      type,
      description: description || 'Request body data'
    })
  );
}


export function ApiOperationAI(summary: string, description: string) {
  return applyDecorators(
    ApiOperation({
      summary,
      description
    })
  );
}

export function ApiResponseAI(status: number, description: string, schema?: any) {
  return applyDecorators(
    ApiResponse({
      status,
      description,
      schema
    })
  );
}

export function ApiBodyAI(type: any, description: string, examples?: any) {
  return applyDecorators(
    ApiBody({
      type,
      description,
      examples
    })
  );
} 