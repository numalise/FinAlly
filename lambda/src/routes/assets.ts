import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PrismaClient } from '@prisma/client';
import { successResponse, errorResponse } from '../utils/response';
import { getPath, getMethod, getPathParts, getBody } from '../utils/eventHelpers';

export async function handleAssets(
  event: APIGatewayProxyEvent,
  prisma: PrismaClient,
  userId: string
): Promise<APIGatewayProxyResult> {
  const path = getPath(event);
  const method = getMethod(event);
  const pathParts = getPathParts(event);
  const queryParams = event.queryStringParameters || {};

  try {
    // GET /assets - List all user assets
    if (method === 'GET' && pathParts.length === 1) {
      console.log('Fetching assets for user:', userId);
      const assets = await prisma.asset.findMany({
        where: { userId },
        include: { category: true },
        orderBy: [{ categoryId: 'asc' }, { assetName: 'asc' }],
      });
      console.log('Found assets:', assets.length);

      // Transform to match frontend expectations (snake_case)
      const transformedAssets = assets.map(asset => ({
        id: asset.id,
        asset_name: asset.assetName,
        ticker: asset.ticker,
        category_id: asset.categoryId,
        market_cap: asset.marketCap,
        category: {
          code: asset.category.code,
          category_name: asset.category.name,
        },
      }));

      return successResponse(transformedAssets);
    }

    // POST /assets - Create new asset
    if (method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      console.log('Creating asset:', body);
      const asset = await prisma.asset.create({
        data: {
          userId,
          assetName: body.name,
          ticker: body.ticker || null,
          categoryId: body.category_id,
          marketCap: body.market_cap ? String(body.market_cap) : null,
        },
        include: { category: true },
      });

      // Transform to match frontend expectations (snake_case)
      const transformedAsset = {
        id: asset.id,
        asset_name: asset.assetName,
        ticker: asset.ticker,
        category_id: asset.categoryId,
        market_cap: asset.marketCap,
        category: {
          code: asset.category.code,
          category_name: asset.category.name,
        },
      };

      return successResponse(transformedAsset, 201);
    }

    // PATCH /assets/:id - Update asset
    if (method === 'PATCH' && pathParts.length === 2) {
      const assetId = pathParts[1];
      const body = JSON.parse(event.body || '{}');

      // Verify ownership
      const existing = await prisma.asset.findFirst({
        where: { id: assetId, userId },
      });

      if (!existing) {
        return errorResponse('NOT_FOUND', 'Asset not found', 404);
      }

      const updateData: any = {};
      if (body.name !== undefined) updateData.assetName = body.name;
      if (body.ticker !== undefined) updateData.ticker = body.ticker || null;
      if (body.market_cap !== undefined) updateData.marketCap = body.market_cap ? String(body.market_cap) : null;

      const asset = await prisma.asset.update({
        where: { id: assetId },
        data: updateData,
        include: { category: true },
      });

      // Transform to match frontend expectations (snake_case)
      const transformedAsset = {
        id: asset.id,
        asset_name: asset.assetName,
        ticker: asset.ticker,
        category_id: asset.categoryId,
        market_cap: asset.marketCap,
        category: {
          code: asset.category.code,
          category_name: asset.category.name,
        },
      };

      return successResponse(transformedAsset);
    }

    // DELETE /assets/all - Delete all user assets and related data
    if (method === 'DELETE' && pathParts.length === 2 && pathParts[1] === 'all') {
      console.log('Deleting all assets for user:', userId);
      const result = await prisma.asset.deleteMany({
        where: { userId },
      });
      console.log(`Deleted ${result.count} assets and related data`);
      return successResponse({ deleted: result.count }, 200);
    }

    // DELETE /assets/:id - Delete specific asset
    if (method === 'DELETE' && pathParts.length === 2) {
      const assetId = pathParts[1];

      const existing = await prisma.asset.findFirst({
        where: { id: assetId, userId },
      });

      if (!existing) {
        return errorResponse('NOT_FOUND', 'Asset not found', 404);
      }

      await prisma.asset.delete({ where: { id: assetId } });
      return successResponse(null, 204);
    }

    console.log('No route matched in handleAssets');
    return errorResponse('ROUTE_NOT_FOUND', 'Route not found', 404);
  } catch (error: any) {
    console.error('Assets route error:', error);

    // Handle Prisma unique constraint violation (duplicate asset name)
    if (error.code === 'P2002') {
      const fields = error.meta?.target || [];
      if (fields.includes('asset_name')) {
        return errorResponse('DUPLICATE_ASSET', 'An asset with this name already exists', 409);
      }
    }

    return errorResponse('INTERNAL_ERROR', error instanceof Error ? error.message : 'Internal error', 500);
  }
}