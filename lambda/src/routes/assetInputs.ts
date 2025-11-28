import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PrismaClient } from '@prisma/client';
import { successResponse, errorResponse } from '../utils/response';

export async function handleAssetInputs(
  event: APIGatewayProxyEvent,
  prisma: PrismaClient,
  userId: string
): Promise<APIGatewayProxyResult> {
  const method = event.httpMethod;
  const queryParams = event.queryStringParameters || {};

  try {
    // GET /asset-inputs?year=2024&month=11
    if (method === 'GET') {
      const year = parseInt(queryParams.year || '');
      const month = parseInt(queryParams.month || '');

      if (!year || !month) {
        return errorResponse('year and month are required', 400);
      }

      const assetInputs = await prisma.assetInput.findMany({
        where: { userId, year, month },
        include: {
          asset: {
            include: { category: true },
          },
        },
      });

      return successResponse(assetInputs);
    }

    // POST /asset-inputs - Create or update
    if (method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { asset_id, year, month, total, notes } = body;

      // Verify asset ownership
      const asset = await prisma.asset.findFirst({
        where: { id: asset_id, userId },
      });

      if (!asset) {
        return errorResponse('Asset not found', 404);
      }

      const assetInput = await prisma.assetInput.upsert({
        where: {
          userId_assetId_year_month: {
            userId,
            assetId: asset_id,
            year: parseInt(year),
            month: parseInt(month),
          },
        },
        update: {
          total: String(total),
          notes: notes || null,
        },
        create: {
          userId,
          assetId: asset_id,
          year: parseInt(year),
          month: parseInt(month),
          total: String(total),
          notes: notes || null,
        },
        include: {
          asset: { include: { category: true } },
        },
      });

      return successResponse(assetInput);
    }

    return errorResponse('Route not found', 404);
  } catch (error) {
    console.error('Asset inputs route error:', error);
    return errorResponse(error instanceof Error ? error.message : 'Internal error', 500);
  }
}
