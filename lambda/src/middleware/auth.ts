import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { CognitoJwtVerifier } from 'aws-jwt-verify';

const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID!;
const WEB_CLIENT_ID = process.env.COGNITO_WEB_CLIENT_ID!;
const BACKEND_CLIENT_ID = process.env.COGNITO_BACKEND_CLIENT_ID!;

// Create verifier for both client IDs
const verifier = CognitoJwtVerifier.create({
  userPoolId: USER_POOL_ID,
  tokenUse: 'id',
  clientId: [WEB_CLIENT_ID, BACKEND_CLIENT_ID],
});

/**
 * Authenticate user from JWT token
 * Returns the user's Cognito sub (user ID)
 */
export async function authenticate(event: APIGatewayProxyEventV2): Promise<string | null> {
  try {
    // Extract token from Authorization header
    // HTTP API v2 format: event.headers is lowercase
    const authHeader = event.headers?.authorization || event.headers?.Authorization;
    
    console.log('Auth header:', authHeader ? 'Present' : 'Missing');
    console.log('All headers:', JSON.stringify(event.headers));
    
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

    console.log('Token extracted, length:', token.length);

    // Verify JWT token
    const payload = await verifier.verify(token);
    console.log('Token verified for user:', payload.sub);

    return payload.sub;
  } catch (error) {
    console.error('Authentication error:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    return null;
  }
}