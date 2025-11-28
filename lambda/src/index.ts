import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { prisma } from './lib/prisma';
import { authenticate } from './middleware/auth';
import { successResponse, errorResponse } from './utils/response';

// Import route handlers
import { handleAssets } from './routes/assets';
import { handleAssetInputs } from './routes/assetInputs';
import { handleIncomings } from './routes/incomings';
import { handleExpenses } from './routes/expenses';
import { handleBudgets } from './routes/budgets';
import { handleAllocation } from './routes/allocation';
import { handleNetworth } from './routes/networth';
import { handleUsers } from './handlers/users';
import { handleHealth } from './handlers/health';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
};

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Event:', JSON.stringify(event, null, 2));

  const path = event.path || event.rawPath || '';
  const method = event.httpMethod || event.requestContext?.http?.method || 'GET';

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }

  try {
    // Health check - NO AUTH REQUIRED
    if (path === '/health' && method === 'GET') {
      console.log('Health check requested');
      return await handleHealth(event);
    }

    // All other routes require authentication
    console.log('Authenticating user...');
    const userId = await authenticate(event);
    
    if (!userId) {
      console.log('Authentication failed');
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Unauthorized' }),
      };
    }

    console.log('User authenticated:', userId);

    // Route to appropriate handler
    if (path.startsWith('/assets')) {
      return await handleAssets(event, prisma, userId);
    }
    
    if (path.startsWith('/asset-inputs')) {
      return await handleAssetInputs(event, prisma, userId);
    }
    
    if (path.startsWith('/incomings')) {
      return await handleIncomings(event, prisma, userId);
    }
    
    if (path.startsWith('/expenses')) {
      return await handleExpenses(event, prisma, userId);
    }
    
    if (path.startsWith('/budgets')) {
      return await handleBudgets(event, prisma, userId);
    }
    
    if (path.startsWith('/allocation') || path.startsWith('/category-allocation-targets')) {
      return await handleAllocation(event, prisma, userId);
    }
    
    if (path.startsWith('/networth')) {
      return await handleNetworth(event, prisma, userId);
    }
    
    if (path.startsWith('/users') || path.startsWith('/export')) {
      return await handleUsers(event, prisma, userId);
    }

    console.log('Route not found:', path);
    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Route not found' }),
    };
  } catch (error) {
    console.error('Lambda error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal error' 
      }),
    };
  }
};
