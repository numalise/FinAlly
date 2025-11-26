import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { getPrismaClient } from '../lib/prisma.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Health check endpoint
 * GET /health
 */
export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const requestId = event.requestContext.requestId;

  try {
    const prisma = getPrismaClient();

    // Check database connectivity
    await prisma.$queryRaw`SELECT 1 as health_check`;

    // Get database stats
    const [userCount, assetCount] = await Promise.all([
      prisma.user.count(),
      prisma.asset.count(),
    ]);

    return successResponse(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        database: {
          connected: true,
          stats: {
            users: userCount,
            assets: assetCount,
          },
        },
        environment: process.env.ENVIRONMENT || 'unknown',
        region: process.env.AWS_REGION || 'unknown',
      },
      200,
      requestId
    );
  } catch (error) {
    console.error('Health check failed:', error);
    return errorResponse(
      'HEALTH_CHECK_FAILED',
      'Service is unhealthy',
      503,
      error instanceof Error ? error.message : 'Unknown error',
      requestId
    );
  }
};
