import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { CognitoJwtVerifier } from 'aws-jwt-verify';

const userPoolId = process.env.COGNITO_USER_POOL_ID!;
const clientId = process.env.COGNITO_CLIENT_ID!;

if (!userPoolId || !clientId) {
  throw new Error('Missing required environment variables: COGNITO_USER_POOL_ID, COGNITO_CLIENT_ID');
}

// Create verifier instance (cached at module level)
const verifier = CognitoJwtVerifier.create({
  userPoolId,
  tokenUse: 'access',
  clientId,
});

export interface AuthContext {
  userId: string;
  email: string;
  username: string;
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
    
    // Verify token with Cognito
    const payload = await verifier.verify(token);
    
    return {
      userId: payload.sub,
      email: (payload.email as string) || '',
      username: (payload.username as string) || (payload['cognito:username'] as string) || '',
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
