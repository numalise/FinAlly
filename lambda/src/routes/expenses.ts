import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PrismaClient } from '@prisma/client';
import { successResponse, errorResponse } from '../utils/response';
import { getPath, getMethod, getPathParts, getBody } from '../utils/eventHelpers';

export async function handleExpenses(
  event: APIGatewayProxyEvent,
  prisma: PrismaClient,
  userId: string
): Promise<APIGatewayProxyResult> {
  const path = getPath(event);
  const method = getMethod(event);
  const pathParts = getPathParts(event);
  const queryParams = event.queryStringParameters || {};

  try {
    // GET /expenses?year=2024&month=11
    if (method === 'GET' && pathParts.length === 1) {
      const year = parseInt(queryParams.year || '');
      const month = parseInt(queryParams.month || '');

      if (!year || !month) {
        return errorResponse('VALIDATION_ERROR', 'year and month are required', 400);
      }

      const expenses = await prisma.expenseItem.findMany({
        where: { userId, year, month },
        include: { category: true, subcategory: true },
        orderBy: { createdAt: 'asc' },
      });

      return successResponse(expenses);
    }

    // POST /expenses - Create expense entry
    if (method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { category_id, subcategory_id, year, month, amount, description } = body;

      const expense = await prisma.expenseItem.create({
        data: {
          userId,
          categoryId: category_id,
          subcategoryId: subcategory_id || null,
          year: parseInt(year),
          month: parseInt(month),
          amount: String(amount),
          description: description || null,
        },
        include: { category: true, subcategory: true },
      });

      return successResponse(expense, 201);
    }

    // PATCH /expenses/:id - Update expense entry
    if (method === 'PATCH' && pathParts.length === 2) {
      const expenseId = pathParts[1];
      const body = JSON.parse(event.body || '{}');
      const { category_id, subcategory_id, amount, description } = body;

      const existing = await prisma.expenseItem.findFirst({
        where: { id: expenseId, userId },
      });

      if (!existing) {
        return errorResponse('NOT_FOUND', 'Expense entry not found', 404);
      }

      const updated = await prisma.expenseItem.update({
        where: { id: expenseId },
        data: {
          categoryId: category_id || existing.categoryId,
          subcategoryId: subcategory_id !== undefined ? subcategory_id : existing.subcategoryId,
          amount: amount !== undefined ? String(amount) : existing.amount,
          description: description !== undefined ? description : existing.description,
        },
        include: { category: true, subcategory: true },
      });

      return successResponse(updated);
    }

    // DELETE /expenses/:id
    if (method === 'DELETE' && pathParts.length === 2) {
      const expenseId = pathParts[1];

      const existing = await prisma.expenseItem.findFirst({
        where: { id: expenseId, userId },
      });

      if (!existing) {
        return errorResponse('NOT_FOUND', 'Expense entry not found', 404);
      }

      await prisma.expenseItem.delete({ where: { id: expenseId } });
      return successResponse(null, 204);
    }

    return errorResponse('ROUTE_NOT_FOUND', 'Route not found', 404);
  } catch (error) {
    console.error('Expenses route error:', error);
    return errorResponse('INTERNAL_ERROR', error instanceof Error ? error.message : 'Internal error', 500);
  }
}
