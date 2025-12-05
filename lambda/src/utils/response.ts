import { APIGatewayProxyStructuredResultV2 } from 'aws-lambda';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta: {
    timestamp: string;
    requestId?: string;
  };
}

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
} as const;

/**
 * Create success response
 */
export function successResponse<T>(
  data: T,
  statusCode: number = 200,
  requestId?: string
): APIGatewayProxyStructuredResultV2 {
  const response: ApiResponse<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      requestId,
    },
  };

  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(response),
  };
}

/**
 * Create error response
 */
export function errorResponse(
  code: string,
  message: string,
  statusCode: number = 500,
  details?: unknown,
  requestId?: string
): APIGatewayProxyStructuredResultV2 {
  const response: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      details,
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId,
    },
  };

  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(response),
  };
}

/**
 * Handle errors and convert to appropriate response
 */
export function handleError(error: unknown, requestId?: string): APIGatewayProxyStructuredResultV2 {
  console.error('Error:', error);

  // Type guard for error with code property
  const hasCode = (err: unknown): err is { code: string; meta?: unknown } => {
    return typeof err === 'object' && err !== null && 'code' in err;
  };

  // Prisma errors (P-prefixed codes)
  if (hasCode(error) && error.code.startsWith('P')) {
    switch (error.code) {
      case 'P2002':
        return errorResponse('UNIQUE_CONSTRAINT', 'Record already exists', 409, error.meta, requestId);
      case 'P2025':
        return errorResponse('NOT_FOUND', 'Record not found', 404, error.meta, requestId);
      case 'P2003':
        return errorResponse('FOREIGN_KEY_CONSTRAINT', 'Related record not found', 400, error.meta, requestId);
      default:
        return errorResponse('DATABASE_ERROR', 'Database operation failed', 500, error.code, requestId);
    }
  }

  // Type guard for error with name property
  const hasName = (err: unknown): err is { name: string; message: string; details?: unknown } => {
    return typeof err === 'object' && err !== null && 'name' in err && 'message' in err;
  };

  // Validation errors
  if (hasName(error) && error.name === 'ValidationError') {
    return errorResponse('VALIDATION_ERROR', error.message, 400, error.details, requestId);
  }

  // Generic error with message
  const errorMessage = hasName(error) ? error.message : 'An unexpected error occurred';
  
  return errorResponse('INTERNAL_ERROR', errorMessage, 500, undefined, requestId);
}
