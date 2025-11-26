import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { getPrismaClient } from '../lib/prisma.js';
import { verifyToken, unauthorizedResponse } from '../middleware/auth.js';
import { successResponse, errorResponse, handleError } from '../utils/response.js';

/**
 * Get current user profile
 * GET /users/me
 */
export const getMe: APIGatewayProxyHandlerV2 = async (event) => {
  const requestId = event.requestContext.requestId;

  try {
    // Verify authentication
    const auth = await verifyToken(event);
    if (!auth) {
      return unauthorizedResponse();
    }

    const prisma = getPrismaClient();

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { cognitoSub: auth.userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        cognitoSub: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Auto-create user if not exists (post-confirmation hook alternative)
    if (!user) {
      console.log(`Creating new user for Cognito sub: ${auth.userId}`);
      user = await prisma.user.create({
        data: {
          email: auth.email,
          cognitoSub: auth.userId,
          displayName: auth.username || auth.email.split('@')[0],
        },
        select: {
          id: true,
          email: true,
          displayName: true,
          cognitoSub: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    }

    return successResponse(user, 200, requestId);
  } catch (error) {
    return handleError(error, requestId);
  }
};

/**
 * Update current user profile
 * PATCH /users/me
 */
export const updateMe: APIGatewayProxyHandlerV2 = async (event) => {
  const requestId = event.requestContext.requestId;

  try {
    // Verify authentication
    const auth = await verifyToken(event);
    if (!auth) {
      return unauthorizedResponse();
    }

    // Parse and validate request body
    if (!event.body) {
      return errorResponse('VALIDATION_ERROR', 'Request body is required', 400, undefined, requestId);
    }

    const body = JSON.parse(event.body) as Record<string, unknown>;
    const { displayName } = body;

    if (!displayName || typeof displayName !== 'string' || displayName.trim().length === 0) {
      return errorResponse(
        'VALIDATION_ERROR',
        'displayName must be a non-empty string',
        400,
        undefined,
        requestId
      );
    }

    const prisma = getPrismaClient();

    // Update user
    const user = await prisma.user.update({
      where: { cognitoSub: auth.userId },
      data: { displayName: displayName.trim() },
      select: {
        id: true,
        email: true,
        displayName: true,
        cognitoSub: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return successResponse(user, 200, requestId);
  } catch (error) {
    return handleError(error, requestId);
  }
};
