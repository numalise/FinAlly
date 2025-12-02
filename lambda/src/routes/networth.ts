import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PrismaClient } from '@prisma/client';
import { successResponse, errorResponse } from '../utils/response';
import { getPath, getMethod, getPathParts, getBody } from '../utils/eventHelpers';

export async function handleNetworth(
  event: APIGatewayProxyEvent,
  prisma: PrismaClient,
  userId: string
): Promise<APIGatewayProxyResult> {
  const path = getPath(event);
  const method = getMethod(event);
  const pathParts = getPathParts(event);
  const queryParams = event.queryStringParameters || {};

  try {
    // GET /networth/history
    if (method === 'GET' && path.includes('/history')) {
      const now = new Date();
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

      const inputs = await prisma.assetInput.findMany({
        where: {
          userId,
          OR: Array.from({ length: 6 }, (_, i) => {
            const d = new Date(sixMonthsAgo);
            d.setMonth(d.getMonth() + i);
            return { year: d.getFullYear(), month: d.getMonth() + 1 };
          }),
        },
        orderBy: [{ year: 'asc' }, { month: 'asc' }],
      });

      const byMonth: Record<string, { year: number; month: number; total: number }> = {};

      inputs.forEach(input => {
        const key = `${input.year}-${input.month}`;
        if (!byMonth[key]) {
          byMonth[key] = { year: input.year, month: input.month, total: 0 };
        }
        byMonth[key].total += parseFloat(String(input.total));
      });

      const history = Object.values(byMonth).map(item => ({
        month: new Date(item.year, item.month - 1).toLocaleString('en', { month: 'short' }),
        value: item.total,
      }));

      return successResponse(history);
    }

    // GET /networth/projection
    if (method === 'GET' && path.includes('/projection')) {
      const now = new Date();
      
      const inputs = await prisma.assetInput.findMany({
        where: {
          userId,
          OR: Array.from({ length: 4 }, (_, i) => {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            return { year: d.getFullYear(), month: d.getMonth() + 1 };
          }),
        },
      });

      const byMonth: Record<string, number> = {};
      inputs.forEach(input => {
        const key = `${input.year}-${input.month}`;
        byMonth[key] = (byMonth[key] || 0) + parseFloat(String(input.total));
      });

      const values = Object.values(byMonth);
      
      if (values.length < 2) {
        return successResponse([]);
      }

      const growths = [];
      for (let i = 1; i < values.length; i++) {
        growths.push(values[i] - values[i - 1]);
      }
      const avgGrowth = growths.reduce((sum, g) => sum + g, 0) / growths.length;

      const currentValue = values[values.length - 1];
      const projection = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
        return {
          month: d.toLocaleString('en', { month: 'short' }),
          actual: i === 0 ? currentValue : undefined,
          projected: currentValue + (avgGrowth * i),
        };
      });

      return successResponse(projection);
    }

    return errorResponse('ROUTE_NOT_FOUND', 'Route not found', 404);
  } catch (error) {
    console.error('Networth route error:', error);
    return errorResponse('INTERNAL_ERROR', error instanceof Error ? error.message : 'Internal error', 500);
  }
}
