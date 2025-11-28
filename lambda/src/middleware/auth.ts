import { APIGatewayProxyEvent } from 'aws-lambda';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function authenticate(event: APIGatewayProxyEvent): Promise<string | null> {
  try {
    // Mock authentication for development
    if (process.env.MOCK_AUTH === 'true') {
      const testUser = await prisma.user.upsert({
        where: { email: 'test@example.com' },
        update: {},
        create: {
          email: 'test@example.com',
          displayName: 'Test User',
          cognitoSub: 'test-user-123',
        },
      });
      return testUser.id;
    }

    // Extract JWT from Authorization header
    const authHeader = event.headers?.Authorization || event.headers?.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No valid Authorization header');
      return null;
    }

    const token = authHeader.substring(7);
    
    // For now, decode without verification (add proper verification later)
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    
    if (!payload.sub) {
      console.log('Invalid token payload');
      return null;
    }

    const cognitoSub = payload.sub;

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { cognitoSub },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          cognitoSub,
          email: payload.email || `user-${cognitoSub}@example.com`,
          displayName: payload.name || null,
        },
      });
      console.log('Created new user:', user.id);
    }

    return user.id;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}
