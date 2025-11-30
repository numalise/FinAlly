import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { PrismaClient } from '@prisma/client';

const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID!;
const WEB_CLIENT_ID = process.env.COGNITO_WEB_CLIENT_ID!;
const BACKEND_CLIENT_ID = process.env.COGNITO_BACKEND_CLIENT_ID!;

// Create Prisma client (reused across invocations)
const prisma = new PrismaClient();

// Create verifier for both client IDs
const verifier = CognitoJwtVerifier.create({
  userPoolId: USER_POOL_ID,
  tokenUse: 'id',
  clientId: [WEB_CLIENT_ID, BACKEND_CLIENT_ID],
});

/**
 * Authenticate user from JWT token
 * Returns the database user ID (not Cognito sub)
 */
export async function authenticate(event: any): Promise<string | null> {
  try {
    // Extract token from Authorization header
    // HTTP API v2 format: event.headers is lowercase
    const authHeader = event.headers?.authorization || event.headers?.Authorization;
    
    console.log('Auth header:', authHeader ? 'Present' : 'Missing');
    
    if (!authHeader) {
      console.log('No Authorization header found');
      return null;
    }

    // Extract token (handle both "Bearer <token>" and just "<token>")
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : authHeader;

    if (!token) {
      console.log('No token found in Authorization header');
      return null;
    }

    console.log('Token extracted, verifying...');

    // Verify JWT token
    const payload = await verifier.verify(token);
    console.log('Token verified for Cognito sub:', payload.sub);
    console.log('Token payload:', {
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      preferred_username: payload.preferred_username
    });

    const cognitoSub = payload.sub;
    const email = payload.email as string || `user-${cognitoSub}@example.com`;
    const displayName = payload.name as string || payload.preferred_username as string || null;

    // Find or create user in database
    let user = await prisma.user.findUnique({
      where: { cognitoSub },
    });

    if (!user) {
      console.log('User not found in database, creating new user...');
      user = await prisma.user.create({
        data: {
          cognitoSub,
          email,
          displayName,
        },
      });
      console.log('✅ Created new user:', {
        id: user.id,
        email: user.email,
        cognitoSub: user.cognitoSub
      });
    } else {
      console.log('✅ Found existing user:', {
        id: user.id,
        email: user.email
      });
    }

    return user.id;
  } catch (error) {
    console.error('❌ Authentication error:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack trace:', error.stack);
    }
    return null;
  }
}