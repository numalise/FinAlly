import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PrismaClient } from '@prisma/client';
import { successResponse, errorResponse } from '../utils/response';

export async function handleUsers(
  event: APIGatewayProxyEvent,
  prisma: PrismaClient,
  userId: string
): Promise<APIGatewayProxyResult> {
  const method = event.httpMethod;
  const path = event.path;

  try {
    // GET /users/me
    if (method === 'GET' && path === '/users/me') {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return errorResponse('User not found', 404);
      }

      return successResponse({
        id: user.id,
        email: user.email,
        displayName: user.displayName,
      });
    }

    // PATCH /users/me
    if (method === 'PATCH' && path === '/users/me') {
      const body = JSON.parse(event.body || '{}');
      
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          displayName: body.displayName || body.full_name,
        },
      });

      return successResponse({
        id: user.id,
        email: user.email,
        displayName: user.displayName,
      });
    }

    // GET /export/data
    if (method === 'GET' && path === '/export/data') {
      const [assets, assetInputs, incomings, expenses, budgets, targets] = await Promise.all([
        prisma.asset.findMany({ where: { userId } }),
        prisma.assetInput.findMany({ where: { userId } }),
        prisma.incomingItem.findMany({ where: { userId } }),
        prisma.expenseItem.findMany({ where: { userId } }),
        prisma.budget.findMany({ where: { userId } }),
        prisma.categoryAllocationTarget.findMany({ where: { userId } }),
      ]);

      const exportData = {
        exported_at: new Date().toISOString(),
        assets,
        asset_inputs: assetInputs,
        incomings,
        expenses,
        budgets,
        category_allocation_targets: targets,
      };

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="finally-export-${Date.now()}.json"`,
        },
        body: JSON.stringify(exportData, null, 2),
      };
    }

    return errorResponse('Route not found', 404);
  } catch (error) {
    console.error('Users route error:', error);
    return errorResponse(error instanceof Error ? error.message : 'Internal error', 500);
  }
}
