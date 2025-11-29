import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PrismaClient } from '@prisma/client';
import { successResponse, errorResponse } from '../utils/response';
import { getPath, getMethod, getPathParts, getBody } from '../utils/eventHelpers';

export async function handleIncomings(
  event: APIGatewayProxyEvent,
  prisma: PrismaClient,
  userId: string
): Promise<APIGatewayProxyResult> {
  const path = getPath(event);
  const method = getMethod(event);
  const pathParts = getPathParts(event);
  const queryParams = event.queryStringParameters || {};

  try {
    // GET /incomings?year=2024&month=11
    if (method === 'GET' && pathParts.length === 1) {
      const year = parseInt(queryParams.year || '');
      const month = parseInt(queryParams.month || '');

      if (!year || !month) {
        return errorResponse('year and month are required', 400);
      }

      const incomings = await prisma.incomingItem.findMany({
        where: { userId, year, month },
        include: { category: true },
        orderBy: { createdAt: 'asc' },
      });

      return successResponse(incomings);
    }

    // POST /incomings - Create income entry
    if (method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { category_id, year, month, amount, description } = body;

      const incoming = await prisma.incomingItem.create({
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

      return successResponse(incoming, 201);
    }

    // DELETE /incomings/:id
    if (method === 'DELETE' && pathParts.length === 2) {
      const incomingId = pathParts[1];

      const existing = await prisma.incomingItem.findFirst({
        where: { id: incomingId, userId },
      });

      if (!existing) {
        return errorResponse('Income entry not found', 404);
      }

      await prisma.incomingItem.delete({ where: { id: incomingId } });
      return successResponse(null, 204);
    }

    return errorResponse('Route not found', 404);
  } catch (error) {
    console.error('Incomings route error:', error);
    return errorResponse(error instanceof Error ? error.message : 'Internal error', 500);
  }
}
