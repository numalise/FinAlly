import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { CognitoJwtVerifier } from 'aws-jwt-verify';

const userPoolId = process.env.COGNITO_USER_POOL_ID!;
const webClientId = process.env.COGNITO_WEB_CLIENT_ID!;
const backendClientId = process.env.COGNITO_BACKEND_CLIENT_ID!;

if (!userPoolId || !webClientId || !backendClientId) {
  throw new Error('Missing required Cognito environment variables');
}

// Create verifier that accepts BOTH client IDs
const verifier = CognitoJwtVerifier.create({
  userPoolId,
  tokenUse: 'access',
  clientId: [webClientId, backendClientId], // Accept both clients
});

export interface AuthContext {
  userId: string;
  email: string;
  username: string;
  clientId: string;
}

/**
 * Verify Cognito JWT token from Authorization header
 */
export async function verifyToken(event: APIGatewayProxyEventV2): Promise<AuthContext | null> {
  try {
    const authHeader = event.headers.authorization || event.headers.Authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn('Missing or invalid Authorization header');
      return null;
    }

    const token = authHeader.substring(7);
    
    // Verify token with Cognito (accepts both web and backend client IDs)
    const payload = await verifier.verify(token);
    
    return {
      userId: payload.sub,
      email: (payload.email as string) || '',
      username: (payload.username as string) || (payload['cognito:username'] as string) || '',
      clientId: (payload.client_id as string) || '',
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Create unauthorized response
 */
export function unauthorizedResponse(): APIGatewayProxyStructuredResultV2 {
  return {
    statusCode: 401,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': 'true',
    },
    body: JSON.stringify({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or missing authentication token',
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    }),
  };
}
