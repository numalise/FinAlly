import { APIGatewayProxyHandlerV2, Context, Callback } from 'aws-lambda';

// Import handlers
import * as health from './handlers/health.js';
import * as users from './handlers/users.js';

/**
 * Main Lambda handler - routes requests to appropriate handlers
 */
export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
  const { routeKey, requestContext } = event;
  const { http } = requestContext;
  
  console.log(`[${http.method}] ${http.path} - RequestId: ${requestContext.requestId}`);

  // Create empty callback for handler signature compatibility
  const callback: Callback = () => {};

  try {
    // Route to appropriate handler based on routeKey
    switch (routeKey) {
      // Health check
      case 'GET /health':
        return await health.handler(event, context, callback);

      // User endpoints
      case 'GET /users/me':
        return await users.getMe(event, context, callback);

      case 'PATCH /users/me':
        return await users.updateMe(event, context, callback);

      // OPTIONS requests (CORS preflight)
      case 'OPTIONS /{proxy+}':
        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Max-Age': '86400',
          },
          body: '',
        };

      // 404 - Route not found
      default:
        return {
          statusCode: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: `Route not found: ${routeKey}`,
            },
            meta: {
              timestamp: new Date().toISOString(),
              requestId: requestContext.requestId,
            },
          }),
        };
    }
  } catch (error) {
    console.error('Unhandled error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'An unexpected error occurred',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: requestContext.requestId,
        },
      }),
    };
  }
};
