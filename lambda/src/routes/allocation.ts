import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PrismaClient } from '@prisma/client';
import { successResponse, errorResponse } from '../utils/response';
import { getPath, getMethod, getPathParts, getBody } from '../utils/eventHelpers';

export async function handleAllocation(
  event: APIGatewayProxyEvent,
  prisma: PrismaClient,
  userId: string
): Promise<APIGatewayProxyResult> {
  const path = getPath(event);
  const method = getMethod(event);
  const pathParts = getPathParts(event);
  const queryParams = event.queryStringParameters || {};

  try {
    // GET /allocation?year=2024&month=11
    if (method === 'GET' && pathParts.length === 1) {
      const now = new Date();
      const year = parseInt(queryParams.year || String(now.getFullYear()));
      const month = parseInt(queryParams.month || String(now.getMonth() + 1));

      const currentInputs = await prisma.assetInput.findMany({
        where: { userId, year, month },
        include: { 
          asset: { 
            include: { category: true } 
          } 
        },
      });

      const prevMonth = month === 1 ? 12 : month - 1;
      const prevYear = month === 1 ? year - 1 : year;

      const previousInputs = await prisma.assetInput.findMany({
        where: { userId, year: prevYear, month: prevMonth },
        include: { 
          asset: { 
            include: { category: true } 
          } 
        },
      });

      const targets = await prisma.categoryAllocationTarget.findMany({
        where: { userId },
      });

      const currentTotal = currentInputs.reduce((sum, input) => sum + parseFloat(String(input.total)), 0);
      const previousTotal = previousInputs.reduce((sum, input) => sum + parseFloat(String(input.total)), 0);

      const categories: Record<string, any> = {};

      currentInputs.forEach(input => {
        const catId = input.asset.categoryId;
        if (!categories[catId]) {
          categories[catId] = {
            category: catId,
            categoryName: input.asset.category.name,
            color: '#2196f3',
            hasMarketCapTargets: false,
            currentValue: 0,
            previousValue: 0,
            assets: [],
          };
        }
        categories[catId].currentValue += parseFloat(String(input.total));
        categories[catId].assets.push({
          id: input.asset.id,
          name: input.asset.assetName,
          ticker: input.asset.ticker,
          category: input.asset.categoryId,
          categoryName: input.asset.category.name,
          currentValue: parseFloat(String(input.total)),
          previousValue: 0,
          marketCap: input.asset.marketCap ? parseFloat(String(input.asset.marketCap)) : null,
        });
      });

      previousInputs.forEach(input => {
        const catId = input.asset.categoryId;
        if (categories[catId]) {
          categories[catId].previousValue += parseFloat(String(input.total));
          const asset = categories[catId].assets.find((a: any) => a.id === input.asset.id);
          if (asset) {
            asset.previousValue = parseFloat(String(input.total));
          }
        }
      });

      const result = Object.values(categories).map(cat => {
        const target = targets.find(t => t.categoryId === cat.category);
        // targetPct is stored as decimal (0-1), convert to percentage (0-100)
        const targetPctDecimal = target ? parseFloat(String(target.targetPct)) : 0;
        const targetPct = targetPctDecimal * 100;
        const targetValue = targetPctDecimal * currentTotal;
        const currentPct = currentTotal > 0 ? (cat.currentValue / currentTotal) * 100 : 0;
        const previousPct = previousTotal > 0 ? (cat.previousValue / previousTotal) * 100 : 0;

        // Transform to snake_case for frontend
        return {
          category: cat.category,
          category_name: cat.categoryName,
          current_value: cat.currentValue,
          previous_value: cat.previousValue,
          current_percentage: currentPct,
          previous_percentage: previousPct,
          target_percentage: targetPct,
          target_value: targetValue,
          delta: cat.currentValue - targetValue,
          delta_percentage: currentPct - targetPct,
          assets: cat.assets,
        };
      });

      return successResponse({
        categories: result,
        total_value: currentTotal,
        previous_total_value: previousTotal,
        total_change: currentTotal - previousTotal,
      });
    }

    // GET /category-allocation-targets
    if (method === 'GET' && path.includes('category-allocation-targets') && pathParts.length === 1) {
      const targets = await prisma.categoryAllocationTarget.findMany({
        where: { userId },
        include: { category: true },
      });
      return successResponse(targets);
    }

    // PATCH /category-allocation-targets/:category
    if (method === 'PATCH' && path.includes('category-allocation-targets') && pathParts.length === 2) {
      const categoryId = pathParts[1];
      const body = JSON.parse(event.body || '{}');
      const { target_pct } = body;

      console.log('PATCH category target:', { categoryId, target_pct, userId });

      if (!target_pct || isNaN(parseFloat(target_pct))) {
        return errorResponse('VALIDATION_ERROR', 'target_pct must be a valid number', 400);
      }

      // Convert percentage (0-100) to decimal (0-1) for database storage
      const targetPctDecimal = parseFloat(target_pct) / 100;

      const target = await prisma.categoryAllocationTarget.upsert({
        where: {
          userId_categoryId: {
            userId,
            categoryId,
          },
        },
        update: {
          targetPct: String(targetPctDecimal),
        },
        create: {
          userId,
          categoryId,
          targetPct: String(targetPctDecimal),
        },
        include: { category: true },
      });

      console.log('Target updated successfully:', target);
      return successResponse(target);
    }

    return errorResponse('ROUTE_NOT_FOUND', 'Route not found', 404);
  } catch (error) {
    console.error('Allocation route error:', error);
    return errorResponse('INTERNAL_ERROR', error instanceof Error ? error.message : 'Internal error', 500);
  }
}
