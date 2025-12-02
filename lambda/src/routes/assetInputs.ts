import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PrismaClient } from '@prisma/client';
import { successResponse, errorResponse } from '../utils/response';
import { getPath, getMethod, getPathParts, getBody } from '../utils/eventHelpers';

export async function handleAssetInputs(
  event: APIGatewayProxyEvent,
  prisma: PrismaClient,
  userId: string
): Promise<APIGatewayProxyResult> {
  const path = getPath(event);
  const method = getMethod(event);
  const pathParts = getPathParts(event);
  const queryParams = event.queryStringParameters || {};

  try {
    // GET /asset-inputs?year=2024&month=11
    if (method === 'GET') {
      const year = parseInt(queryParams.year || '');
      const month = parseInt(queryParams.month || '');

      if (!year || !month) {
        return errorResponse('VALIDATION_ERROR', 'year and month are required', 400);
      }

      const assetInputs = await prisma.assetInput.findMany({
        where: { userId, year, month },
        include: {
          asset: {
            include: { category: true },
          },
        },
      });

      // Transform to match frontend expectations (snake_case)
      const transformedInputs = assetInputs.map(input => ({
        id: input.id,
        asset_id: input.assetId,
        year: input.year,
        month: input.month,
        total: parseFloat(String(input.total)),
        notes: input.notes,
        created_at: input.createdAt,
        updated_at: input.updatedAt,
      }));

      return successResponse(transformedInputs);
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
        return errorResponse('NOT_FOUND', 'Asset not found', 404);
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

      // Transform to match frontend expectations (snake_case)
      const transformedInput = {
        id: assetInput.id,
        asset_id: assetInput.assetId,
        year: assetInput.year,
        month: assetInput.month,
        total: parseFloat(String(assetInput.total)),
        notes: assetInput.notes,
        created_at: assetInput.createdAt,
        updated_at: assetInput.updatedAt,
      };

      return successResponse(transformedInput);
    }

    return errorResponse('ROUTE_NOT_FOUND', 'Route not found', 404);
  } catch (error) {
    console.error('Asset inputs route error:', error);
    return errorResponse('INTERNAL_ERROR', error instanceof Error ? error.message : 'Internal error', 500);
  }
}
