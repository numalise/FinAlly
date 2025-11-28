import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PrismaClient } from '@prisma/client';
import { successResponse, errorResponse } from '../utils/response';

export async function handleExpenses(
  event: APIGatewayProxyEvent,
  prisma: PrismaClient,
  userId: string
): Promise<APIGatewayProxyResult> {
  const method = event.httpMethod;
  const pathParts = event.path.split('/').filter(Boolean);
  const queryParams = event.queryStringParameters || {};

  try {
    // GET /expenses?year=2024&month=11
    if (method === 'GET' && pathParts.length === 1) {
      const year = parseInt(queryParams.year || '');
      const month = parseInt(queryParams.month || '');

      if (!year || !month) {
        return errorResponse('year and month are required', 400);
      }

      const expenses = await prisma.expenseItem.findMany({
        where: { userId, year, month },
        include: { category: true },
        orderBy: { createdAt: 'asc' },
      });

      return successResponse(expenses);
    }

    // POST /expenses - Create expense entry
    if (method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { category_id, year, month, amount, description } = body;

      const expense = await prisma.expenseItem.create({
        data: {
          userId,
          categoryId: category_id,
          year: parseInt(year),
          month: parseInt(month),
          amount: String(amount),
          description: description || null,
        },
        include: { category: true },
      });

      return successResponse(expense, 201);
    }

    // DELETE /expenses/:id
    if (method === 'DELETE' && pathParts.length === 2) {
      const expenseId = pathParts[1];

      const existing = await prisma.expenseItem.findFirst({
        where: { id: expenseId, userId },
      });

      if (!existing) {
        return errorResponse('Expense entry not found', 404);
      }

      await prisma.expenseItem.delete({ where: { id: expenseId } });
      return successResponse(null, 204);
    }

    return errorResponse('Route not found', 404);
  } catch (error) {
    console.error('Expenses route error:', error);
    return errorResponse(error instanceof Error ? error.message : 'Internal error', 500);
  }
}
